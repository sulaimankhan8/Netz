'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.exact-differential-equation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does exact mean?', a: <>M dx + N dy is the differential of some function u(x, y): <InlineMath math="M = u_x, \ N = u_y" />. The test is <InlineMath math="\frac{\partial M}{\partial y} = \frac{\partial N}{\partial x}" />. The solution is u = C.</> },
  { q: 'What if it is not exact?', a: <>Multiply by an integrating factor. NETZ tries the four textbook rules: <InlineMath math="(M_y - N_x)/N" /> a function of x only, <InlineMath math="(N_x - M_y)/M" /> of y only, homogeneous M and N, and M = yf(xy), N = xg(xy).</> },
  { q: 'Why only the terms of N without x?', a: <>The terms of N that contain x already came from ∫M dx; adding them again would count them twice.</> },
];

export default function ExactOdePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Exact Differential Equations" subtitle="M dx + N dy = 0, and Integrating Factors">
        <InlineMath math="M\,dx + N\,dy = 0" /> is <strong>exact</strong> when <InlineMath math="\frac{\partial M}{\partial y} = \frac{\partial N}{\partial x}" />. Then the solution is <InlineMath math="\int M\,dx + \int(\text{terms of } N \text{ without } x)\,dy = C" />.
      </MethodHeader>
      <FormulaBox label="TEST AND SOLVE" tag="M_y = N_x">
        <Formula math={'\\int_{y\\ \\text{const}} M\\,dx + \\int (\\text{terms of } N \\text{ free of } x)\\,dy = C'} />
        <FormulaSteps steps={[
          { title: '1. Test', text: <>Compare M_y and N_x.</> },
          { title: '2. If not', text: <>Find an integrating factor.</> },
          { title: '3. Integrate', text: <>M in x, leftover N in y.</> },
        ]} />
        <SymbolKey rows={EX['exact-differential-equation'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['exact-differential-equation'].example} />
      <CommonMistakes items={EX['exact-differential-equation'].mistakes} />
      <Lab heading="Interactive Exact Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['partial-derivative', 'homogeneous-ode', 'ode-solver']} />
    </MethodPage>
  );
}
