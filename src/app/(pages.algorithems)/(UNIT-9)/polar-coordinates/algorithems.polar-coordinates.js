'use client';
// The live polar coordinates calculator. The maths is in src/app/utils/engines/polar-coordinates.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/polar-coordinates';

const EXAMPLES = [
  {
    label: "(−1, √3) → polar",
    input: {
      mode: "to-polar",
      x: "-1",
      y: "sqrt(3)"
    }
  },
  {
    label: "(4, 150°) → Cartesian",
    input: {
      mode: "to-cartesian",
      r: "4",
      theta: "150",
      unit: "deg"
    }
  },
  {
    label: "rotate (2, 4) by 45°",
    input: {
      mode: "rotate",
      x: "2",
      y: "4",
      theta: "45",
      unit: "deg"
    }
  },
  {
    label: "shift origin to (2, −1)",
    input: {
      mode: "translate",
      x: "5",
      y: "3",
      h: "2",
      k: "-1"
    }
  },
  {
    label: "r = 4 cos θ",
    input: {
      mode: "curve",
      curve: "r = 4cos(θ)"
    }
  },
  {
    label: "r = 3 sec θ",
    input: {
      mode: "curve",
      curve: "r = 3sec(θ)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="polar-coordinates" unit={9} title="Polar Coordinates Engine" button="Convert"
      start={{
  mode: "to-polar",
  x: "-1",
  y: "sqrt(3)",
  r: "4",
  theta: "150",
  unit: "deg",
  h: "2",
  k: "-1",
  curve: "r = 4cos(θ)"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'select', options: [{ value: 'to-polar', label: "Cartesian → polar" }, { value: 'to-cartesian', label: "Polar → Cartesian" }, { value: 'rotate', label: "Rotate the axes" }, { value: 'translate', label: "Shift the origin" }, { value: 'curve', label: "Polar curve → x–y equation" }] },
        { key: 'x', label: 'x', show: (v) => ['to-polar', 'rotate', 'translate'].includes(v.mode) }, { key: 'y', label: 'y', show: (v) => ['to-polar', 'rotate', 'translate'].includes(v.mode) },
        { key: 'r', label: 'r', show: (v) => v.mode === 'to-cartesian' },
        { key: 'theta', label: 'Angle θ', show: (v) => ['to-cartesian', 'rotate'].includes(v.mode) },
        { key: 'unit', label: 'Angle in', kind: 'choice', options: [{ value: 'deg', label: "Degrees" }, { value: 'rad', label: "Radians (use pi)" }], show: (v) => ['to-cartesian', 'rotate'].includes(v.mode) },
        { key: 'h', label: 'New origin h', show: (v) => v.mode === 'translate' }, { key: 'k', label: 'New origin k', show: (v) => v.mode === 'translate' },
        { key: 'curve', label: 'Curve', placeholder: 'r = 4cos(θ)', show: (v) => v.mode === 'curve', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Numbers like sqrt(3) or pi/6 are fine."
      resultLabel="Answer"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.answer} /></div>}
    />
  );
}
