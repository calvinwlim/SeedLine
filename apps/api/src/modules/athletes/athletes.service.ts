import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import type {
  AthleteProfile,
  AthleteSummary,
  MedalResult,
  RegistrationSummary,
} from '@openmat/types';
import { DATABASE, type Database } from '../../database/database.module';
import { academies, athletes, divisions, events, medals, registrations } from '../../database/schema';
import { toAthleteRecord, toAthleteSummary } from '../../common/mappers';

@Injectable()
export class AthletesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(search?: string): Promise<AthleteSummary[]> {
    const term = search ? `%${search}%` : undefined;
    const rows = await this.db
      .select({
        athlete: athletes,
        academyName: academies.name,
        academySlug: academies.slug,
      })
      .from(athletes)
      .leftJoin(academies, eq(athletes.academyId, academies.id))
      .where(term ? or(ilike(athletes.firstName, term), ilike(athletes.lastName, term)) : undefined)
      .orderBy(asc(athletes.lastName));
    return rows.map((r) => toAthleteSummary(r.athlete, r.academyName, r.academySlug));
  }

  async getBySlug(slug: string): Promise<AthleteProfile | null> {
    const athlete = await this.db.query.athletes.findFirst({
      where: eq(athletes.slug, slug),
      with: { academy: true },
    });
    if (!athlete) return null;

    const [achievements, registrationRows] = await Promise.all([
      this.medalsForAthlete(athlete.id),
      this.registrationsForAthlete(athlete.id),
    ]);

    return {
      ...toAthleteSummary(athlete, athlete.academy?.name ?? null, athlete.academy?.slug ?? null),
      bio: athlete.bio,
      weightClass: athlete.weightClass,
      ageCategory: athlete.ageCategory,
      record: toAthleteRecord(athlete),
      registrations: registrationRows,
      achievements,
    };
  }

  private async medalsForAthlete(athleteId: string): Promise<MedalResult[]> {
    const rows = await this.db
      .select({
        eventName: events.name,
        eventSlug: events.slug,
        divisionName: medals.divisionName,
        place: medals.place,
        awardedAt: medals.awardedAt,
      })
      .from(medals)
      .leftJoin(events, eq(medals.eventId, events.id))
      .where(inArray(medals.athleteId, [athleteId]))
      .orderBy(desc(medals.awardedAt));
    return rows.map((r) => ({
      eventName: r.eventName ?? 'Event',
      eventSlug: r.eventSlug ?? '',
      divisionName: r.divisionName,
      place: r.place,
      date: r.awardedAt.toISOString(),
    }));
  }

  private async registrationsForAthlete(athleteId: string): Promise<RegistrationSummary[]> {
    const rows = await this.db
      .select({
        id: registrations.id,
        eventId: events.id,
        eventName: events.name,
        eventSlug: events.slug,
        city: events.city,
        startDate: events.startDate,
        divisionName: divisions.name,
        status: registrations.status,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .innerJoin(divisions, eq(registrations.divisionId, divisions.id))
      .where(eq(registrations.athleteId, athleteId))
      .orderBy(desc(events.startDate));
    return rows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      eventName: r.eventName,
      eventSlug: r.eventSlug,
      divisionName: r.divisionName,
      status: r.status,
      startDate: r.startDate.toISOString(),
      city: r.city,
    }));
  }
}
