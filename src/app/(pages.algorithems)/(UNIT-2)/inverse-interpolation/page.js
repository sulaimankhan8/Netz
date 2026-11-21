'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.inverse-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion, CommonMistakes, SymbolKey, StepTable,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When does inverse Lagrange work well?", a: <>When y changes steadily (monotone) across the table, so x really is a function of y.</> },
  { q: "How does the iteration method work?", a: <>Write Newton&apos;s forward formula as p = (y − y₀ − higher terms)/Δy₀ and repeat, starting from p = (y − y₀)/Δy₀.</> },
  { q: "Can I use it to solve equations?", a: <>Yes: tabulate f(x) and find x where f = 0.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • INTERPOLATION" title="Inverse Interpolation Calculator" subtitle="Find x for a Given y from a Table">
        <strong>Inverse interpolation</strong> answers the reverse question: for which <InlineMath math={"x"} /> does the table take a given <InlineMath math={"y"} />? Either swap the roles of <InlineMath math={"x"} /> and <InlineMath math={"y"} /> in Lagrange&apos;s formula, or solve Newton&apos;s formula for <InlineMath math={"p"} /> by iteration.
      </MethodHeader>
      <FormulaBox label="INVERSE LAGRANGE" tag="x AS A FUNCTION OF y">
        <Formula math={"x = \\sum_i x_i\\prod_{j \\ne i}\\frac{y - y_j}{y_i - y_j}"} />
        <FormulaSteps steps={[
          { title: "1. Swap", text: <>Treat x as a function of y.</> },
          { title: "2. Interpolate", text: <>At the given y.</> },
          { title: "3. Or iterate", text: <>p from Newton&apos;s formula.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'y', t: 'The given value: we want the x that produces it.', e: 'y = 0.390' },
          { s: 'x_i,\\ y_i', t: 'The table, read backwards: y is now the input and x the output.', e: '(20, 0.342)' },
          { s: '\\prod_{j \\ne i}\\frac{y - y_j}{y_i - y_j}', t: 'The weight of xᵢ: 1 at yᵢ, 0 at every other table y.', e: 'L_0 = 0.224954' },
          { s: 'x', t: 'The answer: each table x times its weight, added up.', e: 'x \\approx 22.93^\\circ' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>From the table of sin x (20°, 25°, 30°, 35°), find x where sin x = 0.390.</ExampleProblem>
        <ExampleStep n={1} title="SWAP THE ROLES OF x AND y">
          <StepTable
            columns={[{ key: 'y', label: 'y = sin x (now the input)', bold: true }, { key: 'x', label: 'x (now the output)' }]}
            rows={[{ y: '0.342', x: '20°' }, { y: '0.423', x: '25°' }, { y: '0.500', x: '30°' }, { y: '0.574', x: '35°' }]}
            rowKey={(r) => r.y}
          />
          <StepText>The y values are not equally spaced, so we use Lagrange&apos;s formula with x and y swapped, at y = 0.390.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="THE WEIGHTS (FIRST ONE IN FULL)">
          <MathPanel>
            <BlockMath math={"L_0 = \\frac{(0.390 - 0.423)(0.390 - 0.5)(0.390 - 0.574)}{(0.342 - 0.423)(0.342 - 0.5)(0.342 - 0.574)} = \\frac{(-0.033)(-0.110)(-0.184)}{(-0.081)(-0.158)(-0.232)} = 0.224954"} />
            <BlockMath math={"L_1 = 1.031571, \\qquad L_2 = -0.323738, \\qquad L_3 = 0.067213"} />
          </MathPanel>
          <StepText>Check: the weights add up to 1 (0.224954 + 1.031571 − 0.323738 + 0.067213 = 1).</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="COMBINE">
          <MathPanel>
            <BlockMath math={"x = 20(0.224954) + 25(1.031571) + 30(-0.323738) + 35(0.067213)"} />
            <BlockMath math={"= 4.499087 + 25.789270 - 9.712135 + 2.352444 = 22.928666"} />
          </MathPanel>
          <StepText>The exact <InlineMath math="\sin^{-1} 0.390 = 22.95^\circ" />; the small gap comes from the 3-decimal sine values in the table.</StepText>
        </ExampleStep>
        <Conclusion result="x ≈ 22.93°" math={<BlockMath math={"x \\approx 22.93^\\circ"} />}>The calculator below opens on this table.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Forgetting to swap x and y.</>, f: <>In inverse interpolation the given y is the input: the products use <InlineMath math="y - y_j" /> over <InlineMath math="y_i - y_j" />, and the result is an x.</> },
        { m: <>Using Newton forward on the y values.</>, f: <>The y values are rarely equally spaced, so use Lagrange (or divided differences).</> },
        { m: <>Sign slips in the products.</>, f: <>Bracket each factor and count the minus signs: three negatives give a negative.</> },
        { m: <>Not checking the weights.</>, f: <>The weights must add up to 1; if not, there is an arithmetic slip.</> },
        { m: <>A table that is not monotonic.</>, f: <>If y goes up and down, one y can match several x values; use only the part of the table where y keeps rising (or falling).</> },
        { m: <>Writing only the final answer.</>, f: <>Show the swapped table, each weight (at least one in full), and the weighted sum.</> },
      ]} />
      <Lab heading="Interactive Inverse Interpolation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange","newton-forward","everett-interpolation"]} />
    </MethodPage>
  );
}
