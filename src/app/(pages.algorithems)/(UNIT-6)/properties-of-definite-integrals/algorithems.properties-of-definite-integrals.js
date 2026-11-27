'use client';
// The live properties-of-definite-integrals calculator. The maths is in src/app/utils/engines/definite-integral-properties.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/definite-integral-properties';

const EXAMPLES = [
  { label: 'odd: x³ on [−1, 1]', input: { f: 'x^3', a: '-1', b: '1' } },
  { label: 'even: x² on [−2, 2]', input: { f: 'x^2', a: '-2', b: '2' } },
  { label: "King's rule: sin x/(sin x + cos x) on [0, π/2]", input: { f: 'sin(x)/(sin(x) + cos(x))', a: '0', b: 'pi/2' } },
  { label: 'odd: x cos x on [−π, π]', input: { f: 'x*cos(x)', a: '-pi', b: 'pi' } },
  { label: 'periodic: sin x on [0, 2π]', input: { f: 'sin(x)', a: '0', b: '2pi' } },
  { label: 'mirror: sin² x on [0, π]', input: { f: 'sin(x)^2', a: '0', b: 'pi' } },
  { label: 'swap limits: x² from 3 to 1', input: { f: 'x^2', a: '3', b: '1' } },
];

const STATUS = { yes: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200', no: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300', always: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200' };

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="definite-integral-properties" unit={6} title="Definite Integral Properties Engine" button="Test the Properties"
      start={{ f: 'x^3', a: '-1', b: '1' }}
      fields={[
        { key: 'f', label: 'f(x) =', placeholder: 'e.g. x^3', wide: true, maths: true },
        { key: 'a', label: 'Lower limit a', placeholder: 'e.g. -1' },
        { key: 'b', label: 'Upper limit b', placeholder: 'e.g. 1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="NETZ finds the value, then tests each property on your integral and tells you which shortcut applies."
      resultLabel={(a) => (a.shortcuts ? `${a.shortcuts} shortcut${a.shortcuts === 1 ? '' : 's'} apply here` : 'No symmetry shortcut applies')}
      renderResult={(a) => (
        <div className="space-y-3 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\int_{${a.a}}^{${a.b}} ${a.f}\\,d${a.variable} = ${a.valueTex}`} /></div>
          <ul className="space-y-2">
            {a.props.map((p) => {
              const kind = p.applies ? (p.always ? 'always' : 'yes') : 'no';
              return (
                <li key={p.name} className="rounded-xl border border-black/20 dark:border-neutral-700 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{p.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${STATUS[kind]}`}>{kind === 'yes' ? 'applies here' : kind === 'always' ? 'always true' : 'not here'}</span>
                  </div>
                  <div className="overflow-x-auto"><BlockMath math={p.formula} /></div>
                  <p className="text-neutral-700 dark:text-neutral-300">{p.note}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    />
  );
}
