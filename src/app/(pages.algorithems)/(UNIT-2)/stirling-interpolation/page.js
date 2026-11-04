'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import StirlingCalculator from './algorithems.stirling-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: "When should you use Stirling's formula?",
    a: <>When the x you want is near the middle of the table, close to a tabulated point: it works best for <InlineMath math="-\tfrac{1}{4} \le p \le \tfrac{1}{4}" />. Near the start use Newton forward, near the end Newton backward, and halfway between two middle points use Bessel.</>,
  },
  {
    q: "How is Stirling's formula related to Gauss's formulas?",
    a: <>It is the average of Gauss&apos;s forward and backward formulas. That is why its odd terms use the mean of two differences.</>,
  },
  {
    q: 'What is p?',
    a: <><InlineMath math="p = \frac{x - x_0}{h}" />: how many steps x is from the chosen middle point <InlineMath math="x_0" />.</>,
  },
];

export default function StirlingPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • EQUAL INTERVAL INTERPOLATION" title="Stirling's Formula" subtitle="Central Difference Interpolation">
        <strong>Stirling&apos;s formula</strong> interpolates near the middle of an equally spaced table, using central differences around the nearest point <InlineMath math="x_0" />. It is the average of Gauss&apos;s forward and backward formulas.
      </MethodHeader>

      <FormulaBox label="STIRLING'S FORMULA" tag="BEST FOR |p| ≤ ¼">
        <Formula math={`\\begin{gathered} y = y_0 + p\\,\\frac{\\Delta y_{-1} + \\Delta y_0}{2} + \\frac{p^2}{2!}\\Delta^2 y_{-1} \\\\ + \\frac{p(p^2 - 1)}{3!}\\cdot\\frac{\\Delta^3 y_{-2} + \\Delta^3 y_{-1}}{2} \\\\ + \\frac{p^2(p^2 - 1)}{4!}\\Delta^4 y_{-2} + \\cdots \\\\ p = \\frac{x - x_0}{h} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Pick x₀', text: <>Choose the tabulated x nearest to the one you want; it becomes index 0.</> },
            { title: '2. Find p', text: <><InlineMath math="p = (x - x_0)/h" />, a small number between −½ and ½.</> },
            { title: '3. Middle Row', text: <>Use the differences straddling <InlineMath math="x_0" />: odd orders averaged, even orders on the row.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          From x = 1, 2, 3, 4, 5 and y = 1, 8, 27, 64, 125, estimate y at x = 3.2.
        </ExampleProblem>

        <ExampleStep n={1} title="CHOOSE x₀ AND p">
          <MathPanel>
            <BlockMath math="x_0 = 3, \quad h = 1, \quad p = \frac{3.2 - 3}{1} = 0.2" />
          </MathPanel>
          <StepText>The differences around x₀: <InlineMath math="\Delta y_{-1} = 19" />, <InlineMath math="\Delta y_0 = 37" />, <InlineMath math="\Delta^2 y_{-1} = 18" />, <InlineMath math="\Delta^3 y_{-2} = \Delta^3 y_{-1} = 6" />.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="THE TERMS">
          <MathPanel>
            <BlockMath math="y_0 = 27" />
            <BlockMath math="p\,\frac{19 + 37}{2} = 0.2 \times 28 = 5.6" />
            <BlockMath math="\frac{p^2}{2}\,\Delta^2 y_{-1} = \frac{0.04}{2} \times 18 = 0.36" />
            <BlockMath math="\frac{p(p^2 - 1)}{6}\cdot\frac{6 + 6}{2} = \frac{0.2 \times (-0.96)}{6} \times 6 = -0.192" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="ADD THEM UP">
          <MathPanel>
            <BlockMath math="y(3.2) \approx 27 + 5.6 + 0.36 - 0.192 = 32.768" />
          </MathPanel>
          <StepText>The data come from <InlineMath math="y = x^3" />, and <InlineMath math="3.2^3 = 32.768" /> exactly: with a cubic, the formula stops at Δ³ and is exact.</StepText>
        </ExampleStep>

        <Conclusion result="y(3.2) ≈ 32.768" math={<BlockMath math="y(3.2) = 32.768" />}>
          The calculator below opens on this table and tints the differences it used.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Stirling Calculator">
        <StirlingCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['bessel', 'gauss-forward', 'gauss-backward', 'difference-table']} />
    </MethodPage>
  );
}
