'use client';

import type { ReactNode } from 'react';
import { AuthGate } from '../../components/auth/auth-gate';

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return <AuthGate roles={['organizer', 'admin']}>{children}</AuthGate>;
}
