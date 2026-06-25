import { currentAccountAthleteId } from '../mock/data';
import { findUser, type AuthUser } from './users';

/**
 * The signed-in user is the single source of truth shared by the auth context
 * (React state) and the mock API client (which needs to know who "me" is). It is
 * an in-memory value mirrored to localStorage so a refresh keeps you signed in.
 */

const STORAGE_KEY = 'seedline.session.userId';

// `undefined` = not yet hydrated from storage; `null` = signed out.
let currentUserId: string | null | undefined;

function hydrate(): string | null {
  if (currentUserId !== undefined) return currentUserId;
  if (typeof window === 'undefined') return null;
  currentUserId = window.localStorage.getItem(STORAGE_KEY);
  return currentUserId;
}

export function setSessionUserId(id: string | null): void {
  currentUserId = id;
  if (typeof window === 'undefined') return;
  if (id) window.localStorage.setItem(STORAGE_KEY, id);
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function getSessionUser(): AuthUser | null {
  return findUser(hydrate());
}

/** The athlete id for the signed-in user, falling back to the demo athlete. */
export function getSessionAthleteId(): string {
  return getSessionUser()?.athleteId ?? currentAccountAthleteId;
}
