"use client";
import { useState, useRef } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from "../../(interpolation-equal-intervals)/Plot";
import TButton from "../../../../components/TButton";

import ExportToPNG from "@/app/utils/ExportToPNG";



export default function LagrangeInterpolations({ theme }) {
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
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      diffTable
    } = lagrangeInterpolation(points, x);

    const minX = Math.min(...xValues) - 5;
    const maxX = Math.max(...xValues) + 5;
    setXRange(Array.from({ length: 100 }, (_, i) => minX + i * (maxX - minX) / 99));



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
    const demoX = [0,2,3,5,6];
    const demoY = [5,7,8,10,12];
    const demoInterpolateX = 4;

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
        Lagrange Interpolation Method Calculator
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
              func={lagrangeInterpolation} />
        </div>
      )}
     


      {diffTable.length > 0 && (<div>
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
                <th className="border border-gray-300 p-2">y</th>
                
                <th className="border border-gray-300 p-2"><InlineMath math=" L_n(x)"/></th>
                
              </tr>
            </thead>
            <tbody>
              {diffTable.map((row, rowIndex) => (
                <tr key={rowIndex} >
                  <td className="border border-gray-300 p-2">
                    {xValues[rowIndex]}
                  </td>

                  {row.map((value, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 p-2"><InlineMath math={value.toString()}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}





      <div id="steps" className="mt-6 text-wrap dark:bg-neutral-700">
        <div className="space-y-4 ">
          {polynomialSteps.formulas.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold ">Polynomial Steps</h2>
              <div className="grid grid-cols-2 gap-4">
  <div>
    <TButton
      onClick={() => setInline((prev) => !prev)}
      className="m-1 inline-block"
      altText="Inline"
      tooltipText="Inline&nbsp;or&nbsp;Block"
      color="red"
    />
  </div>

  <div className="text-right">
    <ExportToPNG
      elementId="steps"
      fileName="steps.png"
      tooltipText="Export&nbsp;Polynomial Steps&nbsp;to&nbsp;PNG"
      color="blue"
      altText="Export&nbsp;steps"
      className=""
    />
  </div>
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

function lagrangeInterpolation(points, x) {
  const n = points.length;
  let interpolatedValue = 0; // Resulting interpolated value
  const stepFormulas = []; // Step formulas
  const stepSubstituted = []; // Substituted steps
  const stepCalculated = []; // Calculated steps
  stepFormulas.push(`P(${x}) =`);
  stepSubstituted.push(`P(${x}) =`);
  stepCalculated.push(`P(${x}) =`);
  // Build the Lagrange interpolation

  const diffTable = new Array(n).fill(0).map(() => new Array(2).fill(0));
  for (let i = 0; i < n; i++) {
    diffTable[i][0] = points[i].y;
  }
  for (let i = 0; i < n; i++) {
    
    let term = 1; 
    let step1 = ` ${points[i].y}*`;
    let step = ` `;
    let step2 = ` `;
    let formula =`y_${i}`;
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        term *= (x - points[j].x) / (points[i].x - points[j].x); 
        step += `  \\frac{(${x} - ${points[j].x})}{(${points[i].x} - ${points[j].x})}`; 
        formula +=`* \\frac{(x - x_${j})}{x_${i} - x_${j}}`;
      }
    }
   step1 += step;
   step2 += step;
    interpolatedValue += term*points[i].y; // Add to the interpolated value
    stepFormulas.push(formula); // Add the formula step
    stepSubstituted.push(` ${step1}`); // Add the substituted step
    stepCalculated.push(` ${(term*points[i].y).toFixed(4)}`); // Add the calculated step
    
    diffTable[i][1] = `${step2} = ${term.toFixed(4)}`;
  }

  return {
    interpolatedValue: interpolatedValue.toFixed(4), 
    stepFormulas,
    stepSubstituted,
    stepCalculated,
    diffTable
  };
}

