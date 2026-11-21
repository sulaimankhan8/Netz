'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.floating-point-representation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is 0.1 + 0.2 not exactly 0.3?", a: <>None of 0.1, 0.2, 0.3 is exact in binary; the rounding errors do not cancel, so the sum differs in the last bit.</> },
  { q: "What is machine epsilon?", a: <>The gap between 1 and the next number: 2⁻²³ ≈ 1.19 × 10⁻⁷ for single, 2⁻⁵² ≈ 2.2 × 10⁻¹⁶ for double. Rounding to nearest keeps the relative error below half of it.</> },
  { q: "What are subnormal numbers?", a: <>Below the smallest normal number the exponent is all 0s and the leading 1 is dropped, filling the gap down to 0 with evenly spaced values.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • NUMBERS & ERRORS" title="IEEE-754 Floating-Point Converter" subtitle="Sign, Exponent, Fraction and the Rounding Error">
        Computers store real numbers as <InlineMath math={"(-1)^s \\times 1.f \\times 2^{E}"} />: a sign bit, a biased exponent and a fraction. Most decimals (like <InlineMath math={"0.1"} />) have endless binary expansions, so the nearest representable number is stored, with a small <strong>rounding error</strong>.
      </MethodHeader>
      <FormulaBox label="THE LAYOUT" tag="BIAS 127 / 1023">
        <Formula math={"\\text{single: } 1 + 8 + 23 \\text{ bits}, \\ e = E + 127; \\qquad \\text{double: } 1 + 11 + 52 \\text{ bits}, \\ e = E + 1023"} />
        <FormulaSteps steps={[
          { title: "1. Binary", text: <>Write the number in base 2.</> },
          { title: "2. Normalise", text: <>1.f × 2ᴱ.</> },
          { title: "3. Store", text: <>Sign, E + bias, the first fraction bits (rounded).</> },
        ]} />
        <SymbolKey rows={[
          { s: 's', t: 'The sign bit: 0 for positive, 1 for negative.', e: 's = 1 \\ (-13.625)' },
          { s: '1.f \\times 2^E', t: 'Normalised binary form: exactly one 1 before the point, then the fraction f.', e: '1.101101_2 \\times 2^3' },
          { s: 'E', t: 'The true exponent: how many places the binary point moved.', e: 'E = 3' },
          { s: 'e = E + 127', t: 'The stored (biased) exponent, so negative exponents need no sign. Double precision adds 1023.', e: '3 + 127 = 130' },
          { s: 'f', t: 'The fraction bits after the leading 1 (the 1 itself is not stored), padded with zeros to 23 bits.', e: '10110100\\ldots0' },
          { s: '\\varepsilon', t: 'Machine epsilon: the gap between 1 and the next number. The relative rounding error is at most ε/2.', e: '2^{-23} \\approx 1.19 \\times 10^{-7}' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Store <InlineMath math="-13.625" /> in single precision (32 bits).</ExampleProblem>
        <ExampleStep n={1} title="WHOLE PART TO BINARY (DIVIDE BY 2)">
          <MathPanel>
            <BlockMath math={"13 \\div 2 = 6 \\text{ r } 1, \\quad 6 \\div 2 = 3 \\text{ r } 0, \\quad 3 \\div 2 = 1 \\text{ r } 1, \\quad 1 \\div 2 = 0 \\text{ r } 1"} />
          </MathPanel>
          <StepText>Read the remainders from the bottom up: <InlineMath math="13 = 1101_2" />.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="FRACTION PART TO BINARY (MULTIPLY BY 2)">
          <MathPanel>
            <BlockMath math={"0.625 \\times 2 = 1.25 \\to 1, \\quad 0.25 \\times 2 = 0.5 \\to 0, \\quad 0.5 \\times 2 = 1 \\to 1"} />
          </MathPanel>
          <StepText>Read the whole parts from the top down: <InlineMath math="0.625 = 0.101_2" />, so <InlineMath math="13.625 = 1101.101_2" />.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="NORMALISE AND BIAS THE EXPONENT">
          <MathPanel>
            <BlockMath math={"1101.101_2 = 1.101101_2 \\times 2^{3} \\quad (\\text{point moved 3 places left})"} />
            <BlockMath math={"e = 3 + 127 = 130 = 10000010_2"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={4} title="THE 32 BITS">
          <StepTable
            columns={[{ key: 'part', label: 'Part', bold: true }, { key: 'bits', label: 'Bits', highlight: true }, { key: 'why', label: 'Why' }]}
            rows={[
              { part: 'Sign (1 bit)', bits: '1', why: 'the number is negative' },
              { part: 'Exponent (8 bits)', bits: '10000010', why: '130 = 3 + 127' },
              { part: 'Fraction (23 bits)', bits: '10110100000000000000000', why: 'the bits after "1." in 1.101101, padded with zeros' },
            ]}
            rowKey={(r) => r.part}
          />
          <StepText>Grouped in fours: 1100 0001 0101 1010 0000 … = <strong>C15A0000</strong> in hex. The fraction ended within 23 bits, so the number is stored exactly.</StepText>
        </ExampleStep>
        <Conclusion result="C15A0000" math={<BlockMath math={"1\\ 10000010\\ 10110100000000000000000"} />}>The calculator below opens on 0.1, which cannot be stored exactly: its binary fraction 0.000110011… never ends, so it is rounded.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Storing the leading 1.</>, f: <>In normalised form the first bit is always 1, so it is left out: only the bits after the point go into the fraction.</> },
        { m: <>Forgetting the bias.</>, f: <>Store <InlineMath math="E + 127" /> (single) or <InlineMath math="E + 1023" /> (double), not <InlineMath math="E" /> itself.</> },
        { m: <>Reading the remainders in the wrong order.</>, f: <>Whole part: remainders from the bottom up. Fraction part: whole parts from the top down.</> },
        { m: <>Putting the minus sign into the exponent or fraction.</>, f: <>Convert the size (13.625) and set the sign bit to 1 separately.</> },
        { m: <>Thinking every decimal is exact.</>, f: <>0.1 has a never-ending binary fraction, so it is rounded; the relative error is at most <InlineMath math="\varepsilon/2" />.</> },
        { m: <>Wrong count of bits.</>, f: <>Single: 1 + 8 + 23 = 32. Double: 1 + 11 + 52 = 64. Pad the fraction with zeros on the right.</> },
      ]} />
      <Lab heading="Interactive Floating Point Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["errors-approximations","bisection","newton-raphson"]} />
    </MethodPage>
  );
}
