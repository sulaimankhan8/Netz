'use client';
// The live arc length calculator. The maths is in src/app/utils/engines/arc-length.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/arc-length';

const EXAMPLES = [
  {
    label: "y = x^(3/2), 0 to 4",
    input: {
      mode: "cartesian",
      f: "x^(3/2)",
      a: "0",
      b: "4"
    }
  },
  {
    label: "y = x²/8 − ln x, 1 to 4",
    input: {
      mode: "cartesian",
      f: "x^2/8 - log(x)",
      a: "1",
      b: "4"
    }
  },
  {
    label: "circle x = 2cos t, y = 2sin t",
    input: {
      mode: "parametric",
      xt: "2cos(t)",
      yt: "2sin(t)",
      a: "0",
      b: "2pi"
    }
  },
  {
    label: "cardioid r = 1 + cos θ",
    input: {
      mode: "polar",
      r: "1 + cos(θ)",
      a: "0",
      b: "2pi"
    }
  },
  {
    label: "surface: y = √x, 0 to 1",
    input: {
      mode: "surface",
      f: "sqrt(x)",
      a: "0",
      b: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="arc-length" unit={6} title="Arc Length Engine" button="Find the Length"
      start={{mode:"cartesian",f:"x^(3/2)",xt:"cos(t)^3",yt:"sin(t)^3",r:"1 + cos(θ)",a:"0",b:"4"}}
      fields={[
        { key: 'mode', label: 'Curve', kind: 'choice', options: [{ value: 'cartesian', label: 'y = f(x)' }, { value: 'parametric', label: 'Parametric' }, { value: 'polar', label: 'Polar r(θ)' }, { value: 'surface', label: 'Surface area (x-axis)' }] },
        { key: 'f', label: 'y = f(x)', placeholder: 'e.g. x^(3/2)', wide: true, show: (v) => v.mode === 'cartesian' || v.mode === 'surface' },
        { key: 'xt', label: 'x(t)', placeholder: 'e.g. cos(t)^3', show: (v) => v.mode === 'parametric' },
        { key: 'yt', label: 'y(t)', placeholder: 'e.g. sin(t)^3', show: (v) => v.mode === 'parametric' },
        { key: 'r', label: 'r(θ)', placeholder: 'e.g. 1 + cos(θ)', wide: true, show: (v) => v.mode === 'polar' },
        { key: 'a', label: 'From', placeholder: '0' },
        { key: 'b', label: 'To', placeholder: '4' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use t for parametric curves and θ (or theta) for polar ones; pi for π."
      resultLabel={(a) => (a.kind === 'S' ? 'Surface area' : 'Arc length')}
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`${a.kind} = ${a.valueTex}`} /></div>}
    />
  );
}
