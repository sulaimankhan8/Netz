import { bigint, bigserial, boolean, date, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

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

// Cloud copy of notes: the newest version (changedAt, ms) wins; deleted ones stay as tombstones
export const notes = pgTable('notes', {
  userId: uuid('user_id').notNull(),
  id: text('id').notNull(),
  data: jsonb('data').notNull(),
  changedAt: bigint('changed_at', { mode: 'number' }).notNull(),
  deleted: boolean('deleted').notNull().default(false),
  serverUpdatedAt: timestamp('server_updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.id] }), index('notes_user_server_updated').on(t.userId, t.serverUpdatedAt)]);

// Notes Studio Assets library: boards, pictures and files; the files themselves are in the
// private Storage bucket `note-assets` (supabase/migrations/20261024000000_note_assets.sql)
export const noteAssets = pgTable('note_assets', {
  userId: uuid('user_id').notNull(),
  id: text('id').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull().default(''),
  mime: text('mime').notNull().default(''),
  ext: text('ext').notNull().default(''),
  bytes: bigint('bytes', { mode: 'number' }).notNull().default(0),
  pageCount: integer('page_count').notNull().default(0),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.id] })]);

// Notes published to the web at /p/<slug>: a snapshot, updated only when the author asks
export const publicNotes = pgTable('public_notes', {
  slug: text('slug').primaryKey(),
  userId: uuid('user_id').notNull(),
  noteId: text('note_id').notNull(),
  title: text('title').notNull().default(''),
  data: jsonb('data').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  views: integer('views').notNull().default(0),
}, (t) => [uniqueIndex('public_notes_user_note').on(t.userId, t.noteId)]);

// Gems spent or given outside tasks (shop, Razorpay, rewarded ads); one row per reason per user
export const gemLedger = pgTable('gem_ledger', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull(),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('gem_ledger_user_reason').on(t.userId, t.reason)]);

// NETZ Pro bought through Razorpay (NETZ_LAUNCH_PLAN.md 5.2). One row per Razorpay subscription
// (monthly, yearly) or order (lifetime); only the webhook marks one paid
export const purchases = pgTable('purchases', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  plan: text('plan').notNull(),
  currency: text('currency').notNull(),
  amount: integer('amount').notNull(),
  // created → active / paid → cancelled, halted, completed, refunded
  status: text('status').notNull().default('created'),
  // Pro lasts until this moment; null for lifetime
  paidUntil: timestamp('paid_until', { withTimezone: true }),
  cancelAtEnd: boolean('cancel_at_end').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('purchases_user').on(t.userId)]);

// Every Razorpay payment, kept for accounts and tax
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  purchaseId: text('purchase_id').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  method: text('method').notNull().default(''),
  refunded: integer('refunded').notNull().default(0),
  paidAt: timestamp('paid_at', { withTimezone: true }).notNull(),
}, (t) => [index('payments_purchase').on(t.purchaseId)]);

// Webhook events already handled, so a repeated delivery changes nothing
export const billingEvents = pgTable('billing_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
});
