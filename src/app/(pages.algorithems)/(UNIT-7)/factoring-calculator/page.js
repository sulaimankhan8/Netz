'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FactoringCalculator from './algorithems.factoring-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit7';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is the ac method?', a: <>For <InlineMath math="ax^2 + bx + c" />, find two numbers that multiply to <InlineMath math="ac" /> and add to <InlineMath math="b" />. Split the middle term with them, then factor in pairs (grouping). For <InlineMath math="6x^2 + x - 2" />: ac = −12, and 4 and −3 work.</> },
  { q: 'How does the factor theorem help with cubics?', a: <>If <InlineMath math="f(a) = 0" /> then <InlineMath math="(x - a)" /> is a factor. Try the divisors of the constant term (over the divisors of the leading coefficient). Once you find one, divide it out (synthetic division) and factor the quadratic that is left.</> },
  { q: 'Why does x² + 4 not factor?', a: <>It has no real roots (<InlineMath math="b^2 - 4ac = -16 < 0" />), so it has no real linear factors. Over the complex numbers it is <InlineMath math="(x - 2i)(x + 2i)" />. Similarly <InlineMath math="x^2 - 2 = (x - \sqrt2)(x + \sqrt2)" /> does not factor with whole numbers.</> },
];

export default function FactoringPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Factoring Calculator" subtitle="Factor Polynomials Step by Step">
        <strong>Factoring</strong> writes a polynomial as a product of simpler ones. Take out the common factor first, look for identities (difference of squares, cubes), split the middle term of quadratics, and use the factor theorem for cubics and higher.
      </MethodHeader>
      <FormulaBox label="KEY IDENTITIES" tag="a² − b²">
        <Formula math={`\\begin{gathered} a^2 - b^2 = (a - b)(a + b) \\qquad a^2 \\pm 2ab + b^2 = (a \\pm b)^2 \\\\ a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2) \\end{gathered}`} />
        <FormulaSteps steps={[
          { title: '1. Common factor', text: <>Take out the biggest number and power of x that divides every term.</> },
          { title: '2. Identities', text: <>Two terms: squares or cubes? Three terms: a perfect square?</> },
          { title: '3. Quadratics and beyond', text: <>ac method for quadratics; factor theorem for cubics.</> },
        ]} />
        <SymbolKey rows={EX['factoring-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['factoring-calculator'].example} />
      <CommonMistakes items={EX['factoring-calculator'].mistakes} />
      <Lab heading="Interactive Factoring Calculator"><FactoringCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['quadratic', 'rational-expressions', 'inequalities']} />
    </MethodPage>
  );
}
