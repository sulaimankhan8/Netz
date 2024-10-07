'use client';

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React, { useState } from 'react';
import TButton from '../../../components/TButton';
import Plot from './plot';
import html2canvas from 'html2canvas';

const GaussSeidel = () => {
  const [equations, setEquations] = useState([
    { a: 4, b: -1, c: 1, constant: 8 },
    { a: -1, b: 3, c: 2, constant: 20 },
    { a: 1, b: -1, c: 3, constant: 8 },
  ]);
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [error, setError] = useState(0.0001);
  const [results, setResults] = useState([]);
  
  const [showMessage, setShowMessage] = useState(false);
  const [iterationDetails, setIterationDetails] = useState([]);
  const [iterationDetails2, setIterationDetails2] = useState([]);
  const [iterationDetails3, setIterationDetails3] = useState([]);
  const [checkError, setCheckError] = useState('');


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

  const exportGraphToPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = 'graph.png';
      link.click();
    };
    showCopied();
  };

  const exportTableToPNG = () => {
    html2canvas(document.getElementById('diffTable')).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = 'difference_table.png';
      link.click();
    });
    showCopied();

  };

  const exportPolynomialStepsToPNG = () => {
    html2canvas(document.getElementById('steps')).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = 'polynomial_steps.png';
      link.click();
    }); showCopied();
  };
  
  const showCopied = () => {
    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
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

    setVariableSequence(sequence); // Update the variable sequence state

    // Call GaussSeidels function
    const { iterations, iterationsteps, iterationsteps2, iterationsteps3 } = GaussSeidels(validatedEquations, error);

    // Update state with the results
    setResults(iterations);
    setIterationDetails(iterationsteps); // Set the iteration steps directly
    setIterationDetails2(iterationsteps2); // Set the second iteration steps directly
    setIterationDetails3(iterationsteps3); // Set the third iteration steps directly
  };



  // Handle Demo button click
  const handleDemo = async () => {
    setDemoInProgress(true);
    setEquations([
      { a: 10, b: 2, c: 1, constant: 27 },
      { a: 3, b: 8, c: 2, constant: 45 },
      { a: 1, b: -1, c: 5, constant: 13 },
    ]);

    setError(0.0001);

    // Wait for equations to update
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Trigger calculation
    document.getElementById("Calculate").click();

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

  return (
    <div className="w-full mx-auto p-4 bg-white dark:text-white dark:bg-neutral-700">
      <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">Gauss-Seidel Method</h1>

        <TButton
          tooltipText="Demo"
          onClick={handleDemo}
          className={`bg-purple-700 ${demoInProgress ? "opacity-50 cursor-not-allowed" : ""} hover:bg-purple-400`}
          color="violet"
          altText={demoInProgress ? "Demo Running..." : "Demo"}
        />
      </div>

      {checkError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {checkError}
        </div>
      )}



      <form onSubmit={handleSubmit} className="space-y-4">
        <table className="w-full m-auto table-auto md:table-fixed p-4 shadow-md">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">A Value</th>
              <th className="border border-gray-300 p-2">B Value</th>
              <th className="border border-gray-300 p-2">C Value</th>
              <th className="border border-gray-300 p-2">Constants</th>
            </tr>
          </thead>
          <tbody>
            {equations.map((equation, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2 col-span-2">
                  <input
                    type="number"
                    placeholder="a"
                    value={equation.a}
                    onChange={(e) => handleInputChange(index, 'a', e.target.value)}
                    required
                    className="w-[50%] sm:my-5 sm:ml-5 text-black pr-1 dark:bg-neutral-800 dark:text-white border dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 text-right"
                  />
                  <label className="ml-0 md:m-5 dark:text-white text-xl font-semibold">x</label>
                </td>
                <td className="border border-gray-300 sm:p-2">
                  <input
                    type="number"
                    value={equation.b}
                    onChange={(e) => handleInputChange(index, 'b', e.target.value)}
                    placeholder="b"
                    required
                    className="w-[50%] sm:my-5 sm:ml-5 text-black border pr-1 dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 text-right"
                  />
                  <label className="ml-0 md:m-5 dark:text-white text-xl font-semibold">y</label>
                </td>
                <td className="border border-gray-300 sm:p-2">
                  <input
                    type="number"
                    value={equation.c}
                    onChange={(e) => handleInputChange(index, 'c', e.target.value)}
                    placeholder="c"
                    required
                    className="w-[50%] sm:my-5 sm:ml-5 text-black border pr-1 dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 text-right"
                  />
                  <label className="ml-0 md:m-5 dark:text-white text-xl font-semibold">z</label>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="md:my-5 md:ml-5 dark:text-white text-2xl font-bold">=</label>
                  <input
                    type="number"
                    step="any"
                    value={equation.constant}
                    onChange={(e) => handleInputChange(index, 'constant', e.target.value)}
                    placeholder="Constant"
                    required
                    className="w-[40%] p-2 text-black dark:bg-neutral-800  dark:text-white border dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
              </tr>

            ))}
            <tr>
              <td className="border border-gray-300 p-5 text-xl text-center" colSpan="2">Error Margin</td>
              <td className=" border border-gray-300 p-2" colSpan="2">
                <input
                  type="number"
                  step="any"
                  value={error}
                  onChange={(e) => handleInputChangeError(e.target.value)}
                  placeholder="0.0001"
                  required
                  className="w-[80%] p-2 text-black m-auto dark:bg-neutral-800 dark:text-white border dark:border-gray-600 rounded-md pr-1 hover:border hover:border-neutral-300"
                />
              </td>

            </tr>
          </tbody>
        </table>





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
            imgSrc="/reset.svg"
            altText="Reset"
            className="float-right"
            color="red"
            float="float-right"
          />
        </div>
      </form>


      {variableSequence.length > 0 && (
        <div className="my-4 p-4 bg-blue-100 text-blue-700 rounded">
          <strong>Variable Sequence:</strong> {variableSequence.join(', ')}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 mx-auto dark:bg-neutral-600 p-8 rounded-2xl  hover:border hover:border-neutral-300">
          <TButton onClick={exportGraphToPNG} tooltipText="Export&nbsp;Graph&nbsp;to&nbsp;PNG"
          color="blue"
          
           altText="Export Graph" 
           imgSrc="/copy.svg" 
           float="float-right" />
          <h2 className="text-xl font-semibold mb-2">Plot:</h2>
          <Plot iterations={results} />
        </div>
      )}

<div id="messageBox" style={{
        display: showMessage ? 'block' : 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px',
        position: 'fixed',
        bottom: '30px',
        right: '20px',
        borderRadius: '5px',
      }}>
        copied
      </div>
      {results.length > 0 && (<div>
        


        <div id="diffTable"  className="my-[3rem]  md:mx-[8rem] overflow-x-auto dark:bg-neutral-700">
          <h2 className="text-xl inline-block font-semibold">Iteration Results:</h2><TButton onClick={exportTableToPNG} tooltipText="Export&nbsp;Table to&nbsp;PNG" color="blue" className="overflow-visible " altText="Export Table" imgSrc="/copy.svg" float="float-right" />
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Iteration</th>
                <th className="border border-gray-300 p-2">x</th>
                <th className="border border-gray-300 p-2">y</th>
                <th className="border border-gray-300 p-2">z</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className={index === results.length-1 ? 'bg-red-700':''}>
                  <td className="border border-gray-300 p-2">{result.iteration}</td>
                  <td className="border border-gray-300 p-2">{result.x.toFixed(4)}</td>
                  <td className="border border-gray-300 p-2">{result.y.toFixed(4)}</td>
                  <td className="border border-gray-300 p-2">{result.z.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>)}
        <div id="steps" className="mt-6 text-wrap dark:bg-neutral-700">
      
        <h2 className="text-xl font-semibold mb-2">Results:</h2>
        <TButton onClick={exportPolynomialStepsToPNG} tooltipText="Export&nbsp;Polynomial Steps&nbsp;to&nbsp;PNG" color="blue" altText="Export&nbsp;steps" className="" float="float-right" imgSrc="/copy.svg" />
        <div className="border p-4 rounded">
          {iterationDetails.length && (
            iterationDetails.map((step, index) => (
              <div key={index} className="">
                <h2 className="text-xl md:ml-10 overflow-x-auto">Iteration {`${index + 1}`}</h2><br />

                <div className="text-center rounded-lg">
                  <pre className="overflow-x-auto">
                <BlockMath math={`${step}  \\newline`} />
                  </pre>
                </div>
                <div className="text-center  rounded-lg">
                  <pre className="overflow-x-auto">
                  <BlockMath math={`${iterationDetails2[index]} `} />
                  </pre>
                </div>
                <div className="text-center  rounded-lg">
                  <pre className="overflow-x-auto">
                  <BlockMath math={`${iterationDetails3[index]}`} />
                  </pre>
                </div>
                  

                <br />
              </div>
            ))
          )}
        </div>
      </div>



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
        \\frac{${constant} - (${a}) \\cdot (${xPrev.toFixed(4)}) - (${b}) \\cdot (${yPrev.toFixed(4)})}{${a}}  `
        detailedIterations += `\\displaystyle  =${newValue.toFixed(4)} \\quad `;
      } else if (solveFor === 'y') {
        newValue = (constant - a * newValues.x - c * zPrev) / b;
        newValues.y = newValue;
        detailedIterations2 += `\\displaystyle y^{(${iterationCount})} = \\frac{${constant} - (${a}) \\cdot x^{(${iterationCount})} - (${c}) \\cdot z^{(${iterationCount - 1})}}{${b}} `
        detailedIterations2 += `\\displaystyle  = \\frac{(${constant} - ${a} \\cdot (${newValues.x.toFixed(4)}) - ${c} \\cdot (${zPrev.toFixed(4)}))}{(${b})} `
        detailedIterations2 += `\\displaystyle = ${newValue.toFixed(4)} \\quad `;
      } else if (solveFor === 'z') {
        newValue = (constant - a * newValues.x - b * newValues.y) / c;
        newValues.z = newValue;
        detailedIterations3 += `\\displaystyle z^{(${iterationCount})} = \\frac{${constant} - (${a}) \\cdot x^{(${iterationCount})} - (${b}) \\cdot y^{(${iterationCount})}}{${c}} `
        detailedIterations3 += `\\displaystyle  =  \\frac{(${constant} - ${a} \\cdot (${newValues.x.toFixed(4)}) - ${c} \\cdot (${zPrev.toFixed(4)}))}{(${b})}  `
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
      alert("Maximum iterations reached without convergence.");
      break;
    }
  }

  return { iterations, iterationsteps, iterationsteps2, iterationsteps3, };
}

export default GaussSeidel;
