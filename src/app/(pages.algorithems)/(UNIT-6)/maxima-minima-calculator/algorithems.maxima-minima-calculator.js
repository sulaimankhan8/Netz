'use client';
// The live maxima & minima calculator. The maths is in src/app/utils/engines/maxima-minima.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Notes } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import CoordPlot from '@/app/components/method/CoordPlot';
import { plotView, around } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/maxima-minima';

const START = { f: '2x^3 - 9x^2 + 12x + 1', a: '', b: '' };
const EXAMPLES = [
  { label: 'x³ − 3x on [−2, 3]', input: { f: 'x^3 - 3x', a: '-2', b: '3' } },
  { label: 'x⁴ − 2x²', input: { f: 'x^4 - 2x^2', a: '', b: '' } },
  { label: 'x eˣ', input: { f: 'x e^x', a: '', b: '' } },
  { label: 'sin x + cos x', input: { f: 'sin(x) + cos(x)', a: '0', b: '2pi' } },
  { label: '|x| (corner)', input: { f: 'abs(x)', a: '', b: '' } },
];

export default function MaximaMinimaCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('maxima-minima', 6, answer, () => ({ fn: v.f }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = (override) => {
    try { setError(''); setAnswer(solve({ ...v, ...override })); } catch (e) { setAnswer(null); setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expression.'); }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const r = answer?.range;
  const [x0, x1] = !answer ? [0, 1] : Number.isFinite(r.lo) && Number.isFinite(r.hi) ? [r.lo, r.hi] : around(answer.points.map((p) => p.x));
  const x = answer?.variable ?? 'x';
  const list = (pts) => pts.map((p) => `f(${p.xTex}) = ${p.yTex}`).join(', \\ ');

  return (
    <div className="w-full space-y-6">
      <CalcCard title="Maxima & Minima Engine" actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}>
        <ErrorBox>{error}</ErrorBox>
        <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. x^3 - 3x" onChange={(f) => set({ f })} onEnter={() => run()} />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Field label="Interval a (optional)" value={v.a} inputMode="text" onChange={(a) => set({ a })} onEnter={() => run()} />
          <Field label="Interval b (optional)" value={v.b} inputMode="text" onChange={(b) => set({ b })} onEnter={() => run()} />
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Give a closed interval [a, b] to also get the absolute maximum and minimum there.</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto"><FiCheckCircle className="w-4 h-4 mr-2" /> Find Maxima & Minima</EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Maxima and minima">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={answer.maxima.length ? `\\text{Local max: } ${list(answer.maxima)}` : '\\text{No local maximum}'} /></div>
                <div className="overflow-x-auto"><BlockMath math={answer.minima.length ? `\\text{Local min: } ${list(answer.minima)}` : '\\text{No local minimum}'} /></div>
                {answer.absolute && (
                  <div className="overflow-x-auto"><BlockMath math={`\\text{On } \\left[${r.loTex}, ${r.hiTex}\\right]: \\ \\max = ${answer.absolute.max.yTex} \\ (${x} = ${answer.absolute.max.at.join(', ')}), \\ \\min = ${answer.absolute.min.yTex} \\ (${x} = ${answer.absolute.min.at.join(', ')})`} /></div>
                )}
              </div>
              <div className="flex justify-center">
                <CoordPlot fn={answer.fAt} view={plotView([answer.fAt], x0, x1)} points={answer.points.map((p) => ({ x: p.x, y: p.y, label: p.type === 'max' ? 'max' : p.type === 'min' ? 'min' : null }))} />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>
      {answer && <StepsCard title="Step-by-Step Working"><StepList steps={answer.steps} /></StepsCard>}
      {answer?.notes?.length > 0 && <Notes notes={answer.notes} />}
    </div>
  );
}
