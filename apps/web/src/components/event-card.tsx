import type { EventSummary } from '@openmat/types';

export function EventCard({ event }: { event: EventSummary }) {
  const start = new Date(event.startDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const location = [event.venueName, event.city].filter(Boolean).join(' · ') || 'Venue TBA';

  return (
    <article className="rounded-lg border border-white/10 bg-surface p-5 transition-colors hover:border-podium/50">
      <h3 className="font-display text-lg font-bold">{event.name}</h3>
      <p className="mt-1 text-sm text-muted">{location}</p>
      <p className="mt-3 text-sm text-podium">{start}</p>
    </article>
  );
}
