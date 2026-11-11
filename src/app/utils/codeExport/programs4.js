/**
 * Code export for the Unit 5 statistics pages added in Batches 2–4: descriptive statistics, correlation,
 * regression, curve fits, the distributions, Bayes, random variables, ANOVA, confidence intervals,
 * non-parametric tests, control charts and Markov chains. `raw` is what the page passes to its engine.
 * Table values the page reads from F, t and normal tables are written into the program as numbers.
 */

import { fCritical, tCritical } from '../criticalValues.js';
import { normalInverse } from '../numeric/distributions.js';
import {
  D, S, FOR, WHILE, IF, P, C, BREAK, num, int, lit, fn, n, opt, cn, whole, pos, list, pair, table, text, choice, ExportError,
  printVector, printMatrix, gaussSolve, copyMatrix,
} from './kit.js';

/* ---------------- helpers ---------------- */

const block = (body) => FOR('blk', 0, 1, body);

/** target = P(Z < z) for the standard normal, by Simpson's rule on the bell curve from 0 to |z|. */
const normalCdf = (target, z) => block([
  D('ncz', 'num', z),
  D('nca', 'num', 'abs(ncz)'),
  IF('nca > 8', [S(target, '1')], [
    D('hs', 'num', 'nca / 2000'),
    D('area', 'num', '0'),
    FOR('si', 0, 2001, [
      D('wt', 'num', '2'),
      IF('si == 0 or si == 2000', [S('wt', '1')], [IF('si % 2 == 1', [S('wt', '4')])]),
      S('area', 'area + wt * exp(-(si * hs) * (si * hs) / 2)'),
    ]),
    S(target, '0.5 + area * hs / 3 / sqrt(2 * pi)'),
  ]),
  IF('ncz < 0', [S(target, `1 - ${target}`)]),
]);

/** Sorts vector v (and w alongside, when given) into increasing order of v. */
const sortBy = (v, size, w = null) => [
  FOR('so', 1, size, [
    D('sj', 'int', 'so'),
    WHILE(`sj > 0 and ${v}[sj - 1] > ${v}[sj]`, [
      D('sv', 'num', `${v}[sj]`), S(`${v}[sj]`, `${v}[sj - 1]`), S(`${v}[sj - 1]`, 'sv'),
      ...(w ? [D('sw', 'num', `${w}[sj]`), S(`${w}[sj]`, `${w}[sj - 1]`), S(`${w}[sj - 1]`, 'sw')] : []),
      S('sj', 'sj - 1'),
    ]),
  ]),
];

/** Rows of numbers split by ";" (groups may have different lengths). */
function groups(v, label, min = 2) {
  const parts = String(v ?? '').split(';').map((s) => s.trim()).filter(Boolean);
  if (parts.length < min) throw new ExportError(`Enter at least ${min} ${label}s, separated by semicolons (;).`);
  return parts.map((s) => list(s, label, 1));
}

/** Probabilities separated by commas; fractions like 1/8 are fine. */
const probs = (v, label) => {
  const ps = list(v, label, 2);
  if (ps.some((p) => !(p >= 0 && p <= 1))) throw new ExportError(`${label}: each must be between 0 and 1.`);
  return ps;
};

/** The k-range of a binomial or Poisson question. kmax = n, or null for "no upper end". */
function query(raw, kmax) {
  const q = choice(raw.query, ['eq', 'le', 'lt', 'ge', 'gt', 'between']);
  if (q === 'between') {
    const a = whole(raw.a, 'a', 0, 100000);
    const b = whole(raw.b, 'b', 0, 100000);
    if (b < a) throw new ExportError('b must be at least a.');
    return { q, lo: a, hi: kmax === null ? b : Math.min(b, kmax) };
  }
  const k = whole(raw.k, 'k', 0, 100000);
  const r = { eq: [k, k], le: [0, k], lt: [0, k - 1], ge: [k, kmax], gt: [k + 1, kmax] }[q];
  return { q, lo: r[0], hi: r[1] === null ? null : Math.min(r[1], kmax ?? r[1]) };
}
const QUESTION = { eq: 'P(X = k)', le: 'P(X <= k)', lt: 'P(X < k)', ge: 'P(X >= k)', gt: 'P(X > k)', between: 'P(a <= X <= b)' };

/** The question with its numbers, e.g. "P(X <= 2)". */
const asked = (q, lo, hi) => ({
  eq: `P(X = ${lo})`, le: `P(X <= ${hi})`, lt: `P(X < ${hi + 1})`, ge: `P(X >= ${lo})`, gt: `P(X > ${lo - 1})`, between: `P(${lo} <= X <= ${hi})`,
}[q]);

/* ---------------- programs ---------------- */

export const EXPORTS = {
  'descriptive-statistics': {
    name: 'Descriptive statistics',
    clean: (raw) => {
      const mode = choice(raw.mode, ['raw', 'discrete', 'grouped']);
      if (mode === 'raw') {
        const xs = list(raw.data, 'the data', 2);
        return { mode, xs, fs: xs.map(() => 1) };
      }
      const fs = list(raw.f, 'the frequencies', 2);
      if (fs.some((v) => v < 0)) throw new ExportError('Frequencies cannot be negative.');
      if (mode === 'discrete') {
        const xs = list(raw.x, 'the values x', 2);
        if (xs.length !== fs.length) throw new ExportError('Give one frequency per value.');
        return { mode, xs, fs };
      }
      const bounds = String(raw.classes ?? '').split(/[,;]+/).map((s) => s.trim()).filter(Boolean).map((s, i) => {
        const m = s.match(/^(-?\d+(?:\.\d+)?)\s*[-–to]+\s*(-?\d+(?:\.\d+)?)$/);
        if (!m || !(Number(m[2]) > Number(m[1]))) throw new ExportError(`Class ${i + 1} should look like 10-20.`);
        return [Number(m[1]), Number(m[2])];
      });
      if (bounds.length !== fs.length) throw new ExportError('Give one frequency per class.');
      return { mode, xs: bounds.map(([a, b]) => (a + b) / 2), fs, lo: bounds.map((b) => b[0]), hi: bounds.map((b) => b[1]) };
    },
    program: (p) => {
      const grouped = p.mode === 'grouped';
      return {
        title: `Descriptive statistics (${grouped ? 'grouped data' : p.mode === 'discrete' ? 'frequency table' : 'raw data'})`,
        about: ['Mean, median, quartiles, mode, variance (population and sample), standard deviation, skewness and kurtosis'],
        body: [
          D('k', 'int', String(p.xs.length)),
          D('x', 'vec', { vec: p.xs }),
          D('f', 'vec', { vec: p.fs }),
          ...(grouped ? [D('lo', 'vec', { vec: p.lo }), D('hi', 'vec', { vec: p.hi })] : sortBy('x', 'k', 'f')),
          D('N', 'num', '0'), D('sx', 'num', '0'),
          FOR('i', 0, 'k', [S('N', 'N + f[i]'), S('sx', 'sx + f[i] * x[i]')]),
          D('mean', 'num', 'sx / N'),
          D('m2', 'num', '0'), D('m3', 'num', '0'), D('m4', 'num', '0'),
          FOR('i', 0, 'k', [
            D('dv', 'num', 'x[i] - mean'),
            S('m2', 'm2 + f[i] * dv * dv / N'), S('m3', 'm3 + f[i] * dv * dv * dv / N'), S('m4', 'm4 + f[i] * dv * dv * dv * dv / N'),
          ]),
          D('sd', 'num', 'sqrt(m2)'),
          ...(grouped ? [
            C('Median and quartiles: L + (position - cumulative frequency before) / f * class width'),
            D('cum', 'vec', { zeros: 'k' }),
            D('run', 'num', '0'),
            FOR('i', 0, 'k', [S('run', 'run + f[i]'), S('cum[i]', 'run')]),
            D('q', 'vec', { vec: [0.25, 0.5, 0.75] }),
            D('qv', 'vec', { zeros: 3 }),
            FOR('t', 0, 3, [
              D('pos', 'num', 'q[t] * N'),
              D('ci', 'int', '0'),
              WHILE('cum[ci] < pos', [S('ci', 'ci + 1')]),
              D('before', 'num', '0'),
              IF('ci > 0', [S('before', 'cum[ci - 1]')]),
              S('qv[t]', 'lo[ci] + (pos - before) / f[ci] * (hi[ci] - lo[ci])'),
            ]),
            D('median', 'num', 'qv[1]'),
            C('Mode: L + (f1 - f0) / (2 f1 - f0 - f2) * width in the class with the highest frequency'),
            D('mk', 'int', '0'),
            FOR('i', 1, 'k', [IF('f[i] > f[mk]', [S('mk', 'i')])]),
            D('f0', 'num', '0'), D('f2', 'num', '0'),
            IF('mk > 0', [S('f0', 'f[mk - 1]')]),
            IF('mk < k - 1', [S('f2', 'f[mk + 1]')]),
            D('den', 'num', '2 * f[mk] - f0 - f2'),
            D('modeValue', 'num', '(lo[mk] + hi[mk]) / 2'),
            IF('den != 0', [S('modeValue', 'lo[mk] + (f[mk] - f0) / den * (hi[mk] - lo[mk])')]),
            P('Mode = ', num('modeValue', 6)),
            P('Q1 = ', num('qv[0]', 6), ', Q3 = ', num('qv[2]', 6)),
          ] : [
            C('Median and quartiles: the value at position (N + 1)/2 etc., counting by frequency, between neighbours when fractional'),
            D('qp', 'vec', { vec: [0.25, 0.5, 0.75] }),
            D('qv', 'vec', { zeros: 3 }),
            FOR('t', 0, 3, [
              D('pos', 'num', 'qp[t] * (N + 1)'),
              D('lowPos', 'num', 'max(1, floor(pos))'),
              D('frac', 'num', 'pos - floor(pos)'),
              D('va', 'num', 'x[k - 1]'), D('vb', 'num', 'x[k - 1]'),
              D('run', 'num', '0'),
              D('gotA', 'bool', 'false'), D('gotB', 'bool', 'false'),
              FOR('i', 0, 'k', [
                S('run', 'run + f[i]'),
                IF('not gotA and run >= lowPos', [S('va', 'x[i]'), S('gotA', 'true')]),
                IF('not gotB and run >= floor(pos) + 1', [S('vb', 'x[i]'), S('gotB', 'true')]),
              ]),
              IF('floor(pos) < 1', [S('frac', '0')]),
              S('qv[t]', 'va + frac * (vb - va)'),
            ]),
            D('median', 'num', 'qv[1]'),
            C('Mode: the values with the highest frequency (equal values merged)'),
            D('top', 'num', '0'),
            D('run', 'num', '0'),
            FOR('i', 0, 'k', [S('run', 'run + f[i]'), IF('i == k - 1 or x[i + 1] != x[i]', [S('top', 'max(top, run)'), S('run', '0')])]),
            D('distinct', 'num', '0'),
            D('atTop', 'num', '0'),
            S('run', '0'),
            FOR('i', 0, 'k', [S('run', 'run + f[i]'), IF('i == k - 1 or x[i + 1] != x[i]', [S('distinct', 'distinct + 1'), IF('run == top', [S('atTop', 'atTop + 1')]), S('run', '0')])]),
            IF(p.mode === 'raw' ? 'top > 1 and atTop < distinct' : 'top > 0', [
              S('run', '0'),
              FOR('i', 0, 'k', [S('run', 'run + f[i]'), IF('i == k - 1 or x[i + 1] != x[i]', [IF('run == top', [P('Mode = ', num('x[i]', 6))]), S('run', '0')])]),
            ], [P('Mode: none (no value repeats more than the others)')]),
            P('Q1 = ', num('qv[0]', 6), ', Q3 = ', num('qv[2]', 6)),
          ]),
          P('N = ', num('N', 0)),
          P('Mean = ', num('mean', 6)),
          P('Median = ', num('median', 6)),
          P('Variance (population) = ', num('m2', 6), ', standard deviation = ', num('sd', 6)),
          IF('N > 1', [P('Sample variance = ', num('m2 * N / (N - 1)', 6), ', sample s = ', num('sqrt(m2 * N / (N - 1))', 6))]),
          IF('mean != 0', [P('Coefficient of variation = ', num('sd / abs(mean) * 100', 4), '%')]),
          IF('sd > 0', [P('Skewness (Pearson) = ', num('3 * (mean - median) / sd', 4))]),
          IF('m2 > 0', [P('Kurtosis beta2 = ', num('m4 / (m2 * m2)', 4), ', beta1 = ', num('m3 * m3 / (m2 * m2 * m2)', 4))]),
        ],
      };
    },
  },

  correlation: {
    name: 'Correlation (Pearson and Spearman)',
    clean: (raw) => {
      const [x, y] = pair(raw.x, raw.y, 'x', 'y', 3);
      return { x, y, method: choice(raw.method, ['pearson', 'spearman']) };
    },
    program: (p) => {
      const spearman = p.method === 'spearman';
      return {
        title: spearman ? "Spearman's rank correlation" : "Karl Pearson's correlation coefficient",
        about: spearman
          ? ['Rank both lists (1 = largest, ties share the mean rank)', 'rho = 1 - 6 (sum d^2 + tie corrections) / (n (n^2 - 1)), each tie group of m adds m(m^2 - 1)/12']
          : ['r = sum(dx dy) / sqrt(sum dx^2 * sum dy^2), dx = x - mean x, dy = y - mean y'],
        body: [
          D('n', 'int', String(p.x.length)),
          D('x', 'vec', { vec: p.x }),
          D('y', 'vec', { vec: p.y }),
          ...(spearman ? [
            D('d2', 'num', '0'),
            D('cf', 'num', '0'),
            FOR('i', 0, 'n', [
              D('ax', 'num', '0'), D('ex', 'num', '0'), D('ay', 'num', '0'), D('ey', 'num', '0'),
              FOR('j', 0, 'n', [
                IF('x[j] > x[i]', [S('ax', 'ax + 1')]), IF('x[j] == x[i]', [S('ex', 'ex + 1')]),
                IF('y[j] > y[i]', [S('ay', 'ay + 1')]), IF('y[j] == y[i]', [S('ey', 'ey + 1')]),
              ]),
              D('rx', 'num', '1 + ax + (ex - 1) / 2'),
              D('ry', 'num', '1 + ay + (ey - 1) / 2'),
              P('x = ', num('x[i]', 4), ' rank ', num('rx', 1), ', y = ', num('y[i]', 4), ' rank ', num('ry', 1)),
              S('d2', 'd2 + (rx - ry) * (rx - ry)'),
              S('cf', 'cf + (ex * ex - 1) / 12 + (ey * ey - 1) / 12'),
            ]),
            D('rho', 'num', '1 - 6 * (d2 + cf) / (n * (n * n - 1))'),
            P('Sum of d^2 = ', num('d2', 4), ', tie correction = ', num('cf', 4)),
            P('rho = ', num('rho', 6)),
          ] : [
            D('mx', 'num', '0'), D('my', 'num', '0'),
            FOR('i', 0, 'n', [S('mx', 'mx + x[i] / n'), S('my', 'my + y[i] / n')]),
            D('sxx', 'num', '0'), D('syy', 'num', '0'), D('sxy', 'num', '0'),
            FOR('i', 0, 'n', [S('sxx', 'sxx + (x[i] - mx) * (x[i] - mx)'), S('syy', 'syy + (y[i] - my) * (y[i] - my)'), S('sxy', 'sxy + (x[i] - mx) * (y[i] - my)')]),
            P('Sum dx^2 = ', num('sxx', 4), ', sum dy^2 = ', num('syy', 4), ', sum dx dy = ', num('sxy', 4)),
            P('r = ', num('sxy / sqrt(sxx * syy)', 6)),
          ]),
        ],
      };
    },
  },

  regression: {
    name: 'Regression lines',
    clean: (raw) => {
      const [x, y] = pair(raw.x, raw.y, 'x', 'y', 3);
      return { x, y, atX: String(raw.atX ?? '').trim() ? n(raw.atX, 'the x value') : null, atY: String(raw.atY ?? '').trim() ? n(raw.atY, 'the y value') : null };
    },
    program: (p) => ({
      title: 'Lines of regression: y on x and x on y',
      about: ['b_yx = sum(dx dy) / sum dx^2, b_xy = sum(dx dy) / sum dy^2; both lines pass through (mean x, mean y)', 'r = sign * sqrt(b_yx b_xy)'],
      body: [
        D('n', 'int', String(p.x.length)),
        D('x', 'vec', { vec: p.x }),
        D('y', 'vec', { vec: p.y }),
        D('mx', 'num', '0'), D('my', 'num', '0'),
        FOR('i', 0, 'n', [S('mx', 'mx + x[i] / n'), S('my', 'my + y[i] / n')]),
        D('sxx', 'num', '0'), D('syy', 'num', '0'), D('sxy', 'num', '0'),
        FOR('i', 0, 'n', [S('sxx', 'sxx + (x[i] - mx) * (x[i] - mx)'), S('syy', 'syy + (y[i] - my) * (y[i] - my)'), S('sxy', 'sxy + (x[i] - mx) * (y[i] - my)')]),
        D('byx', 'num', 'sxy / sxx'),
        D('bxy', 'num', 'sxy / syy'),
        D('ayx', 'num', 'my - byx * mx'),
        D('axy', 'num', 'mx - bxy * my'),
        P('y on x: y = ', num('byx', 4), ' x + ', num('ayx', 4)),
        P('x on y: x = ', num('bxy', 4), ' y + ', num('axy', 4)),
        D('r', 'num', 'sqrt(byx * bxy)'),
        IF('sxy < 0', [S('r', '-r')]),
        P('r = ', num('r', 6)),
        ...(p.atX === null ? [] : [P('y at x = ', num(lit(p.atX), 4), ': ', num(`ayx + byx * ${lit(p.atX)}`, 4))]),
        ...(p.atY === null ? [] : [P('x at y = ', num(lit(p.atY), 4), ': ', num(`axy + bxy * ${lit(p.atY)}`, 4))]),
      ],
    }),
  },

  'curve-fitting': {
    name: 'Exponential and power curve fits',
    clean: (raw) => {
      const [x, y] = pair(raw.x, raw.y, 'x', 'y', 2);
      const model = choice(raw.model, ['exponential', 'base', 'power', 'polynomial']);
      const degree = model === 'polynomial' ? (String(raw.degree) === '3' ? 3 : 2) : null;
      if (degree && x.length < degree + 1) throw new ExportError(`A degree-${degree} fit needs at least ${degree + 1} points.`);
      if (model !== 'polynomial' && y.some((v) => !(v > 0))) throw new ExportError('Every y must be positive to take logs.');
      if (model === 'power' && x.some((v) => !(v > 0))) throw new ExportError('Every x must be positive for y = a x^b.');
      return { x, y, model, degree, at: String(raw.at ?? '').trim() ? n(raw.at, 'the x value') : null };
    },
    program: (p) => {
      if (p.model === 'polynomial') {
        const m = p.degree;
        return {
          title: `Least squares polynomial of degree ${m}`,
          about: ['Normal equations: sum over points of x^(i+j) times the coefficients = sum of x^i y'],
          body: [
            D('n', 'int', String(p.x.length)),
            D('x', 'vec', { vec: p.x }),
            D('y', 'vec', { vec: p.y }),
            D('m', 'int', String(m + 1)),
            D('A', 'mat', { zeros2: ['m', 'm'] }),
            D('rhs', 'vec', { zeros: 'm' }),
            FOR('i', 0, 'm', [
              FOR('j', 0, 'm', [FOR('t', 0, 'n', [S('A[i, j]', 'A[i, j] + pow(x[t], i + j)')])]),
              FOR('t', 0, 'n', [S('rhs[i]', 'rhs[i] + pow(x[t], i) * y[t]')]),
            ]),
            ...gaussSolve('A', 'rhs', 'c', 'm'),
            FOR('i', 0, 'm', [P('Coefficient of x^', int('i'), ': ', num('c[i]', 6))]),
            ...(p.at === null ? [] : [
              D('yv', 'num', '0'),
              FOR('i', 0, 'm', [S('yv', `yv + c[i] * pow(${lit(p.at)}, i)`)]),
              P('y(', num(lit(p.at), 4), ') = ', num('yv', 6)),
            ]),
          ],
        };
      }
      const ln = p.model === 'exponential';
      const X = p.model === 'power' ? 'log10(x[i])' : 'x[i]';
      const Y = ln ? 'log(y[i])' : 'log10(y[i])';
      const back = {
        exponential: [D('a', 'num', 'exp(A0)'), D('b', 'num', 'B'), P('y = ', num('a', 4), ' e^(', num('b', 4), ' x)')],
        base: [D('a', 'num', 'pow(10, A0)'), D('b', 'num', 'pow(10, B)'), P('y = ', num('a', 4), ' (', num('b', 4), ')^x')],
        power: [D('a', 'num', 'pow(10, A0)'), D('b', 'num', 'B'), P('y = ', num('a', 4), ' x^', num('b', 4))],
      }[p.model];
      const at = p.at === null ? [] : [P('y(', num(lit(p.at), 4), ') = ', num({ exponential: `a * exp(b * ${lit(p.at)})`, base: `a * pow(b, ${lit(p.at)})`, power: `a * pow(${lit(p.at)}, b)` }[p.model], 6))];
      return {
        title: { exponential: 'Fit y = a e^(bx)', base: 'Fit y = a b^x', power: 'Fit y = a x^b' }[p.model],
        about: [`Take logs to get a straight line Y = A + B X with Y = ${ln ? 'ln y' : 'log y'}${p.model === 'power' ? ' and X = log x' : ''}, fit it by least squares, then undo the logs`],
        body: [
          D('n', 'int', String(p.x.length)),
          D('x', 'vec', { vec: p.x }),
          D('y', 'vec', { vec: p.y }),
          D('SX', 'num', '0'), D('SY', 'num', '0'), D('SXX', 'num', '0'), D('SXY', 'num', '0'),
          FOR('i', 0, 'n', [
            D('Xi', 'num', X), D('Yi', 'num', Y),
            S('SX', 'SX + Xi'), S('SY', 'SY + Yi'), S('SXX', 'SXX + Xi * Xi'), S('SXY', 'SXY + Xi * Yi'),
          ]),
          D('B', 'num', '(n * SXY - SX * SY) / (n * SXX - SX * SX)'),
          D('A0', 'num', '(SY - B * SX) / n'),
          P('Straight line: Y = ', num('A0', 4), ' + ', num('B', 4), ' X'),
          ...back,
          ...at,
        ],
      };
    },
  },

  binomial: {
    name: 'Binomial distribution',
    clean: (raw) => {
      const N = whole(raw.n, 'the number of trials n', 1, 1000);
      const p = cn(raw.p, 'p');
      if (!(p >= 0 && p <= 1)) throw new ExportError('p is a probability, so it must be between 0 and 1.');
      return { N, p, ...query(raw, N) };
    },
    program: (p) => ({
      title: `Binomial distribution: ${QUESTION[p.q]}`,
      about: ['P(X = k) = C(n, k) p^k q^(n - k), q = 1 - p'],
      body: [
        D('n', 'int', String(p.N)),
        D('p', 'num', lit(p.p)),
        D('q', 'num', '1 - p'),
        D('total', 'num', '0'),
        D('comb', 'num', '1'),
        C('comb = C(n, k), updated as k grows: C(n, k + 1) = C(n, k) (n - k) / (k + 1)'),
        FOR('k', 0, 'n + 1', [
          D('pk', 'num', 'comb * pow(p, k) * pow(q, n - k)'),
          IF(`k >= ${p.lo} and k <= ${p.hi}`, [S('total', 'total + pk'), IF('k <= 40', [P('P(X = ', int('k'), ') = ', num('pk', 6))])]),
          S('comb', 'comb * (n - k) / (k + 1)'),
        ]),
        P(`${asked(p.q, p.lo, p.hi)} = `, num('min(1, max(0, total))', 6)),
        P('Mean = ', num('n * p', 4), ', variance = ', num('n * p * q', 4)),
      ],
    }),
  },

  poisson: {
    name: 'Poisson distribution',
    clean: (raw) => {
      let lambda;
      if (raw.source === 'binomial') {
        const N = whole(raw.n, 'n', 1, 1000000000);
        const pp = cn(raw.p, 'p');
        if (!(pp > 0 && pp < 1)) throw new ExportError('p must be between 0 and 1.');
        lambda = N * pp;
      } else lambda = pos(cn(raw.lambda, 'the mean λ'), 'λ');
      if (lambda > 500) throw new ExportError('Use λ of 500 or less.');
      return { lambda, ...query(raw, null) };
    },
    program: (p) => {
      const open = p.hi === null;
      return {
        title: `Poisson distribution: ${QUESTION[p.q]}`,
        about: ['P(X = k) = e^-lambda lambda^k / k!', ...(open ? ['An open upper end uses 1 - P(X < lower end)'] : [])],
        body: [
          D('lambda0', 'num', lit(p.lambda)),
          D('pk', 'num', 'exp(-lambda0)'),
          D('below', 'num', '0'),
          D('inside', 'num', '0'),
          FOR('k', 0, String((open ? p.lo : p.hi) + 1), [
            IF('k > 0', [S('pk', 'pk * lambda0 / k')]),
            IF(`k < ${p.lo}`, [S('below', 'below + pk')], [S('inside', 'inside + pk')]),
            IF('k <= 40', [P('P(X = ', int('k'), ') = ', num('pk', 6))]),
          ]),
          D('answer', 'num', open ? '1 - below' : 'inside'),
          P(`${open ? asked(p.q, p.lo, null) : asked(p.q, p.lo, p.hi)} = `, num('min(1, max(0, answer))', 6)),
          P('Mean = variance = ', num('lambda0', 4)),
        ],
      };
    },
  },

  normal: {
    name: 'Normal distribution',
    clean: (raw) => {
      const q = choice(raw.query, ['lt', 'gt', 'between', 'inverse']);
      const out = { mu: n(opt(raw.mu, 0), 'μ'), sigma: pos(opt(raw.sigma, 1), 'σ'), q };
      if (q === 'inverse') {
        out.p = n(raw.p, 'p');
        if (!(out.p > 0 && out.p < 1)) throw new ExportError('p must be between 0 and 1.');
      } else {
        out.a = n(raw.a, 'a');
        if (q === 'between') {
          out.b = n(raw.b, 'b');
          if (!(out.b > out.a)) throw new ExportError('b must be bigger than a.');
        }
      }
      return out;
    },
    program: (p) => ({
      title: p.q === 'inverse' ? 'Normal distribution: the x with P(X < x) = p' : 'Normal distribution probability',
      about: ['z = (x - mu) / sigma; P(Z < z) is the area under the bell curve, found here by Simpson\'s rule', ...(p.q === 'inverse' ? ['x is found by halving an interval until P(X < x) = p'] : [])],
      body: [
        D('mu', 'num', lit(p.mu)),
        D('sigma', 'num', lit(p.sigma)),
        ...(p.q === 'inverse' ? [
          D('target', 'num', lit(p.p)),
          D('lo', 'num', '-40'), D('hi', 'num', '40'),
          FOR('it', 0, 100, [
            D('mid', 'num', '(lo + hi) / 2'),
            D('cdf', 'num', '0'),
            normalCdf('cdf', 'mid'),
            IF('cdf < target', [S('lo', 'mid')], [S('hi', 'mid')]),
          ]),
          P('z = ', num('(lo + hi) / 2', 4)),
          P('x = mu + z sigma = ', num('mu + (lo + hi) / 2 * sigma', 4)),
        ] : [
          D('za', 'num', `(${lit(p.a)} - mu) / sigma`),
          D('Fa', 'num', '0'),
          normalCdf('Fa', 'za'),
          ...(p.q === 'between' ? [
            D('zb', 'num', `(${lit(p.b)} - mu) / sigma`),
            D('Fb', 'num', '0'),
            normalCdf('Fb', 'zb'),
            P('z1 = ', num('za', 4), ', z2 = ', num('zb', 4)),
            P(`P(${lit(p.a)} < X < ${lit(p.b)}) = `, num('Fb - Fa', 4)),
          ] : [
            P('z = ', num('za', 4)),
            P(p.q === 'lt' ? `P(X < ${lit(p.a)}) = ` : `P(X > ${lit(p.a)}) = `, num(p.q === 'lt' ? 'Fa' : '1 - Fa', 4)),
          ]),
        ]),
      ],
    }),
  },

  bayes: {
    name: "Bayes' theorem",
    clean: (raw) => {
      const pr = probs(raw.priors, 'P(E)');
      const lk = probs(raw.likelihoods, 'P(A | E)');
      if (pr.length !== lk.length) throw new ExportError('Give one P(A | E) for each event.');
      if (Math.abs(pr.reduce((s, v) => s + v, 0) - 1) > 1e-6) throw new ExportError('The P(E) must add up to 1.');
      return { pr, lk };
    },
    program: (p) => ({
      title: "Bayes' theorem",
      about: ['P(A) = sum of P(E_i) P(A | E_i); P(E_i | A) = P(E_i) P(A | E_i) / P(A)'],
      body: [
        D('k', 'int', String(p.pr.length)),
        D('prior', 'vec', { vec: p.pr }),
        D('like', 'vec', { vec: p.lk }),
        D('PA', 'num', '0'),
        FOR('i', 0, 'k', [S('PA', 'PA + prior[i] * like[i]')]),
        P('P(A) = ', num('PA', 6)),
        FOR('i', 0, 'k', [P('P(E', int('i + 1'), ' | A) = ', num('prior[i] * like[i] / PA', 6))]),
      ],
    }),
  },

  'random-variables': {
    name: 'Random variables',
    clean: (raw) => {
      if (raw.kind === 'continuous') {
        const a = cn(raw.a, 'a');
        const b = cn(raw.b, 'b');
        if (!(b > a)) throw new ExportError('b must be bigger than a.');
        const both = String(raw.c ?? '').trim() && String(raw.d ?? '').trim();
        return { kind: 'continuous', f: text(raw.f, 'f(x)'), a, b, c: both ? Math.max(a, cn(raw.c, 'c')) : null, d: both ? Math.min(b, cn(raw.d, 'd')) : null };
      }
      const xs = list(raw.x, 'the values x', 1);
      const ps = probs(raw.p, 'the probabilities');
      if (xs.length !== ps.length) throw new ExportError('Give one probability per value.');
      return { kind: 'discrete', xs, ps };
    },
    program: (p) => {
      if (p.kind === 'discrete') {
        return {
          title: 'Discrete random variable: mean and variance',
          about: ['E(X) = sum x p, E(X^2) = sum x^2 p, Var(X) = E(X^2) - E(X)^2'],
          body: [
            D('k', 'int', String(p.xs.length)),
            D('x', 'vec', { vec: p.xs }),
            D('p', 'vec', { vec: p.ps }),
            D('E', 'num', '0'), D('E2', 'num', '0'),
            FOR('i', 0, 'k', [S('E', 'E + x[i] * p[i]'), S('E2', 'E2 + x[i] * x[i] * p[i]')]),
            P('E(X) = ', num('E', 6)),
            P('E(X^2) = ', num('E2', 6)),
            P('Var(X) = ', num('E2 - E * E', 6), ', SD = ', num('sqrt(E2 - E * E)', 6)),
          ],
        };
      }
      // Simpson's rule with 1000 strips for an integral of `expr` (in x) from lo to hi into target
      const simpson = (target, expr, lo, hi) => block([
        D('sh', 'num', `(${hi} - ${lo}) / 1000`),
        D('acc', 'num', '0'),
        FOR('si', 0, 1001, [
          D('xs', 'num', `${lo} + si * sh`),
          D('wt', 'num', '2'),
          IF('si == 0 or si == 1000', [S('wt', '1')], [IF('si % 2 == 1', [S('wt', '4')])]),
          S('acc', `acc + wt * ${expr.replace(/\bx\b/g, 'xs')}`),
        ]),
        S(target, 'acc * sh / 3'),
      ]);
      return {
        title: 'Continuous random variable: mean and variance',
        about: ['E(X) = integral of x f(x), E(X^2) = integral of x^2 f(x), by Simpson\'s rule'],
        funcs: [fn('f', p.f)],
        body: [
          D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)),
          D('total', 'num', '0'), D('E', 'num', '0'), D('E2', 'num', '0'),
          simpson('total', 'f(x)', 'a', 'b'),
          simpson('E', 'x * f(x)', 'a', 'b'),
          simpson('E2', 'x * x * f(x)', 'a', 'b'),
          P('Total probability = ', num('total', 6)),
          P('E(X) = ', num('E', 6)),
          P('Var(X) = ', num('E2 - E * E', 6), ', SD = ', num('sqrt(E2 - E * E)', 6)),
          ...(p.c === null ? [] : [
            D('prob', 'num', '0'),
            ...(p.d > p.c ? [simpson('prob', 'f(x)', lit(p.c), lit(p.d))] : []),
            P(`P(${lit(p.c)} < X < ${lit(p.d)}) = `, num('prob', 6)),
          ]),
        ],
      };
    },
  },

  anova: {
    name: 'ANOVA',
    clean: (raw) => {
      const kind = choice(raw.kind, ['one', 'two']);
      const alpha = n(opt(raw.alpha, 0.05), 'the significance level');
      if (!(alpha > 0 && alpha < 0.5)) throw new ExportError('Use a significance level like 0.05 or 0.01.');
      const data = groups(raw.groups, kind === 'one' ? 'group' : 'row');
      if (kind === 'two' && data.some((r) => r.length !== data[0].length)) throw new ExportError('Two-way ANOVA needs the same number of values in every row.');
      const N = data.flat().length;
      if (kind === 'one') {
        const df1 = data.length - 1;
        const df2 = N - data.length;
        if (df2 < 1) throw new ExportError('Each group needs more values.');
        return { kind, alpha, data, crit: [fCritical(df1, df2, alpha)] };
      }
      const r = data.length;
      const c = data[0].length;
      if (c < 2) throw new ExportError('Each row needs at least two values.');
      return { kind, alpha, data, crit: [fCritical(r - 1, (r - 1) * (c - 1), alpha), fCritical(c - 1, (r - 1) * (c - 1), alpha)] };
    },
    program: (p) => {
      const flat = p.data.flat();
      const common = [
        D('N', 'int', String(flat.length)),
        D('v', 'vec', { vec: flat }),
        D('G', 'num', '0'), D('SS', 'num', '0'),
        FOR('i', 0, 'N', [S('G', 'G + v[i]'), S('SS', 'SS + v[i] * v[i]')]),
        D('CF', 'num', 'G * G / N'),
        D('SST', 'num', 'SS - CF'),
      ];
      const verdict = (F, crit, what) => IF(`${F} > ${crit}`, [P(`F > F critical: reject H0 (the ${what} differ)`)], [P(`F <= F critical: do not reject H0 (no significant difference between ${what})`)]);
      if (p.kind === 'one') {
        return {
          title: 'One-way ANOVA',
          about: ['SST = sum x^2 - G^2/N, SS(treatments) = sum T_i^2 / n_i - G^2/N, SSE = SST - SS(treatments)', `F critical at ${p.alpha * 100}% is from F tables`],
          body: [
            D('k', 'int', String(p.data.length)),
            D('sizes', 'vec', { vec: p.data.map((g) => g.length) }),
            ...common,
            D('SSTr', 'num', '0'),
            D('at', 'int', '0'),
            FOR('g', 0, 'k', [
              D('T', 'num', '0'),
              FOR('j', 0, 'int(sizes[g])', [S('T', 'T + v[at]'), S('at', 'at + 1')]),
              S('SSTr', 'SSTr + T * T / sizes[g]'),
            ]),
            S('SSTr', 'SSTr - CF'),
            D('SSE', 'num', 'SST - SSTr'),
            D('MSTr', 'num', 'SSTr / (k - 1)'),
            D('MSE', 'num', 'SSE / (N - k)'),
            D('F', 'num', 'MSTr / MSE'),
            P('Treatments: SS = ', num('SSTr', 4), ', df = ', int('k - 1'), ', MS = ', num('MSTr', 4)),
            P('Error:      SS = ', num('SSE', 4), ', df = ', int('N - k'), ', MS = ', num('MSE', 4)),
            P('Total:      SS = ', num('SST', 4), ', df = ', int('N - 1')),
            P('F = ', num('F', 4), ', F critical = ', num(lit(p.crit[0]), 3)),
            verdict('F', lit(p.crit[0]), 'group means'),
          ],
        };
      }
      return {
        title: 'Two-way ANOVA (one value per cell)',
        about: ['SSR = sum R_i^2 / c - CF, SSC = sum C_j^2 / r - CF, SSE = SST - SSR - SSC', `F critical values at ${p.alpha * 100}% are from F tables`],
        body: [
          D('r', 'int', String(p.data.length)),
          D('c', 'int', String(p.data[0].length)),
          ...common,
          D('SSR', 'num', '0'), D('SSC', 'num', '0'),
          FOR('i', 0, 'r', [D('R', 'num', '0'), FOR('j', 0, 'c', [S('R', 'R + v[i * c + j]')]), S('SSR', 'SSR + R * R / c')]),
          FOR('j', 0, 'c', [D('Cj', 'num', '0'), FOR('i', 0, 'r', [S('Cj', 'Cj + v[i * c + j]')]), S('SSC', 'SSC + Cj * Cj / r')]),
          S('SSR', 'SSR - CF'), S('SSC', 'SSC - CF'),
          D('SSE', 'num', 'SST - SSR - SSC'),
          D('MSE', 'num', 'SSE / ((r - 1) * (c - 1))'),
          D('FR', 'num', 'SSR / (r - 1) / MSE'),
          D('FC', 'num', 'SSC / (c - 1) / MSE'),
          P('Rows:    SS = ', num('SSR', 4), ', F = ', num('FR', 4), ', F critical = ', num(lit(p.crit[0]), 3)),
          P('Columns: SS = ', num('SSC', 4), ', F = ', num('FC', 4), ', F critical = ', num(lit(p.crit[1]), 3)),
          P('Error:   SS = ', num('SSE', 4), ', MS = ', num('MSE', 4)),
          verdict('FR', lit(p.crit[0]), 'row means'),
          verdict('FC', lit(p.crit[1]), 'column means'),
        ],
      };
    },
  },

  'exponential-dist': {
    name: 'Exponential distribution',
    clean: (raw) => {
      const mode = choice(raw.mode, ['less', 'greater', 'between']);
      const out = { L: pos(cn(raw.lambda, 'λ'), 'λ'), mode };
      if (mode === 'between') {
        out.a = cn(raw.a, 'a');
        out.b = cn(raw.b, 'b');
        if (!(out.b > out.a)) throw new ExportError('b must be bigger than a.');
      } else out.x = cn(raw.x, 'x');
      return out;
    },
    program: (p) => ({
      title: 'Exponential distribution',
      about: ['F(x) = 1 - e^(-lambda x) for x > 0; mean 1/lambda, variance 1/lambda^2'],
      body: [
        D('lam', 'num', lit(p.L)),
        ...(p.mode === 'between'
          ? [P(`P(${lit(p.a)} < X < ${lit(p.b)}) = `, num(`exp(-lam * max(0, ${lit(p.a)})) - exp(-lam * max(0, ${lit(p.b)}))`, 6))]
          : [P(p.mode === 'less' ? `P(X < ${lit(p.x)}) = ` : `P(X > ${lit(p.x)}) = `, num(p.mode === 'less' ? `1 - exp(-lam * max(0, ${lit(p.x)}))` : `exp(-lam * max(0, ${lit(p.x)}))`, 6))]),
        P('Mean = ', num('1 / lam', 6), ', variance = ', num('1 / (lam * lam)', 6)),
      ],
    }),
  },

  'uniform-dist': {
    name: 'Uniform distribution',
    clean: (raw) => {
      const p = { a: cn(raw.a, 'a'), b: cn(raw.b, 'b'), c: cn(raw.c, 'c'), d: cn(raw.d, 'd') };
      if (!(p.b > p.a)) throw new ExportError('b must be bigger than a.');
      if (!(p.d >= p.c)) throw new ExportError('d must not be smaller than c.');
      return p;
    },
    program: (p) => ({
      title: 'Uniform distribution on [a, b]',
      about: ['P(c < X < d) = (length of (c, d) inside [a, b]) / (b - a)'],
      body: [
        D('a', 'num', lit(p.a)), D('b', 'num', lit(p.b)), D('c', 'num', lit(p.c)), D('d', 'num', lit(p.d)),
        D('lo', 'num', 'max(a, c)'), D('hi', 'num', 'min(b, d)'),
        D('prob', 'num', '0'),
        IF('hi > lo', [S('prob', '(hi - lo) / (b - a)')]),
        P('P(c < X < d) = ', num('prob', 6)),
        P('Mean = ', num('(a + b) / 2', 6), ', variance = ', num('(b - a) * (b - a) / 12', 6)),
      ],
    }),
  },

  'geometric-dist': {
    name: 'Geometric distribution',
    clean: (raw) => {
      const p = cn(raw.p, 'p');
      if (!(p > 0 && p <= 1)) throw new ExportError('p must be between 0 and 1.');
      const k = Math.round(cn(raw.k, 'k'));
      if (!(k >= 1)) throw new ExportError('k counts trials: 1, 2, 3, …');
      return { p, k, mode: choice(raw.mode, ['exact', 'atmost', 'atleast']) };
    },
    program: (p) => ({
      title: 'Geometric distribution (X = the trial of the first success)',
      about: ['P(X = k) = q^(k - 1) p, P(X <= k) = 1 - q^k, P(X >= k) = q^(k - 1)'],
      body: [
        D('p', 'num', lit(p.p)),
        D('q', 'num', '1 - p'),
        D('k', 'num', String(p.k)),
        P({ exact: 'P(X = k) = ', atmost: 'P(X <= k) = ', atleast: 'P(X >= k) = ' }[p.mode], num({ exact: 'pow(q, k - 1) * p', atmost: '1 - pow(q, k)', atleast: 'pow(q, k - 1)' }[p.mode], 6)),
        P('Mean = ', num('1 / p', 6), ', variance = ', num('q / (p * p)', 6)),
      ],
    }),
  },

  'gamma-dist': {
    name: 'Gamma distribution',
    clean: (raw) => {
      const mode = choice(raw.mode, ['less', 'greater', 'between']);
      const out = { A: pos(cn(raw.alpha, 'α'), 'α'), T: pos(cn(raw.theta, 'θ'), 'θ'), mode };
      if (mode === 'between') {
        out.a = cn(raw.a, 'a');
        out.b = cn(raw.b, 'b');
        if (!(out.b > out.a)) throw new ExportError('b must be bigger than a.');
      } else out.x = cn(raw.x, 'x');
      return out;
    },
    program: (p) => {
      // target = P(alpha, x / theta), the regularized lower incomplete gamma function
      const cdf = (target, x) => block([
        D('gx', 'num', `(${x}) / th`),
        IF('gx <= 0', [S(target, '0')], [
          D('lead', 'num', 'exp(-gx + al * log(gx) - lg)'),
          IF('gx < al + 1', [
            C('Series'),
            D('term', 'num', '1 / al'),
            D('sum', 'num', 'term'),
            FOR('k', 1, 500, [S('term', 'term * gx / (al + k)'), S('sum', 'sum + term'), IF('abs(term) < abs(sum) * 1e-15', [BREAK])]),
            S(target, 'sum * lead'),
          ], [
            C('Continued fraction for the upper part, then 1 minus it'),
            D('cb', 'num', 'gx + 1 - al'),
            D('cc', 'num', '1e300'),
            D('cd', 'num', '1 / cb'),
            D('ch', 'num', 'cd'),
            FOR('k', 1, 500, [
              D('an', 'num', '-k * (k - al)'),
              S('cb', 'cb + 2'),
              S('cd', 'an * cd + cb'), IF('abs(cd) < 1e-300', [S('cd', '1e-300')]),
              S('cc', 'cb + an / cc'), IF('abs(cc) < 1e-300', [S('cc', '1e-300')]),
              S('cd', '1 / cd'),
              S('ch', 'ch * cd * cc'),
              IF('abs(cd * cc - 1) < 1e-15', [BREAK]),
            ]),
            S(target, '1 - lead * ch'),
          ]),
        ]),
      ]);
      return {
        title: 'Gamma distribution (shape alpha, scale theta)',
        about: ['F(x) = P(alpha, x/theta), the regularized lower incomplete gamma function', 'ln Gamma(alpha) by the Lanczos approximation'],
        body: [
          D('al', 'num', lit(p.A)),
          D('th', 'num', lit(p.T)),
          C('lg = ln Gamma(al), Lanczos (g = 7)'),
          D('lc', 'vec', { vec: [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7] }),
          D('lx', 'num', 'al'),
          D('reflect', 'bool', 'al < 0.5'),
          IF('reflect', [S('lx', '1 - al')]),
          S('lx', 'lx - 1'),
          D('ls', 'num', '0.99999999999980993'),
          FOR('i', 0, 8, [S('ls', 'ls + lc[i] / (lx + i + 1)')]),
          D('lt', 'num', 'lx + 7.5'),
          D('lg', 'num', '0.5 * log(2 * pi) + (lx + 0.5) * log(lt) - lt + log(ls)'),
          IF('reflect', [S('lg', 'log(pi / sin(pi * al)) - lg')]),
          ...(p.mode === 'between' ? [
            D('Fa', 'num', '0'), D('Fb', 'num', '0'),
            cdf('Fa', lit(p.a)), cdf('Fb', lit(p.b)),
            P(`P(${lit(p.a)} < X < ${lit(p.b)}) = `, num('Fb - Fa', 6)),
          ] : [
            D('Fx', 'num', '0'),
            cdf('Fx', lit(p.x)),
            P(p.mode === 'less' ? `P(X < ${lit(p.x)}) = ` : `P(X > ${lit(p.x)}) = `, num(p.mode === 'less' ? 'Fx' : '1 - Fx', 6)),
          ]),
          P('Mean = ', num('al * th', 6), ', variance = ', num('al * th * th', 6)),
        ],
      };
    },
  },

  'joint-distribution': {
    name: 'Joint distributions and covariance',
    clean: (raw) => {
      const xs = list(raw.xs, 'the x values', 1);
      const ys = list(raw.ys, 'the y values', 1);
      const P0 = table(String(raw.table ?? ''), 'the probability table', { cols: ys.length });
      if (P0.length !== xs.length) throw new ExportError(`Give ${xs.length} rows of probabilities.`);
      if (Math.abs(P0.flat().reduce((s, v) => s + v, 0) - 1) > 1e-9) throw new ExportError('The probabilities must add up to 1.');
      return { xs, ys, P: P0 };
    },
    program: (p) => ({
      title: 'Joint distribution of X and Y: marginals, covariance and correlation',
      about: ['Cov(X, Y) = E(XY) - E(X) E(Y); rho = Cov / (sd X * sd Y)', 'X and Y are independent when every p(x, y) = p(x) p(y)'],
      body: [
        D('m', 'int', String(p.xs.length)), D('n', 'int', String(p.ys.length)),
        D('x', 'vec', { vec: p.xs }), D('y', 'vec', { vec: p.ys }),
        D('Pm', 'mat', { mat: p.P }),
        D('px', 'vec', { zeros: 'm' }), D('py', 'vec', { zeros: 'n' }),
        FOR('i', 0, 'm', [FOR('j', 0, 'n', [S('px[i]', 'px[i] + Pm[i, j]'), S('py[j]', 'py[j] + Pm[i, j]')])]),
        D('EX', 'num', '0'), D('EY', 'num', '0'), D('EX2', 'num', '0'), D('EY2', 'num', '0'), D('EXY', 'num', '0'),
        FOR('i', 0, 'm', [S('EX', 'EX + x[i] * px[i]'), S('EX2', 'EX2 + x[i] * x[i] * px[i]')]),
        FOR('j', 0, 'n', [S('EY', 'EY + y[j] * py[j]'), S('EY2', 'EY2 + y[j] * y[j] * py[j]')]),
        FOR('i', 0, 'm', [FOR('j', 0, 'n', [S('EXY', 'EXY + x[i] * y[j] * Pm[i, j]')])]),
        D('cov', 'num', 'EXY - EX * EY'),
        D('vx', 'num', 'EX2 - EX * EX'), D('vy', 'num', 'EY2 - EY * EY'),
        D('indep', 'bool', 'true'),
        FOR('i', 0, 'm', [FOR('j', 0, 'n', [IF('abs(Pm[i, j] - px[i] * py[j]) > 1e-12', [S('indep', 'false')])])]),
        P('E(X) = ', num('EX', 6), ', E(Y) = ', num('EY', 6), ', E(XY) = ', num('EXY', 6)),
        P('Cov(X, Y) = ', num('cov', 6)),
        IF('vx > 0 and vy > 0', [P('rho = ', num('cov / sqrt(vx * vy)', 6))]),
        IF('indep', [P('X and Y are independent.')], [P('X and Y are not independent.')]),
      ],
    }),
  },

  'confidence-interval': {
    name: 'Confidence intervals',
    clean: (raw) => {
      const mode = choice(raw.mode, ['z', 't', 'proportion']);
      const N = Math.round(cn(raw.n, 'n'));
      if (!(N >= 2)) throw new ExportError('n must be at least 2.');
      const C0 = cn(opt(raw.level, 95), 'the confidence level');
      if (!(C0 > 0 && C0 < 100)) throw new ExportError('The confidence level is a percentage between 0 and 100.');
      const alpha = 1 - C0 / 100;
      const out = { mode, N, C: C0, crit: mode === 't' ? tCritical(N - 1, alpha) : normalInverse(1 - alpha / 2) };
      if (mode === 'proportion') {
        out.x = cn(raw.x, 'the number of successes');
        if (!(out.x >= 0 && out.x <= N)) throw new ExportError('The number of successes must be between 0 and n.');
      } else {
        out.xbar = cn(raw.xbar, 'x̄');
        out.s = pos(cn(raw.sd, 'the standard deviation'), 'the standard deviation');
      }
      return out;
    },
    program: (p) => ({
      title: `${p.C}% confidence interval for ${p.mode === 'proportion' ? 'a proportion' : 'a mean'}`,
      about: [
        p.mode === 'proportion' ? 'p-hat +/- z sqrt(p-hat (1 - p-hat) / n)' : `x-bar +/- ${p.mode === 't' ? 't' : 'z'} * s / sqrt(n)`,
        `${p.mode === 't' ? `t with ${p.N - 1} degrees of freedom` : 'z'} = ${+p.crit.toFixed(4)} is from ${p.mode === 't' ? 't' : 'normal'} tables`,
      ],
      body: [
        D('n', 'num', String(p.N)),
        D('crit', 'num', lit(p.crit)),
        ...(p.mode === 'proportion'
          ? [D('centre', 'num', `${lit(p.x)} / n`), D('se', 'num', 'sqrt(centre * (1 - centre) / n)')]
          : [D('centre', 'num', lit(p.xbar)), D('se', 'num', `${lit(p.s)} / sqrt(n)`)]),
        D('margin', 'num', 'crit * se'),
        P('Standard error = ', num('se', 6), ', margin = ', num('margin', 4)),
        P('Interval: (', num('centre - margin', 4), ', ', num('centre + margin', 4), ')'),
      ],
    }),
  },

  'non-parametric-tests': {
    name: 'Non-parametric tests',
    clean: (raw) => {
      const test = choice(raw.test, ['sign', 'mann']);
      const alpha = n(opt(raw.alpha, 0.05), 'α');
      if (!(alpha > 0 && alpha < 0.5)) throw new ExportError('α should be between 0 and 0.5.');
      const x = list(raw.x, 'sample 1', 1);
      if (test === 'sign') {
        const paired = String(raw.y ?? '').trim() !== '';
        const y = paired ? list(raw.y, 'sample 2', 1) : null;
        if (paired && y.length !== x.length) throw new ExportError('Paired data need the same number of values in both samples.');
        return { test, alpha, x, y, m0: paired ? 0 : n(opt(raw.m0, 0), 'the median m0') };
      }
      const y = list(raw.y, 'sample 2', 2);
      if (x.length < 2) throw new ExportError('Each sample needs at least 2 values.');
      return { test, alpha, x, y };
    },
    program: (p) => {
      if (p.test === 'sign') {
        return {
          title: p.y ? 'Sign test (paired samples)' : 'Sign test for the median',
          about: ['Count + and - signs (zeros dropped); p = 2 P(X <= smaller count) with X binomial(n, 1/2)'],
          body: [
            D('k', 'int', String(p.x.length)),
            D('x', 'vec', { vec: p.x }),
            ...(p.y ? [D('y', 'vec', { vec: p.y })] : []),
            D('plus', 'num', '0'), D('minus', 'num', '0'),
            FOR('i', 0, 'k', [
              D('d', 'num', p.y ? 'x[i] - y[i]' : `x[i] - (${lit(p.m0)})`),
              IF('d > 0', [S('plus', 'plus + 1')]), IF('d < 0', [S('minus', 'minus + 1')]),
            ]),
            D('n', 'num', 'plus + minus'),
            D('small', 'num', 'min(plus, minus)'),
            D('tail', 'num', '0'),
            D('comb', 'num', '1'),
            FOR('i', 0, 'int(small) + 1', [S('tail', 'tail + comb * pow(0.5, n)'), S('comb', 'comb * (n - i) / (i + 1)')]),
            D('pval', 'num', 'min(1, 2 * tail)'),
            P('+ signs: ', num('plus', 0), ', - signs: ', num('minus', 0)),
            P('p-value = ', num('pval', 4)),
            IF(`pval < ${lit(p.alpha)}`, [P('Reject H0')], [P('Do not reject H0')]),
          ],
        };
      }
      return {
        title: 'Mann-Whitney U test',
        about: ['Rank both samples together (ties share the mean rank); U = R - n(n + 1)/2 for each sample, the smaller is U', 'Normal approximation with tie and continuity corrections'],
        body: [
          D('n1', 'num', String(p.x.length)), D('n2', 'num', String(p.y.length)),
          D('a', 'vec', { vec: [...p.x, ...p.y] }),
          D('N', 'int', String(p.x.length + p.y.length)),
          D('R1', 'num', '0'), D('R2', 'num', '0'), D('ties', 'num', '0'),
          FOR('i', 0, 'N', [
            D('below', 'num', '0'), D('same', 'num', '0'),
            FOR('j', 0, 'N', [IF('a[j] < a[i]', [S('below', 'below + 1')]), IF('a[j] == a[i]', [S('same', 'same + 1')])]),
            D('rank', 'num', 'below + (same + 1) / 2'),
            IF('i < n1', [S('R1', 'R1 + rank')], [S('R2', 'R2 + rank')]),
            C('Each value of a tie group of size t adds (t^2 - 1), so the group adds t^3 - t'),
            S('ties', 'ties + same * same - 1'),
          ]),
          D('U1', 'num', 'R1 - n1 * (n1 + 1) / 2'),
          D('U2', 'num', 'R2 - n2 * (n2 + 1) / 2'),
          D('U', 'num', 'min(U1, U2)'),
          D('sigma', 'num', 'sqrt(n1 * n2 / 12 * (N + 1 - ties / (N * (N - 1))))'),
          D('z', 'num', '(U - n1 * n2 / 2 + 0.5) / sigma'),
          D('cdf', 'num', '0'),
          normalCdf('cdf', 'z'),
          D('pval', 'num', 'min(1, 2 * cdf)'),
          P('R1 = ', num('R1', 1), ', R2 = ', num('R2', 1), ', U = ', num('U', 1)),
          P('z = ', num('z', 4), ', p-value = ', num('pval', 4)),
          IF(`pval < ${lit(p.alpha)}`, [P('Reject H0')], [P('Do not reject H0')]),
        ],
      };
    },
  },

  'control-charts': {
    name: 'Control charts',
    clean: (raw) => {
      const chart = choice(raw.chart, ['xbar', 'p', 'c']);
      if (chart === 'xbar') {
        const S0 = table(String(raw.data ?? ''), 'the subgroups', { minRows: 2 });
        if (S0[0].length < 2 || S0[0].length > 10) throw new ExportError('Each subgroup (row) needs 2 to 10 measurements.');
        return { chart, S: S0 };
      }
      const v = list(raw.data, chart === 'p' ? 'the numbers of defectives' : 'the numbers of defects', 2);
      return { chart, v, n: chart === 'p' ? pos(raw.n, 'the sample size n') : null };
    },
    program: (p) => {
      const outside = (vals, count, u, l) => FOR('i', 0, count, [IF(`${vals}[i] > ${u} + 1e-12 or ${vals}[i] < ${l} - 1e-12`, [P('  Sample ', int('i + 1'), ' is out of control: ', num(`${vals}[i]`, 4))])]);
      if (p.chart === 'xbar') {
        const size = p.S[0].length;
        const A2 = { 2: 1.88, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308 }[size];
        const D3 = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223 }[size];
        const D4 = { 2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777 }[size];
        return {
          title: 'X-bar and R control charts',
          about: [`Subgroups of ${size}: A2 = ${A2}, D3 = ${D3}, D4 = ${D4} (from control chart tables)`, 'X-bar chart: X-double-bar +/- A2 R-bar; R chart: D3 R-bar to D4 R-bar'],
          body: [
            D('k', 'int', String(p.S.length)), D('m', 'int', String(size)),
            D('S', 'mat', { mat: p.S }),
            D('xb', 'vec', { zeros: 'k' }), D('R', 'vec', { zeros: 'k' }),
            D('X', 'num', '0'), D('Rb', 'num', '0'),
            FOR('i', 0, 'k', [
              D('lo', 'num', 'S[i, 0]'), D('hi', 'num', 'S[i, 0]'), D('s', 'num', '0'),
              FOR('j', 0, 'm', [S('s', 's + S[i, j]'), S('lo', 'min(lo, S[i, j])'), S('hi', 'max(hi, S[i, j])')]),
              S('xb[i]', 's / m'), S('R[i]', 'hi - lo'),
              S('X', 'X + xb[i] / k'), S('Rb', 'Rb + R[i] / k'),
            ]),
            D('xu', 'num', `X + ${A2} * Rb`), D('xl', 'num', `X - ${A2} * Rb`),
            D('ru', 'num', `${D4} * Rb`), D('rl', 'num', `${D3} * Rb`),
            P('X-bar chart: CL = ', num('X', 4), ', UCL = ', num('xu', 4), ', LCL = ', num('xl', 4)),
            outside('xb', 'k', 'xu', 'xl'),
            P('R chart: CL = ', num('Rb', 4), ', UCL = ', num('ru', 4), ', LCL = ', num('rl', 4)),
            outside('R', 'k', 'ru', 'rl'),
          ],
        };
      }
      if (p.chart === 'p') {
        return {
          title: 'p chart (fraction defective)',
          about: ['p-bar +/- 3 sqrt(p-bar (1 - p-bar) / n), the lower limit not below 0'],
          body: [
            D('k', 'int', String(p.v.length)),
            D('n', 'num', lit(p.n)),
            D('d', 'vec', { vec: p.v }),
            D('ps', 'vec', { zeros: 'k' }),
            D('pb', 'num', '0'),
            FOR('i', 0, 'k', [S('ps[i]', 'd[i] / n'), S('pb', 'pb + d[i] / (n * k)')]),
            D('sd', 'num', 'sqrt(pb * (1 - pb) / n)'),
            D('u', 'num', 'pb + 3 * sd'), D('l', 'num', 'max(0, pb - 3 * sd)'),
            P('CL = ', num('pb', 4), ', UCL = ', num('u', 4), ', LCL = ', num('l', 4)),
            outside('ps', 'k', 'u', 'l'),
          ],
        };
      }
      return {
        title: 'c chart (defects per unit)',
        about: ['c-bar +/- 3 sqrt(c-bar), the lower limit not below 0'],
        body: [
          D('k', 'int', String(p.v.length)),
          D('c', 'vec', { vec: p.v }),
          D('cb', 'num', '0'),
          FOR('i', 0, 'k', [S('cb', 'cb + c[i] / k')]),
          D('u', 'num', 'cb + 3 * sqrt(cb)'), D('l', 'num', 'max(0, cb - 3 * sqrt(cb))'),
          P('CL = ', num('cb', 4), ', UCL = ', num('u', 4), ', LCL = ', num('l', 4)),
          outside('c', 'k', 'u', 'l'),
        ],
      };
    },
  },

  'markov-chain': {
    name: 'Markov chains',
    clean: (raw) => {
      const P0 = table(String(raw.P ?? ''), 'P', { square: true, minRows: 1 });
      if (P0.length > 8) throw new ExportError('Use up to 8 states.');
      if (P0.some((r) => Math.abs(r.reduce((s, v) => s + v, 0) - 1) > 1e-9 || r.some((v) => v < -1e-12 || v > 1 + 1e-12))) throw new ExportError('Each row of P must hold probabilities that add up to 1.');
      const steps = whole(opt(raw.n, 2), 'n', 1, 50);
      const start = String(raw.start ?? '').trim() ? list(raw.start, 'the starting distribution', P0.length) : null;
      if (start && start.length !== P0.length) throw new ExportError(`The starting distribution needs ${P0.length} numbers.`);
      return { P: P0, steps, start };
    },
    program: (p) => ({
      title: 'Markov chain: n-step probabilities and the stationary distribution',
      about: ['P^n is P multiplied by itself n times; the distribution after n steps is p0 P^n', 'The stationary pi solves pi P = pi with the entries adding to 1'],
      body: [
        D('k', 'int', String(p.P.length)),
        D('P', 'mat', { mat: p.P }),
        ...copyMatrix('P', 'Pn', 'k', 'k'),
        D('T', 'mat', { zeros2: ['k', 'k'] }),
        FOR('step', 1, String(p.steps), [
          FOR('i', 0, 'k', [FOR('j', 0, 'k', [D('s', 'num', '0'), FOR('t', 0, 'k', [S('s', 's + Pn[i, t] * P[t, j]')]), S('T[i, j]', 's')])]),
          FOR('i', 0, 'k', [FOR('j', 0, 'k', [S('Pn[i, j]', 'T[i, j]')])]),
        ]),
        P(`P^${p.steps} =`),
        ...printMatrix('Pn', 'k', p.P.length, 'P', 6),
        ...(p.start ? [
          D('p0', 'vec', { vec: p.start }),
          FOR('j', 0, 'k', [D('s', 'num', '0'), FOR('i', 0, 'k', [S('s', 's + p0[i] * Pn[i, j]')]), P(`After ${p.steps} steps, state `, int('j + 1'), ': ', num('s', 6))]),
        ] : []),
        C('Stationary distribution: (P^T - I) pi = 0 with the last equation replaced by sum of pi = 1'),
        D('A', 'mat', { zeros2: ['k', 'k'] }),
        D('rhs', 'vec', { zeros: 'k' }),
        FOR('i', 0, 'k', [FOR('j', 0, 'k', [S('A[i, j]', 'P[j, i]')]), S('A[i, i]', 'A[i, i] - 1')]),
        FOR('j', 0, 'k', [S('A[k - 1, j]', '1')]),
        S('rhs[k - 1]', '1'),
        ...gaussSolve('A', 'rhs', 'pis', 'k'),
        ...printVector('pis', 'k', 'pi', 6),
      ],
    }),
  },
};
