'use client';
// The live simplex method calculator. The maths is in src/app/utils/engines/simplex.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/simplex';

const EXAMPLES = [
  {
    label: "max 3x + 5y (Wyndor)",
    input: {
      mode: "simplex",
      objective: "max 3x + 5y",
      constraints: "x <= 4; 2y <= 12; 3x + 2y <= 18"
    }
  },
  {
    label: "max 5x + 4y",
    input: {
      mode: "simplex",
      objective: "max 5x + 4y",
      constraints: "6x + 4y <= 24; x + 2y <= 6; y - x <= 1; y <= 2"
    }
  },
  {
    label: "min with ≥ (Big-M)",
    input: {
      mode: "simplex",
      objective: "min 2x + 3y",
      constraints: "x + y >= 4; x + 3y >= 6"
    }
  },
  {
    label: "dual of max 3x + 5y",
    input: {
      mode: "dual",
      objective: "max 3x + 5y",
      constraints: "x <= 4; 2y <= 12; 3x + 2y <= 18"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="simplex" unit={15} title="Simplex Engine" button="Solve"
      start={{
  mode: "simplex",
  objective: "max 3x + 5y",
  constraints: "x <= 4; 2y <= 12; 3x + 2y <= 18"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'simplex', label: 'Optimal solution' }, { value: 'dual', label: 'The dual problem' }] },
        { key: 'objective', label: 'Objective', placeholder: 'max 3x + 5y', wide: true },
        { key: 'constraints', label: 'Constraints (separated by ;)', placeholder: 'x + 2y <= 8; 3x + 2y <= 12', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="All variables are taken to be ≥ 0. Use <=, >= or = in constraints."
      resultLabel={(a) => (a.mode === 'dual' ? 'The dual problem' : 'Optimal solution')}
      renderResult={(a) => (<div className="space-y-3 min-w-0"><div className="overflow-x-auto text-lg"><BlockMath math={a.answer} /></div>{a.dual && a.dual.cons.map((c) => <div key={c} className="overflow-x-auto"><BlockMath math={c} /></div>)}</div>)}
      renderSteps={(a) => (<div className="space-y-4">{a.tableaux.map((t, i) => <div key={i}><p className="text-xs font-mono font-bold mb-1">Tableau {i + 1}</p><StepTable columns={t.columns} rows={t.rows} /></div>)}</div>)}
    />
  );
}
