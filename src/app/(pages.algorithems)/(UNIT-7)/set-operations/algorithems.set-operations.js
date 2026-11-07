'use client';
// The live sets and relations calculator. The maths is in src/app/utils/engines/set-operations.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import VennDiagram from '@/app/components/method/VennDiagram';
import { solve } from '@/app/utils/engines/set-operations';

const EXAMPLES = [
  {
    label: "A = evens, B = 1…5",
    input: {
      mode: "sets",
      U: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
      A: "2, 4, 6, 8, 10",
      B: "1, 2, 3, 4, 5",
      C: ""
    }
  },
  {
    label: "three sets",
    input: {
      mode: "sets",
      U: "1, 2, 3, 4, 5, 6, 7, 8",
      A: "1, 2, 3, 4",
      B: "3, 4, 5, 6",
      C: "2, 4, 6, 8"
    }
  },
  {
    label: "(A ∪ B)' ∩ C",
    input: {
      mode: "expression",
      U: "1, 2, 3, 4, 5, 6, 7, 8",
      A: "1, 2, 3, 4",
      B: "3, 4, 5, 6",
      C: "2, 4, 6, 8",
      expression: "(A ∪ B)' ∩ C"
    }
  },
  {
    label: "A △ B",
    input: {
      mode: "expression",
      U: "",
      A: "a, b, c, d",
      B: "c, d, e",
      C: "",
      expression: "A △ B"
    }
  },
  {
    label: "equivalence relation",
    input: {
      mode: "relation",
      A: "1, 2, 3",
      relation: "(1,1), (2,2), (3,3), (1,2), (2,1)"
    }
  },
  {
    label: "partial order (≤)",
    input: {
      mode: "relation",
      A: "1, 2, 3",
      relation: "(1,1), (2,2), (3,3), (1,2), (2,3), (1,3)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="set-operations" unit={7} title="Sets Engine" button="Work Out"
      start={{
  mode: "sets",
  U: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
  A: "2, 4, 6, 8, 10",
  B: "1, 2, 3, 4, 5",
  C: "",
  expression: "(A ∪ B)' ∩ C",
  relation: "(1,1), (2,2), (3,3), (1,2), (2,1)"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'sets', label: "Set operations" }, { value: 'expression', label: "A set formula" }, { value: 'relation', label: "Relation on A" }] },
        { key: 'U', label: 'Universal set U (optional)', placeholder: '1, 2, …, 10', wide: true, show: (v) => v.mode !== 'relation' },
        { key: 'A', label: 'A', placeholder: '2, 4, 6', wide: true }, { key: 'B', label: 'B', placeholder: '1, 2, 3', wide: true, show: (v) => v.mode !== 'relation' },
        { key: 'C', label: 'C (optional)', wide: true, show: (v) => v.mode !== 'relation' },
        { key: 'expression', label: "Formula (∪ or |, ∩ or &, −, △, ' for complement)", placeholder: "(A ∪ B)' ∩ C", wide: true, show: (v) => v.mode === 'expression' },
        { key: 'relation', label: 'Pairs of R', placeholder: '(1,1), (1,2), (2,1)', wide: true, show: (v) => v.mode === 'relation' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Separate elements with commas."
      resultLabel={(a) => (a.properties ? 'Properties of R' : a.answerTex ? 'Answer' : 'Set operations')}
      renderResult={(a) => (<div className="space-y-1 min-w-0">{a.ops && a.ops.map((o) => <div key={o.name} className="overflow-x-auto"><BlockMath math={`${o.name} = ${o.tex}`} /></div>)}{a.answerTex && <div className="overflow-x-auto"><BlockMath math={a.answerTex} /></div>}{a.properties && <p className="font-mono text-sm">{Object.entries(a.properties).map(([k, v]) => `${v ? '✓' : '✗'} ${k}`).join(' · ')}{a.kinds.length ? ` — ${a.kinds.join(', ')}` : ''}</p>}</div>)}
      renderSteps={(a) => a.regions && <VennDiagram regions={a.regions} shade={a.shade || null} names={a.names} hasU={a.hasU} />}
    />
  );
}
