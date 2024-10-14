// src/app/(pages.algorithems)/(UNIT-1)/bisection-method/Plot.js

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
  CategoryScale,  // Import CategoryScale
} from 'chart.js';

// Register the required components including CategoryScale
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale // Register the CategoryScale
);

const Plot = ({ iterations, functionInput,  darkTheme}) => {
  // Prepare data for the chart
  const labels = iterations.map((iter) => iter.iteration);
  const dataPoints = iterations.map((iter) => iter.c);

  // Define the function f based on the input
  const f = (x) => eval(functionInput); // Use eval cautiously

  // Generate the x values for the function curve
  const xValues = Array.from({ length: 41 }, (_, i) => (i - 20) * 0.5); // X values from -10 to 10
  const functionValues = xValues.map((x) => f(x)); // Evaluate f for the x values

  const data = {
    labels,
    datasets: [
      {
        label: 'Root Approximations',
        data: dataPoints,
        borderColor: 'rgba(153, 5, 138, 1)',
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'Function Curve',
        data: functionValues,
        borderColor: 'rgba(245, 167, 66, 1)',
        fill: false,
        pointRadius: 0, // Hide points for the function curve if needed
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
            size: 15,
          },
          color: darkTheme ? '#f3f4f6' : '#000000', // Adjust legend color based on theme
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Iteration',
          color: darkTheme ? '#f3f4f6' : '#000000', // Adjust x-axis title color based on theme
          font: {
            size: 15,
          },
        },
        ticks: {
          color: darkTheme ? '#f3f4f6' : '#000000', // Adjust x-axis tick color based on theme
          font: {
            size: 15,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Values',
          color: darkTheme ? '#f3f4f6' : '#000000', // Adjust y-axis title color based on theme
          font: {
            size: 15,
          },
        },
        ticks: {
          color: darkTheme ? '#f3f4f6' : '#000000', // Adjust y-axis tick color based on theme
          font: {
            size: 15,
          },
        },
      },
    },
  };

  return (
    <div className="plot-container" style={{ height: '400px', width: '100%' }}>
     
      <Line id="graphCanvas" data={data} options={options} />
    </div>
  );
};

export default Plot;
