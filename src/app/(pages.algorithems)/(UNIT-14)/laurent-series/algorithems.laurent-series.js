'use client';
// The live Laurent series calculator. The maths is in src/app/utils/engines/laurent-series.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/laurent-series';

const EXAMPLES = [
  {
    label: "1/((z−1)(z−2)), |z| < 1",
    input: {
      f: "1/((z - 1)(z - 2))",
      center: "0",
      radius: "0.5"
    }
  },
  {
    label: "1 < |z| < 2",
    input: {
      f: "1/((z - 1)(z - 2))",
      center: "0",
      radius: "1.5"
    }
  },
  {
    label: "|z| > 2",
    input: {
      f: "1/((z - 1)(z - 2))",
      center: "0",
      radius: "3"
    }
  },
  {
    label: "1/(z(z−1)) about 1",
    input: {
      f: "1/(z(z - 1))",
      center: "1",
      radius: "0.5"
    }
  },
  {
    label: "eᶻ/z²",
    input: {
      f: "e^z/z^2",
      center: "0",
      radius: ""
    }
  },
  {
    label: "sin z/z³",
    input: {
      f: "sin(z)/z^3",
      center: "0",
      radius: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="laurent-series" unit={14} title="Laurent Series Engine" button="Expand"
      start={{
  f: "1/((z - 1)(z - 2))",
  center: "0",
  radius: "1.5"
}}
      fields={[
        { key: 'f', label: 'f(z)', placeholder: '1/((z - 1)(z - 2))', wide: true },
        { key: 'center', label: 'About z₀', placeholder: '0' }, { key: 'radius', label: 'Region: |z − z₀| = r for some r (optional)', placeholder: 'e.g. 1.5' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"r picks the ring between the poles: any r strictly between two pole distances."}
      resultLabel={(a) => a.kind}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`f(z) = ${a.series}`} /></div><div className="overflow-x-auto"><BlockMath math={a.region} /></div>{a.residue && <div className="overflow-x-auto"><BlockMath math={`\\operatorname{Res} = ${a.residue}`} /></div>}</div>)}
    />
  );
}
