"use client";
import { useState, useRef } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from "../components/Plot";
import TButton from "../components/TButton";
import html2canvas from 'html2canvas';

export default function NewtonBackwardInterpolations() {
  const [vSteps, setVSteps] = useState([]);

  const [xRange, setXRange] = useState([]);

  const [showCopyButton, setShowCopyButton] = useState(false);
  const [rows, setRows] = useState([{ x: "", y: "" }]);
  const [interpolateX, setInterpolateX] = useState("");
  const [output, setOutput] = useState("");
  const [diffTable, setDiffTable] = useState([]);
  const [polynomialSteps, setPolynomialSteps] = useState({
    formulas: [],
    substituted: [],
    calculated: [],
    final: "",
  });
  const [demoInProgress, setDemoInProgress] = useState(false);
  const copyRef = useRef(null);

   // Function to export table to PNG
   const exportTableToPNG = () => {
    html2canvas(document.getElementById('diffTable')).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = 'difference_table.png';
      link.click();
    });
  };

  // Function to export graph to PNG
  const exportGraphToPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = 'graph.png';
      link.click();
    }
  };

  // Function to export polynomial steps to PNG
  const exportPolynomialStepsToPNG = () => {
    html2canvas(document.getElementById('steps')).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = 'polynomial_steps.png';
      link.click();
    });
  };



  const handleAddRow = () => {
    setRows([...rows, { x: "", y: "" }]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };
  const handleInputChange = (index, type, value) => {
    const newRows = [...rows];
    newRows[index][type] = value;
    setRows(newRows);
  };
  const xValues = rows.map((row) => parseFloat(row.x));


  const handleReset = () => {
    // Reset all form inputs and clear output
    setRows([{ x: "", y: "" }]); // Reset table to a single row
    setInterpolateX(""); // Clear the interpolated X input
    setOutput(""); // Clear the output
    setDiffTable([]); // Clear the difference table
    setVSteps([]); // Clear the v calculation steps
    setPolynomialSteps({
      formulas: [],
      substituted: [],
      calculated: [],
      final: "",
    }); // Clear polynomial steps
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const xValues = rows.map((row) => parseFloat(row.x));
    const yValues = rows.map((row) => parseFloat(row.y));
    const x = parseFloat(interpolateX);

    if (xValues.length < 2 || yValues.length < 2) {
      setOutput("Please enter at least two data points.");
      return;
    }

    const points = xValues.map((xi, i) => ({ x: xi, y: yValues[i] }));
    const {
      interpolatedValue,
      diffTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps,
    } = newtonBackwardInterpolation(points, x);

    const minX = Math.min(...xValues) - 5;
    const maxX = Math.max(...xValues) + 5;
    setXRange(Array.from({ length: 100 }, (_, i) => minX + i * (maxX - minX) / 99));


    setShowCopyButton(true);
    setVSteps(vSteps);
    setDiffTable(diffTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `Interpolated value at x = ${x}: P(${x}) = ${interpolatedValue}`,
    });
    setOutput(`Interpolated value at x = ${x}: P(${x}) = ${interpolatedValue}`);
  };

  const handleDemo = async () => {
    const demoX = [24, 28, 32, 36, 40];
    const demoY = [28.06, 30.19, 32.75, 34.94, 40];
    const demoInterpolateX = 33;

    setDemoInProgress(true);

    for (let i = 0; i < demoX.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setRows((prevRows) => {
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

    await new Promise((resolve) => setTimeout(resolve, 500));
    setInterpolateX(demoInterpolateX);

    await new Promise((resolve) => setTimeout(resolve, 500));
    document.getElementById("interpolateButton").click();

    setDemoInProgress(false);
  };
  // Handle the copy to clipboard action
  
  return (
    <div className="container mx-auto md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Newton Backward Interpolation Calculator
        </h1>


        <TButton

          tooltipText="Demo"
          onClick={handleDemo}
          className={`bg-purple-500 ${demoInProgress ? "opacity-50 cursor-not-allowed" : ""
            } hover:bg-purple-400`}
          color="bg-purple-500"
          altText={demoInProgress ? "Demo Running..." : "Demo"}
        ></TButton>

      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <table className="w-full m-auto table-auto border-collapse border-gray-300 lg:w-[90%] ">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">X Value</th>
              <th className="border border-gray-300 p-2">Y Value</th>

            </tr>
          </thead>
          <tbody >
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-300"
                    value={row.x}
                    onChange={(e) =>
                      handleInputChange(index, "x", e.target.value)
                    }
                    required
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-300"
                    value={row.y}
                    onChange={(e) =>
                      handleInputChange(index, "y", e.target.value)
                    }
                    required
                  />
                </td>
                <td className=" p-2 relative flex justify-center md:w-20">

                  <TButton
                    imgSrc="/delete.svg"
                    altText="Delete"
                    onClick={() => handleDeleteRow(index)}
                    tooltipText="Delete"
                    color="#FF0000"
                    className="bg-red-500 hover:bg-red-400"

                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TButton
          tooltipText="add&nbsp;row"
          onClick={handleAddRow}
          imgSrc="/add-row-below.svg"
          altText="add row"
          color="#3b82f6"
          className="text-lg"
        />
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
        <button
          type="submit"
          id="interpolateButton"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
        >
          Interpolate
        </button>

        <TButton
          tooltipText="Reset"
          onClick={handleReset}
          imgSrc="/reset.svg"
          altText="Reset"
          className="float-right "
          color="#FF0000"
          float="float-right"
        />
        {showCopyButton && (
        <div className="flex space-x-2 mb-4">
          <TButton onClick={exportTableToPNG} tooltipText="Export Table to PNG" color="#3b82f6" altText="Export Table" className=""/>
          <TButton onClick={exportGraphToPNG} tooltipText="Export Graph to PNG" color="#3b82f6" altText="Export Graph" className=""/>
          <TButton onClick={exportPolynomialStepsToPNG} tooltipText="Export Polynomial Steps to PNG" color="#3b82f6" altText="Export steps" className=""/>
        </div>
      )}


      </form>

      <div id="messageBox" style={{
        display: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px',
        position: 'fixed',
        bottom: '30px',
        right: '20px',
        borderRadius: '5px'
      }}>
        Steps copied to clipboard!
      </div>

      
      {diffTable.length > 0 && (
        <div id="diffTable" className="mt-6 overflow-x-auto">
          <h2 className="text-xl inline-block font-semibold">Difference Table </h2>
          <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">x</th>
                {Array.from({ length: diffTable.length }).map((_, i) => (
                  <th key={i} className="border border-gray-300 p-2">
                    Δ<sup>{i}</sup>Y
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diffTable.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex === diffTable.length - 1 ? "bg-red-500" : ""
                  }
                >
                  <td className="border border-gray-300 p-2">
                    {xValues[rowIndex]}
                  </td>

                  {row.map((value, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 p-2">
                      {value !== undefined
                        ? value.toFixed(4) !== "0.0000"
                          ? value.toFixed(4)
                          : ""
                        : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {xRange.length > 0 && (
        <div className="mt-6 ">
          <h2 className="text-xl font-semibold">Plot:</h2>
          <Plot points={rows.map(row => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))} xRange={xRange} />
        </div>
      )}

     

      <div  id="steps"   className="mt-6 text-wrap">

      {vSteps.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">V Calculation Steps</h2>
          <div className="mt-2 p-4 border border-gray-300 rounded-lg over">
            <pre className="overflow-x-auto">
              <BlockMath math={vSteps.join(",")} /></pre>
          </div>
        </div>
      )}


        <div className="space-y-4 ">
          {polynomialSteps.formulas.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Polynomial Steps</h2>
              <div className="mt-2 p-4 border border-gray-300 rounded-lg">
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold p-5">Formulas:</h3>
                  <BlockMath math={polynomialSteps.formulas.join(" + ")} />
                </div>
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold p-5">Substituted Values:</h3>
                  <BlockMath math={polynomialSteps.substituted.join(" + ")} />
                </div>
                <div className="overflow-x-auto break-words  whitespace-pre-wrap" >
                  <h3 className="text-lg font-semibold p-5">Evaluated Terms:</h3>
                  <BlockMath math={polynomialSteps.calculated.join(" + \n ")} />
                </div>
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold p-5">Final Answer:</h3>
                  <p className="font-bold text-lg">{polynomialSteps.final}</p>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function newtonBackwardInterpolation(points, x) {
  const tr = [
    `y_{n}`,
    `\\frac{v}{1!} \\Delta^{1} y_{n-1}`,
    `\\frac{v(v+1)}{2!} \\Delta^{2} y_{n-2}`,
    `\\frac{v(v+1)(v+2)}{3!} \\Delta^{3} y_{n-3}`,
    `\\frac{v(v+1)(v+2)(v+3)}{4!} \\Delta^{4} y_{n-4}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)}{5!} \\Delta^{5} y_{n-5}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)}{6!} \\Delta^{6} y_{n-6}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)}{7!} \\Delta^{7} y_{n-7}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)}{8!} \\Delta^{8} y_{n-8}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8)}{9!} \\Delta^{9} y_{n-9}`,
    `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8)(v+9)}{10!} \\Delta^{10} y_{n-10}`
  ];

  const n = points.length;
  const xi = points.map((p) => p.x);
  const yi = points.map((p) => p.y);

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
  const h = xi[1] - xi[0];
  let u = (x - xi[n - 1]) / (xi[1] - xi[0]); // Calculate 'u'
  let interpolatedValue = diffTable[n - 1][0]; // Starting with the last y-value
  console.log(xi);
  let uProduct = 1;
  let factorial = 1;

  let stepFormulas = [`P(x) = ${tr[0]}`]; // Step for polynomial formula
  let stepSubstituted = [`P(${x}) = ${diffTable[n - 1][0]}`]; // Substituted step
  let stepCalculated = [`P(${x}) = ${diffTable[n - 1][0]}`]; // Initial calculated step

  // Adding step for calculating 'v'
  let vSteps = [];
  vSteps.push(`h = x₂ - x₁`);
  vSteps.push(`v =\\frac{(x - x_n)}{ h}`);
  vSteps.push(`v =\\frac{(${x} - ${xi[n - 1]})}{ ${h}}`);

  vSteps.push(`v = ${(x - xi[n - 1]) / h}`);

  // Building the polynomial step by step
  for (let i = 1; i < n; i++) {
    uProduct *= u + i - 1;
    factorial *= i;
    let term = (uProduct * diffTable[n - 1][i]) / factorial;

    // Adding this term to the interpolated value
    interpolatedValue += term;

    // Formula steps
    stepFormulas.push(`${tr[i]}`);

    // Substituted steps
    let stepMid = [` `];
    for (let ij = 1; ij <= i; ij++) {
      stepMid.push(` (${u} + ${ij})`);
    }
    let stepMidString = stepMid.join(" * ");

    stepSubstituted.push(
      `\\frac{(${u} ${stepMidString}) * ${diffTable[n - 1][i].toFixed(4)})}{ ${i}!}`
    );

    // Calculated steps
    stepCalculated.push(`(${term})`);
  }

  return {
    interpolatedValue,
    diffTable,
    stepFormulas,
    stepSubstituted,
    stepCalculated,
    vSteps,
  };
}
