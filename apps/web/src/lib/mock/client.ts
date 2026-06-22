import type {
  AccountProfile,
  AcademyDetail,
  AcademySummary,
  AthleteProfile,
  AthleteSummary,
  EventDetail,
  EventListQuery,
  EventSummary,
} from '@openmat/types';
import type { ApiClient } from '../api-types';
import { academies, athletes, currentAccountAthleteId, events } from './data';

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
      role: 'athlete',
      memberSince: '2023-02-14T00:00:00.000Z',
      avatarUrl: null,
      athlete,
    };
    return delay(account);
  },
};
