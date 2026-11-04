/**
 * Reading what students type, shared by the engines: functions like "x + y", number lists, whole numbers.
 * Every problem becomes an EngineError with a sentence the page can show as is.
 */
import { EngineError } from '../numeric/steps';
import { parseNumber, requireNumber } from '../numeric/fraction';
import { parseUserFunction, evaluateMath } from '../evaluateMath';

/** "x^2 + y" → (x, y) => number. vars: the variable names in order. */
export function readFunction(text, vars = ['x'], label = 'f(x)') {
  const s = String(text ?? '').trim();
  if (!s) throw new EngineError(`${label} is empty.`);
  let f;
  try {
    f = parseUserFunction(s, vars);
  } catch {
    throw new EngineError(`${label}: "${s}" could not be read. Use * for multiply and ^ for powers, e.g. x^2 + 3*y.`);
  }
  // A trial value catches letters the function doesn't know (e.g. z in f(x, y)) with a clear message
  try {
    f(...vars.map(() => 0.37));
  } catch (e) {
    const sym = String(e?.message || '').match(/Undefined symbol (\w+)/);
    if (sym) throw new EngineError(`${label} uses "${sym[1]}", but only ${vars.join(' and ')} can be used here.`);
  }
  // Wrap so a bad value at one point (e.g. log of a negative) names the point instead of a raw maths error
  return (...args) => {
    try {
      return f(...args);
    } catch {
      throw new EngineError(`${label} has no real value at ${vars.map((v, i) => `${v} = ${Number(args[i].toPrecision(6))}`).join(', ')}.`);
    }
  };
}

/** "1, 2.5, -3/4" → [1, 2.5, -0.75]. */
export function readList(text, label, min = 1) {
  const parts = String(text ?? '').split(/[,;\s]+/).filter(Boolean);
  if (parts.length < min) throw new EngineError(`${label}: enter at least ${min} number${min === 1 ? '' : 's'}, separated by commas.`);
  return parts.map((p, i) => {
    const v = parseNumber(p);
    if (!Number.isFinite(v)) throw new EngineError(`${label}: item ${i + 1}, "${p}", is not a number.`);
    return v;
  });
}

export const readNumber = requireNumber;

/** A number or a constant expression: "2", "1/3", "pi", "pi/2", "2*e", "sqrt(2)" (for limits of integration). */
export function readConstant(text, label) {
  const s = String(text ?? '').trim();
  if (!s) throw new EngineError(`${label} is empty.`);
  const plain = parseNumber(s);
  if (Number.isFinite(plain)) return plain;
  try {
    const v = evaluateMath(s.replace(/π/g, 'pi'), {});
    if (Number.isFinite(v)) return v;
  } catch { /* falls through to the message below */ }
  throw new EngineError(`${label}: "${s}" is not a number. Numbers like 2, 1/3, pi or pi/2 work.`);
}

/** A whole number between min and max. */
export function readWhole(text, label, min = 1, max = 1000) {
  const v = requireNumber(text, label);
  if (!Number.isInteger(v) || v < min || v > max) throw new EngineError(`${label} must be a whole number from ${min} to ${max}.`);
  return v;
}

/** A tolerance: a small positive number. */
export function readTolerance(text, label = 'Tolerance') {
  const v = requireNumber(text, label);
  if (!(v > 0) || v >= 1) throw new EngineError(`${label} must be between 0 and 1, e.g. 0.0001.`);
  return v;
}
