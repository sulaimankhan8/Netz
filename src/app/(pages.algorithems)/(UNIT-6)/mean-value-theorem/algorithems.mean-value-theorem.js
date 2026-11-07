'use client';
// The live Rolle's / mean value theorem calculator. The maths is in src/app/utils/engines/mean-value-theorem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/mean-value-theorem';

const EXAMPLES = [
  {
    label: "Rolle: x² − 4x + 3 on [1, 3]",
    input: {
      theorem: "rolle",
      f: "x^2 - 4x + 3",
      a: "1",
      b: "3"
    }
  },
  {
    label: "Rolle: sin x on [0, π]",
    input: {
      theorem: "rolle",
      f: "sin(x)",
      a: "0",
      b: "pi"
    }
  },
  {
    label: "MVT: x³ − 3x + 1 on [−2, 3]",
    input: {
      theorem: "lagrange",
      f: "x^3 - 3x + 1",
      a: "-2",
      b: "3"
    }
  },
  {
    label: "MVT: ln x on [1, e]",
    input: {
      theorem: "lagrange",
      f: "log(x)",
      a: "1",
      b: "e"
    }
  },
  {
    label: "MVT: √x on [1, 4]",
    input: {
      theorem: "lagrange",
      f: "sqrt(x)",
      a: "1",
      b: "4"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="mean-value-theorem" unit={6} title="Mean Value Theorem Engine" button="Find c"
      start={{theorem:"lagrange",f:"x^3 - 3x + 1",a:"-2",b:"3"}}
      fields={[
        { key: 'theorem', label: 'Theorem', kind: 'choice', options: [{ value: 'lagrange', label: 'Mean value (Lagrange)' }, { value: 'rolle', label: "Rolle's" }] },
        { key: 'f', label: 'f(x)', placeholder: 'e.g. x^2 - 4x + 3', wide: true },
        { key: 'a', label: 'a', placeholder: '1' },
        { key: 'b', label: 'b', placeholder: '3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The tangent at c (dashed in the graph) is parallel to the chord from a to b."
      resultLabel="Value(s) of c"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`c = ${a.c.join(',\\ ')}`} /></div>
          {a.plot && <CoordPlot fn={a.plot.fn} fn2={a.plot.fn2} shade={a.plot.shade} lines={a.plot.lines || []} points={a.plot.points || []} view={a.plot.view} />}
        </div>
      )}
    />
  );
}
