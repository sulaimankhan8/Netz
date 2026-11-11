'use client';
// The live Horner's method calculator. The maths is in src/app/utils/engines/horner-method.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/horner-method';

const EXAMPLES = [
  {
    label: "x³ + 3x − 5",
    input: {
      coeffs: "1 0 3 -5",
      places: "3"
    }
  },
  {
    label: "x³ − 3x² − 5",
    input: {
      coeffs: "1 -3 0 -5",
      places: "4"
    }
  },
  {
    label: "x³ − 2x − 5",
    input: {
      coeffs: "1 0 -2 -5",
      places: "4"
    }
  },
  {
    label: "x⁴ − x − 10",
    input: {
      coeffs: "1 0 0 -1 -10",
      places: "3"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="horner-method" unit={1} title="Horner's Method Engine" button="Find Root"
      start={{
  coeffs: "1 0 3 -5",
  places: "3"
}}
      fields={[
        { key: 'coeffs', label: 'Coefficients, highest power first', placeholder: '1 0 3 -5', wide: true },
        { key: 'places', label: 'Decimal places', placeholder: '3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Finds the smallest positive root (or a negative one if there is none)."}
      resultLabel="Root"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`x \\approx ${a.root}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
