'use client';
// Shared calculator for the Area & Perimeter and Volume & Surface Area pages:
// pick a shape, type its measurements, get every answer with its formula and working.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { EditorialButton } from '@/app/components/editorial';
import { sig } from '@/app/utils/numberFormat';
import { n, PI_CHOICES } from '@/app/utils/numeric/geometry';
import { CalcCard, ErrorBox, StepsCard, Choice } from './Calculator';
import ShapeDiagram from './ShapeDiagrams';

const UNITS = ['cm', 'm', 'mm', 'km', 'in', 'ft', 'units'];
const POWER = { 0: '°', 1: '', 2: '²', 3: '³' };

const fieldClass = 'w-full min-h-[44px] px-3 text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';
const selectClass = 'min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-sm font-bold text-black dark:text-white focus:outline-none';

/** Unit text for an answer: "cm²", "°", or "" for "units". */
const unitText = (unit, power) => {
  if (power === 0) return '°';
  if (unit === 'units') return ['', 'units', 'sq. units', 'cu. units'][power];
  return `${unit}${POWER[power]}`;
};

/**
 * shapes: [{ id, name, inputs, usesPi }]   solve({ shape, values, pi }) → { outputs, note }
 * start: { shape, values } for the first load (the page's worked example).
 */
export default function ShapeCalculator({ title, shapes, solve, start, onAnswer }) {
  const [shapeId, setShapeId] = useState(start.shape);
  const [values, setValues] = useState(start.values);
  const [pi, setPi] = useState(start.pi || 'exact');
  const [unit, setUnit] = useState('cm');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const shape = shapes.find((s) => s.id === shapeId);

  const change = (fn) => (...args) => { fn(...args); setAnswer(null); setError(''); onAnswer?.(null); };
  const pickShape = change((id) => {
    setShapeId(id);
    setValues(id === start.shape ? start.values : {});
  });
  const setValue = change((key, v) => setValues((old) => ({ ...old, [key]: v })));

  const run = () => {
    try {
      setError('');
      const r = solve({ shape: shapeId, values, pi });
      setAnswer(r);
      onAnswer?.(r);
    } catch (e) {
      setAnswer(null);
      onAnswer?.(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setShapeId(start.shape); setValues(start.values); setPi(start.pi || 'exact'); setAnswer(null); setError(''); onAnswer?.(null); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title={title}
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="space-y-1 w-full sm:w-auto min-w-0">
            <span className="text-xs font-mono font-bold uppercase text-black dark:text-white block">Shape</span>
            <select value={shapeId} onChange={(e) => pickShape(e.target.value)} className={`${selectClass} w-full max-w-full`}>
              {shapes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-black dark:text-white block">Unit</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={selectClass}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-6 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shape.inputs.map((inp) => (
              <label key={inp.key} className="space-y-1 min-w-0">
                <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{inp.label}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={values[inp.key] ?? ''}
                  placeholder={inp.optional ? 'optional' : ''}
                  onChange={(e) => setValue(inp.key, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
                  className={fieldClass}
                />
              </label>
            ))}
          </div>
          <div className="flex justify-center"><ShapeDiagram id={shapeId} title={shape.name} /></div>
        </div>

        {shape.usesPi && (
          <Choice
            label="Value of π"
            value={pi}
            onChange={change(setPi)}
            options={Object.entries(PI_CHOICES).map(([value, p]) => ({ value, label: p.label }))}
          />
        )}

        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>

        {answer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {answer.outputs.map((o) => (
              <div key={o.key} className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">{o.label}</span>
                <span className="text-2xl font-black font-mono text-black dark:text-white break-all">{sig(o.value, 6)}{o.power === 0 ? '°' : ` ${unitText(unit, o.power)}`}</span>
              </div>
            ))}
          </div>
        )}
        {answer?.note && <p className="text-sm text-neutral-700 dark:text-neutral-300">{answer.note}</p>}
      </CalcCard>

      {answer && (
        <StepsCard title={`Working: ${answer.name}`}>
          {answer.outputs.map((o) => {
            const exact = Number(o.value.toPrecision(6)) === o.value;
            const unitTex = o.power === 0 ? '^\\circ' : `\\ \\text{${unitText(unit, o.power)}}`;
            return (
              <div key={o.key} className="space-y-1">
                <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">{o.label}</div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                  {o.lines.map((line, i) => <BlockMath key={i} math={line} />)}
                  <BlockMath math={`${exact ? '=' : '\\approx'} ${n(o.value)}${unitTex}`} />
                </div>
              </div>
            );
          })}
        </StepsCard>
      )}
    </div>
  );
}
