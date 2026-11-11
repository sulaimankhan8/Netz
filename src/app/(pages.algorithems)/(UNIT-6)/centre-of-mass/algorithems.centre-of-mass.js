'use client';
// The live centre of mass calculator. The maths is in src/app/utils/engines/centre-of-mass.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/centre-of-mass';

const EXAMPLES = [
  {
    label: "Half-disc, radius 2",
    input: {
      rho: "",
      region: "semicircle",
      a: "2"
    }
  },
  {
    label: "Quarter disc",
    input: {
      rho: "",
      region: "between",
      g1: "0",
      g2: "sqrt(1 - x^2)",
      xlo: "0",
      xhi: "1"
    }
  },
  {
    label: "Triangle (0,0), (2,0), (0,3)",
    input: {
      rho: "",
      region: "triangle",
      A: "(0, 0)",
      B: "(2, 0)",
      C: "(0, 3)"
    }
  },
  {
    label: "Between y = x² and y = x",
    input: {
      rho: "",
      region: "between",
      g1: "x^2",
      g2: "x",
      xlo: "0",
      xhi: "1"
    }
  },
  {
    label: "Rectangle with ρ = xy",
    input: {
      rho: "x y",
      region: "rectangle",
      xlo: "0",
      xhi: "2",
      ylo: "0",
      yhi: "1"
    }
  },
  {
    label: "Disc with ρ = x² + y²",
    input: {
      rho: "x^2 + y^2",
      region: "circle",
      a: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="centre-of-mass" unit={6} title="Centre of Mass Engine" button="Find"
      start={{
  rho: "",
  region: "semicircle",
  xlo: "0",
  xhi: "1",
  ylo: "0",
  yhi: "1",
  g1: "",
  g2: "",
  A: "(0, 0)",
  B: "(1, 0)",
  C: "(0, 1)",
  a: "2"
}}
      fields={[
        { key: 'region', label: 'Region', kind: 'select', options: [{ value: 'rectangle', label: "Rectangle" }, { value: 'triangle', label: "Triangle" }, { value: 'circle', label: "Disc x² + y² ≤ a²" }, { value: 'semicircle', label: "Half-disc (y ≥ 0)" }, { value: 'between', label: "Between two curves" }] },
        { key: 'xlo', label: 'x from', placeholder: '0', show: (v) => ['rectangle', 'between'].includes(v.region) }, { key: 'xhi', label: 'x to', placeholder: '1', show: (v) => ['rectangle', 'between'].includes(v.region) },
        { key: 'ylo', label: 'y from', placeholder: '0', show: (v) => v.region === 'rectangle' }, { key: 'yhi', label: 'y to', placeholder: '1', show: (v) => v.region === 'rectangle' },
        { key: 'g1', label: 'Lower curve y = g₁(x)', placeholder: 'x^2', show: (v) => v.region === 'between' }, { key: 'g2', label: 'Upper curve y = g₂(x)', placeholder: 'x', show: (v) => v.region === 'between' },
        { key: 'A', label: 'Vertex A', placeholder: '(0, 0)', show: (v) => v.region === 'triangle' }, { key: 'B', label: 'Vertex B', placeholder: '(1, 0)', show: (v) => v.region === 'triangle' }, { key: 'C', label: 'Vertex C', placeholder: '(0, 1)', show: (v) => v.region === 'triangle' },
        { key: 'a', label: 'Radius a', placeholder: '1', show: (v) => v.region === 'circle' || v.region === 'semicircle' },
        { key: 'rho', label: 'Density ρ(x, y) (empty: 1)', placeholder: 'x y' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"A lamina in the xy-plane; ρ is mass per unit area."}
      resultLabel="Centre of mass"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`(\\bar{x}, \\bar{y}) = \\left(${a.xbar},\\ ${a.ybar}\\right)`} /></div><div className="overflow-x-auto"><BlockMath math={`M = ${a.mass}, \\quad I_x = ${a.Ix}, \\quad I_y = ${a.Iy}, \\quad I_O = ${a.I0}`} /></div></div>)}
    />
  );
}
