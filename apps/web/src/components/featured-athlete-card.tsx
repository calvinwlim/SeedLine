import Link from 'next/link';
import type { AthleteSummary } from '@seedline/types';
import { Belt } from './ui/belt';
import { fullName, humanize, initials } from '../lib/format';

/** A large spotlight card for the lead athlete on the directory. */
export function FeaturedAthleteCard({ athlete }: { athlete: AthleteSummary }) {
  const affiliation = [athlete.academyName ?? 'Unaffiliated', athlete.country]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/athletes/${athlete.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-line/10 bg-surface shadow-card transition-all hover:-translate-y-1 hover:border-line/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:grid-cols-[300px_1fr]"
    >
      {/* Cover: oversized photo or monogram + belt */}
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 bg-elevated p-8">
        <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-accent/25 to-corner/15 font-display text-4xl font-bold text-chalk ring-1 ring-inset ring-line/10">
          {athlete.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary host; plain img avoids next/image domain config.
            <img src={athlete.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(athlete.firstName, athlete.lastName)
          )}
        </span>
        <Belt rank={athlete.beltRank} />
      </div>

      {/* Details */}
      <div className="flex flex-col justify-center p-8">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
          Featured athlete
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight transition-colors group-hover:text-accent">
          {fullName(athlete.firstName, athlete.lastName)}
        </h2>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          {affiliation}
        </p>
        <p className="mt-4 text-muted">
          {humanize(athlete.beltRank)} belt · {humanize(athlete.discipline)}
        </p>
        <span className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent">
          View profile
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}
