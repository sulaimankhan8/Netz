'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.golden-section-search';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why the golden ratio?", a: <>With φ = 0.618, one of the two points of the new interval is always an old point, so each step needs only one new function value.</> },
  { q: "How fast does it converge?", a: <>The interval shrinks by 0.618 each step: about 15 steps to cut it to a thousandth.</> },
  { q: "What if f has several minima?", a: <>It finds one of them, not necessarily the lowest. Give a or b so that only one minimum lies between them.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOTS & OPTIMISATION" title="Golden Section Search" subtitle="Minimise or Maximise Without Derivatives">
        <strong>Golden section search</strong> shrinks [a, b] around the minimum of a unimodal f by the golden ratio <InlineMath math={"\\varphi \\approx 0.618"} /> each step, reusing one old point — no derivatives needed.
      </MethodHeader>
      <FormulaBox label="THE STEP" tag="φ = 0.618">
        <Formula math={"x_1 = b - \\varphi(b - a), \\quad x_2 = a + \\varphi(b - a), \\quad \\varphi = \\frac{\\sqrt{5} - 1}{2}"} />
        <FormulaSteps steps={[
          { title: "1. Two points", text: <>x₁ and x₂ inside [a, b].</> },
          { title: "2. Compare", text: <>Keep the side with the better point.</> },
          { title: "3. Repeat", text: <>One new f value per step.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'f(x)', t: 'The function to minimise (or maximise). It must have a single lowest point in [a, b].', e: 'x^2 - 4x + 5' },
          { s: '[a,\\ b]', t: 'The interval that still contains the minimum. It shrinks every step.', e: '[0,\\ 5]' },
          { s: '\\varphi', t: 'The golden ratio number 0.618…. Using it means one of the two points can be reused next step, so each step needs only one new f value.', e: '\\varphi = 0.618034' },
          { s: 'x_1,\\ x_2', t: 'The two inner points, placed symmetrically at 0.382 and 0.618 of the way across.', e: 'x_1 = 1.90983,\\ x_2 = 3.09017' },
          { s: 'f(x_1),\\ f(x_2)', t: 'Compare them: the minimum cannot be beyond the worse point, so cut that end off.', e: '1.008 < 2.188' },
          { s: 'x^*', t: 'The answer: the middle of the final small interval.', e: 'x^* \\approx 2' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Minimise <InlineMath math={"f(x) = x^2 - 4x + 5"} /> on [0, 5], until the interval is narrower than 0.001.</ExampleProblem>
        <ExampleStep n={1} title="FIRST TWO POINTS">
          <MathPanel>
            <BlockMath math={"x_1 = b - \\varphi(b - a) = 5 - 0.618034(5) = 1.90983"} />
            <BlockMath math={"x_2 = a + \\varphi(b - a) = 0 + 0.618034(5) = 3.09017"} />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="COMPARE (STEP 1 IN FULL)">
          <MathPanel>
            <BlockMath math={"f(1.90983) = 1.90983^2 - 4(1.90983) + 5 = 1.008131"} />
            <BlockMath math={"f(3.09017) = 3.09017^2 - 4(3.09017) + 5 = 2.188471"} />
          </MathPanel>
          <StepText><InlineMath math="f(x_1) < f(x_2)" />, so the minimum is not to the right of <InlineMath math="x_2" />: keep <InlineMath math="[a, x_2] = [0, 3.09017]" />.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="STEP 2: REUSE A POINT">
          <MathPanel>
            <BlockMath math={"\\text{new } x_2 = \\text{old } x_1 = 1.90983 \\ (\\text{already known: } f = 1.008131)"} />
            <BlockMath math={"\\text{new } x_1 = 3.09017 - 0.618034(3.09017) = 1.18034, \\quad f(1.18034) = 1.671843"} />
          </MathPanel>
          <StepText>Now <InlineMath math="f(x_1) > f(x_2)" />, so keep <InlineMath math="[x_1, b] = [1.18034, 3.09017]" />. Only one new f value was needed.</StepText>
        </ExampleStep>
        <ExampleStep n={4} title="THE FIRST STEPS IN A TABLE">
          <StepTable
            columns={[{ key: 'k', label: 'k', bold: true }, { key: 'ab', label: '[a, b]' }, { key: 'x', label: 'x₁, x₂' }, { key: 'f', label: 'f(x₁), f(x₂)' }, { key: 'keep', label: 'Keep', highlight: true }]}
            rows={[
              { k: 1, ab: '[0, 5]', x: '1.90983, 3.09017', f: '1.008131, 2.188471', keep: '[a, x₂]' },
              { k: 2, ab: '[0, 3.09017]', x: '1.18034, 1.90983', f: '1.671843, 1.008131', keep: '[x₁, b]' },
              { k: 3, ab: '[1.18034, 3.09017]', x: '1.90983, 2.36068', f: '1.008131, 1.130090', keep: '[a, x₂]' },
              { k: 4, ab: '[1.18034, 2.36068]', x: '1.63119, 1.90983', f: '1.136021, 1.008131', keep: '[x₁, b]' },
              { k: 5, ab: '[1.63119, 2.36068]', x: '1.90983, 2.08204', f: '1.008131, 1.006730', keep: '[x₁, b]' },
              { k: '…', ab: '', x: '', f: '', keep: '' },
              { k: 18, ab: '[1.999333, 2.000198]', x: '', f: '', keep: 'width < 0.001' },
            ]}
            rowKey={(r) => String(r.k)}
          />
          <StepText>Each step multiplies the width by 0.618: <InlineMath math="5 \times 0.618^{18} < 0.001" />, so 18 steps.</StepText>
        </ExampleStep>
        <Conclusion result="x* ≈ 2, f = 1" math={<BlockMath math={"x^* \\approx \\frac{1.999333 + 2.000198}{2} = 1.999766, \\quad f(x^*) \\approx 1"} />}>The exact minimum is at x = 2 (from f′(x) = 2x − 4 = 0). The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Cutting off the wrong end.</>, f: <>For a minimum, throw away the part beyond the point with the <strong>larger</strong> f value. For a maximum, the smaller.</> },
        { m: <>Working out both points again every step.</>, f: <>One old point is always reused: the new <InlineMath math="x_2" /> is the old <InlineMath math="x_1" /> (or the other way round).</> },
        { m: <>Using 0.5 instead of 0.618.</>, f: <>With halves the two points coincide; the golden ratio keeps them apart and lets one be reused.</> },
        { m: <>Using it on a function with several dips in [a, b].</>, f: <>The method assumes a single minimum (unimodal) in the interval; otherwise it may find a local one.</> },
        { m: <>Giving x₁ or x₂ as the answer.</>, f: <>The answer is the middle of the final interval.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the first two points, the comparison, which end you keep, and a table of the steps.</> },
      ]} />
      <Lab heading="Interactive Golden Section Search Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["gradient-descent","bisection","maxima-minima"]} />
    </MethodPage>
  );
}
