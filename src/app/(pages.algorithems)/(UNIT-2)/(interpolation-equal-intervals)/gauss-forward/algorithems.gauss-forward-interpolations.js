"use client";
import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import Plot from "./Plot";
import TButton from "../../../../components/TButton";
import ExportToPNG from "@/app/utils/ExportToPNG";

export default function GaussForwardInterpolation({ theme }) {
  const [vSteps, setVSteps] = useState([]);
  const [xRange, setXRange] = useState(Array.from({ length: 100 }, (_, i) => i));
  const [inline, setInline] = useState(false);
  const [rows, setRows] = useState([{ x: "0", y: "0" }]);
  const [interpolateX, setInterpolateX] = useState("");
  const [output, setOutput] = useState("");
  const [diffTable, setDiffTable] = useState([]);
  const [mid, setMid] = useState(0);
  const [interpolatedValue, setInterpolatedValue] = useState(0);
  const [polynomialSteps, setPolynomialSteps] = useState({
    formulas: [],
    substituted: [],
    calculated: [],
    final: "",
  });
  const [demoInProgress, setDemoInProgress] = useState(false);

  if (typeof window !== "undefined") {
    let keysDown = {};
    window.onkeydown = function(e) {
      keysDown[e.key] = true;
    
      if (keysDown["Control"] &&  keysDown["c"]) {
        //do what you want when control and a is pressed for example
        handleAddRow();
      }
    }
    
    window.onkeyup = function(e) {
      keysDown[e.key] = false;
    }
  }
  const handleAddRow = () => {
    setRows([...rows, { x: "", y: "" }]);

  };
  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.length > 1 ? rows.filter((_, i) => i !== index) : [{ x: "", y: "" }];
    setRows(newRows);
  };
  const xValues = rows.map((row) => parseFloat(row.x));


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
    const midp=midPoint(points,x);
    setMid(midp);
    
    
    const {
      interpolatedValue,
      diffTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps,
    } = gaussianFowardInterpolation(points, x ,midp);  

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
    setInterpolatedValue(interpolatedValue);
  };

  const handleDemo = async () => {
    const demoX = [2.5, 3,3.5, 4,4.5,5];
    const demoY = [24.145, 22.043, 20.225, 18.644,17.262 ,16.047];
    const demoInterpolateX = 3.75;

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

    handleSubmit({ preventDefault: () => {} });
    document.getElementById("interpolateButton").click();
    setDemoInProgress(false);
  };

  return (
    <div className="container mx-auto md:p-8 transition-all duration-300 dark:bg-neutral-700 dark:text-white">
      <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
        <h1 className="text-2xl font-bold">Gauss Forward Interpolation Calculator</h1>
        <TButton
          tooltipText="Demo"
          onClick={handleDemo}
          className={`bg-purple-700 ${demoInProgress ? "opacity-50 cursor-not-allowed" : ""} hover:bg-purple-400`}
          color="violet"
          altText={demoInProgress ? "Demo Running..." : "Demo"}
        />
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
          tooltipText="add&nbsp;row&nbsp;(Ctrl+C)"
          onClick={handleAddRow}
          imgSrc="/add-row-below.svg"
          altText="add row"
          color="blue"
          className="text-lg"
        />
        <div className="space-y-2 shadow-lg border p-2 rounded-xl">
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
      {output && (
      <div className="mt-4 p-4 border rounded shadow-md bg-gray-100 dark:bg-neutral-800">
        <h3 className="font-bold">Output:</h3>
        <p>{output}</p>
      </div>
    )}
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
          <Plot   points={rows.map(row => ({ x: parseFloat(row.x), y: parseFloat(row.y) }))} 
  xRange={xRange} 
  darkTheme={theme} 
  func={gaussianFowardInterpolation}
  helpfunc={midPoint} />
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
                <th className="border border-gray-300 p-2">p</th>
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
                    xValues[rowIndex]-mid ===  0 ? "bg-red-500" : ""
                  }
                >
                  <td className="border border-gray-300 p-2">
                    {xValues[rowIndex]}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {xValues[rowIndex]-mid}
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
          <div className=" py-4"><h2 className="text-xl font-semibold inline-block ">p Calculation Steps</h2>
           <div className="inline-block float-right  flex flex-row" >
            <ExportToPNG 
           elementId="steps"
           fileName="steps.png"
          tooltipText="Export&nbsp;Polynomial Steps&nbsp;to&nbsp;PNG" 
          color="blue" 
          altText="Export&nbsp;steps" 
          className="inline " 
          
           float="float" />
     

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
            <h2 className="text-xl font-semibold inline-block">Polynomial Steps</h2>
            <TButton
      onClick={() =>
        setInline(prev => !prev)}

         float="float-right"
          className=" inline-block "
          altText="Inline"
            tooltipText="Inline&nbsp;or&nbsp;Block"
          color="red"
/>
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
function gaussianFowardInterpolation(points, x ,mid) {
    const tr = [
        `y_0`,
        `\\frac{p}{1!} \\Delta y_0`,
        `\\frac{p(p-1)}{2!} \\Delta^2 y_{-1}`,
        `\\frac{(p+1)p(p-1)}{3!} \\Delta^3 y_{-1}`,
        `\\frac{(p+1)p(p-1)(p-2)}{4!} \\Delta^4 y_{-2}`,
        `\\frac{(p+2)(p+1)p(p-1)(p-2)}{5!} \\Delta^5 y_{-2}`,
        `\\frac{(p+2)(p+1)p(p-1)(p-2)(p-3)}{6!} \\Delta^6 y_{-3}`,
        `\\frac{(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)}{7!} \\Delta^7 y_{-3}`,
        `\\frac{(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)(p-4)}{8!} \\Delta^8 y_{-4}`,
        `\\frac{(p+4)(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)(p-4)}{9!} \\Delta^9 y_{-4}`,
        `\\frac{(p+4)(p+3)(p+2)(p+1)p(p-1)(p-2)(p-3)(p-4)(p-5)}{10!} \\Delta^{10} y_{-5}`
    ];

    
   
    const n = points.length;
    const xi = points.map((p) => p.x);
    const yi = points.map((p) => p.y);
    const closestMid = xi.reduce((prev, curr) => (Math.abs(curr - mid) < Math.abs(prev - mid) ? curr : prev));
    const midpoint = xi.indexOf(closestMid);
    const diffTable2 = Array.from({ length: n }, () => Array(n).fill(0));
    const diffTable = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        diffTable2[i][0] = yi[i];
        diffTable[i][0] = yi[i];
      }
    
    for (let j = 1; j < n; j++) {
        let start = 0;
        for (let i = start; i < n - j+start; i++ ) {
          diffTable2[i][j] = (diffTable2[i + 1][j - 1] - diffTable2[i][j - 1]) ;
         
          
        }
      }

    for (let j = 1; j < n; j++) {
        let start = Math.floor(j/2),k=0;
        for (let i = start; i < n - j+start; i++ ,k++) {
          diffTable[i][j] =  diffTable2[k][j];
        }
      }
    
    const h = xi[1] - xi[0];
    let p = (x - mid) / h; 
    
    let interpolatedValue = yi[midpoint]; 
    let uProduct ; 
    let factorial = 1; 

    let stepFormulas = [`P(x) = ${tr[0]}`];
    let stepSubstituted = [`P(${x}) = ${yi[midpoint]}`];
    let stepCalculated = [`P(${x}) = ${yi[midpoint]}`];

    let vSteps = [];
    vSteps.push(`h = x - x_0 = ${h}`);
    vSteps.push(`p = \\frac{(x - x₀)}{ h}`);
    vSteps.push(`p = \\frac{(${x} - ${mid})}{ ${h}}`);
    vSteps.push(`p = ${(x - mid) / h}`);


    for (let i = 1; i < n; i++) {

        if (typeof diffTable[midpoint][i] === 'undefined') {
            break;
        }

        uProduct = p; 
        for (let ij = 2; ij <= i; ij++) {
            if (ij % 2 === 0) {
                uProduct *= p - Math.floor(ij / 2); console.log("ll",uProduct);
            } else {
                uProduct *= p + Math.floor(ij / 2); console.log("ll",uProduct);
            }

        }
        console.log("ll",uProduct);
        
        factorial *= i; 
        console.log("Factorial for step", i, ":", factorial);
        let term = (uProduct * diffTable[midpoint][i]) / factorial;
        console.log("Term for step", i, ":", term);
        interpolatedValue += term;
        console.log("Term for step", i, ":", interpolatedValue);
        stepCalculated.push(`(${term.toFixed(4)})`);
        stepFormulas.push(`${tr[i]}`);

        let stepMid = [` `];
        let stepMidr = [` `];

        for (let ij = 2; ij <= i; ij++) {
            if (ij%2===0){
          stepMid.push(` (${p} - ${Math.floor((ij)/2)})`);}
          else{
          stepMidr.push(` (${p} + ${Math.floor((ij)/2)})`);}
        }

        let stepMidString = stepMid.join(" * ");    
        let stepMidStringr = stepMidr.join(" * ").trim().slice(1); 
        if(stepMidStringr)   
        stepMidStringr +="*";
        stepSubstituted.push(
            `\\frac{(${stepMidStringr}${p} ${stepMidString}) * ${diffTable[midpoint][i].toFixed(4)}}{${factorial}}`
        );
        
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
 
  
  
  function midPoint(points, x) {
    const xi = points.map((p) => p.x);
  
    if (x < xi[0]) {
      console.warn('x is less than the minimum value of xi. Using the first point as the midpoint.');
      return xi[0];
    }
    if (x > xi[xi.length - 1]) {
      console.warn('x is greater than the maximum value of xi. Using the last point as the midpoint.');
      return xi[xi.length - 1];
    }
  
    let p = -1;
    for (let i = xi.length - 1; i >= 0; i--) {
      if (xi[i] <= x) {
        p = i;
        break;
      }
    }
    console.log("Midpoint index:", xi[p]);
    return xi[p];
  }
  const factorial = (n) => {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };