"use client";

import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { useState, useEffect } from "react";
import NewtonForwardInterpolations from "../algorithems/algorithems.newton-forward-interpolations"; // Updated import


import FullscreenToggle from "../components/FullscreanToggle";
import PageButton from "../components/pageButton";

export default function NewtonForwardInterpolation() {
    const str = `P(x) = y_0 + v \\cdot \\Delta y_0 + \\frac{v(v-1)}{2!} \\cdot \\Delta^2 y_{0} 
    + \\frac{v(v-1)(v-2)}{3!} \\cdot \\Delta^3 y_0  `;
    const data = [
        { xxx: 1, yyy: 2, deltaY: 3, delta2Y: 2, delta3Y: 0},
        { xxx: 2, yyy: 5, deltaY:5, delta2Y: 2, delta3Y: ''},
        { xxx: 3, yyy: 10, deltaY: 7, delta2Y: '', delta3Y: '' },
        { xxx: 4, yyy: 17, deltaY: '' , delta2Y: '', delta3Y: '' },
       
    ];
    
   
    const formula = `
    P(x) = y_0 + v \\cdot \\Delta y_0 + \\frac{v(v-1)}{2!} \\cdot \\Delta^2 y_0 
    + \\frac{v(v-1)(v-2)}{3!} \\cdot \\Delta^3 y_0 
    + \\frac{v(v-1)(v-2)(v-3)}{4!} \\cdot \\Delta^4 y_0 + \\cdots
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
                <h1 className="text-2xl font-bold pb-5 inline-block">
                    Newton Forward Interpolation Method
                </h1>
                <div className="switch float-right inline-block fixed">
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

                <p className="text-base pl-1">
                    Newton Forward Interpolation is used to estimate the value of a function at a given point when the data points are tabulated at equal intervals. This method is particularly useful when you want to interpolate a value near the beginning of the data set. It utilizes forward differences to form the interpolation polynomial.<br /><br />
                    The formula for Newton Forward Interpolation is:
                </p>

                <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                    <BlockMath math={formula} />
                </div>
                <div className="pl-1">
                    <p className="text-xl">where:</p>
                    <ul className={"list-disc list-inside text-lg p-3"}>
                        <li><InlineMath math="v = \frac{x - x_0}{h}" /></li>
                        <li><InlineMath math="x_0" /> is the first value of <InlineMath math="x" /> in the data.</li>
                        <li><InlineMath math="h" /> is the uniform difference between the <InlineMath math="x" /> values (where <InlineMath math="h = x_1 - x_0" />).</li>
                        <li><InlineMath math="\Delta y_0, \Delta^2 y_0, \dots" />
                            are the forward differences.</li>
                    </ul>
                    <p>This method is efficient for interpolating at or near the beginning of the data set.</p>
                </div>
            </section>

            <section className="container mx-auto p-8 dark:bg-neutral-700 dark:text-white">
                <div className="p-4 ">
                    <h1 className="text-2xl font-bold mb-4">Example of Newton Forward Interpolation</h1>
                    <h2>Let&apos;s say we are given the following data points:</h2><br />
                    <div className="p-4 flex justify-center overflow-hidden">
                        <table className="w-[80%] border-collapse border rounded-xl overflow-hidden ">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">
                                        <InlineMath math="x" />
                                    </th>
                                    <th className="border px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left">
                                        <InlineMath math="y" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-neutral-700' : ' dark:bg-neutral-600'}>
                                        <td className="border  px-4  py-2">{row.xxx}</td>
                                        <td className="border px-4 py-2">{row.yyy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className=" p-4">We are tasked with finding <InlineMath math="y" /> where <InlineMath math="x = 2.5" /></p><br />

                <div className=" p-4">
                    <p><span className="font-bold text-lg">Step 1:</span> Calculate the forward differences for the <InlineMath math="y" /> values.</p><br />
                    <div className=" flex justify-center overflow-x-auto ">
                        <div className="w-full max-w-4xl">
                            <table className="w-full  rounded-lg overflow-x-auto">
                                <thead>
                                    <tr>
                                        <th className=" px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-left rounded-tl-2xl">
                                            <InlineMath math="x" />
                                        </th>
                                        <th className="border px-4 py-2 bg-gray-100 text-left dark:bg-neutral-800">
                                            <InlineMath math="y" />
                                        </th>
                                        <th className="border px-4 py-2 bg-gray-100 text-left dark:bg-neutral-800">
                                            <InlineMath math={'{\\Delta y} '} />
                                        </th>
                                        <th className="border px-4 py-2 bg-gray-100 text-left dark:bg-neutral-800">
                                            <InlineMath math={'{\\Delta^2 y} '} />
                                        </th>
                                        <th className=" px-4 py-2 bg-gray-100 text-left rounded-tr-2xl  dark:bg-neutral-800">
                                            <InlineMath math={'{\\Delta^3 y} '} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody >
                                    {data.map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50  dark:bg-neutral-700' : ' dark:bg-neutral-600'}>
                                            <td className=" px-4 py-2 ">{row.xxx}</td>
                                             <td className="border px-4 py-2">{row.yyy}</td>
                                            <td className="border px-4 py-2">{row.deltaY}</td>
                                            <td className="border px-4 py-2">{row.delta2Y}</td>
                                            <td className=" px-4 py-2">{row.delta3Y}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <p className="text-xl"><span className="font-bold  text-lg">Step 2:</span > Using the formula <InlineMath math="v = \frac{x - x_0}{h}" /> values. </p><br/>
                   
                        <BlockMath math={"\\text{Given } x = 2.5 \\text{ and } x_0 = 1 \\text{ with } h = 1"} />
                        <BlockMath math="v = \frac{x - x_0}{h}" />
                        <BlockMath math="v = \frac{2.5 - 1}{1}" />
                        <BlockMath math="v = 1.5" />
                    
                </div>

                <div className="p-4">
                    <p className="text-xl"><span className="font-bold text-lg">Step 3:</span> Apply the Newton Forward Interpolation formula:</p><br/>
                    <div className="mb-4">
                            <p className="text-lg font-semibold mb-2"></p>
                            <div className="bg-gray-100 p-4 border overflow-auto border-gray-300 rounded-lg shadow-md dark:bg-neutral-900">
                                <BlockMath math={str} />
                            </div>
                        </div><br/>

                        <div className="mb-4">
                        <p className="text-lg font-semibold mb-2">Substitute the known values:</p>
                    <div className="bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-md overflow-auto line-wrap-custom dark:bg-neutral-900">
                        <BlockMath math={`
                        P(2.5) = 2 + 1.5 \\cdot 3 + \\frac{1.5(1.5-1)}{2!} \\cdot 2 + 
                        \\frac{1.5(.5-1)(1.5-2)}{3!} \\cdot (0)
                        `} />
                    </div> </div><br/>


                    <div className="p-8">
                        <h1 className="py-5 text-lg">Step-by-step:</h1>
                        <ol className="list-decimal text-lg pl-5">

                            <li className="py-3 overflow-auto">
                                <BlockMath math={`\\text{First term = } 2`}/></li>

                            <li className="py-3 spa overflow-auto "><BlockMath math={`\\text{Second term: } 1.5 \\cdot 3 = 4.5`} /> </li>

                            <li className="py-3 overflow-auto "> <BlockMath math={` \\text{Third term: } \\frac{1.5(1.5-1)}{2!} \\cdot 2 = 0.75 `} /> </li>

                            <li className="py-3 overflow-auto "><BlockMath math={`  \\text{Fourth term: } \\frac{1.5(.5-1)(1.5-2)}{3!} \\cdot (0) = 0 `} /></li>

                           
                        </ol>

                        <div className=" text-lg">

                            <p className=" font-bold my-2">Adding them together:</p>
                            <div className="p-3 my-3  ">
                                <BlockMath math={'P(33)= 2+(4.5)+(0.75)+(0)'} />
                            </div>


                            <p >Thus, the interpolated value of <InlineMath math={`y   `} /> at <InlineMath math={'x =2.5'} /> is approximately <InlineMath math={`7.25   `} />  </p></div>  </div></div>
            </section>
            <section className="p-5"><NewtonForwardInterpolations/></section>
            <section className="p-8 m-4">
  <div className="flex justify-between items-center">
    <PageButton 
      st="prev"
      route="/newton-foward"
    />
    
    <div className="flex-grow flex justify-center mx-4">
      <PageButton 
        st="home"
        route="/"
      />
    </div>
    
    <PageButton 
      st="next"
      route="/newton-backward"
    />
  </div>
</section>

        </FullscreenToggle>
    );
}
