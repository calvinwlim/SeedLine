'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSessionUser, setSessionUserId } from './session';
import type { AuthUser } from './users';

interface AuthContextValue {
  user: AuthUser | null;
  /** False until the session has been read from storage (avoids flicker/redirects). */
  ready: boolean;
  signIn: (userId: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setUser(getSessionUser());
    setReady(true);
  }, []);

  function signIn(userId: string) {
    setSessionUserId(userId);
    setUser(getSessionUser());
    // Identity changed — drop cached "me" data so it refetches for the new user.
    queryClient.invalidateQueries();
  }

  function signOut() {
    setSessionUserId(null);
    setUser(null);
    queryClient.invalidateQueries();
  }

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
