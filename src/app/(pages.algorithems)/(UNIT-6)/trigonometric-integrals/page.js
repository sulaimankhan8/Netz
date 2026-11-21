'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.trigonometric-integrals';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I integrate sinᵐx cosⁿx?", a: <>If either power is odd, keep one factor of that function for dt and change the rest with sin² + cos² = 1. If both are even, use the half-angle forms.</> },
  { q: "What is trigonometric substitution?", a: <>For <InlineMath math={"\\sqrt{a^2 - x^2}"} /> put x = a sin θ; for <InlineMath math={"\\sqrt{a^2 + x^2}"} /> put x = a tan θ; for <InlineMath math={"\\sqrt{x^2 - a^2}"} /> put x = a sec θ. The results are standard formulas.</> },
  { q: "Why do two methods give different-looking answers?", a: <>They differ by a constant: −cos²x/2 and sin²x/2 are both antiderivatives of sin x cos x, since sin²x = 1 − cos²x.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION TECHNIQUES" title="Trigonometric Integrals" subtitle="Powers of sin and cos, and Trig Substitution">
        Integrate powers and products of <strong>sin and cos</strong>: an odd power gives a substitution, even powers the half-angle forms. Also the <strong>trigonometric substitution</strong> results for <InlineMath math={"\\sqrt{a^2 - x^2}"} /> and <InlineMath math={"\\sqrt{x^2 \\pm a^2}"} />.
      </MethodHeader>
      <FormulaBox label="THE TRICKS" tag="sin² + cos² = 1">
        <Formula math={"\\sin^2 x = \\frac{1 - \\cos 2x}{2}, \\quad \\cos^2 x = \\frac{1 + \\cos 2x}{2}, \\quad \\int \\sqrt{a^2 - x^2}\\,dx = \\frac{x}{2}\\sqrt{a^2 - x^2} + \\frac{a^2}{2}\\sin^{-1}\\frac{x}{a}"} />
        <FormulaSteps steps={[
          { title: "1. Odd power", text: <>Keep one factor, turn the rest with sin² = 1 − cos².</> },
          { title: "2. Even powers", text: <>Half-angle forms, then term by term.</> },
          { title: "3. Roots", text: <>Standard results for √(a² ± x²).</> },
        ]} />
        <SymbolKey rows={EX['trigonometric-integrals'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['trigonometric-integrals'].example} />
      <CommonMistakes items={EX['trigonometric-integrals'].mistakes} />
      <Lab heading="Interactive Trigonometric Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","improper-integrals","area-under-curve"]} />
    </MethodPage>
  );
}
