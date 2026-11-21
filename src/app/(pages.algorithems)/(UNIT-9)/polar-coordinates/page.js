'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.polar-coordinates';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit9';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why not just θ = tan⁻¹(y/x)?", a: <>tan⁻¹ only gives angles in (−π/2, π/2), so points with x &lt; 0 come out in the wrong quadrant. The signs of x and y decide.</> },
  { q: "What does rotating the axes do?", a: <>It describes the same point from axes turned through θ: X = x cos θ + y sin θ, Y = −x sin θ + y cos θ. Distances are unchanged.</> },
  { q: "How do I convert r = 4 cos θ?", a: <>Multiply by r: r² = 4r cos θ, so x² + y² = 4x, a circle through the origin.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • COORDINATE GEOMETRY" title="Polar Coordinates Calculator" subtitle="Polar ↔ Cartesian, Rotation and Translation of Axes">
        A point can be named by its distance <InlineMath math={"r"} /> from the pole and its angle <InlineMath math={"\\theta"} />. Convert between <InlineMath math={"(x, y)"} /> and <InlineMath math={"(r, \\theta)"} /> with the correct quadrant, rotate or shift the axes, and turn a polar curve into an <InlineMath math={"x"} />–<InlineMath math={"y"} /> equation.
      </MethodHeader>
      <FormulaBox label="THE CONVERSIONS" tag="r, θ">
        <Formula math={"x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\qquad r = \\sqrt{x^2 + y^2}, \\quad \\tan\\theta = \\frac{y}{x}"} />
        <FormulaSteps steps={[
          { title: "1. r", text: <>The distance from the origin.</> },
          { title: "2. Quadrant", text: <>Look at the signs of x and y.</> },
          { title: "3. θ", text: <>The angle in that quadrant.</> },
        ]} />
        <SymbolKey rows={EX['polar-coordinates'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['polar-coordinates'].example} />
      <CommonMistakes items={EX['polar-coordinates'].mistakes} />
      <Lab heading="Interactive Polar Coordinates Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["coordinate-geometry","unit-circle","geometry-3d"]} />
    </MethodPage>
  );
}
