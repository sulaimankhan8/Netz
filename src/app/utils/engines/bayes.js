/**
 * Bayes' theorem for events E₁ … E_k that split the sample space (their probabilities add to 1):
 *   total probability   P(A) = Σ P(Eᵢ) P(A | Eᵢ)
 *   posterior           P(Eᵢ | A) = P(Eᵢ) P(A | Eᵢ) / P(A)
 * Fractions in, fractions out (1/3, 3/10 …). The posteriors are checked to add to 1.
 */
import { EngineError } from '../numeric/steps';
import { toFraction } from '../numeric/fraction';
import { readConstant } from './input';

const n6 = (v) => String(Number(Number(v).toPrecision(6)));
/** A list of probabilities, each a number or fraction: "1/3, 0.5, 1/6". */
export function readProbabilities(text, label) {
  const parts = String(text ?? '').split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) throw new EngineError(`${label}: enter at least two values, separated by commas.`);
  return parts.map((p, i) => {
    const v = readConstant(p, `${label}, item ${i + 1}`);
    if (!(v >= 0 && v <= 1)) throw new EngineError(`${label}, item ${i + 1}: a probability must be between 0 and 1.`);
    return v;
  });
}
export function probTex(v) {
  const f = toFraction(v, 10000, 1e-10);
  if (!f) return n6(v);
  if (f.d === 1) return String(f.n);
  return `\\frac{${f.n}}{${f.d}}`;
}

export function solve({ priors: tp, likelihoods: tl, names: tn = '' }) {
  const P = readProbabilities(tp, 'The probabilities P(Eᵢ)');
  const L = readProbabilities(tl, 'The probabilities P(A | Eᵢ)');
  if (P.length !== L.length) throw new EngineError(`There are ${P.length} events but ${L.length} values of P(A | Eᵢ).`);
  const total = P.reduce((s, v) => s + v, 0);
  if (Math.abs(total - 1) > 1e-6) throw new EngineError(`The P(Eᵢ) must add up to 1 (they add up to ${n6(total)}). The events have to cover every possibility.`);
  const names = String(tn).split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  const label = (i) => (names[i] ? `\\text{${names[i].replace(/[{}\\$]/g, '')}}` : `E_{${i + 1}}`);
  const prod = P.map((p, i) => p * L[i]);
  const PA = prod.reduce((s, v) => s + v, 0);
  if (PA === 0) throw new EngineError('P(A) = 0: A cannot happen, so the posteriors are not defined.');
  const post = prod.map((v) => v / PA);
  const steps = [
    { title: 'Multiply each prior by its likelihood', lines: P.map((p, i) => `P(${label(i)})\\,P(A \\mid ${label(i)}) = ${probTex(p)} \\times ${probTex(L[i])} = ${probTex(prod[i])}`) },
    { title: 'Total probability of A', formula: 'P(A) = \\sum P(E_i)\\,P(A \\mid E_i)', lines: [`P(A) = ${prod.map(probTex).join(' + ')} = ${probTex(PA)}${toFraction(PA, 10000, 1e-10) ? ` \\approx ${n6(PA)}` : ''}`] },
    { title: "Bayes' theorem for each event", formula: 'P(E_i \\mid A) = \\frac{P(E_i)\\,P(A \\mid E_i)}{P(A)}', lines: post.map((v, i) => `P(${label(i)} \\mid A) = \\frac{${probTex(prod[i])}}{${probTex(PA)}} = ${probTex(v)}${toFraction(v, 10000, 1e-10) ? ` \\approx ${n6(v)}` : ''}`) },
  ];
  const table = {
    columns: [{ key: 'e', label: 'Event' }, { key: 'p', label: 'P(Eᵢ)' }, { key: 'l', label: 'P(A | Eᵢ)' }, { key: 'pl', label: 'P(Eᵢ)·P(A | Eᵢ)' }, { key: 'post', label: 'P(Eᵢ | A)', highlight: true }],
    rows: [...P.map((p, i) => ({ e: names[i] || `E${i + 1}`, p: n6(p), l: n6(L[i]), pl: n6(prod[i]), post: n6(post[i]) })), { e: 'Total', p: n6(total), l: '', pl: n6(PA), post: n6(post.reduce((s, v) => s + v, 0)) }],
  };
  const best = post.indexOf(Math.max(...post));
  return { k: P.length, PA, PATex: probTex(PA), posteriors: post, posteriorTex: post.map(probTex), labels: P.map((_, i) => label(i)), mostLikely: best, steps, table, verified: Math.abs(post.reduce((s, v) => s + v, 0) - 1) < 1e-9, result: post, notes: [], plot: null };
}
