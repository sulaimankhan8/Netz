'use client';
// The live integration-by-parts calculator. The maths is in src/app/utils/engines/integration-by-parts.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/integration-by-parts';
import { sig } from '@/app/utils/numberFormat';

const EXAMPLES = [
  { label: 'x eˣ', input: { f: 'x*e^x', u: '', a: '', b: '' } },
  { label: 'x sin x', input: { f: 'x*sin(x)', u: '', a: '', b: '' } },
  { label: 'ln x', input: { f: 'ln(x)', u: '', a: '', b: '' } },
  { label: 'x² eˣ (two rounds)', input: { f: 'x^2*e^x', u: '', a: '', b: '' } },
  { label: 'x² sin x (two rounds)', input: { f: 'x^2*sin(x)', u: '', a: '', b: '' } },
  { label: 'tan⁻¹ x', input: { f: 'atan(x)', u: '', a: '', b: '' } },
  { label: 'eˣ sin x (comes back)', input: { f: 'e^x*sin(x)', u: '', a: '', b: '' } },
  { label: 'x eˣ from 0 to 1', input: { f: 'x*e^x', u: '', a: '0', b: '1' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="integration-by-parts" unit={6} title="Integration by Parts Engine" button="Integrate by Parts"
      start={{ f: 'x*e^x', u: '', a: '', b: '' }}
      fields={[
        { key: 'f', label: 'Integrand f(x) =', placeholder: 'e.g. x*e^x', wide: true, maths: true },
        { key: 'u', label: 'Your choice of u (optional)', placeholder: 'e.g. x', maths: true },
        { key: 'a', label: 'Lower limit (optional)', placeholder: 'e.g. 0' },
        { key: 'b', label: 'Upper limit (optional)', placeholder: 'e.g. 1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Put * between the two factors: x*e^x. Leave u empty to let NETZ pick it with ILATE; you can type your own u to compare."
      resultLabel={(a) => (a.definite ? 'Definite integral' : 'Integral')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-sm">
            {a.rounds.map((r) => <BlockMath key={r.k} math={`${a.rounds.length > 1 ? `\\text{Round ${r.k}: }` : ''}u = ${r.u}, \\quad dv = ${r.dv}\\,d${a.variable}, \\quad du = ${r.du}\\,d${a.variable}, \\quad v = ${r.v}`} />)}
          </div>
          {a.definite
            ? <div className="overflow-x-auto text-lg"><BlockMath math={`\\int_{${a.definite.a}}^{${a.definite.b}} ${a.f}\\,d${a.variable} = ${a.definite.valueTex}`} /></div>
            : <div className="overflow-x-auto text-lg"><BlockMath math={`\\int ${a.f}\\,d${a.variable} = ${a.answer} + C`} /></div>}
          {a.definite && Number.isFinite(a.definite.value) && <p className="text-sm font-mono">≈ {sig(a.definite.value, 8)}</p>}
        </div>
      )}
    />
  );
}
