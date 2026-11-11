'use client';
// The live Cauchy–Riemann calculator. The maths is in src/app/utils/engines/cauchy-riemann.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/cauchy-riemann';

const EXAMPLES = [
  {
    label: "z² + 2z",
    input: {
      mode: "f",
      f: "z^2 + 2z"
    }
  },
  {
    label: "eᶻ",
    input: {
      mode: "f",
      f: "e^z"
    }
  },
  {
    label: "sin z",
    input: {
      mode: "f",
      f: "sin(z)"
    }
  },
  {
    label: "z̄ (not analytic)",
    input: {
      mode: "f",
      f: "conj(z)"
    }
  },
  {
    label: "|z|² (only at 0)",
    input: {
      mode: "f",
      f: "z conj(z)"
    }
  },
  {
    label: "u = eˣ cos y, v = eˣ sin y",
    input: {
      mode: "uv",
      u: "e^x cos(y)",
      v: "e^x sin(y)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="cauchy-riemann" unit={14} title="Analytic Function Checker" button="Check"
      start={{
  mode: "f",
  f: "z^2 + 2z",
  u: "x^2 - y^2",
  v: "2xy"
}}
      fields={[
        { key: 'mode', label: 'Give', kind: 'choice', options: [{ value: 'f', label: "f(z)" }, { value: 'uv', label: "u(x, y) and v(x, y)" }] },
        { key: 'f', label: 'f(z)', placeholder: 'z^2 + 2z', wide: true, show: (v) => v.mode === 'f' },
        { key: 'u', label: 'u(x, y)', placeholder: 'x^2 - y^2', show: (v) => v.mode === 'uv' }, { key: 'v', label: 'v(x, y)', placeholder: '2xy', show: (v) => v.mode === 'uv' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Use z (and i). For z̄ type conj(z); for |z| type abs(z)."}
      resultLabel={(a) => (a.analytic ? 'Analytic' : a.verdict === 'not analytic' ? 'Not analytic' : 'Not analytic (isolated points only)')}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`u = ${a.uTex}, \\quad v = ${a.vTex}`} /></div>{a.derivTex && <div className="overflow-x-auto"><BlockMath math={`f'(z) = ${a.derivTex}`} /></div>}</div>)}
    />
  );
}
