import { pgEnum } from 'drizzle-orm/pg-core';

// These mirror @seedline/types. Keep both in sync; the database is the source of truth.
export const userRoleEnum = pgEnum('user_role', ['athlete', 'organizer', 'staff', 'admin']);
export const disciplineEnum = pgEnum('discipline', ['gi', 'nogi']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'mixed']);
export const beltRankEnum = pgEnum('belt_rank', [
  'white',
  'gray',
  'yellow',
  'orange',
  'green',
  'blue',
  'purple',
  'brown',
  'black',
]);
export const rulesetEnum = pgEnum('ruleset', ['ibjjf', 'adcc', 'ebi', 'submission_only', 'points']);
export const bracketFormatEnum = pgEnum('bracket_format', [
  'single_elimination',
  'double_elimination',
  'round_robin',
]);
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled',
]);
export const registrationStatusEnum = pgEnum('registration_status', [
  'pending',
  'confirmed',
  'waitlisted',
  'withdrawn',
  'checked_in',
]);
export const bracketStatusEnum = pgEnum('bracket_status', [
  'not_generated',
  'generated',
  'in_progress',
  'completed',
]);
export const matchStatusEnum = pgEnum('match_status', [
  'pending',
  'ready',
  'in_progress',
  'completed',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'refunded',
  'failed',
]);
