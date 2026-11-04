'use client';
// The live AP / GP calculator. The maths is in src/app/utils/engines/progressions.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Choice, Field } from '@/app/components/method/Calculator';
import { solve } from '@/app/utils/engines/progressions';

const MODES = [
  { value: 'ap', label: 'Arithmetic (AP)', fields: [['a', 'First term a'], ['d', 'Common difference d'], ['n', 'Number of terms n']] },
  { value: 'gp', label: 'Geometric (GP)', fields: [['a', 'First term a'], ['r', 'Common ratio r'], ['n', 'Number of terms n']] },
  { value: 'special', label: 'Σn, Σn², Σn³', fields: [['n', 'n']] },
  { value: 'detect', label: 'AP or GP?', fields: [['terms', 'The first few terms, e.g. 2, 6, 18, 54']] },
];
const START = { mode: 'ap', a: '5', d: '4', r: '2', n: '20', terms: '2, 6, 18, 54' };

function headline(r) {
  switch (r.mode) {
    case 'ap': return `aₙ = ${sig(r.nth, 10)}, Sₙ = ${sig(r.sum, 10)}`;
    case 'gp': return `aₙ = ${sig(r.nth, 10)}, Sₙ = ${sig(r.sum, 10)}${r.sInf !== null ? `, S∞ = ${sig(r.sInf, 10)}` : ''}`;
    case 'special': return `Σk = ${r.s1.toLocaleString('en')}, Σk² = ${r.s2.toLocaleString('en')}, Σk³ = ${r.s3.toLocaleString('en')}`;
    case 'detect': return r.kind === 'AP' ? `An AP with d = ${sig(r.d, 8)}; the next term is ${sig(r.next, 8)}` : r.kind === 'GP' ? `A GP with r = ${sig(r.r, 8)}; the next term is ${sig(r.next, 8)}` : 'Neither an AP nor a GP';
    default: return '';
  }
}

export default function ProgressionCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('progressions', 7, answer, () => ({ mode: s.mode }));
  const info = MODES.find((m) => m.value === s.mode);
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };

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

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Progressions Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you want to work out?" value={s.mode} onChange={(v) => set({ mode: v })} options={MODES.map(({ value, label }) => ({ value, label }))} />
        <div className={`grid grid-cols-1 ${info.fields.length > 1 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
          {info.fields.map(([k, label]) => (
            <Field key={k} label={label} value={s[k]} inputMode={k === 'terms' ? 'text' : 'decimal'} onChange={(v) => set({ [k]: v })} onEnter={run} />
          ))}
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label={info.label}>
            <p className="text-xl font-black font-mono break-words">{headline(answer)}</p>
            {answer.list && <p className="text-sm font-mono break-words">First terms: {answer.list.map((x) => sig(x, 8)).join(', ')}{answer.list.length < Number(s.n) ? ', …' : ''}</p>}
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
