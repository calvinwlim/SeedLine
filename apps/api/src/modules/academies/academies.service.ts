import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import type { AcademyDetail, AcademySummary, MedalResult } from '@seedline/types';
import { DATABASE, type Database } from '../../database/database.module';
import { academies, athletes, events, medals } from '../../database/schema';
import { toAthleteSummary, toCoordinates } from '../../common/mappers';

type AcademyRow = typeof academies.$inferSelect;

function toAcademySummary(a: AcademyRow, memberCount: number): AcademySummary {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    city: a.city,
    country: a.country,
    logoUrl: a.logoUrl,
    bannerUrl: a.bannerUrl,
    memberCount,
  };
}

@Injectable()
export class AcademiesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(search?: string): Promise<AcademySummary[]> {
    const rows = await this.db.query.academies.findMany({
      where: search ? (a, { ilike }) => ilike(a.name, `%${search}%`) : undefined,
      orderBy: (a, { asc }) => [asc(a.name)],
    });
    const counts = await this.memberCounts(rows.map((r) => r.id));
    return rows.map((a) => toAcademySummary(a, counts.get(a.id) ?? 0));
  }

  async getBySlug(slug: string): Promise<AcademyDetail | null> {
    const academy = await this.db.query.academies.findFirst({
      where: eq(academies.slug, slug),
      with: { athletes: true },
    });
    if (!academy) return null;

    const roster = academy.athletes;
    const achievements = await this.medalsForAthletes(roster.map((a) => a.id));

    return {
      ...toAcademySummary(academy, roster.length),
      description: academy.description ?? '',
      headCoach: academy.headCoach,
      foundedYear: academy.foundedYear,
      affiliation: academy.affiliation,
      website: academy.website,
      coordinates: toCoordinates(academy.latitude, academy.longitude),
      athletes: roster.map((a) => toAthleteSummary(a, academy.name, academy.slug)),
      achievements,
    };
  }

  private async memberCounts(ids: string[]): Promise<Map<string, number>> {
    if (ids.length === 0) return new Map();
    const rows = await this.db
      .select({ academyId: athletes.academyId, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(inArray(athletes.academyId, ids))
      .groupBy(athletes.academyId);
    return new Map(rows.filter((r) => r.academyId).map((r) => [r.academyId as string, r.count]));
  }

  private async medalsForAthletes(athleteIds: string[]): Promise<MedalResult[]> {
    if (athleteIds.length === 0) return [];
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
      .where(inArray(medals.athleteId, athleteIds))
      .orderBy(desc(medals.awardedAt));
    return rows.map((r) => ({
      eventName: r.eventName ?? 'Event',
      eventSlug: r.eventSlug ?? '',
      divisionName: r.divisionName,
      place: r.place,
      date: r.awardedAt.toISOString(),
    }));
  }
}
