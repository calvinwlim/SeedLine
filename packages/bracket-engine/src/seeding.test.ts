import { describe, expect, it } from 'vitest';
import { nextPowerOfTwo, standardSeedOrder } from './seeding';

describe('standardSeedOrder', () => {
  it('produces the canonical orders', () => {
    expect(standardSeedOrder(2)).toEqual([1, 2]);
    expect(standardSeedOrder(4)).toEqual([1, 4, 2, 3]);
    expect(standardSeedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
    expect(standardSeedOrder(16)).toEqual([1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]);
  });

  it('keeps seeds 1 and 2 in opposite halves', () => {
    const order = standardSeedOrder(8);
    expect(order.indexOf(1)).toBeLessThan(4);
    expect(order.indexOf(2)).toBeGreaterThanOrEqual(4);
  });

  it('rejects non-powers-of-two', () => {
    expect(() => standardSeedOrder(6)).toThrow();
  });
});

describe('nextPowerOfTwo', () => {
  it('rounds up to the next power of two', () => {
    expect(nextPowerOfTwo(1)).toBe(1);
    expect(nextPowerOfTwo(3)).toBe(4);
    expect(nextPowerOfTwo(5)).toBe(8);
    expect(nextPowerOfTwo(8)).toBe(8);
    expect(nextPowerOfTwo(9)).toBe(16);
  });
});
