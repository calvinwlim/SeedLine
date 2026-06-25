import { cn } from '../../lib/cn';

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
} as const;

/**
 * A circular profile avatar. Shows the photo at `src` when one is set, and
 * otherwise falls back to an initials monogram (so the UI never depends on an
 * uploaded image).
 */
export function Avatar({
  initials,
  src,
  size = 'md',
  className,
}: {
  initials: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent/30 to-corner/20 font-display font-bold text-chalk ring-1 ring-inset ring-line/15',
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary hosts; plain img avoids next/image domain config.
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
