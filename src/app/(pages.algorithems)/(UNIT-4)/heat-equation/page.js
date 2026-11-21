'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.heat-equation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['heat-equation'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['heat-equation'].example} />
      <CommonMistakes items={EX['heat-equation'].mistakes} />
      <Lab heading="Interactive Heat Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["laplace-liebmann","finite-difference-bvp","gauss-seidel"]} />
    </MethodPage>
  );
}
