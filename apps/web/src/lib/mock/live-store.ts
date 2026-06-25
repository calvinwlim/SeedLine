import type {
  EventSchedule,
  EventStatus,
  MatControl,
  MatchScore,
  MatchStatus,
  ScoreAction,
  ScoreMethod,
  ScoreSide,
  ScoreableMatch,
  ScheduleMat,
} from '@seedline/types';
import type { Bracket } from '@seedline/bracket-engine';
import { buildBracket } from '../bracket';
import { buildEntrants } from './entrants';
import type { events as EventsArray } from './data';

type MockEvent = (typeof EventsArray)[number];

const MAT_COUNT = 4;

/** Internal mutable match record. The store owns these; the API maps them out. */
interface LiveMatch {
  id: string;
  matName: string;
  order: number;
  divisionName: string;
  roundLabel: string;
  competitorA: string;
  competitorB: string;
  status: MatchStatus;
  score: MatchScore;
  winner: string | null;
}

// One mutable schedule per event, built lazily and then mutated by scoring.
const store = new Map<string, LiveMatch[]>();

function zeroScore(): MatchScore {
  return {
    a: { points: 0, advantages: 0, penalties: 0 },
    b: { points: 0, advantages: 0, penalties: 0 },
    method: null,
  };
}

function roundLabel(round: number, totalRounds: number, format: string): string {
  if (format === 'round_robin') return `RR Round ${round}`;
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Quarterfinal';
  return `Round ${round}`;
}

function statusFor(index: number, total: number, eventStatus: EventStatus): MatchStatus {
  if (eventStatus === 'completed') return 'completed';
  if (eventStatus !== 'in_progress') return 'pending';
  const done = Math.floor(total * 0.45);
  if (index < done) return 'completed';
  if (index === done) return 'in_progress';
  if (index === done + 1) return 'ready';
  return 'pending';
}

/** A believable finished score, varied but deterministic by index. */
function finalScore(index: number): { score: MatchScore; method: ScoreMethod } {
  const score = zeroScore();
  if (index % 3 === 0) {
    // Submission: winner finishes, score stands where it was.
    score.a.points = 2;
    score.method = 'submission';
    return { score, method: 'submission' };
  }
  const winnerPts = [4, 6, 2][index % 3] ?? 4;
  const loserPts = [0, 2, 0][index % 3] ?? 0;
  score.a.points = winnerPts;
  score.b.points = loserPts;
  score.a.advantages = index % 2;
  score.method = 'points';
  return { score, method: 'points' };
}

interface RawMatch {
  divisionName: string;
  roundLabel: string;
  a: string;
  b: string;
}

function divisionMatches(bracket: Bracket, divisionName: string): RawMatch[] {
  const names = new Map(bracket.entrants.map((e) => [e.id, e.name ?? e.id]));
  const isRoundRobin = bracket.format === 'round_robin';
  return bracket.matches
    .filter((m) => (isRoundRobin ? true : m.round === 1))
    .filter((m) => m.entrantA && m.entrantB && m.sideA.kind !== 'bye' && m.sideB.kind !== 'bye')
    .map((m) => ({
      divisionName,
      roundLabel: roundLabel(m.round, bracket.rounds, bracket.format),
      a: names.get(m.entrantA!) ?? m.entrantA!,
      b: names.get(m.entrantB!) ?? m.entrantB!,
    }));
}

function buildLiveMatches(event: MockEvent): LiveMatch[] {
  const raw: RawMatch[] = [];
  for (const division of event.divisions) {
    const entrants = buildEntrants(event.slug, division);
    if (entrants.length < 2) continue;
    let bracket: Bracket;
    try {
      bracket = buildBracket(division.format, entrants);
    } catch {
      continue;
    }
    raw.push(...divisionMatches(bracket, division.name));
  }

  // First pass: assign each match to a mat and record its order within that mat.
  const matOf = raw.map((_, index) => index % MAT_COUNT);
  const orderInMat: number[] = [];
  const perMatTotal = new Array(MAT_COUNT).fill(0);
  raw.forEach((_, index) => {
    const mat = matOf[index]!;
    orderInMat[index] = perMatTotal[mat];
    perMatTotal[mat] += 1;
  });

  // Second pass: status runs independently per mat, so every mat has a live feel.
  return raw.map((m, index) => {
    const matIndex = matOf[index]!;
    const status = statusFor(orderInMat[index]!, perMatTotal[matIndex], event.status);
    let score = zeroScore();
    let winner: string | null = null;
    if (status === 'completed') {
      score = finalScore(index).score;
      // Side A is the better seed in our generation, so A is the winner.
      winner = m.a;
    } else if (status === 'in_progress') {
      score.a.points = 2;
      score.a.advantages = 1;
      score.b.penalties = 1;
    }
    return {
      id: `${event.id}_sch_${index}`,
      matName: `Mat ${matIndex + 1}`,
      order: orderInMat[index]! + 1,
      divisionName: m.divisionName,
      roundLabel: m.roundLabel,
      competitorA: m.a,
      competitorB: m.b,
      status,
      score,
      winner,
    };
  });
}

function ensure(event: MockEvent): LiveMatch[] {
  let matches = store.get(event.id);
  if (!matches) {
    matches = buildLiveMatches(event);
    store.set(event.id, matches);
  }
  return matches;
}

function toScoreable(event: MockEvent, m: LiveMatch): ScoreableMatch {
  return {
    id: m.id,
    eventId: event.id,
    eventSlug: event.slug,
    matName: m.matName,
    divisionName: m.divisionName,
    roundLabel: m.roundLabel,
    competitorA: m.competitorA,
    competitorB: m.competitorB,
    status: m.status,
    score: m.score,
    winner: m.winner,
  };
}

export function getSchedule(event: MockEvent): EventSchedule {
  const matches = ensure(event);
  const byMat = new Map<string, ScheduleMat>();
  for (const m of matches) {
    let mat = byMat.get(m.matName);
    if (!mat) {
      mat = { name: m.matName, matches: [] };
      byMat.set(m.matName, mat);
    }
    mat.matches.push({
      id: m.id,
      order: m.order,
      divisionName: m.divisionName,
      roundLabel: m.roundLabel,
      competitorA: m.competitorA,
      competitorB: m.competitorB,
      status: m.status,
      winner: m.winner,
      score: m.score,
    });
  }
  return {
    eventId: event.id,
    eventSlug: event.slug,
    eventName: event.name,
    status: event.status,
    mats: [...byMat.values()].sort((a, b) => a.name.localeCompare(b.name)),
    totalMatches: matches.length,
    completedMatches: matches.filter((m) => m.status === 'completed').length,
  };
}

export function getScoreableMatch(event: MockEvent, matchId: string): ScoreableMatch | null {
  const m = ensure(event).find((x) => x.id === matchId);
  return m ? toScoreable(event, m) : null;
}

export function getMatControls(event: MockEvent): MatControl[] {
  const schedule = getSchedule(event);
  return schedule.mats.map((mat) => {
    const matMatches = ensure(event).filter((m) => m.matName === mat.name);
    const current = matMatches.find((m) => m.status === 'in_progress') ?? null;
    const onDeck =
      matMatches.find((m) => m.status === 'ready') ??
      matMatches.find((m) => m.status === 'pending') ??
      null;
    return {
      name: mat.name,
      current: current ? toScoreable(event, current) : null,
      onDeck: onDeck && onDeck !== current ? toScoreable(event, onDeck) : null,
      remaining: matMatches.filter((m) => m.status !== 'completed').length,
      completed: matMatches.filter((m) => m.status === 'completed').length,
    };
  });
}

export function applyScore(
  event: MockEvent,
  matchId: string,
  action: ScoreAction,
): ScoreableMatch | null {
  const m = ensure(event).find((x) => x.id === matchId);
  if (!m) return null;
  const competitor = m.score[action.side];
  competitor[action.field] = Math.max(0, competitor[action.field] + action.delta);
  return toScoreable(event, m);
}

export function startMatch(event: MockEvent, matchId: string): ScoreableMatch | null {
  const m = ensure(event).find((x) => x.id === matchId);
  if (!m) return null;
  if (m.status !== 'completed') m.status = 'in_progress';
  return toScoreable(event, m);
}

export function resetMatch(event: MockEvent, matchId: string): ScoreableMatch | null {
  const m = ensure(event).find((x) => x.id === matchId);
  if (!m) return null;
  m.score = zeroScore();
  m.winner = null;
  m.status = 'ready';
  return toScoreable(event, m);
}

export function finishMatch(
  event: MockEvent,
  matchId: string,
  winnerSide: ScoreSide,
  method: ScoreMethod,
): ScoreableMatch | null {
  const m = ensure(event).find((x) => x.id === matchId);
  if (!m) return null;
  m.status = 'completed';
  m.score.method = method;
  m.winner = winnerSide === 'a' ? m.competitorA : m.competitorB;
  return toScoreable(event, m);
}

/** Decide the winning side from a points-method score (advantages then penalties break ties). */
export function decideWinnerSide(score: MatchScore): ScoreSide {
  if (score.a.points !== score.b.points) return score.a.points > score.b.points ? 'a' : 'b';
  if (score.a.advantages !== score.b.advantages)
    return score.a.advantages > score.b.advantages ? 'a' : 'b';
  if (score.a.penalties !== score.b.penalties)
    return score.a.penalties < score.b.penalties ? 'a' : 'b';
  return 'a';
}
