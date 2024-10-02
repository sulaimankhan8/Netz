import React, { useState } from 'react';
import Chart from 'chart.js/auto'; // Ensure you have the Chart.js library installed
import { Line } from 'react-chartjs-2';
import TButton from '../components/TButton';


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
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const handleInputChange = (index, field, value) => {
    const newEquations = [...equations];
    newEquations[index][field] = parseFloat(value);
    setEquations(newEquations);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

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

    setResults(iterations);
    setIterationDetails(generateIterationDetails(iterations));
    updateChartData(iterations);
  };

  const generateIterationDetails = (iterations) => {
    let details = '';
    iterations.forEach(({ iteration, x, y, z }) => {
      details += `Iteration ${iteration}: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}<br>`;
    });
    return details;
  };

  const updateChartData = (iterations) => {
    const labels = iterations.map(({ iteration }) => iteration);
    const xValues = iterations.map(({ x }) => x);
    const yValues = iterations.map(({ y }) => y);
    const zValues = iterations.map(({ z }) => z);

    setChartData({
      labels,
      datasets: [
        {
          label: 'x',
          data: xValues,
          borderColor: 'rgba(153, 5, 138, 1)',
          fill: false,
        },
        {
          label: 'y',
          data: yValues,
          borderColor: 'rgba(255, 99, 132, 1)',
          fill: false,
        },
        {
          label: 'z',
          data: zValues,
          borderColor: 'rgba(245, 167, 66, 1)',
          fill: false,
        },
      ],
    });
  };

  const handleDemo = () => {
    
      setEquations([
        { a: 10, b: 2, c: 1, constant: 27 },
        { a: 3, b: 8, c: 2, constant: 45 },
        { a: 1, b: -1, c: 5, constant: 13 },
      ]);
  
    setError(0.0001);
    document.getElementById("Calculate").click();
  };

  const handleReset = () => {
    setEquations([{ a: 0, b: 0, c: 0, constant: 0 }, { a: 0, b: 0, c: 0, constant: 0 }, { a: 0, b: 0, c: 0, constant: 0 }]);
    setError(0.0001);
    setResults([]);
    setIterationDetails('');
    setChartData({ labels: [], datasets: [] });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
     
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
        <table className="w-full m-auto table-auto md:ml-[15%] md:table-fixed p-4 shadow-md">
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
                  <label>a{`${index + 1}`}</label>
                  <input
                    type="number"
                    value={equation.a}
                    onChange={(e) => handleInputChange(index, 'a', e.target.value)}
                    placeholder="a"
                    className="w-[50%] p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <label>b{`${index + 1}`}</label>
                  <input
                    type="number"
                    value={equation.b}
                    onChange={(e) => handleInputChange(index, 'b', e.target.value)}
                    placeholder="b"
                    className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <label>c{`${index + 1}`}</label>
                  <input
                    type="number"
                    value={equation.c}
                    onChange={(e) => handleInputChange(index, 'c', e.target.value)}
                    placeholder="c"
                    className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <label>constants</label>
                  <input
                    type="number"
                    step="any"
                    value={equation.constant}
                    onChange={(e) => handleInputChange(index, 'constant', e.target.value)}
                    placeholder="Constant"
                    className="w-full p-2 text-black dark:bg-neutral-800 dark:text-white dark:border-gray-600 rounded-md hover:border hover:border-neutral-300"
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
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      )}
    </div>
  );
};

function calculateGaussSeidel(equations, error) {
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

    const iterationDetails = generateIterationDetails(iterations);
    const chartData = updateChartData(iterations);

    return { results: iterations, iterationDetails, chartData };
  };

  const generateIterationDetails = (iterations) => {
    let details = '';
    iterations.forEach(({ iteration, x, y, z }) => {
      details += `Iteration ${iteration}: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}<br>`;
    });
    return details;
  };


export default GaussSeidel;
