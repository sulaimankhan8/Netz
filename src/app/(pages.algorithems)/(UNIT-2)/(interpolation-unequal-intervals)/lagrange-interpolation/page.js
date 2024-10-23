'use client';

import FullscreenToggle from "@/app/components/FullscreanToggle";
import LagrangeInterpolations from "./algorithems.lagrange-interpolations";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import PageButton from "../../../../components/pageButton";
import ThemeToggle from "../../../../components/ThemeToggle";



export default function test(){
  
    const data = [
        { xxx: 0, yyy: 5, deltaY: `\\frac{(4-2)(4-3)(4-5)(4-6)}{(0-2)(0-3)(0-5)(0-6)} = 0.0222` },
        { xxx: 2, yyy: 7, deltaY:`\\frac{(4-0)(4-3)(4-5)(4-6)}{(2-0)(2-3)(2-5)(2-6)} = 0.3333` },
        { xxx: 3, yyy: 8, deltaY: `\\frac{(4-0)(4-2)(4-5)(4-6)}{(3-0)(3-2)(3-5)(3-6)} = 0.8889` },
        { xxx: 5, yyy:10, deltaY: `\\frac{(4-0)(4-2)(4-3)(4-6)}{(5-0)(5-2)(5-3)(5-6)} = 0.5333` },
        { xxx: 6, yyy:12, deltaY: `\\frac{(4-0)(4-2)(4-3)(4-5)}{(6-0)(6-2)(6-3)(6-5)} = 0.1111` },
    ];
    const formula = `
    P(x) = y_0 \\cdot L_0(x) + y_1 \\cdot L_1(x) + y_2 \\cdot L_2(x)  + \\cdots y_n \\cdot L_n(x)
  `;
  const str = `L_i(x) = \\frac{(x - x_0)(x - x_1) \\cdots (x - x_{i-1})(x - x_{i+1}) \\cdots (x - x_n)}{(x_i - x_0)(x_i - x_1) \\cdots (x_i - x_{i-1})(x_i - x_{i+1}) \\cdots (x_i - x_n)}
`;
    return(
        <FullscreenToggle className="dark:bg-neutral-700">

            

                <div className="md:ml-[80px]">
                <section className="container mx-auto px-8 pt-10 dark:bg-neutral-700 dark:text-white">
                    <h1 className="text-2xl font-bold pb-5 inline-block
                    ">Lagrange interpolation Method</h1>
     <div className="switch float-right inline-block absolute">
     <ThemeToggle />
  
  
</div>

                    <p className="text-base pl-1" >
                    The Lagrange interpolation method is a polynomial interpolation technique used to construct a polynomial that passes through a given set of points. This method is particularly useful for finding the value of a function at a specific point, given its values at known points.<br></br><br></br>

                        The formula for Lagrange interpolation method  Interpolation is:</p>

                    <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                        <BlockMath math={formula} />
                        <BlockMath math={str} />
                    </div>
                    <div className="pl-1"><p className="text-xl">where:</p>
                        <ul className={"list-disc list-inside text-lg p-3"}>
                            <li><InlineMath math="(x_n,y_n)" /> are the given data points.</li>
                            <li><InlineMath math="L_i(x)" />  is the Lagrange basis polynomial, <BlockMath math={`L_i(x) = \\prod_{j=0, j \\,\\neq \\, i}^{n} \\frac{x - x_j}{x_i - x_j}`}/> </li>
                            <li><InlineMath math="n " />
                            is the number of data points.</li>
                            <li><InlineMath math="P(x) " />
                            is the The Lagrange polynomial.</li>
                        </ul> 
                    </div>
                </section>

                <section className="container mx-auto sm:p-8  dark:bg-neutral-700 dark:text-white">
                    <div className="sm:p-4 ">
                        <h1 className="text-2xl font-bold mb-4">Example of Newton Backward Interpolation</h1>
                        <h2>Let&apos;s say we are given the following data points:</h2><br></br>
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
                    <p className=" p-4">We are tasked with finding <InlineMath math="y" /> where <InlineMath math="x = 4" /></p><br></br>

                    <div className=" p-4">
                        <p className="font-bold text-lg">Step 1: Calculate the <InlineMath math="L_n (x)"/> for the <InlineMath math="y" /> values.</p><br></br>
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
                                            <th className=" px-4 py-2 bg-gray-100 text-left  dark:bg-neutral-800 rounded-tr-2xl">
                                                <InlineMath math={'L_n(x) '} />
                                            </th>
                                          
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {data.map((row, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50  dark:bg-neutral-700' : ' dark:bg-neutral-600'}>
                                                <td className="border px-4 py-2 ">{row.xxx}</td>
                                                <td className="border px-4 py-2">{row.yyy}</td>
                                                <td className="border px-4 py-2"><InlineMath math={row.deltaY}/></td>
                                             </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div><br></br>



                    <div className="p-4"> 
                        <p className="text-xl"><span className="font-bold text-lg">Step 3:</span>  Apply the Newton Backward Interpolation formula:</p><br></br>

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
                                    math={`P(4) = 5 \\cdot 0.0222 + 
                                        7 \\cdot 0.3333 + 8 \\cdot 08889 
                                        10 \\cdot 0.5333 + 12 \\cdot 0.1111
                                        `}
                                />
                            </div>

                        </div>
                        <div className="mb-4">
                            <p className="text-lg font-semibold mb-2">Substituting the values:</p>
                            <div className="bg-gray-100 p-4 border border-gray-300 rounded-lg shadow-md overflow-auto line-wrap-custom dark:bg-neutral-900">
                                <BlockMath
                                    math={`P(4) = 0.1111 - 2.3333 + 7.1111+ 5.3333 + - 1.3333
                                        `}
                                />
                            </div>

                        </div>
                    </div>


                    <div className="sm:py-8">
                       
                        <div className=" text-lg">

                            <p className=" font-bold my-2">Adding them together:</p>
                            <div className="p-3 my-3  ">
                                <InlineMath math={'P(4) =   8.8889'} />
                            </div>


                            <p >Thus, the interpolated value of <InlineMath math={`y   `} /> at <InlineMath math={'x = 4'} /> is approximately <InlineMath math={` 8.8889   `} />  </p></div>  </div>


                </section>







                <section className="p-5 dark:bg-neutral-700">
                    
        <LagrangeInterpolations/>
                </section>
                <section className="p-8 m-4">
  <div className="flex justify-between items-center">
    <PageButton 
      st="prev"
      route="/newton-forward"
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

</div>

            </FullscreenToggle>
    );
}

