import Link from 'next/link';
import type { AthleteSummary } from '@openmat/types';
import { Avatar } from './ui/avatar';
import { Belt } from './ui/belt';
import { fullName, humanize, initials } from '../lib/format';

export function AthleteCard({ athlete }: { athlete: AthleteSummary }) {
  const affiliation = [athlete.academyName ?? 'Unaffiliated', athlete.country]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/athletes/${athlete.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-line/10 bg-surface p-5 shadow-card transition-all hover:-translate-y-1 hover:border-line/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Avatar initials={initials(athlete.firstName, athlete.lastName)} size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg font-bold tracking-tight transition-colors group-hover:text-accent">
          {fullName(athlete.firstName, athlete.lastName)}
        </h3>
        <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          {affiliation}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <Belt rank={athlete.beltRank} showLabel={false} />
          <span className="text-xs text-muted">
            {humanize(athlete.beltRank)} · {humanize(athlete.discipline)}
          </span>
        </div>
      </div>
      <span
        className="shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
