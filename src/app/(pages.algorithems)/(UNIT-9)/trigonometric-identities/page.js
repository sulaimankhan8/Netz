'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.trigonometric-identities';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit9';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why rewrite everything in sin and cos?", a: <>It turns any identity into algebra in two quantities linked by one rule, sin² + cos² = 1, so a mechanical path always exists for identities in one angle.</> },
  { q: "What does \"true, checked numerically\" mean?", a: <>The two sides agree at many different angles, which makes the identity certain in practice, but the rewriting rules did not find a step-by-step path to show.</> },
  { q: "Can I use degrees?", a: <>Identities hold for every angle, so the unit does not matter; just write x for the angle.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • TRIGONOMETRY" title="Trigonometric Identities Calculator" subtitle="Prove an Identity by Rewriting in sin and cos">
        Prove a trig identity the reliable way: write every function in <InlineMath math={"\\sin"} /> and <InlineMath math={"\\cos"} />, expand double angles, combine each side into one fraction and use <InlineMath math={"\\sin^2 x + \\cos^2 x = 1"} />. When there is no clean path, the calculator says the identity is true from checking it at many angles and invents no steps.
      </MethodHeader>
      <FormulaBox label="THE KEY IDENTITIES" tag="PYTHAGOREAN">
        <Formula math={"\\sin^2 x + \\cos^2 x = 1, \\quad 1 + \\tan^2 x = \\sec^2 x, \\quad \\sin 2x = 2\\sin x\\cos x, \\quad \\cos 2x = \\cos^2 x - \\sin^2 x"} />
        <FormulaSteps steps={[
          { title: "1. Check", text: <>Is it true at many angles?</> },
          { title: "2. Rewrite", text: <>tan, sec, csc, cot in sin and cos.</> },
          { title: "3. Simplify", text: <>One fraction per side; sin² + cos² = 1.</> },
        ]} />
        <SymbolKey rows={EX['trigonometric-identities'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['trigonometric-identities'].example} />
      <CommonMistakes items={EX['trigonometric-identities'].mistakes} />
      <Lab heading="Interactive Trig Identity Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["trig-equations","inverse-trig","unit-circle"]} />
    </MethodPage>
  );
}
