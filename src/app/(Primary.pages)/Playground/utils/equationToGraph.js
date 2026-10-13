/**
 * Equation-to-Graph Generator & Multi-Curve Dataset Appender
 * Evaluates LaTeX math equations to continuous high-resolution (x, y) plot datasets.
 * Uses mathjs compiler for robust support of polynomials, trig, log, exp, & rational functions.
 */

import { create, all } from 'mathjs';
import { scopeManager } from './scopeManager';

const math = create(all);

export const CURVE_COLORS = [
  '#3B82F6', // Electric Blue
  '#10B981', // Emerald
  '#8B5CF6', // Vivid Purple
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
];

/**
 * Normalizes LaTeX equation string into standard mathjs expression string.
 */
export function extractExpressionFromLatex(latexStr) {
  if (!latexStr || typeof latexStr !== 'string') return '';

  let str = latexStr.trim();

  // Strip equation LHS assignments: "y =", "f(x) =", "g(x) =", "z =", "y(x) ="
  if (str.includes('=')) {
    const parts = str.split('=');
    const left = parts[0].trim();
    if (/^(y|f\(x\)|g\(x\)|h\(x\)|z|y\(x\))$/i.test(left)) {
      str = parts.slice(1).join('=').trim();
    } else {
      str = parts[0].trim();
    }
  }

  // Remove LaTeX formatting commands like \displaystyle, \text{...}, \mathrm{...}
  str = str.replace(/\\displaystyle/g, '');
  str = str.replace(/\\text\{([^{}]+)\}/g, '$1');
  str = str.replace(/\\mathrm\{([^{}]+)\}/g, '$1');

  // Strip \left and \right delimiters
  str = str.replace(/\\left\s*([(\[{|])/g, '$1');
  str = str.replace(/\\right\s*([)\]}|])/g, '$1');
  str = str.replace(/\\left\./g, '');
  str = str.replace(/\\right\./g, '');

  // Convert trig function powers: \sin^2(x) -> (sin(x))^2, \cos^{2}(x) -> (cos(x))^2
  // (before braces are rewritten below, so the ^{2} form is still recognisable)
  str = str.replace(/\\?(sin|cos|tan|sec|csc|cot)\^\{?(\d+)\}?\s*\(([^)]+)\)/gi, '($1($3))^$2');
  str = str.replace(/\\?(sin|cos|tan|sec|csc|cot)\^\{?(\d+)\}?\s*([a-zA-Z0-9]+)/gi, '($1($3))^$2');

  // Convert braced structure from the inside out, so nesting works in any combination:
  //   \frac{x^{2}}{4}, \frac{\sqrt{x}}{2}, \sqrt{\frac{a}{b}}, \frac{1}{\frac{1}{x}}
  // Each pass rewrites the groups that no longer contain braces.
  let structureMatched = true;
  let safetyCount = 0;
  while (structureMatched && safetyCount < 12) {
    safetyCount++;
    const prevStr = str;
    // Exponent notation x^{2} -> x^(2)
    str = str.replace(/\^\{([^{}]+)\}/g, '^($1)');
    // LaTeX roots: \sqrt[n]{x} -> (x)^(1/n), \sqrt{x} -> sqrt(x)
    str = str.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, '(($2)^(1/($1)))');
    str = str.replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)');
    // LaTeX fractions \frac{a}{b} -> ((a)/(b))
    str = str.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
    // LaTeX absolute value \abs{x} -> abs(x)
    str = str.replace(/\\abs\{([^{}]+)\}/g, 'abs($1)');
    structureMatched = str !== prevStr;
  }

  str = str.replace(/\\sqrt\s*([a-zA-Z0-9]+)/g, 'sqrt($1)');

  // Convert |x| -> abs(x)
  str = str.replace(/\|([^|]+)\|/g, 'abs($1)');

  // Convert LaTeX trig & function symbols
  str = str.replace(/\\sin/gi, 'sin');
  str = str.replace(/\\cos/gi, 'cos');
  str = str.replace(/\\tan/gi, 'tan');
  str = str.replace(/\\sec/gi, 'sec');
  str = str.replace(/\\csc/gi, 'csc');
  str = str.replace(/\\cot/gi, 'cot');
  str = str.replace(/\\arcsin/gi, 'asin');
  str = str.replace(/\\arccos/gi, 'acos');
  str = str.replace(/\\arctan/gi, 'atan');
  str = str.replace(/\\exp/gi, 'exp');
  str = str.replace(/\\log/gi, 'log10');
  str = str.replace(/\\ln/gi, 'log');

  // Convert raw user-typed ln(x) -> log(x) (MathJS uses log for natural log)
  str = str.replace(/\bln\s*\(/gi, 'log(');
  str = str.replace(/\bln\s*([a-zA-Z0-9])/gi, 'log($1)');

  // Convert user-typed log10(x) or log(x)
  str = str.replace(/\\cdot/g, '*');
  str = str.replace(/\\times/g, '*');
  str = str.replace(/\\pi/gi, 'pi');
  str = str.replace(/\\theta/gi, 'theta');

  // A function written without brackets takes the next term: sin x -> sin(x), cos 2x -> cos(2x)
  str = str.replace(
    /(?<![a-zA-Z])(asin|acos|atan|sin|cos|tan|sec|csc|cot|log10|log|exp)\s+([0-9.]*[a-zA-Z]+|[0-9.]+)/g,
    '$1($2)'
  );

  // Convert exponent notation x^{2} -> x^(2)
  str = str.replace(/\^\{([^}]+)\}/g, '^($1)');

  // Fix implicit multiplication:
  // (The look-behind keeps digits that belong to a name, as in log10, out of rules 1 and 2:
  //  without it \log(x) became log10*(x).)
  // 1. Number followed by variable / function: 2x -> 2*x, 3.5pi -> 3.5*pi, 4sin(x) -> 4*sin(x)
  str = str.replace(/(?<![a-zA-Z_\d.])(\d+(?:\.\d+)?)\s*([a-zA-Z]|pi|sqrt|sin|cos|tan|log|exp|abs)\b/g, '$1*$2');
  // 2. Number followed by parenthesis: 2(x+1) -> 2*(x+1)
  str = str.replace(/(?<![a-zA-Z_\d.])(\d+(?:\.\d+)?)\s*\(/g, '$1*(');
  // 3. Variable followed by parenthesis: x(x+1) -> x*(x+1) (except for known functions)
  str = str.replace(/\b(?!(?:sin|cos|tan|asin|acos|atan|sec|csc|cot|sqrt|log|log10|exp|abs)\b)([a-zA-Z])\s*\(/g, '$1*(');
  // 4. Closing parenthesis followed by opening parenthesis or variable: (x+1)(x-1) -> (x+1)*(x-1), (x+1)x -> (x+1)*x
  str = str.replace(/\)\s*\(/g, ')*(');
  str = str.replace(/\)\s*([a-zA-Z0-9])/g, ')*$1');
  // 5. Variable followed by another variable or constant: e.g. pi x -> pi*x
  str = str.replace(/\b(pi|e)\s+([a-zA-Z])/g, '$1*$2');
  str = str.replace(/\b([a-zA-Z])\s+(pi|e)\b/g, '$1*$2');

  return str.trim();
}

/**
 * Generates continuous high-resolution (x, y) plot dataset using mathjs.
 */
export function generateGraphDatasetFromLatex(latexStr, label = '', domain = [-10, 10], colorIndex = 0) {
  const expr = extractExpressionFromLatex(latexStr);
  if (!expr) return null;

  const points = [];
  const labels = [];
  const numSteps = 400; // High resolution sampling for smooth curves
  const minX = domain[0];
  const maxX = domain[1];
  const step = (maxX - minX) / numSteps;

  let compiled = null;
  try {
    compiled = math.compile(expr);
  } catch (err) {
    console.warn('[equationToGraph] Failed to compile math expression:', expr, err);
    return null;
  }

  const currentScope = scopeManager.getScopeObject();
  let prevY = null;

  for (let i = 0; i <= numSteps; i++) {
    const x = Number((minX + i * step).toFixed(3));
    labels.push(x);

    try {
      let yVal = compiled.evaluate({ ...currentScope, x, e: Math.E, pi: Math.PI });

      // Handle Complex numbers or object outputs from mathjs
      if (yVal && typeof yVal === 'object' && 're' in yVal) {
        yVal = Math.abs(yVal.im) < 1e-9 ? yVal.re : NaN;
      }

      if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal) && Math.abs(yVal) <= 500) {
        // Asymptote / Singularity Detection (e.g. tan(x) or 1/x jumping between extreme limits)
        if (prevY !== null && Math.abs(yVal - prevY) > 60) {
          points.push({ x, y: null });
        } else {
          points.push({ x, y: Number(yVal.toFixed(4)) });
        }
        prevY = yVal;
      } else {
        points.push({ x, y: null });
        prevY = null;
      }
    } catch (e) {
      points.push({ x, y: null });
      prevY = null;
    }
  }

  const strokeColor = CURVE_COLORS[colorIndex % CURVE_COLORS.length];
  const displayLabel = label || latexStr || expr;

  return {
    label: displayLabel,
    rawExpr: expr,
    latex: latexStr,
    data: points,
    borderColor: strokeColor,
    backgroundColor: strokeColor + '15',
    borderWidth: 2.5,
    tension: 0.2,
    pointRadius: 0,
    pointHoverRadius: 6,
  };
}

/**
 * Puts an Equation Block's curve onto a graph without disturbing the graph's other curves.
 * The curve is tagged with its source block, so editing the equation later updates that one
 * curve in place (keeping its colour and visibility) instead of replacing the whole graph.
 *
 * @param {Array<Object>} existingDatasets - The graph's current curves
 * @param {string} sourceBlockId - The Equation Block the curve comes from
 * @param {string} latexStr - The equation
 * @returns {Array<Object>|null} New dataset list, or null when the equation cannot be plotted
 */
export function upsertCurveForSource(existingDatasets, sourceBlockId, latexStr) {
  const datasets = Array.isArray(existingDatasets) ? existingDatasets : [];

  let idx = datasets.findIndex((ds) => ds.sourceBlockId === sourceBlockId);
  // A graph made before curves were tagged holds exactly the equation's one curve
  if (idx < 0 && datasets.length === 1 && !datasets[0].sourceBlockId) idx = 0;

  const fresh = generateGraphDatasetFromLatex(latexStr, latexStr, [-10, 10], idx >= 0 ? idx : datasets.length);
  if (!fresh) return null;

  if (idx < 0) return [...datasets, { ...fresh, sourceBlockId }];

  const previous = datasets[idx];
  const updated = {
    ...fresh,
    sourceBlockId,
    borderColor: previous.borderColor || fresh.borderColor,
    backgroundColor: previous.backgroundColor || fresh.backgroundColor,
    hidden: Boolean(previous.hidden),
  };
  return datasets.map((ds, i) => (i === idx ? updated : ds));
}

/**
 * Appends a new curve dataset to an existing GraphBlock content payload.
 */
export function appendCurveToGraphBlock(existingGraphData, newLatexStr, label, domain = [-10, 10]) {
  const currentDatasets = existingGraphData?.datasets || [];
  const colorIndex = currentDatasets.length;
  const newDataset = generateGraphDatasetFromLatex(newLatexStr, label || newLatexStr, domain, colorIndex);

  if (!newDataset) return existingGraphData;

  return {
    ...existingGraphData,
    datasets: [...currentDatasets, newDataset],
  };
}
