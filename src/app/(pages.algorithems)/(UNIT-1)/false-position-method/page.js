"use client";
import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import FullscreenToggle from "@/app/components/FullscreanToggle";
import FalsePositionMethod from "./algorithems.false-positions-method";
import ThemeToggle from "@/app/components/ThemeToggle";




export default function FalsePositionMethods() {

    return (
        <FullscreenToggle className="dark:bg-neutral-700 w-full">
            <div className="md:ml-[80px]">
                <section className="container mx-auto px-8 pt-10 dark:bg-neutral-700 dark:text-white space-y-4">
                    <h1 className="text-2xl font-bold  inline-block">
                        False Position Method
                    </h1>
                    <div className="switch float-right inline-block fixed">
                        <ThemeToggle />
                    </div>
                    <p className="text-base pl-1">
                        The False Position Method, also known as the Regula Falsi Method, is a numerical technique used to find approximate roots of a real-valued continuous function. It is a bracketing method, meaning it starts with two initial points that bracket a root (i.e., the function changes sign between them) and iteratively refines this interval to approach the root. </p>
                    <br />
                    <p className="text-xl">Given a function:</p>
                    <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md step-intro-2 ">

                        <BlockMath math={`f(x) = 0`} />

                        <BlockMath math="C =  \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)} " />
                    </div>



                    <div className=" mb-4 space-y-4  sm:text-2xl">
                        <h2 className="text-xl font-semibold mt-6">
                            How the False Position Method Works
                        </h2>
                        <ol className="list-decimal list-inside mb-4 space-y-4 ml-5 sm:text-xl">
                            <li>
                                <strong>Root of a Function:</strong> A value  <InlineMath math={` C `} /> such that
                                <InlineMath math={` f(C) = 0`} /> .
                            </li>
                            <li>
                                <strong>Initial Bracketing:</strong>  Choose two initial points 𝑎 and 𝑏 such that
                                <InlineMath math=" f(a) . f(b) < 0 " />. This ensures that there is at least one root between 𝑎 and 𝑏.
                            </li>
                            <li>
                                <strong>Calculate the False Position (Regula Falsi) Point:</strong>
                                <p>The next approximation <InlineMath math={` C `} /> is found using the formula:</p>
                                <BlockMath math="C =  \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)} " />
                                <p>This formula derives from the equation of the straight line (secant line) connecting <InlineMath math=" (a , f(a) ) \text{ and } ( b , f(b) )" /> and finding its intersection with the x-axis.</p>
                            </li>
                            <li>
                                <strong>Evaluate  <InlineMath math={`f(C)`} />:</strong>
                                <ul className="ml-3 list-inside list-disc">
                                    <li> If  <InlineMath math={` f(C) = 0  ,  C`} /> is the root. </li>
                                    <li> If  <InlineMath math={` f(a) . f(b) < 0  ,`} />  the root lies between 𝑎 and <InlineMath math={` C `} />. Set 𝑏 = <InlineMath math={` C `} />. </li>
                                    <li> If  <InlineMath math={` f(C) . f(b) < 0  ,`} />  the root lies between <InlineMath math={` C `} /> and 𝑏. Set 𝑎 = <InlineMath math={` C `} />. </li>
                                </ul>
                            </li>
                            <li>
                                <strong>Iterate:</strong>
                                <p> Repeat steps 2 and 3 until the approximate root <InlineMath math={` C `} /> converges to a desired level of accuracy.</p>

                            </li>
                        </ol>
                    </div>

                    <div className="space-y-4 step-intro-4 text-lg">
                        <h2 className="text-xl font-semibold mt-6 ">Example</h2>
                        <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md step-intro-2 ">
                            <p className="ml-5 ">Given Function</p>
                            <BlockMath>
                                {` x^2 = 4`}
                            </BlockMath>
                            <h2 className="ml-5">Error Margin is 0.01</h2>
                        </div>
                        <h3 className="my-4 font-semibold">Step 1: Initial Bracketing:</h3>
                        <BlockMath math="\text{Choose} \; a = 1, f(a) = 1^2 - 4 = -3" />
                        <BlockMath math="\text{Choose} \; b = 3, f(b) = 3^2 - 4 = 5" />
                        <InlineMath math="\text{Since} \ f(a) \cdot f(b) = -3 \cdot 5 < 0, \; a \text{ and } b \text{ bracket the root.}" />

                        <h3 className="mt-4 font-semibold">Step 2: Calculate C:</h3>
                        <BlockMath math="C = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)}" />
                        <BlockMath math="C = \frac{1 \cdot 5 - 3 \cdot (-3)}{5 - (-3)} = \frac{5 + 9}{8} = \frac{14}{8} = 1.75" />
                        <BlockMath math="f(C) = f(1.75) = (1.75)^2 - 4 = 3.0625 - 4 = -0.9375" />
                        <InlineMath math="\text{Since} \; f(a) \cdot f(C) = -3 \cdot (-0.9375) > 0, \; \text{set } a = 1.75." />

                        <h3 className="mt-4 font-semibold">Step 3: Second Iteration:</h3>
                        <BlockMath math="C = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)} \approx \frac{1.75 \cdot 5 - 3 \cdot (-0.9375)}{5 - (-0.9375)} \approx 1.9474" />
                        <BlockMath math="f(1.9474) \approx (1.9474)^2 - 4 \approx 3.7925 - 4 = -0.2075" />
                        <InlineMath math="\text{Since} \; f(a) \cdot f(C) \approx -0.9375 \cdot (-0.2075) > 0, \; \text{set } a = 1.9474." />

                        <h3 className="mt-4 font-semibold">Step 4: Third Iteration:</h3>
                        <BlockMath math="C = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)} \approx 1.988" />
                        <BlockMath math="f(1.988) \approx (1.988)^2 - 4 \approx 3.952 - 4 = -0.048" />
                        <InlineMath math="\text{Since} \; f(a) \cdot f(C) \approx -0.2075 \cdot (-0.048) > 0, \; \text{set } a = 1.988." />

                        <h3 className="mt-4 font-semibold">Continue Iterating:</h3>
                        <p>Repeating this process will yield increasingly accurate approximations of the root.</p>
                        <BlockMath math="x \approx 2" />

                        <div className="space-y-5 pb-8">
        <h2 className="text-xl mt-6 font-semibold">Conclusion</h2>
        <p>
          The False Position Method is an efficient way to find the root of a function defined by a continuous equation. 
          In this case, we demonstrated it for <InlineMath math={` f(x) = x^2 - 4`} /> and found that the root is 
          <InlineMath math={` x = 2 `} />. The method guarantees convergence as long as you start with points that bracket the root, 
          making it a reliable technique for root-finding problems.
        </p>
      </div></div>
                </section>
                <section className=" container mx-auto ">
                    <FalsePositionMethod />
                </section>
            </div>

        </FullscreenToggle>
    );
}