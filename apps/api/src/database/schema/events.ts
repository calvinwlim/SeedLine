import { relations } from 'drizzle-orm';
import {
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  beltRankEnum,
  bracketFormatEnum,
  disciplineEnum,
  eventStatusEnum,
  genderEnum,
  rulesetEnum,
} from './enums';
import { organizers } from './identity';

/** A competition event run by an organizer. */
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id')
      .notNull()
      .references(() => organizers.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 220 }).notNull().unique(),
    description: text('description'),
    venueName: varchar('venue_name', { length: 200 }),
    address: varchar('address', { length: 400 }),
    city: varchar('city', { length: 120 }),
    country: varchar('country', { length: 120 }),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    registrationOpensAt: timestamp('registration_opens_at', { withTimezone: true }),
    registrationClosesAt: timestamp('registration_closes_at', { withTimezone: true }),
    status: eventStatusEnum('status').notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    organizerIdx: index('events_organizer_idx').on(table.organizerId),
    statusIdx: index('events_status_idx').on(table.status),
    startDateIdx: index('events_start_date_idx').on(table.startDate),
  }),
);

/**
 * A division is a single competition slot defined by a combination of
 * attributes. Athletes register into exactly one division (per event).
 */
export const divisions = pgTable(
  'divisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    discipline: disciplineEnum('discipline').notNull(),
    gender: genderEnum('gender').notNull(),
    beltRank: beltRankEnum('belt_rank'),
    ageCategory: varchar('age_category', { length: 60 }),
    ageMin: integer('age_min'),
    ageMax: integer('age_max'),
    weightClass: varchar('weight_class', { length: 60 }),
    weightLimitKg: doublePrecision('weight_limit_kg'),
    ruleset: rulesetEnum('ruleset').notNull().default('ibjjf'),
    format: bracketFormatEnum('format').notNull().default('single_elimination'),
    priceCents: integer('price_cents').notNull().default(0),
    capacity: integer('capacity'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index('divisions_event_idx').on(table.eventId),
  }),
);

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(organizers, { fields: [events.organizerId], references: [organizers.id] }),
  divisions: many(divisions),
}));

export const divisionsRelations = relations(divisions, ({ one }) => ({
  event: one(events, { fields: [divisions.eventId], references: [events.id] }),
}));
