import Link from 'next/link';
import type { AcademySummary } from '@openmat/types';
import { Avatar } from './ui/avatar';

export function AcademyCard({ academy }: { academy: AcademySummary }) {
  const location = [academy.city, academy.country].filter(Boolean).join(', ') || 'Location TBA';
  const initials = academy.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <Link
      href={`/academies/${academy.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-line/10 bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-podium/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-podium"
    >
      <Avatar initials={initials} />
      <div className="min-w-0">
        <h3 className="truncate font-display text-base font-bold group-hover:text-chalk">
          {academy.name}
        </h3>
        <p className="truncate text-sm text-muted">{location}</p>
        <p className="mt-1 text-xs text-muted">{academy.memberCount} members</p>
      </div>
    </Link>
  );
}
