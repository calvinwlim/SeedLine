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
  // The tip bar echoes a folded belt. Black belts get the classic red "professor"
  // bar so they don't render as an indistinct black block.
  const tipColor = rank === 'black' ? '#c2342f' : 'rgba(0,0,0,0.78)';
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className="relative inline-block h-3.5 w-10 overflow-hidden rounded-[3px] ring-1 ring-inset ring-line/25"
        style={{ backgroundColor: beltColor(rank) }}
        aria-hidden="true"
      >
        <span
          className="absolute right-2 top-0 h-full w-2.5"
          style={{ backgroundColor: tipColor }}
        />
      </span>
      {showLabel && <span className="text-sm">{humanize(rank)} belt</span>}
    </span>
  );
}
