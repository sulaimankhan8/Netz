'use client';
// The live Graeffe's method calculator. The maths is in src/app/utils/engines/graeffe-root-squaring.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/graeffe-root-squaring';

const EXAMPLES = [
  {
    label: "x³ − 6x² + 11x − 6",
    input: {
      coeffs: "1 -6 11 -6",
      m: "3"
    }
  },
  {
    label: "x³ − 2x² − 5x + 6",
    input: {
      coeffs: "1 -2 -5 6",
      m: "4"
    }
  },
  {
    label: "x² − 5x + 6, 2 squarings",
    input: {
      coeffs: "1 -5 6",
      m: "2"
    }
  },
  {
    label: "x³ − 9x² + 18x − 6",
    input: {
      coeffs: "1 -9 18 -6",
      m: "4"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="graeffe-root-squaring" unit={1} title="Graeffe's Method Engine" button="Square"
      start={{
  coeffs: "1 -6 11 -6",
  m: "3"
}}
      fields={[
        { key: 'coeffs', label: 'Coefficients, highest power first', placeholder: '1 -6 11 -6', wide: true },
        { key: 'm', label: 'Squarings', placeholder: '3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Best for real roots of different sizes."}
      resultLabel="Roots"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`x \\approx ${a.roots.join(', \\ ')}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
