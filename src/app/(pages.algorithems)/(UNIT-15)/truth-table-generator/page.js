'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.truth-table-generator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When is p → q false?", a: <>Only when p is true and q is false. A false premise makes the implication true (&quot;vacuously&quot;).</> },
  { q: "What is a contingency?", a: <>A formula that is true in some rows and false in others — neither a tautology nor a contradiction.</> },
  { q: "How do I type the symbols?", a: <>Use ¬ ∧ ∨ → ↔ or the words not, and, or, -&gt;, &lt;-&gt;, xor.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • LOGIC" title="Truth Table Generator" subtitle="Tautologies and Logical Equivalence">
        A <strong>truth table</strong> lists a formula&apos;s value for every combination of true and false. If the last column is all T it is a <strong>tautology</strong>; two formulas with the same last column are <strong>logically equivalent</strong>.
      </MethodHeader>
      <FormulaBox label="THE CONNECTIVES" tag="2ⁿ ROWS">
        <Formula math={"p \\to q \\equiv \\lnot p \\lor q, \\qquad \\lnot(p \\land q) \\equiv \\lnot p \\lor \\lnot q"} />
        <FormulaSteps steps={[
          { title: "1. Rows", text: <>2ⁿ for n letters.</> },
          { title: "2. Columns", text: <>Each sub-formula, innermost first.</> },
          { title: "3. Read off", text: <>All T, all F, or mixed.</> },
        ]} />
        <SymbolKey rows={EX['truth-table-generator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['truth-table-generator'].example} />
      <CommonMistakes items={EX['truth-table-generator'].mistakes} />
      <Lab heading="Interactive Truth Table Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["modular-arithmetic","permutations-combinations","bayes"]} />
    </MethodPage>
  );
}
