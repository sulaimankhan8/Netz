'use client';
// The live truth table calculator. The maths is in src/app/utils/engines/truth-table.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/truth-table';

const EXAMPLES = [
  {
    label: "modus ponens",
    input: {
      f: "(p → q) ∧ p → q",
      g: ""
    }
  },
  {
    label: "p → q ≡ ¬p ∨ q ?",
    input: {
      f: "p → q",
      g: "¬p ∨ q"
    }
  },
  {
    label: "De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q",
    input: {
      f: "¬(p ∧ q)",
      g: "¬p ∨ ¬q"
    }
  },
  {
    label: "p ∧ ¬p",
    input: {
      f: "p ∧ ¬p",
      g: ""
    }
  },
  {
    label: "three letters",
    input: {
      f: "(p ∨ q) ∧ (¬p ∨ r) → (q ∨ r)",
      g: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="truth-table" unit={15} title="Truth Table Engine" button="Make the Table"
      start={{
  f: "(p → q) ∧ p → q",
  g: ""
}}
      fields={[
        { key: 'f', label: 'Formula', placeholder: 'e.g. (p → q) ∧ ¬q → ¬p', wide: true },
        { key: 'g', label: 'Compare with (optional, for equivalence)', placeholder: 'e.g. ¬p ∨ q', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Type ¬ ∧ ∨ → ↔ ⊕, or not, and, or, ->, <->, xor. Letters are variables."
      resultLabel={(a) => (a.equivalent === null ? a.verdict[0].toUpperCase() + a.verdict.slice(1) : a.equivalent ? 'Logically equivalent' : 'Not equivalent')}
      renderResult={(a) => (<div className="space-y-2 min-w-0"><div className="overflow-x-auto"><BlockMath math={a.gTex ? `${a.fTex} ${a.equivalent ? '\\equiv' : '\\not\\equiv'} ${a.gTex}` : a.fTex} /></div><StepTable columns={a.columns} rows={a.rows} /></div>)}
    />
  );
}
