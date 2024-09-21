// Plot.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Plot = ({ points, xRange, darkTheme }) => {
  // Function to perform Newton Backward Interpolation
  const newtonBackwardInterpolation = (points, x ) => {
    const tr = [
      `y_{n}`,
      `\\frac{v}{1!} \\Delta^{1} y_{n-1}`,
      `\\frac{v(v+1)}{2!} \\Delta^{2} y_{n-2}`,
      `\\frac{v(v+1)(v+2)}{3!} \\Delta^{3} y_{n-3}`,
      `\\frac{v(v+1)(v+2)(v+3)}{4!} \\Delta^{4} y_{n-4}`,
      `\\frac{v(v+1)(v+2)(v+3)(v+4)}{5!} \\Delta^{5} y_{n-5}`,
      `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)}{6!} \\Delta^{6} y_{n-6}`,
      `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)}{7!} \\Delta^{7} y_{n-7}`,
      `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)}{8!} \\Delta^{8} y_{n-8}`,
      `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8)}{9!} \\Delta^{9} y_{n-9}`,
      `\\frac{v(v+1)(v+2)(v+3)(v+4)(v+5)(v+6)(v+7)(v+8)(v+9)}{10!} \\Delta^{10} y_{n-10}`
    ];

    const n = points.length;
    const xi = points.map(p => p.x);
    const yi = points.map(p => p.y);

    let diffTable = Array.from({ length: n }, (_, i) => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      diffTable[i][0] = yi[i];
    }

    // Building the difference table
    for (let j = 1; j < n; j++) {
      for (let i = n - 1; i >= j; i--) {
        diffTable[i][j] = diffTable[i][j - 1] - diffTable[i - 1][j - 1];
      }
    }
    const h = xi[1] - xi[0];
    let u = (x - xi[n - 1]) / h; // Calculate 'u'
    let interpolatedValue = diffTable[n - 1][0]; // Starting with the last y-value
    let uProduct = 1;
    let factorial = 1;

    // Steps for polynomial
    let stepFormulas = [`P(x) = ${tr[0]}`];
    let stepSubstituted = [`P(${x}) = ${diffTable[n - 1][0]}`];
    let stepCalculated = [`P(${x}) = ${diffTable[n - 1][0]}`];

    // Steps for calculating 'v'
    let vSteps = [];
    vSteps.push(`h = x₂ - x₁`);
    vSteps.push(`v =\\frac{(x - x_n)}{ h}`);
    vSteps.push(`v =\\frac{(${x} - ${xi[n - 1]})}{ ${h}}`);
    vSteps.push(`v = ${(x - xi[n - 1]) / h}`);

    // Building the polynomial step by step
    for (let i = 1; i < n; i++) {
      uProduct *= u + i - 1;
      factorial *= i;
      let term = (uProduct * diffTable[n - 1][i]) / factorial;

      // Adding this term to the interpolated value
      interpolatedValue += term;

      // Formula steps
      stepFormulas.push(`${tr[i]}`);

      // Substituted steps
      let stepMid = [` `];
      for (let ij = 1; ij <= i; ij++) {
        stepMid.push(` (${u} + ${ij})`);
      }
      let stepMidString = stepMid.join(" * ");
      stepSubstituted.push(`\\frac{(${u} ${stepMidString}) * ${diffTable[n - 1][i].toFixed(4)})}{ ${i}!}`);
      // Calculated steps
      stepCalculated.push(`(${term})`);
    }

    return {
      interpolatedValue,
      diffTable,
      stepFormulas,
      stepSubstituted,
      stepCalculated,
      vSteps,
    };
  };

  // Calculate interpolated values
  const interpolatedData = xRange.map(x => newtonBackwardInterpolation(points, x).interpolatedValue);

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
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: '15rem', // Set font size for the legend
          },
          color: darkTheme ? 'gray-800' : 'black',
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw.y.toFixed(4)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'X Values',
          color: darkTheme ? '#f3f4f6' : 'black', // Change color based on theme
          font: {
            size: '15rem', // Set font size for the legend
          },},
        ticks: {
          color: darkTheme ? '#f3f4f6' : 'black', // Change ticks color
          font: {
            size: '15rem', // Set font size for the legend
          },
        }
      },
      y: {
        title: {
          display: true,
          text: 'Y Values',
          color: darkTheme ? '#f3f4f6' : 'black', // Change color based on theme
          font: {
            size: '15rem', // Set font size for the legend
          },},
        ticks: {
          color: darkTheme ? '#f3f4f6': 'black', // Change ticks color
          font: {
            size: '15rem', // Set font size for the legend
          },}
      }
    }
  };
 


  return (
    <div>
      <Line
        data={data}
        options={options}
        
      />
    </div>
  );
};

export default Plot;
