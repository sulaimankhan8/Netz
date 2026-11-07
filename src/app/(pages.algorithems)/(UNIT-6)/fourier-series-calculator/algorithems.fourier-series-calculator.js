'use client';
// The live Fourier series calculator. The maths is in src/app/utils/engines/fourier-series.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/fourier-series';

const MODES = [{ value: 'full', label: 'Full range' }, { value: 'half-cos', label: 'Half-range cosine' }, { value: 'half-sin', label: 'Half-range sine' }];
const EXAMPLES = [
  { label: 'x on (−π, π)', input: { mode: 'full', f: 'x', from: '-pi', to: 'pi' } },
  { label: 'x² on (−π, π)', input: { mode: 'full', f: 'x^2', from: '-pi', to: 'pi' } },
  { label: 'square wave', input: { mode: 'full', f: '-1 for -pi < x < 0; 1 for 0 < x < pi', from: '-pi', to: 'pi' } },
  { label: 'x on (0, 2π)', input: { mode: 'full', f: 'x', from: '0', to: '2pi' } },
  { label: 'x sin x on (−π, π)', input: { mode: 'full', f: 'x sin(x)', from: '-pi', to: 'pi' } },
  { label: 'half-range sine of x on (0, 2)', input: { mode: 'half-sin', f: 'x', from: '0', to: '2' } },
  { label: 'half-range cosine of sin x on (0, π)', input: { mode: 'half-cos', f: 'sin(x)', from: '0', to: 'pi' } },
];

export default function FourierCalculator() {
  return (
    <SymbolicCalculator
      id="fourier-series" unit={6} title="Fourier Series Engine" button="Find the Series"
      start={{ mode: 'full', f: 'x', from: '-pi', to: 'pi' }}
      fields={[
        { key: 'mode', label: 'Series', kind: 'choice', options: MODES },
        { key: 'f', label: 'f(x), or pieces separated by ;', placeholder: 'e.g. x^2, or 0 for -pi < x < 0; x for 0 < x < pi', wide: true },
        { key: 'from', label: 'Interval from', placeholder: '-pi' },
        { key: 'to', label: 'Interval to', placeholder: 'pi' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use pi for π. Half-range series run from 0 to L."
      resultLabel="Fourier coefficients"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          {a.a0 !== undefined && <div className="overflow-x-auto"><BlockMath math={`a_0 = ${a.a0}`} /></div>}
          {a.an && <div className="overflow-x-auto"><BlockMath math={`a_n = ${a.an}`} /></div>}
          {a.bn && <div className="overflow-x-auto"><BlockMath math={`b_n = ${a.bn}`} /></div>}
          {a.special.map((s) => <div key={s.which + s.n} className="overflow-x-auto"><BlockMath math={`${s.which}_{${s.n}} = ${s.value}`} /></div>)}
          <div className="overflow-x-auto"><BlockMath math={a.series} /></div>
          <CoordPlot fn={a.plot.fn} fn2={a.plot.fn2} view={a.plot.view} />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Solid: f(x). Dashed: the sum of the first 15 terms.</p>
        </div>
      )}
    />
  );
}
