'use client';
// The live 3D geometry calculator. The maths is in src/app/utils/engines/geometry-3d.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/geometry-3d';

const EXAMPLES = [
  {
    label: "direction cosines (1,2,3) → (3,5,9)",
    input: {
      mode: "dc",
      p: "1, 2, 3",
      q: "3, 5, 9"
    }
  },
  {
    label: "line through two points",
    input: {
      mode: "line",
      p: "1, -2, 3",
      q: "4, 1, 5"
    }
  },
  {
    label: "plane through 3 points",
    input: {
      mode: "plane",
      p: "1, 1, 1",
      q: "2, 3, 4",
      s: "3, 1, 2"
    }
  },
  {
    label: "distance (2,1,−1) to 2x + y − 2z = 5",
    input: {
      mode: "point-plane",
      p: "2, 1, -1",
      plane: "2x + y - 2z = 5"
    }
  },
  {
    label: "angle between planes",
    input: {
      mode: "angle-planes",
      plane: "2x - y + z = 6",
      plane2: "x + y + 2z = 7"
    }
  },
  {
    label: "shortest distance, skew lines",
    input: {
      mode: "skew",
      p: "1, 2, 3",
      d1: "2, 3, 4",
      q: "2, 4, 5",
      d2: "3, 4, 5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="geometry-3d" unit={9} title="3D Geometry Engine" button="Calculate"
      start={{
  mode: "skew",
  p: "1, 2, 3",
  q: "2, 4, 5",
  s: "3, 1, 2",
  d1: "2, 3, 4",
  d2: "3, 4, 5",
  plane: "2x + y - 2z = 5",
  plane2: "x + y + 2z = 7"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'select', options: [{ value: 'dc', label: "Direction cosines of PQ" }, { value: 'line', label: "Line through P and Q" }, { value: 'plane', label: "Plane through P, Q, S" }, { value: 'point-plane', label: "Distance from P to a plane" }, { value: 'angle-lines', label: "Angle between two lines" }, { value: 'angle-planes', label: "Angle between two planes" }, { value: 'line-plane', label: "Angle between a line and a plane" }, { value: 'skew', label: "Shortest distance between two lines" }] },
        { key: 'p', label: 'P (for two lines: a point on line 1; Q is on line 2)', show: (v) => ['dc', 'line', 'plane', 'point-plane', 'skew'].includes(v.mode) },
        { key: 'q', label: 'Q', show: (v) => ['dc', 'line', 'plane', 'skew'].includes(v.mode) },
        { key: 's', label: 'S', show: (v) => v.mode === 'plane' },
        { key: 'd1', label: 'Direction d₁', show: (v) => ['angle-lines', 'line-plane', 'skew'].includes(v.mode) },
        { key: 'd2', label: 'Direction d₂', show: (v) => ['angle-lines', 'skew'].includes(v.mode) },
        { key: 'plane', label: 'Plane', placeholder: '2x + y - 2z = 5', show: (v) => ['point-plane', 'angle-planes', 'line-plane'].includes(v.mode) },
        { key: 'plane2', label: 'Second plane', show: (v) => v.mode === 'angle-planes' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Points and directions as three numbers: 1, -2, 3."
      resultLabel="Answer"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.answer} /></div>}
    />
  );
}
