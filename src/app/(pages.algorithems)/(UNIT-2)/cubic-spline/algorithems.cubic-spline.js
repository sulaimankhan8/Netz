'use client';
// The live cubic spline calculator. The maths is in src/app/utils/engines/cubic-spline.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { n } from '@/app/utils/numeric/geometry';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice } from '@/app/components/method/Calculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/cubic-spline';

const START = { x: '1, 2, 3', y: '2, 3, 5', at: '1.5', type: 'natural', s0: '1', sn: '2' };

/** One spline piece as LaTeX: aᵢ + bᵢ(x − xᵢ) + cᵢ(x − xᵢ)² + dᵢ(x − xᵢ)³ */
const pieceTex = (p, i) => {
  const t = `(x ${p.from < 0 ? '+' : '-'} ${n(Math.abs(p.from))})`;
  const term = (k, body) => (Math.abs(k) < 1e-12 ? '' : ` ${k < 0 ? '-' : '+'} ${n(Math.abs(k))}${body}`);
  return `S_{${i}}(x) = ${n(p.a)}${term(p.b, t)}${term(p.c, `${t}^2`)}${term(p.d, `${t}^3`)}, \\quad ${n(p.from)} \\le x \\le ${n(p.to)}`;
};

export default function SplineCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('cubic-spline', 2, answer, () => ({ type: v.type, points: answer?.x?.length }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = () => {
    try {
      setError('');
      setAnswer(solve(v));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the inputs.');
    }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Cubic Spline Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="x values (increasing)" value={v.x} inputMode="text" onChange={(x) => set({ x })} onEnter={run} />
          <Field label="y values" value={v.y} inputMode="text" onChange={(y) => set({ y })} onEnter={run} />
          <Field label="Find y at x = (optional)" value={v.at} onChange={(at) => set({ at })} onEnter={run} />
        </div>
        <Choice label="End conditions" value={v.type} onChange={(type) => set({ type })} options={[{ value: 'natural', label: 'Natural (S″ = 0 at both ends)' }, { value: 'clamped', label: 'Clamped (given end slopes)' }]} />
        {v.type === 'clamped' && (
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <Field label="Slope at the start S′(x₀)" value={v.s0} onChange={(s0) => set({ s0 })} onEnter={run} />
            <Field label="Slope at the end S′(xₙ)" value={v.sn} onChange={(sn) => set({ sn })} onEnter={run} />
          </div>
        )}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Build Spline
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label={answer.value !== null ? 'Interpolated value' : 'Spline built'}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-1 min-w-0">
                {answer.value !== null && <p className="text-2xl font-black font-mono break-all">S({sig(answer.piece.X, 8)}) ≈ {sig(answer.value, 10)}</p>}
                <p className="text-sm font-mono break-words">M = S″(xᵢ): {answer.M.map((m) => sig(m, 6)).join(', ')}</p>
              </div>
              <div className="flex justify-center">
                <CoordPlot
                  fn={(X) => (X >= answer.x[0] && X <= answer.x.at(-1) ? answer.evaluate(X) : NaN)}
                  points={[...answer.x.map((x, i) => ({ x, y: answer.y[i], label: null })), ...(answer.value !== null ? [{ x: answer.piece.X, y: answer.value, label: 'S' }] : [])]}
                />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>
      {answer && (
        <StepsCard title="Working">
          {answer.lines.length > 0 && (
            <>
              <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">1 · Tridiagonal system for the second derivatives (solved by the Thomas algorithm)</div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                {answer.type === 'natural' && <BlockMath math={`M_0 = M_{${answer.M.length - 1}} = 0 \\ (\\text{natural spline})`} />}
                {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
                <BlockMath math={answer.M.map((m, i) => `M_{${i}} = ${n(m)}`).join(',\\ ')} />
              </div>
            </>
          )}
          <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">2 · The spline pieces</div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.pieces.map((p, i) => <BlockMath key={i} math={pieceTex(p, i)} />)}
          </div>
        </StepsCard>
      )}
    </div>
  );
}
