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
  OrganizerProfile,
  RegistrationInput,
  RegistrationSummary,
} from '@openmat/types';
import type { ApiClient } from '../api-types';
import {
  academies,
  athletes,
  currentAccountAthleteId,
  currentOrganizer,
  currentOrganizerId,
  events,
  slugify,
} from './data';
import { buildEntrants } from './entrants';
import { buildSchedule } from './schedule';

/** Simulate a little network latency so loading states are exercised in dev. */
function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function toEventSummary(event: EventDetail): EventSummary {
  // Strip the detail-only fields; cards consume the summary shape.
  const {
    description: _description,
    address: _address,
    organizer: _organizer,
    divisions: _divisions,
    registrationOpensAt: _opensAt,
    registrationClosesAt: _closesAt,
    scheduleNote: _scheduleNote,
    ...summary
  } = event;
  return summary;
}

function toAcademySummary(academy: AcademyDetail): AcademySummary {
  return {
    id: academy.id,
    slug: academy.slug,
    name: academy.name,
    city: academy.city,
    country: academy.country,
    logoUrl: academy.logoUrl,
    memberCount: academy.memberCount,
  };
}

function toAthleteSummary(athlete: AthleteProfile): AthleteSummary {
  return {
    id: athlete.id,
    slug: athlete.slug,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    beltRank: athlete.beltRank,
    discipline: athlete.discipline,
    academyId: athlete.academyId,
    academyName: athlete.academyName,
    academySlug: athlete.academySlug,
    country: athlete.country,
    avatarUrl: athlete.avatarUrl,
  };
}

function matchesQuery(event: EventDetail, query?: EventListQuery): boolean {
  if (!query) return true;
  if (query.status && event.status !== query.status) return false;
  if (query.country && event.country !== query.country) return false;
  if (query.discipline && !(event.disciplines ?? []).includes(query.discipline)) return false;
  if (query.search) {
    const haystack = `${event.name} ${event.city ?? ''} ${event.venueName ?? ''}`.toLowerCase();
    if (!haystack.includes(query.search.toLowerCase())) return false;
  }
  return true;
}

export const mockClient: ApiClient = {
  listEvents(query?: EventListQuery) {
    const list = events
      .filter((e) => matchesQuery(e, query))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map(toEventSummary);
    return delay(list);
  },

  getEvent(slug: string) {
    const event = events.find((e) => e.slug === slug) ?? null;
    return delay<EventDetail | null>(event);
  },

  getDivision(eventSlug: string, divisionId: string) {
    const event = events.find((e) => e.slug === eventSlug);
    const division = event?.divisions.find((d) => d.id === divisionId);
    if (!event || !division) return delay<DivisionDetail | null>(null);
    const detail: DivisionDetail = {
      ...division,
      eventId: event.id,
      eventSlug: event.slug,
      eventName: event.name,
      entrants: buildEntrants(event.slug, division),
      resultsFinal: event.status === 'completed',
    };
    return delay<DivisionDetail | null>(detail);
  },

  createRegistration(input: RegistrationInput) {
    const event = events.find((e) => e.id === input.eventId);
    const division = event?.divisions.find((d) => d.id === input.divisionId);
    if (!event || !division) {
      return Promise.reject(new Error('Event or division not found'));
    }
    const athlete = athletes.find((a) => a.id === currentAccountAthleteId);
    const registration: RegistrationSummary = {
      id: `reg_${Date.now()}`,
      eventId: event.id,
      eventName: event.name,
      eventSlug: event.slug,
      divisionName: division.name,
      status: 'confirmed',
      startDate: event.startDate,
      city: event.city,
    };
    // Persist into the in-memory store so it shows up in the account area.
    if (athlete && !athlete.registrations.some((r) => r.id === registration.id)) {
      athlete.registrations.unshift(registration);
    }
    division.registeredCount += 1;
    return delay(registration, 400);
  },

  listAcademies(search?: string) {
    const term = search?.toLowerCase().trim();
    const list = academies
      .filter((a) =>
        term ? `${a.name} ${a.city ?? ''} ${a.country ?? ''}`.toLowerCase().includes(term) : true,
      )
      .map(toAcademySummary)
      .sort((a, b) => a.name.localeCompare(b.name));
    return delay(list);
  },

  getAcademy(slug: string) {
    const academy = academies.find((a) => a.slug === slug) ?? null;
    return delay<AcademyDetail | null>(academy);
  },

  listAthletes(search?: string) {
    const term = search?.toLowerCase().trim();
    const list = athletes
      .filter((a) =>
        term
          ? `${a.firstName} ${a.lastName} ${a.academyName ?? ''}`.toLowerCase().includes(term)
          : true,
      )
      .map(toAthleteSummary)
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
    return delay(list);
  },

  getAthlete(slug: string) {
    const athlete = athletes.find((a) => a.slug === slug) ?? null;
    return delay<AthleteProfile | null>(athlete);
  },

  getAccount() {
    const athlete = athletes.find((a) => a.id === currentAccountAthleteId) ?? null;
    const account: AccountProfile = {
      id: 'usr_demo',
      name: athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Demo Athlete',
      email: 'demo@openmat.dev',
      role: 'organizer',
      memberSince: '2023-02-14T00:00:00.000Z',
      avatarUrl: null,
      athlete,
    };
    return delay(account);
  },

  getEventSchedule(slug: string) {
    const event = events.find((e) => e.slug === slug);
    if (!event) return delay<EventSchedule | null>(null);
    return delay<EventSchedule | null>(buildSchedule(event));
  },

  // --- Organizer ----------------------------------------------------------

  getOrganizer() {
    const owned = events.filter((e) => e.organizer.id === currentOrganizerId);
    const athleteIds = new Set<string>();
    for (const e of owned) {
      for (const a of athletes) {
        if (a.registrations.some((r) => r.eventSlug === e.slug)) athleteIds.add(a.id);
      }
    }
    const profile: OrganizerProfile = {
      ...currentOrganizer,
      eventCount: owned.length,
      athleteCount: athleteIds.size,
      upcomingCount: owned.filter((e) => new Date(e.startDate) >= new Date()).length,
    };
    return delay(profile);
  },

  listOrganizerEvents() {
    const list = events
      .filter((e) => e.organizer.id === currentOrganizerId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map(toEventSummary);
    return delay(list);
  },

  createEvent(input: CreateEventInput) {
    const id = `evt_${Date.now()}`;
    const event: EventDetail = {
      id,
      slug: slugify(input.name),
      name: input.name,
      venueName: input.venueName,
      address: input.address,
      city: input.city,
      country: input.country,
      coordinates: null,
      startDate: input.startDate,
      endDate: input.endDate,
      registrationOpensAt: input.registrationOpensAt,
      registrationClosesAt: input.registrationClosesAt,
      status: 'draft',
      coverImageUrl: null,
      disciplines: input.disciplines,
      rulesets: ['ibjjf'],
      divisionCount: 0,
      registeredCount: 0,
      startingPriceCents: 0,
      description: input.description,
      scheduleNote: null,
      organizer: currentOrganizer,
      divisions: [],
    };
    events.unshift(event);
    return delay(event, 400);
  },

  updateEventStatus(eventId: string, status: EventStatus) {
    const event = events.find((e) => e.id === eventId);
    if (!event) return Promise.reject(new Error('Event not found'));
    event.status = status;
    return delay(event);
  },

  addDivision(eventId: string, input: CreateDivisionInput) {
    const event = events.find((e) => e.id === eventId);
    if (!event) return Promise.reject(new Error('Event not found'));
    const division: DivisionSummary = {
      id: `${eventId}_div_${event.divisions.length + 1}`,
      registeredCount: 0,
      ...input,
    };
    event.divisions.push(division);
    event.divisionCount = event.divisions.length;
    const prices = event.divisions.map((d) => d.priceCents).filter((p) => p > 0);
    event.startingPriceCents = prices.length ? Math.min(...prices) : 0;
    return delay(division, 300);
  },

  listEventRegistrations(eventId: string) {
    const event = events.find((e) => e.id === eventId);
    if (!event) return delay<EventRegistration[]>([]);
    const rows: EventRegistration[] = [];
    for (const athlete of athletes) {
      for (const reg of athlete.registrations) {
        if (reg.eventSlug !== event.slug) continue;
        rows.push({
          id: reg.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          athleteSlug: athlete.slug,
          academyName: athlete.academyName,
          beltRank: athlete.beltRank,
          divisionName: reg.divisionName,
          status: reg.status,
        });
      }
    }
    return delay(rows);
  },
};
