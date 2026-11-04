'use client';
// The live factoring calculator. The maths is in src/app/utils/engines/factoring.js and src/app/utils/symbolic/algebra.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/factoring';

const EXAMPLES = ['6x^2 + x - 2', '4x^2 - 9', 'x^3 - 8', 'x^3 - 6x^2 + 11x - 6', 'x^4 - 16', '3x^3 - 12x'].map((f) => ({ label: f, input: { f } }));

export default function FactoringCalculator() {
  return (
    <SymbolicCalculator
      id="factoring" unit={7} title="Factoring Engine" button="Factor"
      start={{ f: 'x^2 + 5x + 6' }}
      fields={[{ key: 'f', label: 'Polynomial', placeholder: 'e.g. x^2 + 5x + 6' }]}
      examples={EXAMPLES} solve={solve}
      hint="One variable, whole-number powers. Factors over the rationals (whole numbers and fractions)."
      resultLabel="Factored form"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`${a.expanded} = ${a.answer}`} /></div>
          {a.prime && <p className="text-sm">This polynomial does not factor over the rationals (it is irreducible).</p>}
          {a.roots.length > 0 && <p className="text-sm font-mono">Roots: {a.roots.map((r) => Number(r.toPrecision(6))).join(', ')}</p>}
        </div>
      )}
    />
  );
}
