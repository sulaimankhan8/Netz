'use client';

import React from 'react';
import Head from 'next/head';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreenToggle';
import { EditorialThemeToggle } from '@/app/components/editorial';
import LeastSquaresSolver from './algorithems.least-squares';
import AlgorithmNavigation from '@/app/components/AlgorithmNavigation';

export default function LeastSquaresPage() {
  const formula = `
    y = a \\cdot e^{b x} \\implies \\ln y = \\ln a + b x \\implies Y' = A + b x
  `;

  return (
    <>
      <Head>
        <title>Least Squares Exponential Fitting | Netz</title>
        <meta name="description" content="Master Exponential Curve Fitting using Least Squares with step-by-step guidance, log transformations, and an interactive visualizer." />
      </Head>

      <FullscreenToggle className="w-full min-h-screen">
        <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#111111] text-black dark:text-white transition-colors editorial-grid-bg">
          <div className="md:ml-[80px]">
            <section className="container mx-auto px-4 md:px-8 py-10 space-y-10 max-w-6xl">
              
              {/* Header & Badges */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-3 py-0.5 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
                    UNIT 5 • CURVE FITTING & STATISTICS
                  </div>
                  <EditorialThemeToggle />
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-black dark:text-white">
                  Least Squares <br />
                  <span className="underline decoration-4 underline-offset-8 decoration-black dark:decoration-white">Exponential Curve Fitting</span>
                </h1>

                <p className="text-base md:text-lg font-medium text-neutral-700 dark:text-neutral-300 max-w-3xl leading-relaxed">
                  <strong>Exponential Curve Fitting</strong> transforms non-linear growth or decay relationship <InlineMath math="y = a e^{bx}" /> into a straight line by taking natural logarithms, allowing normal equations to find optimal growth rates <InlineMath math="b" /> and initial scale <InlineMath math="a" />!
                </p>
              </div>

              {/* Core Governing Formula Box */}
              <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
                <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
                    <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
                      LOGARITHMIC LINEARIZATION FORMULA
                    </span>
                    <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                      EXPONENTIAL BEST FIT
                    </span>
                  </div>

                  <div className="py-4 text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">1. Log Transformation</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Linear variable <InlineMath math="Y' = \ln y" /> and intercept <InlineMath math="A = \ln a" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">2. Normal System</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        <InlineMath math="N A + b \sum x = \sum Y'" /> and <InlineMath math="A \sum x + b \sum x^2 = \sum x Y'" />.
                      </span>
                    </div>
                    <div className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
                      <strong className="text-black dark:text-white block font-bold">3. Re-Exponentiation</strong>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Recover original multiplier: <InlineMath math="a = e^A" />.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Worked Example */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b-2 border-black/80 dark:border-neutral-700">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                    Step-by-Step Worked Example
                  </h2>
                  <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">
                    GUIDED STORY
                  </span>
                </div>

                {/* Problem Statement Card */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
                      OUR PROBLEM TO SOLVE
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
                    Fit an exponential curve <InlineMath math="y = a e^{bx}" /> to the 4 observation points:
                  </p>
                  <div className="overflow-x-auto py-2">
                    <table className="w-full max-w-md mx-auto text-xs font-mono text-center border-collapse border border-black/30 dark:border-neutral-700">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b border-black/30 dark:border-neutral-700">
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">1</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">2</th>
                          <th className="p-2 border-r border-black/20 dark:border-neutral-700">3</th>
                          <th className="p-2">4</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-neutral-900 border-b border-black/20 dark:border-neutral-700">
                          <td className="p-2 font-bold border-r border-black/20 dark:border-neutral-700">y</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">1.6</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">4.5</td>
                          <td className="p-2 border-r border-black/20 dark:border-neutral-700">13.8</td>
                          <td className="p-2">40.2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 1: Log Transformation Table */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 01</span> • <span>LOG TRANSFORM & STATISTICAL SUMS</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">y</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">Y&apos; = ln(y)</th>
                          <th className="p-2.5 border-r border-black/20 dark:border-neutral-700">x²</th>
                          <th className="p-2.5">x · Y&apos;</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">1</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1.6</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">0.47000</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1</td>
                          <td className="p-2">0.47000</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4.5</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">1.50408</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">4</td>
                          <td className="p-2">3.00816</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">3</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">13.8</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">2.62467</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">9</td>
                          <td className="p-2">7.87401</td>
                        </tr>
                        <tr className="border-b border-black/15 dark:border-neutral-700">
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700 font-bold">4</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">40.2</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">3.69387</td>
                          <td className="p-2 border-r border-black/15 dark:border-neutral-700">16</td>
                          <td className="p-2">14.77548</td>
                        </tr>
                        <tr className="bg-emerald-500 text-white font-bold">
                          <td className="p-2 border-r border-emerald-600">Sum = 10</td>
                          <td className="p-2 border-r border-emerald-600">-</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 8.29262</td>
                          <td className="p-2 border-r border-emerald-600">Sum = 30</td>
                          <td className="p-2">Sum = 26.12765</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 2: Solve Normal Equations */}
                <div className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
                    <span>STEP 02</span> • <span>SOLVE LINEAR NORMAL EQUATIONS</span>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
                    <BlockMath math="4 A + 10 b = 8.29262" />
                    <BlockMath math="10 A + 30 b = 26.12765" />
                    <BlockMath math="b = \frac{4(26.12765) - 10(8.29262)}{4(30) - (10)^2} = \frac{104.5106 - 82.9262}{20} = 1.0792" />
                    <BlockMath math="A = \frac{8.29262 - 10(1.0792)}{4} = -0.6249 \implies a = e^{-0.6249} \approx 0.5353" />
                  </div>
                </div>

                {/* Step 3: Final Conclusion */}
                <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
                  <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
                  <div className="relative z-10 space-y-3">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
                      FINAL RESULT
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      Exponential Model: y ≈ 0.5353 · e^(1.0792x)
                    </h3>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
                      <BlockMath math={`\\boxed{y = 0.5353 \\cdot e^{1.0792 x}}`} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                      Using logarithmic least squares regression, the best fitting exponential growth curve is <strong>y ≈ 0.5353 · e^(1.0792x)</strong>!
                    </p>
                  </div>
                </div>

              </div>

              {/* Interactive Calculator Section */}
              <div className="pt-8 border-t-2 border-black/80 dark:border-neutral-700 space-y-6">
                <div className="inline-block border border-black/60 dark:border-neutral-600 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-mono font-bold rounded-md uppercase mb-1">
                  LABORATORY
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Interactive Live Calculator & Visualizer
                </h2>
                <LeastSquaresSolver />
              </div>

              {/* Sequential Routing Navigation */}
              <AlgorithmNavigation />

            </section>
          </div>
        </div>
      </FullscreenToggle>
    </>
  );
}