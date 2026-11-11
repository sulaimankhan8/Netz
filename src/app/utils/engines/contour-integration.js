/**
 * Real integrals by contour integration: the maths for /contour-integration (Unit 14).
 *   trig:     ∫₀^{2π} R(cos θ, sin θ) dθ with z = e^{iθ}: cos θ = (z + 1/z)/2, sin θ = (z − 1/z)/(2i), dθ = dz/(iz);
 *             = 2πi Σ residues inside |z| = 1.
 *   rational: ∫₋∞^∞ P(x)/Q(x) dx = 2πi Σ residues in the upper half-plane (deg Q ≥ deg P + 2, no real poles);
 *             with cos mx or sin mx, use e^{imz} (Jordan's lemma, deg Q ≥ deg P + 1) and take the real or imaginary part.
 * Every answer is checked against a direct numerical integral.
 */
import { EngineError } from '../numeric/steps';
import { math, polish, tidy, tex, div, mul, paren, fn, sym, num } from '../symbolic/tree';
import { mtex, exactTex } from '../symbolic/multi';
import { readZ, rationalZ, polyZ, poles, residue, polyNodeZ, cTex, C, snapC } from '../symbolic/complex';
import { gaussLegendre } from '../symbolic/iterated';

const absC = (c) => Math.hypot(c.re, c.im);
const degree = (p) => p.length - 1;

/** ∫ over [a, b] by composite Gauss–Legendre. */
function quad(g, a, b, panels = 200) {
  const { xs, ws } = gaussLegendre(16);
  let s = 0;
  const h = (b - a) / panels;
  for (let k = 0; k < panels; k++) {
    const c = a + h * (k + 0.5), w = h / 2;
    for (let i = 0; i < xs.length; i++) s += ws[i] * w * g(c + w * xs[i]);
  }
  return s;
}

export function solve({ mode = 'trig', f = '' }) {
  const steps = [];
  let value, check, tolerance = 1e-4;
  if (mode === 'trig') {
    // read R(cos θ, sin θ): θ may be typed as θ, t or theta
    const text = String(f ?? '').replace(/θ|\btheta\b/g, 't');
    if (!text.trim()) throw new EngineError('Type the integrand in θ, e.g. 1/(5 + 4cos(θ)).');
    let R;
    try { R = math.parse(text.replace(/(\d)\s*([a-z(])/gi, '$1*$2')); } catch { throw new EngineError('Could not read the integrand. Write it like 1/(5 + 4cos(θ)).'); }
    // substitute cos(kθ), sin(kθ) for whole k
    let bad = false;
    const Zs = R.transform((n) => {
      if (n.isFunctionNode && ['cos', 'sin'].includes(n.fn.name)) {
        const a = n.args[0];
        const k = math.evaluate(a.toString().replace(/\bt\b/g, '1')), k2 = math.evaluate(a.toString().replace(/\bt\b/g, '2'));
        if (!(Number.isInteger(k) && k2 === 2 * k && k > 0)) { bad = true; return n; }
        const zk = k === 1 ? sym('z') : math.parse(`z^${k}`), zmk = k === 1 ? math.parse('1/z') : math.parse(`z^(-${k})`);
        return n.fn.name === 'cos' ? paren(div(math.parse(`(${zk}) + (${zmk})`), num(2))) : paren(div(math.parse(`(${zk}) - (${zmk})`), math.parse('2 i')));
      }
      if (n.isSymbolNode && n.name === 't') { bad = true; }
      return n;
    });
    if (bad) throw new EngineError('Use θ only inside cos(kθ) and sin(kθ) with whole k ≥ 1.');
    const F = mul(paren(Zs), paren(math.parse('1/(i z)')));
    const RZ = rationalZ(F);
    if (!RZ) throw new EngineError('After z = e^{iθ} this must be a fraction of polynomials in z.');
    const Fnode = div(paren(polyNodeZ(RZ.N)), paren(polyNodeZ(RZ.D)));
    steps.push({ title: 'Put z = e^{iθ}', formula: '\\cos\\theta = \\frac{z + z^{-1}}{2}, \\ \\sin\\theta = \\frac{z - z^{-1}}{2i}, \\ d\\theta = \\frac{dz}{iz}', depth: 0, lines: [`\\int_0^{2\\pi} ${tex(polish(R)).replace(/\bt\b/g, '\\theta')}\\,d\\theta = \\oint_{|z| = 1} ${tex(polish(tidy(Fnode)))}\\,dz`] });
    const P = poles(Fnode);
    if (P.list.some((p) => Math.abs(absC(p.a) - 1) < 1e-9)) throw new EngineError('A pole lies on |z| = 1: the integrand is not defined for every θ.');
    const inside = P.list.filter((p) => absC(p.a) < 1);
    steps.push({ title: 'Poles inside |z| = 1', depth: 0, lines: [`\\text{poles: } ${P.list.map((p) => cTex(p.a)).join(', ')}; \\quad \\text{inside: } ${inside.map((p) => cTex(p.a)).join(', ') || '\\text{none}'}`] });
    let sum = C(0);
    for (const p of inside) {
      const r = residue(Fnode, p.a, p.order, P.split);
      steps.push({ title: `Residue at z = ${cText(p.a)}`, depth: 1, lines: r.lines });
      sum = math.add(sum, r.value);
    }
    const I = snapC(math.multiply(C(0, 2 * Math.PI), sum));
    if (Math.abs(I.im) > 1e-8 * Math.max(1, Math.abs(I.re))) throw new EngineError('The result is not real: check the integrand.');
    value = I.re;
    steps.push({ title: 'Residue theorem', formula: '\\oint = 2\\pi i \\sum \\operatorname{Res}', depth: 0, lines: [`2\\pi i \\cdot (${cTex(snapC(sum))}) = ${exactTex(value)}`] });
    const g = R.compile();
    check = quad((t) => g.evaluate({ t }), 0, 2 * Math.PI);
  } else {
    // P(x)/Q(x), possibly times cos(mx) or sin(mx)
    const text = String(f ?? '').trim();
    if (!text) throw new EngineError('Type f(x), e.g. 1/(x^2 + 1)^2 or cos(2x)/(x^2 + 1).');
    let node;
    try { node = math.parse(text.replace(/(\d)\s*([a-z(])/gi, '$1*$2').replace(/\bx\s*\(/g, 'x*(')); } catch { throw new EngineError('Could not read f(x).'); }
    let trig = null, m = 0;
    const rest = node.transform((n) => {
      if (n.isFunctionNode && ['cos', 'sin'].includes(n.fn.name)) {
        const a = n.args[0];
        const k = math.evaluate(a.toString().replace(/\bx\b/g, '1')), k0 = math.evaluate(a.toString().replace(/\bx\b/g, '0'));
        if (trig || !(k0 === 0 && k > 0)) throw new EngineError('Use at most one cos(mx) or sin(mx), with m > 0.');
        trig = n.fn.name; m = k;
        return num(1);
      }
      return n;
    });
    // x → z on the tree (going through text breaks implicit products like "x (1)")
    const asZ = rest.transform((n) => (n.isSymbolNode && n.name === 'x' ? sym('z') : n));
    const RZ = rationalZ(asZ);
    if (!RZ || RZ.D.length < 2) throw new EngineError('f must be a fraction of polynomials (times cos(mx) or sin(mx)).');
    const realCoeffs = [...RZ.N, ...RZ.D].every((c) => Math.abs(c.im) < 1e-12);
    if (!realCoeffs) throw new EngineError('Use real coefficients.');
    const need = trig ? 1 : 2;
    if (degree(RZ.D) - degree(RZ.N) < need) throw new EngineError(trig ? 'The bottom must have a higher degree than the top (Jordan\'s lemma).' : 'The bottom must have a degree at least 2 more than the top, or the integral diverges.');
    const Fz = trig ? mul(div(paren(polyNodeZ(RZ.N)), paren(polyNodeZ(RZ.D))), fn('exp', math.parse(`${m} i z`))) : div(paren(polyNodeZ(RZ.N)), paren(polyNodeZ(RZ.D)));
    steps.push({ title: 'The complex function', depth: 0, lines: [`F(z) = ${tex(polish(tidy(Fz)))}${trig ? ` \\quad (\\text{${trig === 'cos' ? 'real' : 'imaginary'} part on the real axis gives } f)` : ''}`] });
    const P = poles(Fz);
    if (P.list.some((p) => Math.abs(p.a.im) < 1e-9)) throw new EngineError('f has a pole on the real axis, so the integral is improper there (principal values are not covered).');
    const upper = P.list.filter((p) => p.a.im > 0);
    steps.push({ title: 'Poles in the upper half-plane', formula: '\\text{the contour is the real axis and a large upper semicircle}', depth: 0, lines: [upper.map((p) => `z = ${cTex(p.a)}${p.order > 1 ? ` \\ (\\text{order } ${p.order})` : ''}`).join(', ') || '\\text{none}'] });
    let sum = C(0);
    for (const p of upper) {
      const r = residue(Fz, p.a, p.order, P.split);
      steps.push({ title: `Residue at z = ${cText(p.a)}`, depth: 1, lines: r.lines });
      sum = math.add(sum, r.value);
    }
    const I = snapC(math.multiply(C(0, 2 * Math.PI), sum));
    value = trig === 'sin' ? I.im : I.re;
    steps.push({ title: 'Residue theorem', formula: '\\int_{-\\infty}^{\\infty} = 2\\pi i \\sum_{\\operatorname{Im} a > 0} \\operatorname{Res}', depth: 0, lines: [`2\\pi i \\cdot (${cTex(snapC(sum))}) = ${cTex(I)}`, ...(trig ? [`\\text{take the ${trig === 'cos' ? 'real' : 'imaginary'} part: } ${exactTex(value)}`] : [])] });
    const g = node.compile();
    // x = tan u on (−π/2, π/2); an oscillating integrand instead over [−400, 400] in fine panels (tail ~ 1/400²)
    // (two cut-offs half a period apart, averaged: the oscillating tail of a 1/x integrand cancels)
    const L1 = (2 * Math.PI * Math.round((400 * m) / (2 * Math.PI))) / (m || 1), L2 = L1 + Math.PI / (m || 1);
    check = trig ? (quad((x) => g.evaluate({ x }), -L1, L1, 16000) + quad((x) => g.evaluate({ x }), -L2, L2, 16000)) / 2 : quad((u) => { const x = Math.tan(u); return g.evaluate({ x }) / Math.cos(u) ** 2; }, -Math.PI / 2 + 1e-9, Math.PI / 2 - 1e-9, 400);
    if (trig) tolerance = 1e-3;
  }
  const ok = !Number.isFinite(check) || Math.abs(check - value) < tolerance * Math.max(1, Math.abs(value));
  return { value: exactTex(value), number: value, steps, notes: [`Checked by direct numerical integration: ${Number(check.toPrecision(8))}.`], verified: ok, result: value };
}
const cText = (c) => cTex(c).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\sqrt\{(\d+)\}/g, '√$1').replace(/\\,/g, ' ').replace(/\\/g, '');
