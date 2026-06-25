import Link from 'next/link';
import type { AcademySummary } from '@openmat/types';
import { Avatar } from './ui/avatar';

export function AcademyCard({ academy }: { academy: AcademySummary }) {
  const location = [academy.city, academy.country].filter(Boolean).join(' · ') || 'Location TBA';
  const initials = academy.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <Link
      href={`/academies/${academy.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-line/10 bg-surface p-5 shadow-card transition-all hover:-translate-y-1 hover:border-line/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Avatar initials={initials} size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg font-bold tracking-tight transition-colors group-hover:text-accent">
          {academy.name}
        </h3>
        <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          {location}
        </p>
        <p className="mt-2 text-xs text-muted">{academy.memberCount} members</p>
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
