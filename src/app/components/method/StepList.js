'use client';
// A numbered list of worked steps from a symbolic engine: each step has a title, an optional formula
// (shown on the right of the title bar) and one or more LaTeX lines. Nested steps are indented by `depth`.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function StepList({ steps }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} style={{ marginLeft: `${Math.min(s.depth || 0, 4) * 12}px` }} className="border border-black/20 dark:border-neutral-700 rounded-xl overflow-hidden">
          <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-xs font-mono font-bold text-black dark:text-white border-b border-black/20 dark:border-neutral-700 flex flex-wrap gap-x-3 gap-y-1 justify-between">
            <span>{i + 1}. {s.title}</span>
            {s.formula && <span className="font-normal text-neutral-600 dark:text-neutral-400 overflow-x-auto max-w-full"><InlineMath math={s.formula} /></span>}
          </div>
          <div className="px-2 overflow-x-auto text-center text-black dark:text-white">
            {s.lines.map((line, j) => <BlockMath key={j} math={line} />)}
          </div>
        </li>
      ))}
    </ol>
  );
}
