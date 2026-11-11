'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.fourier-transform';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the Fourier transform of f(x) = 1 for |x| &lt; 1, and 0 otherwise.</ExampleProblem>
        <ExampleStep n={1} title="SPLIT"><MathPanel><BlockMath math={"F(\\omega) = \\int_{-1}^{1}\\cos\\omega x\\,dx - i\\int_{-1}^{1}\\sin\\omega x\\,dx"} /></MathPanel><StepText>The sine part is 0 because f is even.</StepText></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE"><MathPanel><BlockMath math={"\\int_{-1}^{1}\\cos\\omega x\\,dx = \\left[\\frac{\\sin\\omega x}{\\omega}\\right]_{-1}^{1} = \\frac{2\\sin\\omega}{\\omega}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="ω = 0"><MathPanel><BlockMath math={"F(0) = \\int_{-1}^{1} 1\\,dx = 2"} /></MathPanel><StepText>The limit of 2 sin ω/ω as ω → 0.</StepText></ExampleStep>
        <Conclusion result="F(ω) = 2 sin ω/ω" math={<BlockMath math={"F(\\omega) = \\frac{2\\sin\\omega}{\\omega}"} />}>The calculator below opens on this pulse.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Fourier Transform Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["fourier-series","laplace","complex-fourier-series"]} />
    </MethodPage>
  );
}
