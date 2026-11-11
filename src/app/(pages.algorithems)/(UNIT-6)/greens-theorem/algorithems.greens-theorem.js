'use client';
// The live Green's theorem calculator. The maths is in src/app/utils/engines/greens-theorem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/greens-theorem';

const EXAMPLES = [
  {
    label: "(3x² − 8y²)dx + (4y − 6xy)dy",
    input: {
      M: "3x^2 - 8y^2",
      N: "4y - 6xy",
      region: "between",
      g1: "x^2",
      g2: "sqrt(x)",
      xlo: "0",
      xhi: "1"
    }
  },
  {
    label: "Rectangle 0..2 × 0..3",
    input: {
      M: "x^2 + y^2",
      N: "-2xy",
      region: "rectangle",
      xlo: "0",
      xhi: "2",
      ylo: "0",
      yhi: "3"
    }
  },
  {
    label: "Unit square",
    input: {
      M: "x^2 - y",
      N: "x",
      region: "rectangle",
      xlo: "0",
      xhi: "1",
      ylo: "0",
      yhi: "1"
    }
  },
  {
    label: "Triangle (0,0), (1,0), (0,1)",
    input: {
      M: "x y",
      N: "x^2",
      region: "triangle",
      A: "(0, 0)",
      B: "(1, 0)",
      C: "(0, 1)"
    }
  },
  {
    label: "Area by ½∮(x dy − y dx)",
    input: {
      M: "-y",
      N: "x",
      region: "circle",
      a: "2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="greens-theorem" unit={6} title="Green's Theorem Engine" button="Verify"
      start={{
  M: "3x^2 - 8y^2",
  N: "4y - 6xy",
  region: "between",
  xlo: "0",
  xhi: "1",
  ylo: "0",
  yhi: "1",
  g1: "x^2",
  g2: "sqrt(x)",
  A: "(0, 0)",
  B: "(1, 0)",
  C: "(0, 1)",
  a: "1"
}}
      fields={[
        { key: 'M', label: 'M(x, y) (with dx)', placeholder: 'x^2 - y' }, { key: 'N', label: 'N(x, y) (with dy)', placeholder: 'x' },
        { key: 'region', label: 'Region', kind: 'select', options: [{ value: 'rectangle', label: "Rectangle" }, { value: 'triangle', label: "Triangle" }, { value: 'circle', label: "Disc x² + y² ≤ a²" }, { value: 'semicircle', label: "Half-disc (y ≥ 0)" }, { value: 'between', label: "Between two curves" }] },
        { key: 'xlo', label: 'x from', placeholder: '0', show: (v) => ['rectangle', 'between'].includes(v.region) }, { key: 'xhi', label: 'x to', placeholder: '1', show: (v) => ['rectangle', 'between'].includes(v.region) },
        { key: 'ylo', label: 'y from', placeholder: '0', show: (v) => v.region === 'rectangle' }, { key: 'yhi', label: 'y to', placeholder: '1', show: (v) => v.region === 'rectangle' },
        { key: 'g1', label: 'Lower curve y = g₁(x)', placeholder: 'x^2', show: (v) => v.region === 'between' }, { key: 'g2', label: 'Upper curve y = g₂(x)', placeholder: 'x', show: (v) => v.region === 'between' },
        { key: 'A', label: 'Vertex A', placeholder: '(0, 0)', show: (v) => v.region === 'triangle' }, { key: 'B', label: 'Vertex B', placeholder: '(1, 0)', show: (v) => v.region === 'triangle' }, { key: 'C', label: 'Vertex C', placeholder: '(0, 1)', show: (v) => v.region === 'triangle' },
        { key: 'a', label: 'Radius a', placeholder: '1', show: (v) => v.region === 'circle' || v.region === 'semicircle' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"C is the whole boundary, taken anticlockwise."}
      resultLabel="Both sides"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\oint_C (M\\,dx + N\\,dy) = ${a.line}`} /></div><div className="overflow-x-auto"><BlockMath math={`\\iint_R (N_x - M_y)\\,dA = ${a.double}`} /></div></div>)}
    />
  );
}
