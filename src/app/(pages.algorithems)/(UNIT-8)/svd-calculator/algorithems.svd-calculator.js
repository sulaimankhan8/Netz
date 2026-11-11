'use client';
// The live SVD calculator. The maths is in src/app/utils/engines/svd-calculator.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/svd-calculator';

const EXAMPLES = [
  {
    label: "[3 2 2; 2 3 −2]",
    input: {
      A: "3 2 2; 2 3 -2"
    }
  },
  {
    label: "[2 0; 0 3; 0 0]",
    input: {
      A: "2 0; 0 3; 0 0"
    }
  },
  {
    label: "Rank 1: [1 1; 1 1]",
    input: {
      A: "1 1; 1 1"
    }
  },
  {
    label: "[4 0; 3 −5]",
    input: {
      A: "4 0; 3 -5"
    }
  },
  {
    label: "3 × 3",
    input: {
      A: "1 0 1; -1 -2 0; 0 1 -1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="svd-calculator" unit={8} title="SVD Engine" button="Decompose"
      start={{
  A: "3 2 2; 2 3 -2"
}}
      fields={[
        { key: 'A', label: 'A (rows separated by ;)', placeholder: '3 2 2; 2 3 -2', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Up to 6 × 6."}
      resultLabel="A = UΣVᵀ"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\sigma = ${a.sigma.join(', ')}, \\quad \\text{rank } ${a.rank}`} /></div><div className="overflow-x-auto"><BlockMath math={`U = ${a.U}, \\quad \\Sigma = ${a.S}, \\quad V^T = ${a.Vt}`} /></div></div>)}
    />
  );
}
