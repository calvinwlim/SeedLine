import Link from 'next/link';
import type { AthleteSummary } from '@openmat/types';
import { Avatar } from './ui/avatar';
import { Belt } from './ui/belt';
import { fullName, humanize, initials } from '../lib/format';

export function AthleteCard({ athlete }: { athlete: AthleteSummary }) {
  return (
    <Link
      href={`/athletes/${athlete.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-line/10 bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-podium/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-podium"
    >
      <Avatar initials={initials(athlete.firstName, athlete.lastName)} />
      <div className="min-w-0">
        <h3 className="truncate font-display text-base font-bold group-hover:text-chalk">
          {fullName(athlete.firstName, athlete.lastName)}
        </h3>
        <p className="truncate text-sm text-muted">
          {athlete.academyName ?? 'Unaffiliated'} · {humanize(athlete.discipline)}
        </p>
        <div className="mt-2">
          <Belt rank={athlete.beltRank} />
        </div>
      </div>
    </Link>
  );
}
