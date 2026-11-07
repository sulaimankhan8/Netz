'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.laplace-equation-liebmann';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A square plate has its top edge at 100° and the other edges at 0°. Find the temperatures at the 9 inner points of a 4 × 4 grid.</ExampleProblem>
        <ExampleStep n={1} title="FIRST SWEEP"><MathPanel><BlockMath math={"u_{11} = \\tfrac{1}{4}(100 + 0 + u_{12} + u_{21})"} /></MathPanel><StepText>New values are used straight away.</StepText></ExampleStep>
        <ExampleStep n={2} title="CONVERGE"><StepText>After a few sweeps the values settle: about 52.7 at the top middle, 25 in the centre and 9.8 at the bottom middle.</StepText></ExampleStep>
        <Conclusion result="centre ≈ 25" math={<BlockMath math={"u_{22} \\approx 25"} />}>The calculator below opens on this plate.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Liebmann Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["heat-equation","gauss-seidel","finite-difference-bvp"]} />
    </MethodPage>
  );
}
