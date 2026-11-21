'use client';
// The working for the Newton–Cotes integration calculators (trapezoidal, Simpson 1/3 and 3/8, Boole, Weddle),
// written the way it is done by hand: the step h, a table of every point with its weight, each group of y values
// added up term by term, the bracket, and the answer. Built only from the solved points, so it always matches the result.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const n6 = (v) => Number(Number(v).toFixed(6));

/** The weight of point i (of n intervals) for each rule, and the factor in front of the bracket. */
export const RULES = {
  trapezoidal: { name: 'Trapezoidal rule', factorTex: (h) => `\\frac{${h}}{2}`, factor: (h) => h / 2, formula: 'I = \\frac{h}{2}\\left[(y_0 + y_n) + 2(y_1 + y_2 + \\cdots + y_{n-1})\\right]', weight: (i, n) => (i === 0 || i === n ? 1 : 2) },
  simpson13: { name: "Simpson's 1/3 rule", factorTex: (h) => `\\frac{${h}}{3}`, factor: (h) => h / 3, formula: 'I = \\frac{h}{3}\\left[(y_0 + y_n) + 4(y_1 + y_3 + \\cdots) + 2(y_2 + y_4 + \\cdots)\\right]', weight: (i, n) => (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) },
  simpson38: { name: "Simpson's 3/8 rule", factorTex: (h) => `\\frac{3(${h})}{8}`, factor: (h) => (3 * h) / 8, formula: 'I = \\frac{3h}{8}\\left[(y_0 + y_n) + 3(y_1 + y_2 + y_4 + y_5 + \\cdots) + 2(y_3 + y_6 + \\cdots)\\right]', weight: (i, n) => (i === 0 || i === n ? 1 : i % 3 ? 3 : 2) },
  boole: { name: "Boole's rule", factorTex: (h) => `\\frac{2(${h})}{45}`, factor: (h) => (2 * h) / 45, formula: 'I = \\frac{2h}{45}\\left[7y_0 + 32y_1 + 12y_2 + 32y_3 + 14y_4 + 32y_5 + \\cdots + 7y_n\\right]', weight: (i, n) => (i === 0 || i === n ? 7 : i % 2 ? 32 : i % 4 === 2 ? 12 : 14) },
  weddle: { name: "Weddle's rule", factorTex: (h) => `\\frac{3(${h})}{10}`, factor: (h) => (3 * h) / 10, formula: 'I = \\frac{3h}{10}\\left[y_0 + 5y_1 + y_2 + 6y_3 + y_4 + 5y_5 + 2y_6 + 5y_7 + \\cdots + y_n\\right]', weight: (i, n) => (i === 0 || i === n ? 1 : [2, 5, 1, 6, 1, 5][i % 6]) },
};

function Box({ label, children }) {
  return (
    <div className="p-4 md:p-5 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2 text-black dark:text-white">
      <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">{label}</div>
      {children}
    </div>
  );
}

export default function RuleWorking({ rule, points, value }) {
  const R = RULES[rule];
  if (!R || !points || points.length < 2) return null;
  const n = points.length - 1;
  const a = points[0].x, b = points[n].x;
  const h = n6((b - a) / n);
  const rows = points.map((p, i) => ({ i, x: n6(p.x), y: n6(p.y), w: R.weight(i, n) }));
  // Group the y values by weight, in the order the weights first appear
  const groups = [];
  for (const r of rows) {
    let g = groups.find((q) => q.w === r.w);
    if (!g) groups.push((g = { w: r.w, items: [] }));
    g.items.push(r);
  }
  for (const g of groups) g.sum = g.items.reduce((s, r) => s + r.y, 0);
  const bracket = groups.reduce((s, g) => s + g.w * g.sum, 0);
  const shown = (items) => (items.length <= 8
    ? items.map((r) => `y_{${r.i}}`).join(' + ')
    : `${items.slice(0, 3).map((r) => `y_{${r.i}}`).join(' + ')} + \\cdots + y_{${items.at(-1).i}}`);
  const values = (items) => (items.length <= 8
    ? items.map((r) => (r.y < 0 ? `(${r.y})` : `${r.y}`)).join(' + ')
    : `${items.slice(0, 3).map((r) => r.y).join(' + ')} + \\cdots + ${items.at(-1).y}`);
  return (
    <div className="space-y-3">
      <Box label="1. The formula">
        <div className="overflow-x-auto text-center"><BlockMath math={R.formula} /></div>
      </Box>
      <Box label="2. The step size">
        <div className="overflow-x-auto text-center"><BlockMath math={`h = \\frac{b - a}{n} = \\frac{${n6(b)} - ${n6(a)}}{${n}} = ${h}`} /></div>
      </Box>
      <Box label="3. Every point with its weight">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm font-mono border-collapse">
            <thead><tr className="border-b border-black/30 dark:border-neutral-600"><th className="p-1.5">i</th><th className="p-1.5">xᵢ</th><th className="p-1.5">yᵢ = f(xᵢ)</th><th className="p-1.5">weight</th><th className="p-1.5">weight × yᵢ</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.i} className="border-b border-black/10 dark:border-neutral-700">
                  <td className="p-1.5 font-bold">{r.i}</td><td className="p-1.5">{r.x}</td><td className="p-1.5">{r.y}</td>
                  <td className="p-1.5 font-bold">{r.w}</td><td className="p-1.5">{n6(r.w * r.y)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <Box label="4. Add each group of y values">
        <div className="overflow-x-auto text-center">
          {groups.map((g) => (
            <BlockMath key={g.w} math={`\\text{weight } ${g.w}: \\ ${shown(g.items)} = ${values(g.items)} = ${n6(g.sum)}`} />
          ))}
        </div>
      </Box>
      <Box label="5. The bracket, then the answer">
        <div className="overflow-x-auto text-center">
          <BlockMath math={`\\text{bracket} = ${groups.map((g) => `${g.w}(${n6(g.sum)})`).join(' + ')} = ${n6(bracket)}`} />
          <BlockMath math={`I = ${R.factorTex(h)} \\times ${n6(bracket)} = ${n6(value ?? R.factor(h) * bracket)}`} />
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {R.name} gives <InlineMath math={`\\int_{${n6(a)}}^{${n6(b)}} f(x)\\,dx \\approx ${n6(value ?? R.factor(h) * bracket)}`} />.
        </p>
      </Box>
    </div>
  );
}
