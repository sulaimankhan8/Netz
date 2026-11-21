'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.surface-integral';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is dS for z = g(x, y)?", a: <>dS = √(1 + g_x² + g_y²) dx dy, and the upward normal is (−g_x, −g_y, 1) dx dy.</> },
  { q: "Which coordinates for a ball or a cylinder?", a: <>Spherical (dV = r² sin φ dr dφ dθ) for a ball and cylindrical (dV = ρ dρ dz dθ) for a cylinder; the page does this for you.</> },
  { q: "How is the answer checked?", a: <>Every integral is also worked out numerically; an exact form is shown only when it matches.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Surface Integral Calculator" subtitle="Flux, Surface Area and Volume Integrals">
        Describe a surface by <InlineMath math={"\\mathbf{r}(u, v)"} />. The normal <InlineMath math={"\\mathbf{N} = \\mathbf{r}_u \\times \\mathbf{r}_v"} /> turns <InlineMath math={"dS"} /> into <InlineMath math={"|\\mathbf{N}|\\,du\\,dv"} />, and the <strong>flux</strong> of a field through the surface is <InlineMath math={"\\iint \\mathbf{F}\\cdot\\mathbf{N}\\,du\\,dv"} />. Volume integrals use Cartesian, cylindrical or spherical coordinates.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="N = r_u × r_v">
        <Formula math={"\\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\iint \\mathbf{F}(\\mathbf{r})\\cdot(\\mathbf{r}_u \\times \\mathbf{r}_v)\\,du\\,dv, \\qquad \\iint_S f\\,dS = \\iint f(\\mathbf{r})\\,|\\mathbf{r}_u \\times \\mathbf{r}_v|\\,du\\,dv"} />
        <FormulaSteps steps={[
          { title: "1. Parametrise", text: <>r(u, v) and its ranges.</> },
          { title: "2. Normal", text: <>N = r_u × r_v, pointing out.</> },
          { title: "3. Integrate", text: <>A double integral in u, v.</> },
        ]} />
        <SymbolKey rows={EX['surface-integral'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['surface-integral'].example} />
      <CommonMistakes items={EX['surface-integral'].mistakes} />
      <Lab heading="Interactive Surface Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["divergence-theorem","triple-integral","stokes-theorem"]} />
    </MethodPage>
  );
}
