'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.bfs-dfs';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Which finds shortest paths?", a: <>BFS, in an unweighted graph: it reaches each node by the fewest edges. For weighted graphs use Dijkstra.</> },
  { q: "What is DFS used for?", a: <>Finding cycles, connected components, topological order and maze paths.</> },
  { q: "Why alphabetical order?", a: <>Textbooks take neighbours in alphabetical order so everyone gets the same answer; any order is a valid search.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • GRAPH ALGORITHMS" title="BFS and DFS (Graph Search)" subtitle="Breadth-First and Depth-First Search">
        <strong>Breadth-first search</strong> explores a graph level by level with a queue; <strong>depth-first search</strong> goes as deep as it can with a stack, then backs up. Both visit every reachable node once.
      </MethodHeader>
      <FormulaBox label="QUEUE VS STACK" tag="FIFO • LIFO">
        <Formula math={"\\text{BFS: queue (first in, first out)} \\qquad \\text{DFS: stack (last in, first out)}"} />
        <FormulaSteps steps={[
          { title: "1. Start", text: <>Mark the start node.</> },
          { title: "2. Explore", text: <>Take the next node from the queue (BFS) or go deeper (DFS).</> },
          { title: "3. Add", text: <>Unvisited neighbours.</> },
        ]} />
        <SymbolKey rows={EX['bfs-dfs'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['bfs-dfs'].example} />
      <CommonMistakes items={EX['bfs-dfs'].mistakes} />
      <Lab heading="Interactive Graph Search Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["dijkstra","mst","truth-table"]} />
    </MethodPage>
  );
}
