'use client';
// The live continuity calculator. The maths is in src/app/utils/engines/continuity.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/continuity';

const EXAMPLES = [
  {
    label: "x² | 2x − 1 at 1",
    input: {
      f: "x^2 for x < 1; 2x - 1 for x >= 1",
      a: "1"
    }
  },
  {
    label: "(x² − 1)/(x − 1) at 1",
    input: {
      f: "(x^2 - 1)/(x - 1)",
      a: "1"
    }
  },
  {
    label: "jump: x + 1 | x − 1 at 0",
    input: {
      f: "x + 1 for x < 0; x - 1 for x >= 0",
      a: "0"
    }
  },
  {
    label: "1/x at 0",
    input: {
      f: "1/x",
      a: "0"
    }
  },
  {
    label: "find k: kx + 1 | 3x² at 2",
    input: {
      f: "k x + 1 for x <= 2; 3x^2 for x > 2",
      a: "2"
    }
  },
  {
    label: "sin(x)/x | 1 at 0",
    input: {
      f: "sin(x)/x for x != 0; 1 for x = 0",
      a: "0"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="continuity" unit={6} title="Continuity Engine" button="Check"
      start={{f:"x^2 for x < 1; 2x - 1 for x >= 1",a:"1"}}
      fields={[
        { key: 'f', label: 'f(x), or pieces separated by ;', placeholder: 'x^2 for x < 1; 2x - 1 for x >= 1', wide: true },
        { key: 'a', label: 'At x =', placeholder: '1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Conditions: x < 1, x <= 1, x > 1, x >= 1, x = 0, x != 0. One unknown letter (like k) is solved for."
      resultLabel={(a) => (a.verdict === 'continuous' ? 'Continuous' : a.verdict[0].toUpperCase() + a.verdict.slice(1))}
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          {a.k && <div className="overflow-x-auto text-lg"><BlockMath math={a.k} /></div>}
          <div className="overflow-x-auto"><BlockMath math={`\\text{LHL} = ${a.left}, \\quad \\text{RHL} = ${a.right}, \\quad f(a) = ${a.value === 'undefined' ? '\\text{undefined}' : a.value}`} /></div>
        </div>
      )}
    />
  );
}
