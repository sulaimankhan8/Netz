'use client';
// The live modular arithmetic calculator. The maths is in src/app/utils/engines/modular-arithmetic.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/modular-arithmetic';

const EXAMPLES = [
  {
    label: "gcd(252, 198)",
    input: {
      mode: "gcd",
      a: "252",
      b: "198"
    }
  },
  {
    label: "240x + 46y = gcd",
    input: {
      mode: "bezout",
      a: "240",
      b: "46"
    }
  },
  {
    label: "7⁻¹ mod 26",
    input: {
      mode: "inverse",
      a: "7",
      m: "26"
    }
  },
  {
    label: "3²⁰⁰ mod 13",
    input: {
      mode: "power",
      a: "3",
      b: "200",
      m: "13"
    }
  },
  {
    label: "6x ≡ 4 (mod 10)",
    input: {
      mode: "congruence",
      a: "6",
      b: "4",
      m: "10"
    }
  },
  {
    label: "RSA p = 61, q = 53, e = 17",
    input: {
      mode: "rsa",
      p: "61",
      q: "53",
      e: "17",
      msg: "65"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="modular-arithmetic" unit={15} title="Number Theory Engine" button="Work It Out"
      start={{
  mode: "gcd",
  a: "252",
  b: "198",
  m: "17",
  p: "61",
  q: "53",
  e: "17",
  msg: "65"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'select', options: [['gcd', 'gcd (Euclid)'], ['bezout', 'Bézout: gcd = ax + by'], ['inverse', 'Inverse mod m'], ['power', 'aᵇ mod m'], ['congruence', 'Solve ax ≡ b (mod m)'], ['rsa', 'Toy RSA']].map(([value, label]) => ({ value, label })) },
        { key: 'a', label: 'a', show: (v) => v.mode !== 'rsa' }, { key: 'b', label: 'b (or the exponent)', show: (v) => ['gcd', 'bezout', 'power', 'congruence'].includes(v.mode) },
        { key: 'm', label: 'Modulus m', show: (v) => ['inverse', 'power', 'congruence'].includes(v.mode) },
        { key: 'p', label: 'Prime p', show: (v) => v.mode === 'rsa' }, { key: 'q', label: 'Prime q', show: (v) => v.mode === 'rsa' },
        { key: 'e', label: 'Public exponent e', show: (v) => v.mode === 'rsa' }, { key: 'msg', label: 'Message (a number < n)', show: (v) => v.mode === 'rsa' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Whole numbers only; very large powers are handled exactly."
      resultLabel="Result"
      renderResult={(a) => (<div className="space-y-2 min-w-0"><div className="overflow-x-auto text-lg"><BlockMath math={a.answer} /></div>{a.rows.length > 0 && <StepTable columns={a.columns} rows={a.rows} />}</div>)}
    />
  );
}
