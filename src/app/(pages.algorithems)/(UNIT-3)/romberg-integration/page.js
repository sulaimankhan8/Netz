'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RombergCalculator from './algorithems.romberg-integration';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'How does Romberg integration work?',
    a: <>It works out the trapezoidal rule with 1, 2, 4, 8, … strips, then combines neighbouring estimates (Richardson extrapolation) to cancel most of their error. The bottom-right entry of the table is usually far more accurate than any single trapezoidal result.</>,
  },
  {
    q: 'What is Richardson extrapolation?',
    a: <>If two estimates have errors that shrink in a known way, a weighted combination cancels the leading error: <InlineMath math="R(i, 1) = \frac{4R(i, 0) - R(i - 1, 0)}{3}" />. That first column of corrections equals Simpson&apos;s 1/3 rule.</>,
  },
  {
    q: 'How many levels do I need?',
    a: <>For a smooth function, 3 to 5 levels usually give 6 or more correct digits. Stop when the last two diagonal entries agree to the accuracy you need.</>,
  },
];

export default function RombergPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 3 • NUMERICAL INTEGRATION" title="Romberg Integration" subtitle="Trapezoidal + Richardson Extrapolation">
        <strong>Romberg integration</strong> starts from trapezoidal estimates with 1, 2, 4, … strips and improves them with <InlineMath math="R(i, j) = R(i, j - 1) + \frac{R(i, j - 1) - R(i - 1, j - 1)}{4^j - 1}" />. Each column is more accurate than the one before.
      </MethodHeader>

      <FormulaBox label="THE ROMBERG TABLE" tag="2ᵏ STRIPS">
        <Formula math={`\\begin{gathered} R(i, 0) = T_{2^i} \\ (\\text{trapezoidal rule with } 2^i \\text{ strips}) \\\\ R(i, j) = R(i, j - 1) + \\frac{R(i, j - 1) - R(i - 1, j - 1)}{4^j - 1} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Trapezoids', text: <>Column 0: the trapezoidal rule, halving h each row (reuse the previous row&apos;s points).</> },
            { title: '2. Extrapolate', text: <>Each new column combines the entry to its left with the one above-left.</> },
            { title: '3. Read the Corner', text: <>The bottom-right entry is the answer.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Use Romberg integration with 2 levels to estimate <InlineMath math="\int_0^1 \frac{dx}{1 + x}" />. (The exact value is <InlineMath math="\ln 2 \approx 0.693147" />.)
        </ExampleProblem>

        <ExampleStep n={1} title="TRAPEZOIDAL COLUMN">
          <MathPanel>
            <BlockMath math="R(0,0) = \tfrac{1}{2}\left[f(0) + f(1)\right] = \tfrac{1}{2}(1 + 0.5) = 0.75" />
            <BlockMath math="R(1,0) = \tfrac{1}{2}R(0,0) + 0.5\,f(0.5) = 0.375 + 0.333333 = 0.708333" />
            <BlockMath math="R(2,0) = \tfrac{1}{2}R(1,0) + 0.25\left[f(0.25) + f(0.75)\right] = 0.697024" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="EXTRAPOLATE">
          <MathPanel>
            <BlockMath math="R(1,1) = 0.708333 + \frac{0.708333 - 0.75}{3} = 0.694444" />
            <BlockMath math="R(2,1) = 0.697024 + \frac{0.697024 - 0.708333}{3} = 0.693254" />
            <BlockMath math="R(2,2) = 0.693254 + \frac{0.693254 - 0.694444}{15} = 0.693175" />
          </MathPanel>
          <StepText>Four strips of plain trapezoids were off by 0.0039; the Romberg corner is off by only 0.000028.</StepText>
        </ExampleStep>

        <Conclusion result="∫ ≈ 0.693175 (ln 2 = 0.693147)" math={<BlockMath math="R(2,2) = 0.693175" />}>
          The calculator below opens on this integral. Add a level to see the answer match ln 2 to six places.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Romberg Calculator">
        <RombergCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['trapezoidal', 'simpson-13', 'gauss-quadrature', 'boole']} />
    </MethodPage>
  );
}
