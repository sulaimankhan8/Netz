// The "first step in full" working for the ODE calculators that use OdeCalculator (RK2, Milne, Adams–Bashforth–Moulton).
// Each function takes the engine's answer and the typed values and returns StepList steps.
import { substituteTexVars } from '@/app/utils/evaluateMath';

const r6 = (v) => Number(Number(v).toFixed(6));
const br = (v) => (Number(v) < 0 ? `(${r6(v)})` : `${r6(v)}`);
// "f(0.1, 1.1) = 0.1 + 1.1 = 1.2"
const fAt = (f, x, y, value) => {
  const sub = substituteTexVars(f, { x, y });
  return `f(${r6(x)}, ${r6(y)}) = ${sub && sub !== String(r6(value)) ? `${sub} = ` : ''}${r6(value)}`;
};

export function rk2Working(answer, v) {
  const r = answer.rows?.[0];
  if (!r) return [];
  const h = r6(answer.h ?? v.h);
  const heun = (answer.variant ?? v.variant) !== 'midpoint';
  const x1 = r6(r.x + h);
  if (heun) {
    const ys = r.y + h * r.k1;
    return [
      { title: "The formula (Heun's method)", formula: 'k_1 = f(x_n, y_n), \\quad k_2 = f(x_n + h,\\ y_n + hk_1), \\quad y_{n+1} = y_n + \\tfrac{h}{2}(k_1 + k_2)', lines: [] },
      { title: 'Step 1: slope at the start', lines: [`k_1 = ${fAt(v.f, r.x, r.y, r.k1)}`] },
      { title: 'Step 1: slope at the predicted end', text: 'Take an Euler step to guess the end point, then work out the slope there.', lines: [`y_0 + hk_1 = ${r6(r.y)} + ${h}(${br(r.k1)}) = ${r6(ys)}`, `k_2 = ${fAt(v.f, x1, ys, r.k2)}`] },
      { title: 'Step 1: average the two slopes', lines: [`y_1 = ${r6(r.y)} + \\frac{${h}}{2}(${br(r.k1)} + ${br(r.k2)}) = ${r6(r.yNext)}`] },
      { title: 'The remaining steps', text: 'Repeat from the new point; every step is in the table below.', lines: [] },
    ];
  }
  const xm = r6(r.x + h / 2), ym = r.y + (h / 2) * r.k1;
  return [
    { title: 'The formula (midpoint method)', formula: 'k_1 = f(x_n, y_n), \\quad k_2 = f(x_n + \\tfrac{h}{2},\\ y_n + \\tfrac{h}{2}k_1), \\quad y_{n+1} = y_n + hk_2', lines: [] },
    { title: 'Step 1: slope at the start', lines: [`k_1 = ${fAt(v.f, r.x, r.y, r.k1)}`] },
    { title: 'Step 1: slope at the middle', text: 'Go half a step along k₁ and work out the slope there.', lines: [`y_0 + \\tfrac{h}{2}k_1 = ${r6(r.y)} + ${r6(h / 2)}(${br(r.k1)}) = ${r6(ym)}`, `k_2 = ${fAt(v.f, xm, ym, r.k2)}`] },
    { title: 'Step 1: step with the middle slope', lines: [`y_1 = ${r6(r.y)} + ${h}(${br(r.k2)}) = ${r6(r.yNext)}`] },
    { title: 'The remaining steps', text: 'Repeat from the new point; every step is in the table below.', lines: [] },
  ];
}

// Shared by Milne and Adams: the RK4 starting values and the slopes f₀ … f₃
function startSteps(answer, v) {
  const rows = answer.rows || [];
  if (rows.length < 5) return null;
  const s = answer.startRows?.[0];
  const steps = [];
  if (s) {
    steps.push({
      title: 'Starting values by RK4 (first one in full)', text: 'A multistep method needs four known points, so y₁, y₂, y₃ come from RK4.',
      lines: [
        `k_1 = ${r6(s.k1)}, \\quad k_2 = ${r6(s.k2)}, \\quad k_3 = ${r6(s.k3)}, \\quad k_4 = ${r6(s.k4)}`,
        `y_1 = ${r6(s.y)} + \\tfrac16(${br(s.k1)} + 2(${r6(s.k2)}) + 2(${r6(s.k3)}) + ${br(s.k4)}) = ${r6(s.yNext)}`,
        `y_2 = ${r6(rows[2].y)}, \\qquad y_3 = ${r6(rows[3].y)}`,
      ],
    });
  }
  steps.push({ title: 'The slopes at the four known points', lines: rows.slice(0, 4).map((r, i) => `f_${i} = ${fAt(v.f, r.x, r.y, r.f)}`) });
  return steps;
}

export function milneWorking(answer, v) {
  const steps = startSteps(answer, v);
  if (!steps) return [];
  const [r0, , r2, , r4] = answer.rows;
  const [f1, f2, f3] = [answer.rows[1].f, answer.rows[2].f, answer.rows[3].f];
  const h = r6(answer.h ?? v.h);
  return [
    { title: "The formulas (Milne's method)", formula: 'y_4^{P} = y_0 + \\tfrac{4h}{3}(2f_1 - f_2 + 2f_3), \\qquad y_4^{C} = y_2 + \\tfrac{h}{3}(f_2 + 4f_3 + f_4)', lines: [] },
    ...steps,
    { title: 'Predict y₄', lines: [`y_4^{P} = ${r6(r0.y)} + \\frac{4(${h})}{3}\\big(2(${r6(f1)}) - ${br(f2)} + 2(${r6(f3)})\\big) = ${r6(r4.yp)}`] },
    { title: 'Slope at the prediction', lines: [`f_4 = ${fAt(v.f, r4.x, r4.yp, r4.fp)}`] },
    { title: 'Correct y₄', text: r4.passes > 1 ? `The corrector was repeated ${r4.passes} times, each time with the latest f₄, until it settled.` : undefined, lines: [`y_4^{C} = ${r6(r2.y)} + \\frac{${h}}{3}\\big(${br(f2)} + 4(${r6(f3)}) + ${br(r4.fp)}\\big) \\;\\to\\; ${r6(r4.y)}`] },
    { title: 'The remaining steps', text: 'Shift the four points along by one and repeat; every step is in the table below.', lines: [] },
  ];
}

export function adamsWorking(answer, v) {
  const steps = startSteps(answer, v);
  if (!steps) return [];
  const [, , , r3, r4] = answer.rows;
  const [f0, f1, f2, f3] = answer.rows.slice(0, 4).map((r) => r.f);
  const h = r6(answer.h ?? v.h);
  return [
    { title: 'The formulas (Adams–Bashforth–Moulton)', formula: 'y_4^{P} = y_3 + \\tfrac{h}{24}(55f_3 - 59f_2 + 37f_1 - 9f_0), \\qquad y_4^{C} = y_3 + \\tfrac{h}{24}(9f_4 + 19f_3 - 5f_2 + f_1)', lines: [] },
    ...steps,
    { title: 'Predict y₄ (Adams–Bashforth)', lines: [`y_4^{P} = ${r6(r3.y)} + \\frac{${h}}{24}\\big(55(${r6(f3)}) - 59(${r6(f2)}) + 37(${r6(f1)}) - 9(${r6(f0)})\\big) = ${r6(r4.yp)}`] },
    { title: 'Slope at the prediction', lines: [`f_4 = ${fAt(v.f, r4.x, r4.yp, r4.fp)}`] },
    { title: 'Correct y₄ (Adams–Moulton)', text: r4.passes > 1 ? `The corrector was repeated ${r4.passes} times, each time with the latest f₄, until it settled.` : undefined, lines: [`y_4^{C} = ${r6(r3.y)} + \\frac{${h}}{24}\\big(9(${r6(r4.fp)}) + 19(${r6(f3)}) - 5(${r6(f2)}) + ${br(f1)}\\big) \\;\\to\\; ${r6(r4.y)}`] },
    { title: 'The remaining steps', text: 'Shift the four points along by one and repeat; every step is in the table below.', lines: [] },
  ];
}
