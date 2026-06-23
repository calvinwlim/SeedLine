import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'gold' | 'green' | 'red' | 'muted' | 'outline';

const TONES: Record<Tone, string> = {
  gold: 'bg-podium/15 text-podium ring-1 ring-inset ring-podium/30',
  green: 'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30',
  red: 'bg-corner/15 text-corner ring-1 ring-inset ring-corner/30',
  muted: 'bg-line/5 text-muted ring-1 ring-inset ring-line/10',
  outline: 'text-chalk ring-1 ring-inset ring-line/20',
};

export function Badge({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
