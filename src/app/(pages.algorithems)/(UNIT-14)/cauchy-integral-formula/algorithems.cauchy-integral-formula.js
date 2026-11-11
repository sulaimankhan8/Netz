'use client';
// The live Cauchy integral formula calculator. The maths is in src/app/utils/engines/cauchy-integral.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/cauchy-integral';

const EXAMPLES = [
  {
    label: "eᶻ/(z − 1), |z| = 2",
    input: {
      f: "e^z/(z - 1)",
      center: "0",
      radius: "2"
    }
  },
  {
    label: "e²ᶻ/(z + 1)⁴, |z| = 3",
    input: {
      f: "e^(2z)/(z + 1)^4",
      center: "0",
      radius: "3"
    }
  },
  {
    label: "sin πz/(z − ½)³",
    input: {
      f: "sin(pi z)/(z - 1/2)^3",
      center: "0",
      radius: "1"
    }
  },
  {
    label: "(z² + 1)/(z² − 1), |z − 1| = 1",
    input: {
      f: "(z^2 + 1)/(z^2 - 1)",
      center: "1",
      radius: "1"
    }
  },
  {
    label: "cos z/(z² + 1), |z| = 2",
    input: {
      f: "cos(z)/(z^2 + 1)",
      center: "0",
      radius: "2"
    }
  },
  {
    label: "outside: 1/(z − 5)",
    input: {
      f: "1/(z - 5)",
      center: "0",
      radius: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="cauchy-integral" unit={14} title="Cauchy Integral Engine" button="Integrate"
      start={{
  f: "e^(2z)/(z + 1)^4",
  center: "0",
  radius: "3"
}}
      fields={[
        { key: 'f', label: 'Integrand f(z)', placeholder: 'e^(2z)/(z + 1)^4', wide: true },
        { key: 'center', label: 'Circle centre z₀', placeholder: '0' }, { key: 'radius', label: 'Radius r', placeholder: '3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"C is the circle |z − z₀| = r, taken once anticlockwise."}
      resultLabel="∮ f(z) dz"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`\\oint_C ${a.fTex}\\,dz = ${a.value}`} /></div>}
      renderSteps={(a) => a.plot && (a.plot.points.length > 0 || a.plot.segments.length > 0) && <div className="max-w-sm"><CoordPlot points={a.plot.points} segments={a.plot.segments} view={a.plot.view} /><p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">The complex plane: poles as points, the contour as the circle.</p></div>}
    />
  );
}
