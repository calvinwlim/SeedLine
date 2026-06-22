import { Bracket, BracketError, BracketMatch } from './types';

/**
 * Mutating helper: record a winner on a match and propagate the result to the
 * downstream match(es) it feeds. Used internally during generation (to
 * auto-advance byes) and by the immutable `applyResult` below.
 */
export function resolveWinner(
  byId: Map<string, BracketMatch>,
  matchId: string,
  winnerId: string,
): void {
  const match = byId.get(matchId);
  if (!match) throw new BracketError(`Unknown match: ${matchId}`);

  const loserId =
    match.entrantA === winnerId
      ? match.entrantB
      : match.entrantB === winnerId
        ? match.entrantA
        : null;

  match.winnerId = winnerId;
  match.loserId = loserId;

  propagate(byId, match.winnerTo, winnerId);
  if (loserId) propagate(byId, match.loserTo, loserId);
}

function propagate(
  byId: Map<string, BracketMatch>,
  target: BracketMatch['winnerTo'],
  entrantId: string,
): void {
  if (!target) return;
  const next = byId.get(target.matchId);
  if (!next) return;
  if (target.side === 'A') {
    next.entrantA = entrantId;
    next.sideA = { kind: 'entrant', entrantId };
  } else {
    next.entrantB = entrantId;
    next.sideB = { kind: 'entrant', entrantId };
  }
}

/**
 * Record the result of a match and return a NEW bracket with the winner
 * advanced. The input bracket is never mutated.
 *
 * Throws if the match is unknown, not yet ready (a competitor undetermined),
 * or if `winnerId` is not one of the two competitors.
 */
export function applyResult(bracket: Bracket, matchId: string, winnerId: string): Bracket {
  const next = structuredClone(bracket);
  const byId = new Map(next.matches.map((m) => [m.id, m]));

  const match = byId.get(matchId);
  if (!match) throw new BracketError(`Unknown match: ${matchId}`);
  if (match.entrantA === null || match.entrantB === null) {
    throw new BracketError(`Match ${matchId} is not ready: a competitor is undetermined`);
  }
  if (match.entrantA !== winnerId && match.entrantB !== winnerId) {
    throw new BracketError(`Winner ${winnerId} is not a competitor in match ${matchId}`);
  }

  resolveWinner(byId, matchId, winnerId);
  return next;
}
