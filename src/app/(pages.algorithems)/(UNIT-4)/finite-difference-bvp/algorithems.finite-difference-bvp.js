'use client';
// The live finite-difference BVP calculator. The maths is in src/app/utils/engines/finite-difference-bvp.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/finite-difference-bvp';

const EXAMPLES = [
  {
    label: "y'' = y, y(0)=0, y(1)=1",
    input: {
      p: "0",
      q: "-1",
      r: "0",
      a: "0",
      b: "1",
      ya: "0",
      yb: "1",
      n: "4",
      exact: "sinh(x)/sinh(1)"
    }
  },
  {
    label: "y'' = x, y(0)=0, y(1)=0",
    input: {
      p: "0",
      q: "0",
      r: "x",
      a: "0",
      b: "1",
      ya: "0",
      yb: "0",
      n: "4",
      exact: "(x^3 - x)/6"
    }
  },
  {
    label: "y'' + y = 0, y(0)=0, y(π/2)=1",
    input: {
      p: "0",
      q: "1",
      r: "0",
      a: "0",
      b: "pi/2",
      ya: "0",
      yb: "1",
      n: "6",
      exact: "sin(x)"
    }
  },
  {
    label: "y'' − 2y' + y = x",
    input: {
      p: "-2",
      q: "1",
      r: "x",
      a: "0",
      b: "1",
      ya: "0",
      yb: "0",
      n: "5",
      exact: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="finite-difference-bvp" unit={4} title="Finite Difference Engine" button="Solve"
      start={{
  p: "0",
  q: "-1",
  r: "0",
  a: "0",
  b: "1",
  ya: "0",
  yb: "1",
  n: "4",
  exact: "sinh(x)/sinh(1)"
}}
      fields={[
        { key: 'p', label: "p(x) in y'' + p y' + q y = r", placeholder: '0' }, { key: 'q', label: 'q(x)', placeholder: '-1' }, { key: 'r', label: 'r(x)', placeholder: '0' },
        { key: 'a', label: 'a', placeholder: '0' }, { key: 'b', label: 'b', placeholder: '1' },
        { key: 'ya', label: 'y(a)', placeholder: '0' }, { key: 'yb', label: 'y(b)', placeholder: '1' },
        { key: 'n', label: 'Intervals n', placeholder: '4' }, { key: 'exact', label: 'Exact solution (optional)', placeholder: 'to compare' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write the equation as y'' + p(x) y' + q(x) y = r(x)."
      resultLabel="Solution at the grid points"
      renderResult={(a) => <p className="text-sm">h = {a.h}. The table below lists y at every grid point.</p>}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
