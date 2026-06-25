'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { DivisionSummary } from '@openmat/types';
import { Container } from '../../../components/ui/container';
import { Badge } from '../../../components/ui/badge';
import { ButtonLink, Button } from '../../../components/ui/button';
import { Card, CardBody, EmptyState } from '../../../components/ui/card';
import { MapView } from '../../../components/map/map-view';
import { api } from '../../../lib/api';
import {
  daysUntil,
  eventStatusLabel,
  eventStatusTone,
  formatDate,
  formatDateRange,
  formatPrice,
  humanize,
} from '../../../lib/format';

function DivisionRow({ division, eventSlug }: { division: DivisionSummary; eventSlug: string }) {
  const full = division.capacity != null && division.registeredCount >= division.capacity;
  return (
    <Link
      href={`/events/${eventSlug}/divisions/${division.id}`}
      className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-line/[0.03]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-chalk group-hover:text-accent">
          {division.name}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {humanize(division.ruleset)} · {humanize(division.format)} · {division.registeredCount}
          {division.capacity != null ? ` / ${division.capacity}` : ''} registered
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm text-chalk">{formatPrice(division.priceCents)}</span>
        {full ? <Badge tone="muted">Full</Badge> : <Badge tone="green">Open</Badge>}
        <span className="text-muted transition-colors group-hover:text-accent">→</span>
      </div>
    </Link>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right text-chalk">{value}</span>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.getEvent(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="h-8 w-64 animate-pulse rounded bg-surface" />
        <div className="mt-6 h-64 animate-pulse rounded-lg border border-line/10 bg-surface" />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Event not found"
          description="This event may have been removed, or the link is incorrect."
          action={<ButtonLink href="/events">Back to events</ButtonLink>}
        />
      </Container>
    );
  }

  const location = [event.venueName, event.city, event.country].filter(Boolean).join(', ');
  const registrationOpen = event.status === 'registration_open';
  const closesInDays = event.registrationClosesAt ? daysUntil(event.registrationClosesAt) : null;

  const heroStats: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Divisions', value: event.divisions.length },
    { label: 'Registered', value: event.registeredCount ?? '—' },
    {
      label: 'From',
      value:
        typeof event.startingPriceCents === 'number' ? formatPrice(event.startingPriceCents) : '—',
    },
  ];
  if (registrationOpen && closesInDays != null && closesInDays >= 0) {
    heroStats.push({ label: 'Closes in', value: `${closesInDays}d` });
  }

  return (
    <main>
      <div className="border-b border-line/10 bg-surface">
        <Container className="py-12 md:py-16" size="wide">
          <Link
            href="/events"
            className="text-xs font-bold uppercase tracking-wide text-muted hover:text-chalk"
          >
            ← All events
          </Link>
          <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                {formatDateRange(event.startDate, event.endDate)}
                {event.country ? ` · ${event.country}` : ''}
              </p>
              <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
                {event.name}
              </h1>
              <p className="mt-3 text-muted">{location || 'Location to be announced'}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone={eventStatusTone(event.status)}>{eventStatusLabel(event.status)}</Badge>
                {(event.disciplines ?? []).map((d) => (
                  <Badge key={d} tone="outline">
                    {humanize(d)}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <ButtonLink href={`/events/${event.slug}/schedule`} variant="secondary">
                Schedule &amp; results
              </ButtonLink>
              <ButtonLink href={registrationOpen ? `/events/${event.slug}/register` : `#divisions`}>
                {registrationOpen ? 'Register' : 'View divisions'}
              </ButtonLink>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-12 gap-y-4 border-t border-line/10 pt-6">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold leading-none tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_320px]" size="wide">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-bold">About this event</h2>
            <p className="mt-3 whitespace-pre-line text-muted">{event.description}</p>
            {event.scheduleNote && (
              <p className="mt-4 rounded-md border border-line/10 bg-surface px-4 py-3 text-sm text-muted">
                <span className="font-medium text-chalk">Schedule: </span>
                {event.scheduleNote}
              </p>
            )}
          </section>

          <section id="divisions">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-xl font-bold">Divisions</h2>
              <span className="text-sm text-muted">{event.divisions.length} total</span>
            </div>
            <Card className="mt-4 divide-y divide-line/10">
              {event.divisions.map((division) => (
                <DivisionRow key={division.id} division={division} eventSlug={event.slug} />
              ))}
            </Card>
          </section>

          {event.coordinates && (
            <section>
              <h2 className="font-display text-xl font-bold">Venue</h2>
              <p className="mt-2 text-sm text-muted">
                {event.venueName}
                {event.address ? ` · ${event.address}` : ''}
              </p>
              <div className="mt-4">
                <MapView
                  markers={[
                    {
                      id: event.id,
                      name: event.venueName ?? event.name,
                      latitude: event.coordinates.latitude,
                      longitude: event.coordinates.longitude,
                      subtitle: location,
                    },
                  ]}
                />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-muted">Registration</p>
              <p className="mt-1 font-display text-2xl font-bold">
                {typeof event.startingPriceCents === 'number'
                  ? formatPrice(event.startingPriceCents)
                  : '—'}
                {typeof event.startingPriceCents === 'number' && (
                  <span className="text-sm font-normal text-muted"> / division</span>
                )}
              </p>
              {registrationOpen && closesInDays != null && closesInDays >= 0 && (
                <p className="mt-1 text-sm text-accent">
                  Closes in {closesInDays} {closesInDays === 1 ? 'day' : 'days'}
                </p>
              )}
              <div className="mt-4">
                {registrationOpen ? (
                  <ButtonLink href={`/events/${event.slug}/register`} className="w-full">
                    Register now
                  </ButtonLink>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    {eventStatusLabel(event.status)}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-muted">Details</p>
              <div className="mt-2 divide-y divide-line/5">
                <InfoRow label="Dates" value={formatDateRange(event.startDate, event.endDate)} />
                <InfoRow
                  label="Registration opens"
                  value={event.registrationOpensAt ? formatDate(event.registrationOpensAt) : 'TBA'}
                />
                <InfoRow
                  label="Registration closes"
                  value={
                    event.registrationClosesAt ? formatDate(event.registrationClosesAt) : 'TBA'
                  }
                />
                <InfoRow label="Divisions" value={event.divisions.length} />
                <InfoRow label="Registered" value={event.registeredCount ?? '—'} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-muted">Organizer</p>
              <p className="mt-2 font-display text-base font-bold">{event.organizer.name}</p>
            </CardBody>
          </Card>
        </aside>
      </Container>
    </main>
  );
}
