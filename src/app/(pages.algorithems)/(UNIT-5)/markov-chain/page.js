'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.markov-chain';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is a regular chain?", a: <>One where some power Pⁿ has all entries positive. Then the steady state is unique and Pⁿ tends to a matrix with π in every row.</> },
  { q: "Why replace one equation by Σπ = 1?", a: <>The equations πP = π are dependent (each row of P adds to 1), so one of them carries no new information.</> },
  { q: "What about absorbing states?", a: <>A state with Pᵢᵢ = 1 is never left; in the long run the chain ends up there.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY" title="Markov Chain Calculator" subtitle="n-Step Probabilities and the Steady State">
        A <strong>Markov chain</strong> moves between states with probabilities that depend only on the present state, held in the <strong>transition matrix</strong> <InlineMath math={"P"} />. The <InlineMath math={"n"} />-step probabilities are <InlineMath math={"P^n"} />; the long-run <strong>steady state</strong> solves <InlineMath math={"\\pi P = \\pi"} />.
      </MethodHeader>
      <FormulaBox label="THE TWO RESULTS" tag="ROWS ADD TO 1">
        <Formula math={"\\pi^{(n)} = \\pi^{(0)}P^n, \\qquad \\pi P = \\pi, \\quad \\sum_i \\pi_i = 1"} />
        <FormulaSteps steps={[
          { title: "1. Powers", text: <>Pⁿ by repeated multiplication.</> },
          { title: "2. Distribution", text: <>π⁽⁰⁾Pⁿ.</> },
          { title: "3. Steady state", text: <>Solve πP = π with Σπ = 1.</> },
        ]} />
        <SymbolKey rows={EX['markov-chain'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['markov-chain'].example} />
      <CommonMistakes items={EX['markov-chain'].mistakes} />
      <Lab heading="Interactive Markov Chains Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["matrix-calculator","eigenvalues","bayes"]} />
    </MethodPage>
  );
}
