'use client';
// The live NPV and IRR calculator. The maths is in src/app/utils/engines/npv-irr.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/npv-irr';

const EXAMPLES = [
  {
    label: "−10000, 3000, 4200, 6800 at 10%",
    input: {
      flows: "-10000, 3000, 4200, 6800",
      rate: "10"
    }
  },
  {
    label: "equal returns: −5000 then 4 × 1500",
    input: {
      flows: "-5000, 1500, 1500, 1500, 1500",
      rate: "8"
    }
  },
  {
    label: "a loss-making project",
    input: {
      flows: "-20000, 5000, 5000, 5000",
      rate: "12"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="npv-irr" unit={10} title="NPV / IRR Engine" button="Evaluate"
      start={{
  flows: "-10000, 3000, 4200, 6800",
  rate: "10"
}}
      fields={[
        { key: 'flows', label: 'Cash flows, year 0 first', placeholder: '-10000, 3000, 4200, 6800', wide: true },
        { key: 'rate', label: 'Discount rate (%)', placeholder: '10' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Year 0 is the initial outlay (negative)."
      resultLabel={(a) => (a.npvValue >= 0 ? 'Accept (NPV ≥ 0)' : 'Reject (NPV < 0)')}
      renderResult={(a) => (<div className="space-y-1"><p className="text-xl font-black font-mono">NPV = {a.npv}</p>{a.irr && <p className="font-mono">IRR = {a.irr}</p>}{a.payback !== null && <p className="text-sm">Payback {a.payback} years{a.dpayback !== null ? `; discounted payback ${a.dpayback} years` : ''}</p>}</div>)}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
