'use client';
// The live permutations & combinations calculator. The maths is in src/app/utils/engines/permutations-combinations.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Choice, Field } from '@/app/components/method/Calculator';
import { solve, group } from '@/app/utils/engines/permutations-combinations';

const MODES = [
  { value: 'ncr', label: 'nCr (choose)', fields: [['n', 'Total n'], ['r', 'Chosen r']] },
  { value: 'npr', label: 'nPr (arrange)', fields: [['n', 'Total n'], ['r', 'Arranged r']] },
  { value: 'factorial', label: 'n!', fields: [['n', 'n']] },
  { value: 'circular', label: 'Round a table', fields: [['n', 'People / beads n']] },
  { value: 'repetition', label: 'With repetition', fields: [['n', 'Choices n'], ['r', 'Picks r']] },
  { value: 'word', label: 'Letters of a word', fields: [['word', 'Word, e.g. MISSISSIPPI']] },
];
const START = { mode: 'ncr', n: '10', r: '3', word: 'MISSISSIPPI', necklace: false };

export default function CountingCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('permutations-combinations', 7, answer, () => ({ mode: s.mode }));
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
        title="Counting Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you want to count?" value={s.mode} onChange={(v) => set({ mode: v })} options={MODES.map(({ value, label }) => ({ value, label }))} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {info.fields.map(([k, label]) => (
            <Field key={k} label={label} value={s[k]} inputMode={k === 'word' ? 'text' : 'numeric'} onChange={(v) => set({ [k]: v })} onEnter={run} />
          ))}
        </div>
        {s.mode === 'circular' && (
          <Choice label="Can it be flipped over?" value={s.necklace ? 'yes' : 'no'} onChange={(v) => set({ necklace: v === 'yes' })} options={[{ value: 'no', label: 'No (people at a table)' }, { value: 'yes', label: 'Yes (beads on a necklace)' }]} />
        )}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label={`${info.label}${answer.digits > 15 ? ` · ${answer.digits} digits` : ''}`}>
            <p className="text-2xl font-black font-mono break-all">{answer.text}</p>
            {answer.mode === 'ncr' && <p className="text-sm">If the order mattered (nPr), it would be {group(answer.permutations)}: each group of {s.r} can be arranged {s.r}! ways.</p>}
            {answer.mode === 'repetition' && <p className="text-sm">Choosing {s.r} with repeats when order doesn&apos;t matter: {group(answer.selections)} ways.</p>}
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
