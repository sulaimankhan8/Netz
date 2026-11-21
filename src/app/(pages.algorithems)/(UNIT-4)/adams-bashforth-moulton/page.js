'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import AdamsCalculator from './algorithems.adams-bashforth-moulton';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the Adams-Bashforth-Moulton method?',
    a: <>A fourth-order predictor-corrector: the Adams-Bashforth formula predicts <InlineMath math="y_{n+1}" /> from four earlier slopes, and the Adams-Moulton formula corrects it using the slope at the prediction.</>,
  },
  {
    q: 'Why use it instead of RK4 all the way?',
    a: <>After the start, each step needs only one or two new evaluations of f, against four for RK4. For a long range, or an expensive f, that saves a lot of work at similar accuracy.</>,
  },
  {
    q: "How does it compare with Milne's method?",
    a: <>Both are fourth order and need four starting values. Adams-Bashforth-Moulton is more stable, so it is the usual choice in practice; Milne&apos;s corrector can let errors grow for some equations.</>,
  },
];

export default function AdamsPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • INITIAL VALUE PROBLEMS (ODE)" title="Adams-Bashforth-Moulton" subtitle="Predictor-Corrector">
        The <strong>Adams-Bashforth-Moulton method</strong> solves <InlineMath math="\frac{dy}{dx} = f(x, y)" /> step by step from four earlier points: Adams-Bashforth predicts the next value, and Adams-Moulton corrects it.
      </MethodHeader>

      <FormulaBox label="THE TWO FORMULAS" tag="FOURTH ORDER">
        <Formula math={`\\begin{gathered} \\text{Predictor: } y_{n+1}^P = y_n + \\frac{h}{24}\\left(55f_n - 59f_{n-1} + 37f_{n-2} - 9f_{n-3}\\right) \\\\ \\text{Corrector: } y_{n+1}^C = y_n + \\frac{h}{24}\\left(9f_{n+1} + 19f_n - 5f_{n-1} + f_{n-2}\\right) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Start Up', text: <>Get <InlineMath math="y_1, y_2, y_3" /> by RK4 and their slopes <InlineMath math="f_0" /> to <InlineMath math="f_3" />.</> },
            { title: '2. Predict', text: <>Adams-Bashforth gives <InlineMath math="y_4^P" />; work out <InlineMath math="f_4" /> there.</> },
            { title: '3. Correct', text: <>Adams-Moulton improves it; repeat the corrector until it settles.</> },
          ]}
        />
        <SymbolKey rows={EX['adams'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['adams'].example} />
      <CommonMistakes items={EX['adams'].mistakes} />

      <Lab heading="Interactive Adams-Bashforth-Moulton Calculator">
        <AdamsCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['milne', 'runge-kutta', 'rk2', 'euler']} />
    </MethodPage>
  );
}
