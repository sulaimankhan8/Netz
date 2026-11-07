'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.heat-equation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why must λ be at most ½ for the explicit scheme?", a: <>For larger λ, errors grow from step to step and the numbers blow up. Bender–Schmidt picks λ = ½ exactly.</> },
  { q: "Why use Crank–Nicolson?", a: <>It is stable for any λ and more accurate in time, at the cost of solving a tridiagonal system at each step.</> },
  { q: "What does λ mean?", a: <>λ = c²k/h² compares the time step with the space step squared — it fixes how heat spreads per step.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • BOUNDARY VALUE PROBLEMS & PDEs" title="Heat Equation (Bender–Schmidt and Crank–Nicolson)" subtitle="The One-Dimensional Heat Equation on a Grid">
        Solve <InlineMath math={"u_t = c^2u_{xx}"} /> numerically: <strong>Bender–Schmidt</strong> averages the two neighbours (explicit, λ = ½), while <strong>Crank–Nicolson</strong> averages the old and new time levels (implicit, stable for any λ).
      </MethodHeader>
      <FormulaBox label="THE SCHEMES" tag="λ = c²k/h²">
        <Formula math={"u_{i,j+1} = \\tfrac{1}{2}\\left(u_{i-1,j} + u_{i+1,j}\\right) \\quad (\\text{Bender–Schmidt}, \\ \\lambda = \\tfrac{1}{2})"} />
        <FormulaSteps steps={[
          { title: "1. Grid", text: <>h in x, k in t.</> },
          { title: "2. First row", text: <>u(x, 0) = f(x).</> },
          { title: "3. March", text: <>One time level at a time.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math={"u_t = u_{xx}"} />, u(0, t) = u(4, t) = 0, u(x, 0) = 4x − x², with h = 1.</ExampleProblem>
        <ExampleStep n={1} title="FIRST ROW"><MathPanel><BlockMath math={"u(x, 0): \\ 0, \\ 3, \\ 4, \\ 3, \\ 0"} /></MathPanel><StepText>k = h²/2 = 0.5 for Bender–Schmidt.</StepText></ExampleStep>
        <ExampleStep n={2} title="NEXT ROW"><MathPanel><BlockMath math={"u_{1,1} = \\tfrac{1}{2}(0 + 4) = 2, \\ u_{2,1} = \\tfrac{1}{2}(3 + 3) = 3, \\ u_{3,1} = 2"} /></MathPanel></ExampleStep>
        <Conclusion result="Row 1: 0, 2, 3, 2, 0" math={<BlockMath math={"u(x, 0.5) = 0,\\ 2,\\ 3,\\ 2,\\ 0"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Heat Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["laplace-liebmann","finite-difference-bvp","gauss-seidel"]} />
    </MethodPage>
  );
}
