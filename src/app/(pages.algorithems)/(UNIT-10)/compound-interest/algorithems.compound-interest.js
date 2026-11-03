'use client';
// The live simple & compound interest calculator. The maths is in src/app/utils/engines/compound-interest.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field, Select, Notes } from '@/app/components/method/Calculator';
import { StepTable } from '@/app/components/method';
import StackedBars from '@/app/components/method/StackedBars';
import { CURRENCIES, formatMoney } from '@/app/utils/finance/money';
import { solve, FREQUENCIES } from '@/app/utils/engines/compound-interest';

const START = { kind: 'compound', principal: '8000', rate: '10', time: '1.5', timeUnit: 'years', frequency: '2' };

/** Short axis labels: ₹12k, ₹1.2L for rupees; $12k, $1.2M otherwise. */
function short(v, cur) {
  const sym = CURRENCIES[cur]?.symbol ?? '';
  const a = Math.abs(v);
  if (cur === 'INR') {
    if (a >= 1e7) return `${sym}${Number((v / 1e7).toFixed(1))}Cr`;
    if (a >= 1e5) return `${sym}${Number((v / 1e5).toFixed(1))}L`;
  } else if (a >= 1e6) return `${sym}${Number((v / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${sym}${Number((v / 1e3).toFixed(1))}k`;
  return `${sym}${Number(v.toFixed(0))}`;
}

const Stat = ({ label, value, strong }) => (
  <div className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl min-w-0">
    <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">{label}</span>
    <span className={`${strong ? 'text-2xl' : 'text-lg'} font-black font-mono text-black dark:text-white break-all`}>{value}</span>
  </div>
);

export default function InterestCalculator() {
  const [s, setS] = useState(START);
  const [cur, setCur] = useState('INR');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('compound-interest', 10, answer, () => ({ kind: s.kind, frequency: s.frequency }));
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const money = (v) => formatMoney(v, cur);

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ ...s, currency: cur }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };

  const tableRows = answer?.rows.map((r) => (answer.kind === 'simple'
    ? { year: r.year, interest: money(r.interest), total: money(r.total), amount: money(r.amount) }
    : { year: r.year, opening: money(r.opening), interest: money(r.interest), amount: money(r.amount) }));
  const columns = answer?.kind === 'simple'
    ? [{ key: 'year', label: 'Year', bold: true }, { key: 'interest', label: 'Interest this year' }, { key: 'total', label: 'Interest so far' }, { key: 'amount', label: 'Amount', highlight: true }]
    : [{ key: 'year', label: 'Year', bold: true }, { key: 'opening', label: 'Opening amount' }, { key: 'interest', label: 'Interest this year' }, { key: 'amount', label: 'Closing amount', highlight: true }];

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Interest Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="Type of interest" value={s.kind} onChange={(v) => set({ kind: v })} options={[{ value: 'compound', label: 'Compound interest' }, { value: 'simple', label: 'Simple interest' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Principal P" value={s.principal} onChange={(v) => set({ principal: v })} onEnter={run} />
          <Field label="Rate R (% a year)" value={s.rate} onChange={(v) => set({ rate: v })} onEnter={run} />
          <Field label="Time T" value={s.time} onChange={(v) => set({ time: v })} onEnter={run} />
          <Select label="Time is in" value={s.timeUnit} onChange={(v) => set({ timeUnit: v })} options={[{ value: 'years', label: 'Years' }, { value: 'months', label: 'Months' }]} />
          {s.kind === 'compound' && (
            <Select label="Compounded" value={s.frequency} onChange={(v) => set({ frequency: v })} options={FREQUENCIES.map((f) => ({ value: f.value, label: f.label }))} />
          )}
          <Select label="Currency" value={cur} onChange={(v) => { setCur(v); setAnswer(null); }} options={Object.entries(CURRENCIES).map(([value, c]) => ({ value, label: c.label }))} />
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>

        {answer && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Amount A" value={money(answer.amount)} strong />
            <Stat label={answer.kind === 'simple' ? 'Simple interest' : 'Compound interest'} value={money(answer.interest)} strong />
            {answer.kind === 'compound' && <Stat label="Simple interest would be" value={`${money(answer.si)} (CI is ${money(answer.interest - answer.si)} more)`} />}
          </div>
        )}
      </CalcCard>

      {answer && (
        <>
          <StepsCard title="Working">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
              {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
            </div>
            {answer.extra && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                {answer.extra.map((l, i) => <BlockMath key={i} math={l} />)}
              </div>
            )}
            <Notes notes={answer.notes} />
          </StepsCard>

          <StepsCard title="Year by Year">
            <StackedBars
              title="Amount at the end of each year, split into principal and interest"
              series={['Principal', 'Interest earned']}
              rows={answer.rows.map((r) => ({ label: String(Number(r.year.toFixed(2))), parts: [answer.P, answer.kind === 'simple' ? r.total : r.amount - answer.P] }))}
              format={(v, axis) => (axis ? short(v, cur) : money(v))}
            />
            <StepTable columns={columns} rows={tableRows} rowKey={(r) => r.year} />
          </StepsCard>
        </>
      )}
    </div>
  );
}
