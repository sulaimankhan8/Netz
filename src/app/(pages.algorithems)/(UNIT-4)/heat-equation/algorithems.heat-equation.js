'use client';
// The live heat equation calculator. The maths is in src/app/utils/engines/heat-equation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/heat-equation';

const EXAMPLES = [
  {
    label: "Bender–Schmidt: u = 4x − x²",
    input: {
      method: "bender",
      f: "4x - x^2",
      L: "4",
      c2: "1",
      h: "1",
      g0: "0",
      g1: "0",
      steps: "4"
    }
  },
  {
    label: "Crank–Nicolson: u = sin(πx)",
    input: {
      method: "crank",
      f: "sin(pi x)",
      L: "1",
      c2: "1",
      h: "0.25",
      k: "0.0625",
      g0: "0",
      g1: "0",
      steps: "3"
    }
  },
  {
    label: "Ends held at 0 and 100",
    input: {
      method: "bender",
      f: "0",
      L: "1",
      c2: "1",
      h: "0.25",
      g0: "0",
      g1: "100",
      steps: "6"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="heat-equation" unit={4} title="Heat Equation Engine" button="Solve"
      start={{
  method: "bender",
  f: "4x - x^2",
  L: "4",
  c2: "1",
  h: "1",
  k: "",
  g0: "0",
  g1: "0",
  steps: "4"
}}
      fields={[
        { key: 'method', label: 'Scheme', kind: 'choice', options: [{ value: 'bender', label: 'Bender–Schmidt (explicit)' }, { value: 'crank', label: 'Crank–Nicolson (implicit)' }] },
        { key: 'f', label: 'u(x, 0) = f(x)', placeholder: 'e.g. 4x - x^2', wide: true },
        { key: 'L', label: 'Length L', placeholder: '4' }, { key: 'c2', label: 'c² in uₜ = c² uₓₓ', placeholder: '1' },
        { key: 'h', label: 'Step h in x', placeholder: '1' }, { key: 'k', label: 'Step k in t (Crank–Nicolson)', placeholder: 'h²/c² if empty', show: (v) => v.method === 'crank' },
        { key: 'g0', label: 'u(0, t)', placeholder: '0' }, { key: 'g1', label: 'u(L, t)', placeholder: '0' },
        { key: 'steps', label: 'Time steps', placeholder: '4' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Bender–Schmidt fixes k = h²/(2c²). Crank–Nicolson takes any k."
      resultLabel="u(x, t) on the grid"
      renderResult={(a) => (<div className="space-y-2 min-w-0"><p className="text-sm">h = {a.h}, k = {a.k}, λ = c²k/h² = {a.lambda}</p><StepTable columns={a.columns} rows={a.rows} /></div>)}
    />
  );
}
