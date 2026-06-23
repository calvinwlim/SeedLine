'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { UserRole } from '@openmat/types';
import { useAuth } from '../../lib/auth/auth-context';
import { Container } from '../ui/container';
import { EmptyState } from '../ui/card';
import { ButtonLink } from '../ui/button';
import { humanize } from '../../lib/format';

/**
 * Gates its children behind sign-in and (optionally) a set of roles. Signed-out
 * users are redirected to /sign-in with a `next` param; wrong-role users get a
 * friendly not-authorized message rather than a redirect loop.
 */
export function AuthGate({ roles, children }: { roles?: UserRole[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return (
      <Container className="py-12">
        <div className="h-40 animate-pulse rounded-lg border border-line/10 bg-surface" />
      </Container>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Not authorized"
          description={`This area needs ${roles.map(humanize).join(' or ')} access. You're signed in as ${user.name} (${humanize(user.role)}).`}
          action={<ButtonLink href="/sign-in">Switch account</ButtonLink>}
        />
      </Container>
    );
  }

  return <>{children}</>;
}
