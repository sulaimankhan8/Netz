import React, { useState } from 'react';
import TButton from '../components/TButton';
import Plot from '../Gauss-seidal/plot';

const GaussSeidel = () => {
  const [equations, setEquations] = useState([
    { a: 4, b: -1, c: 1, constant: 8 },
    { a: -1, b: 3, c: 2, constant: 20 },
    { a: 1, b: -1, c: 3, constant: 8 },
  ]);
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [error, setError] = useState(0.0001);
  const [results, setResults] = useState([]);
  const [iterationDetails, setIterationDetails] = useState('');
  const [checkError, setCheckError] = useState('');
  const [variableSequence, setVariableSequence] = useState([]); // To track variable sequence

  // Handle input changes for equations
  const handleInputChange = (index, field, value) => {
    const newEquations = [...equations];
    newEquations[index][field] = parseFloat(value);
    setEquations(newEquations);
  };

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

    const { iterations, iterationsteps } = GaussSeidels(validatedEquations, error);

    setResults(iterations);
    setIterationDetails(iterationsteps);
  };

  // Generate HTML for iteration details
  const generateIterationDetails = (iterations) => {
    let details = '';
    iterations.forEach(({ iteration, x, y, z }) => {
      details += `Iteration ${iteration}: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}<br>`;
    });
    return details;
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
    <div className="max-w-full mx-auto p-4">
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

      {variableSequence.length > 0 && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded">
          <strong>Variable Sequence:</strong> {variableSequence.join(', ')}
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
                    className="w-[50%] sm:my-5 sm:ml-5 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 text-right"
                  />
                  <label className="ml-0 sm:m-5 dark:text-white text-xl font-semibold">x</label>
                </td>
                <td className="border border-gray-300 sm:p-2">
                  <input
                    type="number"
                    value={equation.b}
                    onChange={(e) => handleInputChange(index, 'b', e.target.value)}
                    placeholder="b"
                    required
                    className="w-[50%] sm:my-5 sm:ml-5 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 text-right"
                  />
                  <label className="ml-0 sm:m-5 dark:text-white text-xl font-semibold">y</label>
                </td>
                <td className="border border-gray-300 sm:p-2">
                  <input
                    type="number"
                    value={equation.c}
                    onChange={(e) => handleInputChange(index, 'c', e.target.value)}
                    placeholder="c"
                    required
                    className="w-[50%] sm:my-5 sm:ml-5 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 text-right"
                  />
                  <label className="ml-0 sm:m-5 dark:text-white text-xl font-semibold">z</label>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="my-5 sm:ml-5 dark:text-white text-2xl font-bold">=</label>
                  <input
                    type="number"
                    step="any"
                    value={equation.constant}
                    onChange={(e) => handleInputChange(index, 'constant', e.target.value)}
                    placeholder="Constant"
                    required
                    className="w-[40%] p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
              </tr>
            ))}
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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Results:</h2>
        <div
          className="border p-4 rounded"
          dangerouslySetInnerHTML={{ __html: iterationDetails }}
        />
      </div>

      {results.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Chart:</h2>
          <Plot iterations={results} />
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
  let iterationsteps = '';
  let iterationCount = 1;

  // Initialize with iteration 0
  iterations.push({ iteration: 0, x: xPrev, y: yPrev, z: zPrev });

  while (true) {
    let detailedIterations = `Iteration ${iterationCount}:<br>`;

    // To store new values temporarily
    let newValues = {};

    // Iterate through each equation in the order of x, y, z
    equations.forEach((eq) => {
      const { solveFor, a, b, c, constant } = eq;
      let newValue = 0;

      if (solveFor === 'x') {
        newValue = (constant - b * yPrev - c * zPrev) / a;
        newValues.x = newValue;
        detailedIterations += `x<sup>${iterationCount}</sup> = (${constant} - (${b}) * y<sup>${iterationCount - 1}</sup> - (${c}) * z<sup>${iterationCount - 1}</sup>) / ${a} = ${newValue.toFixed(4)}<br>`;
      } else if (solveFor === 'y') {
        newValue = (constant - a * newValues.x - c * zPrev) / b;
        newValues.y = newValue;
        detailedIterations += `y<sup>${iterationCount}</sup> = (${constant} - (${a}) * x<sup>${iterationCount}</sup> - (${c}) * z<sup>${iterationCount - 1}</sup>) / ${b} = ${newValue.toFixed(4)}<br>`;
      } else if (solveFor === 'z') {
        newValue = (constant - a * newValues.x - b * newValues.y) / c;
        newValues.z = newValue;
        detailedIterations += `z<sup>${iterationCount}</sup> = (${constant} - (${a}) * x<sup>${iterationCount}</sup> - (${b}) * y<sup>${iterationCount}</sup>) / ${c} = ${newValue.toFixed(4)}<br>`;
      }
    });

    iterationsteps += detailedIterations + '<br>';

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

  return { iterations, iterationsteps };
}

export default GaussSeidel;
