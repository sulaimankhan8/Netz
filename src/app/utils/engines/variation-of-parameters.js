/**
 * Variation of Parameters: the maths for /variation-of-parameters. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'variation'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "variation", ics });
}
