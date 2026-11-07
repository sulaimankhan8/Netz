'use client';
// The live triple integral calculator. The maths is in src/app/utils/engines/triple-integral.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/triple-integral';

const EXAMPLES = [
  { label: 'cube: ∫∫∫ (x + y + z)', input: { f: 'x + y + z', order: 'dz dy dx', l1from: '0', l1to: '1', l2from: '0', l2to: '1', l3from: '0', l3to: '1' } },
  { label: 'tetrahedron volume', input: { f: '1', order: 'dz dy dx', l1from: '0', l1to: '1 - x - y', l2from: '0', l2to: '1 - x', l3from: '0', l3to: '1' } },
  { label: 'Grewal: ∫∫∫ eˣ⁺ʸ⁺ᶻ', input: { f: 'e^(x + y + z)', order: 'dz dy dx', l1from: '0', l1to: 'x + y', l2from: '0', l2to: 'x', l3from: '0', l3to: '1' } },
  { label: 'cylindrical: cone volume', input: { f: 'r', order: 'dz dr dθ', l1from: 'r', l1to: '1', l2from: '0', l2to: '1', l3from: '0', l3to: '2pi' } },
  { label: 'spherical: unit ball', input: { f: 'ρ^2 sin(φ)', order: 'dρ dφ dθ', l1from: '0', l1to: '1', l2from: '0', l2to: 'pi', l3from: '0', l3to: '2pi' } },
];

export default function TripleIntegralCalculator() {
  return (
    <SymbolicCalculator
      id="triple-integral" unit={6} title="Triple Integral Engine" button="Integrate"
      start={{ f: 'x + y + z', order: 'dz dy dx', l1from: '0', l1to: '1', l2from: '0', l2to: '1', l3from: '0', l3to: '1' }}
      fields={[
        { key: 'f', label: 'Integrand', placeholder: 'e.g. x y z', wide: true },
        { key: 'order', label: 'Order (innermost first)', placeholder: 'dz dy dx', wide: true },
        { key: 'l1from', label: 'Innermost: from', placeholder: 'may use the two outer letters' },
        { key: 'l1to', label: 'Innermost: to', placeholder: 'may use the two outer letters' },
        { key: 'l2from', label: 'Middle: from', placeholder: 'may use the outer letter' },
        { key: 'l2to', label: 'Middle: to', placeholder: 'may use the outer letter' },
        { key: 'l3from', label: 'Outermost: from', placeholder: 'a number' },
        { key: 'l3to', label: 'Outermost: to', placeholder: 'a number' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Cylindrical and spherical work the same way: type θ, φ, ρ (or theta, phi, rho) and include the Jacobian (r, or ρ² sin φ) in the integrand."
      resultLabel={(a) => (a.verified ? 'Value' : 'Value (numerical)')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`${a.setup} = ${a.valueTex}`} /></div>
          {!/^-?\d+$/.test(a.valueTex) && <p className="text-sm font-mono">≈ {Number(a.value.toPrecision(10))}</p>}
        </div>
      )}
    />
  );
}
