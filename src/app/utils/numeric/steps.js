/**
 * The shape every NETZ engine returns, so a page, a Notes widget and code export can all read it:
 *
 *   { result, steps: { headers, rows }, notes, plot }
 *
 *   result  the answer (number, array, matrix or object, depending on the method)
 *   steps   the exam-style table: column headers + one array of cells per row
 *   notes   plain sentences explaining what was done ("R2 → R2 − 3·R1", "Pivot is 0, so swap rows")
 *   plot    optional data for a graph, or null
 *
 * Engines work with plain numbers. Pages format them (numberFormat.js: fixed, sig).
 */

/** A message for the student, as opposed to a bug. Pages show `message` as is. */
export class EngineError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EngineError';
  }
}

/** Collects table rows and notes while an engine runs. */
export function createRecord(headers = []) {
  const steps = { headers, rows: [] };
  const notes = [];
  return {
    steps,
    notes,
    row: (...cells) => { steps.rows.push(cells); },
    note: (text) => { notes.push(text); },
    done: (result, plot = null) => ({ result, steps, notes, plot }),
  };
}

/** Values this close to 0 count as 0 (pivots, determinants, cleaning -0.0000000001 out of tables). */
export const EPS = 1e-10;

export const isZero = (v, eps = EPS) => Math.abs(v) < eps;

/** Turns tiny float noise into an exact 0 so tables don't show 1e-17. */
export const clean = (v) => (isZero(v) ? 0 : v);

/** Throws EngineError unless every value is a finite number. */
export function requireNumbers(values, label = 'Every value') {
  for (const v of values) {
    if (typeof v !== 'number' || !Number.isFinite(v)) throw new EngineError(`${label} must be a number.`);
  }
}
