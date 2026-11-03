'use client';
// The live EMI calculator with its amortisation schedule. The maths is in src/app/utils/engines/emi.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field, Select, Notes } from '@/app/components/method/Calculator';
import { StepTable } from '@/app/components/method';
import StackedBars, { SERIES_CLASSES } from '@/app/components/method/StackedBars';
import { CURRENCIES, formatMoney } from '@/app/utils/finance/money';
import { solve } from '@/app/utils/engines/emi';

const START = { principal: '500000', rate: '9', tenure: '5', tenureUnit: 'years', method: 'reducing', prepayAmount: '', prepayMonth: '' };

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

/** One bar split into principal and interest, with both shares written out. */
function ShareBar({ principal, interest, money }) {
  const total = principal + interest;
  const p = (principal / total) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex h-4 w-full gap-[2px] rounded-md overflow-hidden" role="img" aria-label={`Principal ${p.toFixed(1)}%, interest ${(100 - p).toFixed(1)}% of the total paid`}>
        <div className={SERIES_CLASSES[0].swatch} style={{ width: `${p}%` }} />
        <div className={`${SERIES_CLASSES[1].swatch} flex-1`} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs font-mono text-black dark:text-white">
        <span className="flex items-center gap-1.5"><span className={`inline-block w-3 h-3 rounded-sm ${SERIES_CLASSES[0].swatch}`} />Principal {money(principal)} ({p.toFixed(1)}%)</span>
        <span className="flex items-center gap-1.5"><span className={`inline-block w-3 h-3 rounded-sm ${SERIES_CLASSES[1].swatch}`} />Interest {money(interest)} ({(100 - p).toFixed(1)}%)</span>
      </div>
    </div>
  );
}

export default function EmiCalculator() {
  const [s, setS] = useState(START);
  const [cur, setCur] = useState('INR');
  const [view, setView] = useState('year');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('emi', 10, answer, () => ({ method: s.method, months: answer?.N }));
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const money = (v) => formatMoney(v, cur);

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ ...s, prepayAmount: s.method === 'reducing' ? s.prepayAmount : '', currency: cur }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };

  // With a prepayment, show the schedule that includes it
  const plan = answer?.prepay ? answer.prepay : answer;
  const hasPrepay = Boolean(answer?.prepay);
  const yearCols = [
    { key: 'year', label: 'Year', bold: true }, { key: 'principal', label: 'Principal paid' }, { key: 'interest', label: 'Interest paid' },
    ...(hasPrepay ? [{ key: 'prepay', label: 'Prepayment' }] : []), { key: 'closing', label: 'Balance left', highlight: true },
  ];
  const monthCols = [
    { key: 'month', label: 'Month', bold: true }, { key: 'opening', label: 'Opening balance' }, { key: 'emi', label: 'EMI' }, { key: 'interest', label: 'Interest' },
    { key: 'principal', label: 'Principal' }, ...(hasPrepay ? [{ key: 'prepay', label: 'Prepayment' }] : []), { key: 'closing', label: 'Closing balance', highlight: true },
  ];
  const fmtRow = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, k === 'month' || k === 'year' ? v : (k === 'prepay' && !v ? '—' : money(v))]));

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="EMI Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Loan amount P" value={s.principal} onChange={(v) => set({ principal: v })} onEnter={run} />
          <Field label="Interest rate R (% a year)" value={s.rate} onChange={(v) => set({ rate: v })} onEnter={run} />
          <Field label="Tenure" value={s.tenure} onChange={(v) => set({ tenure: v })} onEnter={run} />
          <Select label="Tenure is in" value={s.tenureUnit} onChange={(v) => set({ tenureUnit: v })} options={[{ value: 'years', label: 'Years' }, { value: 'months', label: 'Months' }]} />
          <Select label="Currency" value={cur} onChange={(v) => { setCur(v); setAnswer(null); }} options={Object.entries(CURRENCIES).map(([value, c]) => ({ value, label: c.label }))} />
        </div>
        <Choice label="Interest is charged on" value={s.method} onChange={(v) => set({ method: v })} options={[{ value: 'reducing', label: 'Reducing balance' }, { value: 'flat', label: 'Flat rate' }]} />
        {s.method === 'reducing' && (
          <fieldset className="border-2 border-dashed border-black/30 dark:border-neutral-600 rounded-xl px-3 pb-3 pt-1">
            <legend className="px-1 text-xs font-mono font-bold uppercase text-black dark:text-white">Prepayment (optional)</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Extra amount paid once" value={s.prepayAmount} placeholder="e.g. 100000" onChange={(v) => set({ prepayAmount: v })} onEnter={run} />
              <Field label="After which month?" value={s.prepayMonth} placeholder="e.g. 24" inputMode="numeric" onChange={(v) => set({ prepayMonth: v })} onEnter={run} />
            </div>
          </fieldset>
        )}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate EMI
          </EditorialButton>
        </div>

        {answer && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Monthly EMI" value={money(answer.emi)} strong />
              <Stat label="Total interest" value={money(answer.totalInterest)} />
              <Stat label="Total paid" value={money(answer.totalPaid)} />
            </div>
            <ShareBar principal={answer.P} interest={answer.totalInterest} money={money} />
            {hasPrepay && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Stat label="With the prepayment, loan ends after" value={`${answer.prepay.months} months (${answer.prepay.monthsSaved} sooner)`} />
                <Stat label="Interest saved" value={money(answer.prepay.interestSaved)} />
              </div>
            )}
          </div>
        )}
      </CalcCard>

      {answer && (
        <>
          <StepsCard title="Working">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
              {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
            </div>
            <Notes notes={answer.notes} />
          </StepsCard>

          <StepsCard title={`Amortisation Schedule${hasPrepay ? ' (with the prepayment)' : ''}`}>
            <StackedBars
              title="Principal and interest paid each year"
              series={['Principal paid', 'Interest paid']}
              rows={plan.years.map((y) => ({ label: String(y.year), parts: [y.principal, y.interest] }))}
              format={(v, axis) => (axis ? short(v, cur) : money(v))}
            />
            <Choice label="Show" value={view} onChange={setView} options={[{ value: 'year', label: 'By year' }, { value: 'month', label: `By month (${plan.rows.length})` }]} />
            {view === 'year'
              ? <StepTable columns={yearCols} rows={plan.years.map(fmtRow)} rowKey={(r) => r.year} />
              : (
                <div className="max-h-[520px] overflow-y-auto rounded-xl">
                  <StepTable columns={monthCols} rows={plan.rows.map(fmtRow)} rowKey={(r) => r.month} />
                </div>
              )}
          </StepsCard>
        </>
      )}
    </div>
  );
}
