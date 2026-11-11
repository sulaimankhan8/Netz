'use client';
// The live line integral calculator. The maths is in src/app/utils/engines/line-integral.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/line-integral';

const EXAMPLES = [
  {
    label: "Work along x = t, y = t², z = t³",
    input: {
      mode: "work",
      P: "3x^2 + 6y",
      Q: "-14yz",
      R: "20xz^2",
      path: "x = t, y = t^2, z = t^3",
      t0: "0",
      t1: "1"
    }
  },
  {
    label: "Round the unit circle: (−y, x)",
    input: {
      mode: "work",
      P: "-y",
      Q: "x",
      R: "",
      path: "x = cos(t), y = sin(t)",
      t0: "0",
      t1: "2pi"
    }
  },
  {
    label: "Round a square",
    input: {
      mode: "work",
      P: "x^2",
      Q: "xy",
      R: "",
      path: "(0,0) -> (1,0) -> (1,1) -> (0,1) -> (0,0)",
      t0: "0",
      t1: "1"
    }
  },
  {
    label: "Conservative: (yz, xz, xy)",
    input: {
      mode: "work",
      P: "y z",
      Q: "x z",
      R: "x y",
      path: "x = t, y = t^2, z = t^3",
      t0: "0",
      t1: "1"
    }
  },
  {
    label: "Helix length",
    input: {
      mode: "scalar",
      f: "",
      path: "x = cos(t), y = sin(t), z = t",
      t0: "0",
      t1: "2pi"
    }
  },
  {
    label: "∫(x + y) ds round a triangle",
    input: {
      mode: "scalar",
      f: "x + y",
      path: "(0,0) -> (1,0) -> (0,1) -> (0,0)",
      t0: "0",
      t1: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="line-integral" unit={6} title="Line Integral Engine" button="Integrate"
      start={{
  mode: "work",
  P: "3x^2 + 6y",
  Q: "-14yz",
  R: "20xz^2",
  f: "",
  path: "x = t, y = t^2, z = t^3",
  t0: "0",
  t1: "1"
}}
      fields={[
        { key: 'mode', label: 'Integral', kind: 'choice', options: [{ value: 'work', label: "Work ∫F·dr" }, { value: 'scalar', label: "∫f ds" }] },
        { key: 'P', label: 'P (i part)', placeholder: 'x', show: (v) => v.mode === 'work' }, { key: 'Q', label: 'Q (j part)', placeholder: 'y', show: (v) => v.mode === 'work' }, { key: 'R', label: 'R (k part)', placeholder: 'z', show: (v) => v.mode === 'work' },
        { key: 'f', label: 'f(x, y, z) (empty: arc length)', placeholder: 'x + y', show: (v) => v.mode === 'scalar' },
        { key: 'path', label: 'Path: x = …, y = …, z = … in t, or points (0,0) -> (1,0) -> (1,1)', placeholder: 'x = cos(t), y = sin(t)', wide: true },
        { key: 't0', label: 't from', placeholder: '0' }, { key: 't1', label: 't to', placeholder: '2pi' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"A polyline ignores the t range (each segment uses 0 ≤ t ≤ 1)."}
      resultLabel={(a) => (a.mode === 'work' ? 'Work done' : '∫ f ds')}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.mode === 'work' ? `W = ${a.value}` : `\\int_C f\\,ds = ${a.value}`} /></div>}
    />
  );
}
