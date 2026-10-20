/**
 * Runs the real webhook code (src/db/billingStore.js and the signature check in
 * src/lib/razorpay/server.js) against a real Postgres: applies supabase/migrations, then feeds it
 * signed Razorpay events the way api/billing/webhook does.
 *
 *   docker run -d --name netz-pg-test -e POSTGRES_PASSWORD=test -p 54329:5432 postgres:16-alpine
 *   DATABASE_URL=postgres://postgres:test@localhost:54329/postgres node tests/db/billing-db.mjs
 *
 * The app files are bundled with esbuild first ('@/…' paths, and 'server-only' stubbed out).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import postgres from 'postgres';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'node_modules/.cache/netz-tests');
fs.mkdirSync(outDir, { recursive: true });
const stub = path.join(outDir, 'server-only-stub.js');
fs.writeFileSync(stub, 'export {};\n');
const entry = path.join(outDir, 'billing-entry.js');
fs.writeFileSync(entry, `
export { applyBillingEvent, listPurchases, getProStatus } from '@/db/billingStore';
export { isValidWebhookSignature } from '@/lib/razorpay/server';
export { publishNote } from '@/db/publicNotesStore';
`);
const outfile = path.join(outDir, 'billing-bundle.mjs');
await esbuild.build({
  entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile, packages: 'external', logLevel: 'error',
  alias: { '@': path.join(root, 'src'), 'server-only': stub },
});
process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_only';
const { applyBillingEvent, listPurchases, getProStatus, isValidWebhookSignature, publishNote } = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);

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
await client.unsafe('drop schema if exists auth cascade; create schema auth; create table auth.users (id uuid primary key);');
await client.unsafe('drop table if exists public.profiles, public.progress, public.activity_log, public.gem_ledger, public.notes, public.public_notes, public.purchases, public.payments, public.billing_events cascade;');
for (const file of fs.readdirSync(path.join(root, 'supabase/migrations')).sort()) {
  await client.unsafe(fs.readFileSync(path.join(root, 'supabase/migrations', file), 'utf8'));
}
const user = '22222222-2222-4222-8222-222222222222';
const other = '33333333-3333-4333-8333-333333333333';
const freeUser = '44444444-4444-4444-8444-444444444444';
await client.unsafe(`insert into auth.users (id) values ('${user}'), ('${other}'), ('${freeUser}')`);

/** What the webhook route does with one delivery: check the signature, then apply the event. */
async function deliver(id, event, { sign = true } = {}) {
  const raw = JSON.stringify(event);
  const signature = sign ? crypto.createHmac('sha256', 'whsec_test_only').update(raw).digest('hex') : 'forged';
  if (!isValidWebhookSignature(raw, signature)) return { applied: false, reason: 'bad_signature' };
  return applyBillingEvent(id, JSON.parse(raw));
}

const DAY = 86400000;
const sec = (ms) => Math.floor(ms / 1000);
const now = Date.now();
const notes = (plan, currency = 'INR', u = user) => ({ user_id: u, plan, currency });
const subEvent = (type, end, paymentId) => ({
  event: type,
  payload: {
    subscription: { entity: { id: 'sub_A', current_end: sec(end), notes: notes('monthly') } },
    ...(paymentId ? { payment: { entity: { id: paymentId, amount: 19900, currency: 'INR', method: 'upi', created_at: sec(now) } } } : {}),
  },
});

// The start route records the purchase first
await client`insert into purchases (id, user_id, plan, currency, amount) values ('sub_A', ${user}, 'monthly', 'INR', 19900)`;
expect('started: not Pro yet', !(await getProStatus(user)).pro);

let r = await deliver('evt_forged', subEvent('subscription.charged', now + 30 * DAY, 'pay_1'), { sign: false });
expect('forged signature refused', r.reason === 'bad_signature' && !(await getProStatus(user)).pro);

r = await deliver('evt_1', subEvent('subscription.charged', now + 30 * DAY, 'pay_1'));
let s = await getProStatus(user);
expect('charged: Pro, renewing', r.applied && s.pro && s.renews && s.plan === 'monthly');
const [pay] = await client`select * from payments where id = 'pay_1'`;
expect('payment recorded', pay && pay.amount === 19900 && pay.user_id === user && pay.method === 'upi');

r = await deliver('evt_1', subEvent('subscription.charged', now + 30 * DAY, 'pay_1'));
expect('same event twice: second ignored', !r.applied && r.reason === 'duplicate');
const [{ n }] = await client`select count(*)::int as n from payments`;
expect('no duplicate payment', n === 1);

await deliver('evt_2', subEvent('subscription.charged', now + 60 * DAY, 'pay_2'));
await deliver('evt_old', subEvent('subscription.activated', now + 30 * DAY));
s = await getProStatus(user);
expect('renewal extends; a late older event does not shorten it', Math.abs(s.until.getTime() - sec(now + 60 * DAY) * 1000) < 1000);

await deliver('evt_3', subEvent('subscription.cancelled', now + 60 * DAY));
s = await getProStatus(user);
expect('cancelled: still Pro until the end, not renewing', s.pro && !s.renews);

// Parallel deliveries of the same event: exactly one applies
const results = await Promise.all([1, 2, 3].map(() => deliver('evt_par', subEvent('subscription.charged', now + 90 * DAY, 'pay_3'))));
expect('parallel duplicates: one applied', results.filter((x) => x.applied).length === 1, JSON.stringify(results));

// Someone else's notes on this subscription id are refused
r = await deliver('evt_x', { event: 'subscription.charged', payload: { subscription: { entity: { id: 'sub_A', current_end: sec(now + 400 * DAY), notes: notes('monthly', 'INR', other) } } } });
expect('user mismatch refused', !r.applied && r.reason === 'user_mismatch');

// Lifetime: underpaid order never unlocks; a full one does
const order = (id, amount) => ({
  event: 'order.paid',
  payload: {
    order: { entity: { id, amount: 349900, amount_paid: amount, notes: notes('lifetime', 'INR', other) } },
    payment: { entity: { id: `pay_${id}`, amount, currency: 'INR', method: 'card', created_at: sec(now) } },
  },
});
r = await deliver('evt_l1', order('order_low', 100));
expect('underpaid lifetime refused', !r.applied && r.reason === 'underpaid' && !(await getProStatus(other)).pro);
r = await deliver('evt_l2', order('order_full', 349900));
s = await getProStatus(other);
expect('lifetime: Pro for life (purchase created from the event)', r.applied && s.pro && s.lifetime);

// A full refund ends the Pro it paid for
r = await deliver('evt_r1', { event: 'refund.processed', payload: { refund: { entity: { id: 'rfnd_1', payment_id: 'pay_order_full', amount: 349900 } }, payment: { entity: { id: 'pay_order_full', amount: 349900, amount_refunded: 349900 } } } });
expect('full refund: lifetime ends', r.applied && !(await getProStatus(other)).pro);
const [refunded] = await client`select refunded from payments where id = 'pay_order_full'`;
expect('refund amount recorded', refunded.refunded === 349900);

r = await deliver('evt_r2', { event: 'refund.processed', payload: { refund: { entity: { id: 'rfnd_2', payment_id: 'pay_unknown', amount: 5 } } } });
expect('refund for an unknown payment is ignored', !r.applied && r.reason === 'unknown_payment');

expect('purchases listed per user', (await listPurchases(user)).length === 1 && (await listPurchases(other)).length === 1, 'the underpaid order is never saved');

// Server limits follow the real Pro status: 2 public notes free, 25 with Pro
const note = (n) => ({ id: `note-${n}`, title: `Note ${n}`, blocks: [{ id: 'b1', type: 'paragraph', content: 'Hi' }] });
const freeResults = [];
for (let n = 1; n <= 3; n++) freeResults.push(await publishNote(freeUser, note(n), -330));
expect('free: 2 public notes, the third refused', freeResults[0].ok && freeResults[1].ok && !freeResults[2].ok && freeResults[2].error === 'limit_reached' && freeResults[2].limit === 2);
const proResults = [];
for (let n = 1; n <= 3; n++) proResults.push(await publishNote(user, note(n), -330));
expect('Pro (monthly, cancelled at end but paid): 3 public notes, limit 25', proResults.every((x) => x.ok) && proResults[2].limit === 25, JSON.stringify(proResults.map((x) => x.error || x.limit)));

await client.end();
console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
