/**
 * @openmat/bracket-engine
 *
 * Pure, deterministic bracket generation and result propagation. No I/O, no
 * dependencies — safe to run on the server (authoritative) and on the offline
 * scoring tablet (optimistic), then reconcile.
 */
export * from './types';
export { standardSeedOrder, nextPowerOfTwo } from './seeding';
export { generateSingleElimination } from './single-elimination';
export { generateRoundRobin, computeRoundRobinStandings } from './round-robin';
export type { Standing } from './round-robin';
export { generateDoubleElimination } from './double-elimination';
export { applyResult } from './apply';

import { generateDoubleElimination } from './double-elimination';
import { generateRoundRobin } from './round-robin';
import { generateSingleElimination } from './single-elimination';
import { Bracket, BracketError, BracketFormat, Entrant, GenerateOptions } from './types';

/** Generate a bracket for the given format. */
export function generateBracket(
  format: BracketFormat,
  entrants: Entrant[],
  options: GenerateOptions = {},
): Bracket {
  switch (format) {
    case 'single_elimination':
      return generateSingleElimination(entrants, options);
    case 'round_robin':
      return generateRoundRobin(entrants);
    case 'double_elimination':
      return generateDoubleElimination(entrants, options);
    default:
      throw new BracketError(`Unsupported bracket format: ${format as string}`);
  }
}
