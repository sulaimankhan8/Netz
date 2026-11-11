'use client';
// The live Kuhn–Tucker calculator. The maths is in src/app/utils/engines/kuhn-tucker.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/kuhn-tucker';

const EXAMPLES = [
  {
    label: "Max 10x + 4y − 2x² − y²",
    input: {
      f: "10x + 4y - 2x^2 - y^2",
      goal: "max",
      constraints: "2x + y <= 5; x >= 0; y >= 0"
    }
  },
  {
    label: "Max 8x + 10y − x² − y²",
    input: {
      f: "8x + 10y - x^2 - y^2",
      goal: "max",
      constraints: "3x + 2y <= 6; x >= 0; y >= 0"
    }
  },
  {
    label: "Min x² + y², x + y ≥ 4",
    input: {
      f: "x^2 + y^2",
      goal: "min",
      constraints: "x + y >= 4"
    }
  },
  {
    label: "Nearest point to (3, 2)",
    input: {
      f: "(x - 3)^2 + (y - 2)^2",
      goal: "min",
      constraints: "x^2 + y^2 <= 5; x + 2y <= 4; x >= 0; y >= 0"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="kuhn-tucker" unit={15} title="Kuhn–Tucker Engine" button="Optimise"
      start={{
  f: "10x + 4y - 2x^2 - y^2",
  goal: "max",
  constraints: "2x + y <= 5; x >= 0; y >= 0"
}}
      fields={[
        { key: 'f', label: 'Objective f(x, y)', placeholder: '10x + 4y - 2x^2 - y^2', wide: true },
        { key: 'goal', label: 'Goal', kind: 'choice', options: [{ value: 'max', label: "Maximise" }, { value: 'min', label: "Minimise" }] },
        { key: 'constraints', label: 'Constraints (separated by ;)', placeholder: '2x + y <= 5; x >= 0; y >= 0', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Up to 5 constraints with <= or >=. Variables x, y (and z)."}
      resultLabel={(a) => 'Optimum'}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`${a.x}, \\quad f = ${a.value}`} /></div>}
    />
  );
}
