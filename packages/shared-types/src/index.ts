/**
 * @openmat/types
 *
 * Shared domain vocabulary. These enums mirror the database schema and are the
 * single source of truth for valid values across the API and the web app.
 * Keep them in lockstep with apps/api/src/database/schema.
 */

export const DISCIPLINES = ['gi', 'nogi'] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export const GENDERS = ['male', 'female', 'mixed'] as const;
export type Gender = (typeof GENDERS)[number];

export const BELT_RANKS = [
  'white',
  'gray',
  'yellow',
  'orange',
  'green',
  'blue',
  'purple',
  'brown',
  'black',
] as const;
export type BeltRank = (typeof BELT_RANKS)[number];

export const RULESETS = ['ibjjf', 'adcc', 'ebi', 'submission_only', 'points'] as const;
export type Ruleset = (typeof RULESETS)[number];

export const BRACKET_FORMATS = [
  'single_elimination',
  'double_elimination',
  'round_robin',
] as const;
export type BracketFormat = (typeof BRACKET_FORMATS)[number];

export const EVENT_STATUSES = [
  'draft',
  'published',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const REGISTRATION_STATUSES = [
  'pending',
  'confirmed',
  'waitlisted',
  'withdrawn',
  'checked_in',
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const MATCH_STATUSES = ['pending', 'ready', 'in_progress', 'completed'] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'succeeded', 'refunded', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const USER_ROLES = ['athlete', 'organizer', 'staff', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Minimal event shape returned by the public events list endpoint. */
export interface EventSummary {
  id: string;
  slug: string;
  name: string;
  venueName: string | null;
  city: string | null;
  startDate: string;
  endDate: string;
  status: EventStatus;
}

/** Standard error envelope returned by the API. */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
