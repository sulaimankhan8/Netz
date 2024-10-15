'use client';

import FixedPointMethod from "./algorithems.fixed-point-method";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import FullscreenToggle from "@/app/components/FullscreanToggle";
import ThemeToggle from "@/app/components/ThemeToggle";


export default function test(){

    return(
        <FullscreenToggle className="dark:bg-neutral-700 w-full">
            <div className="md:ml-[80px]">
                <section className="container mx-auto px-8 pt-10 dark:bg-neutral-700 dark:text-white space-y-4">
                    <h1 className="text-2xl font-bold inline-block">
                        Fixed Point Method
                    </h1>
                    <div className="switch float-right inline-block fixed">
                        <ThemeToggle />
                    </div>
                    <p className="text-base pl-1">
                        The Fixed Point Method is a numerical technique used to find approximate solutions to equations of the form 
                        <InlineMath math="x = g(x) " />. It iteratively refines an initial guess until convergence is achieved.
                    </p>
                    <br />
                    <p className="text-xl">Given a function:</p>
                    <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                        <BlockMath math={" f(x) = 0 "} />
                        <BlockMath math={ "x = g(x)" } />
                    </div>

                    <div className="mb-4 space-y-4 sm:text-2xl">
                        <h2 className="text-xl font-semibold mt-6">
                            How the Fixed Point Method Works
                        </h2>
                        <ol className="list-decimal list-inside mb-4 space-y-4 ml-5 sm:text-xl">
                            <li>
                                <strong>Rearrangement:</strong> Rearrange the equation to the form <InlineMath math={ "x = g(x)" } />.
                            </li>
                            <li>
                                <strong>Initial Guess:</strong> Choose an initial approximation <InlineMath math={ "x_0" } />.
                            </li>
                            <li>
                                <strong>Iteration:</strong> Use the function to compute:
                                <BlockMath math={ "x_{n+1} = g(x_n)" } />
                                Repeat until convergence.
                            </li>
                            <li>
                                <strong>Convergence Check:</strong> Stop when <InlineMath math={ "|x_{n+1} - x_n| < \epsilon" } />.
                            </li>
                        </ol>
                    </div>

                    <div className="space-y-4 text-lg">
                        <h2 className="text-xl font-semibold mt-6">Example</h2>
                        <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
                            <p className="ml-5">Given Function:</p>
                            <BlockMath math=" x^2 - 4" />
                            <h2 className="ml-5">Error Margin is 0.01</h2>
                        </div>
                        <h3 className="my-4 font-semibold">Step 1: Initial Guess:</h3>
                        <BlockMath math=" x_0 = 1 "/>


                        <h3 className="mt-4 font-semibold">Step 2: Rearranged Function:</h3>
                        <BlockMath math=" x_0 = 1 \\\\ \text{to} 
                        \\\\
                        g(x_0) = \sqrt{4} = 2"  />
                        

                        <h3 className="mt-4 font-semibold">Step 3: First Iteration:</h3>
                        <BlockMath math="x_1 = g(x_0) = \sqrt{4} = 2"  />
                        <BlockMath math="|x_1 - x_0| = |2 - 1| = 1 " />
                        <InlineMath math="\text{Since} \ |x_1 - x_0| > 0.01, \text{ continue iterating.}" />

                        <h3 className="mt-4 font-semibold">Step 4: Second Iteration:</h3>
                        <BlockMath math=" x_2 = g(x_1) = \sqrt{4} = 2"  />
                        <BlockMath math=" |x_2 - x_1| = |2 - 2| = 0 " />
                        <InlineMath math="\text{Since} \ |x_2 - x_1| < 0.01, \text{ we have converged.}" />

                        <h3 className="mt-4 font-semibold">Result:</h3>
                        <BlockMath math=" x \approx 2 " />
                    </div>

                    <div className="space-y-5 pb-8">
                        <h2 className="text-xl mt-6 font-semibold">Conclusion</h2>
                        <p>
                            The Fixed Point Method is an effective approach for solving equations of the form <InlineMath math="f(x) = 0"  />. 
                            In this example, we showed that the solution converges to <InlineMath math={" x = 2" } />. The method guarantees convergence 
                            under suitable conditions on the function <InlineMath math={ "g(x)" } />.
                        </p>
                    </div>
                </section>
                <section className=" container mx-auto ">
                <FixedPointMethod/>
                </section>
            </div>
        </FullscreenToggle>
 
    );
}