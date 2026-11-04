/**
 * Arithmetic and geometric progressions: the maths for /arithmetic-geometric-progression.
 *   mode 'ap'       a, d, n → nth term and sum of n terms
 *   mode 'gp'       a, r, n → nth term, sum of n terms, sum to infinity when |r| < 1
 *   mode 'special'  n → Σk, Σk², Σk³
 *   mode 'detect'   a few terms → is it an AP, a GP or neither? Then its nth term formula
 */
import { EngineError, isZero } from '../numeric/steps';
import { requireNumber, parseNumber } from '../numeric/fraction';
import { n as num, q } from '../numeric/geometry';

const whole = (text, where, min = 1) => {
  const v = requireNumber(text, where);
  if (!Number.isInteger(v) || v < min) throw new EngineError(`${where} must be a whole number of at least ${min}.`);
  if (v > 1e6) throw new EngineError(`${where} must be 1,000,000 or less.`);
  return v;
};
const firstTerms = (f, count) => Array.from({ length: Math.min(count, 10) }, (_, i) => f(i + 1));
const done = (mode, result, lines, extra = {}) => ({ mode, result, lines, ...extra, steps: { headers: [], rows: [] }, notes: [], plot: null });

export function solve({ mode, a: ta, d: td, r: tr, n: tn, terms }) {
  switch (mode) {
    case 'ap': {
      const a = requireNumber(ta, 'First term a'), d = requireNumber(td, 'Common difference d'), n = whole(tn, 'Number of terms n');
      const an = a + (n - 1) * d;
      const sn = (n / 2) * (2 * a + (n - 1) * d);
      return done(mode, an, [
        `a_n = a + (n - 1)d = ${q(a)} + (${n} - 1)(${q(d)}) = ${q(an)}`,
        `S_n = \\frac{n}{2}\\left[2a + (n - 1)d\\right] = \\frac{${n}}{2}\\left[2(${q(a)}) + (${n - 1})(${q(d)})\\right] = ${q(sn)}`,
        `\\text{Check: } S_n = \\frac{n}{2}(a + a_n) = \\frac{${n}}{2}(${q(a)} + ${q(an)}) = ${q(sn)}`,
      ], { nth: an, sum: sn, list: firstTerms((k) => a + (k - 1) * d, n) });
    }
    case 'gp': {
      const a = requireNumber(ta, 'First term a'), r = requireNumber(tr, 'Common ratio r'), n = whole(tn, 'Number of terms n');
      if (isZero(a)) throw new EngineError('With a = 0 every term is 0. Use a non-zero first term.');
      if (isZero(r)) throw new EngineError('The common ratio can\'t be 0 in a GP.');
      const an = a * r ** (n - 1);
      const sn = isZero(r - 1) ? a * n : (a * (r ** n - 1)) / (r - 1);
      const lines = [
        `a_n = a r^{n - 1} = ${q(a)} \\times (${q(r)})^{${n - 1}} = ${q(an)}`,
        isZero(r - 1)
          ? `r = 1 \\Rightarrow S_n = na = ${n} \\times ${q(a)} = ${q(sn)}`
          : `S_n = \\frac{a(r^n - 1)}{r - 1} = \\frac{${q(a)}\\left((${q(r)})^{${n}} - 1\\right)}{${q(r)} - 1} = ${q(sn)}`,
      ];
      let sInf = null;
      if (Math.abs(r) < 1) {
        sInf = a / (1 - r);
        lines.push(`|r| < 1 \\Rightarrow S_\\infty = \\frac{a}{1 - r} = \\frac{${q(a)}}{1 - (${q(r)})} = ${q(sInf)}`);
      } else {
        lines.push(`|r| \\ge 1 \\Rightarrow \\text{the sum to infinity does not exist (the terms don't shrink to 0)}`);
      }
      return done(mode, an, lines, { nth: an, sum: sn, sInf, list: firstTerms((k) => a * r ** (k - 1), n) });
    }
    case 'special': {
      const n = whole(tn, 'n');
      const s1 = (n * (n + 1)) / 2, s2 = (n * (n + 1) * (2 * n + 1)) / 6, s3 = s1 * s1;
      return done(mode, s1, [
        `\\sum_{k=1}^{n} k = \\frac{n(n + 1)}{2} = \\frac{${n} \\times ${n + 1}}{2} = ${num(s1, 15)}`,
        `\\sum_{k=1}^{n} k^2 = \\frac{n(n + 1)(2n + 1)}{6} = \\frac{${n} \\times ${n + 1} \\times ${2 * n + 1}}{6} = ${num(s2, 15)}`,
        `\\sum_{k=1}^{n} k^3 = \\left[\\frac{n(n + 1)}{2}\\right]^2 = ${num(s1, 15)}^2 = ${num(s3, 15)}`,
      ], { s1, s2, s3 });
    }
    case 'detect': {
      const parts = String(terms ?? '').split(/[,;\s]+/).filter(Boolean);
      if (parts.length < 3) throw new EngineError('Enter at least 3 terms, separated by commas.');
      const t = parts.map((p, i) => {
        const v = parseNumber(p);
        if (!Number.isFinite(v)) throw new EngineError(`Term ${i + 1}, "${p}", is not a number.`);
        return v;
      });
      const diffs = t.slice(1).map((v, i) => v - t[i]);
      const isAP = diffs.every((x) => isZero(x - diffs[0], 1e-9));
      const ratios = t.every((v) => !isZero(v)) ? t.slice(1).map((v, i) => v / t[i]) : null;
      const isGP = ratios && ratios.every((x) => isZero(x - ratios[0], 1e-9));
      const lines = [`\\text{Differences: } ${diffs.map(q).join(',\\ ')}`];
      if (ratios) lines.push(`\\text{Ratios: } ${ratios.map(q).join(',\\ ')}`);
      if (isAP) {
        const a = t[0], d = diffs[0];
        lines.push(`\\text{Constant difference } d = ${q(d)} \\Rightarrow \\text{AP: } a_n = ${q(a)} + (n - 1)(${q(d)}) = ${q(d)}n ${a - d < 0 ? '-' : '+'} ${q(Math.abs(a - d))}`);
        return done(mode, 'AP', lines, { kind: 'AP', a, d, next: t.at(-1) + d });
      }
      if (isGP) {
        const a = t[0], r = ratios[0];
        lines.push(`\\text{Constant ratio } r = ${q(r)} \\Rightarrow \\text{GP: } a_n = ${q(a)} \\times (${q(r)})^{n - 1}`);
        return done(mode, 'GP', lines, { kind: 'GP', a, r, next: t.at(-1) * r });
      }
      lines.push('\\text{Neither the differences nor the ratios are constant: not an AP or a GP.}');
      return done(mode, 'neither', lines, { kind: 'neither' });
    }
    default:
      throw new EngineError('Choose what to work out.');
  }
}
