'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.finite-difference-bvp';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is the system tridiagonal?", a: <>Each equation links only yᵢ₋₁, yᵢ and yᵢ₊₁, so the matrix has entries only on three diagonals — and the Thomas algorithm solves it in a single sweep.</> },
  { q: "How accurate is it?", a: <>The error is proportional to h²: halving h makes it about four times smaller.</> },
  { q: "How is this different from the shooting method?", a: <>Shooting turns the BVP into initial value problems and adjusts the starting slope; finite differences solve for all points at once.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • BOUNDARY VALUE PROBLEMS & PDEs" title="Finite Difference Method for BVPs" subtitle="Boundary Value Problems as a Tridiagonal System">
        Solve <InlineMath math={"y'' + p(x)y' + q(x)y = r(x)"} /> with <InlineMath math={"y(a) = \\alpha, \\ y(b) = \\beta"} /> by replacing the derivatives with <strong>central differences</strong>. The result is a tridiagonal system, solved by the Thomas algorithm.
      </MethodHeader>
      <FormulaBox label="CENTRAL DIFFERENCES" tag="h">
        <Formula math={"y''_i \\approx \\frac{y_{i-1} - 2y_i + y_{i+1}}{h^2}, \\qquad y'_i \\approx \\frac{y_{i+1} - y_{i-1}}{2h}"} />
        <FormulaSteps steps={[
          { title: "1. Grid", text: <>h = (b − a)/n.</> },
          { title: "2. Equations", text: <>One per inner point.</> },
          { title: "3. Solve", text: <>Tridiagonal: Thomas algorithm.</> },
        ]} />
        <SymbolKey rows={EX['finite-difference-bvp'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['finite-difference-bvp'].example} />
      <CommonMistakes items={EX['finite-difference-bvp'].mistakes} />
      <Lab heading="Interactive Finite Difference Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["shooting-method","heat-equation","cubic-spline"]} />
    </MethodPage>
  );
}
