'use client';

import { useQuery } from '@tanstack/react-query';
import { EventCard } from '../../components/event-card';
import { api } from '../../lib/api';

export default function EventsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: api.listEvents,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Events</h1>
      <p className="mt-2 text-muted">Upcoming competitions on OpenMat.</p>

      <div className="mt-10">
        {isLoading && <p className="text-muted">Loading events…</p>}

        {isError && (
          <p className="text-muted">
            Could not reach the API. Start it with <code className="text-chalk">npm run dev</code>{' '}
            and check <code className="text-chalk">NEXT_PUBLIC_API_URL</code>.
          </p>
        )}

        {data && data.length === 0 && (
          <p className="text-muted">No events yet. Once the API has data, events show up here.</p>
        )}

        {data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
