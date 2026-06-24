import { cn } from '../../lib/cn';

/**
 * A seamless scrolling ticker for brand statements — the kinetic type strip you
 * see across elite sportswear sites. Decorative (aria-hidden); pauses on hover.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  // Rendered twice so a -50% translate loops without a visible seam.
  const sequence = [...items, ...items];
  return (
    <div className={cn('marquee select-none', className)} aria-hidden="true">
      <div className="marquee-track">
        {sequence.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] sm:text-base">
              {item}
            </span>
            <span className="text-current opacity-40">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
