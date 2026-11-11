import { rowChanges, findCutRow } from '../../src/app/utils/pdfPages.js';

/**
 * PDF export page cuts (Notes and the method calculators): a cut moves up to a row where nothing
 * is drawn across the page, so a card or a line of text is not sliced in half.
 */

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}

const WIDTH = 40;
const WHITE = [255, 255, 255];
const INK = [20, 20, 20];
const BORDER = [200, 200, 200];

/** A strip of rows from short names: 'blank', 'text' (ink across), 'card' (only a border each side). */
function strip(kinds) {
  const data = new Uint8ClampedArray(kinds.length * WIDTH * 4);
  kinds.forEach((kind, row) => {
    for (let x = 0; x < WIDTH; x++) {
      let colour = WHITE;
      if (kind === 'text' && x > 4 && x < 36 && x % 4 < 2) colour = INK;
      if (kind === 'card' && (x < 2 || x >= WIDTH - 2)) colour = BORDER;
      data.set([...colour, 255], (row * WIDTH + x) * 4);
    }
  });
  return data;
}
const rows = (...parts) => parts.flatMap(([kind, count]) => Array(count).fill(kind));

let kinds = rows(['blank', 3], ['text', 3], ['card', 2]);
let data = strip(kinds);
expect('a blank row has no colour changes', rowChanges(data, WIDTH, 0) === 0);
expect('a row of text has many', rowChanges(data, WIDTH, 3) > 4, String(rowChanges(data, WIDTH, 3)));
expect('a row inside a card has only its borders', rowChanges(data, WIDTH, 6) > 0 && rowChanges(data, WIDTH, 6) < rowChanges(data, WIDTH, 3));
expect('a faint colour shift is not content', rowChanges(new Uint8ClampedArray(WIDTH * 4).map((_, i) => (i % 8 < 4 ? 250 : 255)), WIDTH, 0) === 0);

// text, a gap of 4 rows (10..13), then a card that runs past the end of the page
kinds = rows(['text', 10], ['blank', 4], ['card', 2], ['text', 14]);
let cut = findCutRow(strip(kinds), WIDTH, kinds.length);
expect('the cut moves up into the gap before the card', cut >= 10 && cut <= 14, String(cut));
expect('the cut lands in the middle of the gap', cut === 12, String(cut));

// two gaps: the lower one wins, so the page stays as full as it can
kinds = rows(['text', 5], ['blank', 2], ['text', 8], ['blank', 2], ['text', 6]);
cut = findCutRow(strip(kinds), WIDTH, kinds.length);
expect('with two gaps the lower one is used', cut === 16, String(cut));

// the page already ends on a gap
kinds = rows(['text', 12], ['blank', 3]);
cut = findCutRow(strip(kinds), WIDTH, kinds.length);
expect('a page that ends in a gap is cut inside that gap', cut >= 12 && cut <= 15, String(cut));

// a gap that starts at the top of the strip may go on above it
kinds = rows(['blank', 4], ['text', 10]);
cut = findCutRow(strip(kinds), WIDTH, kinds.length);
expect('a gap at the top of the strip is cut at its lower end', cut === 4, String(cut));

// no gap at all: inside a tall card, between two lines of text
kinds = rows(['text', 6], ['card', 3], ['text', 9]);
cut = findCutRow(strip(kinds), WIDTH, kinds.length);
expect('with no gap the cut goes between lines, not through text', cut >= 7 && cut <= 9, String(cut));

// nothing but text: the cut stays at the page end
kinds = rows(['text', 12]);
cut = findCutRow(strip(kinds), WIDTH, kinds.length);
expect('solid content is cut at the page end', cut === 12, String(cut));
expect('a cut is never at row 0 of a strip with content first', findCutRow(strip(rows(['text', 3], ['blank', 1], ['text', 3])), WIDTH, 7) === 4);

console.log(`${checks - failed}/${checks} checks passed`);
if (failed) process.exitCode = 1;
