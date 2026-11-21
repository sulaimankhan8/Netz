'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.complex-fourier-series';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit13';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How are cₙ and aₙ, bₙ related?", a: <>cₙ = (aₙ − ibₙ)/2 and c₋ₙ = (aₙ + ibₙ)/2 for n ≥ 1, and c₀ = a₀/2.</> },
  { q: "What does Parseval mean physically?", a: <>The energy of a signal is the sum of the energies in its frequencies; |cₙ|² is the power at frequency n.</> },
  { q: "Why is the Parseval check approximate?", a: <>With jumps the |cₙ|² fall off like 1/n², so the sum converges slowly; NETZ adds 801 terms and compares.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • FOURIER & Z TRANSFORMS" title="Complex Fourier Series Calculator" subtitle="cₙ, the Exponential Form and Parseval's Identity">
        The <strong>complex form</strong> of a Fourier series uses <InlineMath math={"e^{in\\pi x/L}"} /> instead of sines and cosines: one coefficient <InlineMath math={"c_n"} /> per frequency, for <InlineMath math={"n"} /> from <InlineMath math={"-\\infty"} /> to <InlineMath math={"\\infty"} />. <strong>Parseval&apos;s identity</strong> says the mean square of <InlineMath math={"f"} /> is the sum of <InlineMath math={"|c_n|^2"} />.
      </MethodHeader>
      <FormulaBox label="THE COEFFICIENTS" tag="PERIOD 2L">
        <Formula math={"f(x) = \\sum_{n=-\\infty}^{\\infty} c_n e^{in\\pi x/L}, \\quad c_n = \\frac{1}{2L}\\int_{c}^{c + 2L} f(x)\\,e^{-in\\pi x/L}dx = \\frac{a_n - ib_n}{2}"} />
        <FormulaSteps steps={[
          { title: "1. aₙ, bₙ", text: <>The real coefficients.</> },
          { title: "2. cₙ", text: <>(aₙ − ibₙ)/2, with c₋ₙ = c̄ₙ for real f.</> },
          { title: "3. Parseval", text: <>Mean square = Σ|cₙ|².</> },
        ]} />
        <SymbolKey rows={EX['complex-fourier-series'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['complex-fourier-series'].example} />
      <CommonMistakes items={EX['complex-fourier-series'].mistakes} />
      <Lab heading="Interactive Complex Fourier Series Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["fourier-series","fourier-transform","complex-numbers"]} />
    </MethodPage>
  );
}
