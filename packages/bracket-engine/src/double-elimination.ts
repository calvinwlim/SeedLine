import {
  nextPowerOfTwo,
  orderEntrants,
  separateAcademiesInFirstRound,
  standardSeedOrder,
} from './seeding';
import {
  AdvanceTarget,
  Bracket,
  BracketMatch,
  Entrant,
  GenerateOptions,
  SlotSource,
} from './types';

/**
 * Double elimination.
 *
 * The structure is three linked sub-brackets:
 *
 *   1. Winners bracket (`W-*`): a standard single-elimination tree. Every match
 *      drops its loser into the losers bracket via `loserTo`.
 *   2. Losers bracket (`L-*`): a competitor stays alive here until a second
 *      loss. It alternates "drop" rounds (a fresh batch of winners-bracket
 *      losers enters and meets the losers-bracket survivors) with
 *      "consolidation" rounds (survivors play each other). Drop rounds feed the
 *      incoming losers in reversed order so a competitor does not immediately
 *      re-face the person who just knocked them down.
 *   3. Grand final (`GF-*`): the winners-bracket champion (always side A) meets
 *      the losers-bracket champion. If the losers-bracket champion wins, both
 *      have one loss and a second "bracket reset" match decides it; if the
 *      winners-bracket champion wins, the reset match is not played.
 *
 * Non-power-of-two fields are handled by static bye folding: the full
 * power-of-two graph is built, then matches that can never have two real
 * competitors are collapsed (a lone competitor advances without playing, a
 * dead branch is removed), so the returned bracket contains only real matches.
 */
export function generateDoubleElimination(
  entrants: Entrant[],
  options: GenerateOptions = {},
): Bracket {
  const ordered = orderEntrants(entrants);
  const count = ordered.length;

  if (count <= 1) {
    return { format: 'double_elimination', entrants: ordered, matches: [], rounds: 0 };
  }

  const size = nextPowerOfTwo(count);
  const wbRounds = Math.log2(size);
  const seedOrder = standardSeedOrder(size);

  // Winners-bracket round-one slots; null is a bye.
  const slots: (string | null)[] = seedOrder.map((seedNum) =>
    seedNum <= count ? ordered[seedNum - 1]!.id : null,
  );
  if (options.separateAcademies) {
    separateAcademiesInFirstRound(slots, ordered);
  }

  const builder = new DoubleEliminationBuilder(size, wbRounds);
  builder.buildWinners(slots);
  builder.buildLosers();
  builder.buildGrandFinal();

  const matches = builder.fold();

  return { format: 'double_elimination', entrants: ordered, matches, rounds: wbRounds };
}

const wbId = (round: number, position: number): string => `W-R${round}-M${position}`;
const lbId = (round: number, position: number): string => `L-R${round}-M${position}`;
const GF1 = 'GF-R1-M1';
const GF2 = 'GF-R2-M1';

/** Winners-bracket match count in round `r` for a bracket of `size` slots. */
const wbRoundMatches = (size: number, round: number): number => size / 2 ** round;

/** Losers-bracket match count in round `m`. */
const lbRoundMatches = (size: number, round: number): number =>
  size / 2 ** (Math.ceil(round / 2) + 1);

class DoubleEliminationBuilder {
  private matches: BracketMatch[] = [];
  private byId = new Map<string, BracketMatch>();
  /** Total number of losers-bracket rounds. */
  readonly lbRounds: number;

  constructor(
    private readonly size: number,
    private readonly wbRounds: number,
  ) {
    // Each winners round after the first feeds one losers "drop" round, and the
    // rounds between drops are consolidation rounds: 2 * (wbRounds - 1) total.
    this.lbRounds = this.wbRounds >= 2 ? 2 * (this.wbRounds - 1) : 0;
  }

  private add(match: BracketMatch): void {
    this.matches.push(match);
    this.byId.set(match.id, match);
  }

  private setTarget(matchId: string, field: 'winnerTo' | 'loserTo', target: AdvanceTarget): void {
    this.byId.get(matchId)![field] = target;
  }

  /** Build the winners bracket: a standard single-elimination tree. */
  buildWinners(slots: (string | null)[]): void {
    // Round 1, from slot pairs (entrants placed directly; null is a bye).
    for (let position = 1; position <= this.size / 2; position++) {
      const a = slots[(position - 1) * 2] ?? null;
      const b = slots[(position - 1) * 2 + 1] ?? null;
      this.add(
        blankMatch({
          id: wbId(1, position),
          bracketType: 'winners',
          round: 1,
          position,
          sideA: a ? { kind: 'entrant', entrantId: a } : { kind: 'bye' },
          sideB: b ? { kind: 'entrant', entrantId: b } : { kind: 'bye' },
          entrantA: a,
          entrantB: b,
        }),
      );
    }

    // Later rounds, fed by the winners of the previous round.
    for (let round = 2; round <= this.wbRounds; round++) {
      for (let position = 1; position <= wbRoundMatches(this.size, round); position++) {
        this.add(
          blankMatch({
            id: wbId(round, position),
            bracketType: 'winners',
            round,
            position,
            sideA: { kind: 'winner_of', matchId: wbId(round - 1, position * 2 - 1) },
            sideB: { kind: 'winner_of', matchId: wbId(round - 1, position * 2) },
          }),
        );
        this.setTarget(wbId(round - 1, position * 2 - 1), 'winnerTo', {
          matchId: wbId(round, position),
          side: 'A',
        });
        this.setTarget(wbId(round - 1, position * 2), 'winnerTo', {
          matchId: wbId(round, position),
          side: 'B',
        });
      }
    }
  }

  /** Build the losers bracket and wire each winners loser to drop into it. */
  buildLosers(): void {
    for (let m = 1; m <= this.lbRounds; m++) {
      for (let position = 1; position <= lbRoundMatches(this.size, m); position++) {
        this.add(
          blankMatch({
            id: lbId(m, position),
            bracketType: 'losers',
            round: m,
            position,
            sideA: { kind: 'pending' },
            sideB: { kind: 'pending' },
          }),
        );
      }
    }

    for (let m = 1; m <= this.lbRounds; m++) {
      if (m === 1) {
        this.wireFirstLosersRound();
      } else if (m % 2 === 1) {
        this.wireConsolidationRound(m);
      } else {
        this.wireDropRound(m);
      }
    }
  }

  /** Losers round 1: pair up the round-1 winners-bracket losers. */
  private wireFirstLosersRound(): void {
    for (let position = 1; position <= lbRoundMatches(this.size, 1); position++) {
      const fromA = wbId(1, position * 2 - 1);
      const fromB = wbId(1, position * 2);
      this.byId.get(lbId(1, position))!.sideA = { kind: 'loser_of', matchId: fromA };
      this.byId.get(lbId(1, position))!.sideB = { kind: 'loser_of', matchId: fromB };
      this.setTarget(fromA, 'loserTo', { matchId: lbId(1, position), side: 'A' });
      this.setTarget(fromB, 'loserTo', { matchId: lbId(1, position), side: 'B' });
    }
  }

  /** Odd losers rounds (>=3): survivors of the previous round play each other. */
  private wireConsolidationRound(m: number): void {
    for (let position = 1; position <= lbRoundMatches(this.size, m); position++) {
      const fromA = lbId(m - 1, position * 2 - 1);
      const fromB = lbId(m - 1, position * 2);
      this.byId.get(lbId(m, position))!.sideA = { kind: 'winner_of', matchId: fromA };
      this.byId.get(lbId(m, position))!.sideB = { kind: 'winner_of', matchId: fromB };
      this.setTarget(fromA, 'winnerTo', { matchId: lbId(m, position), side: 'A' });
      this.setTarget(fromB, 'winnerTo', { matchId: lbId(m, position), side: 'B' });
    }
  }

  /**
   * Even losers rounds: a fresh batch of winners-bracket losers drops in. Round
   * m = 2j receives the losers of winners round (j + 1) on side B, fed in
   * reversed position order so a dropped competitor avoids an immediate rematch.
   */
  private wireDropRound(m: number): void {
    const j = m / 2;
    const wbRound = j + 1;
    const positions = lbRoundMatches(this.size, m);
    for (let position = 1; position <= positions; position++) {
      const survivor = lbId(m - 1, position);
      const dropFrom = wbId(wbRound, positions - position + 1);
      this.byId.get(lbId(m, position))!.sideA = { kind: 'winner_of', matchId: survivor };
      this.byId.get(lbId(m, position))!.sideB = { kind: 'loser_of', matchId: dropFrom };
      this.setTarget(survivor, 'winnerTo', { matchId: lbId(m, position), side: 'A' });
      this.setTarget(dropFrom, 'loserTo', { matchId: lbId(m, position), side: 'B' });
    }
  }

  /** Build the grand final and the conditional bracket-reset match. */
  buildGrandFinal(): void {
    const wbFinal = wbId(this.wbRounds, 1);

    // Side B of the grand final is the losers-bracket champion. With no losers
    // rounds (a two-entrant field) the winners-final loser fills that slot.
    let lbChampSource: SlotSource;
    if (this.lbRounds >= 1) {
      const lbFinal = lbId(this.lbRounds, 1);
      lbChampSource = { kind: 'winner_of', matchId: lbFinal };
      this.setTarget(lbFinal, 'winnerTo', { matchId: GF1, side: 'B' });
    } else {
      lbChampSource = { kind: 'loser_of', matchId: wbFinal };
      this.setTarget(wbFinal, 'loserTo', { matchId: GF1, side: 'B' });
    }

    this.add(
      blankMatch({
        id: GF1,
        bracketType: 'final',
        round: 1,
        position: 1,
        sideA: { kind: 'winner_of', matchId: wbFinal },
        sideB: lbChampSource,
      }),
    );
    this.setTarget(wbFinal, 'winnerTo', { matchId: GF1, side: 'A' });

    this.add(
      blankMatch({
        id: GF2,
        bracketType: 'final',
        round: 2,
        position: 1,
        sideA: { kind: 'winner_of', matchId: GF1 },
        sideB: { kind: 'loser_of', matchId: GF1 },
      }),
    );
    this.setTarget(GF1, 'winnerTo', { matchId: GF2, side: 'A' });
    this.setTarget(GF1, 'loserTo', { matchId: GF2, side: 'B' });
  }

  /**
   * Collapse byes. The graph is built as if the field were a full power of two;
   * this pass removes matches that can never have two real competitors and
   * advances lone competitors straight to the next real match they reach.
   */
  fold(): BracketMatch[] {
    // Matches are already in topological order (a match's feeders precede it),
    // so a single forward pass can classify every match.
    const liveCount = new Map<string, number>();
    const sideLive = (source: SlotSource): boolean => {
      switch (source.kind) {
        case 'entrant':
          return true;
        case 'bye':
        case 'pending':
          return false;
        case 'winner_of':
          return (liveCount.get(source.matchId) ?? 0) >= 1; // a winner exists
        case 'loser_of':
          return (liveCount.get(source.matchId) ?? 0) === 2; // a loser exists
      }
    };
    for (const match of this.matches) {
      liveCount.set(match.id, Number(sideLive(match.sideA)) + Number(sideLive(match.sideB)));
    }

    // Walk an advance target through collapsed matches to the first real slot.
    const resolveCache = new Map<string, AdvanceTarget | null>();
    const resolveTarget = (target: AdvanceTarget | null): AdvanceTarget | null => {
      if (!target) return null;
      const key = `${target.matchId}:${target.side}`;
      if (resolveCache.has(key)) return resolveCache.get(key)!;
      resolveCache.set(key, null); // guard against cycles (the graph is a DAG)
      const match = this.byId.get(target.matchId)!;
      const live = liveCount.get(match.id) ?? 0;
      const resolved = live === 2 ? target : live === 1 ? resolveTarget(match.winnerTo) : null;
      resolveCache.set(key, resolved);
      return resolved;
    };

    const kept: BracketMatch[] = [];
    for (const match of this.matches) {
      const live = liveCount.get(match.id) ?? 0;

      if (live === 2) {
        // A real match. Point its outputs past any collapsed matches, and clear
        // sources that referenced a now-removed feeder (they will be filled in
        // by propagation when the redirected feeder resolves).
        match.winnerTo = resolveTarget(match.winnerTo);
        match.loserTo = resolveTarget(match.loserTo);
        match.sideA = this.surviveSource(match.sideA, liveCount);
        match.sideB = this.surviveSource(match.sideB, liveCount);
        kept.push(match);
        continue;
      }

      if (live === 1) {
        // A lone competitor. If we already know who it is (a winners round-one
        // bye), place them in the next real match; otherwise the feeder that
        // drops in here has been redirected past this match already.
        const known =
          match.sideA.kind === 'entrant'
            ? match.entrantA
            : match.sideB.kind === 'entrant'
              ? match.entrantB
              : null;
        const dest = resolveTarget(match.winnerTo);
        if (known && dest) place(this.byId.get(dest.matchId)!, dest.side, known);
      }
      // live === 0: a dead branch, dropped entirely.
    }

    return kept;
  }

  /** Replace a source whose feeder was collapsed with a generic pending slot. */
  private surviveSource(source: SlotSource, liveCount: Map<string, number>): SlotSource {
    if (source.kind === 'winner_of' || source.kind === 'loser_of') {
      if ((liveCount.get(source.matchId) ?? 0) !== 2) return { kind: 'pending' };
    }
    return source;
  }
}

function place(match: BracketMatch, side: 'A' | 'B', entrantId: string): void {
  if (side === 'A') {
    match.entrantA = entrantId;
    match.sideA = { kind: 'entrant', entrantId };
  } else {
    match.entrantB = entrantId;
    match.sideB = { kind: 'entrant', entrantId };
  }
}

function blankMatch(
  partial: Pick<BracketMatch, 'id' | 'bracketType' | 'round' | 'position' | 'sideA' | 'sideB'> &
    Partial<Pick<BracketMatch, 'entrantA' | 'entrantB'>>,
): BracketMatch {
  return {
    entrantA: null,
    entrantB: null,
    winnerId: null,
    loserId: null,
    winnerTo: null,
    loserTo: null,
    ...partial,
  };
}
