'use client';
import { useState,useEffect ,Suspense} from 'react';
import React from 'react';
import { BlockMath ,InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import FullscreenToggle from '@/app/components/FullscreanToggle';
import ThemeToggle from '@/app/components/ThemeToggle';
import GaussSeidel from './algorithems.gauss-seidale-method';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const Joyride = dynamic(
  () => import('react-joyride'),
  { ssr: false }
)
import { STATUS } from 'react-joyride';

const GaussSeidelPage = () => {
  const searchParams = useSearchParams();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Clear the specific localStorage item on reload
    localStorage.removeItem('gaussSeidelTourCompleted');
  }, []);
  useEffect(() => {
    const tourParam = searchParams.get('tour');
    if (tourParam === 'true') {
      setRunTour(true);
    }
  }, [searchParams]);

  const steps = [
    {
      target: '.step-intro-1 ',
      content: 'Start by exploring the topic at hand. Understand its significance and applications in real-world scenarios, providing a foundation for deeper learning.',
      placement: 'bottom',
    },
    {
      target: '.step-intro-2 ',
      content: 'Familiarize yourself with the key formulas associated with the topic. This knowledge is crucial for grasping the underlying concepts and for practical applications.',
      placement: 'left',
    },
    {
      target: '.step-intro-3 ',
      content: 'Learn the systematic approach to solving problems related to the topic. Breaking down the procedure into clear steps will enhance your problem-solving skills.',
      placement: 'top',
    },
    {
      target: '.step-intro-4 ',
      content: 'Review example problems that demonstrate the concepts in action. Analyzing these examples will help you understand the application of theories in practical situations.',
      placement: 'top',
    },
    {
      target: '.step-intro-5 ',
      content: 'Finally, put your knowledge to the test with an algorithm calculator. This interactive tool allows you to experiment with different scenarios and solidify your understanding of the topic.',
      placement: 'top',
    },
    // Add more steps as needed
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      // Optional: Persist tour completion to prevent re-running
      if (typeof window !== 'undefined') {
        localStorage.setItem('gaussSeidelTourCompleted', 'true');
      }
    }
  };

  useEffect(() => {
    // Optional: Check if tour has been completed before
    if (runTour) {
      const hasCompletedTour = localStorage.getItem('gaussSeidelTourCompleted');
      if (hasCompletedTour === 'true') {
        setRunTour(false);
      }
    }
  }, [runTour]);
    return (<>
      <Suspense fallback={<div>Loading Tour...</div>}>
     <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        showSkipButton
        showProgress
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#FF5733', // Customize as needed
            textColor: '#333',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
          },
          buttonNext: {
            backgroundColor: '#FF5733',
          },
          buttonBack: {
            color: '#FF5733',
          },
        }}
        callback={handleJoyrideCallback}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip',
        }}
      /></Suspense>
      <FullscreenToggle className="dark:bg-neutral-700 w-full">
        
       
      <div className="md:ml-[80px]">
          <section className="container mx-auto px-8 pt-10 dark:bg-neutral-700 dark:text-white space-y-4">
            <h1 className="text-2xl font-bold pb-5 inline-block">Gauss-Seidel Method</h1>
            <div className="switch float-right inline-block fixed">
              <ThemeToggle />
            </div>
            <p className="text-base pl-1 step-intro-1">
              The Gauss-Seidel method is an iterative technique used to solve a system of linear equations.
              It&apos;s particularly useful for large systems where direct methods may be computationally expensive.
              The method uses the most recent values of the variables as soon as they are available,
              allowing for potentially faster convergence.
            </p>
            <br />
  
            <h2 className="text-xl font-semibold mt-6">General Formulation</h2>
            <p className="text-xl">Given a system of linear equations:</p>
            <div className="bg-gray-100 p-4 border dark:bg-neutral-800 overflow-auto border-gray-300 rounded-lg shadow-md step-intro-2 ">
              <BlockMath>
                {`\\begin{cases} 
                  a_1x_1 + b_1y_1 + c_1z_1 = i \\\\
                  a_2x_2 + b_2y_2 + c_2z_2 = j \\\\
                  a_3x_3 + b_3y_3 + c_3z_3 = k 
                \\end{cases}`}
              </BlockMath>
            </div>
  
            <h2 className="text-xl font-semibold mt-6 my-4">Steps of the Gauss-Seidel Method</h2>
            <ol className="list-decimal list-inside mb-4 space-y-4 step-intro-3">
              <li>
                <strong>Rearrange the Equations:</strong> Solve each equation for one variable in terms of the others.
              </li>
              <li>
                <strong>Initial Guess:</strong> Start with an initial guess for the values of the variables{' '}
                <InlineMath>{`( x_1, y_1, z_1 )`}</InlineMath>
              </li>
              <li>
                <strong>Iterate:</strong> Substitute the known values into the rearranged equations to update the values of the variables.
              </li>
              <li>
                <strong>Convergence Check:</strong> Repeat the iteration until the values converge.
              </li>
            </ol>
  
            <div className="space-y-4 step-intro-4">
              <h2 className="text-xl font-semibold mt-6 ">Example</h2>
              <p>Consider the following system of equations:</p>
              <BlockMath>
                {`\\begin{cases} 
                  4x + y + z = 12 \\\\
                  x + 5y + 2z = 27 \\\\
                  2x + y + 6z = 18 
                \\end{cases}`}
              </BlockMath>
              <h2 className="ml-5 text-lg">Error Margin is 0.1</h2>
  
              <h3 className="mt-4">1. Rearranging the Equations:</h3>
              <ul className="list-none list-inside">
                <li>
                  <BlockMath math={"x = \\frac{12 - y - z}{4}"}/>
                </li>
                <li>
                <BlockMath math={"y = \\frac{27 - x - 2z}{5}"}/>
                 
                </li>
                <li>
                <BlockMath math={"z = \\frac{18 - 2x - y}{6}"}/>
                  
                </li>
              </ul>
  
              <h3 className="mt-4">2. Initial Guess:</h3>
              <div className="ml-5">
                <p>Start with</p>
                <BlockMath>{`( x_0 = 0, y_0 = 0, z_0 = 0 )`}</BlockMath>
              </div>
  
              <h3 className="mt-4 font-bold text-2xl">Iterations:</h3>
              {/* First Iteration */}
              <h3 className="mt-4">First Iteration:</h3>
              <ul className="list-none list-inside">
                <li>
                  Calculate <InlineMath>{`x_1`}</InlineMath>:
                  <BlockMath math={"x_1 = \\frac{12 - 0 - 0}{4} = 3"}/>
                
                </li>
                <li>
                  Calculate <InlineMath>{`y_1`}</InlineMath>:
                  <BlockMath math={"y_1 = \\frac{27 - 3 - 0}{5} = 4.8"}/>
               
                </li>
                <li>
                  Calculate <InlineMath>{`z_1`}</InlineMath>:
                  <BlockMath math={"z_1 = \\frac{18 - 2(3) - 4.8}{6} = 1.2"}/>
                
                </li>
              </ul>
  
              {/* Second Iteration */}
              <h3 className="mt-4 ">Second Iteration:</h3>
              <ul className="list-none list-inside">
                <li>
                  Calculate <InlineMath>{`x_2`}</InlineMath>:
                  <BlockMath math={"x_2 = \\frac{12 - 4.8 -1.2 }{4} \\approx 1.5"}/>
                  
                </li>
                <li>
                  Calculate <InlineMath>{`y_2`}</InlineMath>:
                  <BlockMath math={"y_2 = \\frac{27 - 1.5 - 2(1.2)}{5} \\approx 4.62"}/>
                  
                </li>
                <li>
                  Calculate <InlineMath>{`z_2`}</InlineMath>:
                  <BlockMath math={"z_2 = \\frac{18 − 2(1.5) − 4.62}{6} \\approx 1.73"}/>
                  
                </li>
              </ul>
  
              {/* Third Iteration */}
              <h3 className="mt-4">Third Iteration:</h3>
              <ul className="list-none list-inside">
                <li>
                  Calculate <InlineMath>{`x_3`}</InlineMath>:
                  <BlockMath math={"x_3 = \\frac{12 - 4.62 - 1.73}{4} \\approx 1.41"}/>
                </li>
                <li>
                  Calculate <InlineMath>{`y_3`}</InlineMath>:
                  <BlockMath math={"y_3 = \\frac{27 - 1.41 - 2(1.73)}{5} \\approx 4.43"}/>
                </li>
                <li>
                  Calculate <InlineMath>{`z_3`}</InlineMath>:
                  <BlockMath math={"z_3 = \\frac{18 - 2(1.41) - 4.43}{6} \\approx 1.79"}/>
                </li>
              </ul>
  
              {/* Fourth Iteration */}
              <h3 className="mt-4">Fourth Iteration:</h3>
              <ul className="list-none list-inside">
                <li>
                  Calculate <InlineMath>{`x_4`}</InlineMath>:
                  <BlockMath math={"x_4 = \\frac{12 - 4.43 - 1.79}{4} \\approx 1.445"}/>
                </li>
                <li>
                  Calculate <InlineMath>{`y_4`}</InlineMath>:
                  <BlockMath math={"y_4 = \\frac{27 - 1.445 - 2(1.79)}{5} \\approx 4.395"}/>
                </li>
                <li>
                  Calculate <InlineMath>{`z_4`}</InlineMath>:
                  
                  <BlockMath math="z_4 = \frac{18 - 2(1.445) - 4.395}{6} \approx 1.785"/>
                </li>
              </ul>
            </div>
  
            <div className="space-y-5 pb-8">
              <h2 className="text-xl font-semibold mt-6">Conclusion</h2>
              <p>
                The Gauss-Seidel method is simple to implement and can be very effective for certain types of systems.
                Its performance depends on the properties of the coefficient matrix; specifically, it works best when the matrix is diagonally dominant.
              </p>
            </div>
          </section>
        </div>
        <section className='md:ml-[80px] step-intro-5 '>
          <GaussSeidel />
        </section>
      </FullscreenToggle></>
    );
  };
  
  export default GaussSeidelPage;