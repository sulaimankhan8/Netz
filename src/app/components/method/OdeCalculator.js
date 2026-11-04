'use client';
// Shared calculator for the ODE pages (RK2, Milne, Adams-Bashforth-Moulton): dy/dx = f(x, y) from (x₀, y₀)
// with step h to a target x. Shows the answer, a step table and the solution as a graph.
import React, { useState } from 'react';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Notes } from './Calculator';
import { StepTable } from './StepTable';
import CoordPlot from './CoordPlot';

/**
 * onAnswer(answer): the page records the solve (useRecordSolve lives in each page's folder). solve(values) → { result, points, rows }.
 * columns: StepTable columns; toRow(row) → cells (numbers are formatted here).
 * variants: optional [{ value, label }] picker passed to solve as `variant`.
 */
export default function OdeCalculator({ title, solve, start, columns, toRow, variants = null, onAnswer }) {
  const [v, setV] = useState(start);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');

  const show = (r) => { setAnswer(r); onAnswer?.(r, v); };
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); show(null); setError(''); };

  const run = () => {
    try {
      setError('');
      show(solve(v));
    } catch (e) {
      show(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the inputs.');
    }
  };
  const reset = () => { setV(start); show(null); setError(''); };
  const fmt = (x) => (typeof x === 'number' ? sig(x, 7) : x ?? '—');

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title={title}
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3">
          <Field label="dy/dx = f(x, y)" value={v.f} inputMode="text" onChange={(x) => set({ f: x })} onEnter={run} />
          <Field label="x₀" value={v.x0} onChange={(x) => set({ x0: x })} onEnter={run} />
          <Field label="y₀ = y(x₀)" value={v.y0} onChange={(x) => set({ y0: x })} onEnter={run} />
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <Field label="Step h" value={v.h} onChange={(x) => set({ h: x })} onEnter={run} />
          <Field label="Find y at x =" value={v.xn} onChange={(x) => set({ xn: x })} onEnter={run} />
        </div>
        {variants && <Choice label="Version" value={v.variant} onChange={(x) => set({ variant: x })} options={variants} />}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Solve ODE
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label="Solution">
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
