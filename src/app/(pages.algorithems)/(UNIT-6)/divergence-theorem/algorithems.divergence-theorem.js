'use client';
// The live divergence theorem calculator. The maths is in src/app/utils/engines/divergence-theorem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/divergence-theorem';

const EXAMPLES = [
  {
    label: "Unit cube: (4xz, −y², yz)",
    input: {
      P: "4x z",
      Q: "-y^2",
      R: "y z",
      region: "box",
      xlo: "0",
      xhi: "1",
      ylo: "0",
      yhi: "1",
      zlo: "0",
      zhi: "1"
    }
  },
  {
    label: "Sphere: (x, y, z)",
    input: {
      P: "x",
      Q: "y",
      R: "z",
      region: "sphere",
      a: "2"
    }
  },
  {
    label: "Sphere: (x³, y³, z³)",
    input: {
      P: "x^3",
      Q: "y^3",
      R: "z^3",
      region: "sphere",
      a: "1"
    }
  },
  {
    label: "Cylinder: (x, y, z²)",
    input: {
      P: "x",
      Q: "y",
      R: "z^2",
      region: "cylinder",
      a: "2",
      h: "3"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="divergence-theorem" unit={6} title="Divergence Theorem Engine" button="Verify"
      start={{
  P: "4x z",
  Q: "-y^2",
  R: "y z",
  region: "box",
  xlo: "0",
  xhi: "1",
  ylo: "0",
  yhi: "1",
  zlo: "0",
  zhi: "1",
  a: "2",
  h: "3"
}}
      fields={[
        { key: 'P', label: 'P (i part)', placeholder: 'x' }, { key: 'Q', label: 'Q (j part)', placeholder: 'y' }, { key: 'R', label: 'R (k part)', placeholder: 'z' },
        { key: 'region', label: 'Solid', kind: 'select', options: [{ value: 'box', label: "Box" }, { value: 'sphere', label: "Ball x² + y² + z² ≤ a²" }, { value: 'cylinder', label: "Cylinder x² + y² ≤ a², 0 ≤ z ≤ h" }] },
        { key: 'xlo', label: 'x from', placeholder: '0', show: (v) => v.region === 'box' }, { key: 'xhi', label: 'x to', placeholder: '1', show: (v) => v.region === 'box' }, { key: 'ylo', label: 'y from', placeholder: '0', show: (v) => v.region === 'box' }, { key: 'yhi', label: 'y to', placeholder: '1', show: (v) => v.region === 'box' }, { key: 'zlo', label: 'z from', placeholder: '0', show: (v) => v.region === 'box' }, { key: 'zhi', label: 'z to', placeholder: '1', show: (v) => v.region === 'box' },
        { key: 'a', label: 'Radius a', placeholder: '2', show: (v) => v.region !== 'box' }, { key: 'h', label: 'Height h', placeholder: '3', show: (v) => v.region === 'cylinder' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"n points out of the solid."}
      resultLabel="Both sides"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\iiint_V \\nabla\\cdot\\mathbf{F}\\,dV = ${a.volume}`} /></div><div className="overflow-x-auto"><BlockMath math={`\\oint\\!\\!\\oint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = ${a.surface}`} /></div></div>)}
    />
  );
}
