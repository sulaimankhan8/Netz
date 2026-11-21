'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.inverse-trig-functions';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit9';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is sin⁻¹(sin 5π/6) not 5π/6?", a: <>Because 5π/6 is outside [−π/2, π/2]. The answer is the angle in that range with the same sine: π/6.</> },
  { q: "Is sin⁻¹x the same as 1/sin x?", a: <>No. sin⁻¹x is the inverse function (an angle); 1/sin x is csc x.</> },
  { q: "When does tan⁻¹a + tan⁻¹b need an extra π?", a: <>When a, b &gt; 0 and ab &gt; 1 the sum is more than π/2, so it is π + tan⁻¹((a + b)/(1 − ab)).</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • TRIGONOMETRY" title="Inverse Trigonometric Functions Calculator" subtitle="Principal Values and Identities">
        <InlineMath math={"\\sin^{-1} x"} /> is the angle whose sine is <InlineMath math={"x"} />, taken from the <strong>principal range</strong> so the answer is unique. Find principal values, simplify <InlineMath math={"\\sin^{-1}(\\sin\\theta)"} />, and combine <InlineMath math={"\\tan^{-1}a + \\tan^{-1}b"} />.
      </MethodHeader>
      <FormulaBox label="PRINCIPAL RANGES" tag="ONE ANGLE EACH">
        <Formula math={"\\sin^{-1}: \\left[-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}\\right], \\quad \\cos^{-1}: [0, \\pi], \\quad \\tan^{-1}: \\left(-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}\\right), \\quad \\cot^{-1}: (0, \\pi)"} />
        <FormulaSteps steps={[
          { title: "1. Meaning", text: <>sin⁻¹v = θ means sin θ = v.</> },
          { title: "2. Range", text: <>Pick θ in the principal range.</> },
          { title: "3. Negatives", text: <>sin⁻¹(−x) = −sin⁻¹x; cos⁻¹(−x) = π − cos⁻¹x.</> },
        ]} />
        <SymbolKey rows={EX['inverse-trig-functions'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['inverse-trig-functions'].example} />
      <CommonMistakes items={EX['inverse-trig-functions'].mistakes} />
      <Lab heading="Interactive Inverse Trig Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["trig-equations","trig-identities","unit-circle"]} />
    </MethodPage>
  );
}
