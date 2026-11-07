'use client';
// The live capital gains tax calculator. The maths is in src/app/utils/engines/capital-gains-india.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import RatesBadge from '@/app/components/method/RatesBadge';
import { solve } from '@/app/utils/engines/capital-gains-india';

const EXAMPLES = [
  {
    label: "shares held 19 months",
    input: {
      asset: "equity",
      buyDate: "2024-01-10",
      sellDate: "2025-08-20",
      buy: "500000",
      sell: "800000",
      expenses: "",
      slab: "",
      exemptionUsed: ""
    }
  },
  {
    label: "shares held 7 months",
    input: {
      asset: "equity",
      buyDate: "2025-01-10",
      sellDate: "2025-08-20",
      buy: "100000",
      sell: "150000",
      expenses: "",
      slab: ""
    }
  },
  {
    label: "flat bought 2010, sold 2025",
    input: {
      asset: "property",
      buyDate: "2010-06-01",
      sellDate: "2025-09-01",
      buy: "2000000",
      sell: "8000000",
      expenses: "100000",
      slab: ""
    }
  },
  {
    label: "gold held 1 year (slab 30%)",
    input: {
      asset: "gold",
      buyDate: "2024-09-01",
      sellDate: "2025-09-01",
      buy: "300000",
      sell: "360000",
      expenses: "",
      slab: "30"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="capital-gains-india" unit={11} title="Capital Gains Engine" button="Work Out the Tax"
      start={{
  asset: "equity",
  buyDate: "2024-01-10",
  sellDate: "2025-08-20",
  buy: "500000",
  sell: "800000",
  expenses: "",
  slab: "",
  exemptionUsed: ""
}}
      fields={[
        { key: 'asset', label: 'Asset', kind: 'select', options: [{ value: 'equity', label: "Listed shares / equity mutual funds" }, { value: 'property', label: "Land or building" }, { value: 'gold', label: "Gold, unlisted shares, other assets" }, { value: 'bonds', label: "Listed bonds / debentures" }, { value: 'debtmf', label: "Debt mutual funds (bought from Apr 2023)" }], wide: true },
        { key: 'buyDate', label: 'Bought on', kind: 'date' }, { key: 'sellDate', label: 'Sold on', kind: 'date' },
        { key: 'buy', label: 'Purchase cost (₹)' }, { key: 'sell', label: 'Sale price (₹)' },
        { key: 'expenses', label: 'Transfer expenses (₹, optional)' },
        { key: 'slab', label: 'Your slab rate % (if taxed at slab)', placeholder: 'e.g. 30' },
        { key: 'exemptionUsed', label: 'LTCG exemption already used this year (₹)', show: (v) => v.asset === 'equity' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The sale date decides which rules apply."
      resultLabel={(a) => (a.long ? 'Long-term capital gain' : 'Short-term capital gain')}
      renderResult={(a) => <p className="text-xl sm:text-2xl font-black font-mono break-words">{a.answer}</p>}
      renderSteps={(a) => (<div className="space-y-4">{a.rows && a.rows.length > 0 && <StepTable columns={a.columns} rows={a.rows} />}<RatesBadge rule={a.rule} /></div>)}
    />
  );
}
