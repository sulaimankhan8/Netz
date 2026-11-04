'use client';
// The live Taylor / Maclaurin series calculator. The maths is in src/app/utils/engines/taylor-series.js.
import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Select } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import CoordPlot from '@/app/components/method/CoordPlot';
import { plotView } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/taylor-series';

const START = { f: 'e^x', a: '0', n: '4', at: '0.5' };
const EXAMPLES = [
  { label: 'sin x', input: { f: 'sin(x)', a: '0', n: '7', at: '' } },
  { label: 'cos x', input: { f: 'cos(x)', a: '0', n: '6', at: '' } },
  { label: 'ln(1 + x)', input: { f: 'ln(1+x)', a: '0', n: '5', at: '0.2' } },
  { label: '√x about 4', input: { f: 'sqrt(x)', a: '4', n: '3', at: '4.1' } },
  { label: 'tan x', input: { f: 'tan(x)', a: '0', n: '7', at: '' } },
];

export default function TaylorSeriesCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('taylor-series', 6, answer, () => ({ fn: v.f, a: v.a, n: v.n }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = (override) => {
    try { setError(''); setAnswer(solve({ ...v, ...override })); } catch (e) { setAnswer(null); setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expression.'); }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const x = answer?.variable ?? 'x';

  return (
    <div className="w-full space-y-6">
      <CalcCard title="Taylor Series Engine" actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}>
        <ErrorBox>{error}</ErrorBox>
        <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. e^x" onChange={(f) => set({ f })} onEnter={() => run()} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="About x = a (0 for Maclaurin)" value={v.a} inputMode="text" onChange={(a) => set({ a })} onEnter={() => run()} />
          <Select label="Up to order n" value={v.n} onChange={(n) => set({ n })} options={[1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ value: String(k), label: String(k) }))} />
          <Field label="Approximate at x = (optional)" value={v.at} inputMode="text" onChange={(at) => set({ at })} onEnter={() => run()} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto"><FiCheckCircle className="w-4 h-4 mr-2" /> Find Series</EditorialButton>
        </div>

        {answer && (
          <ResultBox label={`${answer.name} series`}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={`f(${x}) = ${answer.f}`} /></div>
                <div className="overflow-x-auto text-lg"><BlockMath math={`f(${x}) \\approx ${answer.poly}`} /></div>
                {answer.approx && (
                  <p className="text-sm font-mono">
                    At {x} = {sig(answer.approx.x, 6)}: series = {sig(answer.approx.p, 10)}{answer.approx.exact !== null && <> · true value = {sig(answer.approx.exact, 10)} · error = {sig(answer.approx.error, 3)}</>}
                  </p>
                )}
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Solid: f(x). Dashed: the series. They agree near x = <InlineMath math={answer.aTex} /> and drift apart further away.</p>
                {!answer.verified && <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check these coefficients numerically. Treat them with care.</p>}
              </div>
              <div className="flex justify-center">
                <CoordPlot fn={answer.fAt} fn2={answer.pAt} view={plotView([answer.fAt], answer.a - 3, answer.a + 3)} points={[{ x: answer.a, y: answer.fAt(answer.a), label: null }]} />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>
      {answer && <StepsCard title="Step-by-Step Working"><StepList steps={answer.steps} /></StepsCard>}
    </div>
  );
}
