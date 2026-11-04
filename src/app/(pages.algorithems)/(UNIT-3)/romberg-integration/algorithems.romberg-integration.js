'use client';
// The live Romberg integration calculator. The maths is in src/app/utils/engines/romberg.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field } from '@/app/components/method/Calculator';
import { solve } from '@/app/utils/engines/romberg';

const START = { f: '1/(1+x)', a: '0', b: '1', levels: '2' };

export default function RombergCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('romberg', 3, answer, () => ({ fn: v.f }));
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
        title="Romberg Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3">
          <div className="col-span-2 sm:col-span-1"><Field label="f(x)" value={v.f} inputMode="text" onChange={(f) => set({ f })} onEnter={run} /></div>
          <Field label="Lower limit a" value={v.a} inputMode="text" onChange={(a) => set({ a })} onEnter={run} />
          <Field label="Upper limit b" value={v.b} inputMode="text" onChange={(b) => set({ b })} onEnter={run} />
          <Field label="Levels (1–10)" value={v.levels} inputMode="numeric" onChange={(levels) => set({ levels })} onEnter={run} />
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Limits can be numbers or constants such as pi or pi/2. Level k uses 2ᵏ strips.</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Integrate
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label="Romberg estimate">
            <p className="text-2xl font-black font-mono break-all">∫ ≈ {sig(answer.best, 10)}</p>
            {answer.error !== null && <p className="text-sm font-mono">Change from the previous level: {sig(answer.error, 3)} (a rough error estimate)</p>}
          </ResultBox>
        )}
      </CalcCard>
      {answer && (
        <StepsCard title="Romberg Table">
          <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
            <table className="w-full text-center text-xs font-mono border-collapse text-black dark:text-white">
              <thead>
                <tr className="bg-neutral-200 dark:bg-neutral-900 font-bold">
                  <th className="p-2">Strips</th>
                  {answer.R.map((_, j) => <th key={j} className="p-2">{j === 0 ? 'Trapezoidal R(i,0)' : `R(i,${j})`}</th>)}
                </tr>
              </thead>
              <tbody>
                {answer.R.map((row, i) => (
                  <tr key={i} className="border-t border-black/15 dark:border-neutral-700">
                    <td className="p-2 font-bold">{2 ** i}</td>
                    {answer.R.map((_, j) => (
                      <td key={j} className={`p-2 ${i === answer.k && j === answer.k ? 'bg-[#FFE600]/30 dark:bg-amber-950/50 font-bold' : ''}`}>{j <= i ? sig(row[j], 10) : ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
        </StepsCard>
      )}
    </div>
  );
}
