'use client';
// The live trig equation calculator. The maths is in src/app/utils/engines/trig-equations.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/trig-equations';

const EXAMPLES = [
  {
    label: "2 sin x − 1 = 0",
    input: {
      equation: "2sin(x) - 1 = 0"
    }
  },
  {
    label: "2cos²x + 3cos x + 1 = 0",
    input: {
      equation: "2cos(x)^2 + 3cos(x) + 1 = 0"
    }
  },
  {
    label: "tan x = √3",
    input: {
      equation: "tan(x) = sqrt(3)"
    }
  },
  {
    label: "sin 2x = cos x",
    input: {
      equation: "sin(2x) = cos(x)"
    }
  },
  {
    label: "√3 cos x + sin x = √2",
    input: {
      equation: "sqrt(3)cos(x) + sin(x) = sqrt(2)"
    }
  },
  {
    label: "sin 3x = 1/2",
    input: {
      equation: "sin(3x) = 1/2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="trig-equations" unit={9} title="Trig Equation Solver" button="Solve"
      start={{
  equation: "2cos(x)^2 + 3cos(x) + 1 = 0"
}}
      fields={[{ key: 'equation', label: 'Equation in x', placeholder: '2sin(x) - 1 = 0', wide: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Angles in radians; the solutions in degrees are listed too."
      resultLabel="General solution"
      renderResult={(a) => (<div className="space-y-2 min-w-0">{a.generals.map((g, i) => <div key={i} className="overflow-x-auto"><BlockMath math={g} /></div>)}<p className="font-mono text-sm">In [0, 2π): {a.degrees.join(', ') || 'none'}</p></div>)}
    />
  );
}
