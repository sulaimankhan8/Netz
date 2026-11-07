'use client';
// The live nth derivative calculator. The maths is in src/app/utils/engines/nth-derivative.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/nth-derivative';

const EXAMPLES = [
  {
    label: "e^(2x) sin(3x)",
    input: {
      mode: "standard",
      f: "e^(2x) sin(3x)"
    }
  },
  {
    label: "1/((x − 1)(x − 2))",
    input: {
      mode: "standard",
      f: "1/((x - 1)(x - 2))"
    }
  },
  {
    label: "ln(2x + 3)",
    input: {
      mode: "standard",
      f: "log(2x + 3)"
    }
  },
  {
    label: "cos(4x + 1)",
    input: {
      mode: "standard",
      f: "cos(4x + 1)"
    }
  },
  {
    label: "Leibniz: x² e^(3x), n = 4",
    input: {
      mode: "leibniz",
      u: "x^2",
      v: "e^(3x)",
      n: "4"
    }
  },
  {
    label: "Leibniz: x³ sin x, n = 5",
    input: {
      mode: "leibniz",
      u: "x^3",
      v: "sin(x)",
      n: "5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="nth-derivative" unit={6} title="nth Derivative Engine" button="Find yₙ"
      start={{mode:"standard",f:"e^(2x) sin(3x)",u:"x^2",v:"e^(3x)",n:"4"}}
      fields={[
        { key: 'mode', label: 'Method', kind: 'choice', options: [{ value: 'standard', label: 'Standard formula' }, { value: 'leibniz', label: "Leibniz's theorem" }] },
        { key: 'f', label: 'y', placeholder: 'e.g. 1/((x - 1)(x - 2))', wide: true, show: (v) => v.mode === 'standard' },
        { key: 'u', label: 'u', placeholder: 'e.g. x^2', show: (v) => v.mode === 'leibniz' },
        { key: 'v', label: 'v', placeholder: 'e.g. e^(3x)', show: (v) => v.mode === 'leibniz' },
        { key: 'n', label: 'n', placeholder: '4', show: (v) => v.mode === 'leibniz' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Standard forms keep n as a letter. Leibniz needs a number n."
      resultLabel="nth derivative"
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`y = ${a.y} \\qquad y_{${a.mode === 'leibniz' ? a.n : 'n'}} = ${a.yn}`} /></div>}
    />
  );
}
