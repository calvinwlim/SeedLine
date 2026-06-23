'use client';

import { useEffect, useState } from 'react';
import { useCountUp } from '../../lib/use-count-up';

/**
 * A circular win-rate gauge. The arc sweeps in on mount and the percentage
 * counts up, giving the headline number a satisfying reveal.
 */
export function WinRateRing({
  value,
  size = 140,
  label = 'Win rate',
  sub,
}: {
  value: number;
  size?: number;
  label?: string;
  sub?: string;
}) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const pct = useCountUp(value);
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const target = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
    if (reduce) {
      setOffset(target);
      return;
    }
    const id = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(id);
  }, [value, circumference]);

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 132 132"
        role="img"
        aria-label={`${label} ${value} percent`}
      >
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke="rgb(var(--line) / 0.16)"
          strokeWidth="11"
        />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke="rgb(var(--win))"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 66 66)"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-[30px] font-bold leading-none text-chalk">{pct}%</div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
            {label}
          </div>
          {sub && <div className="mt-0.5 text-[11px] text-faint">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
