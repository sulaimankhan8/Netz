'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.everett-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion, CommonMistakes, SymbolKey, StepTable,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why only even differences?", a: <>The odd ones are written in terms of even ones on the two neighbouring rows, which halves the number of terms and makes the formula symmetric.</> },
  { q: "How does it relate to Bessel and Stirling?", a: <>All three come from Gauss&apos;s formulas; Everett&apos;s rearranges them so only even differences remain.</> },
  { q: "When is it best?", a: <>For x between two table values near the middle, with 0 &lt; p &lt; 1.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • INTERPOLATION" title="Everett's Interpolation Formula" subtitle="Central Differences with Only Even Orders">
        <strong>Everett&apos;s formula</strong> interpolates between <InlineMath math={"x_0"} /> and <InlineMath math={"x_1"} /> using only the <strong>even central differences</strong> on those two rows, weighted by <InlineMath math={"p"} /> and <InlineMath math={"q = 1 - p"} />. It is accurate for points near the middle of the table.
      </MethodHeader>
      <FormulaBox label="EVERETT'S FORMULA" tag="q = 1 − p">
        <Formula math={"y = qy_0 + \\frac{q(q^2 - 1)}{3!}\\delta^2y_0 + \\cdots + py_1 + \\frac{p(p^2 - 1)}{3!}\\delta^2y_1 + \\cdots"} />
        <FormulaSteps steps={[
          { title: "1. Table", text: <>The differences.</> },
          { title: "2. p and q", text: <>p = (x − x₀)/h.</> },
          { title: "3. Formula", text: <>Even differences on rows x₀ and x₁.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'x_0,\\ x_1', t: 'The two table rows either side of x.', e: '24,\\ 28' },
          { s: 'p', t: 'How far x is from x₀ as a fraction of the step: (x − x₀)/h.', e: 'p = \\tfrac14' },
          { s: 'q', t: '1 − p: how far x is from x₁. The nearer row gets the bigger weight.', e: 'q = \\tfrac34' },
          { s: '\\delta^2 y_0,\\ \\delta^2 y_1', t: 'Second central differences on the x₀ and x₁ rows (only even orders are used).', e: '74,\\ 66' },
          { s: '\\frac{q(q^2-1)}{3!}', t: 'The weight of δ²y₀; the matching one for δ²y₁ uses p.', e: '-\\tfrac{7}{128}' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>From x = 20, 24, 28, 32 with y = 2854, 3162, 3544, 3992, find y at x = 25.</ExampleProblem>
        <ExampleStep n={1} title="CHOOSE x₀, x₁ AND FIND p, q">
          <MathPanel>
            <BlockMath math={"x_0 = 24, \\quad x_1 = 28, \\quad h = 4"} />
            <BlockMath math={"p = \\frac{x - x_0}{h} = \\frac{25 - 24}{4} = \\frac14, \\qquad q = 1 - p = \\frac34"} />
          </MathPanel>
          <StepText>x = 25 lies between 24 and 28, so these are the two rows the formula is built on.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="DIFFERENCE TABLE">
          <StepTable
            columns={[{ key: 'x', label: 'x', bold: true }, { key: 'y', label: 'y' }, { key: 'd1', label: 'Δy' }, { key: 'd2', label: 'δ²y (on the row)' }]}
            rows={[
              { x: '20', y: '2854', d1: '308', d2: '' },
              { x: '24 (x₀)', y: '3162 (y₀)', d1: '382', d2: '74 (δ²y₀)' },
              { x: '28 (x₁)', y: '3544 (y₁)', d1: '448', d2: '66 (δ²y₁)' },
              { x: '32', y: '3992', d1: '', d2: '' },
            ]}
            rowKey={(r) => r.x}
          />
          <MathPanel>
            <BlockMath math={"\\delta^2 y_0 = 382 - 308 = 74, \\qquad \\delta^2 y_1 = 448 - 382 = 66"} />
          </MathPanel>
          <StepText>Everett needs only the even differences on the two rows x₀ and x₁.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="THE COEFFICIENTS">
          <MathPanel>
            <BlockMath math={"\\frac{q(q^2 - 1)}{3!} = \\frac{0.75(0.5625 - 1)}{6} = -0.0546875 = -\\frac{7}{128}"} />
            <BlockMath math={"\\frac{p(p^2 - 1)}{3!} = \\frac{0.25(0.0625 - 1)}{6} = -0.0390625 = -\\frac{5}{128}"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={4} title="PUT IT TOGETHER">
          <MathPanel>
            <BlockMath math={"y = q\\,y_0 + \\frac{q(q^2-1)}{3!}\\delta^2 y_0 + p\\,y_1 + \\frac{p(p^2-1)}{3!}\\delta^2 y_1"} />
            <BlockMath math={"= 0.75(3162) - \\tfrac{7}{128}(74) + 0.25(3544) - \\tfrac{5}{128}(66)"} />
            <BlockMath math={"= 2371.5 - 4.046875 + 886 - 2.578125 = 3250.875"} />
          </MathPanel>
        </ExampleStep>
        <Conclusion result="y ≈ 3250.875" math={<BlockMath math={"y(25) \\approx 3250.875"} />}>The calculator below opens on this table.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Mixing up p and q.</>, f: <><InlineMath math="p" /> goes with <InlineMath math="y_1" /> (the far row) and <InlineMath math="q = 1 - p" /> with <InlineMath math="y_0" />: the nearer row gets the bigger weight.</> },
        { m: <>Using odd differences.</>, f: <>Everett uses only even differences (δ², δ⁴, …) on the two rows x₀ and x₁.</> },
        { m: <>Taking δ² from the wrong row.</>, f: <><InlineMath math="\delta^2 y_0" /> is on the x₀ row: the difference of the Δy just above and just below it.</> },
        { m: <>Wrong coefficient formula.</>, f: <>Second-order coefficients are <InlineMath math="\dfrac{q(q^2-1)}{3!}" /> and <InlineMath math="\dfrac{p(p^2-1)}{3!}" />; they are negative for 0 &lt; p &lt; 1.</> },
        { m: <>Choosing x₀ after x.</>, f: <>x₀ is the tabulated value just below x, x₁ just above.</> },
        { m: <>Writing only the final answer.</>, f: <>Show p and q, the difference table, the coefficients and each term.</> },
      ]} />
      <Lab heading="Interactive Everett's Formula Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bessel","stirling","newton-forward"]} />
    </MethodPage>
  );
}
