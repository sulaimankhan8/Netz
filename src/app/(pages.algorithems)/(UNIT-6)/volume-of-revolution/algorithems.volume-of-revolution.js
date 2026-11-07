'use client';
// The live volume of revolution calculator. The maths is in src/app/utils/engines/volume-revolution.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/volume-revolution';

const EXAMPLES = [
  {
    label: "y = √x, 0 to 4, x-axis",
    input: {
      f: "sqrt(x)",
      g: "",
      a: "0",
      b: "4",
      axis: "x"
    }
  },
  {
    label: "between y = x and y = x², x-axis",
    input: {
      f: "x",
      g: "x^2",
      a: "",
      b: "",
      axis: "x"
    }
  },
  {
    label: "y = x², 0 to 2, y-axis (shells)",
    input: {
      f: "x^2",
      g: "",
      a: "0",
      b: "2",
      axis: "y"
    }
  },
  {
    label: "sphere: y = √(9 − x²)",
    input: {
      f: "sqrt(9 - x^2)",
      g: "",
      a: "-3",
      b: "3",
      axis: "x"
    }
  },
  {
    label: "y = x², 0 to 1, about y = −1",
    input: {
      f: "x^2",
      g: "",
      a: "0",
      b: "1",
      axis: "y=k",
      k: "-1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="volume-revolution" unit={6} title="Volume of Revolution Engine" button="Find the Volume"
      start={{f:"sqrt(x)",g:"",a:"0",b:"4",axis:"x",k:"0"}}
      fields={[
        { key: 'axis', label: 'Turn about', kind: 'choice', options: [{ value: 'x', label: 'x-axis' }, { value: 'y', label: 'y-axis' }, { value: 'y=k', label: 'y = k' }, { value: 'x=k', label: 'x = k' }] },
        { key: 'f', label: 'Top curve y = f(x)', placeholder: 'e.g. sqrt(x)' },
        { key: 'g', label: 'Bottom curve y = g(x) (optional)', placeholder: '0 if empty' },
        { key: 'a', label: 'From x = (optional)', placeholder: 'where they meet' },
        { key: 'b', label: 'To x = (optional)', placeholder: 'where they meet' },
        { key: 'k', label: 'k', placeholder: '0', show: (v) => v.axis === 'y=k' || v.axis === 'x=k' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="About the x-axis (or y = k) the washer method is used; about the y-axis (or x = k), shells."
      resultLabel="Volume"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`V = ${a.V}`} /></div>
          {a.plot && <CoordPlot fn={a.plot.fn} fn2={a.plot.fn2} shade={a.plot.shade} lines={a.plot.lines || []} points={a.plot.points || []} view={a.plot.view} />}
        </div>
      )}
    />
  );
}
