'use client';

import MethodShell, { Step, StepControls, StepsDone } from '@/app/components/algorithms/MethodShell';
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import GaussQuadrature from './algorithems.gauss-quadrature';

export default function GaussQuadraturePage() {
  return (
    <>

      <MethodShell route="/gauss-quadrature" steps={3} solve={<GaussQuadrature />}>

              <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Gauss-Legendre Quadrature</strong> is a remarkably accurate numerical integration technique. With just <em>n</em> strategically placed points, it integrates polynomials of degree up to <InlineMath math="2n-1" /> <em>exactly</em> — making it far more efficient than Simpson’s Rule or Trapezoidal for smooth functions.
                </p>

              {/* Core Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      The Gauss–Legendre formula
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      Optimal point placement
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto space-y-3">
                    <BlockMath math={`\\int_a^b f(x)\\,dx \\approx \\frac{b-a}{2} \\sum_{i=1}^{n} w_i \\, f\\!\\left(\\frac{b-a}{2}t_i + \\frac{a+b}{2}\\right)`} />
                    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      where <InlineMath math="t_i" /> are Gauss nodes on [−1, 1] and <InlineMath math="w_i" /> are their corresponding weights.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="text-black dark:text-white block font-bold">Key Idea: Optimal Nodes</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Unlike Trapezoidal / Simpson, nodes are <em>not</em> equally spaced — they are roots of Legendre polynomials <InlineMath math="P_n(t)" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="text-black dark:text-white block font-bold">Interval Transformation</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Map <InlineMath math="[a,b] \to [-1,1]" /> via <InlineMath math="x = \frac{b-a}{2}t + \frac{a+b}{2}" />, then apply weights.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
                      <strong className="text-black dark:text-white block font-bold">Precision Guarantee</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        An <InlineMath math="n" />-point rule is <em>exact</em> for all polynomials of degree <InlineMath math="\leq 2n-1" /> (e.g., 3-point → degree ≤ 5).
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nodes & Weights Reference Table */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b-2 border-black/80 dark:border-neutral-700">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Standard Gauss-Legendre tables</h2>
                  <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">
                    Reference tables
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2-Point */}
                  <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-black px-2 py-0.5 rounded-md">2-Point</span>
                      <span className="text-xs font-mono text-neutral-500">Exact for degree ≤ 3</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono border-collapse">
                        <thead><tr className="border-b border-black/20 dark:border-neutral-700">
                          <th className="p-2 text-left">i</th><th className="p-2">Node tᵢ</th><th className="p-2">Weight wᵢ</th>
                        </tr></thead>
                        <tbody>
                          <tr className="border-b border-black/10 dark:border-neutral-700"><td className="p-2 font-bold">1</td><td className="p-2 text-center">−0.5773502692</td><td className="p-2 text-center">1.0000000000</td></tr>
                          <tr><td className="p-2 font-bold">2</td><td className="p-2 text-center">+0.5773502692</td><td className="p-2 text-center">1.0000000000</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3-Point */}
                  <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#FFE600] text-black text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-black/30">3-Point</span>
                      <span className="text-xs font-mono text-neutral-500">Exact for degree ≤ 5</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono border-collapse">
                        <thead><tr className="border-b border-black/20 dark:border-neutral-700">
                          <th className="p-2 text-left">i</th><th className="p-2">Node tᵢ</th><th className="p-2">Weight wᵢ</th>
                        </tr></thead>
                        <tbody>
                          <tr className="border-b border-black/10 dark:border-neutral-700"><td className="p-2 font-bold">1</td><td className="p-2 text-center">−0.7745966692</td><td className="p-2 text-center">0.5555555556</td></tr>
                          <tr className="border-b border-black/10 dark:border-neutral-700"><td className="p-2 font-bold">2</td><td className="p-2 text-center">0.0000000000</td><td className="p-2 text-center">0.8888888889</td></tr>
                          <tr><td className="p-2 font-bold">3</td><td className="p-2 text-center">+0.7745966692</td><td className="p-2 text-center">0.5555555556</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worked Example */}
              <div className="space-y-6">
                <div className="am-section-title"><h2>Worked example</h2></div>

                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                    Our problem to solve
                  </span>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Evaluate <InlineMath math="\int_0^1 (x^2 + 1)\,dx" /> using 3-point Gauss-Legendre Quadrature.
                    (Exact answer: <InlineMath math="4/3 \approx 1.333..." />)
                  </p>
                </div>

                <Step n={1} title="Map interval [0,1] to [-1,1]">

                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Apply the transformation: <InlineMath math="x = \frac{b-a}{2}t + \frac{a+b}{2} = \frac{1}{2}t + \frac{1}{2}" /> and <InlineMath math="\frac{b-a}{2} = \frac{1}{2}" />.
                  </p>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                    <BlockMath math={`\\int_0^1 f(x)\\,dx = \\frac{1}{2}\\sum_{i=1}^{3} w_i\\,f\\!\\left(\\frac{t_i+1}{2}\\right)`} />
                  </div>
                </Step>

                <Step n={2} title="Evaluate at each Gauss point">

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-3">
                    <BlockMath math={`x_1 = \\frac{-0.7746+1}{2} = 0.1127 \\quad f(x_1) = (0.1127)^2+1 = 1.01270`} />
                    <BlockMath math={`x_2 = \\frac{0+1}{2} = 0.5000 \\quad f(x_2) = (0.5)^2+1 = 1.25000`} />
                    <BlockMath math={`x_3 = \\frac{0.7746+1}{2} = 0.8873 \\quad f(x_3) = (0.8873)^2+1 = 1.78730`} />
                  </div>
                </Step>

                <Step n={3} title="Apply weights and sum">

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math={`I = \\frac{1}{2}\\bigl[0.5556 \\cdot 1.01270 + 0.8889 \\cdot 1.25000 + 0.5556 \\cdot 1.78730\\bigr]`} />
                    <BlockMath math={`I = \\frac{1}{2}\\bigl[0.5626 + 1.1111 + 0.9932\\bigr] = \\frac{1}{2} \\times 2.6669 \\approx 1.3333`} />
                  </div>
                </Step>
<StepControls />
<StepsDone>

                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      Final conclusion
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Result: ≈ 1.33333 (Exact!)
                    </h3>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      The 3-point Gauss rule gave the <em>exact</em> answer because <InlineMath math="x^2+1" /> is a degree-2 polynomial, which is within the degree-5 precision guarantee of the 3-point rule. For comparison, the Trapezoidal Rule would need many more subdivisions for the same accuracy.
                    </p>
                  </div>
                </div>
              </StepsDone>
</div>

            </MethodShell>
    </>
  );
}
