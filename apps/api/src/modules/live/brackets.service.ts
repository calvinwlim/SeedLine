import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { generateBracket, type Entrant } from '@seedline/bracket-engine';
import { DATABASE, type Database } from '../../database/database.module';
import { athletes, brackets, divisions, mats, matches, registrations } from '../../database/schema';
import { isRealMatch, roundLabelFor, zeroScore } from './scoring.util';

const MAT_COUNT = 4;

type DivisionRow = typeof divisions.$inferSelect;
type MatInfo = { id: string; name: string };

/**
 * Generates and persists brackets, schedulable match rows, and mat assignments
 * for an event — lazily, the first time the live board is requested. Idempotent:
 * divisions that already have a bracket are skipped.
 */
@Injectable()
export class BracketsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async ensureForEvent(eventId: string): Promise<void> {
    const eventMats = await this.ensureMats(eventId);
    const divisionRows = await this.db
      .select()
      .from(divisions)
      .where(eq(divisions.eventId, eventId));

    for (const division of divisionRows) {
      const existing = await this.db.query.brackets.findFirst({
        where: eq(brackets.divisionId, division.id),
      });
      if (!existing) await this.generateForDivision(division);
    }

    await this.assignMats(eventId, eventMats);
  }

  private async ensureMats(eventId: string): Promise<MatInfo[]> {
    const existing = await this.db.select().from(mats).where(eq(mats.eventId, eventId));
    if (existing.length > 0) return existing.map((m) => ({ id: m.id, name: m.name }));
    const inserted = await this.db
      .insert(mats)
      .values(Array.from({ length: MAT_COUNT }, (_, i) => ({ eventId, name: `Mat ${i + 1}` })))
      .returning();
    return inserted.map((m) => ({ id: m.id, name: m.name }));
  }

  private async generateForDivision(division: DivisionRow): Promise<void> {
    const entrantRows = await this.db
      .select({
        registrationId: registrations.id,
        seed: registrations.seed,
        athleteId: registrations.athleteId,
        firstName: athletes.firstName,
        lastName: athletes.lastName,
        academyId: athletes.academyId,
      })
      .from(registrations)
      .innerJoin(athletes, eq(registrations.athleteId, athletes.id))
      .where(eq(registrations.divisionId, division.id));

    if (entrantRows.length < 2) return;

    const engineEntrants: Entrant[] = entrantRows.map((r, i) => ({
      id: r.registrationId,
      seed: r.seed ?? i + 1,
      academyId: r.academyId ?? undefined,
      name: `${r.firstName} ${r.lastName}`,
    }));

    const bracket = generateBracket(division.format, engineEntrants, { separateAcademies: true });

    const [bracketRow] = await this.db
      .insert(brackets)
      .values({
        divisionId: division.id,
        format: division.format,
        status: 'generated',
        data: bracket,
        generatedAt: new Date(),
      })
      .returning();

    const regToAthlete = new Map(entrantRows.map((r) => [r.registrationId, r.athleteId]));
    const realMatches = bracket.matches.filter(isRealMatch);
    if (realMatches.length === 0) return;

    const inserted = await this.db
      .insert(matches)
      .values(
        realMatches.map((m) => {
          const athleteAId = m.entrantA ? (regToAthlete.get(m.entrantA) ?? null) : null;
          const athleteBId = m.entrantB ? (regToAthlete.get(m.entrantB) ?? null) : null;
          const ready = athleteAId != null && athleteBId != null;
          return {
            bracketId: bracketRow!.id,
            divisionId: division.id,
            engineMatchId: m.id,
            round: m.round,
            position: m.position,
            roundLabel: roundLabelFor(m, bracket),
            athleteAId,
            athleteBId,
            status: ready ? ('ready' as const) : ('pending' as const),
            scoreData: zeroScore(),
          };
        }),
      )
      .returning({ id: matches.id, engineMatchId: matches.engineMatchId });

    // Wire each row's nextMatchId from the engine's winnerTo targets.
    const idByEngineId = new Map(inserted.map((r) => [r.engineMatchId, r.id]));
    for (const m of realMatches) {
      if (!m.winnerTo) continue;
      const fromId = idByEngineId.get(m.id);
      const toId = idByEngineId.get(m.winnerTo.matchId);
      if (fromId && toId) {
        await this.db.update(matches).set({ nextMatchId: toId }).where(eq(matches.id, fromId));
      }
    }
  }

  /** Give every ready, unassigned match a mat and a per-mat running order. */
  private async assignMats(eventId: string, eventMats: MatInfo[]): Promise<void> {
    if (eventMats.length === 0) return;

    const unassigned = await this.db
      .select({ id: matches.id })
      .from(matches)
      .innerJoin(divisions, eq(matches.divisionId, divisions.id))
      .where(
        and(eq(divisions.eventId, eventId), eq(matches.status, 'ready'), isNull(matches.matId)),
      )
      .orderBy(matches.divisionId, matches.round, matches.position);
    if (unassigned.length === 0) return;

    const perMat = await this.matOrderHighWater(eventId);
    let cursor = 0;
    for (const row of unassigned) {
      const mat = eventMats[cursor % eventMats.length]!;
      const order = (perMat.get(mat.id) ?? 0) + 1;
      perMat.set(mat.id, order);
      await this.db
        .update(matches)
        .set({ matId: mat.id, scheduledOrder: order })
        .where(eq(matches.id, row.id));
      cursor++;
    }
  }

  private async matOrderHighWater(eventId: string): Promise<Map<string, number>> {
    const rows = await this.db
      .select({ matId: matches.matId, order: matches.scheduledOrder })
      .from(matches)
      .innerJoin(divisions, eq(matches.divisionId, divisions.id))
      .where(and(eq(divisions.eventId, eventId), isNotNull(matches.matId)));
    const perMat = new Map<string, number>();
    for (const r of rows) {
      if (!r.matId) continue;
      perMat.set(r.matId, Math.max(perMat.get(r.matId) ?? 0, r.order ?? 0));
    }
    return perMat;
  }
}
