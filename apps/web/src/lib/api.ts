import type { EventListQuery, EventSummary } from '@openmat/types';
import type { ApiClient } from './api-types';
import { mockClient } from './mock/client';

/**
 * Data source selection.
 *
 * The web app defaults to `mock`, which means it runs and is fully developable
 * on its own — no API, no database, no Docker. Set `NEXT_PUBLIC_DATA_SOURCE=live`
 * (and point `NEXT_PUBLIC_API_URL` at a running API) to use the real backend.
 *
 * The live client only overrides the endpoints the API actually serves today
 * (the public events list); everything else falls back to the mock client so
 * the rest of the app keeps rendering while the backend catches up.
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

const liveClient: ApiClient = {
  ...mockClient,
  listEvents: (query?: EventListQuery) =>
    request<EventSummary[]>(`/events${buildEventQuery(query)}`),
};

export const api: ApiClient = DATA_SOURCE === 'live' ? liveClient : mockClient;

export const dataSource = DATA_SOURCE;
