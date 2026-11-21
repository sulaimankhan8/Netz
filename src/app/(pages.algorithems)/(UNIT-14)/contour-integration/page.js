'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.contour-integration';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit14';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why only the upper half-plane?", a: <>The contour is the real axis plus a large semicircle above it. When the bottom has degree at least 2 more than the top, the semicircle part tends to 0, leaving the real integral.</> },
  { q: "How are cos mx and sin mx handled?", a: <>Integrate P(z)e^{'{'}imz{'}'}/Q(z) instead and take the real or imaginary part; Jordan&apos;s lemma makes the semicircle vanish.</> },
  { q: "What if a pole is on the real axis?", a: <>The integral then needs a principal value, which this page does not cover.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Contour Integration Calculator" subtitle="Real Integrals by the Residue Theorem">
        Two kinds of real integral fall to residues. Over a period, put <InlineMath math={"z = e^{i\\theta}"} /> so the integral runs round <InlineMath math={"|z| = 1"} />. Over the whole line, close the contour with a large semicircle in the upper half-plane.
      </MethodHeader>
      <FormulaBox label="THE SUBSTITUTION" tag="z = e^{iθ}">
        <Formula math={"\\cos\\theta = \\frac{z + z^{-1}}{2}, \\quad \\sin\\theta = \\frac{z - z^{-1}}{2i}, \\quad d\\theta = \\frac{dz}{iz}, \\qquad \\int_{-\\infty}^{\\infty}\\frac{P}{Q}dx = 2\\pi i\\sum_{\\operatorname{Im}a > 0}\\operatorname{Res}"} />
        <FormulaSteps steps={[
          { title: "1. Change variable", text: <>z = e^{'{'}iθ{'}'}, or x → z.</> },
          { title: "2. Poles", text: <>Inside |z| = 1, or in the upper half-plane.</> },
          { title: "3. Residues", text: <>Multiply their sum by 2πi.</> },
        ]} />
        <SymbolKey rows={EX['contour-integration'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['contour-integration'].example} />
      <CommonMistakes items={EX['contour-integration'].mistakes} />
      <Lab heading="Interactive Contour Integration Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["residues","improper-integrals","cauchy-integral"]} />
    </MethodPage>
  );
}
