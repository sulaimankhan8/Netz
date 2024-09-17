'use client';
import { useState } from 'react';

export default function NewtonBackwardInterpolations() {
  

  const [rows, setRows] = useState([{ x: '', y: '' }]);
  const [interpolateX, setInterpolateX] = useState('');
  const [output, setOutput] = useState('');
  const [diffTable, setDiffTable] = useState([]);
  const [polynomialSteps, setPolynomialSteps] = useState({
    formulas: [],
    substituted: [],
    calculated: [],
    final: ''
  });
  const [demoInProgress, setDemoInProgress] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { x: '', y: '' }]);
  };

  const handleInputChange = (index, type, value) => {
    const newRows = [...rows];
    newRows[index][type] = value;
    setRows(newRows);
  };
  const xValues = rows.map(row => parseFloat(row.x));
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const xValues = rows.map(row => parseFloat(row.x));
    const yValues = rows.map(row => parseFloat(row.y));
    const x = parseFloat(interpolateX);

    if (xValues.length < 2 || yValues.length < 2) {
      setOutput('Please enter at least two data points.');
      return;
    }

    const points = xValues.map((xi, i) => ({ x: xi, y: yValues[i] }));
    const { interpolatedValue, diffTable, stepFormulas, stepSubstituted, stepCalculated } = newtonBackwardInterpolation(points, x);
    
    setDiffTable(diffTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `Interpolated value at x = ${x}: P(${x}) = ${interpolatedValue}`
    });
    setOutput(`Interpolated value at x = ${x}: P(${x}) = ${interpolatedValue}`);
  };

  const handleDemo = async () => {
    const demoX = [24, 28, 32, 36, 40];
    const demoY = [28.06, 30.19, 32.75, 34.94, 40];
    const demoInterpolateX = 33;

    setDemoInProgress(true);

    for (let i = 0; i < demoX.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      setRows(prevRows => {
        const newRows = [...prevRows];
        if (newRows[i]) {
          newRows[i].x = demoX[i];
          newRows[i].y = demoY[i];
        } else {
          newRows.push({ x: demoX[i], y: demoY[i] });
        }
        return newRows;
      });
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setInterpolateX(demoInterpolateX);

    await new Promise(resolve => setTimeout(resolve, 500));
    document.getElementById('interpolateButton').click();

    setDemoInProgress(false);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Newton Backward Interpolation Calculator</h1>
        <button
          className={`bg-purple-500 text-white px-4 py-2 rounded ${demoInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleDemo}
          disabled={demoInProgress}
        >
          {demoInProgress ? 'Demo Running...' : 'Demo'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">X Value</th>
              <th className="border border-gray-300 p-2">Y Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-300"
                    value={row.x}
                    onChange={(e) => handleInputChange(index, 'x', e.target.value)}
                    required
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-300"
                    value={row.y}
                    onChange={(e) => handleInputChange(index, 'y', e.target.value)}
                    required
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddRow}>
          Add Row
        </button>
        <div className="space-y-2">
          <label htmlFor="interpolateX">Interpolate at X:</label>
          <input
            type="number"
            step="any"
            id="interpolateX"
            className="w-full p-2 border border-gray-300"
            value={interpolateX}
            onChange={(e) => setInterpolateX(e.target.value)}
            required
          />
        </div>
        <button type="submit" id="interpolateButton" className="bg-green-500 text-white px-4 py-2 rounded">
          Interpolate
        </button>
      </form>

      
      {diffTable.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h2 className="text-xl font-semibold">Difference Table</h2>
          <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">x</th>
                {Array.from({ length: diffTable.length }).map((_, i) => (
                  <th key={i} className="border border-gray-300 p-2">Δ<sup>{i}</sup>Y</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diffTable.map((row, rowIndex) => (
                <tr key={rowIndex}  className={rowIndex === diffTable.length - 1 ? 'bg-red-500' : ''}>
                  <td className="border border-gray-300 p-2">{xValues[rowIndex]}</td>
                 
                  {row.map((value, colIndex) => (
                    
                    <td key={colIndex} className="border border-gray-300 p-2">{value !== undefined ?  (value.toFixed(4) !== "0.0000" ? value.toFixed(4) : '') : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <div id="steps" className="mt-6 p-10">
        <h2 className="text-xl font-semibold">Polynomial Calculation Steps</h2>
        <div className="space-y-4 ">
          {polynomialSteps.formulas.length > 0 && (
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold ">1. Formula of the Polynomial:</h3>
              <pre>{polynomialSteps.formulas.join(' + \n')}</pre>
            </div>
          )}
          {polynomialSteps.substituted.length > 0 && (
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold">2. Substituted Values in the Polynomial:</h3>
              <pre>{polynomialSteps.substituted.join(' + \n')}</pre>
            </div>
          )}
          {polynomialSteps.calculated.length > 0 && (
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold">3. Evaluated Terms:</h3>
              <pre>{polynomialSteps.calculated.join(' + \n')}</pre>
            </div>
          )}
          {polynomialSteps.final && (
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold">4. Final Answer:</h3>
              <pre>{polynomialSteps.final}</pre>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
}

function newtonBackwardInterpolation(points, x) {
  const tr =[`y${'\u2099'}`,
    `(v/1!)Δ${'\u00B9'}y${'\u2099\u208b\u2081'}`,
    `((v(v+1))/2!)Δ${'\u00B2'}y${'\u2099\u208b\u2082'}`,
    `((v(v+1)(v+2))/3!)Δ${'\u00B3'}y${'\u2099\u208b\u2083'}`,
`((v(v+1)(v+2)(v+3))/4!)Δ${'\u{2074}'}y${'\u2099\u208b\u2084'}`,
`((v(v+1)(v+2)(v+3)(v+4))/5!)Δ${'\u{2075}'}y${'\u2099\u208b\u2085'}`,
`((v(v+1)(v+2)(v+3)(v+4)(v+5))/6!)Δ${'\u{2076}'}y${'\u2099\u208b\u2086'}`,
`((v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6))/7!)Δ${'\u{2077}'}y${'\u2099\u208b\u2087'}`,
`((v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7))/8!)Δ${'\u{2078}'}y${'\u2099\u208b\u2088'}`,
`((v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8))/9!)${'\u2079'}y${'\u2099\u208b\u2089'}`,
`((v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8)(v+9))/10!)Δ${'\u00B9\u2070'}y${'\u2099\u208b\u2081\u2080'}`
]
  const n = points.length;
  const xi = points.map(p => p.x);
  const yi = points.map(p => p.y);

  let diffTable = Array.from({ length: n }, (_, i) => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    diffTable[i][0] = yi[i];
  }

   // Building the difference table
   for (let j = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      diffTable[i][j] = diffTable[i][j - 1] - diffTable[i - 1][j - 1];
    }
  }

  let u = (x - xi[n - 1]) / (xi[1] - xi[0]); // Calculate 'u'
  let interpolatedValue = diffTable[n - 1][0]; // Starting with the last y-value
  console.log(xi)
;
  let uProduct = 1;
  let factorial = 1;

  let stepFormulas = [`P(x) = ${tr[0]}`]; // Step for polynomial formula
  let stepSubstituted = [`P(${x}) = ${diffTable[n - 1][0]}`]; // Substituted step
  let stepCalculated = [`P(${x}) = ${diffTable[n - 1][0]}`]; // Initial calculated step

  // Building the polynomial step by step
  for (let i = 1; i < n; i++) {
    uProduct *= (u + i - 1);
    factorial *= i;
    let term = (uProduct * diffTable[n - 1][i]) / factorial;

    // Adding this term to the interpolated value
    interpolatedValue += term;

    // Formula steps
    stepFormulas.push(`${tr[i]}`);

    // Substituted steps
    let stepMid = [` `];
    for( let ij = 1 ;ij<=i;ij++)
      {
    stepMid.push(` (${u} + ${ij })`);
   }let stepMidString = stepMid.join(' * ');
   
   stepSubstituted.push(`(${u} ${stepMidString}) * ${diffTable[n - 1][i].toFixed(4)}) / ${i}!`);
    
    // Calculated steps
    stepCalculated.push(`${term}`);

    
  }
 
  return {
    interpolatedValue,
    diffTable,
    stepFormulas,
    stepSubstituted,
    stepCalculated
  };
}

