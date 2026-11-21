'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.laplace-transform';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit13';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is the first shifting theorem?', a: <>Multiplying by eᵃᵗ shifts the transform: <InlineMath math="\mathcal{L}\{e^{at}f(t)\} = F(s - a)" />. So <InlineMath math="\mathcal{L}\{e^{2t}\sin 3t\} = \frac{3}{(s-2)^2 + 9}" />.</> },
  { q: 'How do I transform t·f(t) or f(t)/t?', a: <><InlineMath math="\mathcal{L}\{tf(t)\} = -F'(s)" />, and <InlineMath math="\mathcal{L}\{f(t)/t\} = \int_s^\infty F(u)\,du" /> (when the integral converges, e.g. sin t/t gives tan⁻¹(1/s)).</> },
  { q: 'Why does the transform exist only for some functions?', a: <>The integral <InlineMath math="\int_0^\infty e^{-st}f(t)\,dt" /> must converge for large s, so f may grow at most like an exponential. eᵗ² has no Laplace transform.</> },
];

export default function LaplacePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • TRANSFORMS" title="Laplace Transform Calculator" subtitle="Table, Shifting Theorems and Properties">
        The <strong>Laplace transform</strong> <InlineMath math="F(s) = \int_0^\infty e^{-st}f(t)\,dt" /> turns functions of t into functions of s. Use the table and the shifting and t-multiplication rules, step by step.
      </MethodHeader>
      <FormulaBox label="THE TABLE" tag="L{f(t)}">
        <Formula math={'\\mathcal{L}\\{t^n\\} = \\frac{n!}{s^{n+1}}, \\quad \\mathcal{L}\\{e^{at}\\} = \\frac{1}{s-a}, \\quad \\mathcal{L}\\{\\sin bt\\} = \\frac{b}{s^2+b^2}, \\quad \\mathcal{L}\\{\\cos bt\\} = \\frac{s}{s^2+b^2}'} />
        <FormulaSteps steps={[
          { title: '1. Linearity', text: <>Transform term by term, constants out.</> },
          { title: '2. Rules', text: <>eᵃᵗ shifts s; tⁿ differentiates F.</> },
          { title: '3. Table', text: <>Finish with the standard results.</> },
        ]} />
        <SymbolKey rows={EX['laplace-transform'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['laplace-transform'].example} />
      <CommonMistakes items={EX['laplace-transform'].mistakes} />
      <Lab heading="Interactive Laplace Transform Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['inverse-laplace', 'laplace-ode', 'unit-step']} />
    </MethodPage>
  );
}
