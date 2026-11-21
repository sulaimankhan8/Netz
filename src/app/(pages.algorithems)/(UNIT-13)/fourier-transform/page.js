'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.fourier-transform';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit13';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Which sign convention is used?", a: <>F(ω) = ∫ f(x)e^{'{'}−iωx{'}'} dx with the inverse f(x) = (1/2π)∫ F(ω)e^{'{'}iωx{'}'} dω. Some books put e^{'{'}+isx{'}'} in the transform, or split the 1/2π as 1/√(2π) on each side; the answers then differ by a sign of ω or a constant.</> },
  { q: "What does the Fourier integral give?", a: <>Inverting the pulse gives (1/π)∫₀^∞ 2 sin ω cos ωx/ω dω = f(x). At x = 0 this is ∫₀^∞ sin ω/ω dω = π/2.</> },
  { q: "When do the sine and cosine transforms apply?", a: <>For f on 0 &lt; x &lt; ∞. The sine transform suits odd extensions, the cosine transform even ones.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • FOURIER & Z TRANSFORMS" title="Fourier Transform Calculator" subtitle="Complex, Sine and Cosine Transforms, Step by Step">
        The <strong>Fourier transform</strong> <InlineMath math={"F(\\omega) = \\int_{-\\infty}^{\\infty} f(x)e^{-i\\omega x}dx"} /> writes a non-periodic function as a spread of frequencies, the way a Fourier series does for a periodic one. The <strong>sine</strong> and <strong>cosine transforms</strong> use only <InlineMath math={"x > 0"} />.
      </MethodHeader>
      <FormulaBox label="THE TRANSFORMS" tag="ω = FREQUENCY">
        <Formula math={"F(\\omega) = \\int_{-\\infty}^{\\infty} f(x)\\,e^{-i\\omega x}dx, \\quad F_s(\\omega) = \\int_0^{\\infty} f(x)\\sin\\omega x\\,dx, \\quad F_c(\\omega) = \\int_0^{\\infty} f(x)\\cos\\omega x\\,dx"} />
        <FormulaSteps steps={[
          { title: "1. Split", text: <>e^{'{'}−iωx{'}'} = cos ωx − i sin ωx.</> },
          { title: "2. Integrate", text: <>Piece by piece, with ω as a letter.</> },
          { title: "3. Combine", text: <>F = A − iB; even f has B = 0.</> },
        ]} />
        <SymbolKey rows={EX['fourier-transform'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['fourier-transform'].example} />
      <CommonMistakes items={EX['fourier-transform'].mistakes} />
      <Lab heading="Interactive Fourier Transform Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["fourier-series","laplace","complex-fourier-series"]} />
    </MethodPage>
  );
}
