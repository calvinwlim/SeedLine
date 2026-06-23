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

  // Elimination (single or double): repeatedly resolve any match that has two
  // known competitors. This is order-independent — applyResult propagates the
  // result downstream — so it handles double elimination's winners/losers
  // cross-feeding without tracking dependencies by hand. The grand-final reset
  // (GF-R2) is skipped once the winners champion has clinched the first final.
  const guard = result.matches.length * 4;
  for (let step = 0; step < guard; step++) {
    const gf1 = result.matches.find((m) => m.id === 'GF-R1-M1');
    const resetVoid = !!gf1 && gf1.winnerId !== null && gf1.winnerId === gf1.entrantA;
    const next = result.matches.find(
      (m) => !m.winnerId && m.entrantA && m.entrantB && !(resetVoid && m.id === 'GF-R2-M1'),
    );
    if (!next) break;
    result = applyResult(result, next.id, better(next.entrantA!, next.entrantB!));
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

  if (bracket.format === 'double_elimination') {
    const gf1 = bracket.matches.find((m) => m.id === 'GF-R1-M1');
    const gf2 = bracket.matches.find((m) => m.id === 'GF-R2-M1');
    if (!gf1?.winnerId) return [];
    // The reset decides it only when the losers champion (side B) won the first
    // final; otherwise the first final stands.
    const resetPlayed = gf1.winnerId === gf1.entrantB && !!gf2?.winnerId;
    const decisive = resetPlayed ? gf2! : gf1;
    const podium: PodiumEntry[] = [];
    if (decisive.winnerId) podium.push({ place: 1, entrantId: decisive.winnerId });
    if (decisive.loserId) podium.push({ place: 2, entrantId: decisive.loserId });
    // Third place is the loser of the losers-bracket final (its last round).
    const lbFinal = bracket.matches
      .filter((m) => m.bracketType === 'losers')
      .sort((a, b) => b.round - a.round || b.position - a.position)[0];
    if (lbFinal?.loserId) podium.push({ place: 3, entrantId: lbFinal.loserId });
    return podium;
  }

  const finalMatch = bracket.matches.find((m) => m.bracketType === 'final');
  if (!finalMatch?.winnerId) return [];
  const podium: PodiumEntry[] = [{ place: 1, entrantId: finalMatch.winnerId }];
  if (finalMatch.loserId) podium.push({ place: 2, entrantId: finalMatch.loserId });
  return podium;
}

export type { Bracket, Standing };
export { computeRoundRobinStandings };
