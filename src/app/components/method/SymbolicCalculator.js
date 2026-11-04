'use client';
// A shared shell for step-by-step calculators: input fields, example buttons, the answer box, the steps
// and notes. Each page passes its fields, examples, the engine's solve() and how to show the answer.
import React, { useState } from 'react';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Select, Notes } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';

/**
 * fields: [{ key, label, kind: 'field' | 'choice' | 'select', options, placeholder, show(values), wide }]
 * examples: [{ label, input }]   solve(values) → engine answer   renderResult(answer, values) → JSX
 */
export default function SymbolicCalculator({
  id, unit, title, start, fields, examples = [], solve, button = 'Solve', hint = null,
  resultLabel = 'Answer', renderResult, renderSteps = null,
}) {
  const [v, setV] = useState(start);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve(id, unit, answer, () => ({ ...v }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = (override) => {
    const input = { ...v, ...override };
    try { setError(''); setAnswer(solve(input)); } catch (e) { setAnswer(null); setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check what you typed.'); }
  };
  const reset = () => { setV(start); setAnswer(null); setError(''); };
  const visible = fields.filter((f) => !f.show || f.show(v));
  const choices = visible.filter((f) => f.kind === 'choice');
  const inputs = visible.filter((f) => f.kind !== 'choice');

  return (
    <div className="w-full space-y-6">
      <CalcCard title={title} actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}>
        <ErrorBox>{error}</ErrorBox>
        {choices.map((f) => <Choice key={f.key} label={f.label} value={v[f.key]} onChange={(x) => set({ [f.key]: x })} options={f.options} />)}
        <div className={`grid grid-cols-1 ${inputs.length > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
          {inputs.map((f) => (
            <div key={f.key} className={f.wide && inputs.length > 1 ? 'sm:col-span-2' : ''}>
              {f.kind === 'select'
                ? <Select label={f.label} value={v[f.key]} onChange={(x) => set({ [f.key]: x })} options={f.options} />
                : <Field label={f.label} value={v[f.key]} inputMode="text" placeholder={f.placeholder} onChange={(x) => set({ [f.key]: x })} onEnter={() => run()} />}
            </div>
          ))}
        </div>
        {examples.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
            {examples.map((e) => (
              <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
            ))}
          </div>
        )}
        {hint && <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{hint}</p>}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto"><FiCheckCircle className="w-4 h-4 mr-2" /> {button}</EditorialButton>
        </div>

        {answer && (
          <ResultBox label={typeof resultLabel === 'function' ? resultLabel(answer) : resultLabel}>
            {renderResult(answer, v)}
            {answer.verified === false && (
              <p className="mt-2 text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check this answer. Treat it with care.</p>
            )}
          </ResultBox>
        )}
      </CalcCard>
      {answer && (
        <StepsCard title="Step-by-Step Working">
          {renderSteps && renderSteps(answer)}
          <StepList steps={answer.steps} />
        </StepsCard>
      )}
      {answer?.notes?.length > 0 && <Notes notes={answer.notes} />}
    </div>
  );
}
