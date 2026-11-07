'use client';
// The live joint distribution calculator. The maths is in src/app/utils/engines/joint-distribution.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/joint-distribution';

const EXAMPLES = [
  {
    label: "independent 3 × 2",
    input: {
      xs: "0, 1, 2",
      ys: "0, 1",
      table: "1/8, 1/8; 1/4, 1/4; 1/8, 1/8"
    }
  },
  {
    label: "dependent 2 × 2",
    input: {
      xs: "0, 1",
      ys: "0, 1",
      table: "0.4, 0.1; 0.1, 0.4"
    }
  },
  {
    label: "Cov 0 but dependent",
    input: {
      xs: "-1, 0, 1",
      ys: "0, 1",
      table: "0, 1/3; 1/3, 0; 0, 1/3"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="joint-distribution" unit={5} title="Joint Distribution Engine" button="Analyse"
      start={{
  xs: "0, 1, 2",
  ys: "0, 1",
  table: "1/8, 1/8; 1/4, 1/4; 1/8, 1/8"
}}
      fields={[
        { key: 'xs', label: 'Values of X (rows)', placeholder: '0, 1, 2' }, { key: 'ys', label: 'Values of Y (columns)', placeholder: '0, 1' },
        { key: 'table', label: 'P(x, y): one row per x, rows separated by ;', placeholder: '1/8, 1/8; 1/4, 1/4; 1/8, 1/8', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Fractions like 1/8 are fine; the probabilities must add up to 1."
      resultLabel={(a) => (a.indep ? 'Independent' : 'Not independent')}
      renderResult={(a) => (<div className="space-y-2 min-w-0"><div className="overflow-x-auto"><BlockMath math={`E[X] = ${a.EX}, \\quad E[Y] = ${a.EY}, \\quad \\text{Cov} = ${a.cov}, \\quad \\rho = ${a.rho}`} /></div><StepTable columns={a.columns} rows={a.rows} /></div>)}
    />
  );
}
