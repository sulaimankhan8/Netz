"use client";
import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from "../components/Plot";
import TButton from "../components/TButton";
import html2canvas from "html2canvas";

export default function NewtonForwardInterpolations({ theme }) {
  const [vSteps, setVSteps] = useState([]);

  const [xRange, setXRange] = useState(Array.from({ length: 100 }, (_, i) => i));
  const [showMessage, setShowMessage] = useState(false);

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
  const exportTableToPNG = () => {
    html2canvas(document.getElementById("diffTable")).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "difference_table.png";
      link.click();
    });
    showCopied();
  };
  // Function to export graph to PNG
  const exportGraphToPNG = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "graph.png";
      link.click();
    }
    showCopied();
  };
  // Function to export polynomial steps to PNG
  const exportPolynomialStepsToPNG = () => {
    
    html2canvas(document.getElementById("steps")).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/svg+xml");
      link.download = "polynomial_steps.png";
      link.click();
    });
    showCopied();
  };
  const showCopied = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };
  const handleAddRow = () => {
    setRows([...rows, { x: "", y: "" }]);
  };
  const handleDeleteRow = (index) => {
    if (rows.length === 1) {
      setRows([{ x: "", y: "" }]);
    } else {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
  };

  const handleInputChange = (index, type, value) => {
    const newRows = [...rows];
    newRows[index][type] = value;
    setRows(newRows);
  };

  const handleReset = () => {
    setRows([{ x: "", y: "" }]);
    setInterpolateX("");
    setOutput("");
    setDiffTable([]);
    setVSteps([]);
    setPolynomialSteps({
      formulas: [],
      substituted: [],
      calculated: [],
      final: "",
    });
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
    } = newtonForwardInterpolation(points, x);

    const minX = Math.min(...xValues) - 5;
    const maxX = Math.max(...xValues) + 5;
    setXRange(
      Array.from({ length: 100 }, (_, i) => minX + i * (maxX - minX) / 99)
    );

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
  const xValues = rows.map((row) => parseFloat(row.x));

  const handleDemo = async () => {
    const demoX = [ 1, 2, 3, 4];
    const demoY = [ 2, 5, 10, 17];
    const demoInterpolateX = 2.5;
  
    setDemoInProgress(true);
  
    // Simulate filling the rows with demo data
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
   
    handleSubmit({ preventDefault: () => {} });
  
    setDemoInProgress(false);
  };
  
  return (
    <div className="container mx-auto md:p-8 transition-all duration-300 dark:bg-neutral-700 dark:text-white">
      <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
        <h1 className="text-2xl font-bold">
          Newton Forward Interpolation Calculator
        </h1>
        <TButton
          tooltipText="Demo"
          onClick={handleDemo}
          className={`bg-purple-700 ${demoInProgress ? "opacity-50 cursor-not-allowed" : ""} hover:bg-purple-400`}
          color="violet"
          altText={demoInProgress ? "Demo Running..." : "Demo"}
        />
      </div>
  
      <form onSubmit={handleSubmit} className="space-y-4">
        <table className="w-full m-auto table-auto md:ml-[15%] md:table-fixed  p-4 shadow-md ">
          <thead>
            <tr >
              <th className="border border-gray-300 p-2">X Value</th>
              <th className="border border-gray-300 p-2">Y Value</th>

            </tr>
          </thead>
          <tbody >
            {rows.map((row, index) => (
              <tr key={index} > 
                <td className="border border-gray-300 p-2 ">
                  <input
                    type="number"
                    step="any"
                    placeholder="x.xxxx"
                    className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600  rounded-md hover:border hover:border-neutral-300"
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
                    placeholder="y.yyyy"
                    className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600  rounded-md hover:border hover:border-neutral-300"
                    value={row.y}
                    onChange={(e) =>
                      handleInputChange(index, "y", e.target.value)
                    }
                    required
                  />
                </td>
                <td className=" p-2 relative flex justify-center w-[80px]">

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
          <TButton onClick={exportGraphToPNG} tooltipText="Export&nbsp;Graph&nbsp;to&nbsp;PNG"
          color="blue"
          
           altText="Export Graph" 
           imgSrc="/copy.svg" 
           float="float-right" />
          <h2 className="text-xl font-semibold ">Plot:</h2>
          <Plot  points={rows.map(row => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))}
              xRange={xRange} 
              darkTheme={theme}
              func={newtonForwardInterpolation} />
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
  
      
      {diffTable.length > 0 && (<div>
        <TButton onClick={exportTableToPNG} tooltipText="Export&nbsp;Table to&nbsp;PNG" color="blue" className="overflow-visible " altText="Export Table" imgSrc="/copy.svg" float="float-right" />


        <div id="diffTable" className="mt-6 ml-8  overflow-x-auto dark:bg-neutral-700">
          <div></div><h2 className="text-xl inline-block font-semibold">Difference Table </h2>


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
                    rowIndex ===  0 ? "bg-red-500" : ""
                  }
                >
                  <td className="border border-gray-300 p-2">
                    {xValues[rowIndex]}
                  </td>

                  {row.map((value, colIndex) => (
  <td key={colIndex + 1} className="border border-gray-300 p-2">
    {value !== undefined
      ? rowIndex === 0 // Check if it's the first row
        ? value.toFixed(4) !== "0.0000"
          ? value.toFixed(4)
          : "0" // Display 0 for the first row if the value is 0
        : value.toFixed(4) !== "0.0000"
        ? value.toFixed(4)
        : ""
      : ""}
  </td>
))}

                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
        
      <div id="steps" className="mt-6 text-wrap dark:bg-neutral-700">
      
      {vSteps.length > 0 && (
        <div className="mt-6 overflow-visible">
          <div className=" py-4"><h2 className="text-xl font-semibold inline-block ">V Calculation Steps</h2> <div className="inline-block float-right" ><TButton onClick={exportPolynomialStepsToPNG} tooltipText="Export&nbsp;Polynomial Steps&nbsp;to&nbsp;PNG" color="blue" altText="Export&nbsp;steps" className="" float="float-right" imgSrc="/copy.svg" />


 <TButton
      onClick={() =>
        setInline(prev => !prev)}

         float="float-right"
          className="mx-1 "
          altText="Inline"
            tooltipText="Inline&nbsp;or&nbsp;Block"
          color="red"
/>
</div></div>

          <div className="mt-2 p-4 border border-gray-300 rounded-lg">

            <pre className="overflow-x-auto">
              <BlockMath math={vSteps.join(",")} />
            </pre>

          </div>
        </div>
      )}



      <div className="space-y-4 ">
        {polynomialSteps.formulas.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Polynomial Steps</h2>
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
// Newton Forward Interpolation Calculation
function newtonForwardInterpolation(points, x) {
  const tr = [
    `y_{0}`,
    `\\frac{v}{1!} \\Delta^{1} y_{0} `,
    `\\frac{v(v-1)}{2!} \\Delta^{2} y_{0}`,
    `\\frac{v(v-1)(v-2)}{3!} \\Delta^{3} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)}{4!} \\Delta^{4} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)}{5!} \\Delta^{5} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)}{6!} \\Delta^{6} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)}{7!} \\Delta^{7} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)(v-7)}{8!} \\Delta^{8} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)(v-7)(v-8)}{9!} \\Delta^{9} y_{0}`,
    `\\frac{v(v-1)(v-2)(v-3)(v-4)(v-5)(v-6)(v-7)(v-8)(v-9)}{10!} \\Delta^{10} y_{0}`
  ];

  const n = points.length;
  const xi = points.map((p) => p.x);
  const yi = points.map((p) => p.y);

  // Initialize the difference table as a 2D array (n x n)
  const diffTable = Array.from({ length: n }, () => Array(n).fill(0));

  // Populate the first column of the difference table with y-values
  for (let i = 0; i < n; i++) {
    diffTable[i][0] = yi[i];
  }

  // Calculate the forward differences for the rest of the table
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      diffTable[i][j] = diffTable[i + 1][j - 1] - diffTable[i][j - 1];
    }
  }

  // Calculate h (the interval size)
  const h = xi[1] - xi[0];
  let v = (x - xi[0]) / h; // Calculate the u-value

  let interpolatedValue = yi[0]; // Start with y_0
  let uProduct = 1; // To hold the product of u terms
  let factorial = 1; // To hold the factorial values

  // Steps for detailed explanation
  let stepFormulas = [`P(x) = ${tr[0]}`];
  let stepSubstituted = [`P(${x}) = ${yi[0]}`];
  let stepCalculated = [`P(${x}) = ${yi[0]}`];

  // Adding steps for calculating 'v'
  let vSteps = [];
  vSteps.push(`h = x₂ - x₁`);
  vSteps.push(`v = \\frac{(x - x₀)}{ h}`);
  vSteps.push(`v = \\frac{(${x} - ${xi[0]})}{ ${h}}`);
  vSteps.push(`v = ${(x - xi[0]) / h}`);

  // Building the polynomial step by step
  for (let i = 1; i < n; i++) {
    uProduct *= v - (i - 1); // Update uProduct for each term
    factorial *= i; // Calculate factorial

    // Calculate the ith term
    let term = (uProduct * diffTable[0][i]) / factorial;
    interpolatedValue += term; // Add the term to the final value

    // Formula steps
    stepFormulas.push(`${tr[i]}`);

    let stepMid = [``];
    for (let ij = 2; ij <= i; ij++) {
      
      stepMid.push(` (${v} - ${ij-1})`);
    }
    let stepMidString = stepMid.join(" * ");

    stepSubstituted.push(
      `\\frac{(${v} ${stepMidString}) * ${diffTable[0][i].toFixed(4)})}{ ${i}!}`
    );
    stepCalculated.push(`(${term.toFixed(4)})`);
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
