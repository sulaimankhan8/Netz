'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LogarithmCalculator from './algorithems.logarithm-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does log mean without a base?', a: <>In school textbooks (and on this page) <InlineMath math="\log" /> means base 10 and <InlineMath math="\ln" /> means base e. Some university books use log for base e, so check your course. Write <InlineMath math="\log_2(x)" /> as log_2(x).</> },
  { q: 'How do I solve 5ˣ = 20?', a: <>Take logs of both sides: <InlineMath math="x = \log_5 20 = \frac{\ln 20}{\ln 5} \approx 1.861" />. If the right side is a power of the base (like 8 = 2³ in 2ˣ = 8), you can match powers instead.</> },
  { q: 'Why must I check the answer of a log equation?', a: <>You can only take the log of a positive number. After solving <InlineMath math="\log(x - 3) = \ldots" />, check that x − 3 &gt; 0, otherwise the &quot;solution&quot; is not allowed.</> },
];

export default function LogarithmPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Logarithm Calculator" subtitle="Evaluate, Solve Equations & Use the Log Laws">
        <InlineMath math="\log_b x = k" /> means <InlineMath math="b^k = x" />: the logarithm is the power. Logs turn products into sums and powers into multiples, which is how they solve equations with x in the exponent.
      </MethodHeader>
      <FormulaBox label="THE LOG LAWS" tag="log_b">
        <Formula math={`\\log_b(MN) = \\log_b M + \\log_b N, \\quad \\log_b \\frac{M}{N} = \\log_b M - \\log_b N, \\quad \\log_b M^k = k \\log_b M`} />
        <FormulaSteps steps={[
          { title: 'Definition', text: <>log_b x = k exactly when b to the k is x.</> },
          { title: 'Change of base', text: <>log_b x = ln x / ln b.</> },
          { title: 'Equations', text: <>Isolate the power, take logs; or isolate the log, raise the base.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="3 \cdot 2^{x - 1} + 5 = 29" />.</ExampleProblem>
        <ExampleStep n={1} title="ISOLATE THE POWER"><MathPanel><BlockMath math="3 \cdot 2^{x - 1} = 24 \ \Rightarrow \ 2^{x - 1} = 8" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MATCH THE POWERS"><MathPanel><BlockMath math="2^{x - 1} = 2^3 \ \Rightarrow \ x - 1 = 3 \ \Rightarrow \ x = 4" /></MathPanel><StepText>Check: 3 · 2³ + 5 = 29 ✓</StepText></ExampleStep>
        <Conclusion result="x = 4" math={<BlockMath math="x = 4" />}>The calculator below also solves ones like 5ˣ = 20 that need logs.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Logarithm Calculator"><LogarithmCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['linear-equation', 'compound-interest', 'logarithmic']} />
    </MethodPage>
  );
}
