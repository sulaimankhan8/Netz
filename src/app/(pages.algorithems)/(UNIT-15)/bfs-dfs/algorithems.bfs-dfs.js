'use client';
// The live BFS and DFS calculator. The maths is in src/app/utils/engines/bfs-dfs.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import GraphView from '@/app/components/method/GraphView';
import { solve } from '@/app/utils/engines/bfs-dfs';

const EXAMPLES = [
  {
    label: "BFS from A",
    input: {
      mode: "bfs",
      edges: "A B; A C; B D; B E; C F; E F; D G",
      start: "A"
    }
  },
  {
    label: "DFS from A",
    input: {
      mode: "dfs",
      edges: "A B; A C; B D; B E; C F; E F; D G",
      start: "A"
    }
  },
  {
    label: "BFS on a grid",
    input: {
      mode: "bfs",
      edges: "1 2; 2 3; 1 4; 2 5; 3 6; 4 5; 5 6; 4 7; 5 8; 6 9; 7 8; 8 9",
      start: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="bfs-dfs" unit={15} title="Graph Search Engine" button="Search"
      start={{
  edges: "A B; A C; B D; B E; C F; E F; D G",
  start: "A",
  mode: "bfs",
  directed: "no"
}}
      fields={[
        { key: 'mode', label: 'Search', kind: 'choice', options: [{ value: 'bfs', label: 'Breadth-first (BFS)' }, { value: 'dfs', label: 'Depth-first (DFS)' }] },
        { key: 'edges', label: 'Edges (u v; …)', placeholder: 'A B; A C; B D', wide: true },
        { key: 'start', label: 'Start node', placeholder: 'A' },
        { key: 'directed', label: 'Edges are', kind: 'choice', options: [{ value: 'no', label: 'Two-way' }, { value: 'yes', label: 'One-way' }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Neighbours are visited in alphabetical (or numerical) order."
      resultLabel={(a) => `Visiting order: ${a.order.join(' → ')}`}
      renderResult={(a) => <GraphView graph={a.graph} highlight={a.highlight} directed={a.directed} weighted={false} title="The search tree" />}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
