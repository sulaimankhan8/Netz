'use client';
// The live transportation problem calculator. The maths is in src/app/utils/engines/transportation-problem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import TransportTable from '@/app/components/method/TransportTable';
import { solve } from '@/app/utils/engines/transportation-problem';

const EXAMPLES = [
  {
    label: "Classic 3 × 4 (VAM)",
    input: {
      costs: "19 30 50 10; 70 30 40 60; 40 8 70 20",
      supply: "7 9 18",
      demand: "5 8 7 14",
      method: "vam",
      goal: "min"
    }
  },
  {
    label: "Same, North-West corner",
    input: {
      costs: "19 30 50 10; 70 30 40 60; 40 8 70 20",
      supply: "7 9 18",
      demand: "5 8 7 14",
      method: "nw",
      goal: "min"
    }
  },
  {
    label: "Unbalanced (dummy column)",
    input: {
      costs: "4 8 8; 16 24 16; 8 16 24",
      supply: "76 82 77",
      demand: "72 102 41",
      method: "least",
      goal: "min"
    }
  },
  {
    label: "3 × 4, supplies 300–500",
    input: {
      costs: "3 1 7 4; 2 6 5 9; 8 3 3 2",
      supply: "300 400 500",
      demand: "250 350 400 200",
      method: "nw",
      goal: "min"
    }
  },
  {
    label: "Maximise profit",
    input: {
      costs: "15 51 42 33; 80 42 26 81; 90 40 66 60",
      supply: "23 44 33",
      demand: "23 31 16 30",
      method: "vam",
      goal: "max"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="transportation-problem" unit={15} title="Transportation Engine" button="Solve"
      start={{
  costs: "19 30 50 10; 70 30 40 60; 40 8 70 20",
  supply: "7 9 18",
  demand: "5 8 7 14",
  method: "vam",
  goal: "min"
}}
      fields={[
        { key: 'costs', label: 'Costs (rows separated by ;)', placeholder: '19 30 50 10; 70 30 40 60; 40 8 70 20', wide: true },
        { key: 'supply', label: 'Supply (one per row)', placeholder: '7 9 18' }, { key: 'demand', label: 'Demand (one per column)', placeholder: '5 8 7 14' },
        { key: 'method', label: 'Starting solution', kind: 'select', options: [{ value: 'vam', label: "Vogel's approximation (VAM)" }, { value: 'least', label: "Least cost" }, { value: 'nw', label: "North-West corner" }] },
        { key: 'goal', label: 'Goal', kind: 'choice', options: [{ value: 'min', label: "Minimise cost" }, { value: 'max', label: "Maximise profit" }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"If supply and demand differ, a dummy row or column (cost 0) is added."}
      resultLabel={(a) => (a.goal === 'max' ? 'Maximum profit' : 'Minimum cost')}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\text{total} = ${a.total} \\quad (\\text{start: } ${a.initial})`} /></div><div className="overflow-x-auto"><BlockMath math={`${a.routes.join(', \\quad ')}`} /></div></div>)}
      renderSteps={(a) => a.tables && <div className="space-y-4"><TransportTable table={a.tables[0]} caption="Starting solution" /><TransportTable table={a.tables[a.tables.length - 1]} caption="Optimal (with u, v and the d values)" /></div>}
    />
  );
}
