import { cn } from '../../lib/cn';

/**
 * A frosted "live scoreboard" panel for the hero — the product's matside scoring
 * screen, reduced to a glance. Static, representative data (not a real feed): it
 * exists to *show* the scoring surface, not to report a score. Reuses the
 * semantic glass recipe (surface/70 + backdrop-blur) so it reads on both themes.
 */

type Fighter = {
  name: string;
  academy: string;
  seed: number;
  points: number;
  adv: number;
  pen: number;
  leading?: boolean;
};

const BOUT: { mat: string; division: string; clock: string; fighters: [Fighter, Fighter] } = {
  mat: 'Mat 2',
  division: 'Black · Adult · −76kg',
  clock: '4:32',
  fighters: [
    {
      name: 'M. Dias',
      academy: 'Alliance HQ',
      seed: 1,
      points: 6,
      adv: 2,
      pen: 0,
      leading: true,
    },
    { name: 'K. Watanabe', academy: 'Carpe Diem', seed: 4, points: 4, adv: 1, pen: 1 },
  ],
};

function ScoreCell({ value, label, tone }: { value: number; label: string; tone?: 'pen' }) {
  return (
    <div className="text-center">
      <div
        className={cn(
          'font-display text-base font-bold tabular-nums leading-none',
          tone === 'pen' && value > 0 ? 'text-corner' : 'text-chalk',
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-faint">
        {label}
      </div>
    </div>
  );
}

function FighterRow({ fighter }: { fighter: Fighter }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
        fighter.leading ? 'bg-accent/10' : 'bg-transparent',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums',
          fighter.leading ? 'bg-accent text-white' : 'bg-elevated text-muted',
        )}
      >
        {fighter.seed}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-bold leading-tight">{fighter.name}</div>
        <div className="truncate text-[11px] text-muted">{fighter.academy}</div>
      </div>
      <div className="flex items-center gap-3">
        <ScoreCell value={fighter.adv} label="Adv" />
        <ScoreCell value={fighter.pen} label="Pen" tone="pen" />
        <div className="ml-1 w-9 text-right font-display text-3xl font-bold tabular-nums leading-none">
          {fighter.points}
        </div>
      </div>
    </div>
  );
}

export function LiveMatchCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line/10 bg-surface/70 p-5 shadow-pop backdrop-blur-xl',
        className,
      )}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-win" />
          </span>
          Live · {BOUT.mat}
        </span>
        <span className="font-display text-sm font-bold tabular-nums tracking-tight">
          {BOUT.clock}
        </span>
      </div>

      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
        {BOUT.division}
      </p>

      {/* Fighters */}
      <div className="mt-4 space-y-1.5">
        <FighterRow fighter={BOUT.fighters[0]} />
        <FighterRow fighter={BOUT.fighters[1]} />
      </div>

      {/* Footer: ruleset + offline guarantee */}
      <div className="mt-4 flex items-center justify-between border-t border-line/10 pt-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
          IBJJF ruleset
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-win">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M5 12.5 10 17.5 19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Saved offline
        </span>
      </div>
    </div>
  );
}
