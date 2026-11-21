'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.errors-and-approximations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is it only approximate?", a: <>dy follows the tangent line, not the curve. The smaller Δx, the better the approximation.</> },
  { q: "What is the relative error?", a: <>dy/y: the error compared with the size of the quantity. Times 100 it is the percentage error.</> },
  { q: "How does an error in r affect the area of a circle?", a: <>A = πr², so dA = 2πr dr and dA/A = 2 dr/r: a 1% error in r gives about a 2% error in A.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="Errors and Approximations" subtitle="Differentials dy = f′(x) dx">
        For a small change Δx, <InlineMath math={"\\Delta y \\approx dy = f'(x)\\,\\Delta x"} />. Use it to <strong>approximate values</strong> like √25.3 and to find the <strong>error</strong>, relative error and percentage error in a result.
      </MethodHeader>
      <FormulaBox label="DIFFERENTIALS" tag="dy">
        <Formula math={"f(x + \\Delta x) \\approx f(x) + f'(x)\\,\\Delta x, \\qquad \\frac{dy}{y} \\times 100 = \\text{percentage error}"} />
        <FormulaSteps steps={[
          { title: "1. Choose x", text: <>A nearby easy value.</> },
          { title: "2. Differentiate", text: <>f′(x) at that value.</> },
          { title: "3. Multiply", text: <>by Δx and add.</> },
        ]} />
        <SymbolKey rows={EX['errors-and-approximations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['errors-and-approximations'].example} />
      <CommonMistakes items={EX['errors-and-approximations'].mistakes} />
      <Lab heading="Interactive Errors and Approximations Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["derivative","tangent-normal","taylor-series"]} />
    </MethodPage>
  );
}
