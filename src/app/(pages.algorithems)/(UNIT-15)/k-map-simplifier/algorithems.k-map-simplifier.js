'use client';
// The live K-map calculator. The maths is in src/app/utils/engines/k-map-simplifier.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import KMap from '@/app/components/method/KMap';
import { solve } from '@/app/utils/engines/k-map-simplifier';

const EXAMPLES = [
  {
    label: "Σm(0, 2, 5, 7, 8, 10, 13, 15)",
    input: {
      mode: "minterms",
      vars: "4",
      m: "0, 2, 5, 7, 8, 10, 13, 15",
      d: ""
    }
  },
  {
    label: "With don't-cares",
    input: {
      mode: "minterms",
      vars: "4",
      m: "4, 8, 10, 11, 12, 15",
      d: "9, 14"
    }
  },
  {
    label: "Σm(1, 3, 7, 11, 15) + d(0, 2, 5)",
    input: {
      mode: "minterms",
      vars: "4",
      m: "1, 3, 7, 11, 15",
      d: "0, 2, 5"
    }
  },
  {
    label: "3 variables: Σm(0, 1, 2, 4, 5, 6)",
    input: {
      mode: "minterms",
      vars: "3",
      m: "0, 1, 2, 4, 5, 6",
      d: ""
    }
  },
  {
    label: "Consensus: AB + A'C + BC",
    input: {
      mode: "expression",
      vars: "3",
      expr: "AB + A'C + BC",
      d: ""
    }
  },
  {
    label: "XOR: A ^ B",
    input: {
      mode: "expression",
      vars: "2",
      expr: "A ^ B",
      d: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="k-map-simplifier" unit={15} title="K-Map Engine" button="Simplify"
      start={{
  mode: "minterms",
  vars: "4",
  m: "0, 2, 5, 7, 8, 10, 13, 15",
  d: "",
  expr: ""
}}
      fields={[
        { key: 'mode', label: 'Give', kind: 'choice', options: [{ value: 'minterms', label: "Minterms Σm" }, { value: 'expression', label: "An expression" }] },
        { key: 'vars', label: 'Variables', kind: 'choice', options: [{ value: '2', label: "2 (A, B)" }, { value: '3', label: "3 (A, B, C)" }, { value: '4', label: "4 (A, B, C, D)" }] },
        { key: 'm', label: 'Minterms', placeholder: '0, 2, 5, 7, 8, 10, 13, 15', wide: true, show: (v) => v.mode === 'minterms' },
        { key: 'expr', label: "Expression (' = NOT, + = OR)", placeholder: "AB + A'C + BC", wide: true, show: (v) => v.mode === 'expression' },
        { key: 'd', label: "Don't-cares (optional)", placeholder: '9, 14', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"A is the most significant bit: minterm 5 in 4 variables is A′BC′D."}
      resultLabel="Minimal form"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`\\text{SOP: } f = ${a.sopTex}`} /></div><div className="overflow-x-auto"><BlockMath math={`\\text{POS: } f = ${a.posTex}`} /></div></div>)}
      renderSteps={(a) => <KMap map={a.map} groups={a.groups} />}
    />
  );
}
