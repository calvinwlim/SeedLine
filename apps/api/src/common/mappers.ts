import type { AthleteRecord, AthleteSummary, Coordinates } from '@seedline/types';
import { athletes } from '../database/schema';

type AthleteRow = typeof athletes.$inferSelect;

/** Build a Coordinates DTO from nullable lat/lng columns. */
export function toCoordinates(lat: number | null, lng: number | null): Coordinates | null {
  return lat != null && lng != null ? { latitude: lat, longitude: lng } : null;
}

/** Map an athlete row to the public summary shape (academy filled in by caller). */
export function toAthleteSummary(
  a: AthleteRow,
  academyName: string | null,
  academySlug: string | null,
): AthleteSummary {
  return {
    id: a.id,
    slug: a.slug,
    firstName: a.firstName,
    lastName: a.lastName,
    beltRank: a.beltRank,
    discipline: a.discipline,
    academyId: a.academyId,
    academyName,
    academySlug,
    country: a.country,
    avatarUrl: a.avatarUrl,
  };
}

/** Map the denormalized record columns to the AthleteRecord DTO. */
export function toAthleteRecord(a: AthleteRow): AthleteRecord {
  return {
    matches: a.matchesCount,
    wins: a.wins,
    losses: a.losses,
    draws: a.draws,
    submissions: a.submissions,
    goldMedals: a.goldMedals,
  };
}
