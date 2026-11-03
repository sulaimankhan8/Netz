'use client';
// The live Pythagoras calculator. The maths is in src/app/utils/engines/pythagoras.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard } from '@/app/components/method/Calculator';
import TriangleDiagram from '@/app/components/method/TriangleDiagram';
import { solve } from '@/app/utils/engines/pythagoras';

const START = { a: '', b: '12', c: '13' };
const FIELDS = [
  { key: 'a', label: 'Leg a' },
  { key: 'b', label: 'Leg b' },
  { key: 'c', label: 'Hypotenuse c (longest side)' },
];
const fieldClass = 'w-full min-h-[44px] px-3 text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

export default function PythagorasCalculator() {
  const [values, setValues] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('pythagoras', 9, answer, () => ({ find: answer?.unknown || 'check' }));

  const run = () => {
    try {
      setError('');
      setAnswer(solve(values));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setValues(START); setAnswer(null); setError(''); };
  const set = (k, v) => { setValues((old) => ({ ...old, [k]: v })); setAnswer(null); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Pythagoras Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">Enter any two sides and leave the third empty. Enter all three to check whether the triangle is right-angled.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="space-y-1 min-w-0">
              <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{f.label}</span>
              <input type="text" inputMode="decimal" autoComplete="off" value={values[f.key]} placeholder="?" onChange={(e) => set(f.key, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') run(); }} className={fieldClass} />
            </label>
          ))}
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>

        {answer?.mode === 'find' && (
          <ResultBox label={`Missing side ${answer.unknown}`}>
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-1 font-mono text-sm">
                <p className="text-2xl font-black">{answer.unknown} = {sig(answer.value, 6)}</p>
                <p>Angle A = {sig(answer.angles.A, 5)}°, angle B = {sig(answer.angles.B, 5)}°, angle C = 90°</p>
                <p>Area = {sig(answer.area, 6)}, perimeter = {sig(answer.perimeter, 6)}</p>
              </div>
              <TriangleDiagram a={answer.a} b={answer.b} c={answer.c} A={answer.angles.A} B={answer.angles.B} C={90} rightAt="C" />
            </div>
          </ResultBox>
        )}
        {answer?.mode === 'check' && (
          <ResultBox label="Is it a right triangle?">
            <p className="font-semibold">{answer.verdict}</p>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
            {answer.mode === 'find' && <BlockMath math={`${answer.unknown} \\approx ${sig(answer.value, 6)}`} />}
          </div>
          {answer.mode === 'find' && (
            <>
              <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">The two acute angles (SOH-CAH-TOA)</div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                {answer.angles.lines.map((l, i) => <BlockMath key={i} math={l} />)}
              </div>
            </>
          )}
        </StepsCard>
      )}
    </div>
  );
}
