'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AthleteCard } from '../../components/athlete-card';
import { Container } from '../../components/ui/container';
import { EmptyState } from '../../components/ui/card';
import { SearchInput } from '../../components/ui/search-input';
import { api } from '../../lib/api';

export default function AthletesPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['athletes', search],
    queryFn: () => api.listAthletes(search || undefined),
  });

  const athletes = data ?? [];

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-bold">Athletes</h1>
      <p className="mt-2 text-muted">Competitor profiles, records, and results.</p>

      <div className="mt-8">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or academy…" />
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-white/10 bg-surface"
              />
            ))}
          </div>
        )}

        {data && athletes.length === 0 && (
          <EmptyState title="No athletes found" description="Try a different search." />
        )}

        {athletes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
