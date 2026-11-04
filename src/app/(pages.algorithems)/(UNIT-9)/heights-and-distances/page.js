'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import HeightsCalculator from './algorithems.heights-and-distances';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is the difference between elevation and depression?', a: <>The angle of <strong>elevation</strong> is measured up from the horizontal to something above you; the angle of <strong>depression</strong> is measured down from the horizontal to something below. From A looking up at B, and B looking down at A, the two angles are equal (alternate angles).</> },
  { q: 'Which ratio should I use?', a: <>Almost always <InlineMath math="\tan\theta = \frac{\text{height}}{\text{distance}}" />, since height and ground distance are the two sides you know or want. Use sin or cos only when a slant length (a ladder, a kite string) is involved.</> },
  { q: 'How do I do "walks d metres towards the tower" problems?', a: <>Make two right triangles that share the height h. Write tan of each angle, eliminate the unknown distance x, and solve for h: <InlineMath math="h = \frac{d\tan\alpha\tan\beta}{\tan\alpha - \tan\beta}" />. The same works for shadows lengthening as the sun goes down.</> },
];

export default function HeightsPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • TRIGONOMETRY" title="Heights and Distances" subtitle="Angles of Elevation & Depression, Step by Step">
        Draw the right triangle, then use <InlineMath math="\tan\theta = \frac{\text{opposite}}{\text{adjacent}}" /> to connect the <strong>height</strong>, the <strong>distance</strong> and the <strong>angle</strong>. With 30°, 45° and 60° the answers come out exactly, like <InlineMath math="10\sqrt{3}" /> m.
      </MethodHeader>
      <FormulaBox label="KEY VALUES" tag="tan θ">
        <Formula math={`\\tan 30^\\circ = \\frac{1}{\\sqrt{3}}, \\qquad \\tan 45^\\circ = 1, \\qquad \\tan 60^\\circ = \\sqrt{3}`} />
        <FormulaSteps steps={[
          { title: '1. Draw', text: <>Tower vertical, ground horizontal, the line of sight as the slant side.</> },
          { title: '2. tan θ', text: <>Height over ground distance.</> },
          { title: '3. Solve', text: <>For two angles, eliminate the unknown distance.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>The angle of elevation of the top of a tower changes from 30° to 60° as you walk 20 m towards it. Find the height.</ExampleProblem>
        <ExampleStep n={1} title="TWO TRIANGLES"><MathPanel><BlockMath math="\tan 60^\circ = \frac{h}{x} \Rightarrow h = \sqrt{3}\,x, \qquad \tan 30^\circ = \frac{h}{x + 20} \Rightarrow \sqrt{3}\,h = x + 20" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ELIMINATE x"><MathPanel><BlockMath math="\sqrt{3}\,h = \frac{h}{\sqrt{3}} + 20 \ \Rightarrow \ 3h = h + 20\sqrt{3} \ \Rightarrow \ h = 10\sqrt{3}" /></MathPanel><StepText>And x = h/√3 = 10 m from the nearer point.</StepText></ExampleStep>
        <Conclusion result="h = 10√3 ≈ 17.32 m" math={<BlockMath math="h = 10\sqrt{3} \approx 17.32 \text{ m}" />}>The second example button below loads this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Heights and Distances Calculator"><HeightsCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['triangle-solver', 'pythagoras', 'unit-circle']} />
    </MethodPage>
  );
}
