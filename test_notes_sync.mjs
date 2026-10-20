/** Notes cloud copy rules (Notes/utils/notesCore.js): newest wins, tombstones, free limit, samples, sizes. */

const { planNoteWrites, noteFingerprint, isSampleNote, FREE_CLOUD_NOTES, MAX_NOTE_BYTES } = await import('./src/app/(Primary.pages)/Notes/utils/notesCore.js');

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const note = (id, title = 'T') => ({ id, title, blocks: [{ id: 'b1', type: 'paragraph', content: title }] });
const map = (entries) => new Map(entries.map(([id, changedAt, deleted = false]) => [id, { id, changedAt, deleted }]));

let r = planNoteWrites(new Map(), [{ id: 'note-1', data: note('note-1'), changedAt: 10 }]);
expect('new note stored', r.writes.length === 1 && r.writes[0].id === 'note-1' && !r.writes[0].deleted);

r = planNoteWrites(map([['note-1', 20]]), [{ id: 'note-1', data: note('note-1', 'old'), changedAt: 15 }]);
expect('older version does not replace a newer one', r.writes.length === 0);
r = planNoteWrites(map([['note-1', 20]]), [{ id: 'note-1', data: note('note-1', 'new'), changedAt: 25 }]);
expect('newer version replaces', r.writes.length === 1 && r.writes[0].data.title === 'new');

r = planNoteWrites(map([['note-1', 20]]), [], [{ id: 'note-1', changedAt: 30 }]);
expect('deletion becomes a tombstone', r.writes.length === 1 && r.writes[0].deleted);
r = planNoteWrites(map([['note-1', 40]]), [], [{ id: 'note-1', changedAt: 30 }]);
expect('older deletion ignored (note was edited later elsewhere)', r.writes.length === 0);
r = planNoteWrites(map([['note-1', 20, true]]), [{ id: 'note-1', data: note('note-1'), changedAt: 50 }]);
expect('a deleted note can come back with a newer edit', r.writes.length === 1 && !r.writes[0].deleted);

r = planNoteWrites(new Map(), [{ id: 'note-demo-1', data: note('note-demo-1'), changedAt: 5 }]);
expect('sample notes never uploaded', r.writes.length === 0 && isSampleNote('note-demo-2'));
r = planNoteWrites(new Map(), [{ id: '../evil', data: note('x'), changedAt: 5 }, { id: 'note-big', data: { blob: 'x'.repeat(MAX_NOTE_BYTES + 10) }, changedAt: 5 }]);
expect('bad ids and too-big notes rejected', r.writes.length === 0 && r.rejected.length === 2);

const full = map(Array.from({ length: FREE_CLOUD_NOTES }, (_, i) => [`note-${i}`, 1]));
r = planNoteWrites(full, [{ id: 'note-new', data: note('note-new'), changedAt: 5 }, { id: 'note-3', data: note('note-3', 'edit'), changedAt: 5 }]);
expect('free limit: new note waits, existing note still updates', r.overLimit.join() === 'note-new' && r.writes.length === 1 && r.writes[0].id === 'note-3');
r = planNoteWrites(full, [{ id: 'note-new', data: note('note-new'), changedAt: 5 }], [{ id: 'note-0', changedAt: 9 }]);
expect('deleting one makes room in the same sync', r.overLimit.length === 0 && r.writes.length === 2);

r = planNoteWrites(new Map(), [{ id: 'note-x', data: { title: 'no id' }, changedAt: 5 }]);
expect('stored data always carries its id', r.writes[0].data.id === 'note-x');
expect('fingerprint changes with content', noteFingerprint(note('a', 'x')) !== noteFingerprint(note('a', 'y')) && noteFingerprint(note('a')) === noteFingerprint(note('a')));

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
