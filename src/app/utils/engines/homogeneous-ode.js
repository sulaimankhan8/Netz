/**
 * Homogeneous Equation: the maths for /homogeneous-differential-equation. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'homogeneous'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "homogeneous", ics });
}
