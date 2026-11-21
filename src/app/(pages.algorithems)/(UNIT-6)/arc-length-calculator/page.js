'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.arc-length-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why are arc-length integrals often hard?", a: <>The square root rarely simplifies. Textbook examples are chosen so that 1 + y′² is a perfect square; otherwise the value is found numerically.</> },
  { q: "What is the length of a full cardioid r = 1 + cos θ?", a: <>r² + r′² = 2 + 2cos θ = 4cos²(θ/2), so L = 8. Try it in the polar mode.</> },
  { q: "How is surface area different?", a: <>Each bit of curve ds sweeps a band of circumference 2πy, so S = 2π∫ y ds.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF INTEGRALS" title="Arc Length and Surface Area" subtitle="Cartesian, Parametric and Polar Curves">
        The <strong>length of a curve</strong> is <InlineMath math={"L = \\int \\sqrt{1 + (dy/dx)^2}\\,dx"} />. Parametric and polar curves have their own forms, and turning the curve about the x-axis gives the <strong>surface area</strong> <InlineMath math={"S = 2\\pi\\int y\\,ds"} />.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="ds">
        <Formula math={"L = \\int_a^b \\sqrt{1 + y'^2}\\,dx = \\int_{t_1}^{t_2} \\sqrt{x'^2 + y'^2}\\,dt = \\int_\\alpha^\\beta \\sqrt{r^2 + r'^2}\\,d\\theta"} />
        <FormulaSteps steps={[
          { title: "1. Differentiate", text: <>y′, or x′ and y′, or r′.</> },
          { title: "2. Simplify", text: <>Often a perfect square under the root.</> },
          { title: "3. Integrate", text: <>Between the limits.</> },
        ]} />
        <SymbolKey rows={EX['arc-length-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['arc-length-calculator'].example} />
      <CommonMistakes items={EX['arc-length-calculator'].mistakes} />
      <Lab heading="Interactive Arc Length Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["volume-revolution","integral","parametric"]} />
    </MethodPage>
  );
}
