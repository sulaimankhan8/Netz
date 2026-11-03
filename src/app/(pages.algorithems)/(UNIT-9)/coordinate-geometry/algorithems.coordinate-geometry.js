'use client';
// The live coordinate geometry calculator. The maths is in src/app/utils/engines/coordinate-geometry.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Choice } from '@/app/components/method/Calculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve, MODES } from '@/app/utils/engines/coordinate-geometry';

const START = {
  mode: 'line',
  p1: { x: '1', y: '2' }, p2: { x: '3', y: '8' }, p3: { x: '0', y: '5' },
  m: '1', n: '2', external: false, m1: '2', m2: '-1/2', a: '3', b: '4', c: '-5',
};
const fieldClass = 'w-full min-h-[44px] px-3 text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

function Field({ label, value, onChange, onEnter }) {
  return (
    <label className="space-y-1 min-w-0">
      <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{label}</span>
      <input type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onEnter(); }} className={fieldClass} />
    </label>
  );
}

/** One-line answer for the green box. */
function summary(r) {
  if (r.vertical && r.mode === 'slope') return 'Slope is undefined (vertical line)';
  switch (r.mode) {
    case 'distance': return `Distance AB = ${sig(r.result, 6)}`;
    case 'midpoint': return `Midpoint M = (${sig(r.result.x, 6)}, ${sig(r.result.y, 6)})`;
    case 'section': return `Point P = (${sig(r.result.x, 6)}, ${sig(r.result.y, 6)})`;
    case 'slope': return `Slope m = ${sig(r.result, 6)} (angle ${sig(r.angle, 5)}° with the x-axis)`;
    case 'line': return r.vertical ? `Vertical line x = ${sig(-r.result.c / r.result.a, 6)}` : `y = ${sig(r.result.slope, 6)}x ${r.result.intercept < 0 ? '−' : '+'} ${sig(Math.abs(r.result.intercept), 6)}`;
    case 'angle': return r.parallel ? 'The lines are parallel (0°)' : r.perpendicular ? 'The lines are perpendicular (90°)' : `Angle between the lines = ${sig(r.result, 6)}°`;
    case 'point-line': return `Distance from P to the line = ${sig(r.result, 6)}`;
    case 'triangle': return r.collinear ? 'Area = 0: the points are collinear' : `Area of triangle ABC = ${sig(r.result, 6)} square units`;
    default: return '';
  }
}

export default function CoordinateGeometryCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('coordinate-geometry', 9, answer, () => ({ mode: s.mode }));
  const info = MODES.find((m) => m.id === s.mode);

  const set = (patch) => { setS((old) => ({ ...old, ...patch })); setAnswer(null); setError(''); };
  const setPoint = (key, axis, v) => set({ [key]: { ...s[key], [axis]: v } });
  const run = () => {
    try {
      setError('');
      setAnswer(solve(s));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };
  const pointNames = s.mode === 'point-line' ? ['P'] : ['A', 'B', 'C'];

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Coordinate Geometry Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you want to find?" value={s.mode} onChange={(v) => set({ mode: v })} options={MODES.map((m) => ({ value: m.id, label: m.label }))} />

        {info.points > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['p1', 'p2', 'p3'].slice(0, info.points).map((k, i) => (
              <fieldset key={k} className="border-2 border-black/25 dark:border-neutral-700 rounded-xl px-3 pb-3 pt-1">
                <legend className="px-1 text-xs font-mono font-bold uppercase text-black dark:text-white">Point {pointNames[i]}</legend>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="x" value={s[k].x} onChange={(v) => setPoint(k, 'x', v)} onEnter={run} />
                  <Field label="y" value={s[k].y} onChange={(v) => setPoint(k, 'y', v)} onEnter={run} />
                </div>
              </fieldset>
            ))}
          </div>
        )}
        {s.mode === 'section' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Ratio m" value={s.m} onChange={(v) => set({ m: v })} onEnter={run} />
              <Field label="Ratio n" value={s.n} onChange={(v) => set({ n: v })} onEnter={run} />
            </div>
            <Choice label="Divide AB" value={s.external ? 'ext' : 'int'} onChange={(v) => set({ external: v === 'ext' })} options={[{ value: 'int', label: 'Internally' }, { value: 'ext', label: 'Externally' }]} />
          </div>
        )}
        {s.mode === 'angle' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Slope m₁" value={s.m1} onChange={(v) => set({ m1: v })} onEnter={run} />
            <Field label="Slope m₂" value={s.m2} onChange={(v) => set({ m2: v })} onEnter={run} />
          </div>
        )}
        {s.mode === 'point-line' && (
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-black dark:text-white block">Line ax + by + c = 0</span>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <Field label="a" value={s.a} onChange={(v) => set({ a: v })} onEnter={run} />
              <Field label="b" value={s.b} onChange={(v) => set({ b: v })} onEnter={run} />
              <Field label="c" value={s.c} onChange={(v) => set({ c: v })} onEnter={run} />
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label={info.label}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <p className="text-lg font-black font-mono break-words">{summary(answer)}</p>
              <div className="flex justify-center"><CoordPlot {...answer.plot} /></div>
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
        </StepsCard>
      )}
    </div>
  );
}
