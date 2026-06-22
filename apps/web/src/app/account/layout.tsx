'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '../../components/ui/container';
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
    <main>
      <div className="border-b border-white/10 bg-surface/40">
        <Container className="pt-10">
          <h1 className="font-display text-3xl font-bold">Your account</h1>
          <p className="mt-2 text-muted">Manage your registrations, profile, and settings.</p>
          <nav className="mt-6 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors',
                    active
                      ? 'border-podium text-chalk'
                      : 'border-transparent text-muted hover:text-chalk',
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
  );
}
