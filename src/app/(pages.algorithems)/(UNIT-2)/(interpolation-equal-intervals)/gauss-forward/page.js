"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

import Head from 'next/head';
import ThemeToggle from "../../../../components/ThemeToggle";
import FullscreenToggle from "../../../../components/FullscreanToggle";
import GaussForwardInterpolation from "./algorithems.gauss-forward-interpolations";

export default function GaussForwardInterpolations() {

    const formula = `
    P(x)=y_p = y_0 + p \\cdot \\Delta y_0 + \\frac{p(p-1)}{2!} \\cdot \\Delta^2 y_{-1} + 
    \\frac{(p+1) p (p-1)}{3!} \\cdot \\Delta^3 y_{-1} +
      \\frac{(p+1) p (p-1)(p-2)}{4!} \\cdot \\Delta^4 y_{-2} + \\cdots
    `;

    const data = [
        { x: 2.5, p: -1 , y: 24.145, deltaY: -2.102, delta2Y: ''   , delta3Y: ''    , delta4Y: ''    , delta5Y: ''    },
        { x: 3  , p:-0.5, y: 22.043, deltaY: -1.818, delta2Y: 0.284, delta3Y: -0.047, delta4Y: ''    , delta5Y: ''    },
        { x: 3.5, p: 0  , y: 20.225, deltaY: -1.581, delta2Y: 0.237, delta3Y: -0.038, delta4Y: 0.009 , delta5Y:-0.003 },
        { x: 4  , p: 0.5, y: 18.644, deltaY: -1.382, delta2Y: 0.199, delta3Y: -0.032, delta4Y: 0.006 , delta5Y: ''    },
        { x: 4.5, p: 1  , y: 17.262, deltaY: -1.215, delta2Y: 0.167, delta3Y: ''    , delta4Y: ''    , delta5Y: ''    },
        { x: 5  , p: 1.5, y: 16.047, deltaY: ''    , delta2Y: ''   , delta3Y: ''    , delta4Y: ''    , delta5Y: ''    },
    ];

    return (
        <>
            <Head>
                <title>Gauss Forward Interpolation | Netz</title>
                <meta name="description" content="Understand the Gauss Forward Interpolation method with detailed explanations and examples. Netz simplifies complex interpolation methods." />
                <meta name="keywords" content="Gauss forward interpolation, Netz, interpolation methods, math problem solving,math" />
                <meta property="og:title" content="Gauss Forward Interpolation | Netz" />
                <meta property="og:description" content="Learn Gauss Forward Interpolation with examples and easy-to-follow steps." />
            </Head>

            <FullscreenToggle>
                <div className="md:ml-[80px] space-y-6">
                    <section className="container mx-auto space-y-3 px-8 pt-10 dark:bg-neutral-700 dark:text-white">
                        <h1 className="text-2xl font-bold pb-5">Gauss Forward Interpolation Method</h1>
                        <div className="switch float-right inline-block absolute">
                            <ThemeToggle />
                        </div>

                        <p>Gauss Forward Interpolation is used to interpolate a value close to the beginning of the data set. The method uses forward differences to create an interpolation polynomial.</p>

                        <div className="bg-gray-100 p-4 border dark:bg-neutral-800 border-gray-300 rounded-lg shadow-md">
                            <div className="overflow-x-auto">
                                <BlockMath math={formula} /></div>
                        </div>

                        <p>Where:</p>
                        <ul className="list-disc list-inside p-3">
                            <li><InlineMath math="y_p " /> is the interpolated value at  <InlineMath math="x_p" /></li>
                            <li><InlineMath math="y_0 " />
                                is the initial value corresponding to  <InlineMath math=" x_0" /></li>
                            <li><InlineMath math=" \Delta^n y " />are the forward differences of the function values.</li>
                            <li><InlineMath math="p = \frac{x-x_0}{h}, h" /> is the uniform difference between the <InlineMath math="x" /> values.</li>
                            <li>The terms<InlineMath math="p,(p-1),(p+1) \dots" />  are the factors involving the relative position of 𝑥 with respect to the data points.</li>
                        </ul>
                    </section>

                    <section className="container mx-auto space-y-3 sm:p-8 dark:bg-neutral-700 dark:text-white">
                        <h1 className="text-2xl font-bold mb-4">Example of Gauss Forward Interpolation</h1>
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

                        <p>We are tasked with finding <InlineMath math="y_p" /> where <InlineMath math="x = 3.75" />.</p>

                        <div className="p-4">
                            <p><strong>Step 1:</strong> taking the closest to    <InlineMath math=" x \text{ as } x_0 = 3.5 , " /><InlineMath math=" h = x_2 - x_1" /></p>
                            
                        </div>
                        <div className="p-4">
                            <p><strong>Step 2:</strong> Use the formula <InlineMath math=" p = \frac{x - x_0}{h}" />.</p>
                            <BlockMath math=" p = \frac{3.75 - 3.5}{0.5} = 0.5 " />
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
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="\Delta^4 y" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left rounded-tr-lg"><InlineMath math="\Delta^5 y" /></th>
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
                                            <td className="border px-4 py-2">{row.delta5Y}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                       

                        <div className="p-4 ">
                            <p><strong>Step 4:</strong> Apply the Gauss Forward Interpolation formula:</p>
                            <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md"> <BlockMath math={formula} /></div>
                        </div>
                        <div className="p-4">
                            <p className="text-xl">
                                <span className="font-bold text-lg">Step 5:</span> Substituting the values into the interpolation formula:
                            </p><div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                                <BlockMath
                                    math={`P(3.75) = 20.225 + 
        (0.5) \\cdot −1.5810 + 
        \\frac{(0.5∗(0.5−1))}{2!} \\cdot 0.2370 + 
        \\frac{((0.5+1)∗0.5∗(0.5−1))}{3!} \\cdot -0.0380 + 
        \\frac{((0.5+1)∗0.5∗(0.5−1)∗(0.5−2))}{4!} \\cdot 0.0090 +
        \\frac{((0.5+1)∗(0.5+2)∗0.5∗(0.5−1)∗(0.5−2))}{5!} \\cdot -0.0030`}
                                /></div>
                        </div>

                        {/* Step 5 */}
                        <div className="p-4">
                            <p className="text-xl">
                                <span className="font-bold text-lg">Step 6:</span> After solving the equation, the interpolated value of <InlineMath math="y" /> at <InlineMath math="x = 3.75" /> is approximately:
                            </p>
                            <BlockMath math="P(3.75) \approx 19.4074" />
                            <p>This is the final result of the Gauss Forward Interpolation method.</p>
                        </div>
                    </section>
                    <section>
                        <GaussForwardInterpolation />
                    </section>
                </div>
            </FullscreenToggle>
        </>
    );
}
