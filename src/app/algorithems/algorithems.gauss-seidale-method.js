import React, { useState } from 'react';

import TButton from '../components/TButton';
import Plot from '../Gauss-seidal/plot';


const GaussSeidel = () => {
  const [equations, setEquations] = useState([
    { a: 4, b: -1, c: 1, constant: 8 },
    { a: -1, b: 3, c: 2, constant: 20 },
    { a: 1, b: -1, c: 3, constant: 8 },
  ]);
  const [demoInProgress,setDemoInProgress] =useState(false)
  const [error, setError] = useState(0.0001);
  const [results, setResults] = useState([]);
  const [iterationDetails, setIterationDetails] = useState('');


  const handleInputChange = (index, field, value) => {
    const newEquations = [...equations];
    newEquations[index][field] = parseFloat(value);
    setEquations(newEquations);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const {iterations} = GaussSeidels(equations,error)

    setResults(iterations);
    setIterationDetails(generateIterationDetails(iterations));
   
  };

  const generateIterationDetails = (iterations) => {
    let details = '';
    iterations.forEach(({ iteration, x, y, z }) => {
      details += `Iteration ${iteration}: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}<br>`;
    });
    return details;
  };


  const handleDemo = async () => {
    setDemoInProgress(true);
      setEquations([
        { a: 10, b: 2, c: 1, constant: 27 },
        { a: 3, b: 8, c: 2, constant: 45 },
        { a: 1, b: -1, c: 5, constant: 13 },
      ]);
  
    setError(0.0001);
    
    await new Promise((resolve) => setTimeout(resolve, 500));
   

    await new Promise((resolve) => setTimeout(resolve, 500));
    document.getElementById("Calculate").click();

    setDemoInProgress(false);
  };

  const handleReset = () => {
    setEquations([{ a: 0, b: 0, c: 0, constant: 0 }, { a: 0, b: 0, c: 0, constant: 0 }, { a: 0, b: 0, c: 0, constant: 0 }]);
    setError(0.0001);
    setResults([]);
    setIterationDetails('');
    
  };

  return (
    <div className="max-w-full mx-auto p-4">
     
      <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Gauss-Seidel Method</h1>


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
        <table className="w-full m-auto table-auto  md:table-fixed p-4 shadow-md">
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
              <tr key={index} >
                <td className="border border-gray-300 p-2">
                 
                  <input
                    type="number"
                    placeholder="a"
                    value={equation.a}
                    onChange={(e) => handleInputChange(index, 'a', e.target.value)}
                    placeholder="a"
                    className="w-[50%] my-5 ml-5 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300 text-right"
                  /> <label className="ml-0 m-5 dark:text-white text-xl font-semibold">x</label>
                </td>
                <td className="border border-gray-300 p-2 ">
                  <label className=" my-5 ml-5  dark:text-white text-xl font-semibold">y</label>
                  <input
                    type="number"
                    value={equation.b}
                    onChange={(e) => handleInputChange(index, 'b', e.target.value)}
                    placeholder="b"
                    className="w-[50%] p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <label className=" my-5 ml-5 dark:text-white text-xl font-semibold">z</label>
                  <input
                    type="number"
                    value={equation.c}
                    onChange={(e) => handleInputChange(index, 'c', e.target.value)}
                    placeholder="c"
                    className="w-[50%] p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="my-5 ml-5 dark:text-white text-2xl font-bold">=</label>
                  <input
                    type="number"
                    step="any"
                    value={equation.constant}
                    onChange={(e) => handleInputChange(index, 'constant', e.target.value)}
                    placeholder="Constant"
                    className="w-[40%] p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="submit"
          id="Calculate"
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 active:bg-opacity-80 text-white px-4 py-2 rounded hover:bg-green-400 bg-green-500 active:bg-green-700 focus:ring-green-700"
        >
          calculate
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
      </form>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Results:</h2>
        <div className="border p-4 rounded" dangerouslySetInnerHTML={{ __html: iterationDetails }} />
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

function GaussSeidels(equations, error) {
    let xPrev = 0, yPrev = 0, zPrev = 0;
    let iterations = [];
    let iterationCount = 0;
    iterations.push({ iteration: 0, x: 0, y: 0, z: 0 });
    while (true) {
      const xNew = (equations[0].constant - (equations[0].b * yPrev) - (equations[0].c * zPrev)) / equations[0].a;
      const yNew = (equations[1].constant - (equations[1].c * zPrev) - (equations[1].a * xNew)) / equations[1].b;
      const zNew = (equations[2].constant - (equations[2].a * xNew) - (equations[2].b * yNew)) / equations[2].c;

      iterations.push({ iteration: iterationCount, x: xNew, y: yNew, z: zNew });

      if (
        Math.abs(xNew - xPrev) < error &&
        Math.abs(yNew - yPrev) < error &&
        Math.abs(zNew - zPrev) < error
      ) {
        break;
      }

      xPrev = xNew;
      yPrev = yNew;
      zPrev = zNew;
      iterationCount++;
    }

    
    

    return {  iterations };
  };

  function generateIterationDetails(iterations)  {
    let details = '';
    iterations.forEach(({ iteration, x, y, z }) => {
      details += `Iteration ${iteration}: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}<br>`;
    });
    return details;
  };


export default GaussSeidel;
