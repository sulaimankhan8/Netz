'use client';
// The live series solution calculator. The maths is in src/app/utils/engines/series-solution-ode.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/series-solution-ode';

const EXAMPLES = [
  {
    label: "y'' + y = 0",
    input: {
      eq: "y'' + y = 0",
      terms: "6"
    }
  },
  {
    label: "y'' + xy' + y = 0",
    input: {
      eq: "y'' + x y' + y = 0",
      terms: "6"
    }
  },
  {
    label: "Legendre n = 2",
    input: {
      eq: "(1 - x^2)y'' - 2x y' + 6y = 0",
      terms: "6"
    }
  },
  {
    label: "Airy y'' − xy = 0",
    input: {
      eq: "y'' - x y = 0",
      terms: "7"
    }
  },
  {
    label: "Frobenius 2x²y'' + xy' + xy = 0",
    input: {
      eq: "2x^2 y'' + x y' + x y = 0",
      terms: "5"
    }
  },
  {
    label: "Bessel ν = 0",
    input: {
      eq: "x^2 y'' + x y' + x^2 y = 0",
      terms: "6"
    }
  },
  {
    label: "Bessel ν = ½",
    input: {
      eq: "x^2 y'' + x y' + (x^2 - 1/4) y = 0",
      terms: "6"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="series-solution-ode" unit={12} title="Series Solution Engine" button="Solve"
      start={{
  eq: "(1 - x^2)y'' - 2x y' + 6y = 0",
  terms: "6"
}}
      fields={[
        { key: 'eq', label: 'Equation (= 0)', placeholder: "y'' + x y' + y = 0", wide: true },
        { key: 'terms', label: 'Up to xⁿ, n =', placeholder: '6' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Polynomial coefficients only; the expansion is about x = 0."}
      resultLabel={(a) => (a.kind === 'ordinary' ? 'Power series (ordinary point)' : 'Frobenius series')}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={a.general} /></div>{a.roots && <p className="font-mono">Indicial roots: <InlineMath math={a.roots.join(',\\ ')} /></p>}</div>)}
    />
  );
}
