'use client';
// The live first-principles calculator. The maths is in src/app/utils/engines/first-principles.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import { solve } from '@/app/utils/engines/first-principles';

const START = { f: 'x^2', at: '' };
const EXAMPLES = ['x^3', '3x^2 + 2x - 5', '1/x', 'sqrt(x)', 'sin(x)', 'e^x', 'ln(x)'];

export default function FirstPrinciplesCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('first-principles', 6, answer, () => ({ fn: v.f }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };

  const run = (override) => {
    const input = { ...v, ...override };
    try {
      setError('');
      setAnswer(solve(input));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expression.');
    }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const x = answer?.variable ?? 'x';

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="First Principles Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. x^2" onChange={(f) => set({ f })} onEnter={() => run()} />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e} type="button" onClick={() => { set({ f: e }); run({ f: e }); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e}</button>
          ))}
        </div>
        <div className="max-w-[14rem]">
          <Field label="Slope at x = (optional)" value={v.at} onChange={(at) => set({ at })} onEnter={() => run()} />
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Works for polynomials, fractions of polynomials, square roots of polynomials, sin x, cos x, eˣ and ln x.</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Differentiate
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Derivative from first principles">
            <div className="space-y-2 min-w-0">
              <div className="overflow-x-auto"><BlockMath math={answer.definition} /></div>
              <div className="overflow-x-auto text-lg"><BlockMath math={`f(${x}) = ${answer.f} \\quad \\Rightarrow \\quad f'(${x}) = ${answer.answer}`} /></div>
              {answer.point && <p className="text-sm font-mono">At {x} = {sig(answer.point.a, 6)}: slope = {sig(answer.point.slope, 8)}</p>}
              {!answer.verified && (
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check this answer numerically. Treat it with care.</p>
              )}
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Step-by-Step Working">
          <div className="overflow-x-auto"><BlockMath math={answer.definition} /></div>
          <StepList steps={answer.steps} />
        </StepsCard>
      )}
    </div>
  );
}
