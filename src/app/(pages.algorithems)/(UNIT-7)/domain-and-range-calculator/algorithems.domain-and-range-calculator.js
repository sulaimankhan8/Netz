'use client';
// The live domain and range calculator. The maths is in src/app/utils/engines/domain-range.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/domain-range';

const EXAMPLES = [
  {
    label: "√(x − 2)/(x − 5)",
    input: {
      mode: "domain",
      f: "sqrt(x - 2)/(x - 5)"
    }
  },
  {
    label: "(x + 1)/(x − 2)",
    input: {
      mode: "domain",
      f: "(x + 1)/(x - 2)"
    }
  },
  {
    label: "√(9 − x²)",
    input: {
      mode: "domain",
      f: "sqrt(9 - x^2)"
    }
  },
  {
    label: "ln(x² − 4)",
    input: {
      mode: "domain",
      f: "ln(x^2 - 4)"
    }
  },
  {
    label: "inverse of (2x + 3)/(x − 1)",
    input: {
      mode: "inverse",
      f: "(2x + 3)/(x - 1)"
    }
  },
  {
    label: "inverse of 3e^(2x) − 1",
    input: {
      mode: "inverse",
      f: "3e^(2x) - 1"
    }
  },
  {
    label: "f = x² + 1, g = √(x − 1)",
    input: {
      mode: "compose",
      f: "x^2 + 1",
      g: "sqrt(x - 1)"
    }
  },
  {
    label: "is x³ − sin x odd?",
    input: {
      mode: "parity",
      f: "x^3 - sin(x)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="domain-range" unit={7} title="Function Engine" button="Find"
      start={{
  mode: "domain",
  f: "sqrt(x - 2)/(x - 5)",
  g: "x^2 + 1"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'domain', label: "Domain & range" }, { value: 'inverse', label: "Inverse" }, { value: 'compose', label: "f∘g and g∘f" }, { value: 'parity', label: "Even or odd" }] },
        { key: 'f', label: 'f(x)', placeholder: 'sqrt(x - 2)/(x - 5)', wide: true },
        { key: 'g', label: 'g(x)', placeholder: 'x^2 + 1', wide: true, show: (v) => v.mode === 'compose' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use x, ^ for powers, sqrt( ) and ln( )."
      resultLabel={(a) => (a.domainTex ? 'Domain and range' : a.inverseTex ? 'Inverse' : a.fgTex ? 'Compositions' : 'Even or odd?')}
      renderResult={(a) => (<div className="space-y-1 min-w-0">{a.domainTex && <div className="overflow-x-auto"><BlockMath math={`D_f = ${a.domainTex}`} /></div>}{a.rangeTex && <div className="overflow-x-auto"><BlockMath math={`R_f = ${a.rangeTex}`} /></div>}{a.inverseTex && <div className="overflow-x-auto"><BlockMath math={a.inverseTex} /></div>}{a.fgTex && <div className="overflow-x-auto"><BlockMath math={`(f \\circ g)(x) = ${a.fgTex}, \\quad (g \\circ f)(x) = ${a.gfTex}`} /></div>}{a.parity && <p className="text-2xl font-black">f is {a.parity}</p>}</div>)}
    />
  );
}
