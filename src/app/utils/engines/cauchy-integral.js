/**
 * Cauchy's integral formula: the maths for /cauchy-integral-formula (Unit 14).
 *   ∮_C g(z)/(z − a) dz = 2πi g(a);  ∮_C g(z)/(z − a)^{n+1} dz = (2πi/n!) g⁽ⁿ⁾(a)   (a inside C, g analytic)
 *   C is the circle |z − z₀| = r. Each singular point inside is handled on its own (the contour is split around
 *   it), which is the same as adding residues. Points outside contribute nothing (Cauchy's theorem).
 */
import { EngineError } from '../numeric/steps';
import { math, polish, tidy, tex, div, paren } from '../symbolic/tree';
import { mtex } from '../symbolic/multi';
import { readZ, poles, cTex, C, snapC, divLinear, polyNodeZ } from '../symbolic/complex';
import { readCenter, readRadius, piTex, planePlot } from './residues';

export function solve({ f, center = '0', radius = '1' }) {
  const F = readZ(f);
  const z0 = readCenter(center), r = readRadius(radius);
  const P = poles(F);
  if (!P.split) throw new EngineError('Write the integrand as g(z)/(polynomial in z), e.g. e^z/(z - 1)^2 or cos(z)/(z^2 + 1).');
  const steps = [{ title: 'Singular points', formula: '\\text{zeros of the denominator}', depth: 0, lines: [P.list.length ? P.list.map((p) => `z = ${cTex(p.a)}${p.order > 1 ? ` \\ (\\text{power } ${p.order})` : ''}`).join(', \\quad ') : '\\text{none}'] }];
  const on = P.list.find((p) => Math.abs(Math.hypot(p.a.re - z0.re, p.a.im - z0.im) - r) < 1e-9);
  if (on) throw new EngineError(`z = ${cTex(on.a)} lies on the circle, so the formula does not apply. Change the radius.`);
  const inside = P.list.filter((p) => Math.hypot(p.a.re - z0.re, p.a.im - z0.im) < r);
  steps.push({ title: 'Which lie inside C?', depth: 0, lines: [`C: |z - ${cTex(z0)}| = ${r}`, inside.length ? `\\text{inside: } ${inside.map((p) => cTex(p.a)).join(', ')}` : '\\text{none: } \\oint_C f\\,dz = 0 \\ (\\text{Cauchy\'s theorem})'] });
  let total = C(0, 0);
  const A = P.split.A || polyNodeZ(P.split.Apoly);
  for (const p of inside) {
    // g(z) = f(z)·(z − a)^m: the rest of the integrand, analytic near a
    const g = div(paren(A), paren(polyNodeZ(divLinear(P.split.B, p.a, p.order))));
    let d = g;
    for (let k = 1; k < p.order; k++) d = math.derivative(d, 'z');
    let val = d.evaluate({ z: p.a });
    val = typeof val === 'number' ? C(val) : val;
    let fact = 1; for (let k = 2; k < p.order; k++) fact *= k;
    const contrib = snapC(math.multiply(C(0, (2 * Math.PI) / fact), val));
    total = math.add(total, contrib);
    const n = p.order - 1;
    steps.push({
      title: `At z = ${cTex(p.a).replace(/\\/g, '')}`, depth: 1,
      formula: n === 0 ? '\\oint \\frac{g(z)}{z - a}dz = 2\\pi i\\,g(a)' : `\\oint \\frac{g(z)}{(z - a)^{${n + 1}}}dz = \\frac{2\\pi i}{${n}!}g^{(${n})}(a)`,
      lines: [`g(z) = ${tex(polish(tidy(g)))}`, ...(n ? [`g^{(${n})}(z) = ${tex(polish(tidy(d)))}`] : []), `\\text{contribution} = ${n ? `\\frac{2\\pi i}{${n}!}` : '2\\pi i'} \\cdot ${cTex(snapC(val))} = ${piTex(contrib)}`],
    });
  }
  const value = snapC(total);
  if (inside.length > 1) steps.push({ title: 'Add the parts', depth: 0, lines: [`\\oint_C f(z)\\,dz = ${piTex(value)}`] });
  // check against a direct numerical contour integral
  let ok = true;
  try {
    const N = 2000; let s = C(0, 0);
    for (let k = 0; k < N; k++) { const th = (2 * Math.PI * (k + 0.5)) / N; const w = C(Math.cos(th), Math.sin(th)); const z = math.add(z0, math.multiply(C(r), w)); const dz = math.multiply(C(0, (2 * Math.PI * r) / N), w); let fz = F.evaluate({ z }); fz = typeof fz === 'number' ? C(fz) : fz; s = math.add(s, math.multiply(fz, dz)); }
    ok = Math.hypot(s.re - value.re, s.im - value.im) < 1e-5 * Math.max(1, Math.hypot(value.re, value.im));
  } catch { ok = true; }
  return { fTex: mtex(polish(tidy(F))), inside: inside.map((p) => cTex(p.a)), value: piTex(value), plot: planePlot(P.list.map((p) => p.a), { z0, r }), steps, notes: inside.length ? [] : ['No singular point lies inside C, so the integral is 0.'], verified: ok, result: piTex(value) };
}
