'use client';
// The live bilinear transformation calculator. The maths is in src/app/utils/engines/bilinear.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/bilinear';

const EXAMPLES = [
  {
    label: "−1, 0, 1 → 0, i, 3i",
    input: {
      mode: "three",
      z1: "-1",
      z2: "0",
      z3: "1",
      w1: "0",
      w2: "i",
      w3: "3i"
    }
  },
  {
    label: "1, i, −1 → 0, 1, ∞",
    input: {
      mode: "three",
      z1: "1",
      z2: "i",
      z3: "-1",
      w1: "0",
      w2: "1",
      w3: "inf"
    }
  },
  {
    label: "0, 1, ∞ → −1, −i, 1",
    input: {
      mode: "three",
      z1: "0",
      z2: "1",
      z3: "inf",
      w1: "-1",
      w2: "-i",
      w3: "1"
    }
  },
  {
    label: "w = (z − 1)/(z + 1)",
    input: {
      mode: "map",
      a: "1",
      b: "-1",
      c: "1",
      d: "1",
      points: "0, 1, i, inf"
    }
  },
  {
    label: "w = (3z − 4)/(z − 1)",
    input: {
      mode: "map",
      a: "3",
      b: "-4",
      c: "1",
      d: "-1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="bilinear" unit={14} title="Bilinear Map Engine" button="Find the Map"
      start={{
  mode: "three",
  z1: "-1",
  z2: "0",
  z3: "1",
  w1: "0",
  w2: "i",
  w3: "3i",
  a: "1",
  b: "-1",
  c: "1",
  d: "1",
  points: ""
}}
      fields={[
        { key: 'mode', label: 'Given', kind: 'choice', options: [{ value: 'three', label: "Three points and their images" }, { value: 'map', label: "The map w = (az + b)/(cz + d)" }] },
        { key: 'z1', label: 'z₁', show: (v) => v.mode === 'three' }, { key: 'w1', label: 'w₁', show: (v) => v.mode === 'three' },
        { key: 'z2', label: 'z₂', show: (v) => v.mode === 'three' }, { key: 'w2', label: 'w₂', show: (v) => v.mode === 'three' },
        { key: 'z3', label: 'z₃', show: (v) => v.mode === 'three' }, { key: 'w3', label: 'w₃', show: (v) => v.mode === 'three' },
        { key: 'a', label: 'a', show: (v) => v.mode === 'map' }, { key: 'b', label: 'b', show: (v) => v.mode === 'map' },
        { key: 'c', label: 'c', show: (v) => v.mode === 'map' }, { key: 'd', label: 'd', show: (v) => v.mode === 'map' },
        { key: 'points', label: 'Also map these points (optional)', placeholder: '0, i, inf', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Write ∞ as inf. Complex numbers like 2 + 3i are fine."}
      resultLabel="The bilinear map"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto text-lg"><BlockMath math={a.map} /></div><div className="overflow-x-auto"><BlockMath math={`\\text{fixed points: } ${a.fixed.join(', \\ ')}`} /></div></div>)}
    />
  );
}
