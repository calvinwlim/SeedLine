'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { BeltRank, Discipline } from '@openmat/types';
import { AthleteCard } from '../../components/athlete-card';
import { FeaturedAthleteCard } from '../../components/featured-athlete-card';
import { Container } from '../../components/ui/container';
import { EmptyState } from '../../components/ui/card';
import { SearchInput } from '../../components/ui/search-input';
import { SegmentedFilter } from '../../components/ui/segmented-filter';
import { ActiveFilters, type ActiveFilterItem } from '../../components/ui/active-filters';
import { api } from '../../lib/api';

const BELT_OPTIONS: Array<{ value: BeltRank | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'brown', label: 'Brown' },
  { value: 'black', label: 'Black' },
];

const DISCIPLINE_OPTIONS: Array<{ value: Discipline | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'gi', label: 'Gi' },
  { value: 'nogi', label: 'No-Gi' },
];

const BELT_RANK: Record<string, number> = {
  white: 1,
  gray: 2,
  yellow: 3,
  orange: 4,
  green: 5,
  blue: 6,
  purple: 7,
  brown: 8,
  black: 9,
};

const labelOf = <T extends string>(opts: Array<{ value: T; label: string }>, value: T): string =>
  opts.find((o) => o.value === value)?.label ?? value;

export default function AthletesPage() {
  const [search, setSearch] = useState('');
  const [belt, setBelt] = useState<BeltRank | ''>('');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['athletes', search],
    queryFn: () => api.listAthletes(search || undefined),
  });

  const athletes = useMemo(
    () =>
      (data ?? []).filter(
        (a) =>
          (belt === '' || a.beltRank === belt) &&
          (discipline === '' || a.discipline === discipline),
      ),
    [data, belt, discipline],
  );

  // Spotlight the highest-ranked athlete; the grid keeps the original order.
  const spotlight = useMemo(() => {
    if (athletes.length === 0) return undefined;
    return [...athletes].sort(
      (a, b) => (BELT_RANK[b.beltRank] ?? 0) - (BELT_RANK[a.beltRank] ?? 0),
    )[0];
  }, [athletes]);
  const rest = athletes.filter((a) => a.id !== spotlight?.id);

  const activeFilters: ActiveFilterItem[] = [
    ...(search ? [{ key: 'search', label: `“${search}”`, onRemove: () => setSearch('') }] : []),
    ...(belt
      ? [{ key: 'belt', label: labelOf(BELT_OPTIONS, belt), onRemove: () => setBelt('') }]
      : []),
    ...(discipline
      ? [
          {
            key: 'discipline',
            label: labelOf(DISCIPLINE_OPTIONS, discipline),
            onRemove: () => setDiscipline(''),
          },
        ]
      : []),
  ];
  const clearAll = () => {
    setSearch('');
    setBelt('');
    setDiscipline('');
  };

  return (
    <Container className="py-14" size="wide">
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
        Directory
      </p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">Athletes</h1>
      <p className="mt-3 text-muted">Competitor profiles, records, and results.</p>

      <div className="mt-10 space-y-5 border-y border-line/10 py-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or academy…"
          className="sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <SegmentedFilter label="Belt" value={belt} onChange={setBelt} options={BELT_OPTIONS} />
          <SegmentedFilter
            label="Discipline"
            value={discipline}
            onChange={setDiscipline}
            options={DISCIPLINE_OPTIONS}
          />
        </div>
        <ActiveFilters items={activeFilters} onClearAll={clearAll} />
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-line/10 bg-surface"
              />
            ))}
          </div>
        )}

        {data && athletes.length === 0 && (
          <EmptyState title="No athletes found" description="Try a different search or filter." />
        )}

        {spotlight && (
          <>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              {athletes.length} {athletes.length === 1 ? 'athlete' : 'athletes'}
            </p>
            <FeaturedAthleteCard athlete={spotlight} />
            {rest.length > 0 && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
