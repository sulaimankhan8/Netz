/** What NETZ Pro changes in the progress engine and the server limits (NETZ_LAUNCH_PLAN.md 2.7, 5.1). */

const { newProgressState, reduceActivity } = await import('./src/app/utils/progress/engine.js');
const { PRO_TASKS, PRO_SEASONS, MAX_FREEZES } = await import('./src/app/utils/progress/catalog.js');
const { syncProgress } = await import('./src/app/utils/progress/syncCore.js');
const { ownedBanners, ownedSkins, equipItem } = await import('./src/app/utils/progress/shop.js');
const { cloudNoteLimit, publicNoteLimit } = await import('./src/app/utils/proLimits.js');
const { isProOnDevice } = await import('./src/app/utils/proClient.js');

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const DAY = 86400000;
const start = Date.parse('2026-10-05T10:00:00Z');
const dayOf = (ms) => new Date(ms).toISOString().slice(0, 10);
let clock = start;
const run = (state, kind, details, { pro = true, at } = {}) => {
  clock = at ?? clock + 2 * 60 * 1000;
  return reduceActivity(state, kind, details, clock, dayOf(clock), { pro });
};

expect('10 Pro tasks for 2026', PRO_TASKS.filter((t) => t.id.startsWith('pro.2026.')).length === 10 && !!PRO_SEASONS[2026]);
expect('limits: free 20 cloud notes and 2 links; Pro unlimited and 25', cloudNoteLimit(false) === 20 && cloudNoteLimit(true) === null && publicNoteLimit(false) === 2 && publicNoteLimit(true) === 25);
expect('no window: device never thinks it is Pro', isProOnDevice() === false);

// Free students never count Pro tasks
let s = newProgressState();
['euler', 'runge-kutta', 'lu'].forEach((m) => run(s, 'solver.run', { method: m, unit: 4 }, { pro: false }));
expect('free: Unit 4 trio not counted', !s.proTasks?.['2026']?.['pro.2026.unit4-trio']);
expect('free: no monthly freeze', s.streak.freezes === 0);

// Pro: the monthly freeze, once per month, never above the maximum
s = newProgressState();
let r = run(s, 'solver.run', { method: 'euler', unit: 4 });
expect('Pro: one free freeze this month', s.streak.freezes === 1 && r.events.some((e) => e.type === 'proFreeze'));
run(s, 'solver.run', { method: 'runge-kutta', unit: 4 });
expect('only once a month', s.streak.freezes === 1);
r = run(s, 'solver.run', { method: 'lu', unit: 4 });
expect('3 Unit 4 methods in a day: Pro task done', !!s.proTasks['2026']['pro.2026.unit4-trio'] && r.events.some((e) => e.type === 'proTask' && e.count === 1));
s.streak.freezes = MAX_FREEZES;
s.proFreezeMonth = '2026-10';
run(s, 'solver.run', { method: 'taylor', unit: 4 }, { at: Date.parse('2026-11-01T10:00:00Z') });
expect('next month: no freeze above the maximum, month still marked', s.streak.freezes === MAX_FREEZES && s.proFreezeMonth === '2026-11');

// Rewards at 3, 6 and 10, kept after Pro ends
s = newProgressState();
clock = start;
run(s, 'note.saved', { blocks: 4, hasWidget: true, hasQuiz: true });
run(s, 'ink.converted', { kind: 'math' });
run(s, 'ink.converted', { kind: 'text' });
expect('2 Pro tasks: no banner yet', !ownedBanners(s).includes('banner.circuit-night'));
for (let i = 1; i <= 5; i++) r = run(s, 'quiz.correct', { blockId: `q${i}` });
expect('3 Pro tasks: banner unlocked', ownedBanners(s).includes('banner.circuit-night') && r.events.some((e) => e.type === 'proReward' && e.kind === 'banner'));
const integral = { fn: 'x^2', a: 0, b: 1, unit: 3 };
['trapezoidal', 'simpson-13', 'simpson-38', 'boole', 'weddle', 'gauss-quadrature'].forEach((m) => run(s, 'solver.run', { method: m, ...integral }));
[['bisection', 1], ['lagrange', 2], ['euler', 4], ['runge-kutta', 4], ['lu', 4], ['chi-square', 5]].forEach(([m, unit]) => run(s, 'solver.run', { method: m, unit }));
const done = Object.keys(s.proTasks['2026']);
expect('quiz five, all six rules, Unit 4 trio, every unit in a day', ['pro.2026.quiz-five', 'pro.2026.all-rules', 'pro.2026.unit4-trio', 'pro.2026.five-units'].every((id) => done.includes(id)), done.join(','));
expect('6 Pro tasks: skin unlocked', done.length >= 6 && ownedSkins(s).includes('skin.circuit-2026'));
expect('Pro skin can be worn once earned', equipItem(s, 'skin.circuit-2026').ok);

// Ten methods in the month (already 10 different above), 7-day streak, goal on 5 days, month medal
expect('ten different methods in a month', done.includes('pro.2026.ten-methods'));
for (let d = 1; d <= 20; d++) {
  const at = start + d * DAY;
  ['newton-raphson', 'secant', 'lagrange'].forEach((m, i) => run(s, 'solver.run', { method: m, unit: i < 2 ? 1 : 2 }, { at: at + i * 120000 }));
}
const all = Object.keys(s.proTasks['2026']);
expect('all 10 Pro tasks within one month', all.length === 10, all.join(','));
expect('Pro medal at 10', !!s.medals['pro.2026']);

// After Pro ends: rewards stay, nothing new counts
const before = JSON.stringify(s.proTasks);
run(s, 'solver.run', { method: 'jacobi', unit: 4 }, { pro: false, at: Date.parse('2026-12-01T10:00:00Z') });
expect('after Pro: rewards kept', ownedSkins(s).includes('skin.circuit-2026') && ownedBanners(s).includes('banner.circuit-night') && !!s.medals['pro.2026']);
expect('after Pro: Pro tasks unchanged', JSON.stringify(s.proTasks) === before);

// A year with no season counts nothing
s = newProgressState();
run(s, 'note.saved', { hasWidget: true, hasQuiz: true }, { at: Date.parse('2027-02-01T10:00:00Z') });
expect('2027 has no season yet: nothing counted', !s.proTasks?.['2027'] || Object.keys(s.proTasks['2027']).length === 0);

// The server counts Pro only when it says so
const free = syncProgress({ stored: null, activities: [{ kind: 'note.saved', details: { hasWidget: true, hasQuiz: true }, at: Date.now() - 1000 }], tz: -330, now: Date.now() });
const paid = syncProgress({ stored: null, activities: [{ kind: 'note.saved', details: { hasWidget: true, hasQuiz: true }, at: Date.now() - 1000 }], tz: -330, now: Date.now(), pro: true });
const year = new Date().getUTCFullYear();
expect('server: free sync counts no Pro task', !free.state.proTasks?.[year]?.[`pro.${year}.live-note`]);
expect('server: Pro sync counts it (in a season year)', !PRO_SEASONS[year] || !!paid.state.proTasks[year][`pro.${year}.live-note`]);

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
