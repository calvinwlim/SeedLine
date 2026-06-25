import type {
  AcademyDetail,
  AcademySummary,
  AthleteProfile,
  AthleteSummary,
  DivisionDetail,
  EventDetail,
  EventListQuery,
  EventSchedule,
  EventSummary,
  MatControl,
  ScoreAction,
  ScoreMethod,
  ScoreSide,
  ScoreableMatch,
} from '@seedline/types';
import type { ApiClient } from './api-types';
import { mockClient } from './mock/client';

/**
 * Data source selection.
 *
 * The web app defaults to `mock`, which means it runs and is fully developable
 * on its own — no API, no database, no Docker. Set `NEXT_PUBLIC_DATA_SOURCE=live`
 * (and point `NEXT_PUBLIC_API_URL` at a running API) to use the real backend.
 *
 * The live client overrides the endpoints the API serves today (the public
 * directory: events, divisions, academies, athletes; plus the live schedule and
 * matside scoring); everything else still falls back to the mock client so the
 * rest of the app keeps rendering while the backend catches up (account,
 * organizer, and registration writes — the latter pending auth).
 */
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return response.json() as Promise<T>;
}

/** Like `request`, but a 404 resolves to null (for "get by slug" lookups). */
async function requestOrNull<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return response.json() as Promise<T>;
}

/** POST helper; a 404 resolves to null (for scoring mutations on a match). */
async function postOrNull<T>(path: string, body?: unknown): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return response.json() as Promise<T>;
}

function buildEventQuery(query?: EventListQuery): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.discipline) params.set('discipline', query.discipline);
  if (query.status) params.set('status', query.status);
  if (query.country) params.set('country', query.country);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function searchQuery(search?: string): string {
  return search ? `?search=${encodeURIComponent(search)}` : '';
}

const liveClient: ApiClient = {
  ...mockClient,
  // Public directory — served by the live API.
  listEvents: (query?: EventListQuery) =>
    request<EventSummary[]>(`/events${buildEventQuery(query)}`),
  getEvent: (slug: string) => requestOrNull<EventDetail>(`/events/${slug}`),
  getDivision: (eventSlug: string, divisionId: string) =>
    requestOrNull<DivisionDetail>(`/events/${eventSlug}/divisions/${divisionId}`),
  listAcademies: (search?: string) => request<AcademySummary[]>(`/academies${searchQuery(search)}`),
  getAcademy: (slug: string) => requestOrNull<AcademyDetail>(`/academies/${slug}`),
  listAthletes: (search?: string) => request<AthleteSummary[]>(`/athletes${searchQuery(search)}`),
  getAthlete: (slug: string) => requestOrNull<AthleteProfile>(`/athletes/${slug}`),

  // Live schedule + matside scoring — served by the live API.
  getEventSchedule: (slug: string) => requestOrNull<EventSchedule>(`/events/${slug}/schedule`),
  getMatControls: (slug: string) => request<MatControl[]>(`/events/${slug}/mat-controls`),
  getScoreableMatch: (slug: string, matchId: string) =>
    requestOrNull<ScoreableMatch>(`/events/${slug}/matches/${matchId}`),
  applyScore: (slug: string, matchId: string, action: ScoreAction) =>
    postOrNull<ScoreableMatch>(`/events/${slug}/matches/${matchId}/score`, action),
  startMatch: (slug: string, matchId: string) =>
    postOrNull<ScoreableMatch>(`/events/${slug}/matches/${matchId}/start`),
  resetMatch: (slug: string, matchId: string) =>
    postOrNull<ScoreableMatch>(`/events/${slug}/matches/${matchId}/reset`),
  finishMatch: (slug: string, matchId: string, winnerSide: ScoreSide, method: ScoreMethod) =>
    postOrNull<ScoreableMatch>(`/events/${slug}/matches/${matchId}/finish`, { winnerSide, method }),
};

export const api: ApiClient = DATA_SOURCE === 'live' ? liveClient : mockClient;

export const dataSource = DATA_SOURCE;
