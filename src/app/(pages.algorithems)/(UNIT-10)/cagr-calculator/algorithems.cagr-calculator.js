'use client';
// The live CAGR calculator. The maths is in src/app/utils/engines/cagr.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/cagr';

const EXAMPLES = [
  {
    label: "₹1 lakh → ₹2.5 lakh in 6 years",
    input: {
      start: "100000",
      end: "250000",
      years: "6",
      inflation: ""
    }
  },
  {
    label: "with 6% inflation",
    input: {
      start: "100000",
      end: "250000",
      years: "6",
      inflation: "6"
    }
  },
  {
    label: "sales 120 → 180 in 3 years",
    input: {
      start: "120",
      end: "180",
      years: "3",
      inflation: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="cagr" unit={10} title="CAGR Engine" button="Calculate"
      start={{
  start: "100000",
  end: "250000",
  years: "6",
  inflation: ""
}}
      fields={[
        { key: 'start', label: 'Starting value', placeholder: '100000' }, { key: 'end', label: 'Final value', placeholder: '250000' },
        { key: 'years', label: 'Years', placeholder: '6' }, { key: 'inflation', label: 'Inflation (% a year, optional)', placeholder: 'e.g. 6' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="CAGR is the steady yearly rate that gives the same growth."
      resultLabel="CAGR"
      renderResult={(a) => (<div className="space-y-1"><p className="text-2xl font-black font-mono"><InlineMath math={`\\text{CAGR} = ${a.cagr}`} /></p>{a.real && <p className="font-mono"><InlineMath math={`\\text{real return} = ${a.real}`} /></p>}<p className="text-sm">{a.growth}</p></div>)}
    />
  );
}
