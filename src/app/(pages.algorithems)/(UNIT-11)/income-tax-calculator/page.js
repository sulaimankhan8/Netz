'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import IncomeTaxCalculator from './algorithems.income-tax-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit11';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Which regime should I choose?', a: <>Work out both. The new regime has lower rates but almost no deductions; the old regime has higher rates but lets you subtract 80C, 80D, home loan interest and HRA. With large deductions the old regime can win; otherwise the new one usually does.</> },
  { q: 'Why is there no tax up to ₹12 lakh in the new regime?', a: <>The slabs do charge tax, but the section 87A rebate cancels up to ₹60,000 of it when taxable income is ₹12 lakh or less. With the ₹75,000 standard deduction, a salary of ₹12.75 lakh pays nothing.</> },
  { q: 'What is marginal relief?', a: <>Just above a limit, the extra tax can&apos;t be more than the extra income. At ₹12.25 lakh taxable, the slab tax is ₹63,750, but it is cut to ₹25,000, the amount above ₹12 lakh. The same rule applies where a surcharge starts.</> },
  { q: 'What does this calculator leave out?', a: <>Capital gains and other income taxed at special rates, agricultural income, and non-residents. Use it to learn the method and compare regimes, then check the final figure on the income tax portal.</> },
];

export default function IncomeTaxPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="Income Tax Calculator" subtitle="India: New vs Old Regime, Slab by Slab">
        Work out <strong>income tax</strong> under both regimes: taxable income, tax slab by slab, the 87A <strong>rebate</strong>, surcharge and 4% <strong>cess</strong>. See which regime costs less, and by how much.
      </MethodHeader>
      <FormulaBox label="THE STEPS" tag="INDIA">
        <Formula math={'\\text{Tax} = \\Big(\\text{slab tax} - \\text{rebate}\\Big)\\Big(1 + \\text{surcharge}\\Big) \\times 1.04'} />
        <FormulaSteps steps={[
          { title: '1. Taxable income', text: <>Gross − standard deduction (− deductions in the old regime).</> },
          { title: '2. Slabs', text: <>Each part of the income at its own rate.</> },
          { title: '3. Rebate, surcharge, cess', text: <>87A rebate, surcharge on high incomes, then 4% cess.</> },
        ]} />
        <SymbolKey rows={EX['income-tax-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['income-tax-calculator'].example} />
      <CommonMistakes items={EX['income-tax-calculator'].mistakes} />
      <Lab heading="Interactive Income Tax Calculator"><IncomeTaxCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['ppf', 'gst', 'percentage']} />
    </MethodPage>
  );
}
