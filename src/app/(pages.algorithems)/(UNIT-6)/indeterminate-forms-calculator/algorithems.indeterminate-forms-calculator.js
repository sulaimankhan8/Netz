'use client';
// The live indeterminate-forms calculator. The maths is in src/app/utils/engines/indeterminate-forms.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/indeterminate-forms';

const EXAMPLES = [
  { label: '0/0: (x² − 1)/(x − 1) at 1', input: { f: '(x^2 - 1)/(x - 1)', a: '1' } },
  { label: '0/0: sin x / x at 0', input: { f: 'sin(x)/x', a: '0' } },
  { label: '∞/∞: (2x² + 1)/(x² + 3) at ∞', input: { f: '(2x^2 + 1)/(x^2 + 3)', a: 'inf' } },
  { label: '0·∞: x ln x at 0', input: { f: 'x*ln(x)', a: '0' } },
  { label: '1^∞: (1 + 1/x)ˣ at ∞', input: { f: '(1 + 1/x)^x', a: 'inf' } },
  { label: '1^∞: (1 + x)^(1/x) at 0', input: { f: '(1 + x)^(1/x)', a: '0' } },
  { label: '0⁰: xˣ at 0', input: { f: 'x^x', a: '0' } },
  { label: 'not indeterminate: x² + 1 at 2', input: { f: 'x^2 + 1', a: '2' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="indeterminate-forms" unit={6} title="Indeterminate Forms Engine" button="Resolve"
      start={{ f: '(x^2 - 1)/(x - 1)', a: '1' }}
      fields={[
        { key: 'f', label: 'f(x) =', placeholder: 'e.g. (x^2 - 1)/(x - 1)', wide: true, maths: true },
        { key: 'a', label: 'x approaches', placeholder: 'a number, inf or -inf' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Type inf or -inf for infinity. NETZ looks at what each part tends to, names the form, rewrites it and finds the limit."
      resultLabel={(a) => (a.form ? `Form ${a.form}, resolved` : 'Not an indeterminate form')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          {a.form && <div className="overflow-x-auto text-lg"><BlockMath math={`\\lim_{${a.variable}\\to ${a.a}} ${a.f} \\ \\to \\ ${a.formTex}`} /></div>}
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\lim_{${a.variable}\\to ${a.a}} ${a.f} = ${a.valueTex}`} /></div>
        </div>
      )}
    />
  );
}
