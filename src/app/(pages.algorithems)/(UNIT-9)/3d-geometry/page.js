'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.3d-geometry';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit9';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What are direction cosines?", a: <>The cosines of the angles a line makes with the x, y and z axes. They are the direction ratios divided by the length, so l² + m² + n² = 1.</> },
  { q: "What are skew lines?", a: <>Lines in space that are neither parallel nor meeting. The shortest distance is along their common perpendicular, the direction b₁ × b₂.</> },
  { q: "Why |a·b| in the angle formula?", a: <>Lines have no preferred direction, so the acute angle is taken.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • COORDINATE GEOMETRY" title="3D Geometry Calculator" subtitle="Direction Cosines, Lines, Planes, Angles and Shortest Distance">
        Work with points, lines and planes in space using vectors: <strong>direction cosines</strong>, equations of lines and planes, angles between them, the distance from a point to a plane and the <strong>shortest distance</strong> between skew lines.
      </MethodHeader>
      <FormulaBox label="SHORTEST DISTANCE" tag="SKEW LINES">
        <Formula math={"D = \\frac{\\left|(\\vec a_2 - \\vec a_1) \\cdot (\\vec b_1 \\times \\vec b_2)\\right|}{\\left|\\vec b_1 \\times \\vec b_2\\right|}, \\qquad D_{\\text{plane}} = \\frac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}"} />
        <FormulaSteps steps={[
          { title: "1. Vectors", text: <>Directions and normals as vectors.</> },
          { title: "2. Dot / cross", text: <>Angles from dot products; normals from cross products.</> },
          { title: "3. Formula", text: <>Divide by the right length.</> },
        ]} />
        <SymbolKey rows={EX['3d-geometry'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['3d-geometry'].example} />
      <CommonMistakes items={EX['3d-geometry'].mistakes} />
      <Lab heading="Interactive 3D Geometry Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["vectors","coordinate-geometry","polar-coordinates"]} />
    </MethodPage>
  );
}
