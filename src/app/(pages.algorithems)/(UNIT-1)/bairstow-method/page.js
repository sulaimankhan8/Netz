'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.bairstow-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why look for quadratic factors?", a: <>Complex roots of a real polynomial come in pairs, and each pair is a real quadratic factor, so no complex arithmetic is needed.</> },
  { q: "What if it does not converge?", a: <>Newton on r, s needs a reasonable start; try other r and s (for example 1 and −1).</> },
  { q: "How are the roots read off?", a: <>From each factor x² − rx − s: x = (r ± √(r² + 4s))/2.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Bairstow's Method Calculator" subtitle="Quadratic Factors and All the Roots of a Polynomial">
        <strong>Bairstow&apos;s method</strong> finds a quadratic factor <InlineMath math={"x^2 - rx - s"} /> of a polynomial by Newton&apos;s method on <InlineMath math={"r"} /> and <InlineMath math={"s"} />, using only real arithmetic. Dividing it out and repeating gives every root, complex pairs included.
      </MethodHeader>
      <FormulaBox label="THE RECURRENCES" tag="x² − rx − s">
        <Formula math={"b_i = a_i + rb_{i+1} + sb_{i+2}, \\quad c_i = b_i + rc_{i+1} + sc_{i+2}; \\qquad c_2\\Delta r + c_3\\Delta s = -b_1, \\ c_1\\Delta r + c_2\\Delta s = -b_0"} />
        <FormulaSteps steps={[
          { title: "1. Divide twice", text: <>The b and c numbers.</> },
          { title: "2. Newton", text: <>Solve for Δr, Δs.</> },
          { title: "3. Deflate", text: <>Divide out the factor and repeat.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'a_n, \\dots, a_0', t: 'The coefficients of the polynomial, highest power first.', e: '1,\\ -1.1,\\ 2.3,\\ 0.5,\\ 3.3' },
          { s: 'x^2 - rx - s', t: 'The quadratic factor we are hunting for. Each one gives two roots (often a complex pair).', e: 'x^2 + 0.9x + 1.1' },
          { s: 'b_i', t: 'Dividing the polynomial by x² − rx − s. b₁ and b₀ are the remainder: both 0 means we found a factor.', e: 'b_0 = 0.7' },
          { s: 'c_i', t: 'Dividing again (the b numbers by x² − rx − s). They give the slopes used to correct r and s.', e: 'c_2 = 5.5' },
          { s: '\\Delta r,\\ \\Delta s', t: 'The corrections from Newton’s method in two unknowns: add them to r and s.', e: '\\Delta r = 0.109690' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find all roots of <InlineMath math="x^4 - 1.1x^3 + 2.3x^2 + 0.5x + 3.3 = 0" />, starting from <InlineMath math="r = s = -1" />.</ExampleProblem>
        <ExampleStep n={1} title="FIRST DIVISION: THE b NUMBERS">
          <StepText>Coefficients <InlineMath math="a_4, \dots, a_0 = 1,\ -1.1,\ 2.3,\ 0.5,\ 3.3" />; start with <InlineMath math="b_4 = a_4 = 1" />:</StepText>
          <MathPanel>
            <BlockMath math={"b_3 = -1.1 + (-1)(1) = -2.1, \\qquad b_2 = 2.3 + (-1)(-2.1) + (-1)(1) = 3.4"} />
            <BlockMath math={"b_1 = 0.5 + (-1)(3.4) + (-1)(-2.1) = -0.8, \\qquad b_0 = 3.3 + (-1)(-0.8) + (-1)(3.4) = 0.7"} />
          </MathPanel>
          <StepText><InlineMath math="b_1" /> and <InlineMath math="b_0" /> are the remainder: they are not 0, so <InlineMath math="x^2 + x + 1" /> is not yet a factor.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="SECOND DIVISION: THE c NUMBERS">
          <MathPanel>
            <BlockMath math={"c_4 = 1"} />
            <BlockMath math={"c_3 = -2.1 + (-1)(1) = -3.1"} />
            <BlockMath math={"c_2 = 3.4 + (-1)(-3.1) + (-1)(1) = 5.5"} />
            <BlockMath math={"c_1 = -0.8 + (-1)(5.5) + (-1)(-3.1) = -3.2"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="CORRECT r AND s">
          <MathPanel>
            <BlockMath math={"5.5\\,\\Delta r - 3.1\\,\\Delta s = 0.8, \\qquad -3.2\\,\\Delta r + 5.5\\,\\Delta s = -0.7"} />
            <BlockMath math={"\\Delta r = 0.109690, \\ \\Delta s = -0.063453 \\quad\\Rightarrow\\quad r = -0.890310, \\ s = -1.063453"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={4} title="REPEAT UNTIL r AND s SETTLE">
          <StepTable
            columns={[{ key: 'k', label: 'k', bold: true }, { key: 'b', label: 'b₁, b₀ (remainder)' }, { key: 'd', label: 'Δr, Δs' }, { key: 'rs', label: 'new r, s', highlight: true }]}
            rows={[
              { k: 1, b: '−0.8, 0.7', d: '0.109690, −0.063453', rs: '−0.890310, −1.063453' },
              { k: 2, b: '−0.061931, 0.155698', d: '−0.009715, −0.036708', rs: '−0.900025, −1.100161' },
              { k: 3, b: '0.000356, −0.000706', d: '0.000025, 0.000161', rs: '−0.9, −1.1' },
              { k: 4, b: '0.000000006, 0.0000000001', d: '≈ 0, ≈ 0', rs: '−0.9, −1.1' },
            ]}
            rowKey={(r) => r.k}
          />
          <StepText>The remainder is now 0, so <InlineMath math="x^2 - rx - s = x^2 + 0.9x + 1.1" /> is a factor.</StepText>
        </ExampleStep>
        <ExampleStep n={5} title="DEFLATE AND SOLVE THE QUADRATICS">
          <MathPanel>
            <BlockMath math={"x^4 - 1.1x^3 + 2.3x^2 + 0.5x + 3.3 = (x^2 + 0.9x + 1.1)(x^2 - 2x + 3)"} />
            <BlockMath math={"x = \\frac{-0.9 \\pm \\sqrt{0.81 - 4.4}}{2} = -0.45 \\pm 0.947365i"} />
            <BlockMath math={"x = \\frac{2 \\pm \\sqrt{4 - 12}}{2} = 1 \\pm 1.414214i"} />
          </MathPanel>
          <StepText>The quotient <InlineMath math="b_4, b_3, b_2 = 1, -2, 3" /> from the last division is the second factor.</StepText>
        </ExampleStep>
        <Conclusion result="x = −0.45 ± 0.947i, 1 ± 1.414i" math={<BlockMath math={"x = -0.45 \\pm 0.9474i, \\ 1 \\pm \\sqrt2\\,i"} />}>Four complex roots from real arithmetic only. The calculator below opens on this polynomial.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Mixing up the sign convention of the factor.</>, f: <>This page uses <InlineMath math="x^2 - rx - s" />, so <InlineMath math="r = -0.9,\ s = -1.1" /> means <InlineMath math="x^2 + 0.9x + 1.1" />. Keep one form throughout.</> },
        { m: <>Using b where c is needed (or the other way).</>, f: <>The b numbers come from the coefficients a; the c numbers come from the b numbers, by the same recurrence.</> },
        { m: <>Wrong equations for Δr and Δs.</>, f: <><InlineMath math="c_2\Delta r + c_3\Delta s = -b_1" /> and <InlineMath math="c_1\Delta r + c_2\Delta s = -b_0" />: note the minus signs.</> },
        { m: <>Stopping before the remainder is 0.</>, f: <>Continue until <InlineMath math="b_1" />, <InlineMath math="b_0" /> (or Δr, Δs) are below the tolerance.</> },
        { m: <>Forgetting to deflate.</>, f: <>After the first factor, repeat on the quotient <InlineMath math="b_n, \dots, b_2" /> (here <InlineMath math="x^2 - 2x + 3" />).</> },
        { m: <>Writing only the final answer.</>, f: <>Show the b and c numbers, the Δ equations for at least the first iteration, the table, and each quadratic solved.</> },
      ]} />
      <Lab heading="Interactive Bairstow's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["muller-method","graeffe-root-squaring","newton-raphson"]} />
    </MethodPage>
  );
}
