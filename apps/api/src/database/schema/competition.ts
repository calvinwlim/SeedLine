import { relations } from 'drizzle-orm';
import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import type { Bracket } from '@openmat/bracket-engine';
import {
  bracketFormatEnum,
  bracketStatusEnum,
  matchStatusEnum,
  paymentStatusEnum,
  registrationStatusEnum,
} from './enums';
import { athletes } from './identity';
import { divisions, events } from './events';

/** An athlete's entry into a division. */
export const registrations = pgTable(
  'registrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    divisionId: uuid('division_id')
      .notNull()
      .references(() => divisions.id, { onDelete: 'cascade' }),
    athleteId: uuid('athlete_id')
      .notNull()
      .references(() => athletes.id, { onDelete: 'restrict' }),
    status: registrationStatusEnum('status').notNull().default('pending'),
    seed: integer('seed'),
    weighInKg: doublePrecision('weigh_in_kg'),
    registeredAt: timestamp('registered_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // An athlete may only register once per division.
    uniqueEntry: uniqueIndex('registrations_division_athlete_idx').on(
      table.divisionId,
      table.athleteId,
    ),
    eventIdx: index('registrations_event_idx').on(table.eventId),
  }),
);

/**
 * The generated bracket for a division. The full structure (the engine output)
 * lives in `data` as JSON; the individual schedulable/scorable rows live in the
 * `matches` table below, linked by `engineMatchId`.
 */
export const brackets = pgTable('brackets', {
  id: uuid('id').primaryKey().defaultRandom(),
  divisionId: uuid('division_id')
    .notNull()
    .unique()
    .references(() => divisions.id, { onDelete: 'cascade' }),
  format: bracketFormatEnum('format').notNull(),
  status: bracketStatusEnum('status').notNull().default('not_generated'),
  data: jsonb('data').$type<Bracket | null>(),
  generatedAt: timestamp('generated_at', { withTimezone: true }),
});

/** A mat (ring) at an event, with the match currently assigned to it. */
export const mats = pgTable(
  'mats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 60 }).notNull(),
    // Soft link to the current match (no FK, to avoid a cycle with matches.matId).
    currentMatchId: uuid('current_match_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index('mats_event_idx').on(table.eventId),
  }),
);

/**
 * A schedulable, scorable match. Mirrors a node in the engine bracket
 * (`engineMatchId`). `scoreData` holds the ruleset-specific live score, and
 * `nextMatchId` records where the winner advances (soft self-reference).
 */
export const matches = pgTable(
  'matches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bracketId: uuid('bracket_id')
      .notNull()
      .references(() => brackets.id, { onDelete: 'cascade' }),
    divisionId: uuid('division_id')
      .notNull()
      .references(() => divisions.id, { onDelete: 'cascade' }),
    // The match id within the engine bracket, e.g. "W-R1-M1".
    engineMatchId: varchar('engine_match_id', { length: 40 }).notNull(),
    round: integer('round').notNull(),
    position: integer('position').notNull(),
    athleteAId: uuid('athlete_a_id').references(() => athletes.id, { onDelete: 'set null' }),
    athleteBId: uuid('athlete_b_id').references(() => athletes.id, { onDelete: 'set null' }),
    winnerId: uuid('winner_id').references(() => athletes.id, { onDelete: 'set null' }),
    matId: uuid('mat_id').references(() => mats.id, { onDelete: 'set null' }),
    status: matchStatusEnum('status').notNull().default('pending'),
    scoreData: jsonb('score_data'),
    scheduledOrder: integer('scheduled_order'),
    // Soft self-reference (the winner's next match); no FK to keep it acyclic.
    nextMatchId: uuid('next_match_id'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    bracketIdx: index('matches_bracket_idx').on(table.bracketId),
    matIdx: index('matches_mat_idx').on(table.matId),
    statusIdx: index('matches_status_idx').on(table.status),
  }),
);

/**
 * A podium result an athlete earned at an event — the source for the medal
 * shelves and "recent results" on athlete and academy profiles. Denormalized
 * alongside the live match data for now; a later phase derives it from results.
 */
export const medals = pgTable(
  'medals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    athleteId: uuid('athlete_id')
      .notNull()
      .references(() => athletes.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
    divisionName: varchar('division_name', { length: 200 }).notNull(),
    place: integer('place').notNull(),
    awardedAt: timestamp('awarded_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    athleteIdx: index('medals_athlete_idx').on(table.athleteId),
  }),
);

/** A payment for a registration, routed to the organizer via Stripe Connect. */
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  registrationId: uuid('registration_id')
    .notNull()
    .references(() => registrations.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 120 }),
  amountCents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Append-only audit trail — essential for reconstructing day-of disputes. */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
    actorUserId: uuid('actor_user_id'),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 60 }).notNull(),
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index('audit_logs_event_idx').on(table.eventId),
    entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  }),
);

export const registrationsRelations = relations(registrations, ({ one }) => ({
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
  division: one(divisions, { fields: [registrations.divisionId], references: [divisions.id] }),
  athlete: one(athletes, { fields: [registrations.athleteId], references: [athletes.id] }),
}));

export const bracketsRelations = relations(brackets, ({ one, many }) => ({
  division: one(divisions, { fields: [brackets.divisionId], references: [divisions.id] }),
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  bracket: one(brackets, { fields: [matches.bracketId], references: [brackets.id] }),
  mat: one(mats, { fields: [matches.matId], references: [mats.id] }),
}));

export const medalsRelations = relations(medals, ({ one }) => ({
  athlete: one(athletes, { fields: [medals.athleteId], references: [athletes.id] }),
  event: one(events, { fields: [medals.eventId], references: [events.id] }),
}));
