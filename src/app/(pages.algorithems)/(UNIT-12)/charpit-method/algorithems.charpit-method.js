'use client';
// The live Charpit's method calculator. The maths is in src/app/utils/engines/charpit-method.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/charpit-method';

const EXAMPLES = [
  {
    label: "I: pq = 1",
    input: {
      eq: "pq = 1"
    }
  },
  {
    label: "I: p² + q² = 1",
    input: {
      eq: "p^2 + q^2 = 1"
    }
  },
  {
    label: "II: z = pq",
    input: {
      eq: "z = pq"
    }
  },
  {
    label: "III: p² + q² = x + y",
    input: {
      eq: "p^2 + q^2 = x + y"
    }
  },
  {
    label: "III: p − x² = q + y²",
    input: {
      eq: "p - x^2 = q + y^2"
    }
  },
  {
    label: "IV: z = px + qy + pq",
    input: {
      eq: "z = px + qy + pq"
    }
  },
  {
    label: "p = xq²",
    input: {
      eq: "p = x q^2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="charpit-method" unit={12} title="Charpit's Method Engine" button="Solve"
      start={{
  eq: "p^2 + q^2 = x + y"
}}
      fields={[
        { key: 'eq', label: 'f(x, y, z, p, q) = 0', placeholder: 'p^2 + q^2 = x + y', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"p = ∂z/∂x, q = ∂z/∂y."}
      resultLabel={(a) => (a.form === 'Charpit' ? 'Complete integral (Charpit)' : `Complete integral (standard form ${a.form})`)}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.complete} /></div>}
    />
  );
}
