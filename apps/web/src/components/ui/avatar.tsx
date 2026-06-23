import { cn } from '../../lib/cn';

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
} as const;

/** A circular monogram avatar. Falls back to initials (no image dependency). */
export function Avatar({
  initials,
  size = 'md',
  className,
}: {
  initials: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-podium/30 to-corner/20 font-display font-bold text-chalk ring-1 ring-inset ring-line/15',
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
