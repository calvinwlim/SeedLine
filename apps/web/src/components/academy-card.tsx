import Link from 'next/link';
import type { AcademySummary } from '@seedline/types';

/** Faint bracket motif reused as the banner texture when no image is set. */
function BannerLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2">
        <path d="M8 24 H56 V52 H104" />
        <path d="M8 80 H56 V52" />
        <path d="M104 52 H152 V80 H198" />
        <path d="M104 108 H152 V80" />
      </g>
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/**
 * Academy directory card: a banner (uploaded image, or the house bracket motif
 * when none is set) with the team crest straddling it, then the name, location,
 * and member count. Larger than the athlete card — academies are the headline.
 */
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
      className="group block overflow-hidden rounded-2xl border border-line/10 bg-surface shadow-card transition-all hover:-translate-y-1 hover:border-line/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Banner */}
      <div className="relative h-28 w-full overflow-hidden bg-elevated">
        {academy.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary host; plain img avoids next/image domain config.
          <img src={academy.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-accent/5 to-transparent" />
            <BannerLines className="absolute -right-3 -top-2 w-44 text-line/[0.12]" />
          </>
        )}
      </div>

      {/* Body — raised above the (positioned) banner so the crest overlaps it
          rather than being painted over by it. */}
      <div className="relative z-10 p-5 pt-0">
        {/* Team crest straddles the banner edge */}
        <span className="-mt-9 mb-3 grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-surface font-display text-lg font-bold text-chalk shadow-card ring-4 ring-surface">
          {academy.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary host; plain img avoids next/image domain config.
            <img src={academy.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center rounded-[inherit] bg-gradient-to-br from-accent/30 to-corner/20">
              {initials}
            </span>
          )}
        </span>

        <h3 className="truncate font-display text-xl font-bold tracking-tight transition-colors group-hover:text-accent">
          {academy.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          <PinIcon className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="truncate">{location}</span>
        </p>

        <div className="my-4 h-px w-full bg-line/10" />

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-none tabular-nums">
              {academy.memberCount}
            </span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
              Members
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
            View academy
            <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
