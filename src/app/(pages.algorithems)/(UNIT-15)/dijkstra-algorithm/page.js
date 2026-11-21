'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.dijkstra-algorithm';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['dijkstra-algorithm'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['dijkstra-algorithm'].example} />
      <CommonMistakes items={EX['dijkstra-algorithm'].mistakes} />
      <Lab heading="Interactive Dijkstra's Algorithm Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bfs-dfs","mst","simplex"]} />
    </MethodPage>
  );
}
