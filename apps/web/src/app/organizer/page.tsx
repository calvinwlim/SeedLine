'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Container } from '../../components/ui/container';
import { Badge } from '../../components/ui/badge';
import { ButtonLink } from '../../components/ui/button';
import { Card, EmptyState } from '../../components/ui/card';
import { StatTile } from '../../components/stats/stat-tile';
import { api } from '../../lib/api';
import { eventStatusLabel, eventStatusTone, formatDateRange } from '../../lib/format';

export default function OrganizerDashboardPage() {
  const { data: organizer } = useQuery({
    queryKey: ['organizer'],
    queryFn: () => api.getOrganizer(),
  });
  const { data: events, isLoading } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => api.listOrganizerEvents(),
  });

  return (
    <main>
      <div className="border-b border-line/10 bg-surface">
        <Container className="py-10">
          <p className="text-sm text-muted">Organizer</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-3xl font-bold">{organizer?.name ?? 'Your events'}</h1>
            <ButtonLink href="/organizer/events/new">+ New event</ButtonLink>
          </div>
          {organizer && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
              <StatTile label="Events" value={organizer.eventCount} />
              <StatTile label="Upcoming" value={organizer.upcomingCount} accent="gold" />
              <StatTile label="Athletes" value={organizer.athleteCount} />
            </div>
          )}
        </Container>
      </div>

      <Container className="py-10">
        <h2 className="font-display text-xl font-bold">Your events</h2>
        <div className="mt-4">
          {isLoading && (
            <div className="h-40 animate-pulse rounded-lg border border-line/10 bg-surface" />
          )}

          {events && events.length === 0 && (
            <EmptyState
              title="No events yet"
              description="Create your first event to open registration and build brackets."
              action={<ButtonLink href="/organizer/events/new">Create an event</ButtonLink>}
            />
          )}

          {events && events.length > 0 && (
            <Card className="divide-y divide-line/10">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/organizer/events/${event.slug}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-line/[0.03]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-chalk group-hover:text-podium">
                      {event.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDateRange(event.startDate, event.endDate)} · {event.divisionCount ?? 0}{' '}
                      divisions · {event.registeredCount ?? 0} registered
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={eventStatusTone(event.status)}>
                      {eventStatusLabel(event.status)}
                    </Badge>
                    <span className="text-muted transition-colors group-hover:text-podium">→</span>
                  </div>
                </Link>
              ))}
            </Card>
          )}
        </div>
      </Container>
    </main>
  );
}
