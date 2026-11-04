'use client';
// The live VAT calculator. The maths is in src/app/utils/engines/vat.js; the rates in src/app/data/rates/vat.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field } from '@/app/components/method/Calculator';
import RatesBadge from '@/app/components/method/RatesBadge';
import { formatCurrencyCode } from '@/app/utils/finance/money';
import { VAT_COUNTRIES } from '@/app/data/rates/vat';
import { solve, country as findCountry, vatRule } from '@/app/utils/engines/vat';

const GROUPS = [...new Set(VAT_COUNTRIES.map((c) => c.group))];
const START = { code: 'GB', amount: '240', mode: 'remove', rate: '20', custom: '' };

const Stat = ({ label, value, strong }) => (
  <div className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl min-w-0">
    <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">{label}</span>
    <span className={`${strong ? 'text-2xl' : 'text-lg'} font-black font-mono text-black dark:text-white break-all`}>{value}</span>
  </div>
);

export default function VatCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('vat', 11, answer, () => ({ country: s.code, mode: s.mode }));
  const c = findCountry(s.code);
  const rule = vatRule(s.code);
  const tax = c.taxName;
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const usingCustom = s.rate === 'custom';
  const money = (v) => formatCurrencyCode(v, c.currency);

  const pickCountry = (code) => set({ code, rate: String(vatRule(code).data.standard) });
  const run = () => {
    try {
      setError('');
      setAnswer({ ...solve({ amount: s.amount, rate: usingCustom ? s.custom : s.rate, mode: s.mode, taxName: tax }), taxName: tax });
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };

  const rateOptions = [
    { value: String(rule.data.standard), label: `${rule.data.standard}% standard` },
    ...rule.data.reduced.map((r) => ({ value: String(r.rate), label: `${r.rate}%` })),
    { value: 'custom', label: 'Other' },
  ];
  const reducedNote = rule.data.reduced.find((r) => String(r.rate) === s.rate);

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title={`${tax} Engine`}
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1 min-w-0 block">
            <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">Country</span>
            <select value={s.code} onChange={(e) => pickCountry(e.target.value)} className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-base font-bold text-black dark:text-white focus:outline-none">
              {GROUPS.map((g) => (
                <optgroup key={g} label={g}>
                  {VAT_COUNTRIES.filter((x) => x.group === g).map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <Field label={s.mode === 'add' ? `Price before ${tax} (${c.currency})` : `Price including ${tax} (${c.currency})`} value={s.amount} onChange={(v) => set({ amount: v })} onEnter={run} />
        </div>
        <Choice label="What do you have?" value={s.mode} onChange={(v) => set({ mode: v })} options={[{ value: 'add', label: `Price before ${tax} (add ${tax})` }, { value: 'remove', label: `Price including ${tax} (remove ${tax})` }]} />
        <Choice label={`${tax} rate`} value={s.rate} onChange={(v) => set({ rate: v })} options={rateOptions} />
        {reducedNote && <p className="text-sm text-neutral-700 dark:text-neutral-300">{reducedNote.label}</p>}
        {c.note && <p className="text-sm text-neutral-700 dark:text-neutral-300">{c.name}: {c.note}.</p>}
        {usingCustom && (
          <div className="max-w-xs"><Field label={`Your ${tax} rate (%)`} value={s.custom} placeholder="e.g. 13.5" onChange={(v) => set({ custom: v })} onEnter={run} /></div>
        )}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate {tax}
          </EditorialButton>
        </div>

        {answer && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label={`Price before ${answer.taxName}`} value={money(answer.net)} />
            <Stat label={`${answer.taxName} at ${answer.rate}%`} value={money(answer.tax)} strong />
            <Stat label={`Price including ${answer.taxName}`} value={money(answer.gross)} strong />
          </div>
        )}
        <RatesBadge rule={rule} custom={usingCustom} />
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
          {answer.trap && (
            <>
              <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">The common mistake</div>
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                {answer.trap.map((l, i) => <BlockMath key={i} math={l} />)}
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                The {answer.taxName} was added as {answer.rate}% of the price <em>before</em> {answer.taxName}, so taking {answer.rate}% of the bigger price removes too much. Divide by {1 + answer.rate / 100} instead.
              </p>
            </>
          )}
        </StepsCard>
      )}
    </div>
  );
}
