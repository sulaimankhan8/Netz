'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.line-integral';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When does the path not matter?", a: <>When curl F = 0 (a conservative field): then F = ∇φ and the work is φ(end) − φ(start). Round a closed path it is 0.</> },
  { q: "How do I enter a broken line?", a: <>Type points joined by arrows, like (0,0) -&gt; (1,0) -&gt; (1,1). Each segment is r = p + t(q − p) for 0 ≤ t ≤ 1.</> },
  { q: "Which way round?", a: <>The direction matters for work: going the other way changes the sign. ∫ f ds does not depend on the direction.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Line Integral Calculator" subtitle="Work Done Along a Curve, Step by Step">
        A <strong>line integral</strong> adds a quantity along a curve. For a force <InlineMath math={"\\mathbf{F}"} /> it gives the <strong>work done</strong> <InlineMath math={"\\int_C \\mathbf{F}\\cdot d\\mathbf{r}"} />; for a function <InlineMath math={"f"} /> it gives <InlineMath math={"\\int_C f\\,ds"} />, which is the arc length when <InlineMath math={"f = 1"} />.
      </MethodHeader>
      <FormulaBox label="ALONG r(t)" tag="a ≤ t ≤ b">
        <Formula math={"\\int_C \\mathbf{F}\\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}(\\mathbf{r}(t))\\cdot\\mathbf{r}'(t)\\,dt, \\qquad \\int_C f\\,ds = \\int_a^b f(\\mathbf{r}(t))\\,|\\mathbf{r}'(t)|\\,dt"} />
        <FormulaSteps steps={[
          { title: "1. Parametrise", text: <>r(t) and r′(t).</> },
          { title: "2. Substitute", text: <>F(r(t))·r′(t), one function of t.</> },
          { title: "3. Integrate", text: <>From t = a to t = b.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the work done by F = (3x² + 6y)i − 14yz j + 20xz² k along x = t, y = t², z = t³ from t = 0 to 1.</ExampleProblem>
        <ExampleStep n={1} title="SUBSTITUTE"><MathPanel><BlockMath math={"\\mathbf{F}\\cdot\\mathbf{r}' = (3t^2 + 6t^2)\\cdot 1 - 14t^5\\cdot 2t + 20t^7\\cdot 3t^2 = 9t^2 - 28t^6 + 60t^9"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE"><MathPanel><BlockMath math={"W = \\int_0^1 (9t^2 - 28t^6 + 60t^9)\\,dt = 3 - 4 + 6"} /></MathPanel></ExampleStep>
        <Conclusion result="W = 5" math={<BlockMath math={"W = 5"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Line Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["greens-theorem","grad-div-curl","arc-length"]} />
    </MethodPage>
  );
}
