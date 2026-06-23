import Link from 'next/link';
import type { RegistrationSummary } from '@openmat/types';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { formatDate, registrationStatusLabel, registrationStatusTone } from '../lib/format';

/** A list of an athlete's event registrations. Used on profiles and the account area. */
export function RegistrationList({ registrations }: { registrations: RegistrationSummary[] }) {
  if (registrations.length === 0) {
    return <p className="text-sm text-muted">No registrations yet.</p>;
  }
  return (
    <Card className="divide-y divide-line/10">
      {registrations.map((reg) => (
        <div key={reg.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
          <div className="min-w-0">
            <Link
              href={`/events/${reg.eventSlug}`}
              className="truncate text-sm font-medium text-chalk hover:text-podium"
            >
              {reg.eventName}
            </Link>
            <p className="truncate text-xs text-muted">
              {reg.divisionName} · {formatDate(reg.startDate)}
              {reg.city ? ` · ${reg.city}` : ''}
            </p>
          </div>
          <Badge tone={registrationStatusTone(reg.status)}>
            {registrationStatusLabel(reg.status)}
          </Badge>
        </div>
      ))}
    </Card>
  );
}
