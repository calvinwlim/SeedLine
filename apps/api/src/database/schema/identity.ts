import { relations } from 'drizzle-orm';
import { date, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

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
  // Stripe Connect account id; null until onboarding completes.
  stripeAccountId: varchar('stripe_account_id', { length: 120 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Academies/teams. Used for seeding separation and team scoring. */
export const academies = pgTable('academies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Athlete profile. May be linked to a login account, or stand alone (e.g. a minor). */
export const athletes = pgTable(
  'athletes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    academyId: uuid('academy_id').references(() => academies.id, { onDelete: 'set null' }),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    dateOfBirth: date('date_of_birth'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    academyIdx: index('athletes_academy_idx').on(table.academyId),
  }),
);

export const usersRelations = relations(users, ({ many, one }) => ({
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
