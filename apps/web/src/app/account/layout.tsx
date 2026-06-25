'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '../../components/ui/container';
import { AuthGate } from '../../components/auth/auth-gate';
import { cn } from '../../lib/cn';

const TABS = [
  { href: '/account', label: 'Dashboard' },
  { href: '/account/registrations', label: 'Registrations' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/settings', label: 'Settings' },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGate>
      <main>
        <div className="border-b border-line/10 bg-surface">
          <Container className="pt-12">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Account
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Your account
            </h1>
            <p className="mt-3 text-muted">Manage your registrations, profile, and settings.</p>
            <nav className="mt-7 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((tab) => {
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors',
                      active
                        ? 'bg-accent text-white'
                        : 'border border-line/15 text-muted hover:border-line/40 hover:text-chalk',
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </Container>
        </div>
        <Container className="py-10">{children}</Container>
      </main>
    </AuthGate>
  );
}
