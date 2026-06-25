'use client';

import { cn } from '../../lib/cn';

interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * A labelled row of pill toggles — the directory filter pattern from sportswear
 * sites, in place of a generic dropdown. The empty-string value reads as "all".
 */
export function SegmentedFilter<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {label && (
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.15em] text-faint">
          {label}
        </span>
      )}
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors',
              active
                ? 'bg-accent text-white'
                : 'border border-line/15 text-muted hover:border-line/40 hover:text-chalk',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
