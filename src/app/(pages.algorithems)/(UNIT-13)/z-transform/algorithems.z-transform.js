'use client';
// The live Z-transform calculator. The maths is in src/app/utils/engines/z-transform.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/z-transform';

const EXAMPLES = [
  {
    label: "aⁿ: 2ⁿ",
    input: {
      x: "2^n"
    }
  },
  {
    label: "n",
    input: {
      x: "n"
    }
  },
  {
    label: "n²",
    input: {
      x: "n^2"
    }
  },
  {
    label: "n·2ⁿ",
    input: {
      x: "n 2^n"
    }
  },
  {
    label: "cos(nπ/2)",
    input: {
      x: "cos(n pi/2)"
    }
  },
  {
    label: "2ⁿ sin(nπ/3)",
    input: {
      x: "2^n sin(n pi/3)"
    }
  },
  {
    label: "(½)ⁿ + 3",
    input: {
      x: "(1/2)^n + 3"
    }
  },
  {
    label: "1/n!",
    input: {
      x: "1/n!"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="z-transform" unit={13} title="Z-Transform Engine" button="Transform"
      start={{
  x: "n 2^n"
}}
      fields={[
        { key: 'x', label: 'x(n), n ≥ 0', placeholder: 'n 2^n', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Use n. delta(n - 2) is the impulse, u(n) the unit step."}
      resultLabel="X(z)"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`X(z) = ${a.Ftex}`} /></div><div className="overflow-x-auto"><BlockMath math={a.roc > 0 ? `|z| > ${a.roc}` : '|z| > 0'} /></div></div>)}
    />
  );
}
