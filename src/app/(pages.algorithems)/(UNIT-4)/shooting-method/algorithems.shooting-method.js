'use client';
// The live shooting method calculator. The maths is in src/app/utils/engines/shooting-method.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/shooting-method';

const EXAMPLES = [
  {
    label: "y'' = y, y(0)=0, y(1)=1",
    input: {
      F: "y",
      a: "0",
      b: "1",
      ya: "0",
      yb: "1",
      s0: "0",
      s1: "1"
    }
  },
  {
    label: "y'' = −y, y(0)=0, y(π/2)=1",
    input: {
      F: "-y",
      a: "0",
      b: "pi/2",
      ya: "0",
      yb: "1",
      s0: "0",
      s1: "2"
    }
  },
  {
    label: "y'' = 6x, y(0)=0, y(1)=1",
    input: {
      F: "6x",
      a: "0",
      b: "1",
      ya: "0",
      yb: "1",
      s0: "0",
      s1: "1"
    }
  },
  {
    label: "nonlinear: y'' = 3y²/2, y(0)=4, y(1)=1",
    input: {
      F: "3y^2/2",
      a: "0",
      b: "1",
      ya: "4",
      yb: "1",
      s0: "-7",
      s1: "-9",
      n: "40"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="shooting-method" unit={4} title="Shooting Method Engine" button="Shoot"
      start={{
  F: "y",
  a: "0",
  b: "1",
  ya: "0",
  yb: "1",
  s0: "0",
  s1: "1",
  n: "10"
}}
      fields={[
        { key: 'F', label: "y'' = F(x, y, y')", placeholder: "e.g. y, or -y' + x", wide: true },
        { key: 'a', label: 'a', placeholder: '0' }, { key: 'b', label: 'b', placeholder: '1' },
        { key: 'ya', label: 'y(a)', placeholder: '0' }, { key: 'yb', label: 'y(b)', placeholder: '1' },
        { key: 's0', label: "First guess for y'(a)", placeholder: '0' }, { key: 's1', label: 'Second guess', placeholder: '1' },
        { key: 'n', label: 'RK4 steps', placeholder: '10' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use y' for the first derivative in F."
      resultLabel="Shooting result"
      renderResult={(a) => (<div className="space-y-2 min-w-0"><div className="overflow-x-auto text-lg"><BlockMath math={`y'(a) \\approx ${a.slope}`} /></div><StepTable columns={a.tableColumns} rows={a.table} /></div>)}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
