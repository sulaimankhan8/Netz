'use client';
// The live contour integration calculator. The maths is in src/app/utils/engines/contour-integration.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/contour-integration';

const EXAMPLES = [
  {
    label: "1/(5 + 4 cos θ)",
    input: {
      mode: "trig",
      f: "1/(5 + 4cos(θ))"
    }
  },
  {
    label: "1/(2 + sin θ)",
    input: {
      mode: "trig",
      f: "1/(2 + sin(θ))"
    }
  },
  {
    label: "cos 2θ/(5 − 4 cos θ)",
    input: {
      mode: "trig",
      f: "cos(2θ)/(5 - 4cos(θ))"
    }
  },
  {
    label: "1/(x² + 1)²",
    input: {
      mode: "rational",
      f: "1/(x^2 + 1)^2"
    }
  },
  {
    label: "1/(x⁴ + 1)",
    input: {
      mode: "rational",
      f: "1/(x^4 + 1)"
    }
  },
  {
    label: "cos 2x/(x² + 1)",
    input: {
      mode: "rational",
      f: "cos(2x)/(x^2 + 1)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="contour-integration" unit={14} title="Contour Integration Engine" button="Evaluate"
      start={{
  mode: "trig",
  f: "1/(5 + 4cos(θ))"
}}
      fields={[
        { key: 'mode', label: 'Integral', kind: 'choice', options: [{ value: 'trig', label: "∫₀²π R(cos θ, sin θ) dθ" }, { value: 'rational', label: "∫₋∞^∞ f(x) dx" }] },
        { key: 'f', label: 'Integrand', placeholder: '1/(5 + 4cos(θ))', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Use θ (or t) in the first kind and x in the second."}
      resultLabel="Value"
      renderResult={(a) => <div className="overflow-x-auto text-lg"><BlockMath math={`I = ${a.value}`} /></div>}
    />
  );
}
