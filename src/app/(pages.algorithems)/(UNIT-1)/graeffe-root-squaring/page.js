'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.graeffe-root-squaring';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, IterationPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does squaring help?", a: <>If |x₁| &gt; |x₂|, then |x₁|^{'{'}2^m{'}'} ≫ |x₂|^{'{'}2^m{'}'}, so the polynomial behaves like a product of terms that split cleanly.</> },
  { q: "How are the signs found?", a: <>The method gives only |xₖ|; put +|xₖ| and −|xₖ| into p and keep the one that makes p (nearly) 0.</> },
  { q: "When does it fail?", a: <>For equal-sized roots, such as a complex pair, the ratios do not settle; other methods (Bairstow) are better there.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Graeffe's Root Squaring Method" subtitle="All the Real Roots at Once from Their Magnitudes">
        <strong>Graeffe&apos;s method</strong> repeatedly squares the roots of a polynomial without knowing them. After a few squarings the roots are so far apart in size that each one is (nearly) a ratio of neighbouring coefficients.
      </MethodHeader>
      <FormulaBox label="ROOT SQUARING" tag="x → −x²">
        <Formula math={"b_k = a_k^2 - 2a_{k-1}a_{k+1} + 2a_{k-2}a_{k+2} - \\cdots, \\qquad |x_k| \\approx \\left(\\frac{b_k}{b_{k-1}}\\right)^{1/2^m}"} />
        <FormulaSteps steps={[
          { title: "1. Square", text: <>New coefficients bₖ.</> },
          { title: "2. Repeat", text: <>m times.</> },
          { title: "3. Read off", text: <>|xₖ| from the ratios, signs by substituting.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'a_k', t: 'The coefficients of the polynomial, highest power first (a₀ is the leading one here).', e: '1,\\ -6,\\ 11,\\ -6' },
          { s: 'b_k', t: 'The coefficients after one squaring: a new polynomial whose roots are the squares of the old roots (signs dropped).', e: '1,\\ 14,\\ 49,\\ 36' },
          { s: 'm', t: 'How many times we square. After m squarings the roots are raised to the power 2ᵐ, which pulls them far apart.', e: 'm = 3 \\Rightarrow 2^3 = 8' },
          { s: '\\dfrac{b_k}{b_{k-1}}', t: 'Once the roots are far apart, each ratio of neighbouring coefficients is (almost) one root to the power 2ᵐ.', e: '\\dfrac{6818}{1}' },
          { s: '|x_k|', t: 'The size of root k: the 2ᵐ-th root of the ratio. The sign is found by putting ± into the polynomial.', e: '6818^{1/8} = 3.014' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the roots of <InlineMath math="x^3 - 6x^2 + 11x - 6 = 0" /> by three squarings.</ExampleProblem>
        <ExampleStep n={1} title="FIRST SQUARING IN FULL">
          <StepText>Coefficients <InlineMath math="a_0, a_1, a_2, a_3 = 1,\ -6,\ 11,\ -6" />. Each new coefficient is the old one squared, minus twice the product of its neighbours (plus twice the next pair, …):</StepText>
          <MathPanel>
            <BlockMath math={"b_0 = 1^2 = 1, \\qquad b_1 = (-6)^2 - 2(1)(11) = 36 - 22 = 14"} />
            <BlockMath math={"b_2 = 11^2 - 2(-6)(-6) = 121 - 72 = 49, \\qquad b_3 = (-6)^2 = 36"} />
          </MathPanel>
          <StepText>The roots of <InlineMath math="x^3 - 14x^2 + 49x - 36" /> are <InlineMath math="1, 4, 9" />: the squares of 1, 2, 3.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="SECOND AND THIRD SQUARINGS" space={4}>
          <IterationPanel label="Second squaring (from 1, 14, 49, 36):">
            <BlockMath math={"b_1 = 14^2 - 2(1)(49) = 98, \\quad b_2 = 49^2 - 2(14)(36) = 1393, \\quad b_3 = 36^2 = 1296"} />
          </IterationPanel>
          <IterationPanel label="Third squaring (from 1, 98, 1393, 1296):">
            <BlockMath math={"b_1 = 98^2 - 2(1393) = 6818, \\quad b_2 = 1393^2 - 2(98)(1296) = 1686433, \\quad b_3 = 1296^2 = 1679616"} />
          </IterationPanel>
        </ExampleStep>
        <ExampleStep n={3} title="COEFFICIENT TABLE">
          <StepTable
            columns={[{ key: 'm', label: 'Squarings m', bold: true }, { key: 'b0', label: 'b₀' }, { key: 'b1', label: 'b₁' }, { key: 'b2', label: 'b₂' }, { key: 'b3', label: 'b₃' }]}
            rows={[
              { m: 0, b0: '1', b1: '−6', b2: '11', b3: '−6' },
              { m: 1, b0: '1', b1: '14', b2: '49', b3: '36' },
              { m: 2, b0: '1', b1: '98', b2: '1393', b3: '1296' },
              { m: 3, b0: '1', b1: '6818', b2: '1686433', b3: '1679616' },
            ]}
            rowKey={(r) => r.m}
          />
        </ExampleStep>
        <ExampleStep n={4} title="READ OFF THE ROOTS (2³ = 8)">
          <MathPanel>
            <BlockMath math={"|x_1| \\approx \\left(\\frac{6818}{1}\\right)^{1/8} = 3.0144"} />
            <BlockMath math={"|x_2| \\approx \\left(\\frac{1686433}{6818}\\right)^{1/8} = 1.9914"} />
            <BlockMath math={"|x_3| \\approx \\left(\\frac{1679616}{1686433}\\right)^{1/8} = 0.9995"} />
          </MathPanel>
          <StepText>Signs: <InlineMath math="p(3) = 0" />, <InlineMath math="p(-3) = -120" />, so the roots are positive. The exact roots are 3, 2, 1; more squarings make the estimates sharper.</StepText>
        </ExampleStep>
        <Conclusion result="x ≈ 3, 2, 1" math={<BlockMath math={"x \\approx 3.014, \\ 1.991, \\ 0.9995"} />}>The calculator below opens on this polynomial.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Squaring each coefficient on its own.</>, f: <>Each new coefficient also subtracts twice the product of its neighbours: <InlineMath math="b_1 = a_1^2 - 2a_0a_2" />.</> },
        { m: <>Forgetting the far pairs for higher degrees.</>, f: <>The pattern continues: <InlineMath math="+2a_{k-2}a_{k+2} - 2a_{k-3}a_{k+3} + \cdots" /> for as long as both coefficients exist.</> },
        { m: <>Using 1/m instead of 1/2ᵐ.</>, f: <>After m squarings the roots are raised to the power <InlineMath math="2^m" />: take the <InlineMath math="2^m" />-th root (the 8th root after 3 squarings).</> },
        { m: <>Giving magnitudes without signs.</>, f: <>The method gives <InlineMath math="|x_k|" /> only; put <InlineMath math="+|x_k|" /> and <InlineMath math="-|x_k|" /> into the polynomial to decide the sign.</> },
        { m: <>Too few squarings.</>, f: <>If two roots are close in size, their ratios separate slowly: square more times.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the first squaring in full, the coefficient table, and each root with its ratio.</> },
      ]} />
      <Lab heading="Interactive Graeffe's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bairstow-method","horner-method","newton-raphson"]} />
    </MethodPage>
  );
}
