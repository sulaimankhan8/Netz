'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.asymptotes-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Can a graph cross an asymptote?", a: <>A horizontal or oblique one, yes (x/(x² + 1) crosses y = 0). A vertical one, never.</> },
  { q: "Why does eˣ have only one horizontal asymptote?", a: <>eˣ → 0 as x → −∞, but grows without bound as x → +∞, so y = 0 is an asymptote on the left only.</> },
  { q: "How do I spot an oblique asymptote?", a: <>For a fraction of polynomials, when the top has degree one more than the bottom. Long division gives the line directly.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • LIMITS & CONTINUITY" title="Asymptotes Calculator" subtitle="Vertical, Horizontal and Oblique">
        Find every <strong>asymptote</strong> of y = f(x): vertical lines where f → ±∞, horizontal lines <InlineMath math={"y = \\lim_{x\\to\\pm\\infty} f"} />, and oblique lines <InlineMath math={"y = mx + c"} />, drawn with the graph.
      </MethodHeader>
      <FormulaBox label="THE LIMITS" tag="y = mx + c">
        <Formula math={"m = \\lim_{x\\to\\infty}\\frac{f(x)}{x}, \\qquad c = \\lim_{x\\to\\infty}\\left(f(x) - mx\\right)"} />
        <FormulaSteps steps={[
          { title: "1. Vertical", text: <>Where the denominator is 0 (and f → ±∞).</> },
          { title: "2. Horizontal", text: <>Limits at ±∞.</> },
          { title: "3. Oblique", text: <>m and c when f grows like a line.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the asymptotes of <InlineMath math={"f(x) = \\frac{x^2 + 1}{x - 1}"} />.</ExampleProblem>
        <ExampleStep n={1} title="VERTICAL"><MathPanel><BlockMath math={"x - 1 = 0 \\Rightarrow x = 1, \\quad f \\to \\pm\\infty"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="OBLIQUE"><MathPanel><BlockMath math={"m = \\lim \\frac{x^2 + 1}{x(x - 1)} = 1, \\qquad c = \\lim\\left(\\frac{x^2 + 1}{x - 1} - x\\right) = 1"} /></MathPanel><StepText>No horizontal asymptote: f grows without bound.</StepText></ExampleStep>
        <Conclusion result="x = 1 and y = x + 1" math={<BlockMath math={"x = 1, \\qquad y = x + 1"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Asymptote Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["limit","continuity","monotonicity"]} />
    </MethodPage>
  );
}
