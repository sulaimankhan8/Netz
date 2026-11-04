'use client';
// The live increasing/decreasing calculator. The maths is in src/app/utils/engines/monotonicity.js.
import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Notes } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import CoordPlot from '@/app/components/method/CoordPlot';
import { plotView, around } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/monotonicity';

const START = { f: '2x^3 - 9x^2 + 12x + 1', a: '', b: '' };
const EXAMPLES = [
  { label: 'x⁴ − 2x²', input: { f: 'x^4 - 2x^2', a: '', b: '' } },
  { label: 'x/(x²+1)', input: { f: 'x/(x^2+1)', a: '', b: '' } },
  { label: 'x³', input: { f: 'x^3', a: '', b: '' } },
  { label: 'sin x + cos x on [0, 2π]', input: { f: 'sin(x) + cos(x)', a: '0', b: '2pi' } },
  { label: 'x eˣ', input: { f: 'x e^x', a: '', b: '' } },
];

export default function MonotonicityCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('monotonicity', 6, answer, () => ({ fn: v.f }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = (override) => {
    try { setError(''); setAnswer(solve({ ...v, ...override })); } catch (e) { setAnswer(null); setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expression.'); }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const r = answer?.range;
  const [x0, x1] = !answer ? [0, 1] : Number.isFinite(r.lo) && Number.isFinite(r.hi) ? [r.lo, r.hi] : around(answer.criticalPoints.map((c) => c.x));

  return (
    <div className="w-full space-y-6">
      <CalcCard title="Increasing & Decreasing Engine" actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}>
        <ErrorBox>{error}</ErrorBox>
        <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. x^3 - 3x" onChange={(f) => set({ f })} onEnter={() => run()} />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Field label="From (optional)" value={v.a} inputMode="text" onChange={(a) => set({ a })} onEnter={() => run()} />
          <Field label="To (optional)" value={v.b} inputMode="text" onChange={(b) => set({ b })} onEnter={() => run()} />
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Polynomials and fractions are solved over all real numbers. Trig functions use [0, 2π] unless you give an interval.</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto"><FiCheckCircle className="w-4 h-4 mr-2" /> Find Intervals</EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Where f is increasing and decreasing">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={`f'(${answer.variable}) = ${answer.derivative}`} /></div>
                <div className="overflow-x-auto"><BlockMath math={answer.increasing ? `\\text{Increasing on } ${answer.increasing}` : '\\text{Never increasing}'} /></div>
                <div className="overflow-x-auto"><BlockMath math={answer.decreasing ? `\\text{Decreasing on } ${answer.decreasing}` : '\\text{Never decreasing}'} /></div>
              </div>
              <div className="flex justify-center">
                <CoordPlot fn={answer.fAt} view={plotView([answer.fAt], x0, x1)} points={answer.criticalPoints.filter((c) => Number.isFinite(c.y)).map((c) => ({ x: c.x, y: c.y, label: null }))} />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Step-by-Step Working">
          <div className="overflow-x-auto rounded-xl border border-black/20 dark:border-neutral-700">
            <table className="w-full text-sm text-black dark:text-white">
              <thead className="bg-neutral-100 dark:bg-neutral-800 text-xs font-mono uppercase">
                <tr><th className="px-3 py-2 text-left">Interval</th><th className="px-3 py-2">Test x</th><th className="px-3 py-2">Sign of f′</th><th className="px-3 py-2 text-left">f is</th></tr>
              </thead>
              <tbody>
                {answer.table.map((row, i) => (
                  <tr key={i} className="border-t border-black/10 dark:border-neutral-700">
                    <td className="px-3 py-2 whitespace-nowrap"><InlineMath math={row.interval} /></td>
                    <td className="px-3 py-2 text-center"><InlineMath math={row.test} /></td>
                    <td className="px-3 py-2 text-center font-mono font-bold">{row.sign || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.behaviour}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <StepList steps={answer.steps} />
        </StepsCard>
      )}
      {answer?.notes?.length > 0 && <Notes notes={answer.notes} />}
    </div>
  );
}
