'use client';
// A shared shell for matrix calculators: a matrix input, example matrices, the answer box, the row
// operations (when the engine records them) and the steps.
import React, { useState } from 'react';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { MatrixInput, MatrixView, RowOps } from '@/app/components/method/Matrix';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Notes, Field, Choice } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';

/**
 * start: string[][]; examples: [{ label, cells, extra? }]; solve({ cells, ...extra }) → answer with steps
 * (and ops, rref); divider: draw a line before the last column (augmented matrices); renderResult(answer) → JSX.
 * extraFields: [{ key, label, kind: 'field' | 'choice', options, placeholder }] shown under the matrix,
 * with their starting values in extraStart.
 */
export default function MatrixMethodCalculator({
  id, unit = 8, title, label = 'A', start, examples = [], square = false, min = 1, max = 6, divider = false,
  solve, button = 'Solve', hint = null, resultLabel = 'Answer', renderResult, opsTitle = 'Row reduction',
  extraFields = [], extraStart = {}, renderSteps = null,
}) {
  const [cells, setCells] = useState(start);
  const [extra, setExtra] = useState(extraStart);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve(id, unit, answer, () => ({ rows: cells.length, cols: cells[0].length }));
  const run = (c = cells, x = extra) => {
    try { setError(''); setAnswer(solve({ cells: c, ...x })); } catch (e) { setAnswer(null); setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.'); }
  };
  const reset = () => { setCells(start); setExtra(extraStart); setAnswer(null); setError(''); };
  const setX = (patch) => { setExtra((o) => ({ ...o, ...patch })); setAnswer(null); };
  const div = divider && answer ? answer.n ?? (cells[0].length - 1) : null;

  return (
    <div className="w-full space-y-6">
      <CalcCard title={title} actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}>
        <ErrorBox>{error}</ErrorBox>
        <MatrixInput label={label} value={cells} onChange={(v) => { setCells(v); setAnswer(null); }} square={square} min={min} max={max} />
        {extraFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extraFields.map((f) => (f.kind === 'choice'
              ? <div key={f.key} className="sm:col-span-2"><Choice label={f.label} value={extra[f.key]} onChange={(v) => setX({ [f.key]: v })} options={f.options} /></div>
              : <Field key={f.key} label={f.label} value={extra[f.key] ?? ''} inputMode="text" placeholder={f.placeholder} onChange={(v) => setX({ [f.key]: v })} onEnter={() => run()} />))}
          </div>
        )}
        {examples.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
            {examples.map((e) => (
              <button key={e.label} type="button" onClick={() => { const c = e.cells.map((r) => r.map(String)); const x = { ...extra, ...(e.extra || {}) }; setCells(c); setExtra(x); run(c, x); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
            ))}
          </div>
        )}
        {hint && <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{hint}</p>}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto"><FiCheckCircle className="w-4 h-4 mr-2" /> {button}</EditorialButton>
        </div>
        {answer && (
          <ResultBox label={resultLabel}>
            {renderResult(answer)}
            {answer.verified === false && <p className="mt-2 text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check this answer. Treat it with care.</p>}
          </ResultBox>
        )}
      </CalcCard>
      {answer && (
        <StepsCard title="Step-by-Step Working">
          {renderSteps && renderSteps(answer)}
          <StepList steps={answer.steps} />
          {answer.ops?.length > 0 && (
            <details className="rounded-xl border border-black/20 dark:border-neutral-700">
              <summary className="cursor-pointer px-4 py-3 min-h-[44px] text-xs font-mono font-bold uppercase text-black dark:text-white">{opsTitle} ({answer.ops.length} row operations)</summary>
              <div className="p-3 space-y-3">
                {answer.Aug && <MatrixView matrix={answer.Aug} prefix="[A \\mid B] = " divider={div} />}
                {answer.A && !answer.Aug && <MatrixView matrix={answer.A} prefix="" />}
                <RowOps ops={answer.ops} divider={div} />
              </div>
            </details>
          )}
        </StepsCard>
      )}
      {answer?.notes?.length > 0 && <Notes notes={answer.notes} />}
    </div>
  );
}
