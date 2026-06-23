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

export const BRACKET_FORMATS = ['single_elimination', 'double_elimination', 'round_robin'] as const;
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

/** A geographic point. Used for maps and distance search. */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Minimal event shape returned by the public events list endpoint.
 *
 * The required fields are what the API guarantees today; the optional fields
 * are progressive enhancements the directory/cards use when present. Keeping
 * them optional lets the API fill in a subset without breaking the contract.
 */
export interface EventSummary {
  id: string;
  slug: string;
  name: string;
  venueName: string | null;
  city: string | null;
  startDate: string;
  endDate: string;
  status: EventStatus;
  country?: string | null;
  coordinates?: Coordinates | null;
  coverImageUrl?: string | null;
  disciplines?: Discipline[];
  rulesets?: Ruleset[];
  divisionCount?: number;
  registeredCount?: number;
  startingPriceCents?: number;
}

/** A short reference to an organizer (the entity that runs an event). */
export interface OrganizerSummary {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

/** A single competition slot within an event. */
export interface DivisionSummary {
  id: string;
  name: string;
  discipline: Discipline;
  gender: Gender;
  beltRank: BeltRank | null;
  ageCategory: string | null;
  weightClass: string | null;
  ruleset: Ruleset;
  format: BracketFormat;
  priceCents: number;
  capacity: number | null;
  registeredCount: number;
}

/** Full event detail used by the event page. */
export interface EventDetail extends EventSummary {
  description: string;
  address: string | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  organizer: OrganizerSummary;
  divisions: DivisionSummary[];
  scheduleNote?: string | null;
}

/** A short reference to a competitor. */
export interface AthleteSummary {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  beltRank: BeltRank;
  discipline: Discipline;
  academyId: string | null;
  academyName: string | null;
  academySlug: string | null;
  country: string | null;
  avatarUrl?: string | null;
}

/** A competitor's aggregate competition record. */
export interface AthleteRecord {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  submissions: number;
  goldMedals: number;
}

/** A podium result an athlete or academy earned at an event. */
export interface MedalResult {
  eventName: string;
  eventSlug: string;
  divisionName: string;
  place: number;
  date: string;
}

/** Full competitor profile used by the athlete page. */
export interface AthleteProfile extends AthleteSummary {
  bio: string | null;
  weightClass: string | null;
  ageCategory: string | null;
  record: AthleteRecord;
  registrations: RegistrationSummary[];
  achievements: MedalResult[];
}

/** A short reference to an academy/team. */
export interface AcademySummary {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  country: string | null;
  logoUrl?: string | null;
  memberCount: number;
}

/** Full academy profile used by the academy page. */
export interface AcademyDetail extends AcademySummary {
  description: string;
  headCoach: string | null;
  foundedYear: number | null;
  affiliation: string | null;
  website: string | null;
  coordinates: Coordinates | null;
  athletes: AthleteSummary[];
  achievements: MedalResult[];
}

/** One row in a user's registration history. */
export interface RegistrationSummary {
  id: string;
  eventId: string;
  eventName: string;
  eventSlug: string;
  divisionName: string;
  status: RegistrationStatus;
  startDate: string;
  city: string | null;
}

/** A competitor placed into a division's bracket. */
export interface BracketEntrant {
  id: string;
  name: string;
  seed: number;
  academyId: string | null;
  academyName: string | null;
}

/** A division with its entrant list, used to generate and show a bracket. */
export interface DivisionDetail extends DivisionSummary {
  eventId: string;
  eventSlug: string;
  eventName: string;
  entrants: BracketEntrant[];
  /** True once the event is complete and results can be shown. */
  resultsFinal: boolean;
}

/** Payload submitted when an athlete registers for a division. */
export interface RegistrationInput {
  eventId: string;
  divisionId: string;
  firstName: string;
  lastName: string;
  beltRank: BeltRank;
  academyName: string | null;
  weightClass: string | null;
}

/** The signed-in user's account, with the linked athlete profile when present. */
export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  memberSince: string;
  avatarUrl?: string | null;
  athlete: AthleteProfile | null;
}

/** Query parameters accepted by the public events list endpoint. */
export interface EventListQuery {
  search?: string;
  discipline?: Discipline;
  status?: EventStatus;
  country?: string;
}

/** An organizer profile with aggregate stats, for the organizer dashboard. */
export interface OrganizerProfile extends OrganizerSummary {
  eventCount: number;
  athleteCount: number;
  upcomingCount: number;
}

/** Payload for creating an event from the organizer side. */
export interface CreateEventInput {
  name: string;
  venueName: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  startDate: string;
  endDate: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  description: string;
  disciplines: Discipline[];
}

/** Payload for adding a division to an event. */
export interface CreateDivisionInput {
  name: string;
  discipline: Discipline;
  gender: Gender;
  beltRank: BeltRank | null;
  ageCategory: string | null;
  weightClass: string | null;
  ruleset: Ruleset;
  format: BracketFormat;
  priceCents: number;
  capacity: number | null;
}

/** A roster row in the organizer's view of an event's registrations. */
export interface EventRegistration {
  id: string;
  athleteName: string;
  athleteSlug: string | null;
  academyName: string | null;
  beltRank: BeltRank | null;
  divisionName: string;
  status: RegistrationStatus;
}

/** One scheduled match on a mat, for the live schedule/results view. */
export interface ScheduleMatch {
  id: string;
  order: number;
  divisionName: string;
  roundLabel: string;
  competitorA: string | null;
  competitorB: string | null;
  status: MatchStatus;
  winner: string | null;
  score?: MatchScore;
}

/** A mat (ring) with its running order of matches. */
export interface ScheduleMat {
  name: string;
  matches: ScheduleMatch[];
}

/** The full day-of schedule / live results board for an event. */
export interface EventSchedule {
  eventId: string;
  eventSlug: string;
  eventName: string;
  status: EventStatus;
  mats: ScheduleMat[];
  totalMatches: number;
  completedMatches: number;
}

// --- Matside scoring -------------------------------------------------------

/** How a match was decided. */
export type ScoreMethod = 'points' | 'submission' | 'decision' | 'dq' | 'forfeit';

/** Which competitor a scoring action applies to. */
export type ScoreSide = 'a' | 'b';

/** IBJJF-style running tally for one competitor. */
export interface CompetitorScore {
  points: number;
  advantages: number;
  penalties: number;
}

/** The live score for a match. */
export interface MatchScore {
  a: CompetitorScore;
  b: CompetitorScore;
  method: ScoreMethod | null;
}

/** A single increment/decrement applied at the scoring table. */
export interface ScoreAction {
  side: ScoreSide;
  field: keyof CompetitorScore;
  delta: number;
}

/** A match as seen by the scoring console / mat control. */
export interface ScoreableMatch {
  id: string;
  eventId: string;
  eventSlug: string;
  matName: string;
  divisionName: string;
  roundLabel: string;
  competitorA: string;
  competitorB: string;
  status: MatchStatus;
  score: MatchScore;
  winner: string | null;
}

/** Per-mat snapshot for the mat-control view: who's on now and on deck. */
export interface MatControl {
  name: string;
  current: ScoreableMatch | null;
  onDeck: ScoreableMatch | null;
  remaining: number;
  completed: number;
}

/** Standard error envelope returned by the API. */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
