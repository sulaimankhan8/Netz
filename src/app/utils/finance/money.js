/**
 * Money helpers for the Unit 10 pages (percentages, interest, EMI): reading typed amounts,
 * formatting with the right grouping (₹1,00,000 in India, $100,000 elsewhere), and LaTeX for steps.
 */
import { EngineError } from '../numeric/steps';

export const CURRENCIES = {
  INR: { symbol: '₹', locale: 'en-IN', label: '₹ Rupee' },
  USD: { symbol: '$', locale: 'en-US', label: '$ Dollar' },
  EUR: { symbol: '€', locale: 'en-IE', label: '€ Euro' },
  GBP: { symbol: '£', locale: 'en-GB', label: '£ Pound' },
  AED: { symbol: 'AED ', locale: 'en-US', label: 'AED Dirham' },
  NONE: { symbol: '', locale: 'en-US', label: 'No symbol' },
};
export const currency = (code) => CURRENCIES[code] || CURRENCIES.INR;

const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

/** "₹1,00,000" / "₹8,791.59" / "-$12.50". Whole amounts drop the .00. */
export function formatMoney(v, code = 'INR') {
  if (!Number.isFinite(v)) return '—';
  const c = currency(code);
  const r = round2(v);
  const whole = Number.isInteger(r);
  const s = new Intl.NumberFormat(c.locale, { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(Math.abs(r));
  return `${r < 0 ? '-' : ''}${c.symbol}${s}`;
}

/** An amount for KaTeX steps, grouped like formatMoney but without the symbol (KaTeX has no ₹ glyph). */
export function texMoney(v, code = 'INR') {
  if (!Number.isFinite(v)) return '\\infty';
  const c = currency(code);
  const r = round2(v);
  const whole = Number.isInteger(r);
  const s = new Intl.NumberFormat(c.locale, { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(Math.abs(r));
  return `${r < 0 ? '-' : ''}${s.replace(/,/g, '{,}')}`;
}

/** Any ISO currency ("GBP", "JPY", "AED") with the browser's own symbol and decimals: £1,234.50, ¥1,235. */
export function formatCurrencyCode(v, iso) {
  if (!Number.isFinite(v)) return '—';
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: iso }).format(v);
  } catch {
    return `${round2(v)} ${iso}`;
  }
}

/** A percentage for display: up to 4 decimals, trailing zeros dropped ("12.68%"). */
export const formatPct = (v, digits = 4) => `${Number(v.toFixed(digits))}%`;
/** A percentage for KaTeX. */
export const texPct = (v, digits = 4) => `${Number(v.toFixed(digits))}\\%`;

/**
 * Reads a typed amount: "1,00,000", "₹ 5000", "$12.50", "2.5e5". Throws an EngineError naming the field.
 * opts.min (default 0, inclusive) and opts.positive (must be > 0).
 */
export function readAmount(text, where, { positive = false, allowNegative = false } = {}) {
  const raw = String(text ?? '').trim();
  if (!raw) throw new EngineError(`${where} is empty.`);
  const s = raw.replace(/[₹$€£,\s]|AED|Rs\.?/gi, '').replace(/−/g, '-').replace(/%$/, '');
  const v = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s) ? Number(s) : NaN;
  if (!Number.isFinite(v)) throw new EngineError(`${where}: "${raw}" is not a number.`);
  if (positive && !(v > 0)) throw new EngineError(`${where} must be more than 0.`);
  if (!allowNegative && v < 0) throw new EngineError(`${where} can't be negative.`);
  return v;
}

export { round2 };
