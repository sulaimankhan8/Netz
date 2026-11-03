/**
 * Small display helpers for the method pages (break-ui fixes, 2026-11-03).
 */

/** "1 iteration", "5 iterations". */
export function plural(n, word, many = `${word}s`) {
  return `${n} ${n === 1 ? word : many}`;
}

/**
 * toFixed without "-0.0000": a value that rounds to zero is shown as plain 0.0000.
 * Non-numbers pass through as text ("—" for null/undefined/NaN).
 */
export function fixed(value, digits = 4) {
  const v = Number(value);
  if (value === null || value === undefined || Number.isNaN(v)) return '—';
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
  const s = v.toFixed(digits);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
}

/**
 * Significant figures instead of fixed decimals, so 0.000123 stays 0.000123 and 98765.4321 stays readable.
 * Big or tiny values switch to a×10^n notation in plain text (e.g. 1.2e+15).
 */
export function sig(value, digits = 6) {
  const v = Number(value);
  if (value === null || value === undefined || Number.isNaN(v)) return '—';
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
  if (Math.abs(v) < 1e-12) return '0';
  const a = Math.abs(v);
  if (a >= 1e9 || a < 1e-6) return v.toExponential(digits - 1).replace(/\.?0+e/, 'e');
  // Trim trailing zeros but keep at least one digit after a decimal point that is there
  return String(Number(v.toPrecision(digits)));
}

/**
 * Parses a comma-separated list of numbers. Unlike .filter(!isNaN), a typo is reported, not dropped:
 * returns { values } or { error: "Item 2, \"3O\", is not a number." }.
 */
export function parseNumberList(text, label = 'List') {
  const parts = String(text ?? '').split(',').map((s) => s.trim());
  if (parts.length && parts[parts.length - 1] === '') parts.pop(); // allow a trailing comma
  const values = [];
  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i];
    const v = p === '' ? NaN : Number(p);
    if (!Number.isFinite(v)) {
      return { error: `${label}: item ${i + 1}, "${p || '(empty)'}", is not a number.` };
    }
    values.push(v);
  }
  return { values };
}

/** Upper limit on steps/subintervals a page will draw. Past this a phone freezes. */
export const MAX_STEPS = 2000;

/** Message for too many steps (same wording on every page). */
export function tooManySteps(count, hint) {
  return `That is ${Math.round(count).toLocaleString('en-US')} steps; the page can show at most ${MAX_STEPS.toLocaleString('en-US')}. ${hint}`;
}

/** Past this size y is treated as "grew without limit" by the ODE pages. */
export const ODE_BLOWUP = 1e12;

/**
 * Why an ODE method stopped early: the solution blew up, or f(x, y) could not be evaluated.
 * hasSteps: whether the steps done so far are still shown below the message.
 */
export function odeStopMessage(step, x, y, target, hasSteps) {
  const tail = hasSteps ? ' The steps up to here are shown below.' : '';
  if (!Number.isFinite(y) || Math.abs(y) > ODE_BLOWUP) {
    return `Stopped at step ${step}: y grew without limit (y ≈ ${sig(y)} near x = ${fixed(x, 4)}). The exact solution most likely blows up before x = ${target}; try a smaller target x.${tail}`;
  }
  return `Stopped at step ${step}: f(x, y) could not be evaluated at x = ${fixed(x, 4)}, y = ${sig(y)} (for example a log or square root of a negative number).${tail}`;
}

/** Longest text accepted in an expression or list box. */
export const MAX_INPUT_LENGTH = 2000;
