"use client";
import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import FullscreenToggle from "@/app/components/FullscreanToggle";
import ThemeToggle from "@/app/components/ThemeToggle";
import BisectionMethod from "./algorithems.bisection-method";

export default function BisectionMethods() {
  return (
    
      <FullscreenToggle className="dark:bg-neutral-700 w-full">
        <div className="md:ml-[80px]">
          <section className="container mx-auto px-8 pt-10 dark:bg-neutral-700 dark:text-white space-y-4">
            <h1 className="text-2xl font-bold  inline-block">
              Bisection Method
            </h1>
            <div className="switch float-right inline-block fixed">
              <ThemeToggle />
            </div>
            <p className="text-base pl-1">
              The bisection method is a straightforward and reliable numerical technique used to find roots (solutions) of continuous functions. It works by repeatedly dividing an interval in half and selecting the subinterval where the function changes sign, thereby narrowing  down the location of the root.
            </p>
            <br />
            <p className="text-xl">Given a function:</p>
            <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md step-intro-2 ">
              
              <BlockMath math={`f(x) = 0`}/>
            </div>

            
            
            <div className=" mb-4 space-y-4  sm:text-2xl">
            <h2 className="text-xl font-semibold mt-6">
              How the Bisection Method Works
            </h2>
              <ol className="list-decimal list-inside mb-4 space-y-4 ml-5 sm:text-xl">
                <li>
                  <strong>Select Interval:</strong> Choose two points{" "}
                  <InlineMath math={`a`}/> and{" "}
                  <InlineMath math={`b`}/> such that{" "}
                  <InlineMath math={`f(a)`}/> and{" "}
                  <InlineMath math={`f(b)`}/> have opposite signs.
                </li>
                <li>
                  <strong>Midpoint Calculation:</strong> Compute the midpoint{" "}
                  <InlineMath math="C= \frac{a + b}{2} " />.
                </li>
                <li>
                  <strong>Evaluate:</strong> Check the sign of{" "}
                  <InlineMath math={`f(c)`}/>.
                </li>
                <li>
                  <strong>Update Interval:</strong> If{" "}
                  <InlineMath math={`f(c)`}/> is close enough to zero,{" "}
                  <InlineMath math={`c`}/> is the root. Otherwise, update
                  the interval.
                </li>
              </ol>
            </div>

            <div className="space-y-4 step-intro-4 text-lg">
              <h2 className="text-xl font-semibold mt-6 ">Example</h2>
              <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md step-intro-2 ">
              <p className="ml-5 ">Given Function</p>
              <BlockMath>
                {` x^2 = 4` }
              </BlockMath>
              <h2 className="ml-5">Error Margin is 0.01</h2>
              </div>
              <h3 className="my-4 font-semibold"> Step 1 : Rearranging the Equation:</h3>
              
                  <BlockMath math={"f(x) = x^2 - 4 = 0"} />
                
              <h3 className="mt-4 font-semibold">Step 2 : Choose Initial Points</h3>
              <div className="ml-5 space-y-5">
                <p>To apply the Bisection Method, we first need to choose two initial points <InlineMath math="a"/> and <InlineMath math="b"/> such that:</p>
                
                <BlockMath math="f(a) \text{ and } f(b) \text{ have opposite signs.}"/>

                <p>lets&apos;s choose <InlineMath math="a = 0 \text{ and } b = 3"/></p>

                <BlockMath math="f(0) = 0^2 - 4 = -4 \text{ (negative)}"/>

                <BlockMath math="f(3) = 3^2 - 4 = 5\text{ (positive)}"/>

                <p>Since <InlineMath math="f(0) < 0 \text{ and } f(3) > 0 , "/> we can proceed. </p>
              </div>


              <h3 className="mt-4 font-semibold">Step 3 : Calculate Midpoint</h3>
              <div className="ml-5">
                <p>Next, we calculate the midpoint <InlineMath math={`C`}/> of the interval [ a , b ] :</p>   

                <BlockMath math=" C = \frac{ a + b }{2} = \frac{ 0 + 3 }{2} = 1.5"/>             
              </div>
             
              <h3 className="mt-4 font-semibold">Step 4 : Update the Interval</h3>
              <div className="ml-5 space-y-4">
              <p>Since <InlineMath math="f(a) < 0 \text{ and } f(C) < 0 ,"/> we know that the root must lie in the interval [ C , b ] : </p>   

                <BlockMath math="\text{Set } a = C = 1.5"/>             
              </div>

              <h3 className="mt-4 font-semibold">Step 5 : Repeat the Process</h3>
              <div className="ml-5 space-y-4">
                
                <p>We repeat the steps:</p>
                <ol className="list-inside  list-decimal ml-5 space-y-5">
                  <li className="font-semibold">
                    Calculate new midpoint:
                  <BlockMath math="C = \frac{1.5 + 3 }{2} = 2.25"/>  
                  </li>  
                  <li className="font-semibold">
                  Evaluate function:  
                  <BlockMath math="f(2.25) = (2.25)^2 -  4 = 5.0625 - 4 = 1.0625"/>  
                  </li>  
                  <li className="font-semibold">
                  Update interval:
                  <div>
                    <p> Since <InlineMath math="f(1.5) < 0 \text{ and } f(2.25) > 0 "/> set <InlineMath math=" b = C = 2.25"/></p>
                  </div>
                  </li>  
                
                </ol>          
              </div>

              <h3 className="mt-4 font-semibold">Step 6 : Continuing the Process</h3>
              <div className="ml-5 space-y-4">
                
                <p>Continuing this process, we narrow down the interval:</p>
                <ol className="list-inside  list-decimal ml-5 space-y-5">
                  <li className="font-semibold">
                    Calculate new midpoint:
                  <BlockMath math="C = \frac{1.5 + 2.25 }{2} = 1.875"/>  
                  </li>  
                  <li className="font-semibold">
                  Evaluate function:  
                  <BlockMath math="f(1.875) = (1.875)^2 -  4 = 3.515625 - 4 = −0.484375"/>  
                  </li>  
                  <li className="font-semibold">
                  Update interval:
                  <div>
                    <p> Since <InlineMath math="f(1.875) < 0 \text{ and } f(2.25) > 0 ,"/> set <InlineMath math=" a = 2.25"/></p>
                  </div>
                  </li>  
                
                </ol></div><div className="ml-2 space-y-4">
                <h3 className="mt-4 font-semibold">Continue until Desired Accuracy</h3>
                <p>Continue this process until the difference between 𝑎 and 𝑏 is less than a desired tolerance (for example,0.01).</p>
                <p>Eventually, you will converge on the root:</p>
                 <BlockMath math="\sqrt{4} = 2"/>
                 </div>
             
             
            <div className="space-y-5 pb-8">
              <h2 className="text-xl  mt-6 font-semibold">Conclusion</h2>
              <p>
              The Bisection Method is an efficient way to find the root of a function defined by a continuous equation. In this case, we demonstrated it for <InlineMath math={` x^2 = 4  `}/>&nbsp;
              and found that the root is <InlineMath math={` x = 2 `}/>&nbsp;
              The method guarantees convergence as long as you start with points that bracket the root, making it a reliable technique for root-finding problems.
              </p>
            </div></div>
          </section>
          <section className=" container mx-auto ">
          <BisectionMethod />
        </section>
        </div>
        
      </FullscreenToggle>
    
  );
}
