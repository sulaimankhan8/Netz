'use client';
// The live percentage calculator. The maths is in src/app/utils/engines/percentage.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Choice, Field, Select } from '@/app/components/method/Calculator';
import { CURRENCIES } from '@/app/utils/finance/money';
import { solve, MODES } from '@/app/utils/engines/percentage';

const START = { mode: 'profit-loss', values: { x: '15', y: '240', a: '45', b: '180', from: '80', to: '100', cp: '800', sp: '900', mp: '1000', discounts: '20, 10', cost: '80', price: '100' } };

export default function PercentageCalculator() {
  const [mode, setMode] = useState(START.mode);
  const [values, setValues] = useState(START.values);
  const [cur, setCur] = useState('INR');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('percentage', 10, answer, () => ({ mode }));
  const info = MODES.find((m) => m.id === mode);

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ mode, values, currency: cur }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setMode(START.mode); setValues(START.values); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Percentage Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you want to work out?" value={mode} onChange={(v) => { setMode(v); setAnswer(null); setError(''); }} options={MODES.map((m) => ({ value: m.id, label: m.label }))} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {info.inputs.map(([k, label]) => (
            <Field key={k} label={label} value={values[k]} inputMode={k === 'discounts' ? 'text' : 'decimal'} onChange={(v) => { setValues((o) => ({ ...o, [k]: v })); setAnswer(null); }} onEnter={run} />
          ))}
          {info.money && (
            <Select label="Currency" value={cur} onChange={(v) => { setCur(v); setAnswer(null); }} options={Object.entries(CURRENCIES).map(([value, c]) => ({ value, label: c.label }))} />
          )}
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label={info.label}>
            <p className="text-xl font-black font-mono break-words">{answer.headline}</p>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
          {answer.successive && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">Successive discounts don&apos;t simply add up: each one is taken off the already-reduced price.</p>
          )}
        </StepsCard>
      )}
    </div>
  );
}
