'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import QrCalculator from './algorithems.qr-decomposition';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What are Q and R?', a: <>Q has orthonormal columns (each of length 1, at right angles to each other, so <InlineMath math="Q^{T}Q = I" />) and R is upper triangular. Together <InlineMath math="A = QR" />.</> },
  { q: 'What is QR used for?', a: <>Least-squares fitting (solve <InlineMath math="Rx = Q^{T}b" /> instead of the normal equations) and finding eigenvalues: the QR algorithm repeats <InlineMath math="A \to RQ" />, which keeps the eigenvalues and pushes the matrix towards triangular form.</> },
  { q: 'Why did it say the columns are not independent?', a: <>Gram–Schmidt divides by the length of what is left of each column. If a column is a combination of earlier ones, nothing is left (length 0), so A has no full QR decomposition.</> },
];

export default function QrPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • MATRIX METHODS" title="QR Decomposition" subtitle="Gram–Schmidt, Step by Step, and the QR Algorithm">
        <strong>QR decomposition</strong> writes A as an orthonormal matrix Q times an upper triangular R. The <strong>Gram–Schmidt</strong> process builds Q one column at a time, removing from each column its parts along the earlier ones.
      </MethodHeader>
      <FormulaBox label="GRAM–SCHMIDT" tag="A = QR">
        <Formula math={`u_k = a_k - \\sum_{j<k} (q_j \\cdot a_k)\\,q_j, \\qquad q_k = \\frac{u_k}{|u_k|}, \\qquad r_{jk} = q_j \\cdot a_k`} />
        <FormulaSteps steps={[
          { title: '1. Subtract projections', text: <>From each column remove its parts along the earlier q vectors.</> },
          { title: '2. Normalise', text: <>Divide by the length to get the next q.</> },
          { title: '3. R', text: <>The dot products (and lengths) fill R.</> },
        ]} />
        <SymbolKey rows={EX['qr'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['qr'].example} />
      <CommonMistakes items={EX['qr'].mistakes} />
      <Lab heading="Interactive QR Calculator"><QrCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['cholesky', 'jacobi-eigen', 'least-squares']} />
    </MethodPage>
  );
}
