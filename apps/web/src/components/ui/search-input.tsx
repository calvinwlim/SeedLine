'use client';

import { cn } from '../../lib/cn';

/** A controlled search box used by the directory pages. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-line/10 bg-surface py-2.5 pl-10 pr-3 text-sm text-chalk placeholder:text-muted focus:border-accent/50 focus:outline-none"
      />
    </div>
  );
}

/** A simple select styled to match the search box. */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T | '';
  onChange: (value: T | '') => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T | '')}
      className={cn(
        'rounded-md border border-line/10 bg-surface px-3 py-2.5 text-sm text-chalk focus:border-accent/50 focus:outline-none',
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-surface">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
