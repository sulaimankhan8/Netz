'use client';
// A numbered list of worked steps from a symbolic engine: each step has a title, an optional formula
// (shown full size before the working), an optional plain sentence (text) and one or more LaTeX lines. Nested steps are indented by `depth`.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function StepList({ steps }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} style={{ marginLeft: `${Math.min(s.depth || 0, 4) * 12}px` }} className="border border-black/20 dark:border-neutral-700 rounded-xl overflow-hidden">
          <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-xs font-mono font-bold text-black dark:text-white border-b border-black/20 dark:border-neutral-700">
            <span>{i + 1}. {s.title}</span>
          </div>
          {/* One plain sentence: what this step does and why (engines add it as text) */}
          {s.text && <p className="px-3 pt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{s.text}</p>}
          {/* The formula first, full size, then the working with the numbers put in */}
          {s.formula && (
            <div className="mx-3 mt-2 px-2 rounded-lg bg-[#FAF8F5] dark:bg-neutral-900 border border-black/10 dark:border-neutral-700 overflow-x-auto text-center text-black dark:text-white">
              <span className="block pt-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 text-left">Formula</span>
              <BlockMath math={s.formula} />
            </div>
          )}
          <div className="px-2 overflow-x-auto text-center text-black dark:text-white">
            {s.lines.map((line, j) => <BlockMath key={j} math={line} />)}
          </div>
        </li>
      ))}
    </ol>
  );
}
