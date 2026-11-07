'use client';
// The live improper integral calculator. The maths is in src/app/utils/engines/improper-integrals.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/improper-integrals';

const EXAMPLES = [
  {
    label: "1/x^2 from 1 to inf",
    input: {
      f: "1/x^2",
      a: "1",
      b: "inf"
    }
  },
  {
    label: "1/x from 1 to inf",
    input: {
      f: "1/x",
      a: "1",
      b: "inf"
    }
  },
  {
    label: "e^(-x) from 0 to inf",
    input: {
      f: "e^(-x)",
      a: "0",
      b: "inf"
    }
  },
  {
    label: "1/(1 + x^2) from -inf to inf",
    input: {
      f: "1/(1 + x^2)",
      a: "-inf",
      b: "inf"
    }
  },
  {
    label: "1/sqrt(x) from 0 to 1",
    input: {
      f: "1/sqrt(x)",
      a: "0",
      b: "1"
    }
  },
  {
    label: "1/x^2 from -1 to 1",
    input: {
      f: "1/x^2",
      a: "-1",
      b: "1"
    }
  },
  {
    label: "x e^(-x^2) from 0 to inf",
    input: {
      f: "x e^(-x^2)",
      a: "0",
      b: "inf"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="improper-integrals" unit={6} title="Improper Integral Engine" button="Evaluate"
      start={{f:"1/x^2",a:"1",b:"inf"}}
      fields={[
        { key: 'f', label: 'f(x)', placeholder: 'e.g. e^(-x)', wide: true },
        { key: 'a', label: 'From (number, or -inf)', placeholder: '1' },
        { key: 'b', label: 'To (number, or inf)', placeholder: 'inf' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write inf for ∞. Points where f blows up inside the interval are found and the integral is split there."
      resultLabel={(a) => (a.converges ? 'Converges' : 'Diverges')}
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`${a.setup} = ${a.valueTex}`} /></div>}
    />
  );
}
