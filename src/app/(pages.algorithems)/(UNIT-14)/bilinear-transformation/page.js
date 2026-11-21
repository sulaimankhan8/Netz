'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.bilinear-transformation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit14';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why do three points fix the map?", a: <>A bilinear map has four coefficients but only their ratios matter, so three conditions decide it.</> },
  { q: "How is ∞ handled?", a: <>Any factor of the cross-ratio containing ∞ is left out (it tends to 1).</> },
  { q: "What are fixed points for?", a: <>They classify the map (one fixed point: parabolic; two: elliptic, hyperbolic or loxodromic) and simplify it to a normal form.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Bilinear Transformation Calculator" subtitle="Möbius Maps Through Three Points, Fixed Points and Images">
        A <strong>bilinear (Möbius) transformation</strong> <InlineMath math={"w = \\frac{az + b}{cz + d}"} /> with <InlineMath math={"ad - bc \\ne 0"} /> maps circles and lines to circles and lines. Three points and their images fix it, because the <strong>cross-ratio</strong> is unchanged.
      </MethodHeader>
      <FormulaBox label="THE CROSS-RATIO" tag="z₁, z₂, z₃ ↦ w₁, w₂, w₃">
        <Formula math={"\\frac{(w - w_1)(w_2 - w_3)}{(w - w_3)(w_2 - w_1)} = \\frac{(z - z_1)(z_2 - z_3)}{(z - z_3)(z_2 - z_1)}"} />
        <FormulaSteps steps={[
          { title: "1. Cross-ratio", text: <>Equal on both sides.</> },
          { title: "2. Solve", text: <>For w in terms of z.</> },
          { title: "3. Fixed points", text: <>cz² + (d − a)z − b = 0.</> },
        ]} />
        <SymbolKey rows={EX['bilinear-transformation'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['bilinear-transformation'].example} />
      <CommonMistakes items={EX['bilinear-transformation'].mistakes} />
      <Lab heading="Interactive Bilinear Transformation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["complex-numbers","cauchy-riemann","polar-coordinates"]} />
    </MethodPage>
  );
}
