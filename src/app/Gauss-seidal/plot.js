import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Plot = ({ iterations, darkTheme }) => {
  const data = {
    labels: iterations.map(({ iteration }) => iteration),
    datasets: [
      {
        label: 'x Values',
        data: iterations.map(({ x }) => x),
        borderColor: 'rgba(153, 5, 138, 1)',
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'y Values',
        data: iterations.map(({ y }) => y),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'z Values',
        data: iterations.map(({ z }) => z),
        borderColor: 'rgba(245, 167, 66, 1)',
        fill: false,
        pointRadius: 5,
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
            size: 15, // Set font size for the legend
          },
          color: darkTheme ? 'gray-800' : 'black',
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
          text: 'Values',
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
    <div className="plot-container" style={{ height: '400px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default Plot;
