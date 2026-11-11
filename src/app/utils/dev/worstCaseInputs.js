/**
 * DEV ONLY. Worst-case inputs for the method-page calculators (break-ui check, 2026-11-02).
 * Each value is something a real student could type, or the largest value the page accepts
 * (none of these inputs has a length or size limit, so "large" means large but believable).
 *
 * fields: values for the page's inputs, in page order (same order as the form on screen).
 * rows:   [x, y] rows for table-style pages (Newton forward), typed after adding rows.
 * size:   matrix size for matrix pages (the size picker allows 2-6).
 * Empty / One / Huge are the extra states from the break-ui workflow.
 */

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

export const STATES = ['demo', 'worst', 'empty', 'one', 'huge'];
export const STATE_LABELS = { demo: 'Demo', worst: 'Worst case', empty: 'Empty', one: 'One', huge: 'Huge' };

export const SCENARIOS = {
  // Roots: function, initial guess, tolerance
  'newton-raphson-method': {
    // No real root: wanders for all 50 iterations, values reach the millions
    worst: { fields: ['x^2 + 1', '0.5', '0.0000000001'] },
    empty: { fields: ['', '', ''] },
    // Straight line: converges in 1 step ("1 iterations"?)
    one: { fields: ['2*x - 1', '3', '0.0001'] },
    // Long textbook function, tight tolerance
    huge: { fields: ['x*exp(x) - cos(x) + log(1 + x^2) - sin(2*x)/(x^2 + 1) - 0.5', '1', '1e-15'] },
  },

  // Equal-interval table: classic census question (unequal-looking big numbers)
  'newton-forward': {
    worst: {
      rows: range(10, (i) => [String(1891 + 10 * i), (46.12 + i * 13.5871 + i * i * 1.0123).toFixed(4)]),
      fields: ['1895'],
    },
    empty: { rows: [], fields: [''] },
    one: { rows: [['1', '2']], fields: ['1.5'] },
    // 25 rows: 24 orders of differences
    huge: { rows: range(25, (i) => [String(i * 0.5), (Math.sin(i * 0.5) * 1000).toFixed(6)]), fields: ['0.75'] },
  },

  // Integration: integrand, a, b, n
  'simpson-1-3-Rule': {
    worst: { fields: ['exp(-x^2) * sin(10*x) / (1 + x^2)', '-25.75', '1284.5', '1000'] },
    empty: { fields: ['', '', '', ''] },
    one: { fields: ['x', '0', '1', '2'] },
    huge: { fields: ['sin(x)', '0', '3.141592653589793', '10000'] },
  },

  // Matrix 3x4 augmented by default; size first, then cells row by row
  'gauss-elimination': {
    worst: {
      size: 6,
      fields: range(6 * 7, (k) => {
        const r = Math.floor(k / 7), c = k % 7;
        const v = [[-1234.5678, 0.000123, 98765.4321, -0.5, 12.75, 3, 1],
          [0.25, -7, 1284, 0.0001, -42.5, 9, 2],
          [5, 5.5, -0.001, 77777.7, 1, -3, 3],
          [-8.125, 64, 2, 1, 0.3333, 6, 4],
          [1, 1, 1, 1, 1, 1, 5],
          [100000, -0.125, 7, 2, 2.5, -1, 6]][r][c];
        return String(v);
      }),
    },
    empty: { size: 2, fields: ['', '', '', '', '', ''] },
    one: { size: 2, fields: ['1', '0', '1', '0', '1', '1'] },
    // Singular: row 2 = 2 x row 1
    huge: { size: 3, fields: ['1', '2', '3', '6', '2', '4', '6', '12', '1', '1', '1', '3'] },
  },

  // ODE: f(x,y), target x, x0, y0, h
  'runge-kutta-method': {
    // y' = y^2 + x blows up before x = 2: Infinity / NaN in the table
    worst: { fields: ['y^2 + x', '2', '0', '1', '0.05'] },
    empty: { fields: ['', '', '', '', ''] },
    one: { fields: ['x + y', '0.1', '0', '1', '0.1'] },
    // 10,000 steps
    huge: { fields: ['x*y^2 - sin(x*y) + exp(-x)/(1 + y^2)', '10', '0', '0.1', '0.001'] },
  },

  // Chi-square: observed, expected
  'chi-square': {
    // 12 categories, a zero expected value (division by zero), big counts
    worst: {
      fields: ['1284, 0, 37, 9512, 3, 640, 1, 88, 2045, 17, 450, 6',
        '1300, 0, 40, 9400, 5, 600, 2, 90, 2000, 20, 500, 4'],
    },
    empty: { fields: ['', ''] },
    one: { fields: ['1, 1', '1, 1'] },
    huge: { fields: [range(60, (i) => 100 + ((i * 37) % 23)).join(', '), range(60, () => 110).join(', ')] },
  },

  // Fitting: x list, y list
  'fitting-straight-lines': {
    // Years and big y values, 40 points
    worst: {
      fields: [range(40, (i) => 1985 + i).join(', '), range(40, (i) => (12345.6789 + i * 1284.5 + ((i * 7919) % 300) - 150).toFixed(4)).join(', ')],
    },
    empty: { fields: ['', ''] },
    // Two points with the same x: a vertical line
    one: { fields: ['5, 5', '1, 2'] },
    huge: { fields: [range(500, (i) => i).join(', '), range(500, (i) => (2 * i + 1 + ((i * 31) % 7) - 3)).join(', ')] },
  },
};

/**
 * Route key for the current page, or null. Pages without hand-written scenarios still get one when their calculator
 * shell (SymbolicCalculator, MatrixMethodCalculator) registers itself as window.__netzCalc (see autoScenario).
 */
export function scenarioKey(pathname) {
  const key = (pathname || '').replace(/^\/+|\/+$/g, '');
  if (SCENARIOS[key]) return key;
  return key ? key : null;
}

/**
 * Scenarios made from a calculator's own start values and examples (DEV ONLY):
 *   empty  every typed input cleared (choices kept)
 *   one    lists cut to their first item; a 2×2 identity for matrices
 *   worst  the longest example (usually the hardest); for matrices the largest size filled with awkward numbers
 *   huge   lists of about 60 items, expressions six times as long, numbers in the hundreds of millions
 */
export function autoScenario(info, state) {
  if (!info) return null;
  if (info.kind === 'matrix') {
    const n = state === 'one' ? Math.max(info.min || 1, 2) : info.max || 4;
    const fill = (f) => Array.from({ length: n }, (_, i) => Array.from({ length: info.square ? n : n + (info.start[0].length - info.start.length) }, (_, j) => f(i, j)));
    if (state === 'empty') return { cells: info.start.map((r) => r.map(() => '')) };
    if (state === 'one') return { cells: fill((i, j) => (i === j ? '1' : '0')) };
    if (state === 'worst') return { cells: fill((i, j) => ['-1/3', '2.75', '0', '-17', '5/7', '123.456'][(i * 7 + j * 3) % 6]) };
    return { cells: fill((i, j) => String((i + 1) * 98765432 - j * 12345678)) };
  }
  const start = info.start || {};
  const typed = (k) => {
    const f = (info.fields || []).find((x) => x.key === k);
    return !f || f.kind === 'field' || f.kind === 'date' || !f.kind;
  };
  const isNum = (s) => /^-?\d+(\.\d+)?$/.test(String(s).trim());
  const isList = (s) => /[,;]/.test(String(s));
  const out = {};
  if (state === 'worst') {
    const ex = [...(info.examples || [])].map((e) => e.input || (e.cells ? { cells: e.cells } : {})).sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length)[0];
    return ex || null;
  }
  for (const [k, v] of Object.entries(start)) {
    if (!typed(k) || typeof v !== 'string' || /^\d{4}-\d{2}-\d{2}$/.test(v)) continue;
    // optional fields left empty stay empty in One and Huge (repeating "" only made "() + () + …")
    if (!v.trim() && state !== 'empty') continue;
    if (state === 'empty') out[k] = '';
    else if (state === 'one') out[k] = isList(v) ? v.split(/[;,]/)[0].trim() : v;
    else if (state === 'huge') {
      if (isList(v)) {
        const sep = v.includes(';') ? '; ' : ', ';
        const items = v.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
        out[k] = Array.from({ length: 60 }, (_, i) => { const it = items[i % items.length]; return isNum(it) ? String(Number(it) + i) : it; }).join(sep);
      } else if (isNum(v)) out[k] = String(Number(v) >= 0 ? 987654321 : -987654321);
      else if (!/[=<>]/.test(v)) out[k] = Array.from({ length: 6 }, () => `(${v})`).join(' + ');
      else out[k] = v;
    }
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// React listens to the native value setter + an input/change event, like real typing
function setValue(el, value) {
  const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

const SOLVE = /calculate|solve|compute|run|find root|evaluate|fit|expand|decompose|interpolate|integrate|iterate/i;
const NOT_SOLVE = /demo|reset|export|random/i;

/** Types one scenario into the page's form and presses its solve button. Returns ms from click to idle. */
export async function applyScenario(key, state) {
  const s = SCENARIOS[key]?.[state];
  if (!s) {
    // No hand-written scenario: build one from the calculator shell's own start values and examples
    const calc = typeof window !== 'undefined' ? window.__netzCalc : null;
    const input = calc && autoScenario(calc, state);
    if (!input) return null;
    const t0 = performance.now();
    calc.apply(input);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return Math.round(performance.now() - t0);
  }
  const inputs = () => [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea')];

  if (s.size) {
    const select = document.querySelector('select');
    if (select) setValue(select, String(s.size));
    await sleep(300);
  }
  if (s.rows) {
    // Data points (DataPointsInput): one [x, y] row per point; delete extras, add missing
    const del = () => [...document.querySelectorAll('button[aria-label^="Delete point"]')];
    const add = () => [...document.querySelectorAll('button')].find((b) => /add point/i.test(b.textContent));
    // Bounded: a page may refuse to delete its last row
    for (let guard = 0; guard < 60 && del().length > s.rows.length; guard += 1) { del()[del().length - 1].click(); await sleep(30); }
    for (let guard = 0; guard < 60 && del().length < s.rows.length; guard += 1) { add()?.click(); await sleep(30); }
    // Rows the page kept beyond the scenario are cleared, so "empty" really is empty
    const pointInputs = () => [...document.querySelectorAll('input[aria-label^="Point "]')];
    pointInputs().forEach((el) => setValue(el, ''));
    await sleep(150);
    const cells = pointInputs();
    s.rows.flat().forEach((v, i) => cells[i] && setValue(cells[i], v));
    const target = document.getElementById('interpolateX');
    if (target && s.fields) setValue(target, s.fields[0]);
  } else if (s.fields) {
    const list = inputs().filter((el) => el.tagName !== 'SELECT');
    s.fields.forEach((v, i) => list[i] && setValue(list[i], v));
  }
  await sleep(200);
  const button = document.querySelector('button[data-solve]') || [...document.querySelectorAll('button')].find((b) => SOLVE.test(b.textContent) && !NOT_SOLVE.test(b.textContent));
  const t0 = performance.now();
  button?.click();
  // Wait for React to draw the result
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return Math.round(performance.now() - t0);
}
