'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '../../components/ui/container';
import { Card, CardBody } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
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
    <Container size="narrow" className="py-14">
      <h1 className="font-display text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-muted">
        OpenMat runs standalone for development, so pick a demo identity to explore each role.
        {user && (
          <>
            {' '}
            You&apos;re currently signed in as <span className="text-chalk">{user.name}</span>.
          </>
        )}
      </p>

      <div className="mt-8 space-y-3">
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
                className={`transition-colors hover:border-podium/50 ${active ? 'border-podium/60' : ''}`}
              >
                <CardBody className="flex items-center gap-4">
                  <Avatar initials={initials(first, last)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base font-bold">{demo.name}</p>
                      <Badge tone="outline">{humanize(demo.role)}</Badge>
                      {active && <Badge tone="green">Current</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">{demo.blurb}</p>
                  </div>
                  <span className="shrink-0 text-muted">→</span>
                </CardBody>
              </Card>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted">
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
