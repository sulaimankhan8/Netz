'use client';
// The live recurrence relation calculator. The maths is in src/app/utils/engines/recurrence-relations.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/recurrence-relations';

const EXAMPLES = [
  {
    label: "aₙ = 5aₙ₋₁ − 6aₙ₋₂",
    input: {
      eq: "a(n) = 5a(n-1) - 6a(n-2)",
      ics: "a(0) = 1, a(1) = 0"
    }
  },
  {
    label: "Fibonacci",
    input: {
      eq: "a(n) = a(n-1) + a(n-2)",
      ics: "a(0) = 0, a(1) = 1"
    }
  },
  {
    label: "Repeated root: 6aₙ₋₁ − 9aₙ₋₂",
    input: {
      eq: "a(n) = 6a(n-1) - 9a(n-2)",
      ics: "a(0) = 1, a(1) = 6"
    }
  },
  {
    label: "aₙ = 3aₙ₋₁ + 2ⁿ",
    input: {
      eq: "a(n) = 3a(n-1) + 2^n",
      ics: "a(1) = 5"
    }
  },
  {
    label: "2ⁿ is a root: + 2ⁿ",
    input: {
      eq: "a(n) = 5a(n-1) - 6a(n-2) + 2^n",
      ics: "a(0) = 1, a(1) = 3"
    }
  },
  {
    label: "aₙ = 2aₙ₋₁ + n",
    input: {
      eq: "a(n) = 2a(n-1) + n",
      ics: "a(0) = 1"
    }
  },
  {
    label: "Complex roots: aₙ = −aₙ₋₂",
    input: {
      eq: "a(n) = -a(n-2)",
      ics: "a(0) = 1, a(1) = 2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="recurrence-relations" unit={15} title="Recurrence Relation Engine" button="Solve"
      start={{
  eq: "a(n) = 5a(n-1) - 6a(n-2)",
  ics: "a(0) = 1, a(1) = 0"
}}
      fields={[
        { key: 'eq', label: 'Recurrence', placeholder: 'a(n) = 5a(n-1) - 6a(n-2) + 2^n', wide: true },
        { key: 'ics', label: 'Starting values', placeholder: 'a(0) = 1, a(1) = 0', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Write a(n), a(n-1) … (or a_n, a_{n-1}). The right side may use n, 2^n, cos(n pi/2)."}
      resultLabel="aₙ"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`a_n = ${a.answer}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
