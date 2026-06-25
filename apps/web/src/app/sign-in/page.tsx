'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '../../components/ui/container';
import { Card, CardBody } from '../../components/ui/card';
import { Avatar } from '../../components/ui/avatar';
import { useAuth } from '../../lib/auth/auth-context';
import { DEMO_USERS } from '../../lib/auth/users';
import { humanize, initials } from '../../lib/format';

function SignInForm() {
  const { signIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/account';

  function choose(id: string) {
    signIn(id);
    router.push(next);
  }

  return (
    <Container size="narrow" className="py-16">
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
        Account access
      </p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">Sign in</h1>
      <p className="mt-4 max-w-md text-muted">
        SeedLine runs standalone for development, so pick a demo identity to explore each role.
        {user && (
          <>
            {' '}
            You&apos;re currently signed in as <span className="text-chalk">{user.name}</span>.
          </>
        )}
      </p>

      <div className="mt-10 space-y-3">
        {DEMO_USERS.map((demo) => {
          const [first = '', last = ''] = demo.name.split(' ');
          const active = user?.id === demo.id;
          return (
            <button
              key={demo.id}
              type="button"
              onClick={() => choose(demo.id)}
              className="w-full text-left"
            >
              <Card
                className={`transition-all hover:-translate-y-0.5 hover:border-line/25 ${active ? 'border-accent/60' : ''}`}
              >
                <CardBody className="flex items-center gap-4">
                  <Avatar initials={initials(first, last)} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                      {humanize(demo.role)}
                      {active ? ' · Current' : ''}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold tracking-tight">
                      {demo.name}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">{demo.blurb}</p>
                  </div>
                  <span className="shrink-0 text-muted transition-all group-hover:text-accent">
                    →
                  </span>
                </CardBody>
              </Card>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-muted">
        Demo sign-in — no password required. Real authentication is the next backend step.
      </p>
    </Container>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-14">
          <div className="h-64 animate-pulse rounded-lg border border-line/10 bg-surface" />
        </Container>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
