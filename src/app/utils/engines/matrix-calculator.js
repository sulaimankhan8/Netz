/**
 * Matrix calculator: the maths for /matrix-calculator.
 *   op: 'add' A + B | 'subtract' A − B | 'multiply' A × B | 'scale' kA | 'transpose' Aᵀ | 'power' Aⁿ
 */
import { EngineError } from '../numeric/steps';
import { requireNumber } from '../numeric/fraction';
import * as M from '../numeric/matrix';

export const OPERATIONS = [
  { op: 'add', label: 'A + B', needsB: true },
  { op: 'subtract', label: 'A − B', needsB: true },
  { op: 'multiply', label: 'A × B', needsB: true },
  { op: 'scale', label: 'k × A' },
  { op: 'transpose', label: 'Aᵀ (transpose)' },
  { op: 'power', label: 'Aⁿ (power)' },
];

export function solve({ op, a, b, k, n }) {
  const A = M.fromStrings(a, 'Matrix A');
  const info = OPERATIONS.find((o) => o.op === op);
  if (!info) throw new EngineError('Choose an operation.');
  const B = info.needsB ? M.fromStrings(b, 'Matrix B') : null;
  const base = { op, A, B, steps: { headers: [], rows: [] }, notes: [], plot: null };

  switch (op) {
    case 'add': return { ...base, result: M.add(A, B), notes: ['Add the entries in the same position: (A + B)ᵢⱼ = aᵢⱼ + bᵢⱼ.'] };
    case 'subtract': return { ...base, result: M.subtract(A, B), notes: ['Subtract the entries in the same position: (A − B)ᵢⱼ = aᵢⱼ − bᵢⱼ.'] };
    case 'multiply': {
      const { result, working } = M.multiply(A, B);
      return { ...base, result, working, notes: [`Entry (i, j) of AB = row i of A · column j of B. A is ${A.length}×${A[0].length}, B is ${B.length}×${B[0].length}, so AB is ${A.length}×${B[0].length}.`] };
    }
    case 'scale': {
      const kv = requireNumber(k, 'The number k');
      return { ...base, k: kv, result: M.scale(A, kv), notes: ['Multiply every entry of A by k.'] };
    }
    case 'transpose': return { ...base, result: M.transpose(A), notes: ['Rows become columns: (Aᵀ)ᵢⱼ = aⱼᵢ.'] };
    case 'power': {
      const nv = requireNumber(n, 'The power n');
      const { result, powers } = M.power(A, nv);
      return { ...base, n: nv, result, powers, notes: [nv === 0 ? 'A⁰ is the identity matrix I.' : `Multiply A by itself: A² = A·A, A³ = A²·A, … up to A${nv === 1 ? '' : `^${nv}`}.`] };
    }
    default: throw new EngineError('Choose an operation.');
  }
}
