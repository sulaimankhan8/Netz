'use client';
// The live GST calculator. The maths is in src/app/utils/engines/gst.js; the rates in src/app/data/rates/in.js.
import React, { useMemo, useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field, Select } from '@/app/components/method/Calculator';
import RatesBadge from '@/app/components/method/RatesBadge';
import { formatMoney } from '@/app/utils/finance/money';
import { IN_RULES } from '@/app/data/rates/in';
import { versions } from '@/app/utils/rates/getRule';
import { solve } from '@/app/utils/engines/gst';

const PERIODS = versions(IN_RULES, 'in.gst.slabs');
const START = { amount: '50000', mode: 'add', supply: 'intra', rate: '18', custom: '', period: 0 };

const Stat = ({ label, value, strong }) => (
  <div className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl min-w-0">
    <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">{label}</span>
    <span className={`${strong ? 'text-2xl' : 'text-lg'} font-black font-mono text-black dark:text-white break-all`}>{value}</span>
  </div>
);

export default function GstCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('gst', 11, answer, () => ({ rate: answer?.rate, mode: s.mode }));
  const rule = PERIODS[s.period];
  const slabs = rule.data.slabs;
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const usingCustom = s.rate === 'custom';
  const rate = usingCustom ? s.custom : s.rate;

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ amount: s.amount, rate, mode: s.mode, supply: s.supply }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };
  const choosePeriod = (i) => {
    const r = PERIODS[i];
    const keep = r.data.slabs.some((x) => String(x.rate) === s.rate);
    set({ period: i, rate: keep || s.rate === 'custom' ? s.rate : String(r.data.defaultRate) });
  };
  const rateOptions = useMemo(() => [...slabs.map((x) => ({ value: String(x.rate), label: `${x.rate}%` })), { value: 'custom', label: 'Other' }], [slabs]);
  const m = (v) => formatMoney(v, 'INR');

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="GST Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="What do you have?" value={s.mode} onChange={(v) => set({ mode: v })} options={[{ value: 'add', label: 'Price before GST (add GST)' }, { value: 'remove', label: 'Price including GST (remove GST)' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label={s.mode === 'add' ? 'Price before GST (₹)' : 'Price including GST (₹)'} value={s.amount} onChange={(v) => set({ amount: v })} onEnter={run} />
          <Select label="Rates for" value={String(s.period)} onChange={(v) => choosePeriod(Number(v))} options={PERIODS.map((p, i) => ({ value: String(i), label: p.label }))} />
        </div>
        <Choice label="GST rate" value={s.rate} onChange={(v) => set({ rate: v })} options={rateOptions} />
        {usingCustom && (
          <div className="max-w-xs"><Field label="Your GST rate (%)" value={s.custom} placeholder="e.g. 7.5" onChange={(v) => set({ custom: v })} onEnter={run} /></div>
        )}
        <Choice label="Where is it sold?" value={s.supply} onChange={(v) => set({ supply: v })} options={[{ value: 'intra', label: 'Within one state (CGST + SGST)' }, { value: 'inter', label: 'To another state / import (IGST)' }]} />
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate GST
          </EditorialButton>
        </div>

        {answer && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Price before GST" value={m(answer.base)} />
              <Stat label={`GST at ${answer.rate}%`} value={m(answer.gst)} strong />
              <Stat label="Total price" value={m(answer.total)} strong />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {answer.supply === 'inter'
                ? <Stat label={`IGST (${answer.rate}%)`} value={m(answer.igst)} />
                : (
                  <>
                    <Stat label={`CGST (${answer.rate / 2}%)`} value={m(answer.cgst)} />
                    <Stat label={`SGST / UTGST (${answer.rate / 2}%)`} value={m(answer.sgst)} />
                  </>
                )}
            </div>
          </div>
        )}
        <RatesBadge rule={rule} custom={usingCustom} />
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
        </StepsCard>
      )}

      <StepsCard title={`GST Slabs: ${rule.label}`}>
        <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
          <table className="w-full text-left text-sm border-collapse text-black dark:text-white">
            <thead>
              <tr className="bg-neutral-200 dark:bg-neutral-900 font-bold font-mono text-xs">
                <th className="p-2.5">Rate</th><th className="p-2.5">What it covers</th><th className="p-2.5">Examples</th>
              </tr>
            </thead>
            <tbody>
              {slabs.map((x) => (
                <tr key={x.rate} className="border-t border-black/15 dark:border-neutral-700">
                  <td className="p-2.5 font-mono font-bold">{x.rate}%</td>
                  <td className="p-2.5">{x.label}</td>
                  <td className="p-2.5 text-neutral-600 dark:text-neutral-400">{x.example || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">The rate depends on the exact item (its HSN or SAC code). Check the official rate schedule for anything you are not sure of.</p>
      </StepsCard>
    </div>
  );
}
