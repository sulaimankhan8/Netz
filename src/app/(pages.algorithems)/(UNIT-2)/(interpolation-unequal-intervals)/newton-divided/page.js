"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

import ThemeToggle from "../../../../components/ThemeToggle";
import FullscreenToggle from "../../../../components/FullscreanToggle";
import NewtonsDividedDifference from "./algorithems.newton-s-divided-difference-interpolations";

export default function NewtonsDividedDifferences() {

    const formula = `f(x)=y_0+(x-x_0)f[x_0,x_1]+(x-x_0)(x-x_1)f[x_0,x_1,x_2]+(x-x_0)(x-x_1)(x-x_2)f[x_0,x_1,x_2,x_3] `;

    const data = [
        { x: 0, y: 1  , deltaY: `\\frac{3-1}{1-0}=2`     , delta2Y:`\\frac{23-2}{3-0}=7`    , delta3Y: `\\frac{19-7}{4-0}=3` , delta4Y: `\\frac{3-3}{7-0}=0`  },
        { x: 1, y: 3  , deltaY:`\\frac{49-3}{3-1}=23`    , delta2Y:`\\frac{80-23}{4-1}=19  `, delta3Y: `\\frac{37-19}{7-1}=3` , delta4Y: '' },
        { x: 3, y: 49 , deltaY:`\\frac{129-49}{4-3}=80`  , delta2Y:`\\frac{228-80}{7-3}=37` , delta3Y: '', delta4Y: '' },
        { x: 4, y: 129, deltaY:`\\frac{813-129}{7-4}=228`, delta2Y:'', delta3Y: '', delta4Y: '' },
        { x: 7, y: 813, deltaY: ''                       , delta2Y:'', delta3Y: '', delta4Y: '' },];


    
    return (
    
        
            <FullscreenToggle className="dark:bg-neutral-700">
                <div className="md:ml-[80px] space-y-4">
                <section className="container mx-auto space-y-3 px-8 pt-10 dark:bg-neutral-700 dark:text-white">
                        <h1 className="text-2xl font-bold pb-5">Newton&apos;s Divided Difference Interpolation Method</h1>
                        <div className="switch float-right inline-block absolute">
                            <ThemeToggle />
                        </div>

                        <p>Newton&apos;s Divided Difference formula is used for polynomial interpolation. It provides a way to construct a polynomial that passes through a given set of points. The formula is particularly useful when the points are not equally spaced.</p>

                        <div className="bg-gray-100 p-4 border dark:bg-neutral-800 border-gray-300 rounded-lg shadow-md">
                            <div className="overflow-x-auto">
                                <BlockMath math={formula} /></div>
                        </div>

                        <p>Where:</p>
                        <ul className="list-disc list-inside p-3">
                            <li><InlineMath math="f(x) " /> is the interpolating polynomial ,which gives the value at <InlineMath math=" x"/></li>
                            <li><InlineMath math="y_0 " /> is the initial value corresponding to  <InlineMath math=" x_0 " /> given.</li>
                            <li><InlineMath math=" f[x_0,x_1,....,x_n] "/> are the divided differences. <InlineMath math={` f[x_0,x_1...x_n] = \\frac{ f[x_1...x_n] -f[x_0,x_1...x_{n-1}]}{ x_n - x_0}`}/></li>
                            <li>The terms <InlineMath math=" (x - x_0)(x - x_1) \dots" />  are Basis Polynomials,Here, 𝑥 is the point at which you want to evaluate the interpolating polynomial.  <InlineMath math=" x_ n "/> is one of the known data points</li>
                        </ul>
                    </section>

                    <section className="container mx-auto space-y-3 sm:p-8 dark:bg-neutral-700 dark:text-white">
                        <h1 className="text-2xl font-bold mb-4">Example of Newton&apos;s Divided Difference Interpolation</h1>
                        <p>Given the following data points:</p>

                        <table className="w-[80%] mx-auto border-collapse border rounded-xl overflow-hidden">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">x</th>
                                    <th className="border px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="y= f(x_0)"/></th>
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

                        <p>We are tasked with finding <InlineMath math="f(x)" /> where <InlineMath math="x = 0.3" />.</p>

                        
                        <div className="space-y-4">
                            <p><strong>Step 1:</strong> Calculate the divided differences for the <InlineMath math="y" /> values.</p>
                            <table className="w-full rounded-lg">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left rounded-tl-lg">x</th>
                            
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="y=f(x_0)" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math=" 1^{st} order" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="2^{st} order" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left"><InlineMath math="3^{st} order" /></th>
                                        <th className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left rounded-tr-lg"><InlineMath math="4^{st} order" /></th>
                                      
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-neutral-700' : 'dark:bg-neutral-600'}>
                                            <td className="border px-4 py-2">{row.x}</td>
                                        
                                            <td className="border px-4 py-2">{row.y}</td>
                                            <td className="border px-4 py-2"><InlineMath math={`${row.deltaY}`}/></td>
                                            <td className="border px-4 py-2"><InlineMath math={`${row.delta2Y}`}/></td>
                                            <td className="border px-4 py-2"><InlineMath math={`${row.delta3Y}`}/></td>
                                            <td className="border px-4 py-2"><InlineMath math={`${row.delta4Y}`}/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                       

                        <div className="p-4 ">
                            <p><strong>Step 2:</strong> Apply the Newtons Divided Interpolation formula:</p>
                            <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md"> <BlockMath math={formula +`\\cdots`} /></div>
                        </div>
                        <div className="p-4">
                            <p className="text-xl">
                                <span className="font-bold text-lg">Step 3:</span> Substituting the values into the interpolation formula:
                            </p><div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                                <BlockMath
                                    math={`f(0.3) = 1 + (0.3-0)2 + (0.3)(0.3-1)7 + (0.3)(0.3-1)(0.3-3)3 + 0`}
                                /></div>
                        </div>

                        
                        <div className="p-4">
                            <p className="text-xl">
                                <span className="font-bold text-lg">Step 4:</span> After solving the equation, the interpolated value of <InlineMath math="f(x)" /> at <InlineMath math="x = 0.3" /> is approximately:
                            </p>
                            <BlockMath math="P(0.3) \approx 1.831" />
                            <p>This is the final result of the Newtons Divided Interpolation method.</p>
                        </div>
                    </section>
                    <section>
                        <NewtonsDividedDifference/>
                    </section>
                </div>
            </FullscreenToggle>
        
    );
}
