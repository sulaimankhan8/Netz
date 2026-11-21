'use client';
// Shared calculator for the ODE pages (RK2, Milne, Adams-Bashforth-Moulton): dy/dx = f(x, y) from (x₀, y₀)
// with step h to a target x. Shows the answer, a step table and the solution as a graph.
import React, { useState } from 'react';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Notes, HowToUse, TypingGuide } from '@/app/components/method/Calculator';
import { useCalcGuide } from '@/app/components/method/calcGuide';
import { StepTable } from './StepTable';
import StepList from './StepList';
import CoordPlot from './CoordPlot';
import { useExportBar } from './ExportBar';
import { useLoadInput } from './calcDemo';

/**
 * onAnswer(answer): the page records the solve (useRecordSolve lives in each page's folder). solve(values) → { result, points, rows }.
 * columns: StepTable columns; toRow(row) → cells (numbers are formatted here).
 * variants: optional [{ value, label }] picker passed to solve as `variant`.
 * working(answer, values): optional → StepList steps [{ title, formula, text, lines }] showing the first step in full.
 */
// What each box means, in plain words (guide mode)
const ODE_HELP = {
  f: 'The right-hand side of your equation **dy/dx = …**, written with x and y. For dy/dx = x + y² type `x + y^2`.',
  x0: 'The **starting x**: where the starting value of y is given. For y(0) = 1 it is `0`.',
  y0: 'The **value of y at that starting x**. For y(0) = 1 it is `1`.',
  h: 'The **step size**: how far x moves in each step. Smaller steps are more accurate but give more rows. `0.1` is common in exams.',
  xn: 'The x where you want to **know y**. NETZ steps from x₀ to here in steps of h.',
  variant: 'Which form of the method your book or syllabus uses. If unsure, keep the first.',
};

export default function OdeCalculator({ title, solve, start, columns, toRow, variants = null, onAnswer, exportId, working = null }) {
  const [v, setV] = useState(start);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const guide = useCalcGuide(exportId);
  // The same boxes on every ODE page; a page's guide can reword any of them
  const help = (k) => (guide ? guide.help?.[k] || ODE_HELP[k] : null);
  const exportBar = useExportBar(exportId, () => v, !!answer, title);

  const show = (r) => { setAnswer(r); onAnswer?.(r, v); };
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); show(null); setError(''); };

  const run = (input = v) => {
    try {
      setError('');
      show(solve(input));
    } catch (e) {
      show(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the inputs.');
    }
  };
  const reset = () => { setV(start); show(null); setError(''); };
  // Values sent with loadIntoCalculator() (calcDemo.js) load here and solve
  useLoadInput((x) => { const next = { ...start, ...x }; setV(next); run(next); });
  const fmt = (x) => (typeof x === 'number' ? sig(x, 7) : x ?? '—');

  return (
    <div className="w-full space-y-6" id={`netz-solve-${exportId}`}>
      <CalcCard
        title={title}
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <HowToUse steps={guide?.howTo} />
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3">
          <Field label="dy/dx = f(x, y)" value={v.f} inputMode="text" onChange={(x) => set({ f: x })} onEnter={run} help={help('f')} />
          <Field label="x₀" value={v.x0} onChange={(x) => set({ x0: x })} onEnter={run} help={help('x0')} />
          <Field label="y₀ = y(x₀)" value={v.y0} onChange={(x) => set({ y0: x })} onEnter={run} help={help('y0')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <Field label="Step h" value={v.h} onChange={(x) => set({ h: x })} onEnter={run} help={help('h')} />
          <Field label="Find y at x =" value={v.xn} onChange={(x) => set({ xn: x })} onEnter={run} help={help('xn')} />
        </div>
        {variants && <Choice label="Version" value={v.variant} onChange={(x) => set({ variant: x })} options={variants} help={help('variant')} />}
        {guide && <TypingGuide />}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" data-solve="" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Solve ODE
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label="Solution">
            {exportBar}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <p className="text-2xl font-black font-mono break-all">y({fmt(answer.points.at(-1).x)}) ≈ {fmt(answer.result)}</p>
              <div className="flex justify-center">
                <CoordPlot
                  points={answer.points.map((p, i) => ({ ...p, label: i === 0 ? 'start' : i === answer.points.length - 1 ? 'end' : null }))}
                  segments={answer.points.slice(1).map((p, i) => [answer.points[i], p])}
                />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>
      {answer && working && (() => {
        let steps = [];
        try { steps = working(answer, v) || []; } catch { steps = []; }
        return steps.length > 0 && (
          <StepsCard title="Working: the formula, then the first step with every number put in">
            <StepList steps={steps} />
          </StepsCard>
        );
      })()}
      {answer && (
        <StepsCard title={`Step Table (${answer.rows.length} rows)`}>
          <div className="max-h-[520px] overflow-y-auto rounded-xl">
            <StepTable columns={columns} rows={answer.rows.map((r) => Object.fromEntries(Object.entries(toRow(r)).map(([k, x]) => [k, fmt(x)])))} />
          </div>
          <Notes notes={answer.notes} />
        </StepsCard>
      )}
    </div>
  );
}
