'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.standard-integrals-table';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What are the standard integral formulae?`,
    a: <Md>{String.raw`The short list every method ends with: powers of $x$, $\frac1x$, $e^x$, $a^x$, sine, cosine, $\sec^2 x$, $\csc^2 x$, $\sec x\tan x$, $\frac{1}{1+x^2}$ and $\frac{1}{\sqrt{1-x^2}}$. The table below the calculator lists them.`}</Md>,
  },
  {
    q: String.raw`Why is there a + C?`,
    a: <Md>{String.raw`Different functions can have the same derivative if they differ by a constant, so the antiderivative is only known up to a constant.`}</Md>,
  },
  {
    q: String.raw`What if the inside is not just x?`,
    a: <Md>{String.raw`If it is a linear $ax + b$, divide the formula by $a$. If it is anything more complicated, try u-substitution.`}</Md>,
  },
  {
    q: String.raw`How do I check my answer?`,
    a: <Md>{String.raw`Differentiate it. You must get the original function back.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION" title="Standard Integrals" subtitle="The Basic Formulae Every Method Ends With">
        <Md>{String.raw`Every integration method, from substitution to parts, ends with a **standard integral**: one of a short list of formulae to learn. Each is just a derivative rule read backwards. This page has the table, and a calculator that tells you which formula was used at each step.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE BASIC TABLE" tag="read derivatives backwards">
        <Formula math={String.raw`\int x^n\,dx = \frac{x^{n+1}}{n+1} \ (n \neq -1), \quad \int \frac{1}{x}\,dx = \ln|x|, \quad \int e^x\,dx = e^x, \quad \int \sin x\,dx = -\cos x, \quad \int \cos x\,dx = \sin x`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Spot the form`, text: <Md>{String.raw`Match the integrand to a row of the table: a power of $x$, $\frac1x$, an exponential, a trig function, or one of the inverse-trig forms.`}</Md> },
            { title: String.raw`2. Use the formula`, text: <Md>{String.raw`Write the antiderivative from the table. If the inside is $ax + b$ instead of plain $x$, also divide by $a$.`}</Md> },
            { title: String.raw`3. Add + C`, text: <Md>{String.raw`An indefinite integral always ends with the constant of integration.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['standard-integrals-table'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['standard-integrals-table'].example} />
      <CommonMistakes items={EX['standard-integrals-table'].mistakes} />

      <Lab heading="Interactive Standard Integrals Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","u-substitution","integration-by-parts"]} />
    </MethodPage>
  );
}
