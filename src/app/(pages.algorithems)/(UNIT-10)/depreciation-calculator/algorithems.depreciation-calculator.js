'use client';
// The live depreciation calculator. The maths is in src/app/utils/engines/depreciation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/depreciation';

const EXAMPLES = [
  {
    label: "straight line: ₹1 lakh, ₹10,000, 5 years",
    input: {
      method: "sl",
      cost: "100000",
      salvage: "10000",
      life: "5"
    }
  },
  {
    label: "WDV at 20%",
    input: {
      method: "wdv",
      cost: "100000",
      salvage: "10000",
      life: "5",
      rate: "20"
    }
  },
  {
    label: "WDV exact rate",
    input: {
      method: "wdv",
      cost: "100000",
      salvage: "10000",
      life: "5",
      rate: ""
    }
  },
  {
    label: "sum of years' digits",
    input: {
      method: "syd",
      cost: "100000",
      salvage: "10000",
      life: "5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="depreciation" unit={10} title="Depreciation Engine" button="Make the Schedule"
      start={{
  method: "sl",
  cost: "100000",
  salvage: "10000",
  life: "5",
  rate: ""
}}
      fields={[
        { key: 'method', label: 'Method', kind: 'choice', options: [{ value: 'sl', label: 'Straight line' }, { value: 'wdv', label: 'Written-down value' }, { value: 'syd', label: "Sum of years' digits" }] },
        { key: 'cost', label: 'Cost', placeholder: '100000' }, { key: 'salvage', label: 'Salvage (scrap) value', placeholder: '10000' },
        { key: 'life', label: 'Useful life (years)', placeholder: '5' }, { key: 'rate', label: 'WDV rate (%; empty = exact rate)', placeholder: 'e.g. 20', show: (v) => v.method === 'wdv' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="All values in the same currency."
      resultLabel={(a) => `Book value after the last year: ${a.final}`}
      renderResult={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
