import { resolveWinner } from './apply';
import {
  nextPowerOfTwo,
  orderEntrants,
  separateAcademiesInFirstRound,
  standardSeedOrder,
} from './seeding';
import { Bracket, BracketMatch, Entrant, GenerateOptions } from './types';

function buildMatchId(round: number, position: number): string {
  return `W-R${round}-M${position}`;
}

/**
 * Generate a single-elimination bracket.
 *
 * Handles non-power-of-two fields by giving the top seeds first-round byes,
 * which are auto-advanced during generation. Optionally separates teammates
 * in round one (best effort).
 */
export function generateSingleElimination(
  entrants: Entrant[],
  options: GenerateOptions = {},
): Bracket {
  const ordered = orderEntrants(entrants);
  const count = ordered.length;

  // 0 or 1 entrant: no matches to play.
  if (count <= 1) {
    return { format: 'single_elimination', entrants: ordered, matches: [], rounds: 0 };
  }

  const size = nextPowerOfTwo(count);
  const totalRounds = Math.log2(size);
  const seedOrder = standardSeedOrder(size);

  // slots[i] = entrant id placed in slot i, or null for a bye.
  const slots: (string | null)[] = seedOrder.map((seedNum) =>
    seedNum <= count ? ordered[seedNum - 1]!.id : null,
  );

  if (options.separateAcademies) {
    separateAcademiesInFirstRound(slots, ordered);
  }

  const matches: BracketMatch[] = [];

  // Round 1, built directly from slot pairs.
  const firstRoundMatches = size / 2;
  for (let position = 1; position <= firstRoundMatches; position++) {
    const slotA = slots[(position - 1) * 2] ?? null;
    const slotB = slots[(position - 1) * 2 + 1] ?? null;
    matches.push({
      id: buildMatchId(1, position),
      bracketType: totalRounds === 1 ? 'final' : 'winners',
      round: 1,
      position,
      sideA: slotA ? { kind: 'entrant', entrantId: slotA } : { kind: 'bye' },
      sideB: slotB ? { kind: 'entrant', entrantId: slotB } : { kind: 'bye' },
      entrantA: slotA,
      entrantB: slotB,
      winnerId: null,
      loserId: null,
      winnerTo: null,
      loserTo: null,
    });
  }

  // Later rounds, fed by the winners of the previous round.
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatches = size / 2 ** round;
    for (let position = 1; position <= roundMatches; position++) {
      matches.push({
        id: buildMatchId(round, position),
        bracketType: round === totalRounds ? 'final' : 'winners',
        round,
        position,
        sideA: { kind: 'winner_of', matchId: buildMatchId(round - 1, position * 2 - 1) },
        sideB: { kind: 'winner_of', matchId: buildMatchId(round - 1, position * 2) },
        entrantA: null,
        entrantB: null,
        winnerId: null,
        loserId: null,
        winnerTo: null,
        loserTo: null,
      });
    }
  }

  // Wire each match to where its winner advances.
  const byId = new Map(matches.map((m) => [m.id, m]));
  for (const match of matches) {
    if (match.round < totalRounds) {
      const targetPosition = Math.ceil(match.position / 2);
      match.winnerTo = {
        matchId: buildMatchId(match.round + 1, targetPosition),
        side: match.position % 2 === 1 ? 'A' : 'B',
      };
    }
  }

  // Auto-advance first-round byes.
  for (const match of matches) {
    if (match.round !== 1) continue;
    const aBye = match.sideA.kind === 'bye';
    const bBye = match.sideB.kind === 'bye';
    if (aBye === bBye) continue; // both real, or both byes (impossible) -> skip
    const advancing = aBye ? match.entrantB : match.entrantA;
    if (advancing) resolveWinner(byId, match.id, advancing);
  }

  return { format: 'single_elimination', entrants: ordered, matches, rounds: totalRounds };
}
