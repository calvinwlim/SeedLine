'use client';

import { useQuery } from '@tanstack/react-query';
import { EventCard } from './event-card';
import { api } from '../lib/api';

/** The three soonest events with registration open, for the landing page. */
export function FeaturedEvents() {
  const { data, isLoading } = useQuery({
    queryKey: ['events', { status: 'registration_open' }],
    queryFn: () => api.listEvents({ status: 'registration_open' }),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-lg border border-white/10 bg-surface"
          />
        ))}
      </div>
    );
  }

  const events = (data ?? []).slice(0, 3);
  if (events.length === 0) {
    return <p className="text-muted">No open events right now. Check back soon.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
