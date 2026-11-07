'use client';
// The live Laplace equation (Liebmann's method) calculator. The maths is in src/app/utils/engines/laplace-liebmann.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/laplace-liebmann';

const EXAMPLES = [
  {
    label: "4×4, top at 100",
    input: {
      n: "4",
      top: "100",
      bottom: "0",
      left: "0",
      right: "0"
    }
  },
  {
    label: "3×3, two hot sides",
    input: {
      n: "3",
      top: "100",
      bottom: "0",
      left: "100",
      right: "0"
    }
  },
  {
    label: "Grewal 4×4 with varying edges",
    input: {
      n: "4",
      top: "1000, 1000, 1000, 1000, 1000",
      bottom: "0, 500, 1000, 500, 0",
      left: "1000, 2000, 1000, 500, 0",
      right: "1000, 1000, 1000, 1000, 0"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="laplace-liebmann" unit={4} title="Liebmann Engine" button="Iterate"
      start={{
  n: "4",
  top: "100",
  bottom: "0",
  left: "0",
  right: "0",
  tol: "0.001"
}}
      fields={[
        { key: 'n', label: 'Squares per side', placeholder: '4' }, { key: 'tol', label: 'Stop when changes <', placeholder: '0.001' },
        { key: 'top', label: 'Top side', placeholder: '100, or one value per point', wide: true }, { key: 'bottom', label: 'Bottom side', placeholder: '0', wide: true },
        { key: 'left', label: 'Left side (top to bottom)', placeholder: '0', wide: true }, { key: 'right', label: 'Right side (top to bottom)', placeholder: '0', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="One number fills a whole side; or give one value per grid point (corners included)."
      resultLabel={(a) => `Converged after ${a.iterations} sweeps`}
      renderResult={(a) => (<div className="overflow-x-auto"><BlockMath math={`\\begin{bmatrix} ${a.grid.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`} /></div>)}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
