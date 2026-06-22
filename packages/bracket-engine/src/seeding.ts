import { BracketError } from './types';

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
