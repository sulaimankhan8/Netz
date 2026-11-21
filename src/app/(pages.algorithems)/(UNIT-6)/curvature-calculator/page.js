'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.curvature-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What happens at an inflection point?", a: <>y″ = 0, so κ = 0 and ρ is infinite: the curve is momentarily straight.</> },
  { q: "Why the 3/2 power?", a: <>κ = |dψ/ds|; with tan ψ = y′ and ds = √(1 + y′²) dx the chain rule gives y″/(1 + y′²)^{'{'}3/2{'}'}.</> },
  { q: "What is the circle of curvature?", a: <>The circle with radius ρ centred at the centre of curvature: it has the same tangent and the same bending as the curve at that point.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Radius of Curvature Calculator" subtitle="Cartesian, Parametric and Polar Curves">
        The <strong>curvature</strong> <InlineMath math={"\\kappa"} /> measures how fast a curve turns; the <strong>radius of curvature</strong> <InlineMath math={"\\rho = 1/\\kappa"} /> is the radius of the circle that fits the curve best at a point, centred at the <strong>centre of curvature</strong>.
      </MethodHeader>
      <FormulaBox label="THE THREE FORMS" tag="ρ = 1/κ">
        <Formula math={"\\rho = \\frac{(1 + y'^2)^{3/2}}{|y''|}, \\qquad \\rho = \\frac{(\\dot x^2 + \\dot y^2)^{3/2}}{|\\dot x\\ddot y - \\dot y\\ddot x|}, \\qquad \\rho = \\frac{(r^2 + r'^2)^{3/2}}{|r^2 + 2r'^2 - rr''|}"} />
        <FormulaSteps steps={[
          { title: "1. Derivatives", text: <>y′ and y″ (or the t, θ ones).</> },
          { title: "2. At the point", text: <>Put the numbers in.</> },
          { title: "3. Formula", text: <>ρ, κ and the centre.</> },
        ]} />
        <SymbolKey rows={EX['curvature-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['curvature-calculator'].example} />
      <CommonMistakes items={EX['curvature-calculator'].mistakes} />
      <Lab heading="Interactive Radius of Curvature Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["tangent-normal","parametric","polar-coordinates"]} />
    </MethodPage>
  );
}
