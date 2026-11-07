'use client';
// The live minimum spanning tree calculator. The maths is in src/app/utils/engines/mst.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import GraphView from '@/app/components/method/GraphView';
import { solve } from '@/app/utils/engines/mst';

const EXAMPLES = [
  {
    label: "Kruskal on 6 nodes",
    input: {
      mode: "kruskal",
      edges: "A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2"
    }
  },
  {
    label: "Prim on 6 nodes",
    input: {
      mode: "prim",
      edges: "A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2",
      start: "A"
    }
  },
  {
    label: "Kruskal: 5 towns",
    input: {
      mode: "kruskal",
      edges: "P Q 3; P R 1; P S 6; Q R 5; Q T 3; R S 5; R T 6; S T 2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="mst" unit={15} title="Spanning Tree Engine" button="Find the MST"
      start={{
  edges: "A B 4; A C 2; B C 1; B D 5; C D 8; C E 10; D E 2; D F 6; E F 2",
  mode: "kruskal",
  start: "A"
}}
      fields={[
        { key: 'mode', label: 'Algorithm', kind: 'choice', options: [{ value: 'kruskal', label: 'Kruskal' }, { value: 'prim', label: 'Prim' }] },
        { key: 'edges', label: 'Edges with weights (u v w; …)', placeholder: 'A B 4; A C 2', wide: true },
        { key: 'start', label: "Prim's start node", placeholder: 'A', show: (v) => v.mode === 'prim' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The graph must be connected and undirected."
      resultLabel={(a) => `Total weight ${a.total}`}
      renderResult={(a) => <GraphView graph={a.graph} highlight={a.highlight} title="The minimum spanning tree" />}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
