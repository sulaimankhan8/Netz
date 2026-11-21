'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.harmonic-conjugate';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit14';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why put x = z and y = 0?", a: <>Both sides of f′(z) = uₓ − i u_y are analytic, so if they agree on the real axis (y = 0) they agree everywhere. That turns the right side into a function of z.</> },
  { q: "Is the conjugate unique?", a: <>Up to an added constant: v + C works for any real C.</> },
  { q: "What if u is not harmonic?", a: <>Then it is not the real part of any analytic function, and no conjugate exists.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Harmonic Conjugate Calculator" subtitle="Milne-Thomson Method, Step by Step">
        A function is <strong>harmonic</strong> when <InlineMath math={"u_{xx} + u_{yy} = 0"} />. Every harmonic <InlineMath math={"u"} /> is the real part of an analytic <InlineMath math={"f"} />; its partner <InlineMath math={"v"} /> is the <strong>harmonic conjugate</strong>. The Milne-Thomson method finds <InlineMath math={"f(z)"} /> directly.
      </MethodHeader>
      <FormulaBox label="MILNE-THOMSON" tag="x = z, y = 0">
        <Formula math={"f'(z) = u_x(z, 0) - i\\,u_y(z, 0), \\qquad f(z) = \\int f'(z)\\,dz, \\qquad v = \\operatorname{Im} f"} />
        <FormulaSteps steps={[
          { title: "1. Harmonic?", text: <>Check uₓₓ + u_yy = 0.</> },
          { title: "2. Milne-Thomson", text: <>Put x = z, y = 0 in uₓ − i u_y.</> },
          { title: "3. Integrate", text: <>Then v = Im f(x + iy).</> },
        ]} />
        <SymbolKey rows={EX['harmonic-conjugate'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['harmonic-conjugate'].example} />
      <CommonMistakes items={EX['harmonic-conjugate'].mistakes} />
      <Lab heading="Interactive Harmonic Conjugate Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["cauchy-riemann","partial-derivative","laurent-series"]} />
    </MethodPage>
  );
}
