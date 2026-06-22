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

export function EventCard({ event }: { event: EventSummary }) {
  const location = [event.venueName, event.city].filter(Boolean).join(' · ') || 'Venue TBA';
  const disciplines = event.disciplines ?? [];

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col rounded-lg border border-white/10 bg-surface p-5 transition-colors hover:border-podium/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-podium"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone={eventStatusTone(event.status)}>{eventStatusLabel(event.status)}</Badge>
        {typeof event.startingPriceCents === 'number' && (
          <span className="text-sm text-muted">
            from <span className="text-chalk">{formatPrice(event.startingPriceCents)}</span>
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-lg font-bold leading-snug group-hover:text-chalk">
        {event.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{location}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {disciplines.map((d) => (
          <Badge key={d} tone="outline">
            {humanize(d)}
          </Badge>
        ))}
        {typeof event.divisionCount === 'number' && (
          <span className="text-xs text-muted">{event.divisionCount} divisions</span>
        )}
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-sm font-medium text-podium">
        {formatDateRange(event.startDate, event.endDate)}
      </p>
    </Link>
  );
}
