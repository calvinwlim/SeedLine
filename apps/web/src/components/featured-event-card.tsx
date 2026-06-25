import Link from 'next/link';
import type { EventSummary } from '@openmat/types';
import { Badge } from './ui/badge';
import {
  eventStatusLabel,
  eventStatusTone,
  formatDateRange,
  formatPrice,
  humanize,
} from '../lib/format';

function CoverLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 180" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2">
        <path d="M12 34 H72 V72 H136" />
        <path d="M12 110 H72 V72" />
        <path d="M136 72 H196 V108 H256" />
        <path d="M136 146 H196 V108" />
      </g>
    </svg>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
        {label}
      </div>
    </div>
  );
}

/** The lead/feature card on the events directory — a large editorial hero. */
export function FeaturedEventCard({ event }: { event: EventSummary }) {
  const location = [event.venueName, event.city, event.country].filter(Boolean).join(' · ');
  const disciplines = (event.disciplines ?? []).map((d) => humanize(d)).join(' · ');

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-line/10 bg-surface shadow-card transition-all hover:-translate-y-1 hover:border-line/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:grid-cols-2"
    >
      {/* Cover */}
      <div className="relative flex min-h-[240px] flex-col justify-between overflow-hidden bg-elevated p-8">
        <CoverLines className="pointer-events-none absolute -right-6 -top-6 w-72 text-line/[0.08]" />
        <div className="relative flex items-center gap-3">
          <Badge tone={eventStatusTone(event.status)}>{eventStatusLabel(event.status)}</Badge>
          {disciplines && (
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              {disciplines}
            </span>
          )}
        </div>
        <p className="relative font-display text-5xl font-bold leading-none tracking-tight">
          {formatDateRange(event.startDate, event.endDate)}
        </p>
      </div>

      {/* Details */}
      <div className="flex flex-col justify-center p-8">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
          Featured event
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight transition-colors group-hover:text-accent">
          {event.name}
        </h2>
        <p className="mt-2 text-muted">{location || 'Venue to be announced'}</p>

        <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
          {typeof event.divisionCount === 'number' && (
            <Metric value={String(event.divisionCount)} label="Divisions" />
          )}
          {typeof event.registeredCount === 'number' && (
            <Metric value={String(event.registeredCount)} label="Registered" />
          )}
          {typeof event.startingPriceCents === 'number' && (
            <Metric value={formatPrice(event.startingPriceCents)} label="From" />
          )}
        </div>

        <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent">
          View event
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}
