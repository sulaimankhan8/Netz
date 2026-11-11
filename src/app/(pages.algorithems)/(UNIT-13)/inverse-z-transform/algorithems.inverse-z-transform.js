'use client';
// The live inverse Z-transform calculator. The maths is in src/app/utils/engines/inverse-z.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/inverse-z';

const EXAMPLES = [
  {
    label: "z/((z − 1)(z − 2))",
    input: {
      F: "z/((z - 1)(z - 2))",
      terms: "6"
    }
  },
  {
    label: "(2z² + 3z)/((z + 2)(z − 4))",
    input: {
      F: "(2z^2 + 3z)/((z + 2)(z - 4))",
      terms: "6"
    }
  },
  {
    label: "z/(z − 1)² (repeated)",
    input: {
      F: "z/(z - 1)^2",
      terms: "6"
    }
  },
  {
    label: "z/(z² + 1)",
    input: {
      F: "z/(z^2 + 1)",
      terms: "6"
    }
  },
  {
    label: "z/(z² − 2z + 2)",
    input: {
      F: "z/(z^2 - 2z + 2)",
      terms: "8"
    }
  },
  {
    label: "z³/((z − 1)(z − ½)²)",
    input: {
      F: "z^3/((z - 1)(z - 1/2)^2)",
      terms: "6"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="inverse-z" unit={13} title="Inverse Z-Transform Engine" button="Invert"
      start={{
  F: "z/((z - 1)(z - 2))",
  terms: "6"
}}
      fields={[
        { key: 'F', label: 'F(z)', placeholder: 'z/((z - 1)(z - 2))', wide: true },
        { key: 'terms', label: 'Terms by long division', placeholder: '6' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Partial fractions of F(z)/z. Long division gives the first values as a check."}
      resultLabel="x(n)"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`x(n) = ${a.xTex}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
