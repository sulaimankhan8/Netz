'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.gradient-descent';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I choose α?", a: <>Small α is safe but slow; too large and the steps overshoot and grow. For x² + 3y², α must be below 1/3 (try 0.4 to see it diverge).</> },
  { q: "Does it find the global minimum?", a: <>Only a local one, near where it starts. For bowl-shaped (convex) functions the local minimum is the global one.</> },
  { q: "Why is it used in machine learning?", a: <>Training means minimising a loss over millions of parameters; the gradient is cheap to compute even then, so these simple steps scale.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOTS & OPTIMISATION" title="Gradient Descent" subtitle="Step by Step, With the Path Drawn">
        <strong>Gradient descent</strong> walks downhill: <InlineMath math={"\\mathbf{x}_{k+1} = \\mathbf{x}_k - \\alpha\\nabla f(\\mathbf{x}_k)"} />. It is how machine-learning models are trained. Watch each step and see what the learning rate α does.
      </MethodHeader>
      <FormulaBox label="THE UPDATE" tag="α">
        <Formula math={"\\mathbf{x}_{k+1} = \\mathbf{x}_k - \\alpha\\,\\nabla f(\\mathbf{x}_k)"} />
        <FormulaSteps steps={[
          { title: "1. Gradient", text: <>The direction of steepest climb.</> },
          { title: "2. Step", text: <>Move α times it the other way.</> },
          { title: "3. Repeat", text: <>Until the gradient is tiny.</> },
        ]} />
        <SymbolKey rows={[
          { s: 'f(x, y)', t: 'The function to minimise: think of it as the height of a landscape.', e: 'x^2 + 3y^2' },
          { s: '\\nabla f', t: 'The gradient: the vector of partial derivatives. It points uphill (steepest climb).', e: '\\nabla f = (2x,\\ 6y)' },
          { s: '\\mathbf{x}_k', t: 'The point after k steps.', e: '\\mathbf{x}_0 = (2, 1)' },
          { s: '\\alpha', t: 'The step size (learning rate). Too small: slow. Too large: the steps overshoot and grow.', e: '\\alpha = 0.1' },
          { s: '-\\alpha\\nabla f', t: 'The move: a small step downhill, opposite to the gradient.', e: '-0.1(4, 6) = (-0.4, -0.6)' },
          { s: '|\\nabla f|', t: 'The size of the gradient. At the minimum it is 0, so we stop when it is tiny.', e: '|\\nabla f(2,1)| = 7.2111' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Minimise <InlineMath math={"f(x, y) = x^2 + 3y^2"} /> from <InlineMath math="(2, 1)" /> with step size <InlineMath math="\alpha = 0.1" />.</ExampleProblem>
        <ExampleStep n={1} title="THE GRADIENT">
          <MathPanel><BlockMath math={"\\frac{\\partial f}{\\partial x} = 2x, \\quad \\frac{\\partial f}{\\partial y} = 6y \\quad\\Rightarrow\\quad \\nabla f = (2x,\\ 6y)"} /></MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="FIRST STEP IN FULL">
          <MathPanel>
            <BlockMath math={"\\nabla f(2, 1) = (2 \\times 2,\\ 6 \\times 1) = (4,\\ 6)"} />
            <BlockMath math={"x_1 = 2 - 0.1(4) = 1.6, \\qquad y_1 = 1 - 0.1(6) = 0.4"} />
            <BlockMath math={"f(2, 1) = 4 + 3 = 7 \\quad\\to\\quad f(1.6, 0.4) = 2.56 + 0.48 = 3.04"} />
          </MathPanel>
          <StepText>The height fell from 7 to 3.04: we moved downhill.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="SECOND STEP IN FULL">
          <MathPanel>
            <BlockMath math={"\\nabla f(1.6, 0.4) = (3.2,\\ 2.4), \\qquad x_2 = 1.6 - 0.32 = 1.28, \\qquad y_2 = 0.4 - 0.24 = 0.16"} />
          </MathPanel>
          <StepText>Each step multiplies x by <InlineMath math="1 - 2\alpha = 0.8" /> and y by <InlineMath math="1 - 6\alpha = 0.4" />, so y settles much faster than x.</StepText>
        </ExampleStep>
        <ExampleStep n={4} title="STEP TABLE">
          <StepTable
            columns={[{ key: 'k', label: 'k', bold: true }, { key: 'p', label: '(x, y)' }, { key: 'g', label: '∇f' }, { key: 'f', label: 'f', highlight: true }]}
            rows={[
              { k: 0, p: '(2, 1)', g: '(4, 6)', f: '7' },
              { k: 1, p: '(1.6, 0.4)', g: '(3.2, 2.4)', f: '3.04' },
              { k: 2, p: '(1.28, 0.16)', g: '(2.56, 0.96)', f: '1.7152' },
              { k: 3, p: '(1.024, 0.064)', g: '(2.048, 0.384)', f: '1.060864' },
              { k: 4, p: '(0.8192, 0.0256)', g: '(1.6384, 0.1536)', f: '0.673055' },
              { k: 5, p: '(0.65536, 0.01024)', g: '(1.31072, 0.06144)', f: '0.429811' },
              { k: '…', p: '', g: '', f: '' },
              { k: 20, p: '(0.023058, 0.00000001)', g: '(0.046117, 0)', f: '0.000532' },
            ]}
            rowKey={(r) => String(r.k)}
          />
        </ExampleStep>
        <Conclusion result="→ (0, 0)" math={<BlockMath math={"(x, y) \\to (0, 0), \\quad f \\to 0"} />}>The true minimum is at (0, 0), where ∇f = 0. The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Adding the gradient instead of subtracting it.</>, f: <>The gradient points uphill; to go down use <InlineMath math="\mathbf{x} - \alpha\nabla f" />.</> },
        { m: <>Choosing α too large.</>, f: <>Here α = 0.4 would multiply y by <InlineMath math="1 - 6(0.4) = -1.4" />: the steps jump past the minimum and grow. Reduce α.</> },
        { m: <>Wrong partial derivatives.</>, f: <>Treat the other variable as a constant: <InlineMath math="\dfrac{\partial}{\partial y}(x^2 + 3y^2) = 6y" />.</> },
        { m: <>Using the new x when working out the gradient for y.</>, f: <>Both parts of the gradient use the same old point.</> },
        { m: <>Stopping when f is small.</>, f: <>Stop when <InlineMath math="|\nabla f|" /> (or the step) is tiny; f itself need not be 0 at the minimum.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the gradient formula, the first step with numbers, and a table of the steps.</> },
      ]} />
      <Lab heading="Interactive Gradient Descent Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["golden-section","newton-system","maxima-minima-2var"]} />
    </MethodPage>
  );
}
