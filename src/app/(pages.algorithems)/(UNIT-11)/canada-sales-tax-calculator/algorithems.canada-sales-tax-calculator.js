'use client';
// The live Canada GST/HST/PST calculator. The maths is in src/app/utils/engines/canada-sales-tax.js; the rates in src/app/data/rates/ca.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field, Select, Notes } from '@/app/components/method/Calculator';
import { Stat } from '@/app/components/method/SavingsCalculator';
import RatesBadge from '@/app/components/method/RatesBadge';
import { formatCurrencyCode } from '@/app/utils/finance/money';
import { CA_RULES } from '@/app/data/rates/ca';
import { versions } from '@/app/utils/rates/getRule';
import { solve, provinceParts } from '@/app/utils/engines/canada-sales-tax';

const PERIODS = versions(CA_RULES, 'ca.salestax.provinces');
const START = { amount: '100', mode: 'add', province: 'ON', period: 0 };
const KIND = { gst: 'GST only', hst: 'HST', pst: 'GST + provincial tax' };

export default function CanadaSalesTaxCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('canada-sales-tax', 11, answer, () => ({ province: s.province, mode: s.mode }));
  const rule = PERIODS[s.period];
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const m = (v) => formatCurrencyCode(v, 'CAD');
  const rateText = (p) => provinceParts(rule, p.code).parts.map((x) => `${x.rate}% ${x.label}`).join(' + ');

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ ...s, rule }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="GST/HST Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you have?" value={s.mode} onChange={(v) => set({ mode: v })} options={[{ value: 'add', label: 'Price before tax (add tax)' }, { value: 'remove', label: 'Price including tax (remove tax)' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label={s.mode === 'add' ? 'Price before tax ($)' : 'Price including tax ($)'} value={s.amount} onChange={(v) => set({ amount: v })} onEnter={run} />
          <Select label="Province or territory" value={s.province} onChange={(v) => set({ province: v })} options={rule.data.provinces.map((p) => ({ value: p.code, label: `${p.name} (${rateText(p)})` }))} />
          <Select label="Rates for" value={String(s.period)} onChange={(v) => set({ period: Number(v) })} options={PERIODS.map((p, i) => ({ value: String(i), label: p.label }))} />
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Tax
          </EditorialButton>
        </div>

        {answer && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Price before tax" value={m(answer.base)} />
              <Stat label={`Tax at ${Number(answer.rate.toFixed(3))}%`} value={m(answer.tax)} strong />
              <Stat label="Total price" value={m(answer.total)} strong />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {answer.parts.map((p) => <Stat key={p.label} label={`${p.label} (${p.rate}%)`} value={m(p.amount)} />)}
            </div>
          </div>
        )}
        <RatesBadge rule={rule} />
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
          <Notes notes={answer.notes} />
        </StepsCard>
      )}

      <StepsCard title={`Rates by Province: ${rule.label}`}>
        <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
          <table className="w-full text-left text-sm border-collapse text-black dark:text-white">
            <thead>
              <tr className="bg-neutral-200 dark:bg-neutral-900 font-bold font-mono text-xs">
                <th className="p-2.5">Province / territory</th><th className="p-2.5">Type</th><th className="p-2.5">Rate</th>
              </tr>
            </thead>
            <tbody>
              {rule.data.provinces.map((p) => (
                <tr key={p.code} className="border-t border-black/15 dark:border-neutral-700">
                  <td className="p-2.5 font-semibold">{p.name}</td>
                  <td className="p-2.5">{KIND[p.kind]}</td>
                  <td className="p-2.5 font-mono font-bold">{rateText(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StepsCard>
    </div>
  );
}
