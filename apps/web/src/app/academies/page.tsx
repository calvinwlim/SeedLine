'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AcademyCard } from '../../components/academy-card';
import { Container } from '../../components/ui/container';
import { EmptyState } from '../../components/ui/card';
import { SearchInput } from '../../components/ui/search-input';
import { SegmentedFilter } from '../../components/ui/segmented-filter';
import { ActiveFilters, type ActiveFilterItem } from '../../components/ui/active-filters';
import { api } from '../../lib/api';

type SortKey = 'name' | 'members';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'name', label: 'A–Z' },
  { value: 'members', label: 'Members' },
];

export default function AcademiesPage() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState<string>('');
  const [sort, setSort] = useState<SortKey>('name');

  const { data, isLoading } = useQuery({
    queryKey: ['academies', search],
    queryFn: () => api.listAcademies(search || undefined),
  });

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((a) => {
      if (a.country) set.add(a.country);
    });
    return [{ value: '', label: 'All' }, ...[...set].sort().map((c) => ({ value: c, label: c }))];
  }, [data]);

  const academies = useMemo(() => {
    const arr = (data ?? []).filter((a) => country === '' || a.country === country);
    if (sort === 'members') arr.sort((a, b) => b.memberCount - a.memberCount);
    else arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [data, country, sort]);

  const activeFilters: ActiveFilterItem[] = [
    ...(search ? [{ key: 'search', label: `“${search}”`, onRemove: () => setSearch('') }] : []),
    ...(country ? [{ key: 'country', label: country, onRemove: () => setCountry('') }] : []),
  ];
  const clearAll = () => {
    setSearch('');
    setCountry('');
  };

  return (
    <Container className="py-14" size="wide">
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
        Directory
      </p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">Academies</h1>
      <p className="mt-3 text-muted">Teams and gyms competing on OpenMat.</p>

      <div className="mt-10 space-y-5 border-y border-line/10 py-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, city, or country…"
          className="sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {countryOptions.length > 1 && (
            <SegmentedFilter
              label="Country"
              value={country}
              onChange={setCountry}
              options={countryOptions}
            />
          )}
          <SegmentedFilter label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>
        <ActiveFilters items={activeFilters} onClearAll={clearAll} />
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-line/10 bg-surface"
              />
            ))}
          </div>
        )}

        {data && academies.length === 0 && (
          <EmptyState title="No academies found" description="Try a different search or filter." />
        )}

        {academies.length > 0 && (
          <>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              {academies.length} {academies.length === 1 ? 'academy' : 'academies'}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {academies.map((academy) => (
                <AcademyCard key={academy.id} academy={academy} />
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
