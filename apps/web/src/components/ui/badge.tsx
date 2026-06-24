import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'gold' | 'green' | 'red' | 'muted' | 'outline';

const TONES: Record<Tone, string> = {
  gold: 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/30',
  green: 'bg-win/15 text-win ring-1 ring-inset ring-win/30',
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
