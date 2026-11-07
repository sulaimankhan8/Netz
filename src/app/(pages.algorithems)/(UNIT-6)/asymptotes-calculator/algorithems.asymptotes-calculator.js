'use client';
// The live asymptotes calculator. The maths is in src/app/utils/engines/asymptotes.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/asymptotes';

const EXAMPLES = [
  {
    label: "(x^2 + 1)/(x - 1)",
    input: {
      f: "(x^2 + 1)/(x - 1)"
    }
  },
  {
    label: "(2x + 1)/(x - 3)",
    input: {
      f: "(2x + 1)/(x - 3)"
    }
  },
  {
    label: "1/(x^2 - 4)",
    input: {
      f: "1/(x^2 - 4)"
    }
  },
  {
    label: "x/(x^2 + 1)",
    input: {
      f: "x/(x^2 + 1)"
    }
  },
  {
    label: "e^x",
    input: {
      f: "e^x"
    }
  },
  {
    label: "(x^3)/(x^2 - 1)",
    input: {
      f: "(x^3)/(x^2 - 1)"
    }
  },
  {
    label: "sqrt(x^2 + 1)",
    input: {
      f: "sqrt(x^2 + 1)"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="asymptotes" unit={6} title="Asymptote Engine" button="Find Asymptotes"
      start={{f:"(x^2 + 1)/(x - 1)"}}
      fields={[{ key: 'f', label: 'f(x)', placeholder: 'e.g. (2x + 1)/(x - 3)', wide: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Vertical asymptotes are searched for between −30 and 30."
      resultLabel="Asymptotes"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <p className="text-sm"><strong>Vertical:</strong> {a.vertical.length ? a.vertical.join(', ') : 'none'}</p>
          <p className="text-sm"><strong>Horizontal / oblique:</strong> {a.other.length ? a.other.map((o) => `${o.tex.replace(/\\frac{([^}]*)}{([^}]*)}/g, '$1/$2')} (${o.kind})`).join(', ') : 'none'}</p>
          {a.plot && <CoordPlot fn={a.plot.fn} fn2={a.plot.fn2} shade={a.plot.shade} lines={a.plot.lines || []} points={a.plot.points || []} view={a.plot.view} />}
        </div>
      )}
    />
  );
}
