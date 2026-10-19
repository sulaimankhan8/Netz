/**
 * Tasks, gems, streaks and medals on the device (src/app/utils/progress). Runs the engine against a
 * fake localStorage and moves the clock day by day.
 */

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
};

const { applyActivity, loadProgress, currentStreak, progressSummary, resetProgress, localDay } = await import('./src/app/utils/progress/engine.js');
const { TASKS, ONBOARDING, STREAK_MEDALS } = await import('./src/app/utils/progress/catalog.js');

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const day = (n, hour = 12) => new Date(2026, 9, n, hour, 0, 0).getTime();
const solve = (method, at, extra = {}) => applyActivity('solver.run', { method, unit: 1, ...extra }, at);
const types = (r) => r.events.map((e) => e.type);

// Catalog size matches the task sheet
expect('50 tasks', TASKS.length === 50, `got ${TASKS.length}`);
expect('5 onboarding tasks', ONBOARDING.length === 5);
expect('20 streak medals, last at 1000', STREAK_MEDALS.length === 20 && STREAK_MEDALS[19].days === 1000);
expect('task ids are unique', new Set(TASKS.map((t) => t.id)).size === 50);

// First solve: task medal, onboarding medal, 1-day streak medal
resetProgress();
let r = solve('bisection', day(1, 10));
expect('first solve events', ['taskFirst', 'onboarding', 'streakMedal'].every((t) => types(r).includes(t)), types(r).join());
expect('first solve gems = 20 + 25 + 20', loadProgress().gems === 65, String(loadProgress().gems));

// Same activity again within a minute counts for nothing
r = solve('bisection', day(1, 10) + 5000);
expect('same activity inside a minute is ignored', r.events.length === 0);

// A repeat later the same day: the task was first done today, so no repeat gems either
r = solve('bisection', day(1, 15), { fn: 'x^2-2' });
expect('no repeat gems on the day it was first done', !types(r).includes('taskRepeat'), types(r).join());

// Next day: repeat gives 5 gems and the streak grows to 2
r = solve('bisection', day(2));
expect('repeat next day gives 5 gems', r.events.some((e) => e.type === 'taskRepeat' && e.gems === 5), JSON.stringify(r.events));
expect('streak 2', loadProgress().streak.current === 2);

// Daily goal after 3 different tasks in a day
solve('secant', day(2, 13));
r = solve('newton-raphson', day(2, 14));
expect('daily goal on the third task', types(r).includes('dailyGoal'), types(r).join());

// Repeat gems stop at 60 a day
resetProgress();
const all = ['bisection', 'false-position', 'newton-raphson', 'secant', 'fixed-point', 'gauss-seidel', 'euler', 'runge-kutta', 'taylor', 'lu', 'jacobi', 'f-test', 't-test', 'z-test', 'chi-square'];
all.forEach((m, i) => solve(m, day(1, 8) + i * 61000));
all.forEach((m, i) => solve(m, day(2, 8) + i * 61000));
expect('capped gems on day 2 are 60 at most', (loadProgress().gemsByDay['2026-10-02'] || 0) <= 60, String(loadProgress().gemsByDay['2026-10-02']));

// Streak: a missed day breaks it, a freeze covers it
resetProgress();
solve('bisection', day(1));
solve('bisection', day(2));
r = solve('bisection', day(4));
expect('missed day ends the streak', types(r).includes('streakLost') && loadProgress().streak.current === 1, types(r).join());
const s = loadProgress();
s.streak = { current: 9, best: 9, lastDay: '2026-10-05', freezes: 1 };
window.localStorage.setItem('netz_progress_v1', JSON.stringify(s));
expect('streak shown as alive with a freeze for 1 missed day', currentStreak(loadProgress(), '2026-10-07') === 9);
r = solve('secant', day(7));
expect('freeze used and streak reaches 10', types(r).includes('freezeUsed') && loadProgress().streak.current === 10, types(r).join());
expect('10-day medal', types(r).includes('streakMedal'));
expect('broken streak shows 0 before the next task', currentStreak(loadProgress(), '2026-10-12') === 0);

// Monthly medal on the 20th day with a task
resetProgress();
let monthEvent = null;
for (let d = 1; d <= 20; d++) {
  r = solve('bisection', day(d));
  if (types(r).includes('monthMedal')) monthEvent = d;
}
expect('month medal on the 20th day', monthEvent === 20, String(monthEvent));

// Compare tasks: Root Rivals and Rule Trio
resetProgress();
solve('bisection', day(3), { fn: 'x^3 - 4*x - 9' });
r = solve('secant', day(3, 13), { fn: 'x^3-4*x-9' });
expect('Root Rivals after 2 root methods on the same function', r.events.some((e) => e.taskId === 'unit1.root-rivals'), types(r).join());
const rule = (m, h) => applyActivity('solver.run', { method: m, unit: 3, fn: 'sin(x)', a: '0', b: '3' }, day(4, h));
rule('trapezoidal', 9);
rule('simpson-13', 10);
r = rule('boole', 11);
expect('Rule Trio after 3 rules on the same integral', r.events.some((e) => e.taskId === 'unit3.rule-trio'), types(r).join());

// Notes and Playground tasks
resetProgress();
r = applyActivity('note.saved', { blocks: 3, hasMath: true, hasWidget: false, hasQuiz: false }, day(5));
expect('note tasks', ['notes.three-blocks', 'notes.math'].every((id) => r.events.some((e) => e.taskId === id)));
r = applyActivity('ink.converted', { kind: 'text' }, day(5, 13));
expect('ink to words', r.events.some((e) => e.taskId === 'playground.ink-text'));

// Today's suggestions stay the same all day and are 3 different tasks
resetProgress();
const morning = progressSummary(loadProgress(), '2026-10-09').today.map((t) => t.id);
solve('bisection', day(9));
const evening = progressSummary(loadProgress(), '2026-10-09').today.map((t) => t.id);
expect('3 different suggestions', new Set(morning).size === 3, morning.join());
expect('suggestions stay the same during the day', morning.join() === evening.join(), `${morning} / ${evening}`);
expect('localDay format', /^\d{4}-\d{2}-\d{2}$/.test(localDay()));

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
