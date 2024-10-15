'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,  
} from 'chart.js';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale
);

// Function to parse input and replace with corresponding JavaScript Math functions
const parseFunctionInput = (input) => {
  return input
    .replace(/\bsin\(/g, 'Math.sin(')
    .replace(/\bcos\(/g, 'Math.cos(')
    .replace(/\btan\(/g, 'Math.tan(')
    .replace(/\bcot\(/g, 'cot(')
    .replace(/\bsec\(/g, 'sec(')
    .replace(/\bcosec\(/g, 'cosec(')
    .replace(/\blog\(/g, 'log(');
};

// Custom math functions
const cot = (x) => 1 / Math.tan(x);
const sec = (x) => 1 / Math.cos(x);
const cosec = (x) => 1 / Math.sin(x);
const log = (x) => Math.log10(x);

const Plot = ({ iterations, functionInput, darkTheme }) => {
  // Parsing the input function
  const parsedFunctionInput = parseFunctionInput(functionInput);

  // Define the function g using eval (caution needed)
  const g = (x) => {
    try {
      return eval(parsedFunctionInput); // Evaluates the parsed function
    } catch {
      return NaN;
    }
  };

  // Generate x values for the graph
  const minX = Math.min(...iterations.map(step => step.x_n), ...iterations.map(step => step.x_next)) - 1;
  const maxX = Math.max(...iterations.map(step => step.x_n), ...iterations.map(step => step.x_next)) + 1;
  const stepSize = (maxX - minX) / 1000;
  const xValues = [];
  const gValues = [];
  const yEqualsX = [];

  for (let x = minX; x <= maxX; x += stepSize) {
    xValues.push(x);
    try {
      gValues.push(g(x));
    } catch {
      gValues.push(NaN);
    }
    yEqualsX.push(x);
  }

  const data = {
    labels: xValues,
    datasets: [
      {
        label: 'g(x)',
        data: gValues,
        borderColor: 'rgba(153, 102, 255, 1)',
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'y = x',
        data: yEqualsX,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
          color: darkTheme ? '#f3f4f6' : '#000000',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: (${context.parsed.x.toFixed(6)}, ${context.parsed.y.toFixed(6)})`;
          }
        }
      },
     
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'x',
          color: darkTheme ? '#f3f4f6' : '#000000',
          font: {
            size: 16,
          },
        },
        ticks: {
          color: darkTheme ? '#f3f4f6' : '#000000',
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'y',
          color: darkTheme ? '#f3f4f6' : '#000000',
          font: {
            size: 16,
          },
        },
        ticks: {
          color: darkTheme ? '#f3f4f6' : '#000000',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="plot-container" style={{ height: '500px', width: '100%' }}>
      <Line id="graphCanvas" data={data} options={options} />
    </div>
  );
};

export default Plot;
