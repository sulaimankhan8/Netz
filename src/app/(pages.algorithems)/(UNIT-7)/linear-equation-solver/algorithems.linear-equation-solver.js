'use client';
// The live linear equation solver. The maths is in src/app/utils/engines/linear-equation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/linear-equation';

const EXAMPLES = ['x/3 + 1/2 = 5/6', '5 - 2x = 11', '4(2x - 1) = 3(x + 2)', '2x + 3 = 2x + 5', '0.5x + 1.25 = 3'].map((eq) => ({ label: eq, input: { eq } }));

export default function LinearEquationCalculator() {
  return (
    <SymbolicCalculator
      id="linear-equation" unit={7} title="Linear Equation Engine" button="Solve"
      start={{ eq: '3(x - 2) + 4 = 2x + 7' }}
      fields={[{ key: 'eq', label: 'Equation', placeholder: 'e.g. 3(x - 2) + 4 = 2x + 7' }]}
      examples={EXAMPLES} solve={solve}
      hint="Use one unknown (x, y, t …). Fractions like x/3 and decimals are fine."
      resultLabel="Solution"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.eq} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={a.kind === 'one' ? `${a.variable} = ${a.xTex}` : a.kind === 'none' ? '\\text{No solution}' : `\\text{Every } ${a.variable} \\text{ is a solution}`} /></div>
        </div>
      )}
    />
  );
}
