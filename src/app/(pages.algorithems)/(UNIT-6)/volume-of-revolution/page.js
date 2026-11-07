'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.volume-of-revolution';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When should I use shells instead of washers?", a: <>When the axis is vertical (the y-axis or x = k) and the curves are given as y = f(x): shells avoid solving for x.</> },
  { q: "What are R and r?", a: <>For a washer, R is the distance from the axis to the far curve and r to the near one. With no hole, r = 0 and it is a disc.</> },
  { q: "Can I check with a known shape?", a: <>Turning y = √(r² − x²) about the x-axis gives a sphere: V = 4πr³/3. Try the sphere example.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF INTEGRALS" title="Volume of Revolution" subtitle="Disc, Washer and Shell Methods">
        Turn a region about an axis and find the volume of the solid: <strong>discs or washers</strong> <InlineMath math={"V = \\pi\\int (R^2 - r^2)\\,dx"} /> about a horizontal axis, <strong>shells</strong> <InlineMath math={"V = 2\\pi\\int x\\,h\\,dx"} /> about a vertical one.
      </MethodHeader>
      <FormulaBox label="THE METHODS" tag="DISC • SHELL">
        <Formula math={"V_{\\text{washer}} = \\pi\\int_a^b (R^2 - r^2)\\,dx, \\qquad V_{\\text{shell}} = 2\\pi\\int_a^b (\\text{radius})(\\text{height})\\,dx"} />
        <FormulaSteps steps={[
          { title: "1. Sketch", text: <>The region and the axis.</> },
          { title: "2. Radii", text: <>R and r (washers) or radius and height (shells).</> },
          { title: "3. Integrate", text: <>From a to b.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Turn the region under <InlineMath math={"y = \\sqrt{x}"} />, 0 ≤ x ≤ 4, about the x-axis.</ExampleProblem>
        <ExampleStep n={1} title="DISCS"><MathPanel><BlockMath math={"V = \\pi\\int_0^4 (\\sqrt{x})^2\\,dx = \\pi\\int_0^4 x\\,dx"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE"><MathPanel><BlockMath math={"= \\pi\\left[\\frac{x^2}{2}\\right]_0^4 = 8\\pi"} /></MathPanel></ExampleStep>
        <Conclusion result="8π" math={<BlockMath math={"V = 8\\pi"} />}>The calculator below opens on this region.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Volume of Revolution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["area-under-curve","arc-length","double-integral"]} />
    </MethodPage>
  );
}
