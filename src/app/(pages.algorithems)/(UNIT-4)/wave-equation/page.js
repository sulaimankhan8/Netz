'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.wave-equation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When is the scheme stable?", a: <>For r = ck/h ≤ 1 (the Courant–Friedrichs–Lewy condition). With r &gt; 1 small errors grow without bound; the last example shows it.</> },
  { q: "Why is the first step different?", a: <>u_{'{'}i,−1{'}'} is not known; u_t(x, 0) = g gives u_{'{'}i,−1{'}'} = u_{'{'}i,1{'}'} − 2k gᵢ, which leads to the special first-step formula.</> },
  { q: "How does it compare with the exact solution?", a: <>With r = 1 the scheme is exact at the grid points for the wave equation (d&apos;Alembert&apos;s solution), so it is the usual textbook choice.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • NUMERICAL PDEs" title="Wave Equation: Explicit Finite Differences" subtitle="u_tt = c²u_xx on a Grid, Step by Step">
        The <strong>explicit scheme</strong> replaces both second derivatives by central differences. Each new time level comes from the two before it, so the string&apos;s shape can be marched forward from its starting shape and speed.
      </MethodHeader>
      <FormulaBox label="THE SCHEME" tag="r = ck/h">
        <Formula math={"u_{i,j+1} = 2(1 - r^2)u_{i,j} + r^2(u_{i-1,j} + u_{i+1,j}) - u_{i,j-1}, \\qquad r = 1: \\ u_{i,j+1} = u_{i-1,j} + u_{i+1,j} - u_{i,j-1}"} />
        <FormulaSteps steps={[
          { title: "1. Row 0", text: <>u(x, 0) = f(x).</> },
          { title: "2. Row 1", text: <>Uses u_t = g with a half step.</> },
          { title: "3. March", text: <>Each row from the two before.</> },
        ]} />
        <SymbolKey rows={EX['wave-equation'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['wave-equation'].example} />
      <CommonMistakes items={EX['wave-equation'].mistakes} />
      <Lab heading="Interactive Wave Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["heat-equation","separation-of-variables","laplace-liebmann"]} />
    </MethodPage>
  );
}
