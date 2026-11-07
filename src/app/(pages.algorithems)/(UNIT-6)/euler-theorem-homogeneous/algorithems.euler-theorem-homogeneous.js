'use client';
// The live Euler's theorem calculator. The maths is in src/app/utils/engines/euler-homogeneous.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheck } from 'react-icons/fi';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/euler-homogeneous';

const EXAMPLES = [
  { label: 'x³ + y³ + 3x²y', input: { u: 'x^3 + y^3 + 3x^2 y' } },
  { label: '(x² + y²)/(x + y)', input: { u: '(x^2 + y^2)/(x + y)' } },
  { label: 'x^(1/3) + y^(1/3)', input: { u: 'x^(1/3) + y^(1/3)' } },
  { label: 'sin⁻¹((x² + y²)/(x + y))', input: { u: 'asin((x^2 + y^2)/(x + y))' } },
  { label: 'tan⁻¹((x³ + y³)/(x − y))', input: { u: 'atan((x^3 + y^3)/(x - y))' } },
  { label: 'log((x⁴ + y⁴)/(x + y))', input: { u: 'log((x^4 + y^4)/(x + y))' } },
];

export default function EulerHomogeneousCalculator() {
  return (
    <SymbolicCalculator
      id="euler-homogeneous" unit={6} title="Euler's Theorem Engine" button="Apply Euler's Theorem"
      start={{ u: 'x^3 + y^3 + 3x^2 y', second: 'yes' }}
      fields={[
        { key: 'u', label: 'u(x, y) or u(x, y, z)', placeholder: 'e.g. x^3 + y^3 + 3x^2 y', wide: true },
        { key: 'second', label: 'Second-order form too?', kind: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'First order only' }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use asin, acos, atan or log around a homogeneous expression for the composite form (u = sin⁻¹ z, …)."
      resultLabel={(a) => (a.composite ? `F(u) is homogeneous of degree ${a.nText}` : `Homogeneous of degree n = ${a.nText}`)}
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`u = ${a.u}`} /></div>
          {a.results.map((r) => (
            <div key={r.lhs} className="flex items-center gap-2 min-w-0">
              <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`${r.lhs} = ${r.rhs}`} /></div>
              {r.ok && <FiCheck className="w-5 h-5 shrink-0 text-emerald-600" aria-label="checked" />}
            </div>
          ))}
        </div>
      )}
    />
  );
}
