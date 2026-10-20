// Seeds a local test Postgres with one published note, to check /p/newton-raphson-x7k2 in the browser.
// DATABASE_URL=postgres://postgres:test@localhost:54329/postgres node tests/db/seed-public.mjs "$(pwd)"
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const root = process.argv[2];
const sql = postgres(process.env.DATABASE_URL, { prepare: false, onnotice: () => {} });
await sql.unsafe('drop schema if exists auth cascade; create schema auth; create table auth.users (id uuid primary key);');
await sql.unsafe('drop table if exists public.profiles, public.progress, public.activity_log, public.gem_ledger, public.notes, public.public_notes cascade;');
for (const f of fs.readdirSync(path.join(root, 'supabase/migrations')).sort()) {
  await sql.unsafe(fs.readFileSync(path.join(root, 'supabase/migrations', f), 'utf8'));
}
const uid = '22222222-2222-4222-8222-222222222222';
await sql`insert into auth.users (id) values (${uid})`;
await sql`insert into public.profiles (id, display_name, robot_name) values (${uid}, 'Test Author', 'Bolt')`;
const state = { version: 1, medals: { a: 1, b: 1, c: 1 }, owned: { banners: ['banner.orbit'] }, equipped: { banner: 'banner.orbit' } };
await sql`insert into public.progress (user_id, state) values (${uid}, ${sql.json(state)})`;
const data = {
  id: 'note-777',
  title: 'Newton-Raphson method',
  subtitle: 'Fast root finding with tangent lines.',
  tags: ['Newton Raphson', 'Unit 1'],
  look: { colour: 'indigo', cover: { kind: 'pattern', value: 'graph' } },
  blocks: [
    { id: 'b1', type: 'heading1', content: 'The idea' },
    { id: 'b2', type: 'paragraph', content: 'Start from a guess. Draw the tangent and see where it crosses the x-axis: that is the next, better guess.' },
    { id: 'b3', type: 'math', content: 'x_{n+1} = x_n - \\frac{f(x_n)}{f\'(x_n)}' },
    { id: 'b4', type: 'callout', content: 'If f\'(x) is close to 0 the step jumps far away.' },
    { id: 'b5', type: 'widget', widgetConfig: { algorithmId: 'newton-raphson' } },
    { id: 'b6', type: 'quiz', quizConfig: { question: 'Order of convergence near a simple root?', mode: 'mcq', options: ['Linear', 'Quadratic', 'Cubic'], correctOptionIndex: 1, explanation: 'Quadratic.' } },
    { id: 'b7', type: 'ink', content: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><script>alert(1)</script><path d="M10 70 Q100 0 190 70" stroke="orange" fill="none" stroke-width="4"/></svg>', caption: 'Sketch: tangent idea' },
  ],
};
await sql`insert into public.public_notes (slug, user_id, note_id, title, data) values ('newton-raphson-x7k2', ${uid}, 'note-777', ${data.title}, ${sql.json(data)})`;
await sql.end();
console.log('seeded /p/newton-raphson-x7k2');
