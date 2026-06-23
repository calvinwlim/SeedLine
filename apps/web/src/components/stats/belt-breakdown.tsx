import type { BeltSegment } from '../../lib/gamify';
import { beltColor, humanize } from '../../lib/format';

/** A stacked bar showing a team's belt composition, with a labelled legend. */
export function BeltBreakdown({ segments }: { segments: BeltSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) {
    return <p className="text-sm text-muted">No belt data yet.</p>;
  }

  return (
    <div className="rounded-xl border border-line/10 bg-surface p-5 shadow-card">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.rank}
            style={{ width: `${(s.count / total) * 100}%`, backgroundColor: beltColor(s.rank) }}
            title={`${humanize(s.rank)} · ${s.count}`}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((s) => (
          <span key={s.rank} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/20"
              style={{ backgroundColor: beltColor(s.rank) }}
              aria-hidden="true"
            />
            <span className="text-muted">{humanize(s.rank)}</span>
            <span className="font-display font-bold text-chalk">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
