/**
 * CF + PI: the maths for /ode-constant-coefficients. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'constant'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "constant", ics });
}
