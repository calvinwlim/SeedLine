import Link from 'next/link';

const COLUMNS = [
  {
    heading: 'Compete',
    links: [
      { href: '/events', label: 'Find events' },
      { href: '/academies', label: 'Academies' },
      { href: '/athletes', label: 'Athletes' },
    ],
  },
  {
    heading: 'Organize',
    links: [
      { href: '/account', label: 'Your account' },
      { href: '/events', label: 'Host an event' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <span className="font-display text-lg font-bold tracking-tight">
            open<span className="text-podium">mat</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Tournament and competition management for grappling and combat sports — built to keep
            working when the venue Wi-Fi doesn&apos;t.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h3 className="font-display text-sm font-semibold text-chalk">{col.heading}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-chalk"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} OpenMat. All rights reserved.</span>
          <span>Three rulesets, offline-first scoring, one source of truth.</span>
        </div>
      </div>
    </footer>
  );
}
