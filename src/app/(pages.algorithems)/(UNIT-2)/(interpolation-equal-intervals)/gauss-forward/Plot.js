import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Correctly define the Plot component
const Plot = ({ points, xRange, darkTheme, func, helpfunc }) => {
  // Calculate interpolated values
  const interpolatedData = xRange.map(x => {
    const mid = helpfunc(points, x); // Calculate the midpoint for the current x
    return func(points, x, mid).interpolatedValue; // Get the interpolated value
  });

  // Data for the chart
  const data = {
    labels: points.map(point => point.x),
    datasets: [
      {
        label: 'Original Data',
        data: points.map(point => ({ x: point.x, y: point.y })),
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.5)',
        fill: true,
        pointRadius: 5,
      },
      {
        label: 'Interpolated Polynomial',
        data: xRange.map((x, index) => ({ x, y: interpolatedData[index] })),
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        fill: false,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 15, // Set font size for the legend
          },
          color: darkTheme ? 'gray' : 'black',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw.y.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X Values',
          color: darkTheme ? '#f3f4f6' : 'black',
          font: {
            size: 15, // Set font size for the title
          },
        },
        ticks: {
          color: darkTheme ? '#f3f4f6' : 'black',
          font: {
            size: 15, // Set font size for the ticks
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Y Values',
          color: darkTheme ? '#f3f4f6' : 'black',
          font: {
            size: 15, // Set font size for the title
          },
        },
        ticks: {
          color: darkTheme ? '#f3f4f6' : 'black',
          font: {
            size: 15, // Set font size for the ticks
          },
        },
      },
    },
  };

  return (
    <div className="plot-container">
      <Line id="graphCanvas" data={data} options={options} />
    </div>
  );
};

export default Plot;
