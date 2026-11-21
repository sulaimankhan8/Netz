'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Rk2Calculator from './algorithems.rk2-method';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the second-order Runge-Kutta method?',
    a: <>A one-step method that samples the slope twice per step and combines the two. Its error per step shrinks like <InlineMath math="h^3" />, so it is far more accurate than Euler&apos;s method for the same h.</>,
  },
  {
    q: "Is Heun's method the same as the modified Euler method?",
    a: <>Yes: Heun&apos;s method averages the slope at the start and at an Euler-predicted end point, which is the modified (improved) Euler method with a single correction.</>,
  },
  {
    q: 'What is the difference between Heun and midpoint?',
    a: <>Heun averages the slopes at the two ends of the step. Midpoint takes a half step, measures the slope there, and uses only that. Both are second order; for many problems they give similar accuracy.</>,
  },
];

export default function Rk2Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • INITIAL VALUE PROBLEMS (ODE)" title="RK2 Method" subtitle="Heun & Midpoint">
        The <strong>second-order Runge-Kutta method</strong> solves <InlineMath math="\frac{dy}{dx} = f(x, y)" /> by sampling the slope twice per step. Heun&apos;s version: <InlineMath math="y_{n+1} = y_n + \frac{h}{2}(k_1 + k_2)" />, with <InlineMath math="k_1" /> at the start and <InlineMath math="k_2" /> at the predicted end.
      </MethodHeader>

      <FormulaBox label="HEUN'S RK2" tag="ERROR ~ h²">
        <Formula math={`\\begin{gathered} k_1 = f(x_n, y_n), \\qquad k_2 = f(x_n + h,\\ y_n + h k_1) \\\\ y_{n+1} = y_n + \\frac{h}{2}(k_1 + k_2) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Slope at the Start', text: <><InlineMath math="k_1 = f(x_n, y_n)" />.</> },
            { title: '2. Slope at the End', text: <>Take an Euler step to guess the end point, and find the slope there: <InlineMath math="k_2" />.</> },
            { title: '3. Average', text: <>Step forward with the average slope <InlineMath math="\frac{k_1 + k_2}{2}" />.</> },
          ]}
        />
        <SymbolKey rows={EX['rk2'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['rk2'].example} />
      <CommonMistakes items={EX['rk2'].mistakes} />

      <Lab heading="Interactive RK2 Calculator">
        <Rk2Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['euler', 'modified-euler', 'runge-kutta', 'milne']} />
    </MethodPage>
  );
}
