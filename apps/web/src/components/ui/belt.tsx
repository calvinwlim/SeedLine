import type { BeltRank } from '@openmat/types';
import { beltColor, humanize } from '../../lib/format';
import { cn } from '../../lib/cn';

/**
 * A small belt indicator: a colored bar with the classic black tip stripe,
 * echoing a folded jiu-jitsu belt. Label optional.
 */
export function Belt({
  rank,
  showLabel = true,
  className,
}: {
  rank: BeltRank;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className="relative inline-block h-3 w-9 rounded-sm ring-1 ring-inset ring-black/30"
        style={{ backgroundColor: beltColor(rank) }}
        aria-hidden="true"
      >
        <span className="absolute right-1.5 top-0 h-full w-2 rounded-sm bg-black/80" />
      </span>
      {showLabel && <span className="text-sm">{humanize(rank)} belt</span>}
    </span>
  );
}
