/**
 * Variable Separable: the maths for /variable-separable. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'separable'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "separable", ics });
}
