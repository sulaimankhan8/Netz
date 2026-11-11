'use client';
// The live Lagrange's linear equation calculator. The maths is in src/app/utils/engines/lagrange-linear-pde.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/lagrange-linear-pde';

const EXAMPLES = [
  {
    label: "x²p + y²q = z²",
    input: {
      eq: "x^2 p + y^2 q = z^2"
    }
  },
  {
    label: "yzp + zxq = xy",
    input: {
      eq: "yz p + zx q = xy"
    }
  },
  {
    label: "(y − z)p + (z − x)q = x − y",
    input: {
      eq: "(y - z)p + (z - x)q = x - y"
    }
  },
  {
    label: "x(y − z)p + y(z − x)q = z(x − y)",
    input: {
      eq: "x(y - z)p + y(z - x)q = z(x - y)"
    }
  },
  {
    label: "p tan x + q tan y = tan z",
    input: {
      eq: "p tan(x) + q tan(y) = tan(z)"
    }
  },
  {
    label: "y²p − xyq = x(z − 2y)",
    input: {
      eq: "y^2 p - xy q = x(z - 2y)"
    }
  },
  {
    label: "p − 2q = 3x² sin(y + 2x)",
    input: {
      eq: "p - 2q = 3x^2 sin(y + 2x)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="lagrange-linear-pde" unit={12} title="Lagrange PDE Engine" button="Solve"
      start={{
  eq: "x^2 p + y^2 q = z^2"
}}
      fields={[
        { key: 'eq', label: 'Pp + Qq = R', placeholder: 'x^2 p + y^2 q = z^2', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"p = ∂z/∂x, q = ∂z/∂y."}
      resultLabel="General solution"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.answer} /></div>}
    />
  );
}
