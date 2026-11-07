'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.modular-arithmetic';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does Euclid's algorithm work?", a: <>Any common divisor of a and b also divides a − qb = r, so gcd(a, b) = gcd(b, r), and the numbers keep shrinking.</> },
  { q: "How does RSA use this?", a: <>The private key d is the inverse of e modulo φ = (p − 1)(q − 1), found by extended Euclid. Then (mᵉ)ᵈ ≡ m (mod n).</> },
  { q: "How are huge powers like 3²⁰⁰ mod 13 done?", a: <>By repeated squaring: square the base, and multiply it in for each 1-bit of the exponent — about log₂ b steps.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • NUMBER THEORY" title="Modular Arithmetic, GCD and RSA" subtitle="Euclid's Algorithm, Inverses, Powers and Congruences">
        <strong>Euclid&apos;s algorithm</strong> finds gcd(a, b) by repeated division; run backwards it writes the gcd as ax + by, which gives <strong>modular inverses</strong> — the key step of RSA encryption.
      </MethodHeader>
      <FormulaBox label="THE TOOLS" tag="mod m">
        <Formula math={"\\gcd(a, b) = \\gcd(b, a \\bmod b), \\qquad a^{-1} \\bmod m \\text{ exists} \\iff \\gcd(a, m) = 1"} />
        <FormulaSteps steps={[
          { title: "1. Divide", text: <>a = qb + r, repeat with (b, r).</> },
          { title: "2. Back-substitute", text: <>gcd = ax + by.</> },
          { title: "3. Use it", text: <>Inverses, congruences, RSA.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find gcd(252, 198).</ExampleProblem>
        <ExampleStep n={1} title="DIVIDE"><MathPanel><BlockMath math={"252 = 1 \\times 198 + 54, \\quad 198 = 3 \\times 54 + 36, \\quad 54 = 1 \\times 36 + 18, \\quad 36 = 2 \\times 18 + 0"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="READ OFF"><StepText>The last non-zero remainder is the gcd.</StepText></ExampleStep>
        <Conclusion result="gcd = 18" math={<BlockMath math={"\\gcd(252, 198) = 18"} />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Modular Arithmetic Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["truth-table","permutations-combinations","factoring"]} />
    </MethodPage>
  );
}
