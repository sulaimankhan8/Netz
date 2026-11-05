'use client';
// Shared calculator for the Unit 10 savings pages (FD, RD, PPF, SIP, lump sum). Each engine returns
// { stats, lines, notes, columns, rows, bars } (see src/app/utils/engines/fd.js); this draws the inputs, the
// summary boxes, the working and a year-by-year chart and table.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field, Select, Notes } from './Calculator';
import { StepTable } from './StepTable';
import StackedBars from './StackedBars';
import { CURRENCIES, formatMoney, formatPct } from '@/app/utils/finance/money';

/** Short axis labels: ₹12k, ₹1.2L, ₹3.4Cr for rupees; $12k, $1.2M otherwise. */
export function shortMoney(v, cur) {
  const sym = CURRENCIES[cur]?.symbol ?? '';
  const a = Math.abs(v);
  if (cur === 'INR') {
    if (a >= 1e7) return `${sym}${Number((v / 1e7).toFixed(1))}Cr`;
    if (a >= 1e5) return `${sym}${Number((v / 1e5).toFixed(1))}L`;
  } else if (a >= 1e6) return `${sym}${Number((v / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${sym}${Number((v / 1e3).toFixed(1))}k`;
  return `${sym}${Number(v.toFixed(0))}`;
}

export const Stat = ({ label, value, strong }) => (
  <div className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl min-w-0">
    <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">{label}</span>
    <span className={`${strong ? 'text-2xl' : 'text-lg'} font-black font-mono text-black dark:text-white break-all`}>{value}</span>
  </div>
);

/**
 * fields: [{ key, label, kind: 'field' | 'select' | 'choice', options, placeholder, show: (s) => bool }]
 * solve(s, currency) → engine result. examples: [{ label, input }]. currencyPicker: show the currency select.
 * below(s): extra content under the inputs (e.g. a RatesBadge).
 */
export default function SavingsCalculator({
  id, unit = 10, title, start, fields, solve, examples = [], button = 'Calculate', currencyPicker = true, below = null,
}) {
  const [s, setS] = useState(start);
  const [cur, setCur] = useState('INR');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve(id, unit, answer, () => ({}));
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const money = (v) => formatMoney(v, cur);

  const run = (input = s) => {
    try {
      setError('');
      setAnswer(solve(input, cur));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(start); setAnswer(null); setError(''); };
  const load = (ex) => { const next = { ...start, ...ex.input }; setS(next); run(next); };
  const shown = fields.filter((f) => !f.show || f.show(s));
  const choices = shown.filter((f) => f.kind === 'choice');
  const boxes = shown.filter((f) => f.kind !== 'choice');
  const fmt = (st) => (st.kind === 'pct' ? formatPct(st.value) : st.kind === 'text' ? st.value : money(st.value));
  const cell = (c, v) => (c.kind === 'year' ? String(Number(v.toFixed(2))) : money(v));

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title={title}
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        {examples.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-mono font-bold uppercase self-center text-neutral-600 dark:text-neutral-400">Try:</span>
            {examples.map((ex) => (
              <button key={ex.label} type="button" onClick={() => load(ex)} className="px-3 py-2 min-h-[40px] text-sm font-semibold border-2 border-black/40 dark:border-neutral-500 rounded-lg hover:bg-[#FFE600]/40 dark:hover:bg-neutral-800 text-black dark:text-white">
                {ex.label}
              </button>
            ))}
          </div>
        )}
        {choices.map((f) => <Choice key={f.key} label={f.label} value={s[f.key]} onChange={(v) => set({ [f.key]: v })} options={f.options} />)}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {boxes.map((f) => (f.kind === 'select'
            ? <Select key={f.key} label={f.label} value={s[f.key]} onChange={(v) => set({ [f.key]: v })} options={f.options} />
            : <Field key={f.key} label={f.label} value={s[f.key] ?? ''} placeholder={f.placeholder} onChange={(v) => set({ [f.key]: v })} onEnter={() => run()} />))}
          {currencyPicker && (
            <Select label="Currency" value={cur} onChange={(v) => { setCur(v); setAnswer(null); }} options={Object.entries(CURRENCIES).map(([value, c]) => ({ value, label: c.label }))} />
          )}
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> {button}
          </EditorialButton>
        </div>

        {answer && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {answer.stats.map((st) => <Stat key={st.label} label={st.label} value={fmt(st)} strong={st.strong} />)}
          </div>
        )}
        {below && below(s)}
      </CalcCard>

      {answer && (
        <>
          <StepsCard title="Working">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
              {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
            </div>
            <Notes notes={answer.notes} />
          </StepsCard>

          <StepsCard title="Year by Year">
            <StackedBars
              title={`Value at the end of each year, split into ${answer.bars.series[0].toLowerCase()} and ${answer.bars.series[1].toLowerCase()}`}
              series={answer.bars.series}
              rows={answer.bars.rows}
              format={(v, axis) => (axis ? shortMoney(v, cur) : money(v))}
            />
            <StepTable
              columns={answer.columns}
              rows={answer.rows.map((r) => Object.fromEntries(answer.columns.map((c) => [c.key, cell(c, r[c.key])])))}
              rowKey={(r, i) => i}
            />
          </StepsCard>
        </>
      )}
    </div>
  );
}
