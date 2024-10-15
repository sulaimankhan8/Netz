
'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import TButton from '../../../components/TButton'; // Adjust the path based on your project structure
import Plot from './Plot'; // Chart.js based Plot component
import ExportToPNG from '../../../utils/ExportToPNG'; // Adjust the path based on your project structure

const FixedPointMethod = () => {
  const [functionInput, setFunctionInput] = useState("cos(x)"); // Default function
  const [initialGuess, setInitialGuess] = useState(''); // Initial guess as string to allow empty
  const [tolerance, setTolerance] = useState(0.00001);
  const [result, setResult] = useState(null);
  const [iterationSteps, setIterationSteps] = useState([]);
  const [error, setError] = useState('');
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [intervalFound, setIntervalFound] = useState(null); // To store detected interval

  // Handle input changes
  const handleFunctionChange = (e) => {
    setFunctionInput(e.target.value);
  };

  const handleInitialGuessChange = (e) => {
    setInitialGuess(e.target.value); // Keep as string to allow empty
  };

  const handleToleranceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setTolerance(0.00001);
    } else {
      setTolerance(value);
    }
  };

  const functionMapping = {
    'sin': 'Math.sin',
    'cos': 'Math.cos',
    'tan': 'Math.tan',
    'sec': '1/Math.cos',
    'cot': '1/Math.tan',
    'cosec': '1/Math.sin'
  };
  
  // Function to replace simple function names with full JavaScript syntax
  const replaceFunctions = (input) => {
    return input.replace(/(\w+)\(/g, (match, p1) => {
      return functionMapping[p1] ? `${functionMapping[p1]}(` : match;
    });
  };
  // Function to find intervals where g(x) - x changes sign
  const findIntervals = (g, min = -100, max = 100, step = 1) => {
    const intervals = [];
    let a = min;
    let fa = g(a) - a;

    for (let x = a + step; x <= max; x += step) {
      let fx = g(x) - x;
      if (isNaN(fx)) {
        // Skip if g(x) is not defined
        a = x;
        fa = fx;
        continue;
      }
      if (fa * fx < 0) {
        intervals.push([a, x]);
      }
      a = x;
      fa = fx;
    }

    return intervals;
  };

  // Fixed-Point Iteration Implementation
  const fixedPointIteration = (g, x0, tol = 0.00001, maxIter = 100) => {
    let iterations = [];
    let x = x0;
    let xNext;
    try {
      xNext = g(x);
    } catch (err) {
      return {
        root: null,
        iterations: 0,
        steps: [],
        converged: false,
        error: `Error evaluating function at x = ${x}: ${err.message}`
      };
    }
    let iter = 1;
    let difference = Math.abs(xNext - x);

    iterations.push({ iter: iter, x_n: x, x_next: xNext, difference: difference });

    while (difference > tol && iter < maxIter) {
      x = xNext;
      try {
        xNext = g(x);
      } catch (err) {
        return {
          root: null,
          iterations: iter,
          steps: iterations,
          converged: false,
          error: `Error evaluating function at x = ${x}: ${err.message}`
        };
      }
      iter++;
      difference = Math.abs(xNext - x);
      iterations.push({ iter: iter, x_n: x, x_next: xNext, difference: difference });
    }

    return {
      root: (difference <= tol) ? xNext : null,
      iterations: iter,
      steps: iterations,
      converged: difference <= tol,
      error: difference <= tol ? null : `Did not converge within ${maxIter} iterations.`
    };
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIterationSteps([]);
    setIntervalFound(null);

    // Convert user input to a function
    let g;
    try {
      const updatedFunctionInput = replaceFunctions(functionInput.trim());
      g = new Function('x', `return ${updatedFunctionInput};`);
      // Test the function with a sample input to catch errors
      g(0);
    } catch (err) {
      setError("Invalid function input. Please ensure the function is valid and uses JavaScript syntax.");
      return;
    }

    let x0;
    if (initialGuess.trim() !== '') {
      // User provided an initial guess
      x0 = parseFloat(initialGuess);
      if (isNaN(x0)) {
        setError("Initial guess must be a valid number.");
        return;
      }
    } else {
      // User did not provide an initial guess, find intervals
      const intervals = findIntervals(g);
      if (intervals.length === 0) {
        setError("Could not find an interval where g(x) - x changes sign. Please provide an initial guess.");
        return;
      }
      // For simplicity, take the first interval and use the midpoint as x0
      const [a, b] = intervals[0];
      setIntervalFound([a, b]);
      x0 = (a + b) / 2;
    }

    // Perform fixed-point iteration
    const iterationResult = fixedPointIteration(g, x0, tolerance, 100); // maxIter is set to 100

    if (iterationResult.error) {
      setError(iterationResult.error);
    } else if (iterationResult.converged) {
      setResult(`Converged to root: ${iterationResult.root.toFixed(10)} in ${iterationResult.iterations} iterations.`);
    } else {
      setResult(`Did not converge within 100 iterations. Last approximation: ${iterationResult.steps[iterationResult.steps.length - 1].x_next.toFixed(10)}`);
    }

    setIterationSteps(iterationResult.steps);
    console.log(g);
    
  };

  // Handle Demo button click
  const handleDemo = async () => {
    setDemoInProgress(true);
    setFunctionInput("cos(x)");
    setInitialGuess('');
    setTolerance(0.00001);
    setMaxIterations(100);

    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Trigger calculation
    document.getElementById("Calculate").click();

    setDemoInProgress(false);
  };

  // Handle Reset button click
  const handleReset = () => {
    setFunctionInput("");
    setInitialGuess('');
    setTolerance(0.0001);
    setResult(null);
    setIterationSteps([]);
    setError('');
    setIntervalFound(null);
  };

  return (
    <div className="w-full mx-auto p-4 text-black bg-white dark:text-white dark:bg-neutral-700">
      <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">Fixed-Point (Iteration) Method Solver</h1>

        <div className="flex space-x-2">
          <TButton
            tooltipText="Demo"
            onClick={handleDemo}
            className={`bg-purple-700 ${demoInProgress ? "opacity-50 cursor-not-allowed" : ""} hover:bg-purple-400`}
            color="violet"
            altText="Demo"
            disabled={demoInProgress}
          />
         
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="function">Enter Function <InlineMath math=" g(x)"/> :</label>
          <input
            type="text"
            id="function"
            value={functionInput}
            onChange={handleFunctionChange}
            placeholder="e.g., cos(x)"
            required
            className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="initial-guess">Initial Guess <InlineMath math=" (x_0)"/>:</label>
          <input
            type="text" // Changed to text to allow empty input
            id="initial-guess"
            value={initialGuess}
            onChange={handleInitialGuessChange}
            placeholder="Optional: e.g., 1"
            className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tolerance">Error Margin :</label>
          <input
            type="number"
            id="tolerance"
            step="any"
            value={tolerance}
            onChange={handleToleranceChange}
            placeholder="e.g., 0.00001"
            required
            className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            id="Calculate"
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 active:bg-opacity-80 text-white px-4 py-2 rounded hover:bg-green-400 bg-green-500 active:bg-green-700 focus:ring-green-700"
          >
            Calculate
          </button>
          <TButton
            tooltipText="Reset"
            onClick={handleReset}
            imgSrc="/reset.svg" // Ensure this image exists in your public folder
            altText="Reset"
            className="float-right"
            color="red"
          />
        </div>
      </form>

      {intervalFound && (
        <div className="my-4 p-4 bg-yellow-100 text-yellow-700 dark:bg-neutral-600 dark:text-gray-200 rounded">
          <strong>Detected Interval:</strong> [ {intervalFound[0].toFixed(4)} , {intervalFound[1].toFixed(4)} ]
        </div>
      )}

      {result && (
        <div className="my-4 p-4 bg-green-100 text-green-700 dark:bg-neutral-600 dark:text-neutral-200 rounded">
          <strong>Result:</strong> {result}
        </div>
      )}

      {iterationSteps.length > 0 && (
        <div className="mt-6 mx-auto dark:bg-neutral-600 p-8 rounded-2xl hover:border hover:border-neutral-300">
          <ExportToPNG 
            elementId="graphCanvas"
            fileName="graphCanvas.png"
            tooltipText="Export&nbsp;Plot&nbsp;to&nbsp;PNG"
            color="blue"
            altText="Export Plot" 
            float="float-right" 
          />
          <h2 className="text-xl font-semibold mb-2">Plot:</h2>
          <Plot 
            iterations={iterationSteps} 
            functionInput={functionInput}  
            darkTheme={false} // Adjust based on your theme management
          />
        </div>
      )}

      {iterationSteps.length > 0 && (
        <div className="my-6 overflow-x-auto text-black dark:text-white ">
          <h2 className="text-xl inline-block font-semibold">Fixed-Point Iteration Steps:</h2>
          <ExportToPNG 
            elementId="Table"
            fileName="table.png"
            tooltipText="Export&nbsp;Table&nbsp;to&nbsp;PNG"
            color="blue"
            altText="Export Table" 
            float="float-right" 
            className="mb-4"
          />
          <table id="Table" className="w-full table-auto mt-4 border-collapse dark:bg-neutral-700">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Iteration</th>
                <th className="border border-gray-300 p-2">
                  <InlineMath math="x_n" />
                </th>
                <th className="border border-gray-300 p-2">
                  <InlineMath math="x_{n+1}" />
                </th>
                <th className="border border-gray-300 p-2">
                  <InlineMath math="|x_{n+1} - x_n|" />
                </th>
              </tr>
            </thead>
            <tbody>
              {iterationSteps.map((step, index) => (
                <tr key={index} className={index === iterationSteps.length - 1 ? 'bg-red-700 text-white' : ''}>
                  <td className="border border-gray-300 p-2">{step.iter}</td>
                  <td className="border border-gray-300 p-2">{step.x_n.toFixed(10)}</td>
                  <td className="border border-gray-300 p-2">{step.x_next.toFixed(10)}</td>
                  <td className="border border-gray-300 p-2">{step.difference.toFixed(5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {iterationSteps.length > 0 && (
        <div className="mt-6 text-wrap dark:bg-neutral-700 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2 inline-block">Detailed Steps:</h2>
          <ExportToPNG 
            elementId="steps"
            fileName="steps.png"
            tooltipText="Export&nbsp;Steps&nbsp;to&nbsp;PNG" 
            color="blue" 
            altText="Export Steps" 
            float="float-right" 
          />
          <div id="steps" className="space-y-4 dark:bg-neutral-700 md:p-4">
            {iterationSteps.map((step, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold">Iteration {step.iter}:</h3>
                <BlockMath math={`x^{(${step.iter})} = ${step.x_n.toFixed(10)}`} />
                <BlockMath math={`x^{(${step.iter + 1})} = g(x^{(${step.iter})}) = ${step.x_next.toFixed(10)}`} />
                <BlockMath math={`|x^{(${step.iter + 1})} - x^{(${step.iter})}| = ${step.difference.toFixed(5)}`} />
                <hr />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedPointMethod;
