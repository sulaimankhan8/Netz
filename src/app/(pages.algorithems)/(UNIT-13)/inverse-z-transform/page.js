'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.inverse-z-transform';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit13';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why divide by z first?", a: <>So each partial fraction becomes z/(z − p) after multiplying back, which is exactly the transform of pⁿ.</> },
  { q: "What do complex poles give?", a: <>A conjugate pair re^{'{'}±iθ{'}'} combines into a real term Crⁿcos(nθ + φ), so x(n) stays real.</> },
  { q: "When is long division better?", a: <>When only the first few values are needed, or the bottom does not factor nicely.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • FOURIER & Z TRANSFORMS" title="Inverse Z-Transform Calculator" subtitle="Partial Fractions and Long Division">
        To get the sequence back from <InlineMath math={"F(z)"} />, split <InlineMath math={"\\frac{F(z)}{z}"} /> into <strong>partial fractions</strong>, multiply back by <InlineMath math={"z"} />, and read each term from the table. <strong>Long division</strong> in powers of <InlineMath math={"z^{-1}"} /> gives the first values directly.
      </MethodHeader>
      <FormulaBox label="THE PAIRS" tag="|z| > |p|">
        <Formula math={"\\frac{z}{z - p} \\leftrightarrow p^n, \\qquad \\frac{z}{(z - p)^2} \\leftrightarrow n\\,p^{n-1}, \\qquad \\frac{z}{(z - p)^3} \\leftrightarrow \\frac{n(n - 1)}{2}p^{n-2}"} />
        <FormulaSteps steps={[
          { title: "1. Divide by z", text: <>Partial fractions of F(z)/z.</> },
          { title: "2. Multiply back", text: <>Each term becomes A·z/(z − p).</> },
          { title: "3. Read off", text: <>pⁿ terms; complex pairs give cosines.</> },
        ]} />
        <SymbolKey rows={EX['inverse-z-transform'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['inverse-z-transform'].example} />
      <CommonMistakes items={EX['inverse-z-transform'].mistakes} />
      <Lab heading="Interactive Inverse Z-Transform Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["z-transform","difference-equation-z","inverse-laplace"]} />
    </MethodPage>
  );
}
