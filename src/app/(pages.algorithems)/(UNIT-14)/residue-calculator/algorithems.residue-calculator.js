'use client';
// The live residue calculator. The maths is in src/app/utils/engines/residues.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/residues';

const EXAMPLES = [
  {
    label: "(z − 3)/(z² + 2z + 5), |z| = 3",
    input: {
      f: "(z - 3)/(z^2 + 2z + 5)",
      center: "0",
      radius: "3"
    }
  },
  {
    label: "1/(z² + 1), |z − i| = 1",
    input: {
      f: "1/(z^2 + 1)",
      center: "i",
      radius: "1"
    }
  },
  {
    label: "eᶻ/(z − 1)²",
    input: {
      f: "e^z/(z - 1)^2",
      center: "0",
      radius: "2"
    }
  },
  {
    label: "z/((z − 1)(z − 2)²)",
    input: {
      f: "z/((z - 1)(z - 2)^2)",
      center: "0",
      radius: "3"
    }
  },
  {
    label: "cos z/z³",
    input: {
      f: "cos(z)/z^3",
      center: "0",
      radius: "1"
    }
  },
  {
    label: "1/(z⁴ + 1)",
    input: {
      f: "1/(z^4 + 1)",
      center: "",
      radius: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="residues" unit={14} title="Residue Engine" button="Find Residues"
      start={{
  f: "(z - 3)/(z^2 + 2z + 5)",
  center: "0",
  radius: "3"
}}
      fields={[
        { key: 'f', label: 'f(z)', placeholder: '(z - 3)/(z^2 + 2z + 5)', wide: true },
        { key: 'center', label: 'Circle centre z₀ (optional)', placeholder: '0' }, { key: 'radius', label: 'Radius r (optional)', placeholder: 'e.g. 3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Leave the circle empty to list the residues only."}
      resultLabel={(a) => (a.integral ? 'Residues and ∮ f dz' : 'Residues')}
      renderResult={(a) => (<div className="space-y-1 min-w-0">{a.poles.map((p, i) => <div key={i} className="overflow-x-auto"><BlockMath math={`\\operatorname{Res}_{z = ${p.a}} = ${p.res}`} /></div>)}{a.integral && <div className="overflow-x-auto"><BlockMath math={`\\oint_C f(z)\\,dz = ${a.integral}`} /></div>}</div>)}
      renderSteps={(a) => a.plot && (a.plot.points.length > 0 || a.plot.segments.length > 0) && <div className="max-w-sm"><CoordPlot points={a.plot.points} segments={a.plot.segments} view={a.plot.view} /><p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">The complex plane: poles as points, the contour as the circle.</p></div>}
    />
  );
}
