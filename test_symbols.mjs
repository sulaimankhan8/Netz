import { formatNumber, chineseNumber, NUMBER_FORMATS } from './src/app/(Primary.pages)/Playground/utils/symbols/numberFormats.js';
import { DEFAULT_CUSTOM_SYMBOLS, SPECIAL_CHARACTERS, parseCharacterCode, characterCode, displayName, searchSymbols, latexForSymbol } from './src/app/(Primary.pages)/Playground/utils/symbols/symbols.js';
import { SYMBOL_BLOCKS } from './src/app/(Primary.pages)/Playground/utils/symbols/symbolData.generated.js';

/**
 * Insert > Symbol: number styles, character codes, search, the LaTeX of symbols inserted into
 * equations, and the generated character data.
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
const eq = (name, got, want) => expect(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

// ── Number ───────────────────────────────────────────────────────────────────
expect('twelve number styles, as in WPS', NUMBER_FORMATS.length === 12);
eq('arabic', formatNumber('42', 'arabic'), '42');
eq('circled 1', formatNumber(1, 'circled'), '①');
eq('circled 20', formatNumber(20, 'circled'), '⑳');
eq('circled 21 (the second block)', formatNumber(21, 'circled'), '㉑');
eq('circled 35', formatNumber(35, 'circled'), '㉟');
eq('circled 36 (the third block)', formatNumber(36, 'circled'), '㊱');
eq('circled 50', formatNumber(50, 'circled'), '㊿');
eq('circled 0', formatNumber(0, 'circled'), '⓪');
eq('circled 51 is out of range', formatNumber(51, 'circled'), null);
eq('in brackets 3', formatNumber(3, 'parenthesized'), '⑶');
eq('in brackets 20', formatNumber(20, 'parenthesized'), '⒇');
eq('with full stop 2', formatNumber(2, 'fullStop'), '⒉');
eq('Roman 4 is one character', formatNumber(4, 'romanUpper'), 'Ⅳ');
eq('Roman 12', formatNumber(12, 'romanUpper'), 'Ⅻ');
eq('Roman 1994 in letters', formatNumber(1994, 'romanUpper'), 'MCMXCIV');
eq('small Roman 9', formatNumber(9, 'romanLower'), 'ⅸ');
eq('small Roman 14', formatNumber(14, 'romanLower'), 'xiv');
eq('Roman 0 is out of range', formatNumber(0, 'romanUpper'), null);
eq('letters 1', formatNumber(1, 'upperLetter'), 'A');
eq('letters 26', formatNumber(26, 'upperLetter'), 'Z');
eq('letters 27 continue as AA', formatNumber(27, 'upperLetter'), 'AA');
eq('letters 703', formatNumber(703, 'upperLetter'), 'AAA');
eq('small letters 3', formatNumber(3, 'lowerLetter'), 'c');
eq('Chinese 1', chineseNumber(1), '一');
eq('Chinese 10', chineseNumber(10), '十');
eq('Chinese 15', chineseNumber(15), '十五');
eq('Chinese 20', chineseNumber(20), '二十');
eq('Chinese 105 (one zero read)', chineseNumber(105), '一百零五');
eq('Chinese 1010', chineseNumber(1010), '一千零一十');
eq('Chinese 10005', chineseNumber(10005), '一万零五');
eq('Chinese 100000', chineseNumber(100000), '十万');
eq('Chinese 10010', chineseNumber(10010), '一万零一十');
eq('Chinese 1000000005', chineseNumber(1000000005), '十亿零五');
eq('Chinese 0', chineseNumber(0), '零');
eq('financial 15 keeps the one', chineseNumber(15, true), '壹拾伍');
eq('financial 105', chineseNumber(105, true), '壹佰零伍');
eq('heavenly stems 1 and 10', `${formatNumber(1, 'heavenlyStem')}${formatNumber(10, 'heavenlyStem')}`, '甲癸');
eq('heavenly stems stop at 10', formatNumber(11, 'heavenlyStem'), null);
eq('earthly branches 12', formatNumber(12, 'earthlyBranch'), '亥');
eq('not a whole number', formatNumber('2.5', 'arabic'), null);
eq('empty', formatNumber('', 'arabic'), null);
eq('not a number', formatNumber('abc', 'circled'), null);

// ── Character codes, names ───────────────────────────────────────────────────
eq('hex code', parseCharacterCode('2211'), '∑');
eq('U+ code', parseCharacterCode('U+03B1'), 'α');
eq('0x code', parseCharacterCode('0x2192'), '→');
eq('decimal code', parseCharacterCode('169', 'decimal'), '©');
eq('control characters are refused', parseCharacterCode('0007'), null);
eq('half surrogates are refused', parseCharacterCode('D800'), null);
eq('nonsense is refused', parseCharacterCode('xyz'), null);
eq('characters outside the BMP work', parseCharacterCode('1F600'), '😀');
eq('code of a character, hex', characterCode('∑'), '2211');
eq('code of a character, decimal', characterCode('©', 'decimal'), '169');
eq('names in title case', displayName('GREEK SMALL LETTER ALPHA'), 'Greek Small Letter Alpha');
eq('hyphenated names', displayName('LEFT-POINTING ANGLE'), 'Left-Pointing Angle');

// ── Generated data and search ────────────────────────────────────────────────
const total = SYMBOL_BLOCKS.reduce((n, b) => n + b.chars.length, 0);
expect('the character data covers the usual symbol blocks', SYMBOL_BLOCKS.length >= 30 && total > 4000, `${SYMBOL_BLOCKS.length} blocks, ${total} characters`);
expect('it starts with Basic Latin and has Mathematical Operators and Arrows', SYMBOL_BLOCKS[0].name === 'Basic Latin' && SYMBOL_BLOCKS.some((b) => b.name === 'Mathematical Operators') && SYMBOL_BLOCKS.some((b) => b.name === 'Arrows'));
const allCodes = new Set(SYMBOL_BLOCKS.flatMap((b) => b.chars.map((c) => c[0])));
expect('no control characters', ![0, 7, 0x7f, 0x85].some((c) => allCodes.has(c)));
expect('no combining marks (they cannot stand alone)', !allCodes.has(0x0301) && !allCodes.has(0x20d7));
expect('every WPS custom symbol is in the data', DEFAULT_CUSTOM_SYMBOLS.every((c) => allCodes.has(c.codePointAt(0))), DEFAULT_CUSTOM_SYMBOLS.filter((c) => !allCodes.has(c.codePointAt(0))).join(' '));
let found = searchSymbols(SYMBOL_BLOCKS, 'integral').map((r) => String.fromCodePoint(r[0]));
expect('search "integral" finds ∫ ∬ ∮', ['∫', '∬', '∮'].every((c) => found.includes(c)), found.slice(0, 12).join(' '));
found = searchSymbols(SYMBOL_BLOCKS, 'right arrow').map((r) => String.fromCodePoint(r[0]));
expect('search with two words needs both', found.includes('→') && found.every((c) => c !== '∫'), found.slice(0, 8).join(' '));
found = searchSymbols(SYMBOL_BLOCKS, '2211').map((r) => String.fromCodePoint(r[0]));
expect('search by code', found[0] === '∑', found.join(' '));
found = searchSymbols(SYMBOL_BLOCKS, '℃').map((r) => String.fromCodePoint(r[0]));
expect('search by the character itself', found.length === 1 && found[0] === '℃', found.join(' '));
expect('search for nothing finds nothing', searchSymbols(SYMBOL_BLOCKS, '  ').length === 0);
expect('Word\'s 20 special characters', SPECIAL_CHARACTERS.length === 20 && SPECIAL_CHARACTERS[0].name === 'Em Dash');

// ── LaTeX for equations ──────────────────────────────────────────────────────
eq('α in an equation', latexForSymbol('α'), '\\alpha ');
eq('≤ in an equation', latexForSymbol('≤'), '\\le ');
eq('Ω in an equation', latexForSymbol('Ω'), '\\Omega ');
eq('√ gets an empty root', latexForSymbol('√'), '\\sqrt{}');
eq('° becomes a superscript circle (a space keeps a following letter apart)', latexForSymbol('°'), '^\\circ ');
eq('% is escaped', latexForSymbol('%'), '\\%');
eq('a symbol without a command goes in as it is', latexForSymbol('☑'), '☑');

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
