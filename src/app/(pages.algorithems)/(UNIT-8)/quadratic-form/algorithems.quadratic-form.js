'use client';
// The live quadratic form calculator. The maths is in src/app/utils/engines/quadratic-form.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/quadratic-form';

const EXAMPLES = [
  {
    label: "3x² + 5y² + 3z² − 2xy + 2xz − 2yz",
    input: {
      form: "3x^2 + 5y^2 + 3z^2 - 2xy + 2xz - 2yz"
    }
  },
  {
    label: "indefinite: x² + 2y² − 4xz",
    input: {
      form: "x^2 + 2y^2 + 3z^2 + 2xy - 6xz"
    }
  },
  {
    label: "two variables: 5x² + 4xy + 2y²",
    input: {
      form: "5x^2 + 4xy + 2y^2"
    }
  },
  {
    label: "semi-definite: x² + 2xy + y²",
    input: {
      form: "x^2 + 2xy + y^2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="quadratic-form" unit={8} title="Quadratic Form Engine" button="Reduce"
      start={{
  form: "3x^2 + 5y^2 + 3z^2 - 2xy + 2xz - 2yz"
}}
      fields={[{ key: 'form', label: 'Quadratic form Q', placeholder: '3x^2 + 5y^2 + 3z^2 - 2xy + 2xz - 2yz', wide: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Type xy for x·y. Every term must have degree 2."
      resultLabel={(a) => `Canonical form (${a.nature})`}
      renderResult={(a) => (<div className="space-y-2 min-w-0"><div className="overflow-x-auto"><BlockMath math={`Q = ${a.canonical}`} /></div><p className="font-mono text-sm">rank {a.rank} · index {a.index} · signature {a.signature} · {a.nature}</p></div>)}
    />
  );
}
