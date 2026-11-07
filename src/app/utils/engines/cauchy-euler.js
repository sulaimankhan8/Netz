/**
 * Cauchy–Euler: the maths for /cauchy-euler-equation. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'cauchy-euler'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "cauchy-euler", ics });
}
