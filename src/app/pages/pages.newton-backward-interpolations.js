"use client"
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

import { useState, useEffect } from "react";
import NewtonBackwardInterpolations from "../algorithems/algorithems.newton-backward-interpolations";

import FullscreenToggle from "../components/FullscreanToggle";

export default function NewtonBackwardInterpolation() {

    const str = [`P(x) = y_n + v \\cdot \\Delta y_n + \\frac{v(v+1)}{2!} \\cdot \\Delta^2 y_{n-2} + \\frac{v(v+1)(v+2)}{3!} \\Delta^{3} y_{n-3} \\ldots`];
    const data = [
        { xxx: 24, yyy: 28.0600, deltaY: '', delta2Y: '', delta3Y: '', delta4Y: '' },
        { xxx: 28, yyy: 30.1900, deltaY: 2.1300, delta2Y: '', delta3Y: '', delta4Y: '' },
        { xxx: 32, yyy: 32.7500, deltaY: 2.5600, delta2Y: 0.4300, delta3Y: '', delta4Y: '' },
        { xxx: 36, yyy: 34.9400, deltaY: 2.1900, delta2Y: -0.3700, delta3Y: -0.8000, delta4Y: '' },
        { xxx: 40, yyy: 40.0000, deltaY: 5.0600, delta2Y: 2.8700, delta3Y: 3.2400, delta4Y: 4.0400 },
    ];
    const formula = `
    P(x) = y_n + v \\cdot \\Delta y_n + \\frac{v(v+1)}{2!} \\cdot \\Delta^2 y_{n-2} 
    + \\frac{v(v+1)(v+2)}{3!} \\cdot \\Delta^3 y_{n-3} 
    + \\frac{v(v+1)(v+2)(v+3)}{4!} \\cdot \\Delta^4 y_{n-4} + \\cdots
  `;

  const [theme, setTheme] = useState('light');

  // Load theme from local storage or default to light
  useEffect(() => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // Toggle the theme and store it in local storage
  const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
    return (
        

            <FullscreenToggle className="dark:bg-neutral-700">

            
                
                <section className="container mx-auto px-8 mt-10 dark:bg-neutral-700 dark:text-white">
                    <h1 className="text-2xl font-bold pb-5 inline-block
                    ">Newton Backward Interpolation Method</h1>
                    <div className="switch float-right inline-block fixed ">
      <input
        type="checkbox"
        className="switch__input"
        id="Switch"
        checked={theme === 'light'}
        onChange={toggleTheme}
      />
      <label className="switch__label" htmlFor="Switch">
        <span className="switch__indicator"></span>
        <span className="switch__decoration"></span>
      </label>
    </div>
                    <p className="text-base pl-1" >Newton Backward Interpolation is used to estimate the value of a function at a given point when the data points are tabulated at equal intervals. This method is particularly useful when you want to interpolate a value near the end of the data set. It utilizes backward differences to form the interpolation polynomial.<br></br><br></br>

                        The formula for Newton Backward Interpolation is:</p>

                    <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                        <BlockMath math={formula} />
                    </div>
                    <div className="pl-1"><p className="text-xl">where:</p>
                        <ul className={"list-disc list-inside text-lg p-3"}>
                            <li><InlineMath math="v = \frac{x - x_n}{h}" /></li>
                            <li><InlineMath math="x_n" /> is the last value of <InlineMath math="x" /> in the data.</li>

                            <li><InlineMath math="h" /> is the uniform difference between the <InlineMath math="x" /> values (where <InlineMath math="h = x_n - x_{n-1}" />).
                            </li>
                            <li><InlineMath math="\Delta y_n, \Delta^2 y_n, \dots" />
                                are the backward differences.</li>
                        </ul> <p>This method is efficient for interpolating at or near the end of the data set.</p>
                    </div>
                </section>

                <section className="container mx-auto p-8 dark:bg-neutral-700 dark:text-white">
                    <div className="p-4 ">
                        <h1 className="text-2xl font-bold mb-4">Example of Newton Backward Interpolation</h1>
                        <h2>Let&apos;ss say we are given the following data points:</h2><br></br>
                        <div className="p-4 flex justify-center overflow-hidden">
                            <table className="w-[80%] border-collapse border rounded-xl overflow-hidden ">
                                <thead>
                                    <tr>
                                        <th className="border px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">
                                            <InlineMath math="x" />
                                        </th>
                                        <th className="border px-4 py-2 bg-gray-100    dark:bg-neutral-800 text-left">
                                            <InlineMath math="y" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-neutral-700' : ' dark:bg-neutral-600'} >
                                            <td className="border  px-4  py-2">{row.xxx}</td>
                                            <td className="border px-4 py-2">{row.yyy}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table></div>
                    </div>
                    <p className=" p-4">We are tasked with finding <InlineMath math="y" /> where <InlineMath math="x = 33" /></p><br></br>

                    <div className=" p-4">
                        <p><span className="font-bold text-lg">Step 1:</span> Calculate the backward differences for the <InlineMath math="y" /> values.</p><br></br>
                        <div className=" flex justify-center overflow-x-auto ">
                            <div className="w-full max-w-4xl">
                                <table className="w-full  rounded-lg overflow-x-auto">
                                    <thead>
                                        <tr>
                                            <th className=" px-4 py-2 bg-gray-100   dark:bg-neutral-800 text-left rounded-tl-2xl">
                                                <InlineMath math="x" />
                                            </th>
                                            <th className="border px-4 py-2 bg-gray-100 text-left  dark:bg-neutral-800">
                                                <InlineMath math="y" />
                                            </th>
                                            <th className="border px-4 py-2 bg-gray-100 text-left  dark:bg-neutral-800">
                                                <InlineMath math={'{\\Delta y} '} />
                                            </th>
                                            <th className="border px-4 py-2 bg-gray-100 text-left  dark:bg-neutral-800">
                                                <InlineMath math={'{\\Delta^2 y} '} />
                                            </th>
                                            <th className="border px-4 py-2 bg-gray-100 text-left  dark:bg-neutral-800">
                                                <InlineMath math={'{\\Delta^3 y} '} />
                                            </th>
                                            <th className=" px-4 py-2 bg-gray-100 text-left rounded-tr-2xl  dark:bg-neutral-800">
                                                <InlineMath math={'{\\Delta^4 y} '} />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {data.map((row, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50  dark:bg-neutral-700' : ' dark:bg-neutral-600'}>
                                                <td className="border px-4 py-2 ">{row.xxx}</td>
                                                <td className="border px-4 py-2">{row.yyy}</td>
                                                <td className="border px-4 py-2">{row.deltaY}</td>
                                                <td className="border px-4 py-2">{row.delta2Y}</td>
                                                <td className="border px-4 py-2">{row.delta3Y}</td>
                                                <td className="border px-4 py-2">{row.delta4Y}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div><br></br>
                    <div className="p-4">
                        <p className="text-xl "><span className="font-bold  text-lg">Step 2:</span> use the formula <InlineMath math="v = \frac{x - x_n}{h}" /> values.</p><br></br>
                        <BlockMath math="\text{Given } x = 33 \text{ and } x_n = 40 \text{ with } h = 4," />
                        <BlockMath math="v = \frac{x - x_n}{h}" />
                        <BlockMath math="v = \frac{33 - 40}{4}" />
                        <BlockMath math="v = -1.75" />
                    </div><br></br>

                    <div className="p-4"> <p className="text-xl"><span className="font-bold text-lg">Step 3:</span>  Apply the Newton Backward Interpolation formula:</p><br></br>

                        <div className="mb-4">
                            <p className="text-lg font-semibold mb-2"></p>
                            <div className="bg-gray-100 p-4 border overflow-auto border-gray-300 rounded-lg shadow-md dark:bg-neutral-900">
                                <BlockMath math={formula} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-lg font-semibold mb-2">Substituting the values:</p>
                            <div className="bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-md overflow-auto line-wrap-custom dark:bg-neutral-900">
                                <BlockMath
                                    math={`P(40) = 40 + 
    \\frac{(-1.75 \\cdot (-1.75+1))}{1!} \\cdot 5.0600 + 
    \\frac{(-1.75 \\cdot (-1.75+1) \\cdot (-1.75+2))}{2!} \\cdot 2.8700 + 
    \\frac{(-1.75 \\cdot (-1.75+1) \\cdot (-1.75+2) \\cdot (-1.75+3))}{3!} \\cdot 3.2400 + 
    \\frac{(-1.75 \\cdot (-1.75+1) \\cdot (-1.75+2) \\cdot (-1.75+3) \\cdot (-1.75+4))}{4!} \\cdot 4.0400`}
                                />
                            </div>

                        </div>
                    </div>


                    <div className="p-8">
                        <h1 className="py-5 text-lg">Step-by-step:</h1>
                        <ol className="list-decimal text-lg pl-5">

                            <li className="py-3 overflow-auto"><p>First term: <InlineMath math={`40`} /> </p></li>

                            <li className="py-3 spa overflow-auto "><p>Second term: <InlineMath math={`\\frac{(−1.75∗(−1.75+1))}{1!}∗5.0600 = −8.85500`} /> </p></li>

                            <li className="py-3 overflow-auto "><p>Third term: <InlineMath math={`\\frac{(−1.75∗(−1.75+1)∗(−1.75+2))}{2!} ∗2.8700  = 0.17718 `} /> </p></li>

                            <li className="py-3 overflow-auto "><p>Fourth term: <InlineMath math={`\\frac{(−1.75∗(−1.75+1)∗(−1.75+2)∗(−1.75+3))}{3!} ∗3.2400 = 0.17718 `} /> </p></li>

                            <li className="py-3 overflow-auto  "><p>Fifth term: <InlineMath math={`\\frac{(−1.75∗(−1.75+1)∗(−1.75+2)∗(−1.75+3)∗(−1.75+4))}{4!} ∗4.0400 =0.06904 `} /> </p></li>
                        </ol>

                        <div className=" text-lg">

                            <p className=" font-bold my-2">Adding them together:</p>
                            <div className="p-3 my-3  ">
                                <InlineMath math={'P(33)= 40+(−8.855000000000004)+(1.883437500000003)+(0.1771875000000003)+(0.06904296875000004)'} />
                            </div>


                            <p >Thus, the interpolated value of <InlineMath math={`y   `} /> at <InlineMath math={'x = 33'} /> is approximately <InlineMath math={`33.27466    `} />  </p></div>  </div>


                </section>







                <section className="p-5 dark:bg-neutral-700">
                    <NewtonBackwardInterpolations />
                </section>

            </FullscreenToggle>

        

    );
}