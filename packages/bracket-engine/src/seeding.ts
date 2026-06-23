import { BracketError, Entrant } from './types';

/**
 * Standard single-elimination seed order for a bracket of `size` slots
 * (size must be a power of two). Returns an array where index `i` holds the
 * seed number that belongs in slot `i`.
 *
 * Examples:
 *   size 2 -> [1, 2]
 *   size 4 -> [1, 4, 2, 3]
 *   size 8 -> [1, 8, 4, 5, 2, 7, 3, 6]
 *
 * This is the bracket layout that places the top two seeds on opposite ends
 * so they can only meet in the final, with each seed's expected opponent
 * being the seed that sums to (bracketSize + 1).
 */
export function standardSeedOrder(size: number): number[] {
  if (size < 1 || (size & (size - 1)) !== 0) {
    throw new BracketError(`Bracket size must be a power of two, received ${size}`);
  }
  let order: number[] = [1, 2];
  while (order.length < size) {
    const sum = order.length * 2 + 1;
    const next: number[] = [];
    for (const seed of order) {
      next.push(seed);
      next.push(sum - seed);
    }
    order = next;
  }
  return order;
}

/** Smallest power of two greater than or equal to `n` (minimum 1). */
export function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  return 2 ** Math.ceil(Math.log2(n));
}

/** Order entrants by seed (1 = best). Unseeded entrants keep input order, last. */
export function orderEntrants(entrants: Entrant[]): Entrant[] {
  return entrants
    .map((entrant, index) => ({ entrant, index }))
    .sort((a, b) => {
      const seedA = a.entrant.seed ?? Number.POSITIVE_INFINITY;
      const seedB = b.entrant.seed ?? Number.POSITIVE_INFINITY;
      if (seedA !== seedB) return seedA - seedB;
      return a.index - b.index;
    })
    .map(({ entrant }) => entrant);
}

/**
 * Best-effort teammate separation in round one. Swaps clashing entrants into
 * other matches where they would not create a new clash. Operates in place on a
 * `slots` array (entrant id or null for a bye) laid out in standard seed order.
 * Preserves the full entrant set (it only swaps positions, never drops anyone).
 */
export function separateAcademiesInFirstRound(slots: (string | null)[], ordered: Entrant[]): void {
  const academyOf = new Map(ordered.map((e) => [e.id, e.academyId]));
  const sameAcademy = (a: string | null, b: string | null): boolean =>
    !!a && !!b && !!academyOf.get(a) && academyOf.get(a) === academyOf.get(b);

  const pairCount = slots.length / 2;
  for (let p = 0; p < pairCount; p++) {
    const aIdx = p * 2;
    const bIdx = p * 2 + 1;
    if (!sameAcademy(slots[aIdx] ?? null, slots[bIdx] ?? null)) continue;

    for (let q = 0; q < pairCount; q++) {
      if (q === p) continue;
      const otherAIdx = q * 2;
      const otherBIdx = q * 2 + 1;
      const candidate = slots[otherBIdx] ?? null;
      if (!candidate) continue;

      const clashHere = sameAcademy(slots[aIdx] ?? null, candidate);
      const clashThere = sameAcademy(slots[otherAIdx] ?? null, slots[bIdx] ?? null);
      if (!clashHere && !clashThere) {
        const tmp = slots[bIdx]!;
        slots[bIdx] = candidate;
        slots[otherBIdx] = tmp;
        break;
      }
    }
  }
}
