"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import Head from 'next/head';
import ThemeToggle from "../../../../components/ThemeToggle";
import FullscreenToggle from "../../../../components/FullscreanToggle";
import GaussBackwardInterpolation from "./algorithems.gauss-backward-interpolations";

export default function GaussBackwardInterpolations() {

    const formula = `
    P = y_0 + p \\Delta y_{-1} + \\frac{(p+1)p}{2!} \\cdot \\Delta^2 y_{-1} + \\frac{(p+1)p(p-1)}{3!} \\cdot \\Delta^3 y_{-2} 
    + \\frac{(p+2)(p+1)p(p-1)}{4!} \\cdot \\Delta^4 y_{-2} +`;

    const data = [
        { x: 1931, p: -20, y: 15, deltaY: '', delta2Y:'', delta3Y: '', delta4Y: '' },
        { x: 1941, p: -10, y: 20, deltaY: 5 , delta2Y: 2, delta3Y: '', delta4Y: '' },
        { x: 1951, p:   0, y: 27, deltaY: 7 , delta2Y: 5, delta3Y: 3, delta4Y: 7 },
        { x: 1961, p:  10, y: 39, deltaY: 12, delta2Y: 1, delta3Y: -4, delta4Y: '' },
        { x: 1971, p:  20, y: 52, deltaY: 13, delta2Y:'', delta3Y: '', delta4Y: '' },];


    
    return (
    <>
         <Head>
                <title>Gauss Backward Interpolation | Netz</title>
                <meta name="description" content="Master Gauss Backward Interpolation method with step-by-step explanations and examples. Netz makes it easy to understand complex interpolation techniques." />
                <meta name="keywords" content="Gauss backward interpolation, interpolation methods, Netz, math problem solving" />
                <meta name="author" content="Netz" />
                <meta property="og:title" content="Gauss Backward Interpolation | Netz" />
                <meta property="og:description" content="Learn Gauss Backward Interpolation with examples and explanations to enhance your understanding of interpolation techniques." />
                <meta property="og:url" content="https://netz-ruby.vercel.app/gauss-backward" />
                <meta property="og:type" content="article" />
                <meta property="og:image" content="https://netz-ruby.vercel.app/images/icon.svg" />
                <meta property="og:image" content="https://netz-ruby.vercel.app/images/gauss-backward-og-image.jpeg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Gauss Backward Interpolation | Netz" />
                <meta name="twitter:description" content="Master Gauss Backward Interpolation with easy-to-follow steps on Netz." />
                <meta name="twitter:image" content="https://netz-ruby.vercel.app/images/icon.svg" />
                <meta name="twitter:image:src" content="https://netz-ruby.vercel.app/images/gauss-backward-twitter-card.jpeg" />
            </Head>

            <FullscreenToggle className="dark:bg-neutral-700">
                <div className="md:ml-[80px] space-y-4">
                <section className="container mx-auto space-y-3 px-8 pt-10 dark:bg-neutral-700 dark:text-white">
                        <h1 className="text-2xl font-bold pb-5">Gauss Backward Interpolation Method</h1>
                        <div className="switch float-right inline-block absolute">
                            <ThemeToggle />
                        </div>

                        <p>Gauss Backward Interpolation is used to interpolate a value close to the beginning of the data set. The method uses Backward differences to create an interpolation polynomial.</p>

                        <div className="bg-gray-100 p-4 border dark:bg-neutral-800 border-gray-300 rounded-lg shadow-md">
                            <div className="overflow-x-auto">
                                <BlockMath math={formula} /></div>
                        </div>

                        <p>Where:</p>
                        <ul className="list-disc list-inside p-3">
                            <li><InlineMath math="y_p " /> is the interpolated value at  <InlineMath math="x_p" /></li>
                            <li><InlineMath math="y_0 " />
                                 is the initial value corresponding to  <InlineMath math=" x_0" /> its the First value of <InlineMath math="x_p" /> greater than <InlineMath math="x " /> given, to interpolate.</li>
                            <li><InlineMath math=" \Delta^n y "/> are the Backward differences of the function values taken from the central difference table.</li>
                            <li><InlineMath math="p = \frac{x-x_0}{h}, h" /> is the uniform difference between the <InlineMath math="x" /> values.</li>
                            <li>The terms<InlineMath math="p,(p-1),(p+1) \dots" />  are the factors involving the relative position of 𝑥 with respect to the data points.</li>
                        </ul>
                    </section>

                    <section className="container mx-auto space-y-3 sm:p-8 dark:bg-neutral-700 dark:text-white">
                        <h1 className="text-2xl font-bold mb-4">Example of Gauss Backward Interpolation</h1>
                        <p>Given the following data points:</p>

                        <table className="w-[80%] mx-auto border-collapse border rounded-xl overflow-hidden">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">x</th>
                                    <th className="border px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">y</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-neutral-700' : 'dark:bg-neutral-600'}>
                                        <td className="border px-4 py-2">{row.x}</td>
                                        <td className="border px-4 py-2">{row.y}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p>We are tasked with finding <InlineMath math="y_p" /> where <InlineMath math="x = 1946" />.</p>

                        <div className="p-4">
                            <p><strong>Step 1:</strong> taking the closest to    <InlineMath math=" x \text{ as } x_0 = 1951 , " /><InlineMath math=" h = x_2 - x_1 = 1931 - 1941" /></p>
                            
                        </div>
                        <div className="p-4">
                            <p><strong>Step 2:</strong> Use the formula <InlineMath math=" p = \frac{x - x_0}{h}" />.</p>
                            <BlockMath math=" p = \frac{1946 - 1951}{10} = -0.5 " />
                        </div>
                        <div className="space-y-4">
                            <p><strong>Step 3:</strong> Calculate the central differences for the <InlineMath math="y" /> values.</p>
                            <table className="w-full rounded-lg">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left rounded-tl-lg">x</th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">p</th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">y</th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="\Delta y" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="\Delta^2 y" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="\Delta^3 y" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left rounded-tr-lg"><InlineMath math="\Delta^4 y" /></th>
                                      
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-neutral-700' : 'dark:bg-neutral-600'}>
                                            <td className="border px-4 py-2">{row.x}</td>
                                            <td className="border px-4 py-2">{row.p}</td>
                                            <td className="border px-4 py-2">{row.y}</td>
                                            <td className="border px-4 py-2">{row.deltaY}</td>
                                            <td className="border px-4 py-2">{row.delta2Y}</td>
                                            <td className="border px-4 py-2">{row.delta3Y}</td>
                                            <td className="border px-4 py-2">{row.delta4Y}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                       

                        <div className="p-4 ">
                            <p><strong>Step 4:</strong> Apply the Gauss Backward Interpolation formula:</p>
                            <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md"> <BlockMath math={formula +`\\cdots`} /></div>
                        </div>
                        <div className="p-4">
                            <p className="text-xl">
                                <span className="font-bold text-lg">Step 5:</span> Substituting the values into the interpolation formula:
                            </p><div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                                <BlockMath
                                    math={`P(1946) = 27 + 
        (-0.5) \\cdot 7 + 
        \\frac{(-0.5+1)∗(-0.5)}{2!} \\cdot 5 + 
        \\frac{(-0.5+1)∗(-0.5)∗(-0.5−1)}{3!} \\cdot 3 + 
        \\frac{(-0.5+2)(0.5+1)∗(-0.5)∗(0.5−1)}{4!} \\cdot -7 `}
                                /></div>
                        </div>

                        {/* Step 5 */}
                        <div className="p-4">
                            <p className="text-xl">
                                <span className="font-bold text-lg">Step 6:</span> After solving the equation, the interpolated value of <InlineMath math="y" /> at <InlineMath math="x = 1946" /> is approximately:
                            </p>
                            <BlockMath math="P(1946) \approx 22.8984375" />
                            <p>This is the final result of the Gauss Backward Interpolation method.</p>
                        </div>
                    </section>
                    <section>
                        <GaussBackwardInterpolation/>
                    </section>
                </div>
            </FullscreenToggle>
        </>
    );
}
