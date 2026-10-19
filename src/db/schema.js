import { bigserial, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, date } from 'drizzle-orm/pg-core';

/**
 * NETZ database tables (NETZ_LAUNCH_PLAN.md 4.3). Plain Postgres, so the same schema runs on
 * Supabase today and on any Postgres later. The SQL that creates them, with row-level security,
 * is in supabase/migrations/.
 *
 * User ids are Supabase Auth user ids.
 */

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  displayName: text('display_name').notNull().default(''),
  robotName: text('robot_name').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// The server's copy of the progress engine state; only the server writes it
export const progress = pgTable('progress', {
  userId: uuid('user_id').primaryKey(),
  state: jsonb('state').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Every activity a device reported, for audits and re-counting
export const activityLog = pgTable('activity_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull(),
  kind: text('kind').notNull(),
  details: jsonb('details').notNull().default({}),
  localDay: date('local_day').notNull(),
  at: timestamp('at', { withTimezone: true }).notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('activity_log_user_received').on(t.userId, t.receivedAt)]);

// Gems spent or given outside tasks (shop, Razorpay, rewarded ads); one row per reason per user
export const gemLedger = pgTable('gem_ledger', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull(),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('gem_ledger_user_reason').on(t.userId, t.reason)]);
