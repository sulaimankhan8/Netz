'use client';
// The live Markov chain calculator. The maths is in src/app/utils/engines/markov-chain.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/markov-chain';

const EXAMPLES = [
  {
    label: "Weather: 0.7 0.3 / 0.4 0.6",
    input: {
      P: "0.7 0.3; 0.4 0.6",
      start: "1 0",
      n: "3"
    }
  },
  {
    label: "Brand switching (3 states)",
    input: {
      P: "0.8 0.1 0.1; 0.2 0.7 0.1; 0.1 0.2 0.7",
      start: "0.4 0.3 0.3",
      n: "2"
    }
  },
  {
    label: "Fractions: 1/2 off the diagonal",
    input: {
      P: "0 1/2 1/2; 1/2 0 1/2; 1/2 1/2 0",
      start: "1 0 0",
      n: "4"
    }
  },
  {
    label: "Absorbing state",
    input: {
      P: "1 0; 0.3 0.7",
      start: "0 1",
      n: "5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="markov-chain" unit={5} title="Markov Chain Engine" button="Compute"
      start={{
  P: "0.7 0.3; 0.4 0.6",
  start: "1 0",
  n: "3"
}}
      fields={[
        { key: 'P', label: 'Transition matrix P (rows separated by ;)', placeholder: '0.7 0.3; 0.4 0.6', wide: true },
        { key: 'start', label: 'Starting distribution (optional)', placeholder: '1 0' }, { key: 'n', label: 'Steps n', placeholder: '3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Each row of P adds to 1."}
      resultLabel="Distributions"
      renderResult={(a) => (<div className="space-y-1 min-w-0">{a.dist && <div className="overflow-x-auto"><BlockMath math={`\\pi^{(n)} = (${a.dist.join(',\\ ')})`} /></div>}{a.pi && <div className="overflow-x-auto"><BlockMath math={`\\text{steady state } \\pi = (${a.pi.join(',\\ ')})`} /></div>}</div>)}
    />
  );
}
