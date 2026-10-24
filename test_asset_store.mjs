/**
 * Notes Studio Assets library rules (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 2b):
 * which files may go in (by name and first bytes), size limits, cloud storage limit, paths.
 * Notes/utils/assetCore.js — the same rules the server route uses.
 *
 *   node test_asset_store.mjs
 */

const core = await import('./src/app/(Primary.pages)/Notes/utils/assetCore.js');
const { classifyUpload, checkAssetSize, formatBytes, typeLabel, assetStoragePath, assetQuota, newAssetId, ASSET_ID_RE, ASSET_MAX_BYTES } = core;

let failed = 0;
let checks = 0;
const expect = (name, ok, detail = '') => {
  checks++;
  if (!ok) {
    failed++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};
const bytes = (...b) => new Uint8Array([...b, ...new Array(16).fill(0x20)]);
const text = (s) => new TextEncoder().encode(s);

const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const JPG = bytes(0xff, 0xd8, 0xff, 0xe0);
const PDF = text('%PDF-1.7\n%âãÏÓ\n');
const ZIP = bytes(0x50, 0x4b, 0x03, 0x04);
const OLE = bytes(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1);
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0, 0, 0, 0]);

// Pictures
expect('png', classifyUpload('a.PNG', PNG).kind === 'image');
expect('jpeg', classifyUpload('photo.jpeg', JPG).mime === 'image/jpeg');
expect('webp', classifyUpload('x.webp', WEBP).kind === 'image');
expect('svg', classifyUpload('d.svg', text('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>')).kind === 'image');
expect('png that is really html refused', !classifyUpload('a.png', text('<html><script>')).ok);
expect('svg that is html refused', !classifyUpload('a.svg', text('<!doctype html><html>')).ok);

// Documents
expect('pdf', classifyUpload('notes.pdf', PDF).kind === 'file');
expect('fake pdf refused', !classifyUpload('notes.pdf', PNG).ok);
expect('docx (zip inside)', classifyUpload('report.docx', ZIP).ok);
expect('pptx', classifyUpload('slides.pptx', ZIP).ok);
expect('old .doc', classifyUpload('old.doc', OLE).ok);
expect('fake docx refused', !classifyUpload('report.docx', PDF).ok);
expect('txt', classifyUpload('a.txt', text('hello world')).ok);
expect('csv', classifyUpload('a.csv', text('a,b\n1,2')).ok);
expect('binary .txt refused', !classifyUpload('a.txt', new Uint8Array([1, 0, 2, 3])).ok);
expect('txt that is a web page refused', !classifyUpload('a.txt', text('<!DOCTYPE html><html><body>')).ok);

// Never
for (const name of ['page.html', 'page.htm', 'run.js', 'setup.exe', 'x.bat', 'x.sh', 'a.php', 'noext']) {
  expect(`${name} refused`, !classifyUpload(name, text('hello')).ok);
}
expect('unknown type refused', !classifyUpload('model.stl', text('solid')).ok);

// Sizes and the cloud limit
expect('board fits', checkAssetSize('board', 1e6, 0, 50e6).ok);
expect('board over 10 MB refused', !checkAssetSize('board', ASSET_MAX_BYTES.board + 1, 0, 1e12).ok);
expect('file over 25 MB refused', !checkAssetSize('file', 26 * 1024 * 1024, 0, 1e12).ok);
const full = checkAssetSize('image', 2e6, 49.5 * 1024 * 1024, 50 * 1024 * 1024);
expect('full library refused', !full.ok && full.full === true);
expect('pro has more room than free', assetQuota(true) > assetQuota(false));
expect('free room is 50 MB', assetQuota(false) === 50 * 1024 * 1024);

// Labels, paths, ids
expect('bytes KB', formatBytes(2048) === '2 KB');
expect('bytes MB', formatBytes(5.5 * 1024 * 1024) === '5.5 MB');
expect('type label of a pdf', typeLabel({ kind: 'file', title: 'x.pdf' }) === 'PDF');
expect('type label of a board', typeLabel({ kind: 'board' }) === 'Board');
expect('main path', assetStoragePath('user-1', 'ast_abc', 'main', 'pdf') === 'user-1/ast_abc/main.pdf');
expect('preview path', assetStoragePath('user-1', 'ast_abc', 'preview') === 'user-1/ast_abc/preview.webp');
expect('path cannot climb out', !assetStoragePath('../x', '../../y', 'main', '../z').includes('..'));
const id = newAssetId();
expect('new ids match the server check', ASSET_ID_RE.test(id), id);
expect('ids differ', newAssetId() !== newAssetId());
expect('bad id refused by server check', !ASSET_ID_RE.test('ast_../../x') && !ASSET_ID_RE.test('img-123'));

console.log(`\n${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
