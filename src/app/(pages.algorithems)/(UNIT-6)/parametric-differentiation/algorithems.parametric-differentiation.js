'use client';
// The live parametric differentiation calculator. The maths is in src/app/utils/engines/parametric.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice } from '@/app/components/method/Calculator';
import StepList from '@/app/components/method/StepList';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/parametric';

const START = { x: 't^2', y: '2t', second: 'yes', at: '1' };
const EXAMPLES = [
  { label: 'circle', input: { x: 'cos(t)', y: 'sin(t)', at: 'pi/4' } },
  { label: 'cycloid', input: { x: 't - sin(t)', y: '1 - cos(t)', at: 'pi/2' } },
  { label: 'ellipse', input: { x: '3cos(t)', y: '2sin(t)', at: 'pi/3' } },
  { label: 'cusp t³, t²', input: { x: 't^3', y: 't^2', at: '1' } },
];

/** The curve for t in a range that suits it, the point, and the tangent line. */
function graph(answer) {
  const t0 = answer.point?.t ?? 0;
  const span = /sin|cos|tan/.test(answer.x + answer.y) ? Math.PI : 2;
  const pts = answer.curve(t0 - span, t0 + span).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const segments = [];
  for (let i = 1; i < pts.length; i++) {
    if (Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) < 2) segments.push([pts[i - 1], pts[i]]);
  }
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const view = xs.length ? { x0: Math.min(...xs, 0) - 0.5, x1: Math.max(...xs, 0) + 0.5, y0: Math.min(...ys, 0), y1: Math.max(...ys, 0) } : null;
  const P = answer.point;
  const lines = !P ? [] : P.vertical ? [{ a: 1, b: 0, c: -P.x }] : P.slope !== null ? [{ a: -P.slope, b: 1, c: -(P.y - P.slope * P.x) }] : [];
  return { segments, view, points: P ? [{ x: P.x, y: P.y, label: 'P' }] : [], lines };
}

export default function ParametricCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('parametric', 6, answer, () => ({ x: v.x, y: v.y }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };

  const run = (override) => {
    const input = { ...v, ...override };
    try {
      setError('');
      setAnswer(solve({ ...input, second: input.second === 'yes' }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expressions.');
    }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };
  const P = answer?.P ?? 't';
  const pt = answer?.point;
  const g = answer ? graph(answer) : null;

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Parametric Differentiation Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="x(t) =" value={v.x} inputMode="text" placeholder="e.g. cos(t)" onChange={(x) => set({ x })} onEnter={() => run()} />
          <Field label="y(t) =" value={v.y} inputMode="text" placeholder="e.g. sin(t)" onChange={(y) => set({ y })} onEnter={() => run()} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,14rem)] gap-4 items-end">
          <Choice label="Also find" value={v.second} onChange={(second) => set({ second })} options={[{ value: 'no', label: 'dy/dx only' }, { value: 'yes', label: '+ d²y/dx²' }]} />
          <Field label="At t = (optional)" value={v.at} onChange={(at) => set({ at })} onEnter={() => run()} />
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Use t or theta as the parameter. t can be a number, pi or pi/4.</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Find dy/dx
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label="dy/dx">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={`x = ${answer.x}, \\quad y = ${answer.y}`} /></div>
                <div className="overflow-x-auto text-lg"><BlockMath math={`\\frac{dy}{dx} = ${answer.answer}`} /></div>
                {answer.second && <div className="overflow-x-auto"><BlockMath math={`\\frac{d^2y}{dx^2} = ${answer.second}`} /></div>}
                {pt && (
                  <p className="text-sm font-mono">
                    At {answer.parameter === 'theta' ? 'θ' : answer.parameter} = {sig(pt.t, 6)}: point ({sig(pt.x, 6)}, {sig(pt.y, 6)}),{' '}
                    {pt.vertical ? 'vertical tangent' : pt.stationary ? 'dx/dt = dy/dt = 0 (possible cusp)' : <>slope = {sig(pt.slope, 8)}</>}
                  </p>
                )}
                {!answer.verified && (
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check this answer numerically. Treat it with care.</p>
                )}
              </div>
              <div className="flex justify-center">
                <CoordPlot segments={g.segments} view={g.view} points={g.points} lines={g.lines} />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Step-by-Step Working">
          <div className="overflow-x-auto"><BlockMath math={`\\frac{dy}{dx} = \\frac{dy/d${P}}{dx/d${P}}`} /></div>
          <StepList steps={answer.steps} />
        </StepsCard>
      )}
    </div>
  );
}
