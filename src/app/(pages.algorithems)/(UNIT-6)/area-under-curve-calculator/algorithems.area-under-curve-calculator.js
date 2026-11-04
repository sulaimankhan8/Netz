'use client';
// The live area calculator (under a curve, or between two). The maths is in src/app/utils/engines/area-under-curve.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Notes } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import CoordPlot from '@/app/components/method/CoordPlot';
import { plotView } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/area-under-curve';

const START = { mode: 'under', f: 'x^2', g: '', a: '0', b: '3' };
const EXAMPLES = [
  { label: 'sin x, 0 to 2π', input: { mode: 'under', f: 'sin(x)', g: '', a: '0', b: '2pi' } },
  { label: 'x² − 4, 0 to 3', input: { mode: 'under', f: 'x^2 - 4', g: '', a: '0', b: '3' } },
  { label: 'between x and x²', input: { mode: 'between', f: 'x', g: 'x^2', a: '', b: '' } },
  { label: 'between 4 − x² and x + 2', input: { mode: 'between', f: '4 - x^2', g: 'x + 2', a: '', b: '' } },
  { label: 'between x³ and x', input: { mode: 'between', f: 'x^3', g: 'x', a: '', b: '' } },
];

export default function AreaCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('area-under-curve', 6, answer, () => ({ fn: v.f, g: v.g, mode: v.mode }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = (override) => {
    try { setError(''); setAnswer(solve({ ...v, ...override })); } catch (e) { setAnswer(null); setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expressions.'); }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const between = v.mode === 'between';
  const pad = answer ? Math.max((answer.b - answer.a) * 0.25, 0.5) : 0;
  const x = answer?.variable ?? 'x';

  return (
    <div className="w-full space-y-6">
      <CalcCard title="Area Engine" actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}>
        <ErrorBox>{error}</ErrorBox>
        <Choice label="Area" value={v.mode} onChange={(mode) => set({ mode })} options={[{ value: 'under', label: 'Under y = f(x)' }, { value: 'between', label: 'Between two curves' }]} />
        <div className={`grid grid-cols-1 ${between ? 'sm:grid-cols-2' : ''} gap-4`}>
          <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. x^2" onChange={(f) => set({ f })} onEnter={() => run()} />
          {between && <Field label="g(x) =" value={v.g} inputMode="text" placeholder="e.g. x" onChange={(g) => set({ g })} onEnter={() => run()} />}
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Field label={between ? 'From a (optional)' : 'From a ='} value={v.a} inputMode="text" onChange={(a) => set({ a })} onEnter={() => run()} />
          <Field label={between ? 'To b (optional)' : 'To b ='} value={v.b} inputMode="text" onChange={(b) => set({ b })} onEnter={() => run()} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        {between && <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Leave the limits empty to use where the curves meet.</p>}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto"><FiCheckCircle className="w-4 h-4 mr-2" /> Find Area</EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Area">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={answer.g ? `f(${x}) = ${answer.f}, \\quad g(${x}) = ${answer.g}` : `f(${x}) = ${answer.f}`} /></div>
                <div className="overflow-x-auto text-lg"><BlockMath math={`\\text{Area from } ${answer.aTex} \\text{ to } ${answer.bTex} = ${answer.areaTex}${/^-?(\d+|\\frac\{\d+\}\{\d+\})$/.test(answer.areaTex) || !/[a-z\\]/.test(answer.areaTex) ? '' : ` \\approx ${Number(answer.area.toPrecision(6))}`}`} /></div>
                {answer.crossings.length > 0 && <p className="text-sm">The {answer.g ? 'curves cross' : 'curve crosses the x-axis'} inside the interval, so the area was found piece by piece (a plain integral would let pieces cancel).</p>}
              </div>
              <div className="flex justify-center">
                <CoordPlot fn={answer.fAt} fn2={answer.gAt} view={plotView([answer.fAt, answer.gAt], answer.a - pad, answer.b + pad)} shade={{ a: answer.a, b: answer.b }} />
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
