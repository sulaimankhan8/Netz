'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CountingCalculator from './algorithems.permutations-and-combinations';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between a permutation and a combination?',
    a: <>A permutation is an arrangement, where order matters (first, second, third place). A combination is a selection, where order doesn&apos;t matter (a team of three). Each combination of r things gives r! permutations, so <InlineMath math="{}^nP_r = r! \times {}^nC_r" />.</>,
  },
  {
    q: 'Why is 0! equal to 1?',
    a: <>There is exactly one way to arrange nothing. It also keeps the formulas working: <InlineMath math="{}^nC_n = \frac{n!}{n!\,0!} = 1" />.</>,
  },
  {
    q: 'How many ways can n people sit around a round table?',
    a: <><InlineMath math="(n - 1)!" />: fix one person and arrange the rest, because turning the whole table doesn&apos;t make a new seating. For beads on a necklace, which can also be flipped, it is <InlineMath math="\frac{(n - 1)!}{2}" />.</>,
  },
  {
    q: 'How do you count arrangements of a word with repeated letters?',
    a: <>Divide by the factorial of each repeat: MISSISSIPPI has 11 letters with I×4, S×4 and P×2, so <InlineMath math="\frac{11!}{4!\,4!\,2!} = 34{,}650" />.</>,
  },
];

export default function CountingPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Permutations & Combinations" subtitle="nPr, nCr and Factorials">
        <strong>Permutations</strong> count arrangements, where order matters: <InlineMath math="{}^nP_r = \frac{n!}{(n - r)!}" />. <strong>Combinations</strong> count selections, where it doesn&apos;t: <InlineMath math="{}^nC_r = \frac{n!}{r!\,(n - r)!}" />.
      </MethodHeader>

      <FormulaBox label="THE TWO FORMULAS" tag="0 ≤ r ≤ n">
        <Formula math={`\\begin{gathered} {}^nP_r = \\frac{n!}{(n - r)!} \\qquad {}^nC_r = \\frac{n!}{r!\\,(n - r)!} \\\\ n! = n \\times (n - 1) \\times \\cdots \\times 2 \\times 1 \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Does Order Matter?', text: <>Ranks, roles, PINs, seating: yes (P). Teams, hands of cards, groups: no (C).</> },
            { title: '2. Repeats Allowed?', text: <>Can the same item be used twice? Then it is <InlineMath math="n^r" /> arrangements instead.</> },
            { title: '3. Cancel First', text: <>Cancel the factorials before multiplying: <InlineMath math="\frac{10!}{7!} = 10 \times 9 \times 8" />.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          A class of 10 students must pick 3 representatives. (a) In how many ways can a team of 3 be chosen? (b) In how many ways if the 3 are a president, a secretary and a treasurer?
        </ExampleProblem>

        <ExampleStep n={1} title="(a) ORDER DOESN'T MATTER: COMBINATIONS">
          <MathPanel>
            <BlockMath math="{}^{10}C_3 = \frac{10!}{3!\,7!} = \frac{10 \times 9 \times 8}{3 \times 2 \times 1} = \frac{720}{6} = 120" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="(b) DIFFERENT ROLES: PERMUTATIONS">
          <StepText>Now Asha as president and Ben as secretary differs from the other way round, so order matters:</StepText>
          <MathPanel>
            <BlockMath math="{}^{10}P_3 = \frac{10!}{7!} = 10 \times 9 \times 8 = 720" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="HOW THEY CONNECT">
          <MathPanel>
            <BlockMath math="{}^{10}P_3 = 3! \times {}^{10}C_3 = 6 \times 120 = 720" />
          </MathPanel>
          <StepText>Each team of 3 can hand out the 3 roles in 3! = 6 ways.</StepText>
        </ExampleStep>

        <Conclusion result="(a) 120 teams, (b) 720 ways with roles" math={<BlockMath math="{}^{10}C_3 = 120, \qquad {}^{10}P_3 = 720" />}>
          The calculator below opens on 10C3 and works with exact answers however big.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Permutations & Combinations Calculator">
        <CountingCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['progressions', 'quadratic', 'binomial']} />
    </MethodPage>
  );
}
