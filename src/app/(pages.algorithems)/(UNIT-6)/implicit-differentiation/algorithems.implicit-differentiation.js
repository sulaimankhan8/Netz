'use client';
// The live implicit differentiation calculator. The maths is in src/app/utils/engines/implicit.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Notes } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import { solve } from '@/app/utils/engines/implicit';

const START = { eq: 'x^2 + y^2 = 25', x0: '3', y0: '4' };
const EXAMPLES = [
  { label: 'x^3 + y^3 = 6xy', input: { eq: 'x^3 + y^3 = 6xy', x0: '3', y0: '3' } },
  { label: 'xy = 1', input: { eq: 'xy = 1', x0: '', y0: '' } },
  { label: 'sin(xy) = x', input: { eq: 'sin(x y) = x', x0: '', y0: '' } },
  { label: 'e^y = x + y', input: { eq: 'e^y = x + y', x0: '', y0: '' } },
  { label: 'y^2 = 4x', input: { eq: 'y^2 = 4x', x0: '1', y0: '2' } },
];

export default function ImplicitCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('implicit', 6, answer, () => ({ eq: v.eq }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };

  const run = (override) => {
    const input = { ...v, ...override };
    try {
      setError('');
      setAnswer(solve(input));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the equation.');
    }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const pt = answer?.point;

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Implicit Differentiation Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Field label="Equation in x and y" value={v.eq} inputMode="text" placeholder="e.g. x^2 + y^2 = 25" onChange={(eq) => set({ eq })} onEnter={() => run()} />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Field label="Point x₀ (optional)" value={v.x0} onChange={(x0) => set({ x0 })} onEnter={() => run()} />
          <Field label="Point y₀ (optional)" value={v.y0} onChange={(y0) => set({ y0 })} onEnter={() => run()} />
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Write xy for x times y. Use ^ for powers: x^2 y^3 = 4, sin(x + y) = y.</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Find dy/dx
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label="dy/dx">
            <div className="space-y-2 min-w-0">
              <div className="overflow-x-auto"><BlockMath math={answer.eq} /></div>
              <div className="overflow-x-auto text-lg"><BlockMath math={`\\frac{dy}{dx} = ${answer.answer}`} /></div>
              {pt && (
                <p className="text-sm font-mono">
                  At ({sig(pt.x, 6)}, {sig(pt.y, 6)}): {pt.vertical ? 'vertical tangent (dy/dx undefined)' : <>slope = {sig(pt.slope, 8)}{pt.onCurve && <> · tangent y = {pt.slope === 0 ? sig(pt.y, 6) : <>{pt.slope === 1 ? '' : pt.slope === -1 ? '−' : sig(pt.slope, 6)}x {pt.y - pt.slope * pt.x < 0 ? '−' : '+'} {sig(Math.abs(pt.y - pt.slope * pt.x), 6)}</>}</>}</>}
                </p>
              )}
              {!answer.verified && (
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check this answer numerically. Treat it with care.</p>
              )}
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Step-by-Step Working">
          <StepList steps={answer.steps} />
        </StepsCard>
      )}
      {answer?.notes?.length > 0 && <Notes notes={answer.notes} />}
    </div>
  );
}
