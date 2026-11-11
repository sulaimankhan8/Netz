'use client';
// The live control chart calculator. The maths is in src/app/utils/engines/control-charts.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/control-charts';

const EXAMPLES = [
  {
    label: "x̄–R, 5 subgroups of 5",
    input: {
      chart: "xbar",
      data: "10 12 11 13 12; 11 13 12 12 14; 12 11 13 12 13; 13 14 12 11 12; 12 12 13 14 11",
      n: ""
    }
  },
  {
    label: "p chart (one sample out)",
    input: {
      chart: "p",
      data: "4 6 3 8 5 2 7 15",
      n: "100"
    }
  },
  {
    label: "c chart",
    input: {
      chart: "c",
      data: "2 3 5 1 4 12 3 2",
      n: ""
    }
  },
  {
    label: "x̄–R with a shift",
    input: {
      chart: "xbar",
      data: "5 6 5 7; 6 5 6 6; 5 5 7 6; 9 10 9 11; 6 6 5 5",
      n: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="control-charts" unit={5} title="Control Chart Engine" button="Chart"
      start={{
  chart: "xbar",
  data: "10 12 11 13 12; 11 13 12 12 14; 12 11 13 12 13; 13 14 12 11 12; 12 12 13 14 11",
  n: ""
}}
      fields={[
        { key: 'chart', label: 'Chart', kind: 'choice', options: [{ value: 'xbar', label: "x̄ and R" }, { value: 'p', label: "p (defectives)" }, { value: 'c', label: "c (defects)" }] },
        { key: 'data', label: 'Data (x̄–R: one subgroup per row, rows separated by ;)', placeholder: '10 12 11 13 12; 11 13 12 12 14', wide: true },
        { key: 'n', label: 'Sample size n', placeholder: '100', show: (v) => v.chart === 'p' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"x̄–R subgroups need 2 to 10 values each."}
      resultLabel={(a) => (a.inControl ? 'In control' : 'Out of control')}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`\\text{CL} = ${a.limits.cl}, \\quad \\text{UCL} = ${a.limits.ucl}, \\quad \\text{LCL} = ${a.limits.lcl}`} /></div>}
      renderSteps={(a) => (<div className="grid gap-4 sm:grid-cols-2"><div className="max-w-sm"><CoordPlot points={a.plot.points} segments={a.plot.segments} view={a.plot.view} /><p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">The chart: the points, the centre line and the two control limits.</p></div>{a.plot2 && <div className="max-w-sm"><CoordPlot points={a.plot2.points} segments={a.plot2.segments} view={a.plot2.view} /><p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">The R chart.</p></div>}</div>)}
    />
  );
}
