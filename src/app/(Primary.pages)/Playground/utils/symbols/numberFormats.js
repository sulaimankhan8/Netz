/**
 * Insert > Symbol > Number, as in WPS Office: a number written in one of several styles
 * (circled, in brackets, Roman, letters, Chinese numerals...). Each style has its own range;
 * a number outside it gives null, never a wrong character.
 */

const CN_DIGITS = '零一二三四五六七八九';
const CN_UNITS = '十百千';
const CN_FINANCIAL_DIGITS = '零壹贰叁肆伍陆柒捌玖';
const CN_FINANCIAL_UNITS = '拾佰仟';
const CN_BIG_UNITS = ['万', '亿', '万亿'];
const HEAVENLY_STEMS = '甲乙丙丁戊己庚辛壬癸';
const EARTHLY_BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

/** 0 to 9999 in Chinese numerals (a zero between parts is read once: 一百零五). */
function chineseSection(n, digits, units) {
  let out = '';
  let pendingZero = false;
  for (let i = 3; i >= 0; i--) {
    const d = Math.floor(n / 10 ** i) % 10;
    if (d === 0) {
      if (out) pendingZero = true;
      continue;
    }
    if (pendingZero) {
      out += digits[0];
      pendingZero = false;
    }
    out += digits[d] + (i > 0 ? units[i - 1] : '');
  }
  return out;
}

/** A whole number in Chinese numerals: 15 is 十五, 105 is 一百零五, 10005 is 一万零五. */
export function chineseNumber(n, financial = false) {
  const digits = financial ? CN_FINANCIAL_DIGITS : CN_DIGITS;
  const units = financial ? CN_FINANCIAL_UNITS : CN_UNITS;
  if (n === 0) return digits[0];
  const sections = [];
  for (let rest = n; rest > 0; rest = Math.floor(rest / 10000)) sections.push(rest % 10000);
  let out = '';
  let gap = false;
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s === 0) {
      if (out) gap = true;
      continue;
    }
    if (out && (gap || s < 1000)) out += digits[0];
    gap = false;
    out += chineseSection(s, digits, units) + (i > 0 ? CN_BIG_UNITS[i - 1] : '');
  }
  // In everyday numerals a leading "one ten" is just "ten" (十五, not 一十五)
  if (!financial && out.startsWith(digits[1] + units[0])) out = out.slice(1);
  return out;
}

function roman(n, lower) {
  // 1 to 12 have their own characters (Ⅰ to Ⅻ); larger numbers are written with letters
  if (n >= 1 && n <= 12) return String.fromCodePoint((lower ? 0x2170 : 0x2160) + n - 1);
  const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  let rest = n;
  for (const [value, letters] of table) {
    while (rest >= value) {
      out += letters;
      rest -= value;
    }
  }
  return lower ? out.toLowerCase() : out;
}

/** 1 = A ... 26 = Z, 27 = AA (as columns are named). */
function letters(n, lower) {
  let out = '';
  for (let rest = n; rest > 0; rest = Math.floor((rest - 1) / 26)) out = String.fromCharCode(65 + ((rest - 1) % 26)) + out;
  return lower ? out.toLowerCase() : out;
}

function circled(n) {
  if (n === 0) return '⓪';
  if (n <= 20) return String.fromCodePoint(0x2460 + n - 1);
  if (n <= 35) return String.fromCodePoint(0x3251 + n - 21);
  return String.fromCodePoint(0x32b1 + n - 36);
}

/** The styles, in WPS's order. min and max: the numbers the style can write. */
export const NUMBER_FORMATS = [
  { id: 'arabic', label: '1, 2, 3, ...', min: 0, max: 999999999, format: (n) => String(n) },
  { id: 'circled', label: '①, ②, ③, ...', min: 0, max: 50, format: circled },
  { id: 'parenthesized', label: '⑴, ⑵, ⑶, ...', min: 1, max: 20, format: (n) => String.fromCodePoint(0x2474 + n - 1) },
  { id: 'fullStop', label: '⒈, ⒉, ⒊, ...', min: 1, max: 20, format: (n) => String.fromCodePoint(0x2488 + n - 1) },
  { id: 'romanUpper', label: 'Ⅰ, Ⅱ, Ⅲ, ...', min: 1, max: 3999, format: (n) => roman(n, false) },
  { id: 'romanLower', label: 'ⅰ, ⅱ, ⅲ, ...', min: 1, max: 3999, format: (n) => roman(n, true) },
  { id: 'upperLetter', label: 'A, B, C, ...', min: 1, max: 18278, format: (n) => letters(n, false) },
  { id: 'lowerLetter', label: 'a, b, c, ...', min: 1, max: 18278, format: (n) => letters(n, true) },
  { id: 'chinese', label: '一, 二, 三, ...', min: 0, max: 999999999999, format: (n) => chineseNumber(n, false) },
  { id: 'chineseFinancial', label: '壹, 贰, 叁, ...', min: 0, max: 999999999999, format: (n) => chineseNumber(n, true) },
  { id: 'heavenlyStem', label: '甲, 乙, 丙, ...', min: 1, max: 10, format: (n) => HEAVENLY_STEMS[n - 1] },
  { id: 'earthlyBranch', label: '子, 丑, 寅, ...', min: 1, max: 12, format: (n) => EARTHLY_BRANCHES[n - 1] },
];

/**
 * A number in a style, or null when the number is not a whole number in the style's range.
 * @returns {string|null}
 */
export function formatNumber(value, formatId) {
  const style = NUMBER_FORMATS.find((f) => f.id === formatId);
  const n = Number(String(value).trim());
  if (!style || String(value).trim() === '' || !Number.isInteger(n) || n < style.min || n > style.max) return null;
  return style.format(n);
}
