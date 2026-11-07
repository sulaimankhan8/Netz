'use client';
// The live gradient descent calculator. The maths is in src/app/utils/engines/gradient-descent.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import ContourPlot from '@/app/components/method/ContourPlot';
import { solve } from '@/app/utils/engines/gradient-descent';

const EXAMPLES = [
  {
    label: "x² + 3y², α = 0.1",
    input: {
      f: "x^2 + 3y^2",
      x0: "2",
      y0: "1",
      alpha: "0.1"
    }
  },
  {
    label: "x² + 3y², α = 0.4 (overshoots)",
    input: {
      f: "x^2 + 3y^2",
      x0: "2",
      y0: "1",
      alpha: "0.4"
    }
  },
  {
    label: "(x − 3)² (one variable)",
    input: {
      f: "(x - 3)^2",
      x0: "0",
      y0: "",
      alpha: "0.2"
    }
  },
  {
    label: "Rosenbrock-like",
    input: {
      f: "(1 - x)^2 + 5(y - x^2)^2",
      x0: "0",
      y0: "0",
      alpha: "0.02",
      steps: "100"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="gradient-descent" unit={1} title="Gradient Descent Engine" button="Descend"
      start={{
  f: "x^2 + 3y^2",
  x0: "2",
  y0: "1",
  alpha: "0.1",
  steps: "20",
  tol: "0.0001"
}}
      fields={[
        { key: 'f', label: 'f(x) or f(x, y)', placeholder: 'e.g. x^2 + 3y^2', wide: true },
        { key: 'x0', label: 'Start x₀', placeholder: '2' }, { key: 'y0', label: 'Start y₀ (if f uses y)', placeholder: '1' },
        { key: 'alpha', label: 'Learning rate α', placeholder: '0.1' }, { key: 'steps', label: 'Max steps', placeholder: '20' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Each step moves against the gradient: x ← x − α∇f."
      resultLabel={(a) => (a.stop === 'diverged' ? 'Diverged' : a.stop === 'converged' ? 'Converged' : 'Stopped')}
      renderResult={(a) => (<div className="space-y-2 min-w-0"><div className="overflow-x-auto text-lg"><BlockMath math={`${a.two ? '(x, y)' : 'x'} \\approx ${a.point}, \\quad f \\approx ${a.fx}`} /></div>{a.two && a.path.length > 1 && <ContourPlot f={a.fAt} view={{ x0: Math.min(...a.path.map((p) => p.x)) - 1, x1: Math.max(...a.path.map((p) => p.x)) + 1, y0: Math.min(...a.path.map((p) => p.y)) - 1, y1: Math.max(...a.path.map((p) => p.y)) + 1 }} points={a.path.filter((_, i) => i % Math.max(1, Math.floor(a.path.length / 12)) === 0).map((p) => ({ x: p.x, y: p.y, kind: 'point' }))} title="The path over the level curves" />}</div>)}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
