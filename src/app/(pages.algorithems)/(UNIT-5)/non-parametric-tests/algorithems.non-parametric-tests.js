'use client';
// The live non-parametric test calculator. The maths is in src/app/utils/engines/non-parametric-tests.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/non-parametric-tests';

const EXAMPLES = [
  {
    label: "Sign test, median 12",
    input: {
      test: "sign",
      x: "12 15 9 18 20 11 14 16 13 17",
      y: "",
      m0: "12",
      alpha: "0.05"
    }
  },
  {
    label: "Paired sign test",
    input: {
      test: "sign",
      x: "10 12 8 15 9",
      y: "8 11 9 12 7",
      m0: "0",
      alpha: "0.05"
    }
  },
  {
    label: "Mann–Whitney U",
    input: {
      test: "mann",
      x: "14 9 18 12 15 11",
      y: "20 17 22 16 19 21 13",
      m0: "0",
      alpha: "0.05"
    }
  },
  {
    label: "U with ties",
    input: {
      test: "mann",
      x: "3 4 4 5 6 7",
      y: "5 6 6 8 9 9 10",
      m0: "0",
      alpha: "0.05"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="non-parametric-tests" unit={5} title="Non-Parametric Test Engine" button="Test"
      start={{
  test: "sign",
  x: "12 15 9 18 20 11 14 16 13 17",
  y: "",
  m0: "12",
  alpha: "0.05"
}}
      fields={[
        { key: 'test', label: 'Test', kind: 'choice', options: [{ value: 'sign', label: "Sign test" }, { value: 'mann', label: "Mann–Whitney U" }] },
        { key: 'x', label: 'Sample 1', placeholder: '12 15 9 18 20', wide: true },
        { key: 'y', label: 'Sample 2 (sign test: optional, for paired data)', placeholder: '', wide: true },
        { key: 'm0', label: 'Median m₀', placeholder: '12', show: (v) => v.test === 'sign' },
        { key: 'alpha', label: 'Level α', placeholder: '0.05' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Numbers separated by spaces or commas."}
      resultLabel={(a) => (a.test === 'sign' ? 'Sign test' : 'Mann–Whitney U')}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`${a.test === 'sign' ? 'S' : 'U'} = ${a.statistic}, \\quad P = ${a.p} \\Rightarrow ${a.reject ? '\\text{reject } H_0' : '\\text{do not reject } H_0'}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
