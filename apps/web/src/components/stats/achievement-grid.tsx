import type { Achievement, BadgeIcon } from '../../lib/gamify';
import { cn } from '../../lib/cn';

const TONE: Record<Achievement['tone'], { bg: string; fg: string }> = {
  gold: { bg: 'bg-accent/15', fg: 'text-accent' },
  win: { bg: 'bg-win/15', fg: 'text-win' },
  corner: { bg: 'bg-corner/15', fg: 'text-corner' },
};

function Glyph({ icon }: { icon: BadgeIcon }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true } as const;
  switch (icon) {
    case 'flame':
      return (
        <svg {...common}>
          <path
            d="M12 3c3 3.3 4.6 5.4 4.6 8.4a4.6 4.6 0 1 1-9.2 0c0-1.5.6-2.7 1.6-3.6.2 1.2.9 1.8 1.7 2-.3-2.4.4-4.7 1.3-6.8z"
            fill="currentColor"
          />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 4h10v4a5 5 0 0 1-10 0z" strokeLinejoin="round" />
          <path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M12 13v3M9 20h6M10 20l.5-4h3l.5 4" />
        </svg>
      );
    case 'medal':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 3l3 6 3-6" strokeLinejoin="round" />
          <circle cx="12" cy="15" r="5.5" />
          <path
            d="M12 12.5l.9 1.8 2 .2-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.2z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path
            d="M12 3 5 5.6v5.2c0 4.2 2.9 7.6 7 8.7 4.1-1.1 7-4.5 7-8.7V5.6z"
            fill="currentColor"
          />
        </svg>
      );
    case 'belt':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="9.5" width="18" height="5" rx="1" />
          <rect x="9.5" y="8" width="5" height="8" rx="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'target':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.6" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'crown':
      return (
        <svg {...common}>
          <path d="M3 8l3.5 3.5L12 5l5.5 6.5L21 8l-2 11H5z" fill="currentColor" />
        </svg>
      );
  }
}

function Badge({ a }: { a: Achievement }) {
  const tone = TONE[a.tone];
  const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-surface px-3.5 py-3 shadow-card transition-transform',
        a.earned ? 'border-line/10 hover:-translate-y-0.5' : 'border-line/10 opacity-70',
      )}
    >
      <span
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-full',
          a.earned ? `${tone.bg} ${tone.fg}` : 'bg-elevated text-faint',
        )}
      >
        {a.earned ? (
          <Glyph icon={a.icon} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 10V8a5 5 0 0 1 10 0v2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <rect x="5" y="10" width="14" height="9" rx="2" fill="currentColor" />
          </svg>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cn('truncate text-sm font-semibold', a.earned ? 'text-chalk' : 'text-muted')}
        >
          {a.label}
        </div>
        {a.earned ? (
          <div className="truncate text-[11px] text-muted">{a.description}</div>
        ) : a.progress ? (
          <div className="mt-1.5">
            <div className="h-1 overflow-hidden rounded-full bg-elevated">
              <div
                className={cn('h-full rounded-full', tone.bg.replace('/15', ''))}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-faint">
              {a.progress.current} / {a.progress.target}
            </div>
          </div>
        ) : (
          <div className="truncate text-[11px] text-faint">{a.description}</div>
        )}
      </div>
    </div>
  );
}

/** The collectible achievement wall on a competitor profile. */
export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  const earned = achievements.filter((a) => a.earned).length;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Achievements</h2>
        <span className="text-sm text-muted">
          {earned} of {achievements.length} unlocked
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.map((a) => (
          <Badge key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}
