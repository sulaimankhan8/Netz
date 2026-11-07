/**
 * Bernoulli Equation: the maths for /bernoulli-equation. The work is done by src/app/utils/symbolic/ode.js with the method fixed to 'bernoulli'.
 */
import { solveODE } from '../symbolic/ode';

export function solve({ eq, ics = '' }) {
  return solveODE(eq, { method: "bernoulli", ics });
}
