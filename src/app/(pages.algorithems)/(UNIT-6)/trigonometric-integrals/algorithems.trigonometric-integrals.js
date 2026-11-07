'use client';
// The live trigonometric integral calculator. The maths is in src/app/utils/engines/trig-integrals.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/trig-integrals';

const EXAMPLES = [
  {
    label: "sin(x)^3",
    input: {
      f: "sin(x)^3",
      kind: "indefinite"
    }
  },
  {
    label: "cos(x)^4",
    input: {
      f: "cos(x)^4",
      kind: "indefinite"
    }
  },
  {
    label: "sin(x)^2*cos(x)^3",
    input: {
      f: "sin(x)^2*cos(x)^3",
      kind: "indefinite"
    }
  },
  {
    label: "sin(2x)^5",
    input: {
      f: "sin(2x)^5",
      kind: "indefinite"
    }
  },
  {
    label: "sec(x)^2",
    input: {
      f: "sec(x)^2",
      kind: "indefinite"
    }
  },
  {
    label: "sqrt(9 - x^2)",
    input: {
      f: "sqrt(9 - x^2)",
      kind: "indefinite"
    }
  },
  {
    label: "sqrt(x^2 + 4)",
    input: {
      f: "sqrt(x^2 + 4)",
      kind: "indefinite"
    }
  },
  {
    label: "1/sqrt(x^2 + 9)",
    input: {
      f: "1/sqrt(x^2 + 9)",
      kind: "indefinite"
    }
  },
  {
    label: "tan(x)^2",
    input: {
      f: "tan(x)^2",
      kind: "indefinite"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="trig-integrals" unit={6} title="Trig Integral Engine" button="Integrate"
      start={{f:"sin(x)^3",kind:"indefinite",a:"0",b:"pi/2"}}
      fields={[
        { key: 'kind', label: 'Integral', kind: 'choice', options: [{ value: 'indefinite', label: 'Indefinite' }, { value: 'definite', label: 'Definite' }] },
        { key: 'f', label: 'f(x)', placeholder: 'e.g. sin(x)^2 cos(x)^3', wide: true },
        { key: 'a', label: 'From', placeholder: '0', show: (v) => v.kind === 'definite' },
        { key: 'b', label: 'To', placeholder: 'pi/2', show: (v) => v.kind === 'definite' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Powers: sin(x)^3. Trig substitution forms: sqrt(a^2 - x^2), sqrt(x^2 + a^2), 1/sqrt(x^2 - a^2)."
      resultLabel="Integral"
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={a.kind === 'definite' ? `\\int_{${a.a.tex}}^{${a.b.tex}} ${a.f}\\,dx = ${a.valueTex}` : `\\int ${a.f}\\,dx = ${a.answer} + C`} /></div>}
    />
  );
}
