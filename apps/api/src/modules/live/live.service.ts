import { Inject, Injectable } from '@nestjs/common';
import { and, eq, max } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { applyResult, type AdvanceTarget, type Bracket } from '@openmat/bracket-engine';
import type {
  CompetitorScore,
  EventSchedule,
  MatControl,
  MatchScore,
  MatchStatus,
  ScheduleMat,
  ScheduleMatch,
  ScoreAction,
  ScoreMethod,
  ScoreSide,
  ScoreableMatch,
} from '@openmat/types';
import { DATABASE, type Database } from '../../database/database.module';
import {
  athletes,
  brackets,
  divisions,
  events,
  mats,
  matches,
  registrations,
} from '../../database/schema';
import { BracketsService } from './brackets.service';
import { zeroScore } from './scoring.util';

/** A match joined to the names/labels the live views need. */
interface MatchRow {
  id: string;
  order: number | null;
  status: MatchStatus;
  roundLabel: string | null;
  scoreData: unknown;
  athleteAId: string | null;
  athleteBId: string | null;
  winnerId: string | null;
  divisionName: string;
  matName: string | null;
  eventId: string;
  eventSlug: string;
  aFirst: string | null;
  aLast: string | null;
  bFirst: string | null;
  bLast: string | null;
}

function displayName(first: string | null, last: string | null): string | null {
  return first && last ? `${first} ${last}` : null;
}

@Injectable()
export class LiveService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly brackets: BracketsService,
  ) {}

  // --- Reads ---------------------------------------------------------------

  async getSchedule(slug: string): Promise<EventSchedule | null> {
    const event = await this.db.query.events.findFirst({ where: eq(events.slug, slug) });
    if (!event) return null;
    await this.brackets.ensureForEvent(event.id);

    const rows = await this.loadEventMatches(event.id);
    const byMat = new Map<string, ScheduleMat>();
    for (const row of rows) {
      if (!row.matName) continue;
      const mat = byMat.get(row.matName) ?? { name: row.matName, matches: [] };
      mat.matches.push(this.toScheduleMatch(row));
      byMat.set(row.matName, mat);
    }
    for (const mat of byMat.values()) mat.matches.sort((a, b) => a.order - b.order);

    return {
      eventId: event.id,
      eventSlug: event.slug,
      eventName: event.name,
      status: event.status,
      mats: [...byMat.values()].sort((a, b) => a.name.localeCompare(b.name)),
      totalMatches: rows.length,
      completedMatches: rows.filter((r) => r.status === 'completed').length,
    };
  }

  async getMatControls(slug: string): Promise<MatControl[]> {
    const event = await this.db.query.events.findFirst({ where: eq(events.slug, slug) });
    if (!event) return [];
    await this.brackets.ensureForEvent(event.id);

    const rows = await this.loadEventMatches(event.id);
    const byMat = new Map<string, MatchRow[]>();
    for (const row of rows) {
      if (!row.matName) continue;
      const list = byMat.get(row.matName);
      if (list) list.push(row);
      else byMat.set(row.matName, [row]);
    }

    return [...byMat.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, list]) => {
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const current = list.find((r) => r.status === 'in_progress') ?? null;
        const onDeck =
          list.find((r) => r.status === 'ready') ??
          list.find((r) => r.status === 'pending') ??
          null;
        return {
          name,
          current: current ? this.toScoreable(current) : null,
          onDeck: onDeck && onDeck !== current ? this.toScoreable(onDeck) : null,
          remaining: list.filter((r) => r.status !== 'completed').length,
          completed: list.filter((r) => r.status === 'completed').length,
        };
      });
  }

  async getScoreableMatch(slug: string, matchId: string): Promise<ScoreableMatch | null> {
    const row = await this.loadMatch(matchId);
    return row && row.eventSlug === slug ? this.toScoreable(row) : null;
  }

  // --- Scoring mutations ---------------------------------------------------

  async applyScore(
    slug: string,
    matchId: string,
    action: ScoreAction,
  ): Promise<ScoreableMatch | null> {
    const match = await this.db.query.matches.findFirst({ where: eq(matches.id, matchId) });
    if (!match) return null;
    const score = (match.scoreData as MatchScore | null) ?? zeroScore();
    const competitor: CompetitorScore = score[action.side];
    competitor[action.field] = Math.max(0, competitor[action.field] + action.delta);
    await this.db.update(matches).set({ scoreData: score }).where(eq(matches.id, matchId));
    return this.getScoreableMatch(slug, matchId);
  }

  async startMatch(slug: string, matchId: string): Promise<ScoreableMatch | null> {
    const match = await this.db.query.matches.findFirst({ where: eq(matches.id, matchId) });
    if (!match) return null;
    if (match.status !== 'completed') {
      await this.db
        .update(matches)
        .set({ status: 'in_progress', startedAt: new Date() })
        .where(eq(matches.id, matchId));
    }
    return this.getScoreableMatch(slug, matchId);
  }

  async resetMatch(slug: string, matchId: string): Promise<ScoreableMatch | null> {
    await this.db
      .update(matches)
      .set({ scoreData: zeroScore(), winnerId: null, status: 'ready', completedAt: null })
      .where(eq(matches.id, matchId));
    return this.getScoreableMatch(slug, matchId);
  }

  async finishMatch(
    slug: string,
    matchId: string,
    winnerSide: ScoreSide,
    method: ScoreMethod,
  ): Promise<ScoreableMatch | null> {
    const match = await this.db.query.matches.findFirst({ where: eq(matches.id, matchId) });
    if (!match) return null;

    const winnerAthleteId = winnerSide === 'a' ? match.athleteAId : match.athleteBId;

    // Advance the result through the engine and persist the propagation.
    const bracketRow = await this.db.query.brackets.findFirst({
      where: eq(brackets.id, match.bracketId),
    });
    const bracket = bracketRow?.data ?? null;
    if (bracket) {
      const engineMatch = bracket.matches.find((m) => m.id === match.engineMatchId);
      if (engineMatch) {
        const winnerEntrant = winnerSide === 'a' ? engineMatch.entrantA : engineMatch.entrantB;
        const loserEntrant = winnerSide === 'a' ? engineMatch.entrantB : engineMatch.entrantA;
        if (winnerEntrant) {
          const updated = applyResult(bracket, engineMatch.id, winnerEntrant);
          await this.db
            .update(brackets)
            .set({ data: updated, status: 'in_progress' })
            .where(eq(brackets.id, bracketRow!.id));
          await this.propagate(updated, match.bracketId, match.engineMatchId, match.matId, {
            winner: winnerEntrant,
            loser: loserEntrant,
          });
        }
      }
    }

    const score = (match.scoreData as MatchScore | null) ?? zeroScore();
    score.method = method;
    await this.db
      .update(matches)
      .set({
        status: 'completed',
        winnerId: winnerAthleteId,
        scoreData: score,
        completedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    return this.getScoreableMatch(slug, matchId);
  }

  // --- Propagation ---------------------------------------------------------

  private async propagate(
    bracket: Bracket,
    bracketId: string,
    engineMatchId: string,
    fromMatId: string | null,
    entrants: { winner: string; loser: string | null },
  ): Promise<void> {
    const engineMatch = bracket.matches.find((m) => m.id === engineMatchId);
    if (!engineMatch) return;
    if (engineMatch.winnerTo) {
      await this.fillDownstream(
        bracket,
        bracketId,
        engineMatch.winnerTo,
        entrants.winner,
        fromMatId,
      );
    }
    if (engineMatch.loserTo && entrants.loser) {
      await this.fillDownstream(bracket, bracketId, engineMatch.loserTo, entrants.loser, fromMatId);
    }
  }

  private async fillDownstream(
    bracket: Bracket,
    bracketId: string,
    target: AdvanceTarget,
    entrant: string,
    fromMatId: string | null,
  ): Promise<void> {
    const downstream = bracket.matches.find((m) => m.id === target.matchId);
    if (!downstream) return;
    const row = await this.db.query.matches.findFirst({
      where: and(eq(matches.bracketId, bracketId), eq(matches.engineMatchId, downstream.id)),
    });
    if (!row) return;

    const athleteId = await this.registrationAthlete(entrant);
    const otherKnown = target.side === 'A' ? row.athleteBId : row.athleteAId;
    const bothKnown = athleteId != null && otherKnown != null;
    const patch = target.side === 'A' ? { athleteAId: athleteId } : { athleteBId: athleteId };

    await this.db
      .update(matches)
      .set({ ...patch, status: bothKnown ? 'ready' : row.status })
      .where(eq(matches.id, row.id));

    if (bothKnown && row.matId == null) await this.assignMat(row.divisionId, fromMatId, row.id);
  }

  private async registrationAthlete(registrationId: string): Promise<string | null> {
    const reg = await this.db.query.registrations.findFirst({
      where: eq(registrations.id, registrationId),
    });
    return reg?.athleteId ?? null;
  }

  /** Place a newly-ready match on a mat (the feeder's mat, else any event mat). */
  private async assignMat(
    divisionId: string,
    preferredMatId: string | null,
    matchId: string,
  ): Promise<void> {
    let matId = preferredMatId;
    if (!matId) {
      const [firstMat] = await this.db
        .select({ id: mats.id })
        .from(mats)
        .innerJoin(divisions, eq(divisions.eventId, mats.eventId))
        .where(eq(divisions.id, divisionId))
        .limit(1);
      matId = firstMat?.id ?? null;
    }
    if (!matId) return;

    const [highWater] = await this.db
      .select({ value: max(matches.scheduledOrder) })
      .from(matches)
      .where(eq(matches.matId, matId));
    const order = (highWater?.value ?? 0) + 1;
    await this.db
      .update(matches)
      .set({ matId, scheduledOrder: order })
      .where(eq(matches.id, matchId));
  }

  // --- Row loading + mapping ----------------------------------------------

  private joined() {
    const aA = alias(athletes, 'athlete_a');
    const aB = alias(athletes, 'athlete_b');
    return this.db
      .select({
        id: matches.id,
        order: matches.scheduledOrder,
        status: matches.status,
        roundLabel: matches.roundLabel,
        scoreData: matches.scoreData,
        athleteAId: matches.athleteAId,
        athleteBId: matches.athleteBId,
        winnerId: matches.winnerId,
        divisionName: divisions.name,
        matName: mats.name,
        eventId: events.id,
        eventSlug: events.slug,
        aFirst: aA.firstName,
        aLast: aA.lastName,
        bFirst: aB.firstName,
        bLast: aB.lastName,
      })
      .from(matches)
      .innerJoin(divisions, eq(matches.divisionId, divisions.id))
      .innerJoin(events, eq(divisions.eventId, events.id))
      .leftJoin(mats, eq(matches.matId, mats.id))
      .leftJoin(aA, eq(matches.athleteAId, aA.id))
      .leftJoin(aB, eq(matches.athleteBId, aB.id));
  }

  private async loadEventMatches(eventId: string): Promise<MatchRow[]> {
    return (await this.joined().where(eq(events.id, eventId))) as MatchRow[];
  }

  private async loadMatch(matchId: string): Promise<MatchRow | null> {
    const rows = (await this.joined().where(eq(matches.id, matchId)).limit(1)) as MatchRow[];
    return rows[0] ?? null;
  }

  private toScheduleMatch(r: MatchRow): ScheduleMatch {
    const a = displayName(r.aFirst, r.aLast);
    const b = displayName(r.bFirst, r.bLast);
    return {
      id: r.id,
      order: r.order ?? 0,
      divisionName: r.divisionName,
      roundLabel: r.roundLabel ?? '',
      competitorA: a,
      competitorB: b,
      status: r.status,
      winner: this.winnerName(r, a, b),
      score: (r.scoreData as MatchScore | null) ?? zeroScore(),
    };
  }

  private toScoreable(r: MatchRow): ScoreableMatch {
    const a = displayName(r.aFirst, r.aLast) ?? 'TBD';
    const b = displayName(r.bFirst, r.bLast) ?? 'TBD';
    return {
      id: r.id,
      eventId: r.eventId,
      eventSlug: r.eventSlug,
      matName: r.matName ?? 'Unassigned',
      divisionName: r.divisionName,
      roundLabel: r.roundLabel ?? '',
      competitorA: a,
      competitorB: b,
      status: r.status,
      score: (r.scoreData as MatchScore | null) ?? zeroScore(),
      winner: this.winnerName(r, a, b),
    };
  }

  private winnerName(r: MatchRow, a: string | null, b: string | null): string | null {
    if (!r.winnerId) return null;
    if (r.winnerId === r.athleteAId) return a;
    if (r.winnerId === r.athleteBId) return b;
    return null;
  }
}
