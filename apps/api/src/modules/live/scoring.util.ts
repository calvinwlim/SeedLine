import type { Bracket, BracketMatch } from '@seedline/bracket-engine';
import type { MatchScore } from '@seedline/types';

/** A fresh, zeroed score for a new match. */
export function zeroScore(): MatchScore {
  return {
    a: { points: 0, advantages: 0, penalties: 0 },
    b: { points: 0, advantages: 0, penalties: 0 },
    method: null,
  };
}

/** A real, playable match has two non-bye sides; byes are not scheduled. */
export function isRealMatch(m: BracketMatch): boolean {
  return m.sideA.kind !== 'bye' && m.sideB.kind !== 'bye';
}

/**
 * Human round label, computed once at generation, mirroring the bracket viewer:
 * single elimination uses Final/Semifinal/…; double elimination splits into
 * Winners/Losers/Grand Final; round robin counts rounds.
 */
export function roundLabelFor(m: BracketMatch, bracket: Bracket): string {
  if (bracket.format === 'round_robin') return `RR Round ${m.round}`;

  const fromEnd = bracket.rounds - m.round;

  if (bracket.format === 'double_elimination') {
    if (m.bracketType === 'final') return m.round === 2 ? 'Bracket Reset' : 'Grand Final';
    if (m.bracketType === 'losers') return `Losers R${m.round}`;
    if (fromEnd === 0) return 'Winners Final';
    if (fromEnd === 1) return 'Winners Semis';
    return `Winners R${m.round}`;
  }

  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Quarterfinal';
  return `Round ${m.round}`;
}
