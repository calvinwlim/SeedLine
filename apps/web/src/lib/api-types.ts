import type {
  AccountProfile,
  AcademyDetail,
  AcademySummary,
  AthleteProfile,
  AthleteSummary,
  CreateDivisionInput,
  CreateEventInput,
  DivisionDetail,
  DivisionSummary,
  EventDetail,
  EventListQuery,
  EventRegistration,
  EventSchedule,
  EventStatus,
  EventSummary,
  MatControl,
  OrganizerProfile,
  RegistrationInput,
  RegistrationSummary,
  ScoreAction,
  ScoreMethod,
  ScoreSide,
  ScoreableMatch,
} from '@seedline/types';

/**
 * The data-access surface the web app depends on. Both the mock client (for
 * standalone development) and the live client (which talks to the NestJS API)
 * implement this interface, so pages never care which one is wired in.
 */
export interface ApiClient {
  // Public directory
  listEvents(query?: EventListQuery): Promise<EventSummary[]>;
  getEvent(slug: string): Promise<EventDetail | null>;
  getDivision(eventSlug: string, divisionId: string): Promise<DivisionDetail | null>;
  getEventSchedule(slug: string): Promise<EventSchedule | null>;
  createRegistration(input: RegistrationInput): Promise<RegistrationSummary>;

  // Matside scoring
  getMatControls(slug: string): Promise<MatControl[]>;
  getScoreableMatch(slug: string, matchId: string): Promise<ScoreableMatch | null>;
  applyScore(slug: string, matchId: string, action: ScoreAction): Promise<ScoreableMatch | null>;
  startMatch(slug: string, matchId: string): Promise<ScoreableMatch | null>;
  resetMatch(slug: string, matchId: string): Promise<ScoreableMatch | null>;
  finishMatch(
    slug: string,
    matchId: string,
    winnerSide: ScoreSide,
    method: ScoreMethod,
  ): Promise<ScoreableMatch | null>;
  listAcademies(search?: string): Promise<AcademySummary[]>;
  getAcademy(slug: string): Promise<AcademyDetail | null>;
  listAthletes(search?: string): Promise<AthleteSummary[]>;
  getAthlete(slug: string): Promise<AthleteProfile | null>;
  getAccount(): Promise<AccountProfile>;

  // Organizer
  getOrganizer(): Promise<OrganizerProfile>;
  listOrganizerEvents(): Promise<EventSummary[]>;
  createEvent(input: CreateEventInput): Promise<EventDetail>;
  updateEventStatus(eventId: string, status: EventStatus): Promise<EventDetail>;
  addDivision(eventId: string, input: CreateDivisionInput): Promise<DivisionSummary>;
  listEventRegistrations(eventId: string): Promise<EventRegistration[]>;
}
