/**
 * How the server counts a device's progress (src/app/utils/progress/syncCore.js): first sign-in
 * upload, caps, dates from the device, and a faked device record.
 */

globalThis.window = undefined;
const { syncProgress, dayAt } = await import('./src/app/utils/progress/syncCore.js');
const { newProgressState, reduceActivity, localDay } = await import('./src/app/utils/progress/engine.js');

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const IST = -330; // Date.getTimezoneOffset() in India
const at = (d, h = 12) => Date.UTC(2026, 9, d, h - 5, 30 - 30); // ~h:00 IST on 2026-10-d
const NOW = at(19, 18);

// A device that did a few things before signing in
const device = newProgressState();
[['solver.run', { method: 'bisection', unit: 1 }, at(17)], ['solver.run', { method: 'bisection', unit: 1 }, at(18)], ['ink.converted', { kind: 'text' }, at(19, 9)]]
  .forEach(([k, d, t]) => reduceActivity(device, k, d, t, dayAt(t, IST)));

expect('dayAt uses the student time zone', dayAt(Date.UTC(2026, 9, 18, 20, 0), IST) === '2026-10-19');

// First sign-in: the device log is re-counted, and the account medal is given
let r = syncProgress({ stored: null, device: { activity: device.activity }, profile: { robotName: 'Bolt', units: [1, 3] }, tz: IST, now: NOW });
expect('new account', r.isNew);
expect('device tasks re-counted', !!r.state.tasksFirstDone['unit1.bisection'] && !!r.state.tasksFirstDone['playground.ink-text']);
expect('Cloud Link medal', !!r.state.medals['onboard.account']);
expect('streak of 3 from the device days', r.state.streak.current === 3, String(r.state.streak.current));
expect('profile names taken', r.state.robotName === 'Bolt' && r.state.units.join() === '1,3');
expect('log rows written', r.logRows.length === 4, String(r.logRows.length));

// A faked device record (big gems number) is ignored: only activities count
const faked = { ...device, gems: 999999 };
r = syncProgress({ stored: null, device: faked, tz: IST, now: NOW });
expect('faked gem number ignored', r.state.gems < 200, String(r.state.gems));

// Device log entries older than 40 days or in the future are dropped
const old = { activity: [{ key: 'solver.run|{"method":"secant","unit":1}', day: '2026-08-01', at: at(1) }, { key: 'solver.run|{"method":"lu","unit":4}', day: '2026-10-25', at: at(25) }] };
r = syncProgress({ stored: null, device: old, tz: IST, now: NOW });
expect('old and future device entries dropped', !r.state.tasksFirstDone['unit1.secant'] && !r.state.tasksFirstDone['unit4.lu']);

// Later syncs: the device log is ignored, new activities count
const stored = r.state;
r = syncProgress({ stored, device: { activity: device.activity }, activities: [{ kind: 'solver.run', details: { method: 'euler', unit: 4 }, at: NOW - 60000 }], tz: IST, now: NOW });
expect('existing account: not new', !r.isNew);
expect('existing account: device log ignored', !r.state.tasksFirstDone['unit1.bisection']);
expect('new activity counted', !!r.state.tasksFirstDone['unit4.euler']);

// Times older than 48 hours or in the future become "now"
r = syncProgress({ stored: newProgressState(), activities: [{ kind: 'solver.run', details: { method: 'taylor', unit: 4 }, at: at(1) }], tz: IST, now: NOW });
expect('old time replaced with now', r.logRows[0] && r.logRows[0].localDay === '2026-10-19', r.logRows[0]?.localDay);

// Unknown kinds and odd details are dropped or cleaned
r = syncProgress({ stored: newProgressState(), activities: [{ kind: 'gems.add', details: { amount: 1e6 } }, { kind: 'solver.run', details: { method: 'jacobi', unit: 4, evil: { a: 1 }, long: 'x'.repeat(500) } }], tz: IST, now: NOW });
expect('unknown kind ignored', r.logRows.length === 1 && r.logRows[0].kind === 'solver.run');
expect('nested details removed, long text cut', r.logRows[0].details.evil === undefined && r.logRows[0].details.long.length === 200);

// At most 100 activities per sync
const many = Array.from({ length: 150 }, (_, i) => ({ kind: 'quiz.correct', details: { blockId: `b${i}` }, at: NOW - i * 61000 }));
r = syncProgress({ stored: newProgressState(), activities: many, tz: IST, now: NOW });
expect('at most 100 activities per sync', r.logRows.length <= 100, String(r.logRows.length));
expect('gem cap still holds on the server', (r.state.gemsByDay['2026-10-19'] || 0) <= 60);

expect('localDay still works', /^\d{4}-\d{2}-\d{2}$/.test(localDay()));
console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
