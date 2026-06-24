'use client';

import { cn } from '../../lib/cn';
import { useCountUp } from '../../lib/use-count-up';

type Accent = 'gold' | 'win' | 'corner' | 'plain';

const ACCENT: Record<Accent, string> = {
  gold: 'text-accent',
  win: 'text-win',
  corner: 'text-corner',
  plain: 'text-chalk',
};

/** A sporty metric tile with a big animated number and an uppercase label. */
export function StatTile({
  label,
  value,
  suffix,
  accent = 'plain',
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: Accent;
  className?: string;
}) {
  const display = useCountUp(value);
  return (
    <div
      className={cn(
        'rounded-xl border border-line/10 bg-surface px-4 py-3.5 shadow-card',
        className,
      )}
    >
      <div className={cn('font-display text-[26px] font-bold leading-none', ACCENT[accent])}>
        {display}
        {suffix}
      </div>
      <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}
