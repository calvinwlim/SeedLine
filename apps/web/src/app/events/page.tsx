'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Discipline, EventStatus } from '@seedline/types';
import { EventCard } from '../../components/event-card';
import { FeaturedEventCard } from '../../components/featured-event-card';
import { Container } from '../../components/ui/container';
import { EmptyState } from '../../components/ui/card';
import { SearchInput } from '../../components/ui/search-input';
import { SegmentedFilter } from '../../components/ui/segmented-filter';
import { ActiveFilters, type ActiveFilterItem } from '../../components/ui/active-filters';
import { MapView, type MapMarker } from '../../components/map/map-view';
import { api } from '../../lib/api';

const labelOf = <T extends string>(opts: Array<{ value: T; label: string }>, value: T): string =>
  opts.find((o) => o.value === value)?.label ?? value;

type SortKey = 'soonest' | 'price' | 'name';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'soonest', label: 'Soonest' },
  { value: 'price', label: 'Price' },
  { value: 'name', label: 'A–Z' },
];

const DISCIPLINE_OPTIONS: Array<{ value: Discipline | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'gi', label: 'Gi' },
  { value: 'nogi', label: 'No-Gi' },
];

const STATUS_OPTIONS: Array<{ value: EventStatus | ''; label: string }> = [
  { value: '', label: 'Any' },
  { value: 'registration_open', label: 'Open' },
  { value: 'published', label: 'Announced' },
  { value: 'registration_closed', label: 'Closed' },
  { value: 'completed', label: 'Done' },
];

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const [sort, setSort] = useState<SortKey>('soonest');
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

  const sorted = useMemo(() => {
    const arr = [...events];
    if (sort === 'price') {
      arr.sort((a, b) => (a.startingPriceCents ?? Infinity) - (b.startingPriceCents ?? Infinity));
    } else if (sort === 'name') {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      arr.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
    return arr;
  }, [events, sort]);

  const [featured, ...rest] = sorted;

  const activeFilters: ActiveFilterItem[] = [
    ...(search ? [{ key: 'search', label: `“${search}”`, onRemove: () => setSearch('') }] : []),
    ...(discipline
      ? [
          {
            key: 'discipline',
            label: labelOf(DISCIPLINE_OPTIONS, discipline),
            onRemove: () => setDiscipline(''),
          },
        ]
      : []),
    ...(status
      ? [{ key: 'status', label: labelOf(STATUS_OPTIONS, status), onRemove: () => setStatus('') }]
      : []),
  ];
  const clearAll = () => {
    setSearch('');
    setDiscipline('');
    setStatus('');
  };

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
    <Container className="py-14" size="wide">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Directory
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
            Events
          </h1>
          <p className="mt-3 text-muted">Find and register for competitions worldwide.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className="rounded-full border border-line/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-chalk transition-colors hover:border-line/40"
        >
          {showMap ? 'Hide map' : 'Show map'}
        </button>
      </div>

      {/* Filter bar */}
      <div className="mt-10 space-y-5 border-y border-line/10 py-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, city, or venue…"
          className="sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <SegmentedFilter
            label="Discipline"
            value={discipline}
            onChange={setDiscipline}
            options={DISCIPLINE_OPTIONS}
          />
          <SegmentedFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
        </div>
        <ActiveFilters items={activeFilters} onClearAll={clearAll} />
      </div>

      {showMap && markers.length > 0 && (
        <div className="mt-6">
          <MapView markers={markers} height="h-96" />
        </div>
      )}

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-line/10 bg-surface"
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

        {featured && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line/10 pb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </p>
              <SegmentedFilter
                label="Sort"
                value={sort}
                onChange={setSort}
                options={SORT_OPTIONS}
              />
            </div>

            <FeaturedEventCard event={featured} />

            {rest.length > 0 && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
