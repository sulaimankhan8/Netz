"use client";
import { useState, useRef } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from "../../(interpolation-equal-intervals)/Plot";
import TButton from "../../../../components/TButton";

import ExportToPNG from "@/app/utils/ExportToPNG";



export default function NewtonDividedDifference({ theme }) {
  const [vSteps, setVSteps] = useState([]);

  const [xRange, setXRange] = useState(Array.from({ length: 100 }, (_, i) => i));

  const [inline, setInline] = useState(false);
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

 let st = '';
  // Function to export table to PNG
 

  const handleAddRow = () => {
    setRows([...rows, { x: "", y: "" }]);
  };

  const handleDeleteRow = (index) => {
    if (rows.length === 1) {
      // Clear the values of the last row instead of deleting
      setRows([{ x: "", y: "" }]);
    } else {
      // Delete the specified row
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
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
    } = newtonDividedDifference(points, x);

    const minX = Math.min(...xValues) - 5;
    const maxX = Math.max(...xValues) + 5;
    setXRange(Array.from({ length: 100 }, (_, i) => minX + i * (maxX - minX) / 99));



    setVSteps(vSteps);
    setDiffTable(diffTable);
    setPolynomialSteps({
      formulas: stepFormulas,
      substituted: stepSubstituted,
      calculated: stepCalculated,
      final: `Interpolated value at x = ${x}: f(${x}) = ${interpolatedValue}`,
    });
    setOutput(`Interpolated value at x = ${x}: f(${x}) = ${interpolatedValue}`);
  };

  const handleDemo = async () => {
    const demoX = [ 300, 304,305,307];
  const demoY = [ 2.4771,2.4829,2.4843,2.4871];
  const demoInterpolateX = 301;

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
    <div className="container mx-auto md:p-8  transition-all duration-300 dark:bg-neutral-700 dark:text-white">
      <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
        <h1 className="text-2xl font-bold">
        Newton&apos;s Divided Difference Interpolation Calculator
        </h1>


        <TButton

          tooltipText="Demo"
          onClick={handleDemo}
          className={`bg-purple-700 ${demoInProgress ? "opacity-50 cursor-not-allowed" : ""
            } hover:bg-purple-400`}
          color="violet"
          altText={demoInProgress ? "Demo Running..." : "Demo"}
        ></TButton>

      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
      <table className="w-[80%] m-auto table-auto md:ml-[15%] md:table-fixed   p-4 shadow-md ">
          <thead>
            <tr >
              <th className="border border-gray-300 p-2">X Value</th>

              <th className="border border-gray-300z p-2">Y Value</th>
              <th className="w-[100px]"></th>
            </tr>
          </thead>
          <tbody >
            {rows.map((row, index) => (
              <tr key={index} className="md:w-[80%]"> 
                <td className="border border-gray-300 p-2 ">
                  <input
                    type="number"
                    step="any"
                    placeholder="x.xxxx"
                    className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600  rounded-md hover:border hover:border-neutral-300"
                    value={row.x != null ? row.x : 0}
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
                    placeholder="y.yyyy"
                    className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600  rounded-md hover:border hover:border-neutral-300"
                    value={row.y != null ? row.y : 0}

                    onChange={(e) =>
                      handleInputChange(index, "y", e.target.value)
                    }
                    required
                  />
                </td>
                <td className=" p-2  flex justify-center w-[80px]">

                  <TButton
                    imgSrc="/delete.svg"
                    altText="Delete"
                    onClick={() => handleDeleteRow(index)}
                    tooltipText="Delete"
                    color="red"
                    className=" "

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
          color="blue"
          className="text-lg"
        />
        <div className="space-y-2 shadow-lg border p-2">
          <label htmlFor="interpolateX" className="font-bold">Interpolate at X:</label>
          <input
            type="number"
            step="any"
            placeholder="0.00000"
            id="interpolateX"
            className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 "
            value={interpolateX}
            onChange={(e) => setInterpolateX(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          id="interpolateButton"
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 active:bg-opacity-80 text-white px-4 py-2 rounded hover:bg-green-400 bg-green-500 active:bg-green-700 focus:ring-green-700 "
        >
          Interpolate
        </button>

        <TButton
          tooltipText="Reset"
          onClick={handleReset}
          imgSrc="/reset.svg"
          altText="Reset"
          className="float-right "
          color="red"
          float="float-right"
        />


      </form>
      {xRange.length > 0 && (
        <div className="mt-6 mx-auto dark:bg-neutral-600 p-8 rounded-2xl  hover:border hover:border-neutral-300 ">
          <ExportToPNG 
           elementId="graphCanvas"
           fileName="graph.png"
          tooltipText="Export&nbsp;Graph&nbsp;to&nbsp;PNG"
          color="blue"
          
           altText="Export Graph" 
          
           float="float-right" />
          <h2 className="text-xl font-semibold ">Plot:</h2>
          <Plot  points={rows.map(row => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))}
              xRange={xRange} 
              darkTheme={theme}
              func={newtonDividedDifference} />
        </div>
      )}
     


      {diffTable && (<div>
        <ExportToPNG 
           elementId="diffTable"
           fileName="table.png"
          tooltipText="Export&nbsp;Table to&nbsp;PNG"
          color="blue"
           className="overflow-visible "
           altText="Export Table" 
          
           float="float-right" />
        <div id="diffTable" className="mt-6 ml-8  overflow-x-auto dark:bg-neutral-700">
          <div></div><h2 className="text-xl inline-block font-semibold">Difference Table </h2>


          <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">x</th>
                {Array.from({ length: diffTable.length }).map((_, i) =>  (
                    
                      <th key={i} className="border border-gray-300 p-2">
                  { i===0 ? < InlineMath math={`y_0`}/> :
                  < InlineMath math={`${i}^{st} order `}/>}
                  </th>                  
                ))}
              </tr>
            </thead>
            <tbody className="font-thin text-sm">
              {diffTable.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex === 0 ? "bg-red-500" : ""
                  }
                >
                  <td className="border border-gray-300 p-2">
                    {xValues[rowIndex]}
                  </td>

                  {row.map((value, colIndex) => {
                    const stringValue = value.toString(); console.log(value);
                    return (
                    <td key={colIndex} className="border border-gray-300 p-2">
                      {<InlineMath math={stringValue}/> 
                      }
                    </td>
                  );})}
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}





      <div id="steps" className="mt-6 text-wrap dark:bg-neutral-700">
        <div>
          {polynomialSteps.formulas.length > 0 && (
            <div className="mt-6">
              <div>
              <h2 className="text-xl font-semibold inline-block">Polynomial Steps</h2>
              <ExportToPNG 
           elementId="steps"
           fileName="steps.png"
          tooltipText="Export&nbsp;Polynomial Steps&nbsp;to&nbsp;PNG" 
          color="blue" 
          altText="Export&nbsp;steps" 
          className="inline m-3" 
          
           float="float-right" />
     </div>
              <div className="mt-2 p-4 border border-gray-300 rounded-lg">
                <div className="">
                  <h3 className="text-lg font-semibold p-5">Formulas:</h3>

                  {inline ? (
                    <div className="overflow-x-auto break-words overflow-y-visible p-4">
                      <InlineMath math={polynomialSteps.formulas.join(`+ \\displaystyle`)} />
                    </div>

                  ) : (
                    <pre className="overflow-x-auto break-words whitespace-normal">
                      <BlockMath math={polynomialSteps.formulas.join("+")} />
                    </pre>
                  )}
                </div>
                <div className="">
                  <h3 className="text-lg font-semibold p-5">Substituted Values:</h3>
                  {inline ? (
                    <div className="break-words overflow-x-auto overflow-y-visible p-4 ">
                      <InlineMath math={polynomialSteps.substituted.join(" + \\displaystyle")} />
                    </div>
                  ) : (
                    <pre className="break-words whitespace-normal overflow-x-auto p-4">
                      <BlockMath math={polynomialSteps.substituted.join(" + ")} />
                    </pre>
                  )}

                </div>
                <div className="" >
                  <h3 className="text-lg font-semibold p-5">Evaluated Terms:</h3>

                  {inline ? (

                    <div className="break-words overflow-x-auto overflow-y-visible p-4">
                      <InlineMath math={polynomialSteps.calculated.join(` \\displaystyle +`)} />
                    </div>
                  ) : (
                    <pre className="break-words whitespace-normal overflow-x-auto">
                      <BlockMath math={polynomialSteps.calculated.join("+")} />
                    </pre>
                  )}

                </div>
                <div className="overflow-x-auto p-4">
                  <h3 className="text-lg font-semibold p-5">Final Answer:</h3>
                  <p className="font-bold text-lg">{polynomialSteps.final}</p>

                  <br></br>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


function newtonDividedDifference(points, x) {
  // Implementation of Newton Divided Difference interpolation
  const n = points.length;
  const diffTable = new Array(n).fill(0).map(() => new Array(n).fill(0));
  const diffTable2 = new Array(n).fill(0).map(() => new Array(n).fill(0));
  const stepFormulas = [];
  const stepSubstituted = [];
  const stepCalculated = [];

  for (let i = 0; i < n; i++) {
    diffTable[i][0] = points[i].y;
    diffTable2[i][0] = points[i].y;
  }

  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      diffTable2[i][j] = (diffTable2[i + 1][j - 1] - diffTable2[i][j - 1]) / (points[i + j].x - points[i].x);

      diffTable[i][j] = `\\frac{(${diffTable2[i + 1][j - 1].toFixed(4)} - ${diffTable2[i][j - 1].toFixed(4)}) }{(${points[i + j].x.toFixed(2)} - ${points[i].x.toFixed(2)})} = ${diffTable2[i][j].toFixed(4)}`;
    }
  }

  const interpolatedValue = calculateNewtonPolynomial(points, diffTable2, x, stepFormulas, stepSubstituted, stepCalculated);
  return {
    interpolatedValue,
    diffTable,
    stepFormulas,
    stepSubstituted,
    stepCalculated,
    vSteps: [], // Add your steps if needed
  };
}

function calculateNewtonPolynomial(points, diffTable, x, stepFormulas, stepSubstituted, stepCalculated) {
  const n = points.length;
  let result = diffTable[0][0]; // P(0)
  let step='' ;
  let step2=`x_0` ;
  let step3=`` ;
    stepFormulas.push(`f(${x}) = y_0`);
    stepSubstituted.push(`f(${x})= ${diffTable[0][0]}`);
    stepCalculated.push(`f(${x}) =  ${diffTable[0][0]}`);
  let product = 1;
  for (let i = 1; i < n; i++) {
    product = 1;
    for (let j = 0; j < i; j++) {
      product *= (x - points[j].x);
     
    }
    step += `(x - x_${i-1})`;
    step2 += `x_${i}`;
    step3 += `(${x} - ${points[i-1].x})`;
    result += (product * diffTable[0][i]);
    stepFormulas.push(` ${step} f [${step2}]`);
    stepSubstituted.push(`(${step3}*${diffTable[0][i].toFixed(4)}  )`);
    stepCalculated.push(` ${diffTable[0][i].toFixed(4) * product}`);
  }

  return result;
}
