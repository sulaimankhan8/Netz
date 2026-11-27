'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.types-of-discontinuity';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What are the types of discontinuity?`,
    a: <Md>{String.raw`Removable (a hole: the two-sided limit exists but $f(a)$ is missing or different), jump (the left and right limits differ) and infinite (a side limit is $\pm\infty$).`}</Md>,
  },
  {
    q: String.raw`What makes a discontinuity removable?`,
    a: <Md>{String.raw`The limit exists. If you redefine $f(a)$ to equal that limit, the break disappears, which is why it is "removable".`}</Md>,
  },
  {
    q: String.raw`How do I type a piecewise function?`,
    a: <Md>{String.raw`Write each piece with a condition and separate them with a semicolon, for example \`x + 1 for x < 0; x - 1 for x >= 0\`.`}</Md>,
  },
  {
    q: String.raw`Are there other kinds of discontinuity?`,
    a: <Md>{String.raw`In a first course these three are enough. Oscillating breaks like $\sin\frac1x$ at 0 are shown as "no limit" and belong to later courses.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • LIMITS & CONTINUITY" title="Types of Discontinuity" subtitle="Holes, Jumps and Asymptotes">
        <Md>{String.raw`A function is **discontinuous** at $a$ when its graph breaks there. There are three kinds of break, and you tell them apart by comparing the **left limit**, the **right limit** and the value $f(a)$. This page finds every break for you and names each one.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE THREE TYPES" tag="compare left, right, f(a)">
        <Formula math={String.raw`\lim_{x\to a^-} f(x) \quad \text{vs} \quad \lim_{x\to a^+} f(x) \quad \text{vs} \quad f(a)`} />
        <FormulaSteps
          steps={[
            { title: String.raw`Removable (a hole)`, text: <Md>{String.raw`Left limit and right limit are equal, but $f(a)$ is missing or different. Filling in the common limit mends the graph.`}</Md> },
            { title: String.raw`Jump`, text: <Md>{String.raw`Left and right limits are both numbers but they are different. The graph jumps from one height to another.`}</Md> },
            { title: String.raw`Infinite (an asymptote)`, text: <Md>{String.raw`A side limit is $\pm\infty$: the graph shoots up or down along a vertical line.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['types-of-discontinuity'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['types-of-discontinuity'].example} />
      <CommonMistakes items={EX['types-of-discontinuity'].mistakes} />

      <Lab heading="Interactive Types of Discontinuity Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["continuity","ivt","asymptotes"]} />
    </MethodPage>
  );
}
