import { relations } from 'drizzle-orm';
import {
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { beltRankEnum, disciplineEnum, userRoleEnum } from './enums';

/** Login accounts. An account may be an athlete, organizer, staff member, or admin. */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 320 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    role: userRoleEnum('role').notNull().default('athlete'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  }),
);

/** An organizer profile owns events and holds the connected payments account. */
export const organizers = pgTable('organizers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  logoUrl: varchar('logo_url', { length: 500 }),
  // Stripe Connect account id; null until onboarding completes.
  stripeAccountId: varchar('stripe_account_id', { length: 120 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Academies/teams. Used for seeding separation and team scoring. Carries the
 * presentational fields shown on the public academy profile.
 */
export const academies = pgTable('academies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  description: text('description'),
  city: varchar('city', { length: 120 }),
  country: varchar('country', { length: 120 }),
  headCoach: varchar('head_coach', { length: 200 }),
  foundedYear: integer('founded_year'),
  affiliation: varchar('affiliation', { length: 200 }),
  website: varchar('website', { length: 500 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Athlete profile. May be linked to a login account, or stand alone (e.g. a minor).
 *
 * The `record` columns (matches…goldMedals) are denormalized for now so profiles
 * render without replaying every match. A later phase computes them from the
 * `matches` table and drops the denormalized copy.
 */
export const athletes = pgTable(
  'athletes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    academyId: uuid('academy_id').references(() => academies.id, { onDelete: 'set null' }),
    slug: varchar('slug', { length: 220 }).notNull().unique(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    beltRank: beltRankEnum('belt_rank').notNull().default('white'),
    discipline: disciplineEnum('discipline').notNull().default('gi'),
    weightClass: varchar('weight_class', { length: 60 }),
    ageCategory: varchar('age_category', { length: 60 }),
    country: varchar('country', { length: 120 }),
    bio: text('bio'),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    dateOfBirth: date('date_of_birth'),
    matchesCount: integer('matches_count').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    losses: integer('losses').notNull().default(0),
    draws: integer('draws').notNull().default(0),
    submissions: integer('submissions').notNull().default(0),
    goldMedals: integer('gold_medals').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    academyIdx: index('athletes_academy_idx').on(table.academyId),
  }),
);

export const usersRelations = relations(users, ({ one }) => ({
  organizer: one(organizers, { fields: [users.id], references: [organizers.userId] }),
  athlete: one(athletes, { fields: [users.id], references: [athletes.userId] }),
}));

export const academiesRelations = relations(academies, ({ many }) => ({
  athletes: many(athletes),
}));

export const athletesRelations = relations(athletes, ({ one }) => ({
  academy: one(academies, { fields: [athletes.academyId], references: [academies.id] }),
  user: one(users, { fields: [athletes.userId], references: [users.id] }),
}));
