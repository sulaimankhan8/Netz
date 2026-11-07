'use client';
// The live change of order calculator. The maths is in src/app/utils/engines/change-of-order.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import RegionSketch from '@/app/components/method/RegionSketch';
import { solve } from '@/app/utils/engines/change-of-order';

const ORDERS = [{ value: 'dydx', label: 'Given dy dx' }, { value: 'dxdy', label: 'Given dx dy' }];
const EXAMPLES = [
  { label: '∫₀¹∫ₓ¹ e^(y²) dy dx', input: { order: 'dydx', f: 'e^(y^2)', innerFrom: 'x', innerTo: '1', outerFrom: '0', outerTo: '1' } },
  { label: '∫₀¹∫_{x²}^{2−x} xy dy dx', input: { order: 'dydx', f: 'x y', innerFrom: 'x^2', innerTo: '2 - x', outerFrom: '0', outerTo: '1' } },
  { label: 'between y = x² and y = √x', input: { order: 'dydx', f: '1', innerFrom: 'x^2', innerTo: 'sqrt(x)', outerFrom: '0', outerTo: '1' } },
  { label: 'quarter circle, dx dy', input: { order: 'dxdy', f: 'x', innerFrom: '0', innerTo: 'sqrt(4 - y^2)', outerFrom: '0', outerTo: '2' } },
  { label: '∫₀¹∫_y^1 sin(x²) dx dy', input: { order: 'dxdy', f: 'sin(x^2)', innerFrom: 'y', innerTo: '1', outerFrom: '0', outerTo: '1' } },
];

export default function ChangeOfOrderCalculator() {
  return (
    <SymbolicCalculator
      id="change-of-order" unit={6} title="Change of Order Engine" button="Change the Order"
      start={{ order: 'dydx', f: 'e^(y^2)', innerFrom: 'x', innerTo: '1', outerFrom: '0', outerTo: '1' }}
      fields={[
        { key: 'order', label: 'The integral you have', kind: 'choice', options: ORDERS },
        { key: 'f', label: 'Integrand', placeholder: 'e.g. x y', wide: true },
        { key: 'innerFrom', label: 'Inner: from', placeholder: 'in the outer letter' },
        { key: 'innerTo', label: 'Inner: to', placeholder: 'in the outer letter' },
        { key: 'outerFrom', label: 'Outer: from', placeholder: 'a number' },
        { key: 'outerTo', label: 'Outer: to', placeholder: 'a number' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Works for regions bounded by lines, parabolas, square roots, circles and similar curves. The region may split into pieces."
      resultLabel={(a) => `Order changed (${a.pieces} piece${a.pieces === 1 ? '' : 's'})`}
      renderResult={(a) => (
        <div className="space-y-3 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.oldSetup} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={`= ${a.newSetup}`} /></div>
          <div className="overflow-x-auto"><BlockMath math={`= ${a.valueTex}`} /></div>
          {a.region && <RegionSketch {...a.region} title="The region, with a strip in the new direction" />}
        </div>
      )}
    />
  );
}
