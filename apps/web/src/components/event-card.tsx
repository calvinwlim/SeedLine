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

/** Faint bracket motif used as the card's "cover" graphic (no photography). */
function CoverLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 130" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2">
        <path d="M8 26 H56 V54 H104" />
        <path d="M8 82 H56 V54" />
        <path d="M104 54 H152 V82 H198" />
        <path d="M104 110 H152 V82" />
      </g>
    </svg>
  );
}

export function EventCard({ event }: { event: EventSummary }) {
  const location = [event.venueName, event.city].filter(Boolean).join(' · ') || 'Venue TBA';
  const disciplines = (event.disciplines ?? []).map((d) => humanize(d));

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/10 bg-surface shadow-card transition-all hover:-translate-y-1 hover:border-line/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Cover: status + the date set large, like a poster */}
      <div className="relative flex h-32 items-end overflow-hidden bg-elevated px-5 pb-4">
        <CoverLines className="pointer-events-none absolute -right-3 -top-2 w-48 text-line/[0.08]" />
        <div className="absolute left-5 top-5">
          <Badge tone={eventStatusTone(event.status)}>{eventStatusLabel(event.status)}</Badge>
        </div>
        <p className="relative font-display text-2xl font-bold tracking-tight">
          {formatDateRange(event.startDate, event.endDate)}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {disciplines.length > 0 && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            {disciplines.join(' · ')}
          </p>
        )}
        <h3 className="mt-2 font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-accent">
          {event.name}
        </h3>
        <p className="mt-1 text-sm text-muted">{location}</p>

        <div className="mt-auto flex items-center justify-between border-t border-line/10 pt-4">
          {typeof event.startingPriceCents === 'number' ? (
            <span className="text-sm">
              <span className="text-muted">from </span>
              <span className="font-display font-bold">
                {formatPrice(event.startingPriceCents)}
              </span>
            </span>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
          {typeof event.divisionCount === 'number' && (
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
              {event.divisionCount} divisions
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
