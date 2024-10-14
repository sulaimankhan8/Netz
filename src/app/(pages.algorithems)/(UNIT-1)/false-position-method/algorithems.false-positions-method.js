'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import TButton from '../../../components/TButton';
import Plot from '../bisection-method/Plot';
import ExportToPNG from "@/app/utils/ExportToPNG";

const FalsePositionMethod = () => {
  const [demoInProgress, setDemoInProgress] = useState(false);

  const [functionInput, setFunctionInput] = useState("x ** 2 - 4"); // Default function
  const [tolerance, setTolerance] = useState(0.0001);
  const [result, setResult] = useState(null);
  const [intervalSteps, setIntervalSteps] = useState([]);
  const [falsePositionIterations, setFalsePositionIterations] = useState([]);
  const [error, setError] = useState('');
  const [iterationsCount, setIterationsCount] = useState(0);

  // Handle input changes
  const handleFunctionChange = (e) => {
    setFunctionInput(e.target.value);
  };

  const handleToleranceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setTolerance(0.0001);
    } else {
      setTolerance(value);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIntervalSteps([]);
    setFalsePositionIterations([]);
    setIterationsCount(0);

    // Convert user input to a function
    let f;
    try {
      f = new Function('x', `return ${functionInput};`);
      // Test the function with a sample input to catch errors
      f(0);
    } catch (err) {
      setError("Invalid function input. Please ensure the function is valid and uses JavaScript syntax.");
      return;
    }

    // Find interval
    const { interval, steps: intervalLog } = findInterval(f, 1000);
    setIntervalSteps(intervalLog);

    if (!interval) {
      setError("Could not find an interval where the function changes sign within the search range.");
      return;
    }

    const [a, b] = interval;

    // Perform False Position Method
    const { message, iterations } = falsePositionMethod(f, a, b, tolerance);

    setResult(message);
    setFalsePositionIterations(iterations);
    setIterationsCount(iterations.length);
  };

  // Function to find interval automatically
  
  const findInterval = (f, maxRange = 1000, step = 1) => {
    const steps = [];
    let fa, fb, a, b;

    // Helper function to evaluate f(x) safely
    const evaluateFunction = (x) => {
      try {
        const fx = f(x);
        steps.push(`f(${x}) = ${fx.toFixed(6)}`);
        return fx;
      } catch (err) {
        steps.push(`Error evaluating function at x = ${x}`);
        return null;
      }
    };

    // Search in the positive direction
    a = 0;
    fa = evaluateFunction(a);
    if (fa === null) {
      // If f(a) couldn't be evaluated, skip to negative search
      steps.push(`Skipping positive direction due to evaluation error at x = ${a}`);
    } else if (fa === 0) {
      // Exact root found
      steps.push(`Exact root found at x = ${a} `);
      return { interval: [a-1, a+1], steps };
    } else {
      for (let x = a + step; x <= maxRange; x += step) {
        const fx = evaluateFunction(x);
        if (fx === null) continue;

        if (fx === 0) {
          // Exact root found
          steps.push(`Exact root found at x = ${x},\n Sign change detected between x = ${x-1} and x = ${x+1}`);
          return { interval: [x-1, x+1], steps };
        }

        if (fa * fx < 0) {
          // Sign change detected
          b = x;
          fb = fx;
          steps.push(`Sign change detected between x = ${a} and x = ${b}`);
          return { interval: [a, b], steps };
        }

        // Update for next iteration
        a = x;
        fa = fx;
      }
    }

    // If no interval found in positive direction, search in negative direction
    steps.push(`No valid interval found in positive direction up to x = ${maxRange}. Searching in negative direction.`);
    
    // Reset for negative search
    a = 0;
    fa = evaluateFunction(a);
    if (fa === null) {
      // If f(a) couldn't be evaluated, return null
      steps.push(`Skipping negative direction due to evaluation error at x = ${a}`);
      return { interval: null, steps };
    } else if (fa === 0) {
      // Exact root found
      steps.push(`Exact root found at x = ${a}`);
      return { interval: [a, a], steps };
    } else {
      for (let x = a - step; x >= -maxRange; x -= step) {
        const fx = evaluateFunction(x);
        if (fx === null) continue;

        if (fx === 0) {
          // Exact root found
          steps.push(`Exact root found at x = ${x}`);
          return { interval: [x, x], steps };
        }

        if (fa * fx < 0) {
          // Sign change detected
          b = x;
          fb = fx;
          steps.push(`Sign change detected between x = ${a} and x = ${b}`);
          return { interval: [b, a], steps }; // Ensure a < b
        }

        // Update for next iteration
        a = x;
        fa = fx;
      }
    }

    // If no interval found in both directions
    steps.push(`No valid interval found in both positive and negative directions within the range [-${maxRange}, ${maxRange}].`);
    return { interval: null, steps };
  };
  // False Position Method Implementation
  const falsePositionMethod = (f, a, b, tolerance = 1e-5, maxIterations = 1000) => {
    const iterations = [];

    let fa = f(a);
    let fb = f(b);

    if (fa * fb >= 0) {
        return { message: "False Position method fails. f(a) and f(b) must have opposite signs.", iterations };
    }

    let c = a;
    let fc = fa;
    let iteration = 0;

    while (iteration < maxIterations) {
        // Calculate the false position using the new formula
        c = (a * fb - b * fa) / (fb - fa);
        try {
            fc = f(c);
        } catch (err) {
            return { message: `Error evaluating function at c = ${c}.`, iterations };
        }

        iterations.push({
            iteration: iteration + 1,
            a: a,
            b: b,
            c: c,
            fa: fa,
            fb: fb,
            fc: fc
        });

        // Check for convergence
        if (Math.abs(fc) < tolerance || Math.abs(b - a) < tolerance) {
            return { message: `Root found at x = ${c.toFixed(6)} after ${iteration + 1} iterations.`, iterations };
        }

        // Decide the side to repeat the steps
        if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }

        iteration++;
    }

    return { message: `Maximum iterations reached. Approximate root at x = ${c.toFixed(6)}.`, iterations };
};


  // Handle Demo button click
  const handleDemo = async () => {
    setDemoInProgress(true);
    setFunctionInput("x ** 2 - 4"); // Example function f(x) = x^2 - 4
    setTolerance(0.0001);

    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Trigger calculation
    document.getElementById("Calculate").click();

    setDemoInProgress(false);
  };

  // Handle Reset button click
  const handleReset = () => {
    setFunctionInput("");
    setTolerance(0.0001);
    setResult(null);
    setIntervalSteps([]);
    setFalsePositionIterations([]);
    setError('');
    setIterationsCount(0);
  };

  return (
    <div className="w-full mx-auto p-4 bg-white dark:text-white dark:bg-neutral-700">
      <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">False Position Method Solver</h1>

        <TButton
          tooltipText="Demo"
          onClick={handleDemo}
          className={`bg-purple-700 ${demoInProgress ? "opacity-50 cursor-not-allowed" : ""} hover:bg-purple-400`}
          color="violet"
          altText="Demo"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="function">Enter Function \(f(x)\):</label>
          <input
            type="text"
            id="function"
            value={functionInput}
            onChange={handleFunctionChange}
            placeholder="e.g., x ** 2 - 4"
            required
            className="w-full p-2 border dark:border-gray-600 rounded-md dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tolerance">Enter Tolerance:</label>
          <input
            type="number"
            id="tolerance"
            step="0.00001"
            value={tolerance}
            onChange={handleToleranceChange}
            placeholder="e.g., 0.0001"
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
            float="float-right"
          />
        </div>
      </form>

      {intervalSteps.length > 0 && (
        <div className="my-4 p-4 bg-yellow-100 text-yellow-700 dark:bg-neutral-600 dark:text-gray-200 rounded">
          <strong>Interval Detection Steps [ a , b ]:</strong>
          {intervalSteps.map((step, index) => (
            <p key={index}>{step}</p>
          ))}
        </div>
      )}

      {result && (
        <div className="my-4 p-4 bg-green-100 text-green-700 dark:bg-neutral-600 dark:text-neutral-200 rounded">
          <strong>Result:</strong> {result}
        </div>
      )}

      {falsePositionIterations.length > 0 && (
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
            iterations={falsePositionIterations} 
            functionInput={functionInput}  
          />
        </div>
      )}

      {falsePositionIterations.length > 0 && (
        <div className="my-6 md:mx-[8rem] overflow-x-auto">
          <h2 className="text-xl inline-block font-semibold">False Position Method Iterations:</h2>
          <ExportToPNG 
            elementId="Table"
            fileName="table.png"
            tooltipText="Export&nbsp;Table&nbsp;to&nbsp;PNG"
            color="blue"
            altText="Export Table" 
            float="float-right" 
            className="mb-4"
          />
          <table id="Table" className="w-full table-auto mt-4 border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Iteration</th>
                <th className="border border-gray-300 p-2">a</th>
                <th className="border border-gray-300 p-2">b</th>
                <th className="border border-gray-300 p-2">c</th>
                <th className="border border-gray-300 p-2">f(a)</th>
                <th className="border border-gray-300 p-2">f(b)</th>
                <th className="border border-gray-300 p-2">f(c)</th>
              </tr>
            </thead>
            <tbody>
              {falsePositionIterations.map((iter, index) => (
                <tr key={index} className={index === falsePositionIterations.length - 1 ? 'bg-red-700 text-white' : ''}>
                  <td className="border border-gray-300 p-2">{iter.iteration}</td>
                  <td className="border border-gray-300 p-2">{iter.a.toFixed(6)}</td>
                  <td className="border border-gray-300 p-2">{iter.b.toFixed(6)}</td>
                  <td className="border border-gray-300 p-2">{iter.c.toFixed(6)}</td>
                  <td className="border border-gray-300 p-2">{iter.fa.toFixed(6)}</td>
                  <td className="border border-gray-300 p-2">{iter.fb.toFixed(6)}</td>
                  <td className="border border-gray-300 p-2">{iter.fc.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {falsePositionIterations.length > 0 && (
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
          <div id="steps" className="space-y-4">
          {falsePositionIterations.map((iter, index) => (
  <div key={index}>
    <h3 className="text-lg font-semibold">Iteration {iter.iteration}</h3>
    <BlockMath math={`a^{(${iter.iteration})} = ${iter.a.toFixed(6)}`} />
    <BlockMath math={`b^{(${iter.iteration})} = ${iter.b.toFixed(6)}`} />
    <BlockMath 
      math={`c^{(${iter.iteration})} = \\frac{a \\cdot f(b) - b \\cdot f(a)}{f(b) - f(a)} = \\frac{${iter.a.toFixed(6)} \\cdot ${iter.fb.toFixed(6)} - ${iter.b.toFixed(6)} \\cdot ${iter.fa.toFixed(6)}}{${iter.fb.toFixed(6)} - ${iter.fa.toFixed(6)}} = ${iter.c.toFixed(6)}`} 
    />
    <BlockMath math={`f(c^{(${iter.iteration})}) = ${iter.fc.toFixed(6)}`} />
    <hr />
  </div>
))}

          </div>
        </div>
      )}
    </div>
  );
};

export default FalsePositionMethod;
