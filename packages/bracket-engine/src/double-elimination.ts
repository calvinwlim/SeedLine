import { Bracket, BracketError, Entrant, GenerateOptions } from './types';

/**
 * Double elimination is intentionally NOT implemented in this foundation.
 *
 * It is deferred deliberately: a correct double-elimination generator must
 * model two linked sub-brackets plus a grand final, and getting it wrong is
 * worse than not shipping it. The intended structure, for whoever implements
 * it next:
 *
 *   1. Winners bracket: a standard single-elimination tree.
 *   2. Losers bracket: receives each winners-bracket loser via `loserTo`. The
 *      drop pattern alternates per round so a competitor knocked into the
 *      losers bracket does not immediately re-face the person who beat them.
 *   3. Grand final: winners-bracket champion vs losers-bracket champion, with
 *      an optional "bracket reset" second match if the losers-bracket finalist
 *      wins the first (because the winners finalist had not yet lost).
 *
 * The `loserTo` field already exists on BracketMatch to support this, and the
 * winners portion can reuse `generateSingleElimination` as a starting point.
 */
export function generateDoubleElimination(
  _entrants: Entrant[],
  _options: GenerateOptions = {},
): Bracket {
  throw new BracketError(
    'double_elimination is not implemented yet — see src/double-elimination.ts for design notes.',
  );
}
