/**
 * Runs the progress sync against a real Postgres: applies supabase/migrations, then does what
 * api/progress/sync does (row lock, insert/update, activity log) for a new and an existing account.
 *
 *   docker run -d --name netz-pg-test -e POSTGRES_PASSWORD=test -p 54329:5432 postgres:16-alpine
 *   DATABASE_URL=postgres://postgres:test@localhost:54329/postgres node tests/db/sync-db.mjs
 *
 * Supabase's auth.users table is stood in for by a minimal one, so the foreign keys work.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const schema = await import(`file://${root}/src/db/schema.js`);
const { syncProgress } = await import(`file://${root}/src/app/utils/progress/syncCore.js`);
const { profiles, progress, activityLog } = schema;

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 3, onnotice: () => {} });
const db = drizzle(client, { schema });

await client.unsafe('drop schema if exists auth cascade; create schema auth; create table auth.users (id uuid primary key);');
await client.unsafe('drop table if exists public.profiles, public.progress, public.activity_log, public.gem_ledger, public.notes, public.public_notes cascade;');
const migrations = fs.readdirSync(path.join(root, 'supabase/migrations')).sort();
for (const file of migrations) await client.unsafe(fs.readFileSync(path.join(root, 'supabase/migrations', file), 'utf8'));

const userId = '11111111-1111-4111-8111-111111111111';
await client.unsafe(`insert into auth.users (id) values ('${userId}')`);

/** The route's transaction, without Next.js and Supabase Auth around it. */
async function routeSync(body) {
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(progress).where(eq(progress.userId, userId)).for('update');
    const stored = rows[0]?.state || null;
    const out = syncProgress({ stored, activities: body.activities, device: stored ? null : body.device, profile: body.profile, tz: body.tz, now: Date.now() });
    if (out.isNew) {
      await tx.insert(profiles).values({ id: userId, displayName: out.state.displayName || '', robotName: out.state.robotName || '' }).onConflictDoNothing();
    } else if (body.profile) {
      await tx.update(profiles).set({ displayName: out.state.displayName || '', robotName: out.state.robotName || '' }).where(eq(profiles.id, userId));
    }
    await tx.insert(progress).values({ userId, state: out.state, updatedAt: sql`now()` })
      .onConflictDoUpdate({ target: progress.userId, set: { state: out.state, updatedAt: sql`now()` } });
    if (out.logRows.length) await tx.insert(activityLog).values(out.logRows.map((r) => ({ ...r, userId })));
    return out;
  });
}

const now = Date.now();
const first = await routeSync({
  tz: -330,
  profile: { robotName: 'Bolt', displayName: 'Test' },
  activities: [{ kind: 'solver.run', details: { method: 'bisection', unit: 1 }, at: now - 1000 }],
});
expect('first sync is a new account', first.isNew);

const [p] = await db.select().from(profiles).where(eq(profiles.id, userId));
expect('profile row', p && p.robotName === 'Bolt' && p.displayName === 'Test');
const [row] = await db.select().from(progress).where(eq(progress.userId, userId));
expect('progress stored as JSON', row && row.state.tasksFirstDone['unit1.bisection'] && row.state.medals['onboard.account']);

const second = await routeSync({ tz: -330, profile: { robotName: 'Bolty' }, activities: [{ kind: 'quiz.correct', details: { blockId: 'b1' }, at: now - 500 }] });
expect('second sync is not new', !second.isNew);
const [row2] = await db.select().from(progress).where(eq(progress.userId, userId));
expect('second sync kept the first', row2.state.tasksFirstDone['unit1.bisection'] && row2.state.tasksFirstDone['notes.quiz-correct']);
const [p2] = await db.select().from(profiles).where(eq(profiles.id, userId));
expect('robot name updated', p2.robotName === 'Bolty');

const logs = await db.select().from(activityLog).where(eq(activityLog.userId, userId));
expect('activity log rows', logs.length === 3, String(logs.length));

// Two syncs at once: the row lock makes them run one after the other, so nothing is lost
await Promise.all([
  routeSync({ tz: -330, activities: [{ kind: 'solver.run', details: { method: 'secant', unit: 1 }, at: now - 100 }] }),
  routeSync({ tz: -330, activities: [{ kind: 'solver.run', details: { method: 'lu', unit: 4 }, at: now - 100 }] }),
]);
const [row3] = await db.select().from(progress).where(eq(progress.userId, userId));
expect('parallel syncs both kept', row3.state.tasksFirstDone['unit1.secant'] && row3.state.tasksFirstDone['unit4.lu']);

// Shop: the same row lock as src/db/progressStore.js; two buys at once must charge only once
const { buyItem } = await import(`file://${root}/src/app/utils/progress/shop.js`);
const { gemLedger } = schema;
async function routeBuy(itemId) {
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(progress).where(eq(progress.userId, userId)).for('update');
    const state = rows[0].state;
    const result = buyItem(state, itemId, Date.now());
    if (!result.ok) return result;
    await tx.insert(gemLedger).values({ userId, amount: result.ledger.amount, reason: result.ledger.reason });
    await tx.update(progress).set({ state, updatedAt: sql`now()` }).where(eq(progress.userId, userId));
    return result;
  });
}
await db.execute(sql`update public.progress set state = jsonb_set(state, '{gems}', '300') where user_id = ${userId}`);
const buys = await Promise.allSettled([routeBuy('banner.hex-net'), routeBuy('banner.hex-net')]);
const wins = buys.filter((b) => b.status === 'fulfilled' && b.value.ok).length;
const [afterBuy] = await db.select().from(progress).where(eq(progress.userId, userId));
const spent = await db.select().from(gemLedger).where(eq(gemLedger.userId, userId));
expect('parallel buys: one succeeds', wins === 1, String(wins));
expect('parallel buys: charged once', afterBuy.state.gems === 50 && spent.length === 1, `${afterBuy.state.gems} gems, ${spent.length} ledger rows`);

// Notes cloud copy: the same transaction as api/notes/sync
const { planNoteWrites } = await import(`file://${root}/src/app/(Primary.pages)/Notes/utils/notesCore.js`);
const { notes } = schema;
const { and } = await import('drizzle-orm');
async function routeNotes(body) {
  const since = body.since || null;
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
    const stored = await tx.select({ id: notes.id, changedAt: notes.changedAt, deleted: notes.deleted }).from(notes).where(eq(notes.userId, userId));
    const plan = planNoteWrites(new Map(stored.map((n) => [n.id, n])), body.pushes, body.deletions, 20);
    for (const w of plan.writes) {
      await tx.insert(notes).values({ userId, id: w.id, data: w.data, changedAt: w.changedAt, deleted: w.deleted, serverUpdatedAt: sql`now()` })
        .onConflictDoUpdate({ target: [notes.userId, notes.id], set: { data: w.data, changedAt: w.changedAt, deleted: w.deleted, serverUpdatedAt: sql`now()` } });
    }
    const changed = await tx.select().from(notes).where(since ? and(eq(notes.userId, userId), sql`${notes.serverUpdatedAt} > ${since}::timestamptz`) : eq(notes.userId, userId));
    const [{ cursor }] = await tx.execute(sql`select to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as cursor`);
    return { plan, changed, cursor };
  });
}
const n1 = { id: 'note-1', title: 'Roots', blocks: [] };
let ns = await routeNotes({ pushes: [{ id: 'note-1', data: n1, changedAt: 100 }, { id: 'note-2', data: { id: 'note-2', title: 'Two' }, changedAt: 100 }] });
expect('notes: two stored and returned', ns.changed.length === 2 && ns.plan.writes.length === 2);
const cursor1 = ns.cursor;
await new Promise((r) => setTimeout(r, 20));
ns = await routeNotes({ pushes: [{ id: 'note-1', data: { ...n1, title: 'Old' }, changedAt: 50 }], since: cursor1 });
expect('notes: older push ignored, nothing new since cursor', ns.plan.writes.length === 0 && ns.changed.length === 0);
ns = await routeNotes({ pushes: [{ id: 'note-1', data: { ...n1, title: 'Roots 2' }, changedAt: 200 }], deletions: [{ id: 'note-2', changedAt: 200 }], since: cursor1 });
const back = Object.fromEntries(ns.changed.map((n) => [n.id, n]));
expect('notes: newer edit and tombstone come back since cursor', back['note-1']?.data.title === 'Roots 2' && back['note-2']?.deleted === true);
const parallel = await Promise.all([
  routeNotes({ pushes: [{ id: 'note-p', data: { id: 'note-p', v: 1 }, changedAt: 300 }] }),
  routeNotes({ pushes: [{ id: 'note-p', data: { id: 'note-p', v: 2 }, changedAt: 301 }] }),
]);
const [pRow] = await db.select().from(notes).where(and(eq(notes.userId, userId), eq(notes.id, 'note-p')));
expect('notes: parallel syncs keep the newest', parallel.length === 2 && pRow.data.v === 2 && pRow.changedAt === 301);

// Publishing: the same transaction as src/db/publicNotesStore.js publishNote
const { canPublishMore, makeSlug, preparePublicCopy } = await import(`file://${root}/src/app/(Primary.pages)/Notes/utils/publishCore.js`);
const { reduceActivity } = await import(`file://${root}/src/app/utils/progress/engine.js`);
const { dayAt } = await import(`file://${root}/src/app/utils/progress/syncCore.js`);
const { publicNotes } = schema;
async function routePublish(note) {
  const copy = preparePublicCopy(note);
  if (!copy.ok) return copy;
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`publish:${userId}`}))`);
    const mine = await tx.select().from(publicNotes).where(eq(publicNotes.userId, userId));
    if (!canPublishMore(mine.map((m) => m.noteId), copy.noteId)) return { ok: false, error: 'limit_reached' };
    let saved;
    const existing = mine.find((m) => m.noteId === copy.noteId);
    if (existing) {
      [saved] = await tx.update(publicNotes).set({ title: copy.title, data: copy.data, updatedAt: sql`now()` })
        .where(and(eq(publicNotes.userId, userId), eq(publicNotes.noteId, copy.noteId))).returning();
    } else {
      [saved] = await tx.insert(publicNotes).values({ slug: makeSlug(copy.title), userId, noteId: copy.noteId, title: copy.title, data: copy.data })
        .onConflictDoNothing({ target: publicNotes.slug }).returning();
    }
    const [p] = await tx.select().from(progress).where(eq(progress.userId, userId)).for('update');
    const now = Date.now();
    reduceActivity(p.state, 'note.published', { slug: saved.slug }, now, dayAt(now, -330));
    await tx.update(progress).set({ state: p.state, updatedAt: sql`now()` }).where(eq(progress.userId, userId));
    return { ok: true, slug: saved.slug };
  });
}
const pubNote = (id, title) => ({ id, title, blocks: [{ id: 'b1', type: 'paragraph', content: title }], accessKey: 'NETZ-SECRET' });
const pubA = await routePublish(pubNote('note-a', 'Newton Raphson'));
const pubB = await routePublish(pubNote('note-b', 'Simpson rule'));
const pubC = await routePublish(pubNote('note-c', 'Third one'));
expect('publish: two allowed, third blocked', pubA.ok && pubB.ok && !pubC.ok && pubC.error === 'limit_reached');
const pubA2 = await routePublish({ ...pubNote('note-a', 'Newton Raphson v2') });
const [aRow] = await db.select().from(publicNotes).where(eq(publicNotes.slug, pubA.slug));
expect('publish: update keeps the same link, private fields dropped', pubA2.ok && pubA2.slug === pubA.slug && aRow.title === 'Newton Raphson v2' && !aRow.data.accessKey);
const [progAfter] = await db.select().from(progress).where(eq(progress.userId, userId));
expect('publish: task 50 counted on the server', !!progAfter.state.tasksFirstDone['sharing.publish']);
await db.delete(publicNotes).where(and(eq(publicNotes.userId, userId), eq(publicNotes.noteId, 'note-b')));
const pubC2 = await routePublish(pubNote('note-c', 'Third one'));
expect('publish: unpublishing frees a place', pubC2.ok);

const rls = await client.unsafe("select relname, relrowsecurity from pg_class where relname in ('profiles','progress','activity_log','gem_ledger','notes','public_notes')");
expect('row-level security on all 6 tables', rls.length === 6 && rls.every((r) => r.relrowsecurity));

await client.end();
console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
