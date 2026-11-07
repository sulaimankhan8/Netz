'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.nth-derivative-leibniz';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I choose u and v in Leibniz?", a: <>Make v the polynomial: its derivatives become 0 after a few steps, so most terms vanish.</> },
  { q: "How do partial fractions help?", a: <>1/((x − 1)(x − 2)) = 1/(x − 2) − 1/(x − 1), and each piece has a standard nth derivative.</> },
  { q: "What is (ax + b)^m when n > m?", a: <>For a whole number m the nth derivative is 0 once n &gt; m; the formula has the factor m(m − 1)…(m − n + 1).</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="nth Derivative and Leibniz's Theorem" subtitle="Successive Differentiation">
        Find the <strong>nth derivative</strong> of standard functions as a formula in n, and the nth derivative of a product with <strong>Leibniz&apos;s theorem</strong> <InlineMath math={"(uv)_n = \\sum \\binom{n}{k}u_{n-k}v_k"} />.
      </MethodHeader>
      <FormulaBox label="STANDARD RESULTS" tag="yₙ">
        <Formula math={"(e^{ax})_n = a^ne^{ax}, \\quad (\\sin ax)_n = a^n\\sin\\left(ax + \\frac{n\\pi}{2}\\right), \\quad \\left(\\frac{1}{x + a}\\right)_n = \\frac{(-1)^n n!}{(x + a)^{n+1}}"} />
        <FormulaSteps steps={[
          { title: "1. Recognise", text: <>A standard form, or split by partial fractions.</> },
          { title: "2. Product", text: <>Leibniz: binomial coefficients.</> },
          { title: "3. Check", text: <>Against n = 1, 2, 3.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find <InlineMath math={"y_4"} /> for <InlineMath math={"y = x^2e^{3x}"} /> by Leibniz&apos;s theorem.</ExampleProblem>
        <ExampleStep n={1} title="CHOOSE u AND v"><MathPanel><BlockMath math={"u = e^{3x}, \\ v = x^2: \\quad v_1 = 2x, \\ v_2 = 2, \\ v_3 = 0"} /></MathPanel><StepText>Only three terms survive.</StepText></ExampleStep>
        <ExampleStep n={2} title="LEIBNIZ"><MathPanel><BlockMath math={"y_4 = 81e^{3x}x^2 + 4\\cdot 27e^{3x}\\cdot 2x + 6\\cdot 9e^{3x}\\cdot 2"} /></MathPanel></ExampleStep>
        <Conclusion result="e³ˣ(81x² + 216x + 108)" math={<BlockMath math={"y_4 = 27e^{3x}(3x^2 + 8x + 4)"} />}>The fifth example button below loads this product.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive nth Derivative Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["derivative","taylor-series","binomial-theorem"]} />
    </MethodPage>
  );
}
