import type {
  AccountProfile,
  AcademyDetail,
  AcademySummary,
  AthleteProfile,
  AthleteSummary,
  DivisionDetail,
  EventDetail,
  EventListQuery,
  EventSummary,
  RegistrationInput,
  RegistrationSummary,
} from '@openmat/types';

/**
 * The data-access surface the web app depends on. Both the mock client (for
 * standalone development) and the live client (which talks to the NestJS API)
 * implement this interface, so pages never care which one is wired in.
 */
export interface ApiClient {
  listEvents(query?: EventListQuery): Promise<EventSummary[]>;
  getEvent(slug: string): Promise<EventDetail | null>;
  getDivision(eventSlug: string, divisionId: string): Promise<DivisionDetail | null>;
  createRegistration(input: RegistrationInput): Promise<RegistrationSummary>;
  listAcademies(search?: string): Promise<AcademySummary[]>;
  getAcademy(slug: string): Promise<AcademyDetail | null>;
  listAthletes(search?: string): Promise<AthleteSummary[]>;
  getAthlete(slug: string): Promise<AthleteProfile | null>;
  getAccount(): Promise<AccountProfile>;
}
