import Link from 'next/link';
import type { MedalResult } from '@seedline/types';
import { Card } from './ui/card';
import { formatDate, ordinalPlace } from '../lib/format';

function medalTone(place: number): string {
  if (place === 1) return 'text-accent';
  if (place === 2) return 'text-muted';
  if (place === 3) return 'text-corner';
  return 'text-chalk';
}

/** Podium results for an athlete or academy. */
export function MedalList({ medals }: { medals: MedalResult[] }) {
  if (medals.length === 0) {
    return <p className="text-sm text-muted">No podium results recorded yet.</p>;
  }
  return (
    <Card className="divide-y divide-line/10">
      {medals.map((medal, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0">
            <Link
              href={`/events/${medal.eventSlug}`}
              className="truncate text-sm font-medium text-chalk hover:text-accent"
            >
              {medal.eventName}
            </Link>
            <p className="truncate text-xs text-muted">
              {medal.divisionName} · {formatDate(medal.date)}
            </p>
          </div>
          <span className={`shrink-0 text-sm font-semibold ${medalTone(medal.place)}`}>
            {ordinalPlace(medal.place)} place
          </span>
        </div>
      ))}
    </Card>
  );
}
