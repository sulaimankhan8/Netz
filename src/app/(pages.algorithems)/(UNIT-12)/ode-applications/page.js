'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.ode-applications';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A body cools from 100° to 60° in 20 minutes in air at 20°. Find its temperature after 40 minutes, and when it reaches 30°.</ExampleProblem>
        <ExampleStep n={1} title="SOLVE"><MathPanel><BlockMath math={"T = 20 + 80e^{-kt}, \\quad 60 = 20 + 80e^{-20k} \\Rightarrow k = \\frac{\\ln 2}{20}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="AFTER 40 MIN"><MathPanel><BlockMath math={"T(40) = 20 + 80e^{-2\\ln 2} = 20 + 20 = 40^\\circ"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="REACH 30°"><MathPanel><BlockMath math={"30 = 20 + 80e^{-kt} \\Rightarrow t = \\frac{\\ln 8}{k} = 60 \\text{ min}"} /></MathPanel></ExampleStep>
        <Conclusion result="40° after 40 min; 30° at 60 min" math={<BlockMath math={"T(40) = 40^\\circ, \\qquad t = 60 \\text{ min}"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive ODE Applications Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["ode-solver","linear-ode","ode-cc"]} />
    </MethodPage>
  );
}
