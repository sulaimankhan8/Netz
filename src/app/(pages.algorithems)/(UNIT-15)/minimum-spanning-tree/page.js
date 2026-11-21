'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.minimum-spanning-tree';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Do Prim and Kruskal give the same tree?", a: <>They give the same total weight. When weights tie, the trees themselves can differ.</> },
  { q: "How does Kruskal spot a cycle?", a: <>It keeps track of which nodes are already connected (a union–find structure); an edge inside one group would make a cycle.</> },
  { q: "Where is this used?", a: <>Laying cables, pipes or roads between towns at the least cost, and in clustering.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • GRAPH ALGORITHMS" title="Minimum Spanning Tree (Prim and Kruskal)" subtitle="Connect Every Node at the Least Cost">
        A <strong>minimum spanning tree</strong> connects all n nodes with n − 1 edges of least total weight. <strong>Kruskal</strong> adds the cheapest edges that make no cycle; <strong>Prim</strong> grows one tree, always by its cheapest outgoing edge.
      </MethodHeader>
      <FormulaBox label="TWO GREEDY RULES" tag="n − 1 EDGES">
        <Formula math={"\\text{Kruskal: cheapest edge with no cycle} \\qquad \\text{Prim: cheapest edge leaving the tree}"} />
        <FormulaSteps steps={[
          { title: "1. Sort", text: <>Edges by weight (Kruskal).</> },
          { title: "2. Take", text: <>If it joins two separate pieces.</> },
          { title: "3. Stop", text: <>At n − 1 edges.</> },
        ]} />
        <SymbolKey rows={EX['minimum-spanning-tree'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['minimum-spanning-tree'].example} />
      <CommonMistakes items={EX['minimum-spanning-tree'].mistakes} />
      <Lab heading="Interactive Minimum Spanning Tree Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["dijkstra","bfs-dfs","simplex"]} />
    </MethodPage>
  );
}
