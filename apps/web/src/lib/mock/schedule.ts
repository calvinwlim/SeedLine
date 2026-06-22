import type {
  EventSchedule,
  EventStatus,
  MatchStatus,
  ScheduleMat,
  ScheduleMatch,
} from '@openmat/types';
import type { Bracket } from '@openmat/bracket-engine';
import { buildBracket } from '../bracket';
import { buildEntrants } from './entrants';
import type { events as EventsArray } from './data';

type MockEvent = (typeof EventsArray)[number];

const MAT_COUNT = 4;

function roundLabel(round: number, totalRounds: number, format: string): string {
  if (format === 'round_robin') return `RR Round ${round}`;
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Quarterfinal';
  return `Round ${round}`;
}

interface RawMatch {
  divisionName: string;
  roundLabel: string;
  a: string;
  b: string;
  winner: string | null;
}

/**
 * Flatten a division's first competitive round (all matches for round robin)
 * into schedulable rows. Byes are skipped; later elimination rounds depend on
 * results and are not pre-scheduled.
 */
function divisionMatches(
  bracket: Bracket,
  divisionName: string,
  seedOf: Map<string, number>,
): RawMatch[] {
  const names = new Map(bracket.entrants.map((e) => [e.id, e.name ?? e.id]));
  const isRoundRobin = bracket.format === 'round_robin';

  return bracket.matches
    .filter((m) => (isRoundRobin ? true : m.round === 1))
    .filter((m) => m.entrantA && m.entrantB && m.sideA.kind !== 'bye' && m.sideB.kind !== 'bye')
    .map((m) => {
      const a = m.entrantA!;
      const b = m.entrantB!;
      const winner = (seedOf.get(a) ?? Infinity) <= (seedOf.get(b) ?? Infinity) ? a : b;
      return {
        divisionName,
        roundLabel: roundLabel(m.round, bracket.rounds, bracket.format),
        a: names.get(a) ?? a,
        b: names.get(b) ?? b,
        winner: names.get(winner) ?? winner,
      };
    });
}

/** Assign a status to each match based on the event's lifecycle stage. */
function statusFor(index: number, total: number, eventStatus: EventStatus): MatchStatus {
  if (eventStatus === 'completed') return 'completed';
  if (eventStatus !== 'in_progress') return 'pending';
  // Live: roughly the first 45% are done, the next one is on the mat, rest queued.
  const done = Math.floor(total * 0.45);
  if (index < done) return 'completed';
  if (index === done) return 'in_progress';
  if (index === done + 1) return 'ready';
  return 'pending';
}

export function buildSchedule(event: MockEvent): EventSchedule {
  const raw: RawMatch[] = [];
  for (const division of event.divisions) {
    const entrants = buildEntrants(event.slug, division);
    if (entrants.length < 2) continue;
    let bracket: Bracket;
    try {
      bracket = buildBracket(division.format, entrants);
    } catch {
      continue; // unsupported format (e.g. double elimination stub)
    }
    const seedOf = new Map(entrants.map((e) => [e.id, e.seed]));
    raw.push(...divisionMatches(bracket, division.name, seedOf));
  }

  // Distribute matches across mats round-robin, numbering the order per mat.
  const mats: ScheduleMat[] = Array.from({ length: MAT_COUNT }, (_, i) => ({
    name: `Mat ${i + 1}`,
    matches: [] as ScheduleMatch[],
  }));

  let completed = 0;
  raw.forEach((m, index) => {
    const status = statusFor(index, raw.length, event.status);
    if (status === 'completed') completed += 1;
    const mat = mats[index % MAT_COUNT]!;
    mat.matches.push({
      id: `${event.id}_sch_${index}`,
      order: mat.matches.length + 1,
      divisionName: m.divisionName,
      roundLabel: m.roundLabel,
      competitorA: m.a,
      competitorB: m.b,
      status,
      winner: status === 'completed' ? m.winner : null,
    });
  });

  return {
    eventId: event.id,
    eventSlug: event.slug,
    eventName: event.name,
    status: event.status,
    mats: mats.filter((mat) => mat.matches.length > 0),
    totalMatches: raw.length,
    completedMatches: completed,
  };
}
