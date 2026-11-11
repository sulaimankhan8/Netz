'use client';
// The live Everett's formula calculator. The maths is in src/app/utils/engines/everett-interpolation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/everett-interpolation';

const EXAMPLES = [
  {
    label: "Classic table, x = 25",
    input: {
      x: "20 24 28 32",
      y: "2854 3162 3544 3992",
      at: "25"
    }
  },
  {
    label: "Cubes at 3.5",
    input: {
      x: "1 2 3 4 5 6",
      y: "1 8 27 64 125 216",
      at: "3.5"
    }
  },
  {
    label: "Six points",
    input: {
      x: "0 5 10 15 20 25",
      y: "7 11 14 18 24 32",
      at: "12"
    }
  },
  {
    label: "log table",
    input: {
      x: "310 320 330 340 350",
      y: "2.4914 2.5051 2.5185 2.5315 2.5441",
      at: "337.5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="everett-interpolation" unit={2} title="Everett's Formula Engine" button="Interpolate"
      start={{
  x: "20 24 28 32",
  y: "2854 3162 3544 3992",
  at: "25"
}}
      fields={[
        { key: 'x', label: 'x (equally spaced)', placeholder: '20 24 28 32', wide: true }, { key: 'y', label: 'y', placeholder: '2854 3162 3544 3992', wide: true },
        { key: 'at', label: 'Interpolate at x =', placeholder: '25' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Use a point inside the table; at least 4 values."}
      resultLabel="y"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`y \\approx ${a.y} \\quad (p = ${a.p})`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
