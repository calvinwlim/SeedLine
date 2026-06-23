import { describe, expect, it } from 'vitest';
import { applyResult } from './apply';
import { generateBracket } from './index';
import { generateDoubleElimination } from './double-elimination';
import { Bracket, BracketMatch, Entrant } from './types';

function seeded(n: number): Entrant[] {
  return Array.from({ length: n }, (_, i) => ({ id: `e${i + 1}`, seed: i + 1, name: `E${i + 1}` }));
}

/** Decide the winner of a ready match. */
type Picker = (match: BracketMatch) => string;

/** Higher seed (lower number) wins every match. */
function bySeed(entrants: Entrant[]): Picker {
  const seed = new Map(entrants.map((e, i) => [e.id, e.seed ?? i + 1]));
  return (m) => (seed.get(m.entrantA!)! <= seed.get(m.entrantB!)! ? m.entrantA! : m.entrantB!);
}

/** Deterministic pseudo-random winner, seeded for reproducibility. */
function byRng(initial: number): Picker {
  let state = initial >>> 0;
  return (m) => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state % 2 === 0 ? m.entrantA! : m.entrantB!;
  };
}

interface SimResult {
  bracket: Bracket;
  champion: string;
  playedReset: boolean;
  matchesPlayed: number;
}

/**
 * Play a whole tournament: repeatedly resolve every match that has two known
 * competitors, honoring the grand-final reset rule (the reset match is only
 * played when the losers-bracket champion wins the first grand final).
 */
function playOut(start: Bracket, pick: Picker): SimResult {
  let bracket = start;
  let matchesPlayed = 0;

  for (;;) {
    const gf1 = bracket.matches.find((m) => m.id === 'GF-R1-M1');
    const resetVoid = !!gf1 && gf1.winnerId !== null && gf1.winnerId === gf1.entrantA;

    const ready = bracket.matches.filter(
      (m) =>
        m.winnerId === null &&
        m.entrantA !== null &&
        m.entrantB !== null &&
        !(resetVoid && m.id === 'GF-R2-M1'),
    );
    if (ready.length === 0) break;

    for (const snapshot of ready) {
      const m = bracket.matches.find((x) => x.id === snapshot.id)!;
      if (m.winnerId !== null || m.entrantA === null || m.entrantB === null) continue;
      bracket = applyResult(bracket, m.id, pick(m));
      matchesPlayed += 1;
    }
  }

  const gf1 = bracket.matches.find((m) => m.id === 'GF-R1-M1')!;
  const gf2 = bracket.matches.find((m) => m.id === 'GF-R2-M1')!;
  const playedReset = gf2.winnerId !== null && gf1.winnerId === gf1.entrantB;
  const champion = playedReset ? gf2.winnerId! : gf1.winnerId!;

  return { bracket, champion, playedReset, matchesPlayed };
}

/** Count how many times each entrant is recorded as a match loser. */
function lossCounts(bracket: Bracket): Map<string, number> {
  const losses = new Map<string, number>();
  for (const m of bracket.matches) {
    if (m.winnerId && m.loserId) losses.set(m.loserId, (losses.get(m.loserId) ?? 0) + 1);
  }
  return losses;
}

const FIELD_SIZES = [2, 3, 4, 5, 6, 7, 8, 9, 12, 16];

describe('generateDoubleElimination', () => {
  it('routes through generateBracket', () => {
    const b = generateBracket('double_elimination', seeded(4));
    expect(b.format).toBe('double_elimination');
    expect(b.matches.length).toBeGreaterThan(0);
  });

  it('has no matches for a trivial field', () => {
    expect(generateDoubleElimination(seeded(1)).matches).toHaveLength(0);
    expect(generateDoubleElimination([]).matches).toHaveLength(0);
  });

  it.each(FIELD_SIZES)('builds exactly 2N-1 real matches for N=%i', (n) => {
    // 2N-2 matches decide the field; the always-present reset is the +1. Byes
    // are folded away, so non-power-of-two fields still hit this count exactly.
    const b = generateDoubleElimination(seeded(n));
    expect(b.matches).toHaveLength(2 * n - 1);
  });

  it.each(FIELD_SIZES)('keeps every reference internally consistent for N=%i', (n) => {
    const b = generateDoubleElimination(seeded(n));
    const ids = new Set(b.matches.map((m) => m.id));
    for (const m of b.matches) {
      // Advance targets must point at matches that still exist after folding.
      if (m.winnerTo) expect(ids.has(m.winnerTo.matchId)).toBe(true);
      if (m.loserTo) expect(ids.has(m.loserTo.matchId)).toBe(true);
      // Losers-bracket matches eliminate their loser — no further drop.
      if (m.bracketType === 'losers') expect(m.loserTo).toBeNull();
      // Any surviving winner_of / loser_of source must reference a real match.
      for (const side of [m.sideA, m.sideB]) {
        if (side.kind === 'winner_of' || side.kind === 'loser_of') {
          expect(ids.has(side.matchId)).toBe(true);
        }
      }
    }
  });

  it.each(FIELD_SIZES)('crowns one champion and eliminates everyone else twice (N=%i)', (n) => {
    const result = playOut(generateDoubleElimination(seeded(n)), bySeed(seeded(n)));
    const losses = lossCounts(result.bracket);

    const survivors = seeded(n)
      .map((e) => e.id)
      .filter((id) => (losses.get(id) ?? 0) < 2);
    expect(survivors).toEqual([result.champion]);

    for (const e of seeded(n)) {
      if (e.id === result.champion) continue;
      expect(losses.get(e.id)).toBe(2);
    }
  });

  it.each(FIELD_SIZES)('plays 2N-2 matches when the winners champion holds (N=%i)', (n) => {
    // Seed-based picking lets the top seed win out, so the grand final stands.
    const result = playOut(generateDoubleElimination(seeded(n)), bySeed(seeded(n)));
    expect(result.playedReset).toBe(false);
    expect(result.matchesPlayed).toBe(2 * n - 2);
    expect(result.champion).toBe('e1');
  });

  it.each(FIELD_SIZES)('plays 2N-1 matches when the bracket is reset (N=%i)', (n) => {
    const seedPick = bySeed(seeded(n));
    // The losers-bracket champion (grand-final side B) wins the first final,
    // forcing the reset, then takes the reset too.
    const pick: Picker = (m) => {
      if (m.id === 'GF-R1-M1') return m.entrantB!;
      if (m.id === 'GF-R2-M1') return m.entrantA!;
      return seedPick(m);
    };
    const result = playOut(generateDoubleElimination(seeded(n)), pick);

    expect(result.playedReset).toBe(true);
    expect(result.matchesPlayed).toBe(2 * n - 1);
    // The reset winner has a single loss; everyone else has two.
    const losses = lossCounts(result.bracket);
    expect(losses.get(result.champion)).toBe(1);
  });

  it('survives many randomized tournaments', () => {
    for (const n of FIELD_SIZES) {
      for (let seed = 1; seed <= 25; seed++) {
        const result = playOut(generateDoubleElimination(seeded(n)), byRng(seed * 7 + n));
        const losses = lossCounts(result.bracket);
        const survivors = seeded(n)
          .map((e) => e.id)
          .filter((id) => (losses.get(id) ?? 0) < 2);
        expect(survivors).toEqual([result.champion]);
        expect(result.matchesPlayed).toBe(result.playedReset ? 2 * n - 1 : 2 * n - 2);
      }
    }
  });

  it('drops winners losers into the losers bracket', () => {
    const b = generateDoubleElimination(seeded(4));
    const wbRealLosers = b.matches.filter((m) => m.bracketType === 'winners' && m.loserTo);
    // Every winners match (round-1 pair + winners final) drops its loser.
    expect(wbRealLosers).toHaveLength(3);
    for (const m of wbRealLosers) {
      const target = b.matches.find((x) => x.id === m.loserTo!.matchId)!;
      expect(['losers', 'final']).toContain(target.bracketType);
    }
  });

  it('does not mutate the input bracket when applying a result', () => {
    const b = generateDoubleElimination(seeded(4));
    const before = JSON.stringify(b);
    const firstReady = b.matches.find((m) => m.entrantA && m.entrantB)!;
    applyResult(b, firstReady.id, firstReady.entrantA!);
    expect(JSON.stringify(b)).toBe(before);
  });

  it('gives a competitor a second life after their first loss', () => {
    // Four entrants; e1 loses the winners final but can still win it all.
    let b = generateDoubleElimination(seeded(4));
    const pick: Picker = (m) => {
      // e1 loses once in the winners final, then wins everything afterwards.
      if (m.id === 'W-R2-M1') return m.entrantA === 'e1' ? m.entrantB! : m.entrantA!;
      if (m.entrantA === 'e1') return 'e1';
      if (m.entrantB === 'e1') return 'e1';
      return bySeed(b.entrants)(m);
    };
    const result = playOut(b, pick);
    expect(result.champion).toBe('e1');
    // e1 was beaten once but recovered through the losers bracket.
    expect(lossCounts(result.bracket).get('e1')).toBe(1);
    b = result.bracket;
  });
});
