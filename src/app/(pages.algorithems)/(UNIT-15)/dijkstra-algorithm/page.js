'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.dijkstra-algorithm';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why can't weights be negative?", a: <>Dijkstra fixes a node for good once it is the nearest; a negative edge found later could still shorten its path. Use Bellman–Ford then.</> },
  { q: "How do I read the table?", a: <>Each row visits one node; the other columns show the best distance so far and (in brackets) the node it came through.</> },
  { q: "What is the shortest-path tree?", a: <>The orange edges: following them back from any node gives its shortest path from the source.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • GRAPH ALGORITHMS" title="Dijkstra's Algorithm" subtitle="Shortest Paths, Step by Step">
        <strong>Dijkstra&apos;s algorithm</strong> finds the shortest path from one node to every other in a graph with non-negative weights: repeatedly fix the nearest unvisited node and update its neighbours.
      </MethodHeader>
      <FormulaBox label="RELAXATION" tag="GREEDY">
        <Formula math={"d(v) \\leftarrow \\min\\big(d(v),\\ d(u) + w(u, v)\\big)"} />
        <FormulaSteps steps={[
          { title: "1. Start", text: <>d(source) = 0, all others ∞.</> },
          { title: "2. Visit", text: <>The unvisited node with the smallest d.</> },
          { title: "3. Update", text: <>Its neighbours; repeat.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>In the 6-node graph below, find the shortest path from A to F.</ExampleProblem>
        <ExampleStep n={1} title="FIRST STEPS"><MathPanel><BlockMath math={"d(A) = 0 \\to d(C) = 2, \\ d(B) = \\min(4,\\ 2 + 1) = 3"} /></MathPanel><StepText>C is fixed first, then B via C.</StepText></ExampleStep>
        <ExampleStep n={2} title="FINISH"><MathPanel><BlockMath math={"d(D) = 8, \\ d(E) = 10, \\ d(F) = \\min(8 + 6,\\ 10 + 2) = 12"} /></MathPanel></ExampleStep>
        <Conclusion result="A → C → B → D → E → F, length 12" math={<BlockMath math={"d(F) = 12"} />}>The calculator below opens on this graph.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Dijkstra's Algorithm Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bfs-dfs","mst","simplex"]} />
    </MethodPage>
  );
}
