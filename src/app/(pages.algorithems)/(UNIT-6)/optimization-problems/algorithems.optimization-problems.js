'use client';
// The live optimisation calculator. The maths is in src/app/utils/engines/optimization.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve, TEMPLATES } from '@/app/utils/engines/optimization';

// One set of fields per problem, keyed problem_field so the defaults don't clash
const NAMES = Object.keys(TEMPLATES);
const FIELDS = [
  { key: 'template', label: 'Problem', kind: 'select', options: NAMES.map((n) => ({ value: n, label: TEMPLATES[n].title })) },
  ...NAMES.flatMap((n) => TEMPLATES[n].fields.map(([k, label]) => ({ key: `${n}_${k}`, label, show: (v) => v.template === n }))),
];
const START = { template: 'box', ...Object.fromEntries(NAMES.flatMap((n) => TEMPLATES[n].fields.map(([k, , d]) => [`${n}_${k}`, d]))) };
const EXAMPLES = NAMES.map((n) => ({ label: TEMPLATES[n].title, input: { template: n } }));
const run = (v) => solve({ template: v.template, ...Object.fromEntries(TEMPLATES[v.template].fields.map(([k]) => [k, v[`${v.template}_${k}`]])) });

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="optimization" unit={6} title="Optimisation Engine" button="Solve"
      start={START} fields={FIELDS} examples={EXAMPLES} solve={run}
      hint="Pick a problem and change the numbers."
      resultLabel={(a) => a.title}
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={a.answer} /></div>}
    />
  );
}
