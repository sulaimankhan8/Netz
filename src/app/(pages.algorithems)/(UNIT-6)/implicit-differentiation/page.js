'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ImplicitCalculator from './algorithems.implicit-differentiation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'Why does y² become 2y dy/dx?',
    a: <>y is a function of x, so <InlineMath math="y^2" /> is a function of a function. The chain rule gives <InlineMath math="\frac{d}{dx}(y^2) = 2y \cdot \frac{dy}{dx}" />: differentiate as if y were x, then multiply by dy/dx.</>,
  },
  {
    q: 'Why does the answer contain both x and y?',
    a: <>Because the curve is not one function y = f(x). A circle has two y-values for most x, and the slope depends on which point you mean. Put in the point (x, y) to get a number.</>,
  },
  {
    q: 'What if the bottom of dy/dx is 0?',
    a: <>Then the tangent is vertical. On <InlineMath math="x^2 + y^2 = 25" />, dy/dx = −x/y, and at (5, 0) the bottom is 0: the tangent there is the vertical line x = 5.</>,
  },
];

export default function ImplicitPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Implicit Differentiation" subtitle="dy/dx Without Solving for y">
        When x and y are mixed in one equation, differentiate <strong>both sides</strong> with respect to x, treating y as a function of x (so every y-term gets a factor <InlineMath math="\frac{dy}{dx}" />), then solve for <InlineMath math="\frac{dy}{dx}" />.
      </MethodHeader>

      <FormulaBox label="THE METHOD" tag="y = y(x)">
        <Formula math={`\\frac{d}{dx}\\left[y^n\\right] = n\\,y^{n-1}\\,\\frac{dy}{dx} \\qquad \\frac{d}{dx}\\left[xy\\right] = y + x\\,\\frac{dy}{dx}`} />
        <FormulaSteps
          steps={[
            { title: '1. Differentiate every term', text: <>x-terms as usual; y-terms with the chain rule (× dy/dx); xy-terms with the product rule.</> },
            { title: '2. Collect', text: <>Bring all dy/dx terms to one side and everything else to the other.</> },
            { title: '3. Divide', text: <>Factor out dy/dx and divide by what is left.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find <InlineMath math="\frac{dy}{dx}" /> for the circle <InlineMath math="x^2 + y^2 = 25" />, and the slope at (3, 4).
        </ExampleProblem>
        <ExampleStep n={1} title="DIFFERENTIATE BOTH SIDES">
          <MathPanel><BlockMath math="2x + 2y\,\frac{dy}{dx} = 0" /></MathPanel>
          <StepText>x² gives 2x; y² gives 2y dy/dx (chain rule); the constant 25 gives 0.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="SOLVE FOR dy/dx">
          <MathPanel><BlockMath math="2y\,\frac{dy}{dx} = -2x \quad \Rightarrow \quad \frac{dy}{dx} = -\frac{x}{y}" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="PUT IN THE POINT">
          <MathPanel><BlockMath math="\frac{dy}{dx}\Big|_{(3,\,4)} = -\frac{3}{4}" /></MathPanel>
          <StepText>The radius to (3, 4) has slope 4/3; the tangent is at right angles to it, slope −3/4 ✓</StepText>
        </ExampleStep>
        <Conclusion result="dy/dx = −x/y, slope −3/4 at (3, 4)" math={<BlockMath math="\frac{dy}{dx} = -\frac{x}{y}" />}>
          The calculator below opens on this circle. Try the folium x³ + y³ = 6xy for a harder one.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Implicit Differentiation Calculator">
        <ImplicitCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'parametric', 'logarithmic']} />
    </MethodPage>
  );
}
