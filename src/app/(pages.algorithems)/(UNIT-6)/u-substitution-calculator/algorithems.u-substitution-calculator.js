'use client';
// The live u-substitution calculator. The maths is in src/app/utils/engines/u-substitution.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/u-substitution';
import { sig } from '@/app/utils/numberFormat';

const EXAMPLES = [
  { label: '2x(x² + 1)³', input: { f: '2*x*(x^2 + 1)^3', u: '', a: '', b: '' } },
  { label: 'x eˣ²', input: { f: 'x*e^(x^2)', u: '', a: '', b: '' } },
  { label: 'cos x / sin x', input: { f: 'cos(x)/sin(x)', u: '', a: '', b: '' } },
  { label: 'sin³x cos x', input: { f: 'sin(x)^3*cos(x)', u: '', a: '', b: '' } },
  { label: 'x / (x² + 1), you pick u', input: { f: 'x/(x^2 + 1)', u: 'x^2 + 1', a: '', b: '' } },
  { label: '2x(x² + 1)³ from 0 to 1', input: { f: '2*x*(x^2 + 1)^3', u: '', a: '0', b: '1' } },
  { label: '(3x + 2)⁵', input: { f: '(3x + 2)^5', u: '', a: '', b: '' } },
  { label: 'ln x / x', input: { f: 'ln(x)/x', u: '', a: '', b: '' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="u-substitution" unit={6} title="u-Substitution Engine" button="Substitute"
      start={{ f: '2*x*(x^2 + 1)^3', u: '', a: '', b: '' }}
      fields={[
        { key: 'f', label: 'Integrand f(x) =', placeholder: 'e.g. 2*x*(x^2 + 1)^3', wide: true, maths: true },
        { key: 'u', label: 'Your choice of u (optional)', placeholder: 'e.g. x^2 + 1', maths: true },
        { key: 'a', label: 'Lower limit (optional)', placeholder: 'e.g. 0' },
        { key: 'b', label: 'Upper limit (optional)', placeholder: 'e.g. 1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Put * between a letter and a bracket: 2*x*(x^2 + 1)^3. Leave u empty and NETZ looks for one. Fill in both limits for a definite integral."
      resultLabel={(a) => (a.definite ? 'Definite integral' : 'Integral')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-sm"><BlockMath math={`u = ${a.u}, \\qquad du = \\left(${a.du}\\right)d${a.variable}`} /></div>
          <div className="overflow-x-auto text-sm"><BlockMath math={`\\int ${a.f}\\,d${a.variable} \\ \\to \\ \\int ${a.integrandInU}\\,du`} /></div>
          {a.definite
            ? <div className="overflow-x-auto text-lg"><BlockMath math={`\\int_{${a.definite.a}}^{${a.definite.b}} ${a.f}\\,d${a.variable} = ${a.definite.valueTex}`} /></div>
            : <div className="overflow-x-auto text-lg"><BlockMath math={`\\int ${a.f}\\,d${a.variable} = ${a.answer} + C`} /></div>}
          {a.definite && Number.isFinite(a.definite.value) && <p className="text-sm font-mono">≈ {sig(a.definite.value, 8)}</p>}
        </div>
      )}
    />
  );
}
