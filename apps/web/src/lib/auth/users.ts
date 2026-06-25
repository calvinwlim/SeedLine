import type { UserRole } from '@seedline/types';

/** A demo identity you can sign in as. Standalone auth has no real backend, so
 *  these personas stand in for accounts of each role. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Linked athlete profile id, when the user competes. */
  athleteId: string | null;
  /** Linked organizer id, when the user runs events. */
  organizerId: string | null;
  blurb: string;
}

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'usr_athlete',
    name: 'Yara Haddad',
    email: 'yara@seedline.dev',
    role: 'athlete',
    athleteId: 'ath_haddad',
    organizerId: null,
    blurb: 'Compete: register for events, track your record and registrations.',
  },
  {
    id: 'usr_organizer',
    name: 'André Galvão',
    email: 'andre@seedline.dev',
    role: 'organizer',
    athleteId: null,
    organizerId: 'org_seedline',
    blurb: 'Organize: create events, manage divisions, and view registrations.',
  },
  {
    id: 'usr_staff',
    name: 'Mat Staff',
    email: 'staff@seedline.dev',
    role: 'staff',
    athleteId: null,
    organizerId: null,
    blurb: 'Run the day: open mat control and score matches at the table.',
  },
];

export function findUser(id: string | null | undefined): AuthUser | null {
  if (!id) return null;
  return DEMO_USERS.find((u) => u.id === id) ?? null;
}
