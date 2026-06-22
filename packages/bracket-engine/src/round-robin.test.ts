import { describe, expect, it } from 'vitest';
import { applyResult } from './apply';
import { computeRoundRobinStandings, generateRoundRobin } from './round-robin';
import { Entrant } from './types';

function entrants(n: number): Entrant[] {
  return Array.from({ length: n }, (_, i) => ({ id: `e${i + 1}`, name: `E${i + 1}` }));
}

function pairKey(a: string | null, b: string | null): string {
  return [a, b].sort().join('-');
}

describe('generateRoundRobin', () => {
  it('schedules every unique pair once for 4 entrants', () => {
    const b = generateRoundRobin(entrants(4));
    expect(b.matches).toHaveLength(6);
    const pairs = new Set(b.matches.map((m) => pairKey(m.entrantA, m.entrantB)));
    expect(pairs.size).toBe(6);
  });

  it('handles the 3-competitor division (each faces each once)', () => {
    const b = generateRoundRobin(entrants(3));
    expect(b.matches).toHaveLength(3);
    const pairs = new Set(b.matches.map((m) => pairKey(m.entrantA, m.entrantB)));
    expect(pairs).toEqual(new Set(['e1-e2', 'e1-e3', 'e2-e3']));
  });

  it('never schedules a competitor against themselves', () => {
    const b = generateRoundRobin(entrants(5));
    for (const m of b.matches) {
      expect(m.entrantA).not.toBe(m.entrantB);
    }
    expect(b.matches).toHaveLength(10); // C(5,2)
  });
});

describe('computeRoundRobinStandings', () => {
  it('ranks by wins', () => {
    let b = generateRoundRobin(entrants(3));
    // e1 beats everyone, e2 beats e3.
    for (const m of b.matches) {
      const winner =
        m.entrantA === 'e1' || m.entrantB === 'e1'
          ? 'e1'
          : m.entrantA === 'e2' || m.entrantB === 'e2'
            ? 'e2'
            : m.entrantA!;
      b = applyResult(b, m.id, winner);
    }
    const standings = computeRoundRobinStandings(b);
    expect(standings[0]!.entrantId).toBe('e1');
    expect(standings[0]!.wins).toBe(2);
    expect(standings[1]!.entrantId).toBe('e2');
  });
});
