'use client';
import { useRecordSolve } from '@/app/utils/activity';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import Plot from './plot';
import { EditorialButton, EditorialExportButton } from '@/app/components/editorial';
import { FiPlay, FiRotateCcw, FiCheckCircle, FiTrendingUp, FiLayers, FiList, FiAlertCircle } from 'react-icons/fi';

const GaussSeidel = () => {
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'table' | 'steps' | 'plot'

  const [showAd, setShowAd] = useState(false);
  const [count, setCount] = useState(0);

  const handleButtonClick = () => {
    setCount(prevCount => prevCount + 1);
    if(count%5===0)
    setShowAd(true); // Show ad on button click
  };

  const closeAd = () => {
    setShowAd(false);
  };
  const [equations, setEquations] = useState([
    { a: 4, b: -1, c: 1, constant: 8 },
    { a: -1, b: 3, c: 2, constant: 20 },
    { a: 1, b: -1, c: 3, constant: 8 },
  ]);
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [error, setError] = useState(0.0001);
  const [results, setResults] = useState([]);
  useRecordSolve('gauss-seidel', 1, results);
  useCodeExportInputs('gauss-seidel', () => ({ A: equations.map((e) => [e.a, e.b, e.c, e.constant]), tol: error, maxIter: 1000 }));
  
  const [iterationDetails, setIterationDetails] = useState([]);
  const [iterationDetails2, setIterationDetails2] = useState([]);
  const [iterationDetails3, setIterationDetails3] = useState([]);
  const [checkError, setCheckError] = useState('');
  const [showAllSteps, setShowAllSteps] = useState(false);


  const [variableSequence, setVariableSequence] = useState([]); // To track variable sequence

  // Handle input changes for equations
  const handleInputChange = (index, field, value) => {
    const newEquations = [...equations];
    newEquations[index][field] = parseFloat(value);
    setEquations(newEquations);
  };
  const handleInputChangeError = (e) => {
    setError(e);
  }

  


  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    const { validatedEquations, errorMessage, sequence } = checkEquations(equations);

    if (errorMessage) {
      setCheckError(errorMessage);
      setVariableSequence([]);
      return;
    } else {
      setCheckError('');
    }

    // The tolerance field (named `error`) holds a string; an empty or zero value would never converge
    const tol = parseFloat(error);
    if (!(tol > 0)) {
      setCheckError('Tolerance must be a positive number, for example 0.0001.');
      return;
    }

    setVariableSequence(sequence); // Update the variable sequence state

    // Call GaussSeidels function
    const { iterations, iterationsteps, iterationsteps2, iterationsteps3, converged } = GaussSeidels(validatedEquations, tol);
    if (!converged) {
      setCheckError('No convergence after 1000 iterations. The values below are the last ones computed.');
    }

    // Update state with the results
    setResults(iterations);
    setIterationDetails(iterationsteps); // Set the iteration steps directly
    setIterationDetails2(iterationsteps2); // Set the second iteration steps directly
    setIterationDetails3(iterationsteps3); // Set the third iteration steps directly
  };



  // Handle Demo button click
  const handleDemo = () => {
    setDemoInProgress(true);
    const demoEqs = [
      { a: 10, b: -2, c: -1, constant: 3 },
      { a: -2, b: 10, c: -1, constant: 15 },
      { a: -1, b: -1, c: 10, constant: 27 },
    ];
    const demoErr = 0.0001;

    setEquations(demoEqs);
    setError(demoErr);
    setCheckError('');

    const { validatedEquations, errorMessage, sequence } = checkEquations(demoEqs);
    if (!errorMessage) {
      setVariableSequence(sequence);
      const { iterations, iterationsteps, iterationsteps2, iterationsteps3 } = GaussSeidels(validatedEquations, demoErr);
      setResults(iterations);
      setIterationDetails(iterationsteps);
      setIterationDetails2(iterationsteps2);
      setIterationDetails3(iterationsteps3);
    }
    setDemoInProgress(false);
  };

  // Handle Reset button click
  const handleReset = () => {
    setEquations([
      { a: 0, b: 0, c: 0, constant: 0 },
      { a: 0, b: 0, c: 0, constant: 0 },
      { a: 0, b: 0, c: 0, constant: 0 },
    ]);
    setError(0.0001);
    setResults([]);
    setIterationDetails('');
    setCheckError('');
    setVariableSequence([]);
  };

  const exportData = results.map((res) => ({
    Iteration: res.iteration,
    x: res.x.toFixed(4),
    y: res.y.toFixed(4),
    z: res.z.toFixed(4),
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              LINEAR ALGEBRA SYSTEM SOLVER
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">
              Gauss-Seidel Interactive Engine
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <EditorialButton
              variant="secondary"
              size="sm"
              onClick={handleDemo}
              disabled={demoInProgress}
            >
              <FiPlay className="w-3.5 h-3.5 mr-1" /> Quick Demo
            </EditorialButton>
            <EditorialButton
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </EditorialButton>
          </div>
        </div>

        {checkError && (
          <div className="p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>{checkError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase text-black dark:text-white block">
              System of 3 Equations (<InlineMath math="ax + by + cz = d" />)
            </label>

            <div className="grid grid-cols-1 gap-3">
              {equations.map((eq, index) => (
                <div key={index} className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex flex-wrap items-center gap-3 font-mono text-sm">
                  <span className="font-bold text-neutral-500">Eq {index + 1}:</span>
                  <input
                    type="number"
                    step="any"
                    value={eq.a}
                    onChange={(e) => handleInputChange(index, 'a', e.target.value)}
                    className="w-20 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-bold"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    step="any"
                    value={eq.b}
                    onChange={(e) => handleInputChange(index, 'b', e.target.value)}
                    className="w-20 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-bold"
                  />
                  <span>y +</span>
                  <input
                    type="number"
                    step="any"
                    value={eq.c}
                    onChange={(e) => handleInputChange(index, 'c', e.target.value)}
                    className="w-20 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-bold"
                  />
                  <span>z =</span>
                  <input
                    type="number"
                    step="any"
                    value={eq.constant}
                    onChange={(e) => handleInputChange(index, 'constant', e.target.value)}
                    className="w-24 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="errorMargin" className="text-xs font-mono font-bold uppercase text-black dark:text-white">
                Tolerance / Error Margin (<InlineMath math="\epsilon" />)
              </label>
              <input
                type="number"
                step="any"
                id="errorMargin"
                value={error}
                onChange={(e) => handleInputChangeError(e.target.value)}
                placeholder="0.0001"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <EditorialButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
            >
              <FiCheckCircle className="w-4 h-4 mr-2" /> Solve Vector System
            </EditorialButton>
          </div>
        </form>

        {variableSequence.length > 0 && (
          <div className="p-4 border-2 border-black/30 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-xl font-mono text-xs text-black dark:text-white">
            <strong className="uppercase text-neutral-500 block mb-1">Diagonally Dominant Variable Order:</strong>
            {variableSequence.join(' → ')}
          </div>
        )}

        {results.length > 0 && (
          <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">
                Convergence Reached ({results.length - 1} iterations)
              </span>
              <span className="text-base md:text-lg font-mono font-black">
                x = {results[results.length - 1].x.toFixed(4)}, y = {results[results.length - 1].y.toFixed(4)}, z = {results[results.length - 1].z.toFixed(4)}
              </span>
            </div>

            <EditorialExportButton
              title="Gauss Seidel Method Report"
              elementId="gauss-seidel-results-container"
              exportData={exportData}
              variant="accent"
              size="sm"
            />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div id="gauss-seidel-results-container" className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black dark:border-neutral-700 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setViewTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  viewTab === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                All Views
              </button>
              <button
                type="button"
                onClick={() => setViewTab('table')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                  viewTab === 'table'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <FiList className="w-3.5 h-3.5" /> Vector Log
              </button>
              <button
                type="button"
                onClick={() => setViewTab('steps')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                  viewTab === 'steps'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <FiLayers className="w-3.5 h-3.5" /> Substitution Steps
              </button>
              <button
                type="button"
                onClick={() => setViewTab('plot')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                  viewTab === 'plot'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <FiTrendingUp className="w-3.5 h-3.5" /> Convergence Curve
              </button>
            </div>

            <EditorialExportButton
              title="Gauss Seidel Method Report"
              elementId="gauss-seidel-results-container"
              exportData={exportData}
              size="sm"
            />
          </div>

          {(viewTab === 'all' || viewTab === 'table') && (
            <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                <FiList className="w-5 h-5 text-neutral-500" /> Gauss-Seidel Vector Iteration Log
              </h4>

              <div className="overflow-x-auto rounded-xl border-2 border-black/80 dark:border-neutral-700">
                <table className="w-full table-auto border-collapse text-center text-xs md:text-sm font-mono">
                  <thead>
                    <tr className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold">
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">Iter</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">x</th>
                      <th className="p-3 border-r border-neutral-700 dark:border-neutral-300">y</th>
                      <th className="p-3">z</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res, index) => (
                      <tr
                        key={index}
                        className={
                          index === results.length - 1
                            ? 'bg-emerald-500 text-white font-bold'
                            : index % 2 === 0
                            ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white'
                            : 'bg-white dark:bg-neutral-900 text-black dark:text-white'
                        }
                      >
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700">{res.iteration}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{res.x.toFixed(4)}</td>
                        <td className="p-3 border-t border-r border-neutral-200 dark:border-neutral-700 font-bold">{res.y.toFixed(4)}</td>
                        <td className="p-3 border-t border-neutral-200 dark:border-neutral-700 font-bold">{res.z.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'steps') && (
            <div id="gauss-seidel-steps-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-neutral-500" /> Step-by-Step Component Updates ({iterationDetails.length} Total Iterations)
                </h4>
                <div className="flex items-center gap-2">
                  {iterationDetails.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(!showAllSteps)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/30 dark:border-neutral-600 rounded-lg text-xs font-mono font-bold uppercase transition-all"
                    >
                      {showAllSteps ? 'Show First 5 Iterations' : `Show All ${iterationDetails.length} Iterations`}
                    </button>
                  )}
                  <EditorialExportButton
                    title="Gauss-Seidel Steps"
                    targetId="gauss-seidel-steps-container"
                    label="Export Steps"
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {(showAllSteps ? iterationDetails : iterationDetails.slice(0, 5)).map((step, index) => (
                  <div key={index} className="p-4 border-2 border-black/40 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      <span>Iteration {index + 1}</span>
                      <span>Updated Variable Derivations</span>
                    </div>
                    <div className="overflow-x-auto text-center py-1 font-mono text-xs">
                      <BlockMath math={`${step} \\quad , \\quad ${iterationDetails2[index]} \\quad , \\quad ${iterationDetails3[index]}`} />
                    </div>
                  </div>
                ))}
                {!showAllSteps && iterationDetails.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllSteps(true)}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Click to expand and view remaining {iterationDetails.length - 5} iteration derivations...
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {(viewTab === 'all' || viewTab === 'plot') && (
            <div id="gauss-seidel-plot-container" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-neutral-500" /> Convergence Trajectory Plot
                </h4>
                <EditorialExportButton
                  title="Gauss-Seidel Convergence Plot"
                  targetId="gauss-seidel-plot-container"
                  label="Export Graph"
                  variant="outline"
                  size="sm"
                />
              </div>

              <div id="graphCanvas" className="w-full">
                <Plot iterations={results} />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

// Function to check if each equation is diagonally dominant and identify the variable to solve for
function check(a, b, c) {
  if (Math.abs(a) >= Math.abs(b) + Math.abs(c)) {
    return { variable: 'x', A: a, B: b, C: c };
  }
  if (Math.abs(b) >= Math.abs(a) + Math.abs(c)) {
    return { variable: 'y', A: a, B: b, C: c };
  }
  if (Math.abs(c) >= Math.abs(a) + Math.abs(b)) {
    return { variable: 'z', A: a, B: b, C: c };
  }
  return null; // If none of the conditions are met
}

// Function to validate equations for diagonal dominance and rearrange them to x, y, z order
function checkEquations(equations) {
  const temp = [];
  const validatedEquations = [];
  let errorMessage = '';
  const sequence = []; // To track the order of variables

  // Object to keep track of which variables have been assigned
  const variableAssigned = {
    x: false,
    y: false,
    z: false,
  };

  equations.forEach((equation, index) => {
    const result = check(equation.a, equation.b, equation.c);
    if (result) {
      const { variable, A, B, C } = result;

      // Check for duplicate variable assignments
      if (variableAssigned[variable]) {
        errorMessage = `Multiple equations are solving for the same variable '${variable}'. Each equation must solve for a unique variable.`;
        return;
      }

      variableAssigned[variable] = true;
      sequence.push(variable);

      validatedEquations.push({
        a: A,
        b: B,
        c: C,
        constant: equation.constant,
        solveFor: variable,
      });
    } else {
      errorMessage = `Equation ${index + 1} is not diagonally dominant. Please adjust the coefficients.`;
    }
  });

  // Ensure all variables are assigned exactly once
  const unassignedVariables = Object.keys(variableAssigned).filter(
    (varKey) => !variableAssigned[varKey]
  );

  if (unassignedVariables.length > 0) {
    errorMessage = `Not all variables are assigned. Missing variables: ${unassignedVariables.join(', ')}.`;
  }

  // Rearrange validatedEquations to x, y, z order
  const orderedEquations = [];
  ['x', 'y', 'z'].forEach((varKey) => {
    const eq = validatedEquations.find((e) => e.solveFor === varKey);
    if (eq) {
      orderedEquations.push(eq);
    }
  });

  // If rearrangement is incomplete due to errors, do not proceed
  if (errorMessage || orderedEquations.length !== 3) {
    return { validatedEquations: [], temp, errorMessage, sequence: [] };
  }

  return { validatedEquations: orderedEquations, temp, errorMessage: '', sequence };
}

// Gauss-Seidel Iteration Function
function GaussSeidels(equations, error) {
  let xPrev = 0,
    yPrev = 0,
    zPrev = 0;
  let iterations = [];
  let iterationsteps = [];
  let iterationsteps2 = [];
  let iterationsteps3 = [];
  let iterationCount = 1;
  let converged = true;

  // Initialize with iteration 0
  iterations.push({ iteration: 0, x: xPrev, y: yPrev, z: zPrev });

  while (true) {
    let detailedIterations = ` `;
    let detailedIterations2 = ` `;
    let detailedIterations3 = ` `;

    // To store new values temporarily
    let newValues = {};

    // Iterate through each equation in the order of x, y, z
    equations.forEach((eq) => {
      const { solveFor, a, b, c, constant } = eq;
      let newValue = 0;

      if (solveFor === 'x') {
        newValue = (constant - b * yPrev - c * zPrev) / a;
        newValues.x = newValue;
        detailedIterations += `\\displaystyle x^{(${iterationCount})} = 
        \\frac{${constant} - (${b}) \\cdot y^{(${iterationCount - 1})} - (${c}) \\cdot z^{(${iterationCount - 1})}}{${a}} `
        detailedIterations += `\\displaystyle =
        \\frac{${constant} - (${b}) \\cdot (${yPrev.toFixed(4)}) - (${c}) \\cdot (${zPrev.toFixed(4)})}{${a}}  `
        detailedIterations += `\\displaystyle  =${newValue.toFixed(4)} \\quad `;
      } else if (solveFor === 'y') {
        newValue = (constant - a * newValues.x - c * zPrev) / b;
        newValues.y = newValue;
        detailedIterations2 += `\\displaystyle y^{(${iterationCount})} = \\frac{${constant} - (${a}) \\cdot x^{(${iterationCount})} - (${c}) \\cdot z^{(${iterationCount - 1})}}{${b}} `
        detailedIterations2 += `\\displaystyle  = \\frac{${constant} - (${a}) \\cdot (${newValues.x.toFixed(4)}) - (${c}) \\cdot (${zPrev.toFixed(4)})}{${b}} `
        detailedIterations2 += `\\displaystyle = ${newValue.toFixed(4)} \\quad `;
      } else if (solveFor === 'z') {
        newValue = (constant - a * newValues.x - b * newValues.y) / c;
        newValues.z = newValue;
        detailedIterations3 += `\\displaystyle z^{(${iterationCount})} = \\frac{${constant} - (${a}) \\cdot x^{(${iterationCount})} - (${b}) \\cdot y^{(${iterationCount})}}{${c}} `
        detailedIterations3 += `\\displaystyle  =  \\frac{${constant} - (${a}) \\cdot (${newValues.x.toFixed(4)}) - (${b}) \\cdot (${newValues.y.toFixed(4)})}{${c}}  `
        detailedIterations3 += `\\displaystyle = ${newValue.toFixed(4)} \\quad `;
      }
    });
    iterationsteps.push(detailedIterations);
    iterationsteps2.push(detailedIterations2);
    iterationsteps3.push(detailedIterations3);


    // Update iteration values
    const xNew = newValues.x !== undefined ? newValues.x : xPrev;
    const yNew = newValues.y !== undefined ? newValues.y : yPrev;
    const zNew = newValues.z !== undefined ? newValues.z : zPrev;

    iterations.push({ iteration: iterationCount, x: xNew, y: yNew, z: zNew });

    // Check for convergence
    if (
      Math.abs(xNew - xPrev) < error &&
      Math.abs(yNew - yPrev) < error &&
      Math.abs(zNew - zPrev) < error
    ) {
      break;
    }

    // Update previous values for next iteration
    xPrev = xNew;
    yPrev = yNew;
    zPrev = zNew;
    iterationCount++;

    // Prevent infinite loops
    if (iterationCount > 1000) {
      converged = false;
      break;
    }
  }

  return { iterations, iterationsteps, iterationsteps2, iterationsteps3, converged };
}

export default GaussSeidel;
