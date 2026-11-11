'use client';
// The live Bairstow's method calculator. The maths is in src/app/utils/engines/bairstow-method.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/bairstow-method';

const EXAMPLES = [
  {
    label: "x⁴ − 1.1x³ + 2.3x² + 0.5x + 3.3",
    input: {
      coeffs: "1 -1.1 2.3 0.5 3.3",
      r0: "-1",
      s0: "-1",
      tol: "1e-8"
    }
  },
  {
    label: "x³ − 6x² + 11x − 6",
    input: {
      coeffs: "1 -6 11 -6",
      r0: "0",
      s0: "0",
      tol: "1e-8"
    }
  },
  {
    label: "x⁴ + 1",
    input: {
      coeffs: "1 0 0 0 1",
      r0: "1",
      s0: "-1",
      tol: "1e-10"
    }
  },
  {
    label: "x⁵ − 3.5x⁴ + 2.75x³ + 2.125x² − 3.875x + 1.25",
    input: {
      coeffs: "1 -3.5 2.75 2.125 -3.875 1.25",
      r0: "-1",
      s0: "-1",
      tol: "1e-8"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="bairstow-method" unit={1} title="Bairstow's Method Engine" button="Factor"
      start={{
  coeffs: "1 -1.1 2.3 0.5 3.3",
  r0: "-1",
  s0: "-1",
  tol: "1e-8"
}}
      fields={[
        { key: 'coeffs', label: 'Coefficients, highest power first', placeholder: '1 -1.1 2.3 0.5 3.3', wide: true },
        { key: 'r0', label: 'Starting r', placeholder: '-1' }, { key: 's0', label: 'Starting s', placeholder: '-1' }, { key: 'tol', label: 'Tolerance', placeholder: '1e-8' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"The factor is x² − rx − s."}
      resultLabel="Roots"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`x = ${a.roots.join(', \\ ').replace(/−/g, '-')}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
