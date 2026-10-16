/**
 * Builds the character data of Insert > Symbol > More Symbols from the Unicode Character Database.
 *
 *   node scripts/build-symbol-data.mjs path/to/UnicodeData.txt path/to/Blocks.txt
 *
 * Both files: https://www.unicode.org/Public/UCD/latest/ucd/
 * Output: src/app/(Primary.pages)/Playground/utils/symbols/symbolData.generated.js
 * (committed; loaded by the app only when the More Symbols dialog opens).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'app', '(Primary.pages)', 'Playground', 'utils', 'symbols', 'symbolData.generated.js');

const [dataFile, blocksFile] = process.argv.slice(2);
if (!dataFile || !blocksFile) {
  console.error('Usage: node scripts/build-symbol-data.mjs UnicodeData.txt Blocks.txt');
  process.exit(1);
}

// The subsets offered, in code order (the order Word and WPS list them in)
const BLOCKS = [
  'Basic Latin', 'Latin-1 Supplement', 'Latin Extended-A', 'IPA Extensions', 'Spacing Modifier Letters',
  'Greek and Coptic', 'Cyrillic', 'General Punctuation', 'Superscripts and Subscripts', 'Currency Symbols',
  'Letterlike Symbols', 'Number Forms', 'Arrows', 'Mathematical Operators', 'Miscellaneous Technical',
  'Enclosed Alphanumerics', 'Box Drawing', 'Block Elements', 'Geometric Shapes', 'Miscellaneous Symbols', 'Dingbats',
  'Miscellaneous Mathematical Symbols-A', 'Supplemental Arrows-A', 'Supplemental Arrows-B',
  'Miscellaneous Mathematical Symbols-B', 'Supplemental Mathematical Operators', 'Miscellaneous Symbols and Arrows',
  'CJK Symbols and Punctuation', 'Enclosed CJK Letters and Months', 'CJK Compatibility', 'Halfwidth and Fullwidth Forms',
];
// Characters that cannot stand on their own or show nothing
const SKIP_CATEGORIES = new Set(['Cc', 'Cf', 'Cs', 'Co', 'Cn', 'Mn', 'Me', 'Mc', 'Zl', 'Zp']);

const ranges = new Map();
for (const line of fs.readFileSync(blocksFile, 'utf8').split('\n')) {
  const m = /^([0-9A-F]+)\.\.([0-9A-F]+);\s*(.+?)\s*$/.exec(line);
  if (m) ranges.set(m[3], [parseInt(m[1], 16), parseInt(m[2], 16)]);
}

const chars = [];
for (const line of fs.readFileSync(dataFile, 'utf8').split('\n')) {
  const f = line.split(';');
  if (f.length < 3) continue;
  const code = parseInt(f[0], 16);
  let name = f[1];
  if (name.startsWith('<')) {
    if (!f[10]) continue;
    name = f[10];
  }
  if (SKIP_CATEGORIES.has(f[2]) || code === 0x20) continue;
  chars.push([code, name]);
}

const blocks = [];
for (const name of BLOCKS) {
  const range = ranges.get(name);
  if (!range) throw new Error(`No block called "${name}" in ${blocksFile}`);
  const list = chars.filter(([c]) => c >= range[0] && c <= range[1]);
  blocks.push({ name, start: range[0], chars: list });
}

const total = blocks.reduce((n, b) => n + b.chars.length, 0);
const version = (/^# Blocks-([\d.]+)\.txt/m.exec(fs.readFileSync(blocksFile, 'utf8')) || [0, '?'])[1];
const body = blocks.map((b) => `  { name: ${JSON.stringify(b.name)}, chars: ${JSON.stringify(b.chars)} },`).join('\n');
const source = `/**
 * Characters for Insert > Symbol > More Symbols: ${total} characters in ${blocks.length} Unicode blocks,
 * with their Unicode names (for search). GENERATED FILE: do not edit by hand.
 * Built by scripts/build-symbol-data.mjs from the Unicode Character Database ${version}.
 *
 * Unicode data copyright (c) 1991-2026 Unicode, Inc., distributed under the Unicode License v3
 * (https://www.unicode.org/license.txt).
 *
 * Each block: { name, chars: [[codePoint, NAME], ...] }
 */

export const SYMBOL_BLOCKS = [
${body}
];
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, source);
console.log(`Wrote ${total} characters in ${blocks.length} blocks to ${path.relative(ROOT, OUT)} (${Math.round(source.length / 1024)} KB)`);
