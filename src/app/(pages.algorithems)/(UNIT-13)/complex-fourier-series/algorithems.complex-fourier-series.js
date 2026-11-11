'use client';
// The live complex Fourier series calculator. The maths is in src/app/utils/engines/complex-fourier-series.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/complex-fourier-series';

const EXAMPLES = [
  {
    label: "f = x on (−π, π)",
    input: {
      f: "x",
      from: "-pi",
      to: "pi"
    }
  },
  {
    label: "Square wave",
    input: {
      f: "-1 for -pi < x < 0; 1 for 0 < x < pi",
      from: "-pi",
      to: "pi"
    }
  },
  {
    label: "f = x² on (−1, 1)",
    input: {
      f: "x^2",
      from: "-1",
      to: "1"
    }
  },
  {
    label: "f = eˣ on (−π, π)",
    input: {
      f: "e^x",
      from: "-pi",
      to: "pi"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="complex-fourier-series" unit={13} title="Complex Fourier Engine" button="Expand"
      start={{
  f: "x",
  from: "-pi",
  to: "pi"
}}
      fields={[
        { key: 'f', label: 'f(x) (one expression or pieces)', placeholder: 'x', wide: true },
        { key: 'from', label: 'From', placeholder: '-pi' }, { key: 'to', label: 'To', placeholder: 'pi' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Pieces like \"-1 for -pi < x < 0; 1 for 0 < x < pi\"."}
      resultLabel="cₙ"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={a.cn} /></div><div className="overflow-x-auto"><BlockMath math={`\\text{Parseval: } \\frac{1}{2L}\\int |f|^2\\,dx = \\sum |c_n|^2 = ${a.parseval}`} /></div></div>)}
    />
  );
}
