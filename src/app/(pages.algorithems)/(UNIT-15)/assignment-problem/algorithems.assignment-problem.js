'use client';
// The live assignment problem calculator. The maths is in src/app/utils/engines/assignment-problem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/assignment-problem';

const EXAMPLES = [
  {
    label: "5 × 5 (total 38)",
    input: {
      costs: "9 11 14 11 7; 6 15 13 13 10; 12 13 6 8 8; 11 9 10 12 9; 7 12 14 10 14",
      goal: "min"
    }
  },
  {
    label: "4 × 4",
    input: {
      costs: "10 12 19 11; 5 10 7 8; 12 14 13 11; 8 15 11 9",
      goal: "min"
    }
  },
  {
    label: "Maximise profit",
    input: {
      costs: "16 10 14 11; 14 11 15 15; 15 15 13 12; 13 12 14 15",
      goal: "max"
    }
  },
  {
    label: "Unbalanced 4 × 3",
    input: {
      costs: "9 26 15; 13 27 6; 35 20 15; 18 30 20",
      goal: "min"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="assignment-problem" unit={15} title="Hungarian Method Engine" button="Assign"
      start={{
  costs: "9 11 14 11 7; 6 15 13 13 10; 12 13 6 8 8; 11 9 10 12 9; 7 12 14 10 14",
  goal: "min"
}}
      fields={[
        { key: 'costs', label: 'Cost table (rows separated by ;)', placeholder: '10 12 19 11; 5 10 7 8; 12 14 13 11; 8 15 11 9', wide: true },
        { key: 'goal', label: 'Goal', kind: 'choice', options: [{ value: 'min', label: "Minimise" }, { value: 'max', label: "Maximise" }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Rows are workers, columns are jobs. A non-square table gets dummy rows or columns."}
      resultLabel={(a) => (a.goal === 'max' ? 'Maximum total' : 'Minimum total')}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`\\text{total} = ${a.total}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
