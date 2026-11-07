'use client';
// The live Dijkstra's algorithm calculator. The maths is in src/app/utils/engines/dijkstra.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import GraphView from '@/app/components/method/GraphView';
import { solve } from '@/app/utils/engines/dijkstra';

const EXAMPLES = [
  {
    label: "6 nodes, A to F",
    input: {
      edges: "A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2",
      source: "A",
      target: "F",
      directed: "no"
    }
  },
  {
    label: "directed graph",
    input: {
      edges: "S A 10; S B 5; B A 3; A C 1; B C 9; B D 2; D C 6; C D 4",
      source: "S",
      target: "C",
      directed: "yes"
    }
  },
  {
    label: "cities 1–5",
    input: {
      edges: "1 2 7; 1 3 9; 1 6 14; 2 3 10; 2 4 15; 3 4 11; 3 6 2; 4 5 6; 5 6 9",
      source: "1",
      target: "5",
      directed: "no"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="dijkstra" unit={15} title="Dijkstra Engine" button="Find Shortest Paths"
      start={{
  edges: "A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2",
  source: "A",
  directed: "no",
  target: "F"
}}
      fields={[
        { key: 'edges', label: 'Edges with weights (u v w; …)', placeholder: 'A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2', wide: true },
        { key: 'source', label: 'From node', placeholder: 'A' }, { key: 'target', label: 'To node (optional)', placeholder: 'F' },
        { key: 'directed', label: 'Edges are', kind: 'choice', options: [{ value: 'no', label: 'Two-way' }, { value: 'yes', label: 'One-way (u → v)' }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Weights must be non-negative. Separate edges with ; and write each as 'A B 4'."
      resultLabel="Shortest distances"
      renderResult={(a) => (<div className="space-y-2 min-w-0"><ul className="text-sm space-y-0.5">{a.paths.map((p) => <li key={p.to}><strong>{p.to}</strong>: {p.d} &nbsp;({p.path})</li>)}</ul><GraphView graph={a.graph} highlight={a.highlight} directed={a.directed} title="Shortest paths" /></div>)}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
