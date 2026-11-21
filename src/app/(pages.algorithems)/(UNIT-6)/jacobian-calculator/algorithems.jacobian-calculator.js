'use client';
// The live Jacobian calculator. The maths is in src/app/utils/engines/jacobian.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/jacobian';

const EXAMPLES = [
  { label: 'polar: x = r cos θ, y = r sin θ', input: { f1: 'x = r cos(θ)', f2: 'y = r sin(θ)', f3: '', wrt: 'r, θ' } },
  { label: 'u = x + y, v = x − y', input: { f1: 'u = x + y', f2: 'v = x - y', f3: '', wrt: '' } },
  { label: 'u = x²/y, v = y²/x', input: { f1: 'u = x^2/y', f2: 'v = y^2/x', f3: '', wrt: '' } },
  { label: 'spherical (3 × 3)', input: { f1: 'x = r sin(θ) cos(φ)', f2: 'y = r sin(θ) sin(φ)', f3: 'z = r cos(θ)', wrt: 'r, θ, φ' } },
  { label: 'dependent: x + y, (x + y)²', input: { f1: 'u = x + y', f2: 'v = (x + y)^2', f3: '', wrt: '' } },
];

export default function JacobianCalculator() {
  return (
    <SymbolicCalculator
      id="jacobian" unit={6} title="Jacobian Engine" button="Find the Jacobian"
      start={{ f1: 'x = r cos(θ)', f2: 'y = r sin(θ)', f3: '', wrt: 'r, θ' }}
      fields={[
        { key: 'f1', label: 'First function', placeholder: 'e.g. u = x + y' },
        { key: 'f2', label: 'Second function', placeholder: 'e.g. v = x y' },
        { key: 'f3', label: 'Third function (optional)', placeholder: 'leave empty for 2 × 2' },
        { key: 'wrt', label: 'With respect to (optional)', placeholder: 'e.g. x, y or r, θ' },
      ]}
      examples={EXAMPLES} solve={solve}
      resultLabel="Jacobian"
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`J = ${a.symbolic} = ${a.det}`} /></div>
          {a.dependent && <p className="text-sm font-semibold">J = 0 everywhere: the functions are functionally dependent.</p>}
        </div>
      )}
    />
  );
}
