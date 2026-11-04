'use client';
// The live tangent & normal calculator. The maths is in src/app/utils/engines/tangent-normal.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import CoordPlot from '@/app/components/method/CoordPlot';
import { plotView, around } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/tangent-normal';

const START = { f: 'x^2', a: '1' };
const EXAMPLES = [
  { label: 'x³ − 3x + 2 at 2', input: { f: 'x^3 - 3x + 2', a: '2' } },
  { label: 'sin x at π/4', input: { f: 'sin(x)', a: 'pi/4' } },
  { label: 'eˣ at 0', input: { f: 'e^x', a: '0' } },
  { label: 'x² − 4x at 2 (flat)', input: { f: 'x^2 - 4x', a: '2' } },
  { label: '∛x at 0 (vertical)', input: { f: 'cbrt(x)', a: '0' } },
];

export default function TangentNormalCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('tangent-normal', 6, answer, () => ({ fn: v.f, a: v.a }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = (override) => {
    try { setError(''); setAnswer(solve({ ...v, ...override })); } catch (e) { setAnswer(null); setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expression.'); }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const [x0, x1] = answer ? around([answer.a]) : [0, 1];

  return (
    <div className="w-full space-y-6">
      <CalcCard title="Tangent & Normal Engine" actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}>
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)] gap-4">
          <Field label="y = f(x) =" value={v.f} inputMode="text" placeholder="e.g. x^2" onChange={(f) => set({ f })} onEnter={() => run()} />
          <Field label="At x = a" value={v.a} inputMode="text" placeholder="e.g. 1 or pi/4" onChange={(a) => set({ a })} onEnter={() => run()} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto"><FiCheckCircle className="w-4 h-4 mr-2" /> Find Tangent & Normal</EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Tangent and normal">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={`P\\left(${answer.aTex},\\ ${answer.y0Tex}\\right)`} /></div>
                <div className="overflow-x-auto text-lg"><BlockMath math={`\\text{Tangent: } ${answer.tangent.eq}`} /></div>
                <div className="overflow-x-auto text-lg"><BlockMath math={`\\text{Normal: } ${answer.normal.eq}`} /></div>
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Red straight line: the tangent. Blue straight line: the normal (at right angles to it).</p>
                {!answer.verified && <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check this slope numerically. Treat it with care.</p>}
              </div>
              <div className="flex justify-center">
                <CoordPlot fn={answer.fAt} view={plotView([answer.fAt], x0, x1)} points={[{ x: answer.a, y: answer.y0, label: 'P' }]} lines={answer.lines} />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>
      {answer && <StepsCard title="Step-by-Step Working"><StepList steps={answer.steps} /></StepsCard>}
    </div>
  );
}
