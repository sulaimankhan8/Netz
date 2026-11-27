'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.curve-tracing-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What are the steps of curve tracing?`,
    a: <Md>{String.raw`Domain, symmetry, intercepts, asymptotes, increasing and decreasing (using $f'$), turning points, concavity (using $f″$), inflection points, then sketch.`}</Md>,
  },
  {
    q: String.raw`What does concave up mean?`,
    a: <Md>{String.raw`The curve bends like a cup: the slope is increasing. It happens where $f″(x) > 0$.`}</Md>,
  },
  {
    q: String.raw`How do I find an inflection point?`,
    a: <Md>{String.raw`Solve $f″(x) = 0$ and check the sign of $f″$ changes on either side of the solution.`}</Md>,
  },
  {
    q: String.raw`Does it work for fractions?`,
    a: <Md>{String.raw`Yes: it finds vertical asymptotes where the bottom is 0 and horizontal or slanted asymptotes far out, and draws them as dashed lines.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="Curve Tracing" subtitle="Sketching a Graph from Its Derivatives">
        <Md>{String.raw`**Curve tracing** means drawing the graph of $y = f(x)$ without plotting hundreds of points. Instead you collect facts: where it is defined, whether it is symmetric, where it crosses the axes, what lines it hugs, where it climbs and falls, and where it bends. Then you join the facts into a sketch.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE CHECKLIST" tag="six steps">
        <Formula math={String.raw`\text{domain, symmetry} \to \text{intercepts} \to \text{asymptotes} \to f'(x) \to f''(x) \to \text{sketch}`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Domain, symmetry and intercepts`, text: <Md>{String.raw`Where is $f$ defined? Is $f(-x) = f(x)$ (even) or $f(-x) = -f(x)$ (odd)? Put $x = 0$ and $f(x) = 0$ for the intercepts.`}</Md> },
            { title: String.raw`2. Asymptotes`, text: <Md>{String.raw`Vertical lines where $f$ blows up, and horizontal or slanted lines it approaches far out.`}</Md> },
            { title: String.raw`3. First derivative`, text: <Md>{String.raw`$f'(x) > 0$: rising; $f'(x) < 0$: falling. A change from rising to falling is a local maximum; the other way is a local minimum.`}</Md> },
            { title: String.raw`4. Second derivative`, text: <Md>{String.raw`$f''(x) > 0$: bending up (like a cup); $f''(x) < 0$: bending down (like a cap). A change of bend is an inflection point.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['curve-tracing-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['curve-tracing-calculator'].example} />
      <CommonMistakes items={EX['curve-tracing-calculator'].mistakes} />

      <Lab heading="Interactive Curve Tracing Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["maxima-minima","asymptotes","monotonicity"]} />
    </MethodPage>
  );
}
