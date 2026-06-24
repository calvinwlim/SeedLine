'use client';

import { useQuery } from '@tanstack/react-query';
import { EventCard } from './event-card';
import { api } from '../lib/api';

/**
 * Upcoming open events as a horizontal snap rail — the product-carousel pattern
 * from sportswear sites. The rail bleeds to the container edges and scrolls.
 */
export function FeaturedEvents() {
  const { data, isLoading } = useQuery({
    queryKey: ['events', { status: 'registration_open' }],
    queryFn: () => api.listEvents({ status: 'registration_open' }),
  });

  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-hidden px-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-52 w-[300px] shrink-0 animate-pulse rounded-2xl border border-line/10 bg-surface"
          />
        ))}
      </div>
    );
  }

  const events = (data ?? []).slice(0, 6);
  if (events.length === 0) {
    return <p className="px-6 text-muted">No open events right now. Check back soon.</p>;
  }

  return (
    <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {events.map((event) => (
        <div key={event.id} className="w-[300px] shrink-0 snap-start">
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}
