'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.linear-transformations';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I know T is linear?", a: <>T(0) = 0 and T(au + bv) = aT(u) + bT(v); the page tests both and says so if they fail.</> },
  { q: "When is T one-to-one or onto?", a: <>One-to-one when the kernel is {'{'}0{'}'} (nullity 0); onto when the rank equals m.</> },
  { q: "Why the pivot columns of A, not of the RREF?", a: <>Row operations change the column space; they keep which columns are independent, so the pivot columns of the original A span the image.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • LINEAR ALGEBRA" title="Linear Transformation Calculator" subtitle="Matrix, Kernel, Image, Rank and Nullity">
        A <strong>linear transformation</strong> <InlineMath math={"T: \\mathbb{R}^n \\to \\mathbb{R}^m"} /> is multiplication by a matrix. Its <strong>kernel</strong> is everything sent to <InlineMath math={"0"} /> (the null space) and its <strong>image</strong> everything it reaches (the column space); the <strong>rank–nullity theorem</strong> ties their sizes together.
      </MethodHeader>
      <FormulaBox label="RANK–NULLITY" tag="dim Rⁿ = n">
        <Formula math={"\\dim\\ker T + \\dim\\operatorname{Im}T = n, \\qquad A = \\big[\\,T(e_1)\\ \\cdots\\ T(e_n)\\,\\big]"} />
        <FormulaSteps steps={[
          { title: "1. Matrix", text: <>T(e₁), …, T(eₙ) as columns.</> },
          { title: "2. RREF", text: <>Pivot and free columns.</> },
          { title: "3. Bases", text: <>Kernel from the free variables, image from the pivot columns.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the kernel and image of T(x, y, z) = (x + 2y − z, y + z, x + y − 2z).</ExampleProblem>
        <ExampleStep n={1} title="MATRIX"><MathPanel><BlockMath math={"A = \\begin{bmatrix} 1 & 2 & -1 \\\\ 0 & 1 & 1 \\\\ 1 & 1 & -2 \\end{bmatrix} \\to \\begin{bmatrix} 1 & 0 & -3 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 0 \\end{bmatrix}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="KERNEL"><MathPanel><BlockMath math={"x = 3z, \\ y = -z \\Rightarrow \\ker T = \\operatorname{span}\\{(3, -1, 1)\\}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="IMAGE"><MathPanel><BlockMath math={"\\operatorname{Im} T = \\operatorname{span}\\{(1, 0, 1), (2, 1, 1)\\}, \\quad 2 + 1 = 3"} /></MathPanel></ExampleStep>
        <Conclusion result="rank 2, nullity 1" math={<BlockMath math={"\\text{rank } 2 + \\text{nullity } 1 = 3"} />}>The calculator below opens on this transformation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Linear Transformations Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["rank","linear-dependence","consistency"]} />
    </MethodPage>
  );
}
