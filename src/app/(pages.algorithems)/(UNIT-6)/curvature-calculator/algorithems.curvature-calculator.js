'use client';
// The live curvature calculator. The maths is in src/app/utils/engines/curvature-calculator.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/curvature-calculator';

const EXAMPLES = [
  {
    label: "y = x² at x = 1",
    input: {
      mode: "cartesian",
      f: "x^2",
      at: "1"
    }
  },
  {
    label: "y = eˣ at x = 0",
    input: {
      mode: "cartesian",
      f: "e^x",
      at: "0"
    }
  },
  {
    label: "Ellipse at t = 0",
    input: {
      mode: "parametric",
      x: "2cos(t)",
      y: "3sin(t)",
      at: "0"
    }
  },
  {
    label: "Cycloid at t = π",
    input: {
      mode: "parametric",
      x: "t - sin(t)",
      y: "1 - cos(t)",
      at: "pi"
    }
  },
  {
    label: "Cardioid at θ = 0",
    input: {
      mode: "polar",
      r: "1 + cos(theta)",
      at: "0"
    }
  },
  {
    label: "y = x³ at 0 (inflection)",
    input: {
      mode: "cartesian",
      f: "x^3",
      at: "0"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="curvature-calculator" unit={6} title="Curvature Engine" button="Find ρ"
      start={{
  mode: "cartesian",
  f: "x^2",
  x: "",
  y: "",
  r: "",
  at: "1"
}}
      fields={[
        { key: 'mode', label: 'Curve', kind: 'choice', options: [{ value: 'cartesian', label: "y = f(x)" }, { value: 'parametric', label: "x(t), y(t)" }, { value: 'polar', label: "r = f(θ)" }] },
        { key: 'f', label: 'y = f(x)', placeholder: 'x^2', show: (v) => v.mode === 'cartesian' },
        { key: 'x', label: 'x(t)', placeholder: '2cos(t)', show: (v) => v.mode === 'parametric' }, { key: 'y', label: 'y(t)', placeholder: '3sin(t)', show: (v) => v.mode === 'parametric' },
        { key: 'r', label: 'r = f(θ)', placeholder: '1 + cos(theta)', show: (v) => v.mode === 'polar' },
        { key: 'at', label: 'At (x, t or θ)', placeholder: '1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Write θ as theta."}
      resultLabel="Radius of curvature"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\rho = ${a.rho}, \\quad \\kappa = ${a.kappa}`} /></div>{a.centre && <div className="overflow-x-auto"><BlockMath math={`\\text{centre of curvature} = ${a.centre}`} /></div>}</div>)}
    />
  );
}
