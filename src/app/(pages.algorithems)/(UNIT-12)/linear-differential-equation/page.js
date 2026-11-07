'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.linear-differential-equation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why does the integrating factor work?', a: <>Multiplying by <InlineMath math="e^{\int P\,dx}" /> makes the left side the derivative of a product: <InlineMath math="\frac{d}{dx}\left(y\,e^{\int P\,dx}\right) = Q\,e^{\int P\,dx}" />, which you can integrate.</> },
  { q: 'What if the equation is not in standard form?', a: <>Divide by the coefficient of dy/dx first. For <InlineMath math="x\frac{dy}{dx} - 2y = x^3" />, P = −2/x and Q = x².</> },
  { q: 'What about e^(ln x)?', a: <>It is just x (taking x &gt; 0). In general <InlineMath math="e^{k\ln x} = x^k" />, which is how integrating factors like 1/x² appear.</> },
];

export default function LinearOdePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Linear Differential Equations" subtitle="dy/dx + Py = Q With the Integrating Factor">
        A first-order <strong>linear equation</strong> <InlineMath math="\frac{dy}{dx} + P(x)y = Q(x)" /> is solved with the <strong>integrating factor</strong> <InlineMath math="\text{IF} = e^{\int P\,dx}" />: then <InlineMath math="y\cdot\text{IF} = \int Q\cdot\text{IF}\,dx + C" />.
      </MethodHeader>
      <FormulaBox label="THE SOLUTION" tag="IF = e^∫P dx">
        <Formula math={'y\\,e^{\\int P\\,dx} = \\int Q\\,e^{\\int P\\,dx}\\,dx + C'} />
        <FormulaSteps steps={[
          { title: '1. Standard form', text: <>Read off P and Q.</> },
          { title: '2. IF', text: <>e to the ∫P dx; simplify e^(ln x) = x.</> },
          { title: '3. Integrate', text: <>Q·IF, add C, divide by IF.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="\frac{dy}{dx} + y\tan x = \sec x" />.</ExampleProblem>
        <ExampleStep n={1} title="INTEGRATING FACTOR"><MathPanel><BlockMath math="\int \tan x\,dx = -\ln|\cos x| \;\Rightarrow\; \text{IF} = \sec x" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE"><MathPanel><BlockMath math="y\sec x = \int \sec^2 x\,dx = \tan x + C" /></MathPanel><StepText>Multiply by cos x.</StepText></ExampleStep>
        <Conclusion result="y = sin x + C cos x" math={<BlockMath math="y = \sin x + C\cos x" />}>The fourth example button below loads this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Linear Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['bernoulli', 'variable-separable', 'ode-solver']} />
    </MethodPage>
  );
}
