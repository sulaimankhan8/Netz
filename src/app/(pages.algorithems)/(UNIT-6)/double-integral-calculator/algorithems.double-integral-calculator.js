'use client';
// The live double integral calculator. The maths is in src/app/utils/engines/double-integral.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import RegionSketch from '@/app/components/method/RegionSketch';
import { solve } from '@/app/utils/engines/double-integral';

const ORDERS = [{ value: 'dydx', label: 'dy dx' }, { value: 'dxdy', label: 'dx dy' }, { value: 'polar', label: 'Polar: dr dθ' }];
const INNER = { dydx: 'y', dxdy: 'x', polar: 'r' }, OUTER = { dydx: 'x', dxdy: 'y', polar: 'θ' };
const EXAMPLES = [
  { label: '∫₀¹∫₀ˣ (x² + y²) dy dx', input: { order: 'dydx', f: 'x^2 + y^2', innerFrom: '0', innerTo: 'x', outerFrom: '0', outerTo: '1' } },
  { label: 'area between y = x² and y = x', input: { order: 'dydx', f: '1', innerFrom: 'x^2', innerTo: 'x', outerFrom: '0', outerTo: '1' } },
  { label: '∫₀¹∫₀ʸ e^(y²) dx dy', input: { order: 'dxdy', f: 'e^(y^2)', innerFrom: '0', innerTo: 'y', outerFrom: '0', outerTo: '1' } },
  { label: 'polar: r = 2 sin θ', input: { order: 'polar', f: 'r', innerFrom: '0', innerTo: '2 sin(θ)', outerFrom: '0', outerTo: 'pi' } },
  { label: 'polar: ∫∫ r³ over the unit disc', input: { order: 'polar', f: 'r^3', innerFrom: '0', innerTo: '1', outerFrom: '0', outerTo: '2pi' } },
];

export default function DoubleIntegralCalculator() {
  return (
    <SymbolicCalculator
      id="double-integral" unit={6} title="Double Integral Engine" button="Integrate"
      start={{ order: 'dydx', f: 'x^2 + y^2', innerFrom: '0', innerTo: 'x', outerFrom: '0', outerTo: '1' }}
      fields={[
        { key: 'order', label: 'Order', kind: 'choice', options: ORDERS },
        { key: 'f', label: 'Integrand', placeholder: 'e.g. x y^2', wide: true },
        { key: 'innerFrom', label: 'Inner: from', placeholder: 'may use the outer letter' },
        { key: 'innerTo', label: 'Inner: to', placeholder: 'may use the outer letter' },
        { key: 'outerFrom', label: 'Outer: from', placeholder: 'a number' },
        { key: 'outerTo', label: 'Outer: to', placeholder: 'a number' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="dy dx: inner limits in x, outer limits are numbers. Polar: type θ as theta, and include the r from dA = r dr dθ in the integrand."
      resultLabel={(a) => (a.verified ? 'Value' : 'Value (numerical)')}
      renderResult={(a, v) => (
        <div className="space-y-3 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`${a.setup} = ${a.valueTex}`} /></div>
          {!/^-?\d+$/.test(a.valueTex) && <p className="text-sm font-mono">≈ {Number(a.value.toPrecision(10))}</p>}
          {a.region && <RegionSketch {...a.region} title={`The region: ${OUTER[v.order]} from ${v.outerFrom} to ${v.outerTo}, ${INNER[v.order]} from ${v.innerFrom} to ${v.innerTo}`} />}
        </div>
      )}
    />
  );
}
