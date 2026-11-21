'use client';
// The working for the difference-table interpolation calculators (Newton forward/backward, Gauss forward/backward),
// laid out the way it is written by hand: the step parameter, the formula (broken over lines), then one line per term
// with its numbers put in, then the sum. Each calculator builds the same arrays:
//   vSteps:      ['h = …', 'v = \frac{x - x_0}{h}', 'v = \frac{(2.5 - 1)}{1}', 'v = 1.5', …notes]
//   formulas:    ['P(x) = y_0', '\frac{v}{1!}\Delta y_0', …]
//   substituted: ['P(2.5) = 2', '\frac{(1.5) \times 3}{1!}', …]
//   calculated:  ['P(2.5) = 2', '(4.5000)', …]
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const stripLead = (s) => String(s).replace(/^\s*[A-Za-z]\([^)]*\)\s*=\s*/, '').trim();
const stripVar = (s) => String(s).replace(/^\s*[a-z]\s*=\s*/, '').trim();
const stripParens = (s) => String(s).trim().replace(/^\((.*)\)$/, '$1');
// Break a long sum over several lines (every `per` terms)
const broken = (lead, parts, per = 3) => {
  const rows = [];
  for (let i = 0; i < parts.length; i += per) rows.push(parts.slice(i, i + per).join(' + '));
  return `\\begin{aligned} ${lead} &= ${rows.join(' \\\\ &\\quad + ')} \\end{aligned}`;
};

function Box({ label, children }) {
  return (
    <div className="p-4 md:p-5 border-2 border-black/30 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2 text-black dark:text-white">
      <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="overflow-x-auto text-center">{children}</div>
    </div>
  );
}

export default function TermWorking({ vSteps = [], formulas = [], substituted = [], calculated = [], varName = 'v' }) {
  if (!formulas.length) return null;
  const [hLine, vDef, vSub, vVal, ...notes] = vSteps;
  const values = calculated.map((c, i) => (i === 0 ? stripLead(c) : stripParens(c)));
  const total = values.reduce((s, v) => s + (Number(v) || 0), 0);
  const point = (String(substituted[0]).match(/\(([^)]*)\)/) || [])[1] || 'x';
  return (
    <div className="space-y-3">
      {vSteps.length > 0 && (
        <Box label={`1. The step ${varName}`}>
          {hLine && <BlockMath math={hLine} />}
          {vDef && <BlockMath math={[vDef, vSub && stripVar(vSub), vVal && stripVar(vVal)].filter(Boolean).join(' = ')} />}
          {notes.map((n, i) => <BlockMath key={i} math={n} />)}
        </Box>
      )}
      <Box label="2. The formula">
        <BlockMath math={broken('P(x)', [stripLead(formulas[0]), ...formulas.slice(1)], 2)} />
      </Box>
      <Box label="3. Each term with the numbers put in">
        {formulas.map((f, i) => (
          <BlockMath
            key={i}
            math={i === 0
              ? `${stripLead(f)} = ${values[0]}`
              : `${f} = ${substituted[i]} = ${values[i]}`}
          />
        ))}
      </Box>
      <Box label="4. Add the terms">
        <BlockMath math={broken(`P(${point})`, values.map((v) => (Number(v) < 0 ? `(${v})` : v)), 4)} />
        <BlockMath math={`P(${point}) = ${Number(total.toFixed(6))}`} />
        <p className="text-sm text-neutral-700 dark:text-neutral-300 text-left">
          Each term adds a smaller correction; when a difference column is 0, the remaining terms are 0 and the answer is exact for that data. <InlineMath math={`P(${point}) \\approx ${Number(total.toFixed(6))}`} />.
        </p>
      </Box>
    </div>
  );
}
