'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../lib/auth/auth-context';

const BASE_NAV = [
  { href: '/events', label: 'Events' },
  { href: '/academies', label: 'Academies' },
  { href: '/athletes', label: 'Athletes' },
];

function Wordmark() {
  return (
    <Link href="/" className="font-display text-lg font-bold tracking-tight">
      open<span className="text-podium">mat</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, ready, signOut } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const canOrganize = user?.role === 'organizer' || user?.role === 'admin';
  const nav = canOrganize ? [...BASE_NAV, { href: '/organizer', label: 'Organize' }] : BASE_NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors hover:text-chalk',
                  isActive(item.href) ? 'text-chalk' : 'text-muted',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {ready && user ? (
            <>
              <Link
                href="/account"
                className={cn(
                  'text-sm transition-colors hover:text-chalk',
                  isActive('/account') ? 'text-chalk' : 'text-muted',
                )}
              >
                {user.name}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-chalk transition-colors hover:border-white/40"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-md bg-podium px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-chalk md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-6 py-3 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block py-2 text-sm transition-colors hover:text-chalk',
                isActive(item.href) ? 'text-chalk' : 'text-muted',
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-white/10 pt-2">
            {ready && user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-muted hover:text-chalk"
                >
                  Account ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="block py-2 text-sm text-muted hover:text-chalk"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-muted hover:text-chalk"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
