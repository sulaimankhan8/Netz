/**
 * Exact Equation: the maths for /exact-differential-equation. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'exact'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "exact", ics });
}
