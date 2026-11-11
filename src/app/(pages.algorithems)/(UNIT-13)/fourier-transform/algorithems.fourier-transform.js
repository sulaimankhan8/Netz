'use client';
// The live Fourier transform calculator. The maths is in src/app/utils/engines/fourier-transform.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/fourier-transform';

const EXAMPLES = [
  {
    label: "1 for |x| < 1",
    input: {
      mode: "complex",
      f: "1 for |x| < 1"
    }
  },
  {
    label: "1 − x² for |x| < 1",
    input: {
      mode: "complex",
      f: "1 - x^2 for |x| < 1"
    }
  },
  {
    label: "e^(−|x|)",
    input: {
      mode: "complex",
      f: "e^(-|x|)"
    }
  },
  {
    label: "e^(−x²)",
    input: {
      mode: "complex",
      f: "e^(-x^2)"
    }
  },
  {
    label: "sine: e^(−x)",
    input: {
      mode: "sine",
      f: "e^(-x)"
    }
  },
  {
    label: "cosine: 1 for 0 < x < 2",
    input: {
      mode: "cosine",
      f: "1 for 0 < x < 2"
    }
  },
  {
    label: "sine: x e^(−x)",
    input: {
      mode: "sine",
      f: "x e^(-x)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="fourier-transform" unit={13} title="Fourier Transform Engine" button="Transform"
      start={{
  mode: "complex",
  f: "1 for |x| < 1"
}}
      fields={[
        { key: 'mode', label: 'Transform', kind: 'choice', options: [{ value: 'complex', label: "Complex F(ω)" }, { value: 'sine', label: "Sine Fₛ(ω)" }, { value: 'cosine', label: "Cosine F꜀(ω)" }] },
        { key: 'f', label: 'f(x) (zero outside the pieces)', placeholder: '1 for |x| < 1', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Pieces like \"x for 0 < x < 1; 2 - x for 1 < x < 2\". Use inf for ∞. Sine and cosine transforms use x > 0."}
      resultLabel={(a) => ({ complex: 'F(ω)', sine: 'Fₛ(ω)', cosine: 'F꜀(ω)' }[a.mode])}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`${a.mode === 'complex' ? 'F' : a.mode === 'sine' ? 'F_s' : 'F_c'}(\\omega) = ${a.Ftex}`} /></div>}
      renderSteps={(a) => a.plot && a.plot.segments.length > 0 && <div className="max-w-sm"><CoordPlot points={a.plot.points} segments={a.plot.segments} view={a.plot.view} /><p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">{a.mode === 'complex' ? 'The amplitude |F(ω)| for −8 ≤ ω ≤ 8.' : 'The transform for −8 ≤ ω ≤ 8.'}</p></div>}
    />
  );
}
