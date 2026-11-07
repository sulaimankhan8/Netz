/**
 * Linear Equation: the maths for /linear-differential-equation. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'linear'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "linear", ics });
}
