'use client';
// The live Clairaut's equation calculator. The maths is in src/app/utils/engines/clairaut-equation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/clairaut-equation';

const EXAMPLES = [
  {
    label: "y = px + p²",
    input: {
      eq: "y = px + p^2"
    }
  },
  {
    label: "y = px + 1/p",
    input: {
      eq: "y = px + 1/p"
    }
  },
  {
    label: "p = ln(px − y)",
    input: {
      eq: "p = log(px - y)"
    }
  },
  {
    label: "y = px + √(1 + p²)",
    input: {
      eq: "y = px + sqrt(1 + p^2)"
    }
  },
  {
    label: "p² − 5p + 6 = 0",
    input: {
      eq: "p^2 - 5p + 6 = 0"
    }
  },
  {
    label: "p² − (x + y)p + xy = 0",
    input: {
      eq: "p^2 - (x + y)p + xy = 0"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="clairaut-equation" unit={12} title="Clairaut's Equation Engine" button="Solve"
      start={{
  eq: "y = px + p^2"
}}
      fields={[
        { key: 'eq', label: 'Equation (p = dy/dx)', placeholder: 'y = px + p^2', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Write p for dy/dx. Clairaut form y = px + f(p), or an equation of degree 2 in p."}
      resultLabel={(a) => (a.kind === 'clairaut' ? 'General and singular solutions' : 'Solution (solvable for p)')}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={a.general} /></div>{a.singular && <div className="overflow-x-auto"><BlockMath math={`\\text{singular: } ${a.singular}`} /></div>}</div>)}
    />
  );
}
