'use client';
// The live US sales tax calculator. The maths is in src/app/utils/engines/sales-tax.js; the rates in src/app/data/rates/us.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field, Select, Notes } from '@/app/components/method/Calculator';
import { Stat } from '@/app/components/method/SavingsCalculator';
import RatesBadge from '@/app/components/method/RatesBadge';
import { formatMoney } from '@/app/utils/finance/money';
import { solve, salesTaxRule } from '@/app/utils/engines/sales-tax';

const RULE = salesTaxRule();
const STATES = RULE.data.states;
const START = { amount: '100', mode: 'add', state: RULE.data.defaultState, stateRate: '', local: '1' };

export default function SalesTaxCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('sales-tax', 11, answer, () => ({ state: s.state, mode: s.mode }));
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const m = (v) => formatMoney(v, 'USD');
  const st = STATES.find((x) => x.code === s.state);

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ ...s, rule: RULE }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Sales Tax Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you have?" value={s.mode} onChange={(v) => set({ mode: v })} options={[{ value: 'add', label: 'Price before tax (add tax)' }, { value: 'remove', label: 'Price including tax (remove tax)' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label={s.mode === 'add' ? 'Price before tax ($)' : 'Price including tax ($)'} value={s.amount} onChange={(v) => set({ amount: v })} onEnter={run} />
          <Select label="State" value={s.state} onChange={(v) => set({ state: v })} options={[...STATES.map((x) => ({ value: x.code, label: `${x.name} (${x.rate}%)` })), { value: 'custom', label: 'Other: type the rate' }]} />
          {s.state === 'custom' && <Field label="State rate (%)" value={s.stateRate} placeholder="e.g. 6" onChange={(v) => set({ stateRate: v })} onEnter={run} />}
          <Field label="Local rate: county + city (%)" value={s.local} placeholder="0 if none" onChange={(v) => set({ local: v })} onEnter={run} />
        </div>
        {st?.note && <p className="text-sm text-neutral-700 dark:text-neutral-300">{st.name}: {st.note}.</p>}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Sales Tax
          </EditorialButton>
        </div>

        {answer && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Price before tax" value={m(answer.base)} />
              <Stat label={`Sales tax at ${answer.rate}%`} value={m(answer.tax)} strong />
              <Stat label="Total price" value={m(answer.total)} strong />
            </div>
            {answer.parts.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {answer.parts.map((p) => <Stat key={p.label} label={`${p.label} (${p.rate}%)`} value={m(p.amount)} />)}
              </div>
            )}
          </div>
        )}
        <RatesBadge rule={RULE} custom={s.state === 'custom'}>
          <p className="text-neutral-700 dark:text-neutral-300">Local rates change by address. Look yours up on your state revenue department&apos;s rate finder.</p>
        </RatesBadge>
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
          <Notes notes={answer.notes} />
        </StepsCard>
      )}

      <StepsCard title="State Sales Tax Rates">
        <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700 max-h-[28rem] overflow-y-auto">
          <table className="w-full text-left text-sm border-collapse text-black dark:text-white">
            <thead className="sticky top-0">
              <tr className="bg-neutral-200 dark:bg-neutral-900 font-bold font-mono text-xs">
                <th className="p-2.5">State</th><th className="p-2.5">State rate</th><th className="p-2.5">Note</th>
              </tr>
            </thead>
            <tbody>
              {STATES.map((x) => (
                <tr key={x.code} className="border-t border-black/15 dark:border-neutral-700">
                  <td className="p-2.5 font-semibold">{x.name}</td>
                  <td className="p-2.5 font-mono font-bold">{x.rate}%</td>
                  <td className="p-2.5 text-neutral-600 dark:text-neutral-400">{x.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StepsCard>
    </div>
  );
}
