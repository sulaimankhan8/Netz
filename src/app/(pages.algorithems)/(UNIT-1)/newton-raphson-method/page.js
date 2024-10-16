"use client";
import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import NewtonRaphsonMethod from "./aldorithems.newton-raphson";
import FullscreenToggle from "@/app/components/FullscreanToggle";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function NewtonRaphsonMethods() {
  return (
    <FullscreenToggle className="dark:bg-neutral-700 w-full">
      <div className="md:ml-[80px]">
        <section className="container mx-auto px-8 pt-10 dark:bg-neutral-700 dark:text-white space-y-5">
         <div className="space-y-4">
          <h1 className="text-2xl font-bold inline-block">Newton-Raphson Method</h1>
          <div className="switch float-right inline-block fixed">
            <ThemeToggle />
          </div>
          <p className="text-base pl-1 ">
            The Newton-Raphson method is a powerful numerical technique for
            finding the roots of a real-valued function. It is based on
            iteratively refining guesses for the root by using the function's
            derivative.
          </p>
          <br />
          <p className="text-xl">Given a function:</p>
          <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
            <BlockMath math={`f(x) = 0`} />
            <BlockMath math={`x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`} />
          </div>
          <div className="text-lg  ml-5  space-y-4">
          Where :
          <ul className="text-lg list-item list-disc ml-5">
            <li><InlineMath math="x_n"/> is the current guess.</li>
            <li><InlineMath math="f(x_n)"/> is the value of the function at <InlineMath math="x_n"/>.</li>
            <li><InlineMath math="f'(x_n)"/> is the derivative of the function at <InlineMath math="x_n"/>.</li>
           </ul>
          </div>
         
          </div>

          <div className="mb-4 space-y-4 sm:text-2xl">
            <h2 className="text-xl font-semibold mt-6">
              How the Newton-Raphson Method Works
            </h2>
            <ol className="list-decimal list-inside mb-4 space-y-4 ml-5 sm:text-xl">
              <li>
                <strong>Initial Guess:</strong> Start with an initial guess{" "}
                <InlineMath math={`x_0`} />.
              </li>
              <li>
                <strong>Iterative Formula:</strong> Compute the next
                approximation using:
                <BlockMath math={`x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`} />
              </li>
              <li>
                <strong>Repeat:</strong> Continue iterating until the result
                converges to a desired accuracy.
              </li>
            </ol>
          </div>

          <div className="space-y-4 text-lg">
            <h2 className="text-xl font-semibold mt-6">Example</h2>
            <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md">
              <p>Find the square root :</p>
              <BlockMath math={`f(x) = x^2 - 2`} />
              <p>Initial guess: <InlineMath math={`x_0 = 1`} /></p>
            </div>
            <div className="text-lg  ml-5  space-y-4">
          <p>Let's solve <InlineMath math=" f(x) = x^2 - 2 = 0 "/> using the Newton-Raphson method, which seeks to find the square.</p>
          <ol className="text-lg list-item list-decimal ml-5">
            <li> Function: <InlineMath math=" f(x) = x^2 - 2 "/> </li>
            <li> Derivative: <InlineMath math=" f'(x) = 2x "/> </li>
            <li> Initial guess: <InlineMath math=" x_0 = 1 "/></li>
           </ol>
          </div>
            <h3 className="my-4 font-semibold"> First Iteration</h3>
            <BlockMath math={`x_1 = x_0 - \\frac{(1^2 - 2)}{2 \\cdot 1} = 1.5`} />

            <h3 className="mt-4 font-semibold"> Second Iteration</h3>
            <BlockMath math={`x_2 = 1.5 - \\frac{(1.5^2 - 2)}{2 \\cdot 1.5} = 1.4167`} />

            <h3 className="mt-4 font-semibold"> Third Iteration</h3>
            <BlockMath math={`x_3 = 1.4167 - \\frac{(1.4167^2 - 2)}{2 \\cdot 1.4167} = 1.4142`} />

            <p>After three iterations, the approximate root is <InlineMath math={`x \\approx 1.4142`} />, which is close to <InlineMath math={`\\sqrt{2}`} />.</p>
          </div>

          <div className="space-y-5 pb-8">
            <h2 className="text-xl mt-6 font-semibold">Conclusion</h2>
            <p>
              The Newton-Raphson Method is an efficient way to find the roots of
              a function, especially when the function is smooth and its
              derivative is known.
            </p>
          </div>
        </section>
        <section className=" container mx-auto ">
                    <NewtonRaphsonMethod />
                </section>
      </div>
    </FullscreenToggle>
  );
}
