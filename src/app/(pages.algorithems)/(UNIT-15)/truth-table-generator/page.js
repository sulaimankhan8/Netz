'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.truth-table-generator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Show that <InlineMath math={"p \\to q"} /> and <InlineMath math={"\\lnot p \\lor q"} /> are equivalent.</ExampleProblem>
        <ExampleStep n={1} title="TABLE"><MathPanel><BlockMath math={"\\begin{array}{cc|cc} p & q & p \\to q & \\lnot p \\lor q \\\\ \\hline T & T & T & T \\\\ T & F & F & F \\\\ F & T & T & T \\\\ F & F & T & T \\end{array}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="COMPARE"><StepText>The two columns agree in every row.</StepText></ExampleStep>
        <Conclusion result="Equivalent" math={<BlockMath math={"p \\to q \\equiv \\lnot p \\lor q"} />}>The second example button below checks it.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Truth Table Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["modular-arithmetic","permutations-combinations","bayes"]} />
    </MethodPage>
  );
}
