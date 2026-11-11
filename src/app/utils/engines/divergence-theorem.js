/**
 * Gauss's divergence theorem: the maths for /divergence-theorem (Unit 6).
 *   ∯_S F·n dS = ∭_V div F dV, S the closed surface of V with n pointing out.
 *   Solids: a box (six faces), a sphere, a cylinder (side, top and bottom). The volume side uses Cartesian,
 *   spherical or cylindrical coordinates; the surface side adds the flux through every face. Both are compared.
 */
import { EngineError } from '../numeric/steps';
import { math, num, sym, polish } from '../symbolic/tree';
import { mtex, exactTex, divergence } from '../symbolic/multi';
import { numNode } from '../symbolic/ode';
import { surface, surfaceIntegral, volumeRegion, volumeIntegral, comp, onlyLetters, XYZ, vecTex } from '../symbolic/vectorint';

/** The faces of a box, each a flat rectangle with its outward normal. */
function boxFaces(V) {
  const [[x0, x1], [y0, y1], [z0, z1]] = V.faces;
  const N = (s) => numNode(s);
  // r(u, v) with u inner, v outer; "swap" flips r_u × r_v to point out
  const face = (r, u, ulo, uhi, v, vlo, vhi, out, label) => ({ r, u, v, dims: [{ v: u, lo: N(ulo), hi: N(uhi) }, { v, lo: N(vlo), hi: N(vhi) }], label, out });
  return [
    face([N(x1), sym('y'), sym('z')], 'y', y0, y1, 'z', z0, z1, 1, `x = ${exactTex(x1)}`), face([N(x0), sym('y'), sym('z')], 'y', y0, y1, 'z', z0, z1, -1, `x = ${exactTex(x0)}`),
    face([sym('x'), N(y1), sym('z')], 'z', z0, z1, 'x', x0, x1, 1, `y = ${exactTex(y1)}`), face([sym('x'), N(y0), sym('z')], 'z', z0, z1, 'x', x0, x1, -1, `y = ${exactTex(y0)}`),
    face([sym('x'), sym('y'), N(z1)], 'x', x0, x1, 'y', y0, y1, 1, `z = ${exactTex(z1)}`), face([sym('x'), sym('y'), N(z0)], 'x', x0, x1, 'y', y0, y1, -1, `z = ${exactTex(z0)}`),
  ].map((f) => {
    // r_u × r_v for these orders is +i, +j, +k on the "high" faces; flip on the low ones
    return { ...f, swap: f.out < 0 };
  });
}

export function solve(input) {
  const F = [comp(input.P, 'P'), comp(input.Q, 'Q'), comp(input.R, 'R')];
  onlyLetters(F, XYZ, 'F');
  if (F.every((c) => c.isConstantNode && Number(c.value) === 0)) throw new EngineError('Type at least one component of F.');
  const kind = input.region || 'box';
  const V = volumeRegion(kind, input);
  const div = divergence(F, XYZ);
  const steps = [{ title: 'The theorem', formula: '\\oint\\!\\!\\oint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\iiint_V \\nabla\\cdot\\mathbf{F}\\,dV', depth: 0, lines: [`\\mathbf{F} = ${vecTex(F)}`, `V: ${V.tex}`] }];
  const Vi = volumeIntegral(div, V);
  steps.push({ title: 'Volume integral of div F', depth: 0, lines: [`\\nabla\\cdot\\mathbf{F} = ${mtex(polish(div))}`, ...Vi.lines, `\\iiint_V = ${Vi.tex}`] });
  // the surface side, face by face
  let faces;
  if (kind === 'box') faces = boxFaces(V);
  else if (kind === 'sphere') faces = [{ ...surface('sphere', { a: String(V.a) }), label: 'sphere' }];
  else faces = [{ ...surface('cylinder', { a: String(V.a), h: String(V.h) }), label: 'side' }, { ...surface('disc', { a: String(V.a), h: String(V.h) }), label: `top z = ${exactTex(V.h)}` }, { ...surface('disc', { a: String(V.a), h: '0', down: true }), label: 'bottom z = 0' }];
  let total = 0;
  const parts = [];
  const lines = [];
  for (const f of faces) {
    const r = surfaceIntegral(F, f, 'flux');
    total += r.number;
    parts.push(r.tex.replace(/^\\approx\s*/, ''));
    lines.push(`\\text{${f.label}}: \\ \\mathbf{N} = ${vecTex(r.N)}, \\ \\iint \\mathbf{F}\\cdot\\mathbf{N} = ${r.tex}`);
  }
  const t = exactTex(total);
  const surfTex = /\d\.\d/.test(t) ? `\\approx ${Number(total.toPrecision(8))}` : t;
  steps.push({ title: faces.length > 1 ? 'Flux through each face' : 'Flux through the sphere', depth: 0, lines: [...lines, `\\text{total} = ${faces.length > 1 ? `${parts.join(' + ').replace(/\+ -/g, '- ')} = ` : ''}${surfTex}`] });
  const verified = Math.abs(total - Vi.number) < 1e-6 * Math.max(1, Math.abs(Vi.number));
  steps.push({ title: 'Compare', depth: 0, lines: [`${surfTex} ${verified ? '=' : '\\neq'} ${Vi.tex}`] });
  void math; void num;
  return { surface: surfTex, volume: Vi.tex, divTex: mtex(polish(div)), value: Vi.tex, steps, notes: verified ? [] : ['The two sides did not agree numerically.'], verified, result: Vi.tex };
}
