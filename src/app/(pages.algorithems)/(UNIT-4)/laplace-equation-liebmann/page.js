'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.laplace-equation-liebmann';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why the average of the neighbours?", a: <>Replacing u_xx and u_yy by central differences with equal steps turns Laplace&apos;s equation into exactly this averaging rule.</> },
  { q: "What is the difference from Jacobi iteration?", a: <>Liebmann (Gauss–Seidel) uses each new value at once, so it converges about twice as fast as Jacobi, which waits for the whole sweep.</> },
  { q: "Why is the centre exactly 25 here?", a: <>By symmetry: adding the four plates with one hot side each gives 100 everywhere, so each contributes a quarter at the centre.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • BOUNDARY VALUE PROBLEMS & PDEs" title="Laplace's Equation by Liebmann's Method" subtitle="Steady-State Temperature on a Grid">
        For <InlineMath math={"u_{xx} + u_{yy} = 0"} /> on a square with known edge values, every inner point is the <strong>average of its four neighbours</strong>. <strong>Liebmann&apos;s method</strong> repeats this (Gauss–Seidel) until nothing changes.
      </MethodHeader>
      <FormulaBox label="FIVE-POINT FORMULA" tag="AVERAGE">
        <Formula math={"u_{i,j} = \\tfrac{1}{4}\\left(u_{i-1,j} + u_{i+1,j} + u_{i,j-1} + u_{i,j+1}\\right)"} />
        <FormulaSteps steps={[
          { title: "1. Edges", text: <>Fill in the boundary values.</> },
          { title: "2. Start", text: <>A first guess inside.</> },
          { title: "3. Sweep", text: <>Replace each point by the average.</> },
        ]} />
        <SymbolKey rows={EX['laplace-liebmann'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['laplace-liebmann'].example} />
      <CommonMistakes items={EX['laplace-liebmann'].mistakes} />
      <Lab heading="Interactive Liebmann Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["heat-equation","gauss-seidel","finite-difference-bvp"]} />
    </MethodPage>
  );
}
