// components/NewtonRaphsonMethod.js
import React, { useState } from 'react';
import nerdamer from 'nerdamer/all.min';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import { BlockMath } from 'react-katex'; // Import react-katex

const NewtonRaphsonMethod = () => {
    
  const [demoInProgress, setDemoInProgress] = useState(false);
    const [expression, setExpression] = useState('-4x + cos(x) + 2');
    const [initialGuess, setInitialGuess] = useState('');
    const [tolerance, setTolerance] = useState(1e-7);
    const [results, setResults] = useState([]);

    const handleDemo = async () => {
        setDemoInProgress(true);
        setExpression("x * x *x - 4*x -9");
        setTolerance(0.0001);
    
        // Wait for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
    
        // Trigger calculation
        document.getElementById("Calculate").click();
    
        setDemoInProgress(false);
      };
    
    const evaluateFunction = (f, x) => {
        try {
            return parseFloat(nerdamer(f, { x }).evaluate().text());
        } catch {
            return null;
        }
    };

    const findInterval = (f, maxRange = 1000, step = 1) => {
        const steps = [];
        let fa, fb, a, b;

        // Search in the positive direction
        a = 0;
        fa = evaluateFunction(f, a);
        if (fa === null) {
            steps.push(`Skipping positive direction due to evaluation error at x = ${a}`);
            return { interval: null, steps };
        } else if (fa === 0) {
            steps.push(`Exact root found at x = ${a}`);
            return { interval: [a, a], steps };
        } else {
            for (let x = a + step; x <= maxRange; x += step) {
                const fx = evaluateFunction(f, x);
                if (fx === null) continue;

                if (fx === 0) {
                    steps.push(`Exact root found at x = ${x}`);
                    return { interval: [x, x], steps };
                }

                if (fa * fx < 0) {
                    b = x;
                    fb = fx;
                    steps.push(`Sign change detected between x = ${a} and x = ${b}`);
                    return { interval: [a, b], steps };
                }

                // Update for next iteration
                a = x;
                fa = fx;
            }
        }

        // If no interval found in positive direction, search in negative direction
        steps.push(`No valid interval found in positive direction up to x = ${maxRange}. Searching in negative direction.`);

        // Reset for negative search
        a = 0;
        fa = evaluateFunction(f, a);
        if (fa === null) {
            steps.push(`Skipping negative direction due to evaluation error at x = ${a}`);
            return { interval: null, steps };
        } else if (fa === 0) {
            steps.push(`Exact root found at x = ${a}`);
            return { interval: [a, a], steps };
        } else {
            for (let x = a - step; x >= -maxRange; x -= step) {
                const fx = evaluateFunction(f, x);
                if (fx === null) continue;

                if (fx === 0) {
                    steps.push(`Exact root found at x = ${x}`);
                    return { interval: [x, x], steps };
                }

                if (fa * fx < 0) {
                    b = x;
                    fb = fx;
                    steps.push(`Sign change detected between x = ${a} and x = ${b}`);
                    return { interval: [b, a], steps }; // Ensure a < b
                }

                // Update for next iteration
                a = x;
                fa = fx;
            }
        }

        // If no interval found in both directions
        steps.push(`No valid interval found in both positive and negative directions within the range [-${maxRange}, ${maxRange}].`);
        return { interval: null, steps };
    };

    const newtonRaphson = (expr, initialGuess, tolerance, maxIterations = 100) => {
        const derivative = nerdamer(`diff(${expr}, x)`).toString();
        const f = (x) => evaluateFunction(expr, x);
        const fPrime = (x) => evaluateFunction(derivative, x);

        let x = initialGuess;
        let iterations = 0;
        const output = [];

        output.push(`Initial guess: x = ${x}`);
        output.push(`Input expression: ${expr}`);
        output.push(`Its derivative: ${derivative}`);

        while (iterations < maxIterations) {
            const fx = f(x);
            const fpx = fPrime(x);

            if (fpx === 0) {
                output.push('Derivative is zero. No solution found.');
                break;
            }
            const exp = expression.replace(/x/g, `(${fx})`);
            const der = derivative.replace(/x/g, `(${fpx})`);


            const nextX = x - fx / fpx;
            output.push(`Iteration ${iterations + 1}:`);
            output.push(`  x = ${x}`);
            output.push(`  f(x) = ${fx}`);
            output.push(`  f'(x) = ${fpx}`);
            output.push(`  x_n+1 = x_n + \\frac{${exp}}{${der}}= ${x} + \\frac{${fx}}{${fpx}}= ${nextX}`);

            // Store the results for the table
            output.push({
                iteration: iterations + 1,
                x: x,
                fx: fx,
                fpx: fpx,
                nextX: nextX,
            });

            if (Math.abs(nextX - x) < tolerance) {
                output.push(`Root found at x = ${nextX} after ${iterations + 1} iterations.`);
                break;
            }

            x = nextX;
            iterations++;
        }

        if (iterations === maxIterations) {
            output.push('Max iterations reached. No solution found.');
        }

        setResults(output);
    };

    const handleCalculateRoot = () => {
        if (initialGuess === '') {
            // If no initial guess, find interval first
            const { interval, steps } = findInterval(expression);
            setResults(steps);
            if (interval) {
                const initialGuess = (interval[0] + interval[1]) / 2; // Use midpoint of the found interval
                newtonRaphson(expression, initialGuess, tolerance);
            } else {
                setResults(prevResults => [...prevResults, 'No valid interval found.']);
            }
        } else {
            // Proceed with user-provided initial guess
            newtonRaphson(expression, parseFloat(initialGuess), tolerance);
        }
    };

    return (
        <div>
            <h1>Newton-Raphson Method</h1>
            <label htmlFor="function">Function (in terms of x):</label>
            <input
                type="text"
                id="function"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., cos(x) * sin(x)"
                required
            />
            <br />
            <label htmlFor="initialGuess">Initial Guess (optional):</label>
            <input
                type="number"
                id="initialGuess"
                value={initialGuess}
                onChange={(e) => setInitialGuess(e.target.value)}
                placeholder="e.g., 1.0"
            />
            <br />
            <label htmlFor="tolerance">Error Margin (tolerance):</label>
            <input
                type="number"
                id="tolerance"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                placeholder="e.g., 1e-7"
                required
            />
            <button onClick={handleCalculateRoot}>Calculate Root</button>

            {results.length > 0 && (
                <div className="my-6 md:mx-[8rem] overflow-x-auto">
                    <h2 className="text-xl inline-block font-semibold">Newton-Raphson Method Iterations:</h2>
                    <table className="w-full table-auto mt-4 border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2">Iteration</th>
                                <th className="border border-gray-300 p-2">x</th>
                                <th className="border border-gray-300 p-2">f(x)</th>
                                <th className="border border-gray-300 p-2">f&apos;(x)</th>
                                <th className="border border-gray-300 p-2">x_n+1</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.filter(result => typeof result === 'object').map((result, index) => (
                                <tr key={index} className={index === results.length - 1 ? 'bg-red-700 text-white' : ''}>
                                    <td className="border border-gray-300 p-2">{result.iteration}</td>
                                    <td className="border border-gray-300 p-2">{result.x.toFixed(6)}</td>
                                    <td className="border border-gray-300 p-2">{result.fx.toFixed(6)}</td>
                                    <td className="border border-gray-300 p-2">{result.fpx.toFixed(6)}</td>
                                    <td className="border border-gray-300 p-2">{result.nextX.toFixed(6)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4">
                        {results.filter(result => typeof result === 'string').map((msg, index) => (
                            <BlockMath key={index} math={msg} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewtonRaphsonMethod;
