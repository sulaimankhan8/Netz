'use client';
// The live floating point calculator. The maths is in src/app/utils/engines/floating-point-representation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/floating-point-representation';

const EXAMPLES = [
  {
    label: "0.1 (single)",
    input: {
      x: "0.1",
      format: "single"
    }
  },
  {
    label: "−13.625 (exact)",
    input: {
      x: "-13.625",
      format: "single"
    }
  },
  {
    label: "0.1 (double)",
    input: {
      x: "0.1",
      format: "double"
    }
  },
  {
    label: "1/3",
    input: {
      x: "0.3333333333333333",
      format: "single"
    }
  },
  {
    label: "Subnormal 1e−40",
    input: {
      x: "1e-40",
      format: "single"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="floating-point-representation" unit={1} title="IEEE-754 Engine" button="Convert"
      start={{
  x: "0.1",
  format: "single"
}}
      fields={[
        { key: 'x', label: 'Number', placeholder: '0.1' },
        { key: 'format', label: 'Format', kind: 'choice', options: [{ value: 'single', label: "Single (32-bit)" }, { value: 'double', label: "Double (64-bit)" }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Type a decimal number."}
      resultLabel="IEEE-754 bits"
      renderResult={(a) => (<div className="space-y-2 min-w-0"><p className="font-mono text-sm break-all"><span className="text-red-600 dark:text-red-400">{a.sign}</span> <span className="text-blue-700 dark:text-blue-300">{a.exponent}</span> <span>{a.fraction}</span></p><p className="font-mono text-sm">Hex {a.hex}; stored {a.stored}</p></div>)}
    />
  );
}
