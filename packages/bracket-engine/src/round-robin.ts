import { Bracket, BracketMatch, Entrant } from './types';

const BYE = '__bye__';

/**
 * Generate a round-robin bracket where every entrant faces every other once.
 * Uses the circle method to spread matches across balanced rounds. Handles odd
 * entrant counts (including the common 3-competitor BJJ division) by rotating a
 * bye that is dropped from the schedule.
 *
 * Round-robin matches carry no `winnerTo` wiring; final placement comes from
 * standings (see computeRoundRobinStandings).
 */
export function generateRoundRobin(entrants: Entrant[]): Bracket {
  const ids = entrants.map((e) => e.id);
  if (ids.length <= 1) {
    return { format: 'round_robin', entrants, matches: [], rounds: 0 };
  }

  const players = [...ids];
  if (players.length % 2 === 1) players.push(BYE);
  const n = players.length;
  const rounds = n - 1;
  const half = n / 2;

  const matches: BracketMatch[] = [];
  let arrangement = [...players];

  for (let round = 1; round <= rounds; round++) {
    let position = 1;
    for (let i = 0; i < half; i++) {
      const a = arrangement[i]!;
      const b = arrangement[n - 1 - i]!;
      if (a !== BYE && b !== BYE) {
        matches.push({
          id: `RR-R${round}-M${position}`,
          bracketType: 'round_robin',
          round,
          position,
          sideA: { kind: 'entrant', entrantId: a },
          sideB: { kind: 'entrant', entrantId: b },
          entrantA: a,
          entrantB: b,
          winnerId: null,
          loserId: null,
          winnerTo: null,
          loserTo: null,
        });
        position++;
      }
    }
    // Rotate everyone except the first player (circle method).
    const fixed = arrangement[0]!;
    const rest = arrangement.slice(1);
    rest.unshift(rest.pop()!);
    arrangement = [fixed, ...rest];
  }

  return { format: 'round_robin', entrants, matches, rounds };
}

export interface Standing {
  entrantId: string;
  wins: number;
  losses: number;
  played: number;
}

/**
 * Basic standings ordered by wins, then fewest losses. Ruleset-specific
 * tie-breakers (head-to-head, points scored, advantages) are intentionally out
 * of scope for the foundation and belong in a ruleset module.
 */
export function computeRoundRobinStandings(bracket: Bracket): Standing[] {
  const table = new Map<string, Standing>();
  for (const e of bracket.entrants) {
    table.set(e.id, { entrantId: e.id, wins: 0, losses: 0, played: 0 });
  }

  for (const match of bracket.matches) {
    if (!match.winnerId) continue;
    const winner = table.get(match.winnerId);
    if (winner) {
      winner.wins += 1;
      winner.played += 1;
    }
    const loserId =
      match.loserId ?? (match.entrantA === match.winnerId ? match.entrantB : match.entrantA);
    if (loserId) {
      const loser = table.get(loserId);
      if (loser) {
        loser.losses += 1;
        loser.played += 1;
      }
    }
  }

  return [...table.values()].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}
