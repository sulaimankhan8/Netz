/**
 * NPV, IRR and payback: the maths for /npv-irr-calculator (catalog 10F).
 *   NPV(r) = Σ CFₜ/(1 + r)ᵗ   (t = 0 is the initial outlay, usually negative)
 *   IRR: the r with NPV(r) = 0, found by Newton–Raphson: r ← r − NPV(r)/NPV′(r)  ("IRR is Newton–Raphson on NPV")
 *   payback: when the running total of cash flows (or of discounted cash flows) turns non-negative.
 */
import { EngineError } from '../numeric/steps';
import { formatMoney } from '../finance/money';

const r4 = (v) => Number(v.toFixed(4));
const pct = (v) => `${Number((v * 100).toFixed(4))}%`;

export function solve({ flows, rate }) {
  const cf = String(flows ?? '').split(/[,;\s]+/).filter(Boolean).map((s) => Number(s.replace(/[₹$,]/g, '')));
  if (cf.length < 2 || cf.some((v) => !Number.isFinite(v))) throw new EngineError('Give at least two cash flows, starting with year 0 (e.g. -1000, 300, 400, 500).');
  if (cf.length > 41) throw new EngineError('Use at most 40 years of cash flows.');
  const r = Number(String(rate).replace('%', '')) / 100;
  if (!Number.isFinite(r) || r <= -1) throw new EngineError('Give the discount rate as a percentage, e.g. 10.');
  const npv = (x) => cf.reduce((s, c, t) => s + c / (1 + x) ** t, 0);
  const dnpv = (x) => cf.reduce((s, c, t) => s - (t * c) / (1 + x) ** (t + 1), 0);
  const rows = [];
  let cum = 0, dcum = 0, payback = null, dpayback = null;
  cf.forEach((c, t) => {
    const df = 1 / (1 + r) ** t, pv = c * df;
    const prev = cum, dprev = dcum;
    cum += c; dcum += pv;
    if (payback === null && t > 0 && prev < 0 && cum >= 0) payback = t - 1 + -prev / c;
    if (dpayback === null && t > 0 && dprev < 0 && dcum >= 0) dpayback = t - 1 + -dprev / pv;
    rows.push({ t, cf: formatMoney(c), df: r4(df), pv: formatMoney(pv), cum: formatMoney(cum), dcum: formatMoney(dcum) });
  });
  const value = npv(r);
  // IRR by Newton–Raphson from 10% (needs a sign change in the flows)
  const iters = [];
  let irr = null;
  if (cf.some((c) => c < 0) && cf.some((c) => c > 0)) {
    let x = 0.1;
    for (let k = 0; k < 50; k++) {
      const f = npv(x), d = dnpv(x);
      iters.push({ k, r: pct(x), npv: formatMoney(f) });
      if (Math.abs(f) < 1e-7) { irr = x; break; }
      if (!Number.isFinite(d) || d === 0) break;
      const nx = x - f / d;
      if (!(nx > -0.99) || !Number.isFinite(nx)) break;
      x = nx;
    }
  }
  const steps = [
    { title: 'Net present value', formula: 'NPV = \\sum_{t=0}^{n}\\frac{CF_t}{(1 + r)^t}', depth: 0, lines: [`NPV = ${cf.map((c, t) => (t === 0 ? `${c}` : `\\frac{${c}}{(${r4(1 + r)})^{${t}}}`)).slice(0, 8).join(' + ').replace(/\+ -/g, '- ')}${cf.length > 8 ? ' + \\cdots' : ''} = ${r4(value)}`] },
    { title: 'IRR by Newton–Raphson', formula: "r_{k+1} = r_k - \\frac{NPV(r_k)}{NPV'(r_k)}", depth: 0, lines: irr === null ? ['\\text{No IRR found (the cash flows need a sign change, and Newton\'s method must settle).}'] : [...iters.slice(0, 8).map((it) => `r_{${it.k}} = ${it.r.replace('%', '\\%')}, \\ NPV = ${it.npv.replace(/₹/g, '')}`), `IRR = ${pct(irr).replace('%', '\\%')}`] },
  ];
  const notes = [value >= 0 ? `NPV ≥ 0 at ${pct(r)}: accept the project (it earns at least the required rate).` : `NPV < 0 at ${pct(r)}: reject the project.`];
  if (irr !== null) notes.push(`The IRR (${pct(irr)}) is the rate where NPV = 0; the project is worth it when IRR > the required rate.`);
  return {
    npv: formatMoney(value), npvValue: value, irr: irr === null ? null : pct(irr), payback: payback === null ? null : r4(payback), dpayback: dpayback === null ? null : r4(dpayback),
    rows, columns: [{ key: 't', label: 'Year', bold: true }, { key: 'cf', label: 'Cash flow' }, { key: 'df', label: 'Discount factor' }, { key: 'pv', label: 'Present value', highlight: true }, { key: 'cum', label: 'Running total' }, { key: 'dcum', label: 'Discounted running total' }],
    steps, notes, verified: true,
  };
}
