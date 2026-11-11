'use client';
// The live separation of variables calculator. The maths is in src/app/utils/engines/separation-of-variables.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/separation-of-variables';

const EXAMPLES = [
  {
    label: "Heat: x(π − x), L = π",
    input: {
      kind: "heat",
      f: "x(pi - x)",
      g: "",
      L: "pi",
      c: "1",
      b: "1"
    }
  },
  {
    label: "Heat: 100°, L = 1",
    input: {
      kind: "heat",
      f: "100",
      g: "",
      L: "1",
      c: "1",
      b: "1"
    }
  },
  {
    label: "Heat: sin x + 3 sin 2x",
    input: {
      kind: "heat",
      f: "sin(x) + 3 sin(2x)",
      g: "",
      L: "pi",
      c: "1",
      b: "1"
    }
  },
  {
    label: "Plucked string",
    input: {
      kind: "wave",
      f: "x for 0 < x < 1; 2 - x for 1 < x < 2",
      g: "",
      L: "2",
      c: "1",
      b: "1"
    }
  },
  {
    label: "String struck: g = sin πx",
    input: {
      kind: "wave",
      f: "0",
      g: "sin(pi x)",
      L: "1",
      c: "2",
      b: "1"
    }
  },
  {
    label: "Laplace: x(1 − x) on top",
    input: {
      kind: "laplace",
      f: "x(1 - x)",
      g: "",
      L: "1",
      c: "1",
      b: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="separation-of-variables" unit={12} title="Separation of Variables Engine" button="Solve"
      start={{
  kind: "heat",
  f: "x(pi - x)",
  g: "",
  L: "pi",
  c: "1",
  b: "1"
}}
      fields={[
        { key: 'kind', label: 'Equation', kind: 'choice', options: [{ value: 'heat', label: "Heat u_t = c²u_xx" }, { value: 'wave', label: "Wave u_tt = c²u_xx" }, { value: 'laplace', label: "Laplace u_xx + u_yy = 0" }] },
        { key: 'f', label: 'f(x): starting u (heat, wave) or u on the top edge (Laplace)', placeholder: 'x(pi - x)', wide: true },
        { key: 'g', label: 'g(x) = u_t(x, 0) (optional)', placeholder: 'sin(pi x)', wide: true, show: (v) => v.kind === 'wave' },
        { key: 'L', label: 'Length L (width a)', placeholder: 'pi' },
        { key: 'c', label: 'c', placeholder: '1', show: (v) => v.kind !== 'laplace' },
        { key: 'b', label: 'Height b', placeholder: '1', show: (v) => v.kind === 'laplace' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Ends held at u = 0. Pieces like \"x for 0 < x < 1; 2 - x for 1 < x < 2\"."}
      resultLabel={(a) => ({ heat: 'Temperature u(x, t)', wave: 'Displacement u(x, t)', laplace: 'Potential u(x, y)' }[a.kind])}
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={a.series} /></div><div className="overflow-x-auto"><BlockMath math={`b_n = ${a.coef}`} /></div></div>)}
    />
  );
}
