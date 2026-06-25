'use client';

export interface ActiveFilterItem {
  key: string;
  label: string;
  onRemove: () => void;
}

/**
 * The removable "active filter" chips + clear-all that sit under a filter bar,
 * mirroring the faceted-search pattern on commerce/directory sites.
 */
export function ActiveFilters({
  items,
  onClearAll,
}: {
  items: ActiveFilterItem[];
  onClearAll: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.15em] text-faint">
        Active
      </span>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          {item.label}
          <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-bold uppercase tracking-wide text-muted underline-offset-2 transition-colors hover:text-chalk hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
