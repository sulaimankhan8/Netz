'use client';
// The live surface integral calculator. The maths is in src/app/utils/engines/surface-integral.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/surface-integral';

const EXAMPLES = [
  {
    label: "Flux of (x, y, z) out of a sphere",
    input: {
      mode: "flux",
      P: "x",
      Q: "y",
      R: "z",
      surface: "sphere",
      a: "2"
    }
  },
  {
    label: "Flux of z k up the hemisphere",
    input: {
      mode: "flux",
      P: "",
      Q: "",
      R: "z",
      surface: "hemisphere",
      a: "1"
    }
  },
  {
    label: "Flux through x + y + z = 1",
    input: {
      mode: "flux",
      P: "y",
      Q: "x",
      R: "z",
      surface: "graph",
      g: "1 - x - y",
      xlo: "0",
      xhi: "1",
      ylo: "0",
      yhi: "1 - x"
    }
  },
  {
    label: "Area of a sphere",
    input: {
      mode: "scalar",
      f: "",
      surface: "sphere",
      a: "3"
    }
  },
  {
    label: "∬ z dS on the hemisphere",
    input: {
      mode: "scalar",
      f: "z",
      surface: "hemisphere",
      a: "1"
    }
  },
  {
    label: "Volume of a ball",
    input: {
      mode: "volume",
      f: "",
      region: "sphere",
      a: "2"
    }
  },
  {
    label: "∭ xyz over a box",
    input: {
      mode: "volume",
      f: "x y z",
      region: "box",
      xlo: "0",
      xhi: "1",
      ylo: "0",
      yhi: "2",
      zlo: "0",
      zhi: "3"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="surface-integral" unit={6} title="Surface Integral Engine" button="Integrate"
      start={{
  mode: "flux",
  P: "x",
  Q: "y",
  R: "z",
  f: "",
  surface: "sphere",
  g: "1 - x - y",
  xlo: "0",
  xhi: "1",
  ylo: "0",
  yhi: "1 - x",
  a: "2",
  h: "3",
  region: "box",
  zlo: "0",
  zhi: "1"
}}
      fields={[
        { key: 'mode', label: 'Integral', kind: 'choice', options: [{ value: 'flux', label: "Flux ∬F·n dS" }, { value: 'scalar', label: "∬f dS" }, { value: 'volume', label: "Volume ∭f dV" }] },
        { key: 'P', label: 'P (i part)', placeholder: 'x', show: (v) => v.mode === 'flux' }, { key: 'Q', label: 'Q (j part)', placeholder: 'y', show: (v) => v.mode === 'flux' }, { key: 'R', label: 'R (k part)', placeholder: 'z', show: (v) => v.mode === 'flux' },
        { key: 'f', label: 'f(x, y, z) (empty: 1)', placeholder: 'z', show: (v) => v.mode !== 'flux' },
        { key: 'surface', label: 'Surface', kind: 'select', options: [{ value: 'graph', label: "z = g(x, y)" }, { value: 'sphere', label: "Sphere" }, { value: 'hemisphere', label: "Upper hemisphere" }, { value: 'cylinder', label: "Cylinder side" }, { value: 'disc', label: "Disc z = h" }], show: (v) => v.mode !== 'volume' },
        { key: 'g', label: 'z = g(x, y)', placeholder: '1 - x - y', show: (v) => v.mode !== 'volume' && v.surface === 'graph' },
        { key: 'region', label: 'Solid', kind: 'select', options: [{ value: 'box', label: "Box" }, { value: 'sphere', label: "Ball x² + y² + z² ≤ a²" }, { value: 'cylinder', label: "Cylinder" }, { value: 'limits', label: "z, y, x limits" }], show: (v) => v.mode === 'volume' },
        { key: 'xlo', label: 'x from', placeholder: '0', show: (v) => (v.mode !== 'volume' && v.surface === 'graph') || (v.mode === 'volume' && ['box', 'limits'].includes(v.region)) },
        { key: 'xhi', label: 'x to', placeholder: '1', show: (v) => (v.mode !== 'volume' && v.surface === 'graph') || (v.mode === 'volume' && ['box', 'limits'].includes(v.region)) },
        { key: 'ylo', label: 'y from (may use x)', placeholder: '0', show: (v) => (v.mode !== 'volume' && v.surface === 'graph') || (v.mode === 'volume' && ['box', 'limits'].includes(v.region)) },
        { key: 'yhi', label: 'y to (may use x)', placeholder: '1 - x', show: (v) => (v.mode !== 'volume' && v.surface === 'graph') || (v.mode === 'volume' && ['box', 'limits'].includes(v.region)) },
        { key: 'zlo', label: 'z from', placeholder: '0', show: (v) => v.mode === 'volume' && ['box', 'limits'].includes(v.region) },
        { key: 'zhi', label: 'z to', placeholder: '1', show: (v) => v.mode === 'volume' && ['box', 'limits'].includes(v.region) },
        { key: 'a', label: 'Radius a', placeholder: '2', show: (v) => (v.mode !== 'volume' && v.surface !== 'graph') || (v.mode === 'volume' && ['sphere', 'cylinder'].includes(v.region)) },
        { key: 'h', label: 'Height h', placeholder: '3', show: (v) => (v.mode !== 'volume' && ['cylinder', 'disc'].includes(v.surface)) || (v.mode === 'volume' && v.region === 'cylinder') },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Normals point outward (or upward for z = g and discs)."}
      resultLabel={(a) => ({ flux: 'Flux', scalar: 'Surface integral', volume: 'Volume integral' }[a.mode])}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.mode === 'flux' ? `\\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = ${a.value}` : a.mode === 'scalar' ? `\\iint_S f\\,dS = ${a.value}` : `\\iiint_V f\\,dV = ${a.value}`} /></div>}
    />
  );
}
