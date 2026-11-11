'use client';
// The live harmonic conjugate calculator. The maths is in src/app/utils/engines/harmonic-conjugate.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/harmonic-conjugate';

const EXAMPLES = [
  {
    label: "u = x³ − 3xy²",
    input: {
      given: "u",
      w: "x^3 - 3x y^2"
    }
  },
  {
    label: "u = x² − y² + 2x",
    input: {
      given: "u",
      w: "x^2 - y^2 + 2x"
    }
  },
  {
    label: "u = eˣ cos y",
    input: {
      given: "u",
      w: "e^x cos(y)"
    }
  },
  {
    label: "u = sin x cosh y",
    input: {
      given: "u",
      w: "sin(x) cosh(y)"
    }
  },
  {
    label: "v = 2xy (find u)",
    input: {
      given: "v",
      w: "2xy"
    }
  },
  {
    label: "u = x² + y² (not harmonic)",
    input: {
      given: "u",
      w: "x^2 + y^2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="harmonic-conjugate" unit={14} title="Harmonic Conjugate Engine" button="Find"
      start={{
  given: "u",
  w: "x^3 - 3x y^2"
}}
      fields={[
        { key: 'given', label: 'You know', kind: 'choice', options: [{ value: 'u', label: "u (find v)" }, { value: 'v', label: "v (find u)" }] },
        { key: 'w', label: 'The function of x and y', placeholder: 'x^3 - 3x y^2', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Type xy for x·y."}
      resultLabel={(a) => (a.harmonic ? 'f(z) and the conjugate' : 'Not harmonic')}
      renderResult={(a) => (a.harmonic ? <div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`f(z) = ${a.fTex} + C`} /></div><div className="overflow-x-auto"><BlockMath math={`\\text{conjugate} = ${a.otherTex}`} /></div></div> : <p className="font-mono">The Laplacian is not zero.</p>)}
    />
  );
}
