'use client';
// The live India income tax calculator (new vs old regime). The maths is in src/app/utils/engines/income-tax.js;
// the slabs in src/app/data/rates/in.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, StepsCard, Choice, Field, Select, Notes } from '@/app/components/method/Calculator';
import { StepTable } from '@/app/components/method';
import { Stat } from '@/app/components/method/SavingsCalculator';
import RatesBadge from '@/app/components/method/RatesBadge';
import { formatMoney, formatPct } from '@/app/utils/finance/money';
import { IN_RULES } from '@/app/data/rates/in';
import { versions } from '@/app/utils/rates/getRule';
import { solve } from '@/app/utils/engines/income-tax';

const PERIODS = versions(IN_RULES, 'in.incometax');
const START = {
  period: 0, age: 'below60', salaried: 'yes', salary: '1500000', other: '',
  sec80C: '150000', sec80D: '25000', homeLoan: '', nps: '', others: '',
};
const EXAMPLES = [
  { label: '₹15 lakh salary with deductions', input: {} },
  { label: '₹12.75 lakh salary (no tax)', input: { salary: '1275000', sec80C: '', sec80D: '' } },
  { label: '₹13 lakh (marginal relief)', input: { salary: '1300000', sec80C: '', sec80D: '' } },
  { label: '₹30 lakh, big deductions', input: { salary: '3000000', sec80C: '150000', sec80D: '50000', homeLoan: '200000', nps: '50000', others: '300000' } },
];
const m = (v) => formatMoney(v, 'INR');
const range = (r) => `${m(r.from)} – ${r.to == null ? 'above' : m(r.to)}`;

function Comparison({ a }) {
  const rows = [
    ['Gross income', (x) => m(x.gross)],
    ['Standard deduction', (x) => m(x.std)],
    ['Other deductions', (x) => m(x.deductions)],
    ['Taxable income', (x) => m(x.taxable)],
    ['Tax on slabs', (x) => m(x.slab)],
    ['Rebate / marginal relief', (x) => m(x.rebate + x.marginal)],
    ['Surcharge', (x) => (x.surcharge ? `${m(x.surcharge)} (${x.surchargeRate}%)` : m(0))],
    ['Cess (4%)', (x) => m(x.cess)],
    ['Total tax', (x) => m(x.total)],
    ['Per month', (x) => m(x.monthly)],
    ['Share of income', (x) => formatPct(x.effective, 2)],
  ];
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-black/30 dark:border-neutral-600">
      <table className="w-full text-left text-sm border-collapse text-black dark:text-white">
        <thead>
          <tr className="bg-neutral-200 dark:bg-neutral-900 font-bold font-mono text-xs">
            <th className="p-2.5"> </th>
            <th className={`p-2.5 ${a.better === 'new' ? 'bg-[#FFE600]/40 dark:bg-amber-950/60' : ''}`}>New regime</th>
            <th className={`p-2.5 ${a.better === 'old' ? 'bg-[#FFE600]/40 dark:bg-amber-950/60' : ''}`}>Old regime</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, f]) => (
            <tr key={label} className={`border-t border-black/15 dark:border-neutral-700 ${label === 'Total tax' ? 'font-black' : ''}`}>
              <td className="p-2.5 font-semibold">{label}</td>
              <td className="p-2.5 font-mono whitespace-nowrap">{f(a.new)}</td>
              <td className="p-2.5 font-mono whitespace-nowrap">{f(a.old)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegimeWorking({ title, r }) {
  return (
    <StepsCard title={title}>
      <StepTable
        columns={[{ key: 'range', label: 'Income slab', bold: true }, { key: 'rate', label: 'Rate' }, { key: 'inSlab', label: 'Income in slab' }, { key: 'tax', label: 'Tax', highlight: true }]}
        rows={r.rows.map((x) => ({ range: range(x), rate: `${x.rate}%`, inSlab: m(x.inSlab), tax: m(x.tax) }))}
      />
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
        {r.lines.map((l, i) => <BlockMath key={i} math={l} />)}
      </div>
    </StepsCard>
  );
}

export default function IncomeTaxCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('income-tax', 11, answer, () => ({ better: answer?.better }));
  const rule = PERIODS[s.period];
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };

  const run = (input = s) => {
    try {
      setError('');
      setAnswer(solve({ ...input, rule: PERIODS[input.period] }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };
  const load = (ex) => { const next = { ...START, period: s.period, ...ex.input }; setS(next); run(next); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Income Tax Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-mono font-bold uppercase self-center text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" onClick={() => load(ex)} className="px-3 py-2 min-h-[40px] text-sm font-semibold border-2 border-black/40 dark:border-neutral-500 rounded-lg hover:bg-[#FFE600]/40 dark:hover:bg-neutral-800 text-black dark:text-white">
              {ex.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Rates for" value={String(s.period)} onChange={(v) => set({ period: Number(v) })} options={PERIODS.map((p, i) => ({ value: String(i), label: p.label }))} />
          <Select label="Age" value={s.age} onChange={(v) => set({ age: v })} options={[{ value: 'below60', label: 'Below 60' }, { value: 'senior', label: '60 to 79' }, { value: 'superSenior', label: '80 or more' }]} />
        </div>
        <Choice label="Is the income salary or pension?" value={s.salaried} onChange={(v) => set({ salaried: v })} options={[{ value: 'yes', label: 'Yes (standard deduction)' }, { value: 'no', label: 'No' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Salary or pension a year (₹)" value={s.salary} onChange={(v) => set({ salary: v })} onEnter={() => run()} />
          <Field label="Other income a year (₹)" value={s.other} placeholder="interest, rent, …" onChange={(v) => set({ other: v })} onEnter={() => run()} />
        </div>
        <fieldset className="p-3 border-2 border-dashed border-black/30 dark:border-neutral-600 rounded-xl space-y-3">
          <legend className="px-1 text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">Deductions (old regime only)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="80C: PF, ELSS, LIC… (up to 1.5L)" value={s.sec80C} onChange={(v) => set({ sec80C: v })} onEnter={() => run()} />
            <Field label="80D: health insurance" value={s.sec80D} onChange={(v) => set({ sec80D: v })} onEnter={() => run()} />
            <Field label="Home loan interest (up to 2L)" value={s.homeLoan} onChange={(v) => set({ homeLoan: v })} onEnter={() => run()} />
            <Field label="NPS 80CCD(1B) (up to 50k)" value={s.nps} onChange={(v) => set({ nps: v })} onEnter={() => run()} />
            <Field label="HRA exemption and others" value={s.others} onChange={(v) => set({ others: v })} onEnter={() => run()} />
          </div>
        </fieldset>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Compare Regimes
          </EditorialButton>
        </div>

        {answer && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="New regime tax" value={m(answer.new.total)} strong />
              <Stat label="Old regime tax" value={m(answer.old.total)} strong />
              <Stat label="Better for you" value={answer.better === 'same' ? 'Both the same' : `${answer.better === 'new' ? 'New' : 'Old'} regime, saves ${m(answer.saving)}`} />
            </div>
            <Comparison a={answer} />
          </div>
        )}
        <RatesBadge rule={rule} />
      </CalcCard>

      {answer && (
        <>
          <RegimeWorking title="Working: New Regime" r={answer.new} />
          <RegimeWorking title="Working: Old Regime" r={answer.old} />
          <StepsCard title="Notes"><Notes notes={answer.notes} /></StepsCard>
        </>
      )}
    </div>
  );
}
