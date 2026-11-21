'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TaylorSeriesCalculator from './algorithems.taylor-series-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between Taylor and Maclaurin series?',
    a: <>A Maclaurin series is a Taylor series about <InlineMath math="a = 0" />. Taylor series about other points, like √x about 4, are useful when 0 is not allowed or the x you care about is far from 0.</>,
  },
  {
    q: 'How good is the approximation?',
    a: <>Very good near a, and worse further away. Adding terms helps: with n terms the error is roughly the size of the next term, <InlineMath math="\frac{f^{(n+1)}(a)}{(n+1)!}(x - a)^{n+1}" />.</>,
  },
  {
    q: 'Why does ln x have no Maclaurin series?',
    a: <>ln x is not defined at x = 0, so neither are its derivatives. Expand <InlineMath math="\ln(1 + x)" /> about 0 instead, or ln x about 1.</>,
  },
];

export default function TaylorSeriesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Taylor & Maclaurin Series" subtitle="Polynomial Approximations, Term by Term">
        A Taylor series writes f near <InlineMath math="x = a" /> as a polynomial whose coefficients come from the derivatives at a: <InlineMath math="f(x) \approx \sum \frac{f^{(k)}(a)}{k!}(x - a)^k" />. With a = 0 it is a Maclaurin series.
      </MethodHeader>

      <FormulaBox label="THE SERIES" tag="about x = a">
        <Formula math={`f(x) = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\frac{f'''(a)}{3!}(x - a)^3 + \\cdots`} />
        <FormulaSteps
          steps={[
            { title: '1. Differentiate', text: <>Find f′, f″, f‴, … up to the order you need.</> },
            { title: '2. Put in x = a', text: <>Work out each derivative at a.</> },
            { title: '3. Divide by k!', text: <>These are the coefficients of (x − a)ᵏ.</> },
          ]}
        />
        <SymbolKey rows={EX['taylor-series-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['taylor-series-calculator'].example} />
      <CommonMistakes items={EX['taylor-series-calculator'].mistakes} />

      <Lab heading="Interactive Taylor Series Calculator">
        <TaylorSeriesCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'limit', 'taylor']} />
    </MethodPage>
  );
}
