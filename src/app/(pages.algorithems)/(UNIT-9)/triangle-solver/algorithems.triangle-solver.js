'use client';
// The live triangle solver. The maths is in src/app/utils/engines/triangle-solver.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Choice } from '@/app/components/method/Calculator';
import TriangleDiagram from '@/app/components/method/TriangleDiagram';
import { solve, MODES } from '@/app/utils/engines/triangle-solver';

const START = { mode: 'SSS', values: { a: '7', b: '8', c: '9', A: '60', B: '45' } };
const LABEL = { a: 'Side a', b: 'Side b', c: 'Side c', A: 'Angle A (°)', B: 'Angle B (°)' };
const fieldClass = 'w-full min-h-[44px] px-3 text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

export default function TriangleSolverCalculator() {
  const [mode, setMode] = useState(START.mode);
  const [values, setValues] = useState(START.values);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('triangle-solver', 9, answer, () => ({ mode }));
  const info = MODES.find((m) => m.id === mode);

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ mode, values }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setMode(START.mode); setValues(START.values); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Triangle Solver Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you know?" value={mode} onChange={(v) => { setMode(v); setAnswer(null); setError(''); }} options={MODES.map((m) => ({ value: m.id, label: m.id }))} />
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{info.label.replace(/^\w+: /, 'You know ')}. Side a is opposite angle A, b opposite B, c opposite C.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {info.inputs.map((k) => (
            <label key={k} className="space-y-1 min-w-0">
              <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{LABEL[k]}</span>
              <input type="text" inputMode="decimal" autoComplete="off" value={values[k] ?? ''} onChange={(e) => { setValues((old) => ({ ...old, [k]: e.target.value })); setAnswer(null); }} onKeyDown={(e) => { if (e.key === 'Enter') run(); }} className={fieldClass} />
            </label>
          ))}
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Solve Triangle
          </EditorialButton>
        </div>

        {answer && answer.triangles.length === 0 && (
          <ResultBox label="No triangle"><p className="font-semibold">{answer.note}</p></ResultBox>
        )}
        {answer?.triangles.map((t, i) => (
          <ResultBox key={i} label={answer.triangles.length > 1 ? `Triangle ${i + 1} of 2` : 'Solved triangle'}>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-1 font-mono text-sm">
                <p>a = {sig(t.a, 6)}, b = {sig(t.b, 6)}, c = {sig(t.c, 6)}</p>
                <p>A = {sig(t.A, 5)}°, B = {sig(t.B, 5)}°, C = {sig(t.C, 5)}°</p>
                <p>Area = {sig(t.area, 6)}, perimeter = {sig(t.perimeter, 6)}</p>
                <p className="font-bold capitalize">{t.kind} triangle</p>
              </div>
              <TriangleDiagram {...t} rightAt={Math.abs(t.C - 90) < 1e-7 ? 'C' : Math.abs(t.B - 90) < 1e-7 ? 'B' : Math.abs(t.A - 90) < 1e-7 ? 'A' : null} />
            </div>
          </ResultBox>
        ))}
        {answer?.triangles.length === 2 && <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{answer.note}</p>}
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          {answer.failLines && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
              {answer.failLines.map((l, i) => <BlockMath key={i} math={l} />)}
            </div>
          )}
          {answer.triangles.map((t, i) => (
            <div key={i} className="space-y-1">
              {answer.triangles.length > 1 && <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">Triangle {i + 1}</div>}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                {t.lines.map((l, j) => <BlockMath key={j} math={l} />)}
                <BlockMath math={t.areaLine} />
              </div>
            </div>
          ))}
        </StepsCard>
      )}
    </div>
  );
}
