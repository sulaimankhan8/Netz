'use client';
// The live simultaneous differential equations calculator. The maths is in src/app/utils/engines/simultaneous-differential-equations.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/simultaneous-differential-equations';

const EXAMPLES = [
  {
    label: "x′ = 2x + y, y′ = x + 2y",
    input: {
      eq1: "dx/dt = 2x + y",
      eq2: "dy/dt = x + 2y",
      ics: ""
    }
  },
  {
    label: "Dx + y = sin t, Dy + x = cos t",
    input: {
      eq1: "dx/dt + y = sin(t)",
      eq2: "dy/dt + x = cos(t)",
      ics: "x(0) = 2, y(0) = 0"
    }
  },
  {
    label: "Dx + 2y = eᵗ, Dy − 2x = e⁻ᵗ",
    input: {
      eq1: "Dx + 2y = e^t",
      eq2: "Dy - 2x = e^(-t)",
      ics: ""
    }
  },
  {
    label: "x′ = −y, y′ = x",
    input: {
      eq1: "dx/dt = -y",
      eq2: "dy/dt = x",
      ics: "x(0) = 1, y(0) = 0"
    }
  },
  {
    label: "x′ = 3x, y′ = x − y",
    input: {
      eq1: "dx/dt = 3x",
      eq2: "dy/dt = x - y",
      ics: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="simultaneous-differential-equations" unit={12} title="Simultaneous ODE Engine" button="Solve"
      start={{
  eq1: "dx/dt + y = sin(t)",
  eq2: "dy/dt + x = cos(t)",
  ics: "x(0) = 2, y(0) = 0"
}}
      fields={[
        { key: 'eq1', label: 'First equation', placeholder: 'dx/dt = 2x + y', wide: true },
        { key: 'eq2', label: 'Second equation', placeholder: 'dy/dt = x + 2y', wide: true },
        { key: 'ics', label: 'Starting values (optional)', placeholder: 'x(0) = 1, y(0) = 0', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Write dx/dt, x′ or Dx (t is the variable)."}
      resultLabel="x(t) and y(t)"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`x = ${a.xTex}`} /></div><div className="overflow-x-auto"><BlockMath math={`y = ${a.yTex}`} /></div></div>)}
    />
  );
}
