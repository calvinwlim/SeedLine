import { describe, expect, it } from 'vitest';
import { applyResult } from './apply';
import { generateSingleElimination } from './single-elimination';
import { Entrant } from './types';

function seeded(n: number): Entrant[] {
  return Array.from({ length: n }, (_, i) => ({ id: `e${i + 1}`, seed: i + 1, name: `E${i + 1}` }));
}

describe('generateSingleElimination', () => {
  it('builds a full power-of-two bracket', () => {
    const b = generateSingleElimination(seeded(8));
    expect(b.rounds).toBe(3);
    expect(b.matches).toHaveLength(7);
    expect(b.matches.filter((m) => m.round === 1)).toHaveLength(4);
    expect(b.matches.filter((m) => m.bracketType === 'final')).toHaveLength(1);
  });

  it('handles a single entrant with no matches', () => {
    const b = generateSingleElimination(seeded(1));
    expect(b.matches).toHaveLength(0);
    expect(b.rounds).toBe(0);
  });

  it('gives top seeds byes when the field is not a power of two', () => {
    const b = generateSingleElimination(seeded(5));
    const round1 = b.matches.filter((m) => m.round === 1);
    // 5 entrants in a size-8 bracket => 3 byes => 3 auto-resolved round-1 matches.
    const resolvedByes = round1.filter((m) => m.winnerId !== null);
    expect(resolvedByes).toHaveLength(3);

    // The single real round-1 match is seed 4 vs seed 5.
    const realMatch = round1.find((m) => m.winnerId === null)!;
    expect(new Set([realMatch.entrantA, realMatch.entrantB])).toEqual(new Set(['e4', 'e5']));

    // Seeds 1, 2, 3 advance into round 2 automatically.
    const r2 = b.matches.filter((m) => m.round === 2);
    const r2Entrants = r2.flatMap((m) => [m.entrantA, m.entrantB]).filter(Boolean);
    expect(r2Entrants).toContain('e1');
    expect(r2Entrants).toContain('e2');
    expect(r2Entrants).toContain('e3');
  });

  it('advances winners through the bracket and crowns a champion', () => {
    let b = generateSingleElimination(seeded(4));
    expect(b.matches).toHaveLength(3);

    const m1 = b.matches.find((m) => m.id === 'W-R1-M1')!;
    const m2 = b.matches.find((m) => m.id === 'W-R1-M2')!;
    b = applyResult(b, m1.id, m1.entrantA!);
    b = applyResult(b, m2.id, m2.entrantA!);

    const final = b.matches.find((m) => m.bracketType === 'final')!;
    expect(final.entrantA).not.toBeNull();
    expect(final.entrantB).not.toBeNull();

    b = applyResult(b, final.id, final.entrantA!);
    const decided = b.matches.find((m) => m.id === final.id)!;
    expect(decided.winnerId).toBe(final.entrantA);
  });

  it('does not mutate the input bracket', () => {
    const b = generateSingleElimination(seeded(4));
    const before = JSON.stringify(b);
    applyResult(b, 'W-R1-M1', b.matches[0]!.entrantA!);
    expect(JSON.stringify(b)).toBe(before);
  });

  it('rejects results for non-competitors and unready matches', () => {
    const b = generateSingleElimination(seeded(4));
    expect(() => applyResult(b, 'W-R1-M1', 'nobody')).toThrow();
    // The final is not ready until both semifinals resolve.
    const final = b.matches.find((m) => m.bracketType === 'final')!;
    expect(() => applyResult(b, final.id, 'e1')).toThrow();
  });

  it('separates teammates in round one when asked', () => {
    const entrants: Entrant[] = [
      { id: 'a1', seed: 1, academyId: 'A' },
      { id: 'a2', seed: 2, academyId: 'A' },
      { id: 'b1', seed: 3, academyId: 'B' },
      { id: 'b2', seed: 4, academyId: 'B' },
    ];
    const b = generateSingleElimination(entrants, { separateAcademies: true });
    const round1 = b.matches.filter((m) => m.round === 1);
    const academyById = new Map(entrants.map((e) => [e.id, e.academyId]));
    for (const m of round1) {
      if (m.entrantA && m.entrantB) {
        expect(academyById.get(m.entrantA)).not.toBe(academyById.get(m.entrantB));
      }
    }
  });
});
