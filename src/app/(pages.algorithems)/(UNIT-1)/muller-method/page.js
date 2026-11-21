'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.muller-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, IterationPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why the ± sign rule?", a: <>Choosing the sign that makes |b ± √(b² − 4ac)| larger avoids subtracting nearly equal numbers and picks the root closer to x₂.</> },
  { q: "How can it find complex roots?", a: <>If b² − 4ac &lt; 0 the square root is complex, so x₃ leaves the real line; the page works in complex numbers throughout.</> },
  { q: "How fast is it?", a: <>Its order is about 1.84, between the secant method (1.62) and Newton (2), and it needs no derivative.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Muller's Method Calculator" subtitle="Root Finding by Parabolas, Real or Complex">
        <strong>Muller&apos;s method</strong> generalises the secant method: instead of a line through two points it fits a <strong>parabola</strong> through three and takes its root. It converges fast (order about 1.84) and can reach complex roots from real starting points.
      </MethodHeader>
      <FormulaBox label="THE STEP" tag="THREE POINTS">
        <Formula math={"a = \\frac{\\delta_2 - \\delta_1}{h_2 + h_1}, \\ b = ah_2 + \\delta_2, \\ c = f(x_2); \\qquad x_3 = x_2 - \\frac{2c}{b \\pm \\sqrt{b^2 - 4ac}}"} />
        <FormulaSteps steps={[
          { title: "1. Differences", text: <>h₁, h₂ and the slopes δ₁, δ₂.</> },
          { title: "2. Parabola", text: <>a, b, c.</> },
          { title: "3. Root", text: <>x₃ with the larger denominator.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'x_0,\\ x_1,\\ x_2', t: 'Three guesses for the root. A parabola is drawn through the curve at these three points.', e: '0,\\ 1,\\ 2' },
          { s: 'f_0,\\ f_1,\\ f_2', t: 'The function at the three guesses.', e: 'f(2) = 5' },
          { s: 'h_1,\\ h_2', t: 'The gaps between the guesses: h₁ = x₁ − x₀, h₂ = x₂ − x₁.', e: 'h_1 = h_2 = 1' },
          { s: '\\delta_1,\\ \\delta_2', t: 'The slopes between neighbouring points: δ₁ = (f₁ − f₀)/h₁, δ₂ = (f₂ − f₁)/h₂.', e: '\\delta_2 = 6' },
          { s: 'a,\\ b,\\ c', t: 'The parabola a(x − x₂)² + b(x − x₂) + c through the three points; c is just f₂.', e: 'a = 3,\\ b = 9,\\ c = 5' },
          { s: '\\pm', t: 'Take the sign that makes the denominator b ± √(b² − 4ac) larger in size: it gives the parabola root nearer x₂ and avoids rounding loss.', e: '9 + 4.58' },
          { s: 'x_3', t: 'The new guess. Drop x₀, keep the latest three, repeat.', e: 'x_3 = 1.263763' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the root of <InlineMath math="f(x) = x^3 - x - 1 = 0" /> starting from <InlineMath math="x_0 = 0,\ x_1 = 1,\ x_2 = 2" />, until two guesses agree to 6 decimals.</ExampleProblem>
        <ExampleStep n={1} title="FUNCTION AT THE THREE POINTS">
          <MathPanel>
            <BlockMath math={"f(0) = 0 - 0 - 1 = -1"} />
            <BlockMath math={"f(1) = 1 - 1 - 1 = -1"} />
            <BlockMath math={"f(2) = 8 - 2 - 1 = 5"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="GAPS AND SLOPES">
          <MathPanel>
            <BlockMath math={"h_1 = 1 - 0 = 1, \\qquad h_2 = 2 - 1 = 1"} />
            <BlockMath math={"\\delta_1 = \\frac{-1 - (-1)}{1} = 0, \\qquad \\delta_2 = \\frac{5 - (-1)}{1} = 6"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="THE PARABOLA">
          <MathPanel>
            <BlockMath math={"a = \\frac{\\delta_2 - \\delta_1}{h_2 + h_1} = \\frac{6 - 0}{1 + 1} = 3"} />
            <BlockMath math={"b = a h_2 + \\delta_2 = 3(1) + 6 = 9"} />
            <BlockMath math={"c = f_2 = 5"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={4} title="FIRST NEW GUESS (x₃)">
          <MathPanel>
            <BlockMath math={"\\sqrt{b^2 - 4ac} = \\sqrt{81 - 60} = \\sqrt{21} = 4.582576"} />
            <BlockMath math={"x_3 = x_2 - \\frac{2c}{b + \\sqrt{b^2 - 4ac}} = 2 - \\frac{10}{9 + 4.582576} = 2 - 0.736237 = 1.263763"} />
          </MathPanel>
          <StepText>b is positive, so the + sign gives the larger denominator. Now drop <InlineMath math="x_0" /> and use <InlineMath math="1,\ 2,\ 1.263763" />.</StepText>
        </ExampleStep>
        <ExampleStep n={5} title="SECOND ITERATION IN FULL" space={4}>
          <IterationPanel label="Points 1, 2, 1.263763:">
            <BlockMath math={"f_0 = -1, \\quad f_1 = 5, \\quad f_2 = f(1.263763) = -0.245413"} />
            <BlockMath math={"h_1 = 1"} />
            <BlockMath math={"h_2 = -0.736237"} />
            <BlockMath math={"\\delta_1 = 6"} />
            <BlockMath math={"\\delta_2 = \\frac{-0.245413 - 5}{-0.736237} = 7.124621"} />
            <BlockMath math={"a = \\frac{7.124621 - 6}{-0.736237 + 1} = 4.263763"} />
            <BlockMath math={"b = 4.263763(-0.736237) + 7.124621 = 3.985480"} />
            <BlockMath math={"c = -0.245413"} />
            <BlockMath math={"x_4 = 1.263763 - \\frac{2(-0.245413)}{3.985480 + \\sqrt{20.069571}} = 1.263763 + \\frac{0.490826}{8.465387} = 1.321743"} />
          </IterationPanel>
        </ExampleStep>
        <ExampleStep n={6} title="ITERATION SUMMARY TABLE">
          <StepTable
            columns={[{ key: 'k', label: 'k', bold: true }, { key: 'pts', label: 'Three points' }, { key: 'abc', label: 'a, b, c' }, { key: 'x', label: 'New guess', highlight: true }, { key: 'f', label: 'f(new guess)' }]}
            rows={[
              { k: 1, pts: '0, 1, 2', abc: '3, 9, 5', x: '1.263763', f: '−0.245412' },
              { k: 2, pts: '1, 2, 1.263763', abc: '4.263763, 3.985480, −0.245412', x: '1.321743', f: '−0.012653' },
              { k: 3, pts: '2, 1.263763, 1.321743', abc: '4.585505, 4.280338, −0.012653', x: '1.324690', f: '−0.000121' },
              { k: 4, pts: '1.263763, 1.321743, 1.324690', abc: '3.910195, 4.264228, −0.000121', x: '1.324718', f: '0.000000005' },
              { k: 5, pts: '1.321743, 1.324690, 1.324718', abc: '3.971150, 4.264633, 0.000000005', x: '1.324718', f: '0' },
            ]}
            rowKey={(r) => r.k}
          />
          <StepText>Iterations 4 and 5 agree to 6 decimals, so stop.</StepText>
        </ExampleStep>
        <Conclusion result="x ≈ 1.324718" math={<BlockMath math={"x \\approx 1.324718, \\qquad f(1.324718) \\approx 0"} />}>Five iterations, with no derivative needed. The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Choosing the wrong sign in the denominator.</>, f: <>Use the sign of <InlineMath math="b" />, so that <InlineMath math="|b \pm \sqrt{b^2 - 4ac}|" /> is as large as possible.</> },
        { m: <>Taking c = f(x₀) instead of f(x₂).</>, f: <>The parabola is written around the newest point: <InlineMath math="c = f(x_2)" />, and the step is taken from <InlineMath math="x_2" />.</> },
        { m: <>Dropping the wrong point.</>, f: <>Always drop the oldest point and keep the latest three.</> },
        { m: <>Stopping when b² − 4ac &lt; 0.</>, f: <>That is not a failure: the square root is complex and Muller moves to a complex root.</> },
        { m: <>Sign slips when a gap is negative.</>, f: <>Gaps can be negative (h₂ = −0.736237 above): bracket them in every formula.</> },
        { m: <>Writing only the final answer.</>, f: <>Show f at the three points, h, δ, a, b, c and the new guess for at least the first iteration, then a table.</> },
      ]} />
      <Lab heading="Interactive Muller's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["secant","newton-raphson","bairstow-method"]} />
    </MethodPage>
  );
}
