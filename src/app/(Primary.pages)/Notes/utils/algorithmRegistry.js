import { evaluateMath, parseUserFunction, getSymbolicDerivative, sanitizeMathString } from '../../../utils/evaluateMath';

export function parseNum(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const ALGORITHMS_CATALOG = [
  // UNIT 1: ALGEBRAIC & TRANSCENDENTAL EQUATIONS
  {
    id: 'newton-raphson',
    name: 'Newton-Raphson Method',
    unit: 'Unit 1: Roots of Equations',
    route: '/newton-raphson-method',
    description: 'Finds real roots of f(x) = 0 using symbolic derivatives and quadratic convergence.',
    defaultParams: { expression: 'x^3 - 4*x - 9', x0: 2.5, tolerance: 0.0001 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x^3 - 4*x - 9');
      const derivExpr = getSymbolicDerivative(expr);
      let currentX = parseNum(params.x0, 2.5);
      const tol = parseNum(params.tolerance, 0.0001);
      const steps = [];

      for (let i = 0; i < 8; i++) {
        const fx = evaluateMath(expr, { x: currentX });
        const dfx = evaluateMath(derivExpr, { x: currentX });
        if (Math.abs(dfx) < 1e-12) break;
        const nextX = currentX - fx / dfx;
        steps.push({
          iter: i + 1,
          x: currentX.toFixed(6),
          fx: fx.toFixed(6),
          dfx: dfx.toFixed(6),
          nextX: nextX.toFixed(6)
        });
        if (Math.abs(nextX - currentX) < tol) {
          currentX = nextX;
          break;
        }
        currentX = nextX;
      }
      return { result: `Root x ≈ ${currentX.toFixed(6)}`, steps, headers: ['Iter', 'x_n', 'f(x_n)', 'x_(n+1)'] };
    }
  },
  {
    id: 'bisection',
    name: 'Bisection Method',
    unit: 'Unit 1: Roots of Equations',
    route: '/bisection-method',
    description: 'Finds root in interval [a, b] where f(a) and f(b) have opposite signs.',
    defaultParams: { expression: 'x^3 - 4*x - 9', a: 2, b: 3, tolerance: 0.0001 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x^3 - 4*x - 9');
      let a = parseNum(params.a, 2);
      let b = parseNum(params.b, 3);
      const tol = parseNum(params.tolerance, 0.0001);
      const steps = [];
      let c = a;

      for (let i = 0; i < 10; i++) {
        c = (a + b) / 2;
        const fa = evaluateMath(expr, { x: a });
        const fc = evaluateMath(expr, { x: c });
        steps.push({
          iter: i + 1,
          a: a.toFixed(4),
          b: b.toFixed(4),
          c: c.toFixed(6),
          fc: fc.toFixed(6)
        });
        if (Math.abs(fc) < tol || Math.abs(b - a) < tol) break;
        if (fa * fc < 0) b = c;
        else a = c;
      }
      return { result: `Root x ≈ ${c.toFixed(6)}`, steps, headers: ['Iter', 'a', 'b', 'Mid c', 'f(c)'] };
    }
  },
  {
    id: 'false-position',
    name: 'Regula Falsi (False Position)',
    unit: 'Unit 1: Roots of Equations',
    route: '/false-position-method',
    description: 'Secant line interpolation method to find roots within interval [a, b].',
    defaultParams: { expression: 'x^3 - 4*x - 9', a: 2, b: 3, tolerance: 0.0001 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x^3 - 4*x - 9');
      let a = parseNum(params.a, 2);
      let b = parseNum(params.b, 3);
      let c = a;
      const steps = [];

      for (let i = 0; i < 8; i++) {
        const fa = evaluateMath(expr, { x: a });
        const fb = evaluateMath(expr, { x: b });
        c = (a * fb - b * fa) / (fb - fa);
        const fc = evaluateMath(expr, { x: c });
        steps.push({
          iter: i + 1,
          a: a.toFixed(4),
          b: b.toFixed(4),
          c: c.toFixed(6),
          fc: fc.toFixed(6)
        });
        if (Math.abs(fc) < 0.0001) break;
        if (fa * fc < 0) b = c;
        else a = c;
      }
      return { result: `Root x ≈ ${c.toFixed(6)}`, steps, headers: ['Iter', 'a', 'b', 'c', 'f(c)'] };
    }
  },
  {
    id: 'fixed-point',
    name: 'Fixed Point Iteration',
    unit: 'Unit 1: Roots of Equations',
    route: '/iteration-method',
    description: 'Solves x = g(x) iteratively starting from initial guess x0.',
    defaultParams: { expression: '(4*x + 9)^(1/3)', x0: 2.5, maxIter: 6 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || '(4*x + 9)^(1/3)');
      let currentX = parseNum(params.x0, 2.5);
      const steps = [];

      for (let i = 0; i < 6; i++) {
        const nextX = evaluateMath(expr, { x: currentX });
        steps.push({
          iter: i + 1,
          x: currentX.toFixed(6),
          gx: nextX.toFixed(6),
          diff: Math.abs(nextX - currentX).toFixed(6)
        });
        currentX = nextX;
      }
      return { result: `Fixed Point x ≈ ${currentX.toFixed(6)}`, steps, headers: ['Iter', 'x_n', 'g(x_n)', '|x_(n+1) - x_n|'] };
    }
  },

  // UNIT 2: INTERPOLATION & DIFFERENCES
  {
    id: 'newton-forward',
    name: "Newton's Forward Interpolation",
    unit: 'Unit 2: Interpolation',
    route: '/newton-forward',
    description: 'Equal interval interpolation formula using forward difference table Δy for target X near table start.',
    defaultParams: { xValues: '10, 20, 30, 40', yValues: '46, 66, 81, 93', targetX: 15 },
    solve: (params) => {
      const xArr = (params.xValues || '10, 20, 30, 40').split(',').map((v) => parseFloat(v.trim()));
      const yArr = (params.yValues || '46, 66, 81, 93').split(',').map((v) => parseFloat(v.trim()));
      const targetX = parseNum(params.targetX, 15);
      const n = Math.min(xArr.length, yArr.length);
      const h = xArr[1] - xArr[0];
      const u = (targetX - xArr[0]) / h;

      const diff = [yArr.slice(0, n)];
      for (let i = 1; i < n; i++) {
        const row = [];
        for (let j = 0; j < n - i; j++) {
          row.push(diff[i - 1][j + 1] - diff[i - 1][j]);
        }
        diff.push(row);
      }

      let yResult = yArr[0];
      let uTerm = 1;
      let fact = 1;
      const steps = [{ order: 'y0', val: yArr[0].toFixed(4), term: yArr[0].toFixed(4) }];

      for (let i = 1; i < n; i++) {
        uTerm *= (u - (i - 1));
        fact *= i;
        const addVal = (uTerm * diff[i][0]) / fact;
        yResult += addVal;
        steps.push({
          order: `Δ^${i} y0`,
          val: diff[i][0].toFixed(4),
          term: addVal.toFixed(4)
        });
      }

      return {
        result: `Interpolated f(${targetX}) ≈ ${yResult.toFixed(4)} (u = ${u.toFixed(4)})`,
        steps,
        headers: ['Difference Order', 'Difference Value', 'Polynomial Term Contribution']
      };
    }
  },
  {
    id: 'newton-backward',
    name: "Newton's Backward Interpolation",
    unit: 'Unit 2: Interpolation',
    route: '/newton-backward',
    description: 'Equal interval backward difference formula using ∇y for target X near table end.',
    defaultParams: { xValues: '10, 20, 30, 40', yValues: '46, 66, 81, 93', targetX: 38 },
    solve: (params) => {
      const xArr = (params.xValues || '10, 20, 30, 40').split(',').map((v) => parseFloat(v.trim()));
      const yArr = (params.yValues || '46, 66, 81, 93').split(',').map((v) => parseFloat(v.trim()));
      const targetX = parseNum(params.targetX, 38);
      const n = Math.min(xArr.length, yArr.length);
      const h = xArr[1] - xArr[0];
      const v = (targetX - xArr[n - 1]) / h;

      const diff = [yArr.slice(0, n)];
      for (let i = 1; i < n; i++) {
        const row = [];
        for (let j = 0; j < n - i; j++) {
          row.push(diff[i - 1][j + 1] - diff[i - 1][j]);
        }
        diff.push(row);
      }

      let yResult = yArr[n - 1];
      let vTerm = 1;
      let fact = 1;
      const steps = [{ order: 'yn', val: yArr[n - 1].toFixed(4), term: yArr[n - 1].toFixed(4) }];

      for (let i = 1; i < n; i++) {
        vTerm *= (v + (i - 1));
        fact *= i;
        const lastIdx = diff[i].length - 1;
        const addVal = (vTerm * diff[i][lastIdx]) / fact;
        yResult += addVal;
        steps.push({
          order: `∇^${i} yn`,
          val: diff[i][lastIdx].toFixed(4),
          term: addVal.toFixed(4)
        });
      }

      return {
        result: `Interpolated f(${targetX}) ≈ ${yResult.toFixed(4)} (v = ${v.toFixed(4)})`,
        steps,
        headers: ['Difference Order', 'Backward Value', 'Term Contribution']
      };
    }
  },
  {
    id: 'lagrange-interpolation',
    name: "Lagrange's Interpolation Formula",
    unit: 'Unit 2: Interpolation',
    route: '/lagrange-interpolation',
    description: 'Unequal interval polynomial interpolation formula for arbitrary (x_i, y_i) data points.',
    defaultParams: { xValues: '5, 6, 9, 11', yValues: '12, 13, 14, 16', targetX: 10 },
    solve: (params) => {
      const xArr = (params.xValues || '5, 6, 9, 11').split(',').map((v) => parseFloat(v.trim()));
      const yArr = (params.yValues || '12, 13, 14, 16').split(',').map((v) => parseFloat(v.trim()));
      const targetX = parseNum(params.targetX, 10);
      const n = Math.min(xArr.length, yArr.length);
      let totalY = 0;
      const steps = [];

      for (let i = 0; i < n; i++) {
        let term = yArr[i];
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            term *= (targetX - xArr[j]) / (xArr[i] - xArr[j]);
          }
        }
        totalY += term;
        steps.push({
          point: `(${xArr[i]}, ${yArr[i]})`,
          lWeight: (term / yArr[i]).toFixed(6),
          contribution: term.toFixed(6)
        });
      }

      return {
        result: `Lagrange f(${targetX}) ≈ ${totalY.toFixed(6)}`,
        steps,
        headers: ['Data Point (xi, yi)', 'Lagrange Weight L_i(x)', 'Term Contribution']
      };
    }
  },
  {
    id: 'newton-divided',
    name: "Newton's Divided Difference",
    unit: 'Unit 2: Interpolation',
    route: '/newton-divided',
    description: 'Unequal interval divided difference interpolation for arbitrary tabulated points.',
    defaultParams: { xValues: '5, 7, 11, 13', yValues: '150, 392, 1452, 2366', targetX: 9 },
    solve: (params) => {
      const xArr = (params.xValues || '5, 7, 11, 13').split(',').map((v) => parseFloat(v.trim()));
      const yArr = (params.yValues || '150, 392, 1452, 2366').split(',').map((v) => parseFloat(v.trim()));
      const targetX = parseNum(params.targetX, 9);
      const n = Math.min(xArr.length, yArr.length);

      const div = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) div[i][0] = yArr[i];

      for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
          div[i][j] = (div[i + 1][j - 1] - div[i][j - 1]) / (xArr[i + j] - xArr[i]);
        }
      }

      let yResult = div[0][0];
      let product = 1;
      const steps = [{ order: 'f[x0]', val: div[0][0].toFixed(4), term: div[0][0].toFixed(4) }];

      for (let i = 1; i < n; i++) {
        product *= (targetX - xArr[i - 1]);
        const term = product * div[0][i];
        yResult += term;
        steps.push({
          order: `f[x0..x${i}]`,
          val: div[0][i].toFixed(6),
          term: term.toFixed(6)
        });
      }

      return {
        result: `Divided Difference f(${targetX}) ≈ ${yResult.toFixed(4)}`,
        steps,
        headers: ['Order', 'Divided Difference Value', 'Contribution Term']
      };
    }
  },

  // UNIT 3: NUMERICAL INTEGRATION & DIFFERENTIATION
  {
    id: 'trapezoidal',
    name: 'Trapezoidal Integration Rule',
    unit: 'Unit 3: Numerical Integration',
    route: '/trapezoidal-Rule',
    description: 'Approximates definite integral ∫[a,b] f(x) dx using N trapezoidal subintervals.',
    defaultParams: { expression: '1 / (1 + x^2)', a: 0, b: 1, n: 6 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || '1 / (1 + x^2)');
      const a = parseNum(params.a, 0);
      const b = parseNum(params.b, 1);
      const n = parseInt(params.n) || 6;
      const h = (b - a) / n;
      let sum = 0;
      const steps = [];

      for (let i = 0; i <= n; i++) {
        const xi = a + i * h;
        const yi = evaluateMath(expr, { x: xi });
        const weight = i === 0 || i === n ? 1 : 2;
        sum += weight * yi;
        steps.push({ step: i, xi: xi.toFixed(4), yi: yi.toFixed(6), weight });
      }
      const integral = (h / 2) * sum;
      return { result: `Integral ≈ ${integral.toFixed(6)} (h = ${h.toFixed(4)})`, steps, headers: ['i', 'x_i', 'f(x_i)', 'Weight'] };
    }
  },
  {
    id: 'simpson-1-3',
    name: "Simpson's 1/3 Integration Rule",
    unit: 'Unit 3: Numerical Integration',
    route: '/simpson-1-3-Rule',
    description: 'Quadratic parabolic interpolation for integration over even N subintervals.',
    defaultParams: { expression: '1 / (1 + x)', a: 0, b: 1, n: 6 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || '1 / (1 + x)');
      const a = parseNum(params.a, 0);
      const b = parseNum(params.b, 1);
      const n = parseInt(params.n) || 6;
      const h = (b - a) / n;
      let sum = 0;
      const steps = [];

      for (let i = 0; i <= n; i++) {
        const xi = a + i * h;
        const yi = evaluateMath(expr, { x: xi });
        let weight = 2;
        if (i === 0 || i === n) weight = 1;
        else if (i % 2 !== 0) weight = 4;
        sum += weight * yi;
        steps.push({ step: i, xi: xi.toFixed(4), yi: yi.toFixed(6), weight });
      }
      const integral = (h / 3) * sum;
      return { result: `Integral ≈ ${integral.toFixed(6)}`, steps, headers: ['i', 'x_i', 'f(x_i)', 'Weight'] };
    }
  },
  {
    id: 'simpson-3-8',
    name: "Simpson's 3/8 Integration Rule",
    unit: 'Unit 3: Numerical Integration',
    route: '/simpson-3-8-Rule',
    description: 'Cubic interpolation for numerical integration where subintervals N is a multiple of 3.',
    defaultParams: { expression: '1 / (1 + x^2)', a: 0, b: 1, n: 6 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || '1 / (1 + x^2)');
      const a = parseNum(params.a, 0);
      const b = parseNum(params.b, 1);
      const n = parseInt(params.n) || 6;
      const h = (b - a) / n;
      let sum = 0;
      const steps = [];

      for (let i = 0; i <= n; i++) {
        const xi = a + i * h;
        const yi = evaluateMath(expr, { x: xi });
        let weight = 3;
        if (i === 0 || i === n) weight = 1;
        else if (i % 3 === 0) weight = 2;
        sum += weight * yi;
        steps.push({ step: i, xi: xi.toFixed(4), yi: yi.toFixed(6), weight });
      }
      const integral = ((3 * h) / 8) * sum;
      return { result: `Integral ≈ ${integral.toFixed(6)}`, steps, headers: ['i', 'x_i', 'f(x_i)', 'Weight'] };
    }
  },

  // UNIT 4: DIFFERENTIAL EQUATIONS (ODEs)
  {
    id: 'euler',
    name: "Euler's ODE Method",
    unit: 'Unit 4: Differential Equations',
    route: '/euler-s-method',
    description: 'Solves first order ODE dy/dx = f(x, y) starting at (x0, y0) with step size h.',
    defaultParams: { expression: 'x + y', x0: 0, y0: 1, h: 0.1, targetX: 0.5 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x + y');
      let currX = parseNum(params.x0, 0);
      let currY = parseNum(params.y0, 1);
      const h = parseNum(params.h, 0.1);
      const targetX = parseNum(params.targetX, 0.5);
      const steps = [];
      let stepIdx = 0;

      while (currX < targetX - 1e-9 && stepIdx < 10) {
        const slope = evaluateMath(expr, { x: currX, y: currY });
        const nextY = currY + h * slope;
        steps.push({
          step: stepIdx + 1,
          x: currX.toFixed(2),
          y: currY.toFixed(4),
          slope: slope.toFixed(4),
          nextY: nextY.toFixed(4)
        });
        currX += h;
        currY = nextY;
        stepIdx++;
      }
      return { result: `y(${currX.toFixed(2)}) ≈ ${currY.toFixed(4)}`, steps, headers: ['Step', 'x_n', 'y_n', 'f(x_n,y_n)', 'y_(n+1)'] };
    }
  },
  {
    id: 'rk4',
    name: 'Runge-Kutta 4th Order (RK4)',
    unit: 'Unit 4: Differential Equations',
    route: '/runge-kutta-method',
    description: 'High accuracy 4th order numerical solution for initial value differential equation dy/dx = f(x, y).',
    defaultParams: { expression: 'x + y', x0: 0, y0: 1, h: 0.1, targetX: 0.2 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x + y');
      let currX = parseNum(params.x0, 0);
      let currY = parseNum(params.y0, 1);
      const h = parseNum(params.h, 0.1);
      const targetX = parseNum(params.targetX, 0.2);
      const steps = [];
      let stepIdx = 0;

      while (currX < targetX - 1e-9 && stepIdx < 5) {
        const k1 = h * evaluateMath(expr, { x: currX, y: currY });
        const k2 = h * evaluateMath(expr, { x: currX + h / 2, y: currY + k1 / 2 });
        const k3 = h * evaluateMath(expr, { x: currX + h / 2, y: currY + k2 / 2 });
        const k4 = h * evaluateMath(expr, { x: currX + h, y: currY + k3 });
        const nextY = currY + (k1 + 2 * k2 + 2 * k3 + k4) / 6;

        steps.push({
          step: stepIdx + 1,
          x: currX.toFixed(2),
          y: currY.toFixed(4),
          k1: k1.toFixed(4),
          k2: k2.toFixed(4),
          k3: k3.toFixed(4),
          k4: k4.toFixed(4),
          nextY: nextY.toFixed(4)
        });
        currX += h;
        currY = nextY;
        stepIdx++;
      }
      return { result: `RK4 Result y(${currX.toFixed(2)}) ≈ ${currY.toFixed(6)}`, steps, headers: ['Step', 'x_n', 'y_n', 'k1', 'k2', 'k3', 'k4', 'y_(n+1)'] };
    }
  },

  // UNIT 5: TESTING OF HYPOTHESIS & CURVE FITTING
  {
    id: 'z-test',
    name: 'Z-Test (Testing of Significance)',
    unit: 'Unit 5: Hypothesis Testing',
    route: '/test-significance',
    description: 'Tests mean difference for large samples (N ≥ 30) with population standard deviation σ.',
    defaultParams: { sampleMean: 68.5, popMean: 67.0, popStd: 2.5, sampleSize: 100, alpha: 0.05 },
    solve: (params) => {
      const xbar = parseNum(params.sampleMean, 68.5);
      const mu = parseNum(params.popMean, 67.0);
      const sigma = parseNum(params.popStd, 2.5);
      const n = parseNum(params.sampleSize, 100);
      const alpha = parseNum(params.alpha, 0.05);

      const se = sigma / Math.sqrt(n);
      const zStat = (xbar - mu) / se;
      const zCrit = 1.96;
      const isRejected = Math.abs(zStat) > zCrit;

      return {
        result: `Z-Calculated = ${zStat.toFixed(4)} | Verdict: ${isRejected ? 'Reject Null Hypothesis H0' : 'Accept Null Hypothesis H0'}`,
        steps: [
          { param: 'Sample Mean (X̄)', val: xbar },
          { param: 'Hypothesized Mean (μ0)', val: mu },
          { param: 'Standard Error (σ/√n)', val: se.toFixed(4) },
          { param: 'Z Calculated Stat', val: zStat.toFixed(4) },
          { param: 'Z Critical (α=0.05)', val: `±${zCrit}` }
        ],
        headers: ['Metric Parameter', 'Value']
      };
    }
  },
  {
    id: 't-test',
    name: 'Student t-Test (Single Mean)',
    unit: 'Unit 5: Hypothesis Testing',
    route: '/t-test',
    description: 'Tests mean difference for small samples (N < 30) where population standard deviation is unknown.',
    defaultParams: { sampleMean: 22.4, popMean: 20.0, sampleStd: 3.2, sampleSize: 16 },
    solve: (params) => {
      const xbar = parseNum(params.sampleMean, 22.4);
      const mu = parseNum(params.popMean, 20.0);
      const s = parseNum(params.sampleStd, 3.2);
      const n = parseNum(params.sampleSize, 16);
      const df = n - 1;

      const se = s / Math.sqrt(n);
      const tStat = (xbar - mu) / se;
      const tCrit = 2.131;
      const isRejected = Math.abs(tStat) > tCrit;

      return {
        result: `t-Stat = ${tStat.toFixed(4)} (df=${df}) | Verdict: ${isRejected ? 'Reject H0' : 'Accept H0'}`,
        steps: [
          { param: 'Sample Mean (X̄)', val: xbar },
          { param: 'Null Mean (μ0)', val: mu },
          { param: 'Degrees of Freedom (n-1)', val: df },
          { param: 't Calculated', val: tStat.toFixed(4) },
          { param: 't Critical (α=0.05)', val: `±${tCrit}` }
        ],
        headers: ['Parameter', 'Value']
      };
    }
  },
  {
    id: 'chi-square',
    name: 'Chi-Square Test (χ²)',
    unit: 'Unit 5: Hypothesis Testing',
    route: '/chi-square',
    description: 'Tests goodness of fit between observed frequencies O_i and expected frequencies E_i.',
    defaultParams: { observed: '50, 60, 40, 50', expected: '50, 50, 50, 50' },
    solve: (params) => {
      const obs = (params.observed || '50, 60, 40, 50').split(',').map((v) => parseFloat(v.trim()) || 0);
      const exp = (params.expected || '50, 50, 50, 50').split(',').map((v) => parseFloat(v.trim()) || 0);
      let chiSum = 0;
      const steps = [];

      for (let i = 0; i < Math.min(obs.length, exp.length); i++) {
        const o = obs[i];
        const e = exp[i];
        const term = e > 0 ? Math.pow(o - e, 2) / e : 0;
        chiSum += term;
        steps.push({ cat: `Group #${i + 1}`, o, e, diffSq: Math.pow(o - e, 2).toFixed(2), term: term.toFixed(4) });
      }

      const df = steps.length - 1;
      return {
        result: `χ² Calculated = ${chiSum.toFixed(4)} (df = ${df})`,
        steps,
        headers: ['Group', 'Observed (O)', 'Expected (E)', '(O-E)²', '(O-E)²/E']
      };
    }
  }
];
