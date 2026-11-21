'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ConicCalculator from './algorithems.conic-sections-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit9';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I tell which conic an equation is?', a: <>Look at the x² and y² coefficients A and C (with no xy term): only one of them present means a parabola; same signs mean an ellipse (a circle if A = C); opposite signs mean a hyperbola.</> },
  { q: 'What is the eccentricity?', a: <>It measures how stretched the curve is: <InlineMath math="e = \frac{c}{a}" />. A circle has e = 0, an ellipse 0 &lt; e &lt; 1, a parabola e = 1 and a hyperbola e &gt; 1.</> },
  { q: 'Why is c² = a² − b² for an ellipse but a² + b² for a hyperbola?', a: <>For an ellipse the foci are inside the curve, closer to the centre than the vertices (c &lt; a). For a hyperbola they are outside, beyond the vertices (c &gt; a).</> },
];

export default function ConicPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • COORDINATE GEOMETRY" title="Conic Sections Calculator" subtitle="Parabola, Ellipse & Hyperbola: Foci, Directrix, Eccentricity">
        Complete the square to put a conic in standard form, then read off its <strong>vertex or centre, foci, directrices, eccentricity, latus rectum</strong> and, for a hyperbola, its asymptotes.
      </MethodHeader>
      <FormulaBox label="STANDARD FORMS" tag="e = c/a">
        <Formula math={`y^2 = 4ax, \\qquad \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\ (c^2 = a^2 - b^2), \\qquad \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1 \\ (c^2 = a^2 + b^2)`} />
        <FormulaSteps steps={[
          { title: '1. Classify', text: <>From the signs of the x² and y² coefficients.</> },
          { title: '2. Standard form', text: <>Complete the square and divide.</> },
          { title: '3. Read off', text: <>a, b, c, then the foci, e and directrices.</> },
        ]} />
        <SymbolKey rows={EX['conic-sections-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['conic-sections-calculator'].example} />
      <CommonMistakes items={EX['conic-sections-calculator'].mistakes} />
      <Lab heading="Interactive Conic Sections Calculator"><ConicCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['circles', 'coordinate-geometry', 'implicit']} />
    </MethodPage>
  );
}
