/**
 * Small helpers the integration pages share: reading a limit of integration (π stays π), putting an antiderivative
 * between two limits with an exact value, and cross-checking a definite integral with Simpson's rule.
 */
import { EngineError } from '../numeric/steps';
import { readConstant } from './input';
import { simpson } from './integral';
import { math, tex, polish, tidy, simplifyExact, sub, paren } from '../symbolic/tree';

export const valueOf = (node, scope) => { try { const y = node.evaluate(scope); return typeof y === 'number' ? y : NaN; } catch { return NaN; } };

/** The limit as typed, with its value: { value, node, tex }. */
export function readLimit(t, label) {
  const value = readConstant(t, label);
  let node;
  try { node = math.parse(String(t).trim().replace(/π/g, 'pi')); } catch { node = math.parse(String(value)); }
  return { value, node, tex: tex(polish(node)) };
}

/** F(b) − F(a) for an antiderivative node F in v. Returns { value, valueTex, numeric }, checked against Simpson's rule on f. */
export function between(F, f, v, A, B) {
  const at = (L) => tidy(F.transform((n) => (n.isSymbolNode && n.name === v ? L.node : n)));
  // Built from nodes, never from printed text: "e^1 (1 - 1)" read back would be a function call
  const diff = simplifyExact(tidy(sub(paren(at(B)), paren(at(A)))));
  const value = valueOf(diff, {});
  const numeric = simpson((x) => valueOf(f, { [v]: x }), A.value, B.value);
  if (Number.isFinite(value) && Math.abs(value - numeric) > 1e-5 * Math.max(1, Math.abs(numeric))) {
    throw new EngineError('The antiderivative is not smooth between the limits (f may blow up or change formula in between), so the value would be wrong. Split the integral at that point.');
  }
  return { value, valueTex: tex(polish(diff)), numeric, atA: tex(polish(at(A))), atB: tex(polish(at(B))) };
}
