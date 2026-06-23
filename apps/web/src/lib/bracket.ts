import {
  applyResult,
  computeRoundRobinStandings,
  generateBracket,
  type Bracket,
  type Standing,
} from '@openmat/bracket-engine';
import type { BracketEntrant, BracketFormat } from '@openmat/types';

/** Build an engine bracket from a division's entrant list. */
export function buildBracket(format: BracketFormat, entrants: BracketEntrant[]): Bracket {
  return generateBracket(
    format,
    entrants.map((e) => ({
      id: e.id,
      seed: e.seed,
      academyId: e.academyId ?? undefined,
      name: e.name,
    })),
    { separateAcademies: true },
  );
}

/**
 * Fill in a finished bracket deterministically by advancing the better seed in
 * every match. Used to show results for completed events without storing live
 * scores — the higher seed (lower number) wins.
 */
export function autoCompleteBracket(bracket: Bracket): Bracket {
  const seedOf = new Map(bracket.entrants.map((e) => [e.id, e.seed ?? Number.POSITIVE_INFINITY]));
  const better = (a: string, b: string): string =>
    (seedOf.get(a) ?? Infinity) <= (seedOf.get(b) ?? Infinity) ? a : b;

  let result = bracket;

  if (bracket.format === 'round_robin') {
    for (const match of bracket.matches) {
      if (match.entrantA && match.entrantB && !match.winnerId) {
        result = applyResult(result, match.id, better(match.entrantA, match.entrantB));
      }
    }
    return result;
  }

  // Elimination: resolve round by round so winners feed the next round.
  for (let round = 1; round <= bracket.rounds; round++) {
    const idsInRound = result.matches.filter((m) => m.round === round).map((m) => m.id);
    for (const id of idsInRound) {
      const match = result.matches.find((m) => m.id === id);
      if (!match || match.winnerId) continue;
      if (match.entrantA && match.entrantB) {
        result = applyResult(result, id, better(match.entrantA, match.entrantB));
      }
    }
  }
  return result;
}

export interface PodiumEntry {
  place: number;
  entrantId: string;
}

/** Derive 1st/2nd/3rd from a completed bracket. */
export function derivePodium(bracket: Bracket): PodiumEntry[] {
  if (bracket.format === 'round_robin') {
    const standings = computeRoundRobinStandings(bracket);
    return standings.slice(0, 3).map((s, i) => ({ place: i + 1, entrantId: s.entrantId }));
  }

  const finalMatch = bracket.matches.find((m) => m.bracketType === 'final');
  if (!finalMatch?.winnerId) return [];
  const podium: PodiumEntry[] = [{ place: 1, entrantId: finalMatch.winnerId }];
  if (finalMatch.loserId) podium.push({ place: 2, entrantId: finalMatch.loserId });
  return podium;
}

export type { Bracket, Standing };
export { computeRoundRobinStandings };
