import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type {
  BracketEntrant,
  Coordinates,
  DivisionDetail,
  DivisionSummary,
  EventDetail,
  EventListQuery,
  EventSummary,
} from '@openmat/types';
import { DATABASE, type Database } from '../../database/database.module';
import { academies, athletes, divisions, events, registrations } from '../../database/schema';

type EventRow = typeof events.$inferSelect;
type DivisionRow = typeof divisions.$inferSelect;
type OrganizerInfo = { id: string; slug: string; name: string; logoUrl: string | null };

function toCoordinates(lat: number | null, lng: number | null): Coordinates | null {
  return lat != null && lng != null ? { latitude: lat, longitude: lng } : null;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function toDivisionSummary(d: DivisionRow, registeredCount: number): DivisionSummary {
  return {
    id: d.id,
    name: d.name,
    discipline: d.discipline,
    gender: d.gender,
    beltRank: d.beltRank,
    ageCategory: d.ageCategory,
    weightClass: d.weightClass,
    ruleset: d.ruleset,
    format: d.format,
    priceCents: d.priceCents,
    capacity: d.capacity,
    registeredCount,
  };
}

function toEventSummary(e: EventRow, divs: DivisionRow[], registeredCount: number): EventSummary {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    venueName: e.venueName,
    city: e.city,
    country: e.country,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    status: e.status,
    coordinates: toCoordinates(e.latitude, e.longitude),
    coverImageUrl: e.coverImageUrl,
    disciplines: unique(divs.map((d) => d.discipline)),
    rulesets: unique(divs.map((d) => d.ruleset)),
    divisionCount: divs.length,
    registeredCount,
    startingPriceCents: divs.length ? Math.min(...divs.map((d) => d.priceCents)) : undefined,
  };
}

@Injectable()
export class EventsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /** List events for the public directory, with light filtering. */
  async listPublished(query: EventListQuery = {}): Promise<EventSummary[]> {
    const rows = await this.db.query.events.findMany({
      with: { divisions: true },
      where: (e, { and: andOp, eq: eqOp, ilike, or }) => {
        const conds = [];
        if (query.status) conds.push(eqOp(e.status, query.status));
        if (query.country) conds.push(eqOp(e.country, query.country));
        if (query.search) {
          const term = `%${query.search}%`;
          conds.push(or(ilike(e.name, term), ilike(e.city, term), ilike(e.venueName, term)));
        }
        return conds.length ? andOp(...conds) : undefined;
      },
      orderBy: (e, { asc }) => [asc(e.startDate)],
      limit: 100,
    });

    const counts = await this.registrationCounts(
      registrations.eventId,
      rows.map((r) => r.id),
    );

    return rows
      .filter(
        (row) => !query.discipline || row.divisions.some((d) => d.discipline === query.discipline),
      )
      .map((row) => toEventSummary(row, row.divisions, counts.get(row.id) ?? 0));
  }

  /** Full event detail (divisions, organizer, aggregates) by slug. */
  async getBySlug(slug: string): Promise<EventDetail | null> {
    const event = await this.db.query.events.findFirst({
      where: eq(events.slug, slug),
      with: { divisions: true, organizer: true },
    });
    if (!event) return null;

    const divisionCounts = await this.registrationCounts(
      registrations.divisionId,
      event.divisions.map((d) => d.id),
    );
    const totalRegistered = [...divisionCounts.values()].reduce((sum, n) => sum + n, 0);
    const organizer: OrganizerInfo = event.organizer;

    return {
      ...toEventSummary(event, event.divisions, totalRegistered),
      description: event.description ?? '',
      address: event.address,
      registrationOpensAt: event.registrationOpensAt?.toISOString() ?? null,
      registrationClosesAt: event.registrationClosesAt?.toISOString() ?? null,
      scheduleNote: event.scheduleNote,
      organizer: {
        id: organizer.id,
        slug: organizer.slug,
        name: organizer.name,
        logoUrl: organizer.logoUrl,
      },
      divisions: event.divisions.map((d) => toDivisionSummary(d, divisionCounts.get(d.id) ?? 0)),
    };
  }

  /** A division with its entrant list, for the bracket viewer. */
  async getDivision(eventSlug: string, divisionId: string): Promise<DivisionDetail | null> {
    const event = await this.db.query.events.findFirst({ where: eq(events.slug, eventSlug) });
    if (!event) return null;

    const division = await this.db.query.divisions.findFirst({
      where: and(eq(divisions.id, divisionId), eq(divisions.eventId, event.id)),
    });
    if (!division) return null;

    const entrantRows = await this.db
      .select({
        registrationId: registrations.id,
        seed: registrations.seed,
        firstName: athletes.firstName,
        lastName: athletes.lastName,
        academyId: athletes.academyId,
        academyName: academies.name,
      })
      .from(registrations)
      .innerJoin(athletes, eq(registrations.athleteId, athletes.id))
      .leftJoin(academies, eq(athletes.academyId, academies.id))
      .where(eq(registrations.divisionId, divisionId));

    const entrants: BracketEntrant[] = entrantRows.map((row, index) => ({
      id: row.registrationId,
      name: `${row.firstName} ${row.lastName}`,
      seed: row.seed ?? index + 1,
      academyId: row.academyId,
      academyName: row.academyName,
    }));

    return {
      ...toDivisionSummary(division, entrants.length),
      eventId: event.id,
      eventSlug: event.slug,
      eventName: event.name,
      entrants,
      resultsFinal: event.status === 'completed',
    };
  }

  /** Count registrations grouped by the given column (event or division). */
  private async registrationCounts(
    column: typeof registrations.eventId | typeof registrations.divisionId,
    ids: string[],
  ): Promise<Map<string, number>> {
    if (ids.length === 0) return new Map();
    const rows = await this.db
      .select({ key: column, count: sql<number>`count(*)::int` })
      .from(registrations)
      .where(inArray(column, ids))
      .groupBy(column);
    return new Map(rows.map((r) => [r.key, r.count]));
  }
}
