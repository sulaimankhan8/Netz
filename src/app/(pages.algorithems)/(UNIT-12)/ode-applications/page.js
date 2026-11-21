'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.ode-applications';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does one reading give k?", a: <>The solution has one unknown rate k once T₀ and Tₛ are known, so one more temperature at a known time fixes it.</> },
  { q: "What is the time constant of a circuit?", a: <>L/R for an RL circuit and RC for an RC circuit: the time for the transient to fall to 1/e (about 37%) of its start.</> },
  { q: "Can E be a sine wave?", a: <>Yes: the CF + PI solver handles E = E₀ sin ωt, giving a decaying transient plus a steady oscillation.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Applications of Differential Equations" subtitle="Newton's Cooling, Growth and Decay, RL, RC and LCR Circuits">
        Many laws are first- or second-order equations: <strong>Newton&apos;s law of cooling</strong>, <strong>growth and decay</strong> <InlineMath math={"\\frac{dN}{dt} = kN"} />, and <strong>electric circuits</strong> from Kirchhoff&apos;s voltage law. Each is set up, solved with its starting values, then used to answer the question.
      </MethodHeader>
      <FormulaBox label="THE MODELS" tag="k FROM DATA">
        <Formula math={"\\frac{dT}{dt} = -k(T - T_s), \\qquad \\frac{dN}{dt} = kN, \\qquad L\\frac{di}{dt} + Ri = E, \\qquad L\\frac{d^2q}{dt^2} + R\\frac{dq}{dt} + \\frac{q}{C} = E"} />
        <FormulaSteps steps={[
          { title: "1. Model", text: <>Write the equation.</> },
          { title: "2. Solve", text: <>With the starting value.</> },
          { title: "3. Use the data", text: <>Find k, then answer.</> },
        ]} />
        <SymbolKey rows={EX['ode-applications'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['ode-applications'].example} />
      <CommonMistakes items={EX['ode-applications'].mistakes} />
      <Lab heading="Interactive ODE Applications Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["ode-solver","linear-ode","ode-cc"]} />
    </MethodPage>
  );
}
