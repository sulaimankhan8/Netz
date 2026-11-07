/**
 * Partial derivatives: the maths for /partial-derivative-calculator (catalog 6D).
 *   mode 'chain'  one partial derivative of any order, e.g. order "xy" = f_xy (first x, then y), with the
 *                 rule-by-rule steps of the one-variable engine (the other letters are constants)
 *   mode 'all'    every first and second partial, and the check f_xy = f_yx
 *   mode 'total'  the total derivative du/dt when x, y (and z) are functions of t:  du/dt = f_x x′ + f_y y′ (+ f_z z′)
 */
import { EngineError } from '../numeric/steps';
import { math, add, mul, polish } from '../symbolic/tree';
import { readMulti, partial, partialChain, partialName, lettersOf, tidyMulti, equalAt, mtex } from '../symbolic/multi';
import { substitute } from '../symbolic/iterated';

/** Split an order like "xy", "x,y", "r theta" into the function's letters (longest names first). */
export function readOrder(text, vars) {
  const s = String(text ?? '').replace(/θ/g, 'theta').replace(/[,\s∂]/g, '');
  if (!s) throw new EngineError('Say which variables to differentiate by, e.g. x, or xy for f_xy.');
  const names = [...vars].sort((a, b) => b.length - a.length);
  const out = [];
  let i = 0;
  while (i < s.length) {
    const hit = names.find((v) => s.startsWith(v, i));
    if (!hit) throw new EngineError(`"${s.slice(i)}" is not one of the function's letters (${vars.join(', ')}).`);
    out.push(hit);
    i += hit.length;
  }
  if (out.length > 4) throw new EngineError('Up to 4th-order partial derivatives are supported.');
  return out;
}

const texV = (v) => ({ theta: '\\theta', varphi: '\\varphi', rho: '\\rho' }[v] || v);

export function solve({ f, mode = 'chain', order = 'x', xt = '', yt = '', zt = '' }) {
  const node = readMulti(f, 'f');
  const vars = lettersOf(node);
  if (!vars.length) throw new EngineError('f has no letters to differentiate by.');
  const steps = [];
  const notes = [];
  const items = [];

  if (mode === 'chain') {
    const chain = readOrder(order, vars);
    const stages = partialChain(node, chain, vars);
    let prev = node;
    stages.forEach((st, i) => {
      const v = chain[i];
      const others = vars.filter((w) => w !== v);
      const name = partialName(st.chain);
      steps.push({
        title: `Differentiate with respect to ${v}${others.length ? ` (${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} held constant)` : ''}`,
        formula: name.frac,
        lines: [`${name.sub} = \\frac{\\partial}{\\partial ${texV(v)}}\\left(${mtex(polish(prev))}\\right) = ${mtex(st.node)}`],
        depth: 0,
      });
      st.steps.forEach((s) => steps.push({ ...s, depth: (s.depth || 0) + 1 }));
      prev = st.node;
    });
    const last = stages.at(-1);
    const name = partialName(chain);
    items.push({ name: `${name.frac} = ${name.sub}`, value: mtex(last.node) });
    // Mixed partials: the other order gives the same (Clairaut / Schwarz)
    if (new Set(chain).size > 1) {
      const rev = [...chain].reverse();
      const other = partialChain(node, rev, vars).at(-1).node;
      const same = equalAt(other, last.node, vars);
      notes.push(same
        ? `Differentiating in the other order (${rev.join(' then ')}) gives the same answer: f_{${chain.join('')}} = f_{${rev.join('')}}, as Clairaut's theorem says for smooth functions.`
        : `The other order (${rev.join(' then ')}) gives a different answer here: the function is not smooth enough at some points for Clairaut's theorem.`);
    }
    return { mode, f: mtex(polish(node)), vars, items, answer: mtex(last.node), steps, notes, verified: true };
  }

  if (mode === 'all') {
    const first = vars.map((v) => ({ v, node: partial(node, v, vars).result }));
    first.forEach(({ v, node: d }) => {
      const nm = partialName([v]);
      items.push({ name: `${nm.sub}`, value: mtex(d), order: 1 });
      steps.push({ title: `First order: with respect to ${v}`, formula: nm.frac, lines: [`${nm.sub} = ${mtex(d)}`], depth: 0 });
    });
    const second = [];
    first.forEach(({ v, node: d }) => vars.forEach((w) => {
      const dd = partial(d, w, vars).result;
      const nm = partialName([v, w]);
      second.push({ chain: [v, w], node: dd });
      items.push({ name: nm.sub, value: mtex(dd), order: 2 });
      steps.push({ title: `Second order: ${nm.sub} (${v}, then ${w})`, formula: nm.frac, lines: [`${nm.sub} = \\frac{\\partial}{\\partial ${texV(w)}}\\left(${mtex(d)}\\right) = ${mtex(dd)}`], depth: 0 });
    }));
    const mixed = second.filter((s) => s.chain[0] !== s.chain[1]);
    const pairsOk = mixed.every((s) => equalAt(s.node, second.find((t) => t.chain[0] === s.chain[1] && t.chain[1] === s.chain[0]).node, vars));
    if (vars.length > 1) notes.push(pairsOk ? 'Each mixed pair matches (f_xy = f_yx, …): Clairaut\'s theorem.' : 'Some mixed partials differ: the function is not smooth everywhere.');
    return { mode, f: mtex(polish(node)), vars, items, steps, notes, verified: true, answer: null };
  }

  if (mode === 'total') {
    const paths = { x: xt, y: yt, z: zt };
    const used = vars.filter((v) => ['x', 'y', 'z'].includes(v));
    if (!used.length) throw new EngineError('For the total derivative, write f in x and y (and z).');
    const extra = vars.filter((v) => !['x', 'y', 'z', 't'].includes(v));
    if (extra.length) throw new EngineError(`For the total derivative, f may use only x, y, z (it also has ${extra.join(', ')}).`);
    const xs = used.map((v) => {
      if (!String(paths[v]).trim()) throw new EngineError(`Give ${v} as a function of t (the ${v}(t) box is empty).`);
      const p = readMulti(paths[v], `${v}(t)`);
      const bad = lettersOf(p).filter((w) => w !== 't');
      if (bad.length) throw new EngineError(`${v}(t) may use only t (it has ${bad.join(', ')}).`);
      return { v, p, dp: partial(p, 't', ['t']).result, fv: partial(node, v, vars).result };
    });
    xs.forEach(({ v, p, dp, fv }) => {
      steps.push({ title: `∂f/∂${v} and d${v}/dt`, lines: [`f_${v} = ${mtex(fv)}, \\qquad ${v} = ${mtex(polish(p))} \\Rightarrow \\frac{d${v}}{dt} = ${mtex(dp)}`], depth: 0 });
    });
    const chainTex = xs.map(({ v }) => `\\frac{\\partial f}{\\partial ${v}}\\frac{d${v}}{dt}`).join(' + ');
    let sum = xs.map(({ dp, fv }) => mul(fv, dp)).reduce((a, b) => add(a, b));
    steps.push({ title: 'Chain rule', formula: `\\frac{du}{dt} = ${chainTex}`, lines: [`\\frac{du}{dt} = ${xs.map(({ dp, fv }) => `\\left(${mtex(fv)}\\right)\\left(${mtex(dp)}\\right)`).join(' + ')}`], depth: 0 });
    for (const { v, p } of xs) sum = substitute(sum, v, p);
    const inT = tidyMulti(sum, ['t']);
    // Check: differentiate f(x(t), y(t)) directly
    let composite = node;
    for (const { v, p } of xs) composite = substitute(composite, v, p);
    const direct = math.derivative(composite, 't');
    const ok = equalAt(inT, direct, ['t']);
    steps.push({ title: `Put ${used.join(', ')} in terms of t`, lines: [`\\frac{du}{dt} = ${mtex(inT)}`], depth: 0 });
    items.push({ name: '\\frac{du}{dt}', value: mtex(inT) });
    notes.push(ok ? 'Checked: differentiating f(x(t), y(t)) directly gives the same answer.' : 'NETZ could not confirm this by direct differentiation.');
    return { mode, f: mtex(polish(node)), vars, items, answer: mtex(inT), steps, notes, verified: ok };
  }
  throw new EngineError('Choose a mode.');
}
