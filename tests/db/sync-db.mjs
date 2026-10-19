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
await client.unsafe('drop table if exists public.profiles, public.progress, public.activity_log, public.gem_ledger cascade;');
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

const rls = await client.unsafe("select relname, relrowsecurity from pg_class where relname in ('profiles','progress','activity_log','gem_ledger')");
expect('row-level security on all 4 tables', rls.length === 4 && rls.every((r) => r.relrowsecurity));

await client.end();
console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
