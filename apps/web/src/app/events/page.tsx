'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Discipline, EventStatus } from '@openmat/types';
import { EventCard } from '../../components/event-card';
import { Container } from '../../components/ui/container';
import { EmptyState } from '../../components/ui/card';
import { FilterSelect, SearchInput } from '../../components/ui/search-input';
import { MapView, type MapMarker } from '../../components/map/map-view';
import { api } from '../../lib/api';

const DISCIPLINE_OPTIONS: Array<{ value: Discipline | ''; label: string }> = [
  { value: '', label: 'All disciplines' },
  { value: 'gi', label: 'Gi' },
  { value: 'nogi', label: 'No-Gi' },
];

const STATUS_OPTIONS: Array<{ value: EventStatus | ''; label: string }> = [
  { value: '', label: 'Any status' },
  { value: 'registration_open', label: 'Registration open' },
  { value: 'published', label: 'Announced' },
  { value: 'registration_closed', label: 'Registration closed' },
  { value: 'completed', label: 'Completed' },
];

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const [showMap, setShowMap] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', { search, discipline, status }],
    queryFn: () =>
      api.listEvents({
        search: search || undefined,
        discipline: discipline || undefined,
        status: status || undefined,
      }),
  });

  const events = useMemo(() => data ?? [], [data]);

  const markers: MapMarker[] = useMemo(
    () =>
      events
        .filter((e) => e.coordinates)
        .map((e) => ({
          id: e.id,
          name: e.name,
          latitude: e.coordinates!.latitude,
          longitude: e.coordinates!.longitude,
          subtitle: [e.city, e.country].filter(Boolean).join(', '),
          href: `/events/${e.slug}`,
        })),
    [events],
  );

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Events</h1>
          <p className="mt-2 text-muted">Find and register for competitions worldwide.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-chalk transition-colors hover:border-white/40"
        >
          {showMap ? 'Hide map' : 'Show map'}
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, city, or venue…"
          className="flex-1"
        />
        <FilterSelect value={discipline} onChange={setDiscipline} options={DISCIPLINE_OPTIONS} />
        <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>

      {showMap && markers.length > 0 && (
        <div className="mt-6">
          <MapView markers={markers} height="h-96" />
        </div>
      )}

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-lg border border-white/10 bg-surface"
              />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-muted">
            Could not reach the API. Start it with <code className="text-chalk">npm run dev</code>{' '}
            and check <code className="text-chalk">NEXT_PUBLIC_API_URL</code>.
          </p>
        )}

        {data && events.length === 0 && (
          <EmptyState
            title="No events match your filters"
            description="Try clearing the search box or widening the filters."
          />
        )}

        {events.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted">
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
