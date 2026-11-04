'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TaylorSeriesCalculator from './algorithems.taylor-series-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>Find the Maclaurin series of <InlineMath math="e^x" /> up to x⁴, and use it to estimate <InlineMath math="e^{0.5}" />.</ExampleProblem>
        <ExampleStep n={1} title="ALL DERIVATIVES ARE eˣ">
          <MathPanel><BlockMath math="f(0) = f'(0) = f''(0) = f'''(0) = f^{(4)}(0) = e^0 = 1" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="DIVIDE BY k!">
          <MathPanel><BlockMath math="e^x \approx 1 + x + \frac{x^2}{2} + \frac{x^3}{6} + \frac{x^4}{24}" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="USE IT">
          <MathPanel><BlockMath math="e^{0.5} \approx 1 + 0.5 + 0.125 + 0.020833 + 0.002604 = 1.648438" /></MathPanel>
          <StepText>The true value is 1.648721…, so the error is about 0.0003.</StepText>
        </ExampleStep>
        <Conclusion result="eˣ ≈ 1 + x + x²/2 + x³/6 + x⁴/24" math={<BlockMath math="e^{0.5} \approx 1.6484" />}>
          The calculator below opens on this example and draws eˣ and the series together.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Taylor Series Calculator">
        <TaylorSeriesCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'limit', 'taylor']} />
    </MethodPage>
  );
}
