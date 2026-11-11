'use client';
// The live Chebyshev nodes calculator. The maths is in src/app/utils/engines/chebyshev-nodes.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/chebyshev-nodes';

const EXAMPLES = [
  {
    label: "Runge, n = 11",
    input: {
      f: "1/(1 + 25x^2)",
      a: "-1",
      b: "1",
      n: "11"
    }
  },
  {
    label: "Runge, n = 15",
    input: {
      f: "1/(1 + 25x^2)",
      a: "-1",
      b: "1",
      n: "15"
    }
  },
  {
    label: "|x|, n = 9",
    input: {
      f: "abs(x)",
      a: "-1",
      b: "1",
      n: "9"
    }
  },
  {
    label: "eˣ (both fine)",
    input: {
      f: "e^x",
      a: "0",
      b: "2",
      n: "6"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="chebyshev-nodes" unit={2} title="Chebyshev Nodes Engine" button="Compare"
      start={{
  f: "1/(1 + 25x^2)",
  a: "-1",
  b: "1",
  n: "11"
}}
      fields={[
        { key: 'f', label: 'f(x)', placeholder: '1/(1 + 25x^2)', wide: true },
        { key: 'a', label: 'a', placeholder: '-1' }, { key: 'b', label: 'b', placeholder: '1' }, { key: 'n', label: 'Nodes n', placeholder: '11' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"n from 2 to 30."}
      resultLabel="Largest errors"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`\\max|f - p|: \\ \\text{equal spacing } ${a.errEqual}, \\quad \\text{Chebyshev } ${a.errCheb}`} /></div>}
      renderSteps={(a) => (<div className="space-y-4"><div className="max-w-sm"><CoordPlot fn={a.plot.fn} fn2={a.plot.fn2} segments={a.plot.segments} points={a.plot.points} view={a.plot.view} /><p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">f, the Chebyshev interpolant (first curve) and the equally spaced one (second), with the Chebyshev nodes.</p></div><StepTable columns={a.table.columns} rows={a.table.rows} /></div>)}
    />
  );
}
