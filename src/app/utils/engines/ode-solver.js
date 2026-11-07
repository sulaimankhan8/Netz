/**
 * Differential Equation: the maths for /differential-equation-solver. The work is done by src/app/utils/symbolic/ode.js, which
 * recognises the type and picks the method.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "auto", ics });
}
