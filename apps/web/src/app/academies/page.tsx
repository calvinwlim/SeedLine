'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AcademyCard } from '../../components/academy-card';
import { Container } from '../../components/ui/container';
import { EmptyState } from '../../components/ui/card';
import { SearchInput } from '../../components/ui/search-input';
import { api } from '../../lib/api';

export default function AcademiesPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['academies', search],
    queryFn: () => api.listAcademies(search || undefined),
  });

  const academies = data ?? [];

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-bold">Academies</h1>
      <p className="mt-2 text-muted">Teams and gyms competing on OpenMat.</p>

      <div className="mt-8">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, city, or country…"
        />
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-line/10 bg-surface"
              />
            ))}
          </div>
        )}

        {data && academies.length === 0 && (
          <EmptyState title="No academies found" description="Try a different search." />
        )}

        {academies.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {academies.map((academy) => (
              <AcademyCard key={academy.id} academy={academy} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
