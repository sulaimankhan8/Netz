/** Publishing rules (Notes/utils/publishCore.js): slugs, the public copy, the free limit. */

const { slugifyTitle, makeSlug, isValidSlug, preparePublicCopy, canPublishMore, FREE_PUBLIC_NOTES } = await import('./src/app/(Primary.pages)/Notes/utils/publishCore.js');

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

expect('slug from title', slugifyTitle('Newton–Raphson method!') === 'newton-raphson-method', slugifyTitle('Newton–Raphson method!'));
expect('accents and symbols', slugifyTitle('Café: Σ & ∫ notes') === 'cafe-notes', slugifyTitle('Café: Σ & ∫ notes'));
expect('empty title', slugifyTitle('   ') === 'note');
expect('long title cut to 48', slugifyTitle('a'.repeat(100)).length === 48);
const s = makeSlug('Newton Raphson', () => 0.5);
expect('slug = title + 4 characters', /^newton-raphson-[a-z0-9]{4}$/.test(s) && isValidSlug(s), s);
expect('bad slugs refused', !isValidSlug('../etc') && !isValidSlug('A_B') && !isValidSlug('ab'));

const note = { id: 'note-1', title: 'Roots', accessKey: 'NETZ-ABCD', isPublic: true, author: 'User', isPinned: true, blocks: [{ id: 'b1', type: 'paragraph', content: 'x' }] };
let r = preparePublicCopy(note);
expect('public copy drops private fields', r.ok && !('accessKey' in r.data) && !('isPinned' in r.data) && r.data.blocks.length === 1 && r.title === 'Roots');
expect('sample notes cannot be published', preparePublicCopy({ ...note, id: 'note-demo-1' }).error === 'sample_note');
expect('empty notes cannot be published', preparePublicCopy({ ...note, blocks: [] }).error === 'empty_note');
expect('too big refused', preparePublicCopy({ ...note, blocks: [{ id: 'b', content: 'x'.repeat(400 * 1024) }] }).error === 'too_large');
expect('bad id refused', preparePublicCopy({ ...note, id: 'a/b' }).error === 'bad_note');

expect('free limit is 2', FREE_PUBLIC_NOTES === 2);
expect('third note blocked', !canPublishMore(['n1', 'n2'], 'n3'));
expect('re-publishing a public note always fine', canPublishMore(['n1', 'n2'], 'n2'));

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exit(1);
