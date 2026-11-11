'use client';
// The live PDE formation calculator. The maths is in src/app/utils/engines/formation-of-pde.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/formation-of-pde';

const EXAMPLES = [
  {
    label: "z = (x − a)² + (y − b)²",
    input: {
      mode: "constants",
      z: "z = (x - a)^2 + (y - b)^2"
    }
  },
  {
    label: "z = ax + by + ab",
    input: {
      mode: "constants",
      z: "z = ax + by + ab"
    }
  },
  {
    label: "z = (x² + a)(y² + b)",
    input: {
      mode: "constants",
      z: "z = (x^2 + a)(y^2 + b)"
    }
  },
  {
    label: "z = f(x² + y²)",
    input: {
      mode: "function",
      z: "z = f(x^2 + y^2)"
    }
  },
  {
    label: "z = y f(x/y)",
    input: {
      mode: "function",
      z: "z = y f(x/y)"
    }
  },
  {
    label: "f(x + y + z, x² + y² + z²) = 0",
    input: {
      mode: "function",
      z: "f(x + y + z, x^2 + y^2 + z^2) = 0"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="formation-of-pde" unit={12} title="PDE Formation Engine" button="Form"
      start={{
  mode: "constants",
  z: "z = (x - a)^2 + (y - b)^2"
}}
      fields={[
        { key: 'mode', label: 'Eliminate', kind: 'choice', options: [{ value: 'constants', label: "Constants a, b" }, { value: 'function', label: "An arbitrary function" }] },
        { key: 'z', label: 'The relation', placeholder: 'z = (x - a)^2 + (y - b)^2', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"p = ∂z/∂x, q = ∂z/∂y. Constants are a and b; the arbitrary function is f."}
      resultLabel="The PDE"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.pde} /></div>}
    />
  );
}
