import type { MedalCounts } from '../../lib/gamify';

const TIERS = [
  { key: 'gold' as const, label: 'Gold', color: '#D9A521' },
  { key: 'silver' as const, label: 'Silver', color: '#9AA3AD' },
  { key: 'bronze' as const, label: 'Bronze', color: '#B07A41' },
];

function MedalDisc({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 2h7l-2.2 6h-2.6z" fill={color} opacity="0.55" />
      <circle cx="12" cy="15" r="6.5" fill={color} />
      <circle cx="12" cy="15" r="6.5" fill="none" stroke="#000" strokeOpacity="0.18" />
      <circle cx="12" cy="15" r="3" fill="#000" fillOpacity="0.12" />
    </svg>
  );
}

/** The gold / silver / bronze trophy shelf shown on competitor and team profiles. */
export function MedalShelf({ medals }: { medals: MedalCounts }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TIERS.map((tier) => (
        <div
          key={tier.key}
          className="flex items-center gap-3 rounded-xl border border-line/10 bg-surface px-4 py-3 shadow-card"
        >
          <MedalDisc color={tier.color} />
          <div>
            <div className="font-display text-xl font-bold leading-none text-chalk">
              {medals[tier.key]}
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
              {tier.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
