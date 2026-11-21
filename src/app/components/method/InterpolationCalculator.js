'use client';
// Shared calculator for the difference table, Stirling and Bessel pages: x and y lists (equally spaced),
// an x to interpolate at, the textbook difference table with the entries the formula used tinted, and the terms.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Notes, HowToUse } from '@/app/components/method/Calculator';
import { useCalcGuide } from '@/app/components/method/calcGuide';
import DifferenceTable from './DifferenceTable';
import { useExportBar } from './ExportBar';
import { useLoadInput } from './calcDemo';

/**
 * mode: 'table' (difference table only, with a Δ/∇/δ picker) or 'interpolate' (Stirling, Bessel).
 * onAnswer(answer): each page records its own solve.
 */
// What each box means, in plain words (guide mode)
const INTERP_HELP = {
  x: 'The x values from your table, separated by commas, smallest first. They must go up in **equal steps**, like `1, 2, 3, 4` or `0, 0.5, 1, 1.5`.',
  y: 'The y value for each x, in the **same order**, separated by commas: `2, 5, 10, 17`.',
  at: 'The x where you want to **estimate y**. It should lie inside your table, ideally near the middle.',
  notation: 'Which difference symbols the table uses: forward Δ, backward ∇ or central δ. The numbers are the same; only the labels change.',
};

export default function InterpolationCalculator({ title, solve, start, mode = 'interpolate', onAnswer, button = 'Interpolate', exportId }) {
  const [v, setV] = useState(start);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const guide = useCalcGuide(exportId);
  const help = (k) => (guide ? guide.help?.[k] || INTERP_HELP[k] : null);
  const exportBar = useExportBar(exportId, () => v, !!answer, title);
  const show = (r) => { setAnswer(r); onAnswer?.(r); };
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

  // Entries the formula used: Δᵏyᵢ sits at staggered row 2i + k, column k + 1
  const highlight = new Set();
  answer?.used?.forEach((t) => t.idx.forEach(([k, i]) => highlight.add(`${2 * i + k},${k + 1}`)));

  return (
    <div className="w-full space-y-6" id={`netz-solve-${exportId}`}>
      <CalcCard
        title={title}
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <HowToUse steps={guide?.howTo} />
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="x values (equally spaced)" value={v.x} inputMode="text" onChange={(x) => set({ x })} onEnter={run} help={help('x')} />
          <Field label="y values" value={v.y} inputMode="text" onChange={(y) => set({ y })} onEnter={run} help={help('y')} />
        </div>
        {mode === 'interpolate'
          ? <div className="max-w-xs"><Field label="Find y at x =" value={v.at} onChange={(at) => set({ at })} onEnter={run} help={help('at')} /></div>
          : <Choice label="Notation" value={v.notation} onChange={(notation) => set({ notation })} options={[{ value: 'forward', label: 'Forward Δ' }, { value: 'backward', label: 'Backward ∇' }, { value: 'central', label: 'Central δ' }]} help={help('notation')} />}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" data-solve="" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> {button}
          </EditorialButton>
        </div>
        {answer && mode === 'interpolate' && (
          <ResultBox label="Interpolated value">
            {exportBar}
            <p className="text-2xl font-black font-mono break-all">y({sig(answer.X, 8)}) ≈ {sig(answer.result, 10)}</p>
            <p className="text-sm font-mono">h = {sig(answer.h, 6)}, x₀ = {sig(answer.x[answer.o], 6)}, p = {sig(answer.p, 6)} · used differences up to order {answer.order}</p>
          </ResultBox>
        )}
        {answer && mode === 'table' && (
          <ResultBox label="Polynomial degree">
            {exportBar}
            <p className="text-xl font-black font-mono">{answer.notes[0]}</p>
          </ResultBox>
        )}
      </CalcCard>
      {answer && (
        <StepsCard title={mode === 'table' ? 'Difference Table' : 'Difference Table and Terms'}>
          <DifferenceTable rows={answer.rows} headers={answer.headers} highlight={highlight} />
          {mode === 'interpolate' && (
            <>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Tinted cells are the differences the formula used.</p>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
              </div>
            </>
          )}
          <Notes notes={mode === 'table' ? answer.notes.slice(1) : answer.notes} />
        </StepsCard>
      )}
    </div>
  );
}
