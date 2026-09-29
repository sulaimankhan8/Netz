import { evaluateMath, parseUserFunction, getSymbolicDerivative, sanitizeMathString } from '../../../utils/evaluateMath.js';

export function parseNum(val, fallback) {
  if (val === undefined || val === null || val === '') return fallback;
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseArray(val, fallback) {
  if (!val || typeof val !== 'string') return fallback;
  const arr = val.split(',').map((v) => parseFloat(v.trim())).filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : fallback;
}

export function parseMatrixRows(row1, row2, row3, defaultRows) {
  const parseRow = (r, def) => {
    if (!r || typeof r !== 'string') return def;
    const parts = r.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length < 4 || parts.some((n) => isNaN(n))) return def;
    return parts;
  };
  return [
    parseRow(row1, defaultRows[0]),
    parseRow(row2, defaultRows[1]),
    parseRow(row3, defaultRows[2])
  ];
}

function det3x3(m) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function solve3x3Cramer(A, b) {
  const D = det3x3(A);
  if (Math.abs(D) < 1e-12) return null;

  const Ax = [
    [b[0], A[0][1], A[0][2]],
    [b[1], A[1][1], A[1][2]],
    [b[2], A[2][1], A[2][2]]
  ];
  const Ay = [
    [A[0][0], b[0], A[0][2]],
    [A[1][0], b[1], A[1][2]],
    [A[2][0], b[2], A[2][2]]
  ];
  const Az = [
    [A[0][0], A[0][1], b[0]],
    [A[1][0], A[1][1], b[1]],
    [A[2][0], A[2][1], b[2]]
  ];

  return {
    x: det3x3(Ax) / D,
    y: det3x3(Ay) / D,
    z: det3x3(Az) / D,
    D
  };
}

export const ALGORITHMS_CATALOG = [
  // ==========================================
  // UNIT 1: ROOTS OF EQUATIONS & LINEAR SYSTEMS
  // ==========================================
  {
    id: 'bisection',
    name: 'Bisection Method',
    unit: 'Unit 1: Roots of Equations',
    route: '/bisection-method',
    description: 'Finds real root in interval [a, b] where f(a) and f(b) have opposite signs by repeated bisection.',
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
      return { result: `Root x ≈ ${c.toFixed(6)}`, steps, headers: ['Iter', 'a', 'b', 'Midpoint c', 'f(c)'] };
    }
  },
  {
    id: 'secant-method',
    name: 'Secant Method',
    unit: 'Unit 1: Roots of Equations',
    route: '/secant-method',
    description: 'Finds real roots of f(x) = 0 using two initial approximations without requiring symbolic derivatives.',
    defaultParams: { expression: 'x^3 - 4*x - 9', x0: 2, x1: 3, tolerance: 0.0001 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x^3 - 4*x - 9');
      let xPrev = parseNum(params.x0, 2);
      let xCurr = parseNum(params.x1, 3);
      const tol = parseNum(params.tolerance, 0.0001);
      const steps = [];

      for (let i = 0; i < 10; i++) {
        const fPrev = evaluateMath(expr, { x: xPrev });
        const fCurr = evaluateMath(expr, { x: xCurr });
        const denom = fCurr - fPrev;
        if (Math.abs(denom) < 1e-12) break;

        const xNext = xCurr - (fCurr * (xCurr - xPrev)) / denom;
        steps.push({
          iter: i + 1,
          xPrev: xPrev.toFixed(5),
          xCurr: xCurr.toFixed(5),
          fPrev: fPrev.toFixed(5),
          fCurr: fCurr.toFixed(5),
          xNext: xNext.toFixed(6)
        });

        if (Math.abs(xNext - xCurr) < tol || Math.abs(fCurr) < tol) {
          xCurr = xNext;
          break;
        }
        xPrev = xCurr;
        xCurr = xNext;
      }
      return { result: `Root x ≈ ${xCurr.toFixed(6)}`, steps, headers: ['Iter', 'x_(n-1)', 'x_n', 'f(x_(n-1))', 'f(x_n)', 'x_(n+1)'] };
    }
  },
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
      return { result: `Root x ≈ ${currentX.toFixed(6)}`, steps, headers: ['Iter', 'x_n', 'f(x_n)', "f'(x_n)", 'x_(n+1)'] };
    }
  },
  {
    id: 'false-position',
    name: 'Regula Falsi (False Position)',
    unit: 'Unit 1: Roots of Equations',
    route: '/false-position-method',
    description: 'Secant line interpolation method to find roots within bracketed interval [a, b].',
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

  // ==========================================
  // UNIT 2: INTERPOLATION & DIFFERENCES
  // ==========================================
  {
    id: 'newton-forward',
    name: "Newton's Forward Interpolation",
    unit: 'Unit 2: Interpolation',
    route: '/newton-forward',
    description: 'Equal interval interpolation formula using forward difference table Δy for target X near table start.',
    defaultParams: { xValues: '10, 20, 30, 40', yValues: '46, 66, 81, 93', targetX: 15 },
    solve: (params) => {
      const xArr = parseArray(params.xValues, [10, 20, 30, 40]);
      const yArr = parseArray(params.yValues, [46, 66, 81, 93]);
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
      const xArr = parseArray(params.xValues, [10, 20, 30, 40]);
      const yArr = parseArray(params.yValues, [46, 66, 81, 93]);
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
    id: 'gauss-forward',
    name: "Gauss's Forward Interpolation",
    unit: 'Unit 2: Interpolation',
    route: '/gauss-forward',
    description: 'Central difference interpolation formula for values of x lying near the center of the table (0 < u < 1).',
    defaultParams: { xValues: '20, 25, 30, 35, 40', yValues: '12, 15, 20, 27, 39', targetX: 32 },
    solve: (params) => {
      const xArr = parseArray(params.xValues, [20, 25, 30, 35, 40]);
      const yArr = parseArray(params.yValues, [12, 15, 20, 27, 39]);
      const targetX = parseNum(params.targetX, 32);
      const n = Math.min(xArr.length, yArr.length);
      const h = xArr[1] - xArr[0];

      // Find central origin index x0
      let originIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < n; i++) {
        if (Math.abs(xArr[i] - targetX) < minDiff && xArr[i] <= targetX) {
          minDiff = Math.abs(xArr[i] - targetX);
          originIdx = i;
        }
      }
      const u = (targetX - xArr[originIdx]) / h;

      // Build forward difference table
      const diff = [yArr.slice(0, n)];
      for (let i = 1; i < n; i++) {
        const row = [];
        for (let j = 0; j < n - i; j++) {
          row.push(diff[i - 1][j + 1] - diff[i - 1][j]);
        }
        diff.push(row);
      }

      // Terms: y0 + u*Δy0 + u(u-1)/2 * Δ^2y_{-1} + (u+1)u(u-1)/6 * Δ^3y_{-1}
      let result = yArr[originIdx];
      const steps = [{ order: 'y_0', formula: 'y0', val: result.toFixed(4), term: result.toFixed(4) }];

      if (diff[1] && diff[1][originIdx] !== undefined) {
        const t1 = u * diff[1][originIdx];
        result += t1;
        steps.push({ order: 'Δy_0', formula: 'u * Δy_0', val: diff[1][originIdx].toFixed(4), term: t1.toFixed(4) });
      }

      if (originIdx - 1 >= 0 && diff[2] && diff[2][originIdx - 1] !== undefined) {
        const t2 = (u * (u - 1) / 2) * diff[2][originIdx - 1];
        result += t2;
        steps.push({ order: 'Δ²y_{-1}', formula: '[u(u-1)/2!] * Δ²y_{-1}', val: diff[2][originIdx - 1].toFixed(4), term: t2.toFixed(4) });
      }

      if (originIdx - 1 >= 0 && diff[3] && diff[3][originIdx - 1] !== undefined) {
        const t3 = ((u + 1) * u * (u - 1) / 6) * diff[3][originIdx - 1];
        result += t3;
        steps.push({ order: 'Δ³y_{-1}', formula: '[(u+1)u(u-1)/3!] * Δ³y_{-1}', val: diff[3][originIdx - 1].toFixed(4), term: t3.toFixed(4) });
      }

      return {
        result: `Gauss Forward f(${targetX}) ≈ ${result.toFixed(4)} (u = ${u.toFixed(4)} at x0 = ${xArr[originIdx]})`,
        steps,
        headers: ['Difference Order', 'Formula Term', 'Difference Value', 'Contribution']
      };
    }
  },
  {
    id: 'gauss-backward',
    name: "Gauss's Backward Interpolation",
    unit: 'Unit 2: Interpolation',
    route: '/gauss-backward',
    description: 'Central difference interpolation formula for values of x lying near the center of the table (-1 < u < 0).',
    defaultParams: { xValues: '20, 25, 30, 35, 40', yValues: '12, 15, 20, 27, 39', targetX: 28 },
    solve: (params) => {
      const xArr = parseArray(params.xValues, [20, 25, 30, 35, 40]);
      const yArr = parseArray(params.yValues, [12, 15, 20, 27, 39]);
      const targetX = parseNum(params.targetX, 28);
      const n = Math.min(xArr.length, yArr.length);
      const h = xArr[1] - xArr[0];

      // Find central origin index x0 (just above or closest)
      let originIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < n; i++) {
        if (Math.abs(xArr[i] - targetX) < minDiff && xArr[i] >= targetX) {
          minDiff = Math.abs(xArr[i] - targetX);
          originIdx = i;
        }
      }
      const u = (targetX - xArr[originIdx]) / h;

      const diff = [yArr.slice(0, n)];
      for (let i = 1; i < n; i++) {
        const row = [];
        for (let j = 0; j < n - i; j++) {
          row.push(diff[i - 1][j + 1] - diff[i - 1][j]);
        }
        diff.push(row);
      }

      // Terms: y0 + u*Δy_{-1} + (u+1)u/2 * Δ^2y_{-1} + (u+1)u(u-1)/6 * Δ^3y_{-2}
      let result = yArr[originIdx];
      const steps = [{ order: 'y_0', formula: 'y0', val: result.toFixed(4), term: result.toFixed(4) }];

      if (originIdx - 1 >= 0 && diff[1] && diff[1][originIdx - 1] !== undefined) {
        const t1 = u * diff[1][originIdx - 1];
        result += t1;
        steps.push({ order: 'Δy_{-1}', formula: 'u * Δy_{-1}', val: diff[1][originIdx - 1].toFixed(4), term: t1.toFixed(4) });
      }

      if (originIdx - 1 >= 0 && diff[2] && diff[2][originIdx - 1] !== undefined) {
        const t2 = ((u + 1) * u / 2) * diff[2][originIdx - 1];
        result += t2;
        steps.push({ order: 'Δ²y_{-1}', formula: '[(u+1)u/2!] * Δ²y_{-1}', val: diff[2][originIdx - 1].toFixed(4), term: t2.toFixed(4) });
      }

      if (originIdx - 2 >= 0 && diff[3] && diff[3][originIdx - 2] !== undefined) {
        const t3 = ((u + 1) * u * (u - 1) / 6) * diff[3][originIdx - 2];
        result += t3;
        steps.push({ order: 'Δ³y_{-2}', formula: '[(u+1)u(u-1)/3!] * Δ³y_{-2}', val: diff[3][originIdx - 2].toFixed(4), term: t3.toFixed(4) });
      }

      return {
        result: `Gauss Backward f(${targetX}) ≈ ${result.toFixed(4)} (u = ${u.toFixed(4)} at x0 = ${xArr[originIdx]})`,
        steps,
        headers: ['Difference Order', 'Formula Term', 'Difference Value', 'Contribution']
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
      const xArr = parseArray(params.xValues, [5, 6, 9, 11]);
      const yArr = parseArray(params.yValues, [12, 13, 14, 16]);
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
      const xArr = parseArray(params.xValues, [5, 7, 11, 13]);
      const yArr = parseArray(params.yValues, [150, 392, 1452, 2366]);
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

  // ==========================================
  // UNIT 3: NUMERICAL CALCULUS & INTEGRATION
  // ==========================================
  {
    id: 'numerical-differentiation',
    name: 'Numerical Differentiation',
    unit: 'Unit 3: Numerical Calculus',
    route: '/numerical-differentiation',
    description: "Computes first and second derivatives f'(x) and f''(x) from forward difference table of tabulated data.",
    defaultParams: { xValues: '1.0, 1.2, 1.4, 1.6, 1.8, 2.0', yValues: '2.7183, 3.3201, 4.0552, 4.9530, 6.0496, 7.3891', targetX: 1.2 },
    solve: (params) => {
      const xArr = parseArray(params.xValues, [1.0, 1.2, 1.4, 1.6, 1.8, 2.0]);
      const yArr = parseArray(params.yValues, [2.7183, 3.3201, 4.0552, 4.9530, 6.0496, 7.3891]);
      const targetX = parseNum(params.targetX, 1.2);
      const n = Math.min(xArr.length, yArr.length);
      const h = xArr[1] - xArr[0];

      let targetIdx = xArr.findIndex((v) => Math.abs(v - targetX) < 1e-4);
      if (targetIdx === -1) targetIdx = 0;

      const diff = [yArr.slice(0, n)];
      for (let i = 1; i < n; i++) {
        const row = [];
        for (let j = 0; j < n - i; j++) {
          row.push(diff[i - 1][j + 1] - diff[i - 1][j]);
        }
        diff.push(row);
      }

      let d1Sum = 0;
      let d2Sum = 0;
      const steps = [];

      for (let order = 1; order < n - targetIdx; order++) {
        const delta = diff[order][targetIdx];
        let term1 = 0;
        let term2 = 0;

        if (order === 1) term1 = delta;
        else if (order === 2) {
          term1 = -0.5 * delta;
          term2 = delta;
        } else if (order === 3) {
          term1 = (1 / 3) * delta;
          term2 = -delta;
        } else if (order === 4) {
          term1 = -0.25 * delta;
          term2 = (11 / 12) * delta;
        }

        d1Sum += term1;
        d2Sum += term2;

        steps.push({
          order: `Δ^${order} y`,
          val: delta.toFixed(5),
          term1: (term1 / h).toFixed(5),
          term2: (term2 / (h * h)).toFixed(5)
        });
      }

      const fPrime = d1Sum / h;
      const fDoublePrime = d2Sum / (h * h);

      return {
        result: `f'(${targetX}) ≈ ${fPrime.toFixed(5)} | f''(${targetX}) ≈ ${fDoublePrime.toFixed(5)}`,
        steps,
        headers: ['Difference Order', 'Difference Value', "f'(x) Term (1/h)", "f''(x) Term (1/h²)"]
      };
    }
  },
  {
    id: 'trapezoidal',
    name: 'Trapezoidal Integration Rule',
    unit: 'Unit 3: Numerical Integration',
    route: '/trapezoidal-Rule',
    description: 'Approximates definite integral ∫[a,b] f(x) dx using N linear trapezoidal subintervals.',
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
    description: 'Parabolic quadratic interpolation for definite integral over even number of subintervals N.',
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
  {
    id: 'boole-rule',
    name: "Boole's Integration Rule",
    unit: 'Unit 3: Numerical Integration',
    route: '/boole-Rule',
    description: 'Higher-order Newton-Cotes formula over subintervals N (multiple of 4) with weights [7, 32, 12, 32, 7].',
    defaultParams: { expression: '1 / (1 + x)', a: 0, b: 4, n: 4 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || '1 / (1 + x)');
      const a = parseNum(params.a, 0);
      const b = parseNum(params.b, 4);
      let n = parseInt(params.n) || 4;
      if (n % 4 !== 0) n = Math.max(4, Math.round(n / 4) * 4);
      const h = (b - a) / n;
      const steps = [];
      let totalWeighted = 0;

      for (let i = 0; i <= n; i++) {
        const xi = a + i * h;
        const yi = evaluateMath(expr, { x: xi });
        let w = 32;
        if (i === 0 || i === n) w = 7;
        else if (i % 4 === 2) w = 12;
        else if (i % 4 === 0) w = 14;

        const term = w * yi;
        totalWeighted += term;
        steps.push({
          i,
          xi: xi.toFixed(4),
          yi: yi.toFixed(6),
          w,
          term: term.toFixed(6)
        });
      }

      const integral = ((2 * h) / 45) * totalWeighted;
      return {
        result: `Boole's Integral ≈ ${integral.toFixed(6)} (h = ${h.toFixed(4)})`,
        steps,
        headers: ['i', 'x_i', 'f(x_i)', 'Weight w_i', 'Weighted f(x_i)']
      };
    }
  },
  {
    id: 'weddle-rule',
    name: "Weddle's Integration Rule",
    unit: 'Unit 3: Numerical Integration',
    route: '/weddle-Rule',
    description: 'High-precision 6-interval Newton-Cotes rule using weights [1, 5, 1, 6, 1, 5, 1].',
    defaultParams: { expression: '1 / (1 + x^2)', a: 0, b: 6, n: 6 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || '1 / (1 + x^2)');
      const a = parseNum(params.a, 0);
      const b = parseNum(params.b, 6);
      let n = parseInt(params.n) || 6;
      if (n % 6 !== 0) n = Math.max(6, Math.round(n / 6) * 6);
      const h = (b - a) / n;
      const steps = [];
      let totalWeighted = 0;

      for (let i = 0; i <= n; i++) {
        const xi = a + i * h;
        const yi = evaluateMath(expr, { x: xi });
        const mod = i % 6;
        let w = 1;
        if (i === 0 || i === n) w = 1;
        else if (mod === 1 || mod === 5) w = 5;
        else if (mod === 2 || mod === 4) w = 1;
        else if (mod === 3) w = 6;
        else if (mod === 0) w = 2;

        const term = w * yi;
        totalWeighted += term;
        steps.push({
          i,
          xi: xi.toFixed(4),
          yi: yi.toFixed(6),
          w,
          term: term.toFixed(6)
        });
      }

      const integral = ((3 * h) / 10) * totalWeighted;
      return {
        result: `Weddle's Integral ≈ ${integral.toFixed(6)} (h = ${h.toFixed(4)})`,
        steps,
        headers: ['i', 'x_i', 'f(x_i)', 'Weight w_i', 'Weighted f(x_i)']
      };
    }
  },
  {
    id: 'gauss-quadrature',
    name: 'Gauss Quadrature (Legendre)',
    unit: 'Unit 3: Numerical Integration',
    route: '/gauss-quadrature',
    description: 'Gauss-Legendre 2-point and 3-point quadrature formula mapping interval [a, b] to [-1, 1].',
    defaultParams: { expression: '1 / (1 + x^2)', a: 0, b: 1, points: 2 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || '1 / (1 + x^2)');
      const a = parseNum(params.a, 0);
      const b = parseNum(params.b, 1);
      const points = parseInt(params.points) === 3 ? 3 : 2;
      const c1 = (b - a) / 2;
      const c2 = (a + b) / 2;

      let nodes = [];
      if (points === 2) {
        const t = 1 / Math.sqrt(3);
        nodes = [
          { t: -t, w: 1 },
          { t: t, w: 1 }
        ];
      } else {
        const t = Math.sqrt(0.6);
        nodes = [
          { t: -t, w: 5 / 9 },
          { t: 0, w: 8 / 9 },
          { t: t, w: 5 / 9 }
        ];
      }

      let sum = 0;
      const steps = [];
      nodes.forEach((node, idx) => {
        const xVal = c1 * node.t + c2;
        const fx = evaluateMath(expr, { x: xVal });
        const term = node.w * fx;
        sum += term;
        steps.push({
          point: idx + 1,
          t: node.t.toFixed(6),
          x: xVal.toFixed(6),
          fx: fx.toFixed(6),
          w: node.w.toFixed(6),
          term: term.toFixed(6)
        });
      });

      const integral = c1 * sum;
      return {
        result: `Gauss-Legendre ${points}-Point Integral ≈ ${integral.toFixed(6)}`,
        steps,
        headers: ['Node', 't_i (Node)', 'x_i (Mapped)', 'f(x_i)', 'Weight w_i', 'Weighted Contribution']
      };
    }
  },

  // ==========================================
  // UNIT 4: LINEAR SYSTEMS & DIFFERENTIAL EQUATIONS
  // ==========================================
  {
    id: 'gauss-seidel',
    name: 'Gauss-Seidel Iteration Method',
    unit: 'Unit 4: Linear Systems',
    route: '/Gauss-seidal',
    description: 'Iterative technique for solving diagonally dominant linear systems Ax = b using updated values immediately.',
    defaultParams: { row1: '10, -2, -1, 3', row2: '-2, 10, -1, 15', row3: '-1, -1, 10, 27', maxIter: 6 },
    solve: (params) => {
      const defaultRows = [
        [10, -2, -1, 3],
        [-2, 10, -1, 15],
        [-1, -1, 10, 27]
      ];
      const rows = parseMatrixRows(params.row1, params.row2, params.row3, defaultRows);
      const maxIter = parseInt(params.maxIter) || 6;

      let x = 0;
      let y = 0;
      let z = 0;
      const steps = [];

      for (let k = 1; k <= maxIter; k++) {
        const nextX = (rows[0][3] - rows[0][1] * y - rows[0][2] * z) / rows[0][0];
        const nextY = (rows[1][3] - rows[1][0] * nextX - rows[1][2] * z) / rows[1][1];
        const nextZ = (rows[2][3] - rows[2][0] * nextX - rows[2][1] * nextY) / rows[2][2];

        const delta = Math.max(Math.abs(nextX - x), Math.abs(nextY - y), Math.abs(nextZ - z));
        steps.push({
          iter: k,
          x: nextX.toFixed(5),
          y: nextY.toFixed(5),
          z: nextZ.toFixed(5),
          delta: delta.toFixed(5)
        });

        x = nextX;
        y = nextY;
        z = nextZ;
      }

      return {
        result: `Solution: x ≈ ${x.toFixed(4)}, y ≈ ${y.toFixed(4)}, z ≈ ${z.toFixed(4)}`,
        steps,
        headers: ['Iter k', 'x^(k)', 'y^(k)', 'z^(k)', 'Max |Δ|']
      };
    }
  },
  {
    id: 'jacobi-method',
    name: 'Jacobi Iteration Method',
    unit: 'Unit 4: Linear Systems',
    route: '/jacobi-method',
    description: 'Iterative solver for diagonally dominant linear systems Ax = b updating variables simultaneously from previous vector.',
    defaultParams: { row1: '10, 1, 1, 12', row2: '2, 10, 1, 13', row3: '2, 2, 10, 14', maxIter: 6 },
    solve: (params) => {
      const defaultRows = [
        [10, 1, 1, 12],
        [2, 10, 1, 13],
        [2, 2, 10, 14]
      ];
      const rows = parseMatrixRows(params.row1, params.row2, params.row3, defaultRows);
      const maxIter = parseInt(params.maxIter) || 6;

      let x = 0;
      let y = 0;
      let z = 0;
      const steps = [];

      for (let k = 1; k <= maxIter; k++) {
        const nextX = (rows[0][3] - rows[0][1] * y - rows[0][2] * z) / rows[0][0];
        const nextY = (rows[1][3] - rows[1][0] * x - rows[1][2] * z) / rows[1][1];
        const nextZ = (rows[2][3] - rows[2][0] * x - rows[2][1] * y) / rows[2][2];

        const delta = Math.max(Math.abs(nextX - x), Math.abs(nextY - y), Math.abs(nextZ - z));
        steps.push({
          iter: k,
          x: nextX.toFixed(5),
          y: nextY.toFixed(5),
          z: nextZ.toFixed(5),
          delta: delta.toFixed(5)
        });

        x = nextX;
        y = nextY;
        z = nextZ;
      }

      return {
        result: `Jacobi Solution: x ≈ ${x.toFixed(4)}, y ≈ ${y.toFixed(4)}, z ≈ ${z.toFixed(4)}`,
        steps,
        headers: ['Iter k', 'x^(k)', 'y^(k)', 'z^(k)', 'Max |Δ|']
      };
    }
  },
  {
    id: 'gauss-elimination',
    name: 'Gauss Elimination Method',
    unit: 'Unit 4: Linear Systems',
    route: '/gauss-elimination',
    description: 'Direct solution of 3x3 linear system Ax = b via forward row operations to upper triangular form and back substitution.',
    defaultParams: { row1: '2, 1, 1, 10', row2: '3, 2, 3, 18', row3: '1, 4, 9, 16' },
    solve: (params) => {
      const defaultRows = [
        [2, 1, 1, 10],
        [3, 2, 3, 18],
        [1, 4, 9, 16]
      ];
      const mat = parseMatrixRows(params.row1, params.row2, params.row3, defaultRows).map((r) => [...r]);
      const steps = [];

      const formatRow = (r) => `[${r.slice(0, 3).map((v) => v.toFixed(2)).join(', ')} | ${r[3].toFixed(2)}]`;
      steps.push({ stage: 'Initial Matrix [A|b]', r1: formatRow(mat[0]), r2: formatRow(mat[1]), r3: formatRow(mat[2]) });

      // Forward elimination
      // Row 1 -> Row 2
      const m21 = mat[1][0] / mat[0][0];
      for (let j = 0; j < 4; j++) mat[1][j] -= m21 * mat[0][j];
      // Row 1 -> Row 3
      const m31 = mat[2][0] / mat[0][0];
      for (let j = 0; j < 4; j++) mat[2][j] -= m31 * mat[0][j];
      steps.push({ stage: 'Eliminate x from R2, R3', r1: formatRow(mat[0]), r2: formatRow(mat[1]), r3: formatRow(mat[2]) });

      // Row 2 -> Row 3
      const m32 = mat[2][1] / mat[1][1];
      for (let j = 1; j < 4; j++) mat[2][j] -= m32 * mat[1][j];
      steps.push({ stage: 'Upper Triangular Matrix', r1: formatRow(mat[0]), r2: formatRow(mat[1]), r3: formatRow(mat[2]) });

      // Back substitution
      const z = mat[2][3] / mat[2][2];
      const y = (mat[1][3] - mat[1][2] * z) / mat[1][1];
      const x = (mat[0][3] - mat[0][1] * y - mat[0][2] * z) / mat[0][0];

      steps.push({ stage: 'Back Substitution Result', r1: `x = ${x.toFixed(4)}`, r2: `y = ${y.toFixed(4)}`, r3: `z = ${z.toFixed(4)}` });

      return {
        result: `Solution: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}`,
        steps,
        headers: ['Stage', 'Row 1', 'Row 2', 'Row 3']
      };
    }
  },
  {
    id: 'gauss-jordan',
    name: 'Gauss-Jordan Method',
    unit: 'Unit 4: Linear Systems',
    route: '/gauss-jordan',
    description: 'Reduces augmented matrix [A|b] directly to reduced row echelon form (identity matrix) to solve linear systems.',
    defaultParams: { row1: '2, 1, 1, 10', row2: '3, 2, 3, 18', row3: '1, 4, 9, 16' },
    solve: (params) => {
      const defaultRows = [
        [2, 1, 1, 10],
        [3, 2, 3, 18],
        [1, 4, 9, 16]
      ];
      const mat = parseMatrixRows(params.row1, params.row2, params.row3, defaultRows).map((r) => [...r]);
      const steps = [];
      const formatRow = (r) => `[${r.slice(0, 3).map((v) => v.toFixed(2)).join(', ')} | ${r[3].toFixed(2)}]`;

      steps.push({ op: 'Initial Matrix', r1: formatRow(mat[0]), r2: formatRow(mat[1]), r3: formatRow(mat[2]) });

      for (let i = 0; i < 3; i++) {
        const pivot = mat[i][i];
        if (Math.abs(pivot) < 1e-12) continue;
        for (let j = 0; j < 4; j++) mat[i][j] /= pivot;

        for (let k = 0; k < 3; k++) {
          if (k !== i) {
            const factor = mat[k][i];
            for (let j = 0; j < 4; j++) mat[k][j] -= factor * mat[i][j];
          }
        }
        steps.push({ op: `Pivot on column ${i + 1}`, r1: formatRow(mat[0]), r2: formatRow(mat[1]), r3: formatRow(mat[2]) });
      }

      const x = mat[0][3];
      const y = mat[1][3];
      const z = mat[2][3];

      return {
        result: `Gauss-Jordan Solution: x = ${x.toFixed(4)}, y = ${y.toFixed(4)}, z = ${z.toFixed(4)}`,
        steps,
        headers: ['Elimination Step', 'Row 1', 'Row 2', 'Row 3']
      };
    }
  },
  {
    id: 'lu-decomposition',
    name: 'LU Decomposition (Doolittle Method)',
    unit: 'Unit 4: Linear Systems',
    route: '/lu-decomposition',
    description: 'Factorizes square matrix A into lower triangular L and upper triangular U to solve Ly = b and Ux = y.',
    defaultParams: { row1: '2, 3, 1, 9', row2: '1, 2, 3, 6', row3: '3, 1, 2, 8' },
    solve: (params) => {
      const defaultRows = [
        [2, 3, 1, 9],
        [1, 2, 3, 6],
        [3, 1, 2, 8]
      ];
      const mat = parseMatrixRows(params.row1, params.row2, params.row3, defaultRows);
      const A = mat.map((r) => r.slice(0, 3));
      const b = mat.map((r) => r[3]);

      // Doolittle LU decomposition
      const L = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      const U = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];

      for (let i = 0; i < 3; i++) {
        for (let k = i; k < 3; k++) {
          let sum = 0;
          for (let j = 0; j < i; j++) sum += L[i][j] * U[j][k];
          U[i][k] = A[i][k] - sum;
        }
        for (let k = i + 1; k < 3; k++) {
          let sum = 0;
          for (let j = 0; j < i; j++) sum += L[k][j] * U[j][i];
          L[k][i] = (A[k][i] - sum) / U[i][i];
        }
      }

      // Forward substitution: Ly = b
      const y = [0, 0, 0];
      y[0] = b[0] / L[0][0];
      y[1] = (b[1] - L[1][0] * y[0]) / L[1][1];
      y[2] = (b[2] - L[2][0] * y[0] - L[2][1] * y[1]) / L[2][2];

      // Back substitution: Ux = y
      const x = [0, 0, 0];
      x[2] = y[2] / U[2][2];
      x[1] = (y[1] - U[1][2] * x[2]) / U[1][1];
      x[0] = (y[0] - U[0][1] * x[1] - U[0][2] * x[2]) / U[0][0];

      const steps = [
        {
          component: 'Matrix L (Lower)',
          r1: `[${L[0].map((v) => v.toFixed(2)).join(', ')}]`,
          r2: `[${L[1].map((v) => v.toFixed(2)).join(', ')}]`,
          r3: `[${L[2].map((v) => v.toFixed(2)).join(', ')}]`
        },
        {
          component: 'Matrix U (Upper)',
          r1: `[${U[0].map((v) => v.toFixed(2)).join(', ')}]`,
          r2: `[${U[1].map((v) => v.toFixed(2)).join(', ')}]`,
          r3: `[${U[2].map((v) => v.toFixed(2)).join(', ')}]`
        },
        {
          component: 'Intermediate Vector y (Ly = b)',
          r1: `y1 = ${y[0].toFixed(4)}`,
          r2: `y2 = ${y[1].toFixed(4)}`,
          r3: `y3 = ${y[2].toFixed(4)}`
        },
        {
          component: 'Final Solution x (Ux = y)',
          r1: `x = ${x[0].toFixed(4)}`,
          r2: `y = ${x[1].toFixed(4)}`,
          r3: `z = ${x[2].toFixed(4)}`
        }
      ];

      return {
        result: `LU Solution: x = ${x[0].toFixed(4)}, y = ${x[1].toFixed(4)}, z = ${x[2].toFixed(4)}`,
        steps,
        headers: ['Decomposition Stage', 'Row 1 / Entry 1', 'Row 2 / Entry 2', 'Row 3 / Entry 3']
      };
    }
  },
  {
    id: 'taylor-series',
    name: "Taylor's Series ODE Method",
    unit: 'Unit 4: Differential Equations',
    route: '/taylor-s-series-method',
    description: "Approximates ODE solution y(x) via Taylor series expansion y(x0+h) = y0 + h y' + (h²/2!) y'' + (h³/3!) y''' + ...",
    defaultParams: { expression: 'x + y', x0: 0, y0: 1, h: 0.1, targetX: 0.2 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x + y');
      let currX = parseNum(params.x0, 0);
      let currY = parseNum(params.y0, 1);
      const h = parseNum(params.h, 0.1);
      const targetX = parseNum(params.targetX, 0.2);
      const steps = [];

      let iter = 0;
      while (currX < targetX - 1e-9 && iter < 5) {
        // For dy/dx = x + y: y' = x + y, y'' = 1 + y', y''' = y'', y'''' = y'''
        const y1 = evaluateMath(expr, { x: currX, y: currY });
        const y2 = 1 + y1;
        const y3 = y2;
        const y4 = y3;

        const term1 = h * y1;
        const term2 = ((h * h) / 2) * y2;
        const term3 = ((h * h * h) / 6) * y3;
        const term4 = ((h * h * h * h) / 24) * y4;

        const nextY = currY + term1 + term2 + term3 + term4;
        steps.push({
          x: currX.toFixed(2),
          y: currY.toFixed(4),
          yPrime: y1.toFixed(4),
          yDouble: y2.toFixed(4),
          nextY: nextY.toFixed(4)
        });

        currX += h;
        currY = nextY;
        iter++;
      }

      return {
        result: `Taylor Series y(${currX.toFixed(2)}) ≈ ${currY.toFixed(5)}`,
        steps,
        headers: ['x_n', 'y_n', "y' = f(x,y)", "y'' = 1+y'", 'y_(n+1)']
      };
    }
  },
  {
    id: 'euler',
    name: "Euler's ODE Method",
    unit: 'Unit 4: Differential Equations',
    route: '/euler-s-method',
    description: 'Solves first order initial value problem dy/dx = f(x, y) starting at (x0, y0) with step size h.',
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
      return { result: `Euler y(${currX.toFixed(2)}) ≈ ${currY.toFixed(4)}`, steps, headers: ['Step', 'x_n', 'y_n', 'Slope f(x_n,y_n)', 'y_(n+1)'] };
    }
  },
  {
    id: 'modified-euler',
    name: "Modified Euler's Method (Heun's)",
    unit: 'Unit 4: Differential Equations',
    route: '/modified-euler-s-method',
    description: "Predictor-corrector method: predicts y* = y + h*f(x,y), corrects with average slope at (x_n, y_n) and (x_{n+1}, y*).",
    defaultParams: { expression: 'x + y', x0: 0, y0: 1, h: 0.1, targetX: 0.3 },
    solve: (params) => {
      const expr = sanitizeMathString(params.expression || 'x + y');
      let currX = parseNum(params.x0, 0);
      let currY = parseNum(params.y0, 1);
      const h = parseNum(params.h, 0.1);
      const targetX = parseNum(params.targetX, 0.3);
      const steps = [];
      let stepIdx = 0;

      while (currX < targetX - 1e-9 && stepIdx < 8) {
        const k1 = evaluateMath(expr, { x: currX, y: currY });
        const yPred = currY + h * k1;
        const k2 = evaluateMath(expr, { x: currX + h, y: yPred });
        const nextY = currY + (h / 2) * (k1 + k2);

        steps.push({
          step: stepIdx + 1,
          x: currX.toFixed(2),
          y: currY.toFixed(4),
          k1: k1.toFixed(4),
          yPred: yPred.toFixed(4),
          k2: k2.toFixed(4),
          nextY: nextY.toFixed(4)
        });

        currX += h;
        currY = nextY;
        stepIdx++;
      }

      return {
        result: `Modified Euler y(${currX.toFixed(2)}) ≈ ${currY.toFixed(5)}`,
        steps,
        headers: ['Step', 'x_n', 'y_n', 'k1 = f(x,y)', 'Predicted y*', 'k2 = f(x+h,y*)', 'Corrected y_(n+1)']
      };
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

  // ==========================================
  // UNIT 5: CURVE FITTING & HYPOTHESIS TESTING
  // ==========================================
  {
    id: 'least-squares',
    name: 'Method of Least Squares (Linear)',
    unit: 'Unit 5: Curve Fitting',
    route: '/least-squares',
    description: 'Finds optimal linear regression line y = a + b*x by minimizing sum of squared residuals.',
    defaultParams: { xValues: '1, 2, 3, 4, 5', yValues: '2, 4, 5, 4, 5' },
    solve: (params) => {
      const xArr = parseArray(params.xValues, [1, 2, 3, 4, 5]);
      const yArr = parseArray(params.yValues, [2, 4, 5, 4, 5]);
      const n = Math.min(xArr.length, yArr.length);

      let sumX = 0;
      let sumY = 0;
      let sumX2 = 0;
      let sumXY = 0;

      for (let i = 0; i < n; i++) {
        sumX += xArr[i];
        sumY += yArr[i];
        sumX2 += xArr[i] * xArr[i];
        sumXY += xArr[i] * yArr[i];
      }

      const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const a = (sumY - b * sumX) / n;

      const steps = [];
      for (let i = 0; i < n; i++) {
        const yPred = a + b * xArr[i];
        const res = Math.pow(yArr[i] - yPred, 2);
        steps.push({
          pt: i + 1,
          x: xArr[i],
          y: yArr[i],
          x2: (xArr[i] * xArr[i]).toFixed(2),
          xy: (xArr[i] * yArr[i]).toFixed(2),
          yPred: yPred.toFixed(4),
          res: res.toFixed(4)
        });
      }

      return {
        result: `Fitted Line: y = ${a.toFixed(4)} + ${b.toFixed(4)}x`,
        steps,
        headers: ['i', 'x_i', 'y_i', 'x_i²', 'x_i * y_i', 'Fitted ŷ_i', 'Residual (y_i - ŷ_i)²']
      };
    }
  },
  {
    id: 'fitting-straight-lines',
    name: 'Fitting a Straight Line',
    unit: 'Unit 5: Curve Fitting',
    route: '/fitting-straight-lines',
    description: 'Calculates linear regression equation y = mx + c with slope m, intercept c, and Pearson correlation coefficient r.',
    defaultParams: { xValues: '0, 1, 2, 3, 4', yValues: '1, 1.8, 3.3, 4.5, 6.3' },
    solve: (params) => {
      const xArr = parseArray(params.xValues, [0, 1, 2, 3, 4]);
      const yArr = parseArray(params.yValues, [1, 1.8, 3.3, 4.5, 6.3]);
      const n = Math.min(xArr.length, yArr.length);

      let sumX = 0;
      let sumY = 0;
      let sumX2 = 0;
      let sumY2 = 0;
      let sumXY = 0;

      for (let i = 0; i < n; i++) {
        sumX += xArr[i];
        sumY += yArr[i];
        sumX2 += xArr[i] * xArr[i];
        sumY2 += yArr[i] * yArr[i];
        sumXY += xArr[i] * yArr[i];
      }

      const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const c = (sumY - m * sumX) / n;
      const rNum = n * sumXY - sumX * sumY;
      const rDen = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      const r = rDen !== 0 ? rNum / rDen : 1;

      const steps = [];
      for (let i = 0; i < n; i++) {
        const yPred = m * xArr[i] + c;
        steps.push({
          pt: i + 1,
          x: xArr[i],
          y: yArr[i],
          x2: (xArr[i] * xArr[i]).toFixed(2),
          y2: (yArr[i] * yArr[i]).toFixed(2),
          xy: (xArr[i] * yArr[i]).toFixed(2),
          yPred: yPred.toFixed(4)
        });
      }

      return {
        result: `Regression Line: y = ${m.toFixed(4)}x + ${c.toFixed(4)} | Correlation r = ${r.toFixed(4)}`,
        steps,
        headers: ['i', 'x_i', 'y_i', 'x_i²', 'y_i²', 'x_i * y_i', 'Predicted y']
      };
    }
  },
  {
    id: 'fitting-parabola',
    name: 'Fitting a Parabola (2nd Degree)',
    unit: 'Unit 5: Curve Fitting',
    route: '/fitting-parabola',
    description: 'Fits second-degree parabolic curve y = a + b*x + c*x² via normal equations system.',
    defaultParams: { xValues: '0, 1, 2, 3, 4', yValues: '1, 1.8, 1.3, 2.5, 6.3' },
    solve: (params) => {
      const xArr = parseArray(params.xValues, [0, 1, 2, 3, 4]);
      const yArr = parseArray(params.yValues, [1, 1.8, 1.3, 2.5, 6.3]);
      const n = Math.min(xArr.length, yArr.length);

      let sx = 0;
      let sx2 = 0;
      let sx3 = 0;
      let sx4 = 0;
      let sy = 0;
      let sxy = 0;
      let sx2y = 0;

      for (let i = 0; i < n; i++) {
        const x = xArr[i];
        const y = yArr[i];
        const x2 = x * x;
        sx += x;
        sx2 += x2;
        sx3 += x2 * x;
        sx4 += x2 * x2;
        sy += y;
        sxy += x * y;
        sx2y += x2 * y;
      }

      const A = [
        [n, sx, sx2],
        [sx, sx2, sx3],
        [sx2, sx3, sx4]
      ];
      const B = [sy, sxy, sx2y];
      const sol = solve3x3Cramer(A, B);

      if (!sol) {
        return { result: 'Singular matrix: could not fit parabola.', steps: [], headers: [] };
      }

      const a = sol.x;
      const b = sol.y;
      const c = sol.z;

      const steps = [];
      for (let i = 0; i < n; i++) {
        const x = xArr[i];
        const y = yArr[i];
        const yPred = a + b * x + c * x * x;
        steps.push({
          pt: i + 1,
          x,
          y,
          x2: (x * x).toFixed(2),
          x3: Math.pow(x, 3).toFixed(2),
          xy: (x * y).toFixed(2),
          x2y: (x * x * y).toFixed(2),
          yPred: yPred.toFixed(4)
        });
      }

      return {
        result: `Parabola: y = ${a.toFixed(4)} + (${b.toFixed(4)})x + (${c.toFixed(4)})x²`,
        steps,
        headers: ['i', 'x_i', 'y_i', 'x_i²', 'x_i³', 'x_i * y_i', 'x_i² * y_i', 'Fitted ŷ_i']
      };
    }
  },
  {
    id: 'z-test',
    name: 'Z-Test (Testing of Significance)',
    unit: 'Unit 5: Hypothesis Testing',
    route: '/test-significance',
    description: 'Tests mean difference for large samples (N ≥ 30) with known population standard deviation σ.',
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
      const obs = parseArray(params.observed, [50, 60, 40, 50]);
      const exp = parseArray(params.expected, [50, 50, 50, 50]);
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
  },
  {
    id: 'f-test',
    name: 'F-Test (Equality of Variances)',
    unit: 'Unit 5: Hypothesis Testing',
    route: '/f-test',
    description: 'Tests whether two independent normal populations have equal variances: F = S1² / S2² where S1² > S2².',
    defaultParams: { sample1: '20, 16, 26, 27, 23, 22, 18, 24, 25, 19', sample2: '17, 23, 14, 18, 19, 20, 21, 16' },
    solve: (params) => {
      const s1 = parseArray(params.sample1, [20, 16, 26, 27, 23, 22, 18, 24, 25, 19]);
      const s2 = parseArray(params.sample2, [17, 23, 14, 18, 19, 20, 21, 16]);

      const n1 = s1.length;
      const n2 = s2.length;
      const mean1 = s1.reduce((a, b) => a + b, 0) / n1;
      const mean2 = s2.reduce((a, b) => a + b, 0) / n2;

      const var1 = s1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / (n1 - 1);
      const var2 = s2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / (n2 - 1);

      let fStat, df1, df2;
      if (var1 >= var2) {
        fStat = var1 / var2;
        df1 = n1 - 1;
        df2 = n2 - 1;
      } else {
        fStat = var2 / var1;
        df1 = n2 - 1;
        df2 = n1 - 1;
      }

      const steps = [
        { metric: 'Sample Size (N)', s1Val: n1, s2Val: n2 },
        { metric: 'Sample Mean (X̄)', s1Val: mean1.toFixed(4), s2Val: mean2.toFixed(4) },
        { metric: 'Sample Variance (S²)', s1Val: var1.toFixed(4), s2Val: var2.toFixed(4) },
        { metric: 'Degrees of Freedom (df)', s1Val: n1 - 1, s2Val: n2 - 1 },
        { metric: 'Calculated F-Statistic', s1Val: fStat.toFixed(4), s2Val: `(df1=${df1}, df2=${df2})` }
      ];

      return {
        result: `F-Calculated = ${fStat.toFixed(4)} with degrees of freedom (${df1}, ${df2})`,
        steps,
        headers: ['Statistical Measure', 'Sample 1', 'Sample 2']
      };
    }
  }
];
