'use client';
// Two parts that sit inside the original method-page design (the editorial cards of /bisection-method):
//   <SymbolKey rows={[{ s: 'a', t: 'what it means', e: 'a = 2' }]} />   inside the formula box, after the step cards
//   <CommonMistakes items={[{ m: 'the mistake', f: 'the fix' }]} />     after the worked example's conclusion
// s and e are LaTeX; t, m and f may be text or JSX.
import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/** A plain string with $…$ maths and **bold** (or JSX, passed through unchanged). */
export function Md({ children }) {
  if (typeof children !== 'string') return children ?? null;
  return children.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) return <InlineMath key={i} math={part.slice(1, -1)} />;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function SymbolKey({ rows }) {
  return (
    <div className="pt-4 border-t border-black/30 dark:border-neutral-700 space-y-3">
      <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
        WHAT EACH SYMBOL MEANS
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
        {rows.map((row) => (
          <div key={row.s} className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs space-y-1">
            <strong className="text-black dark:text-white block font-bold text-sm"><InlineMath math={row.s} /></strong>
            <span className="text-neutral-600 dark:text-neutral-400 block"><Md>{row.t}</Md></span>
            {row.e && <span className="text-neutral-500 block">Example: <InlineMath math={row.e} /></span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Collapsed until the student opens it (a plain <details>, so it works without JavaScript and the text stays in the
 * page for search engines). Tap or click the heading to open or close it.
 */
export function CommonMistakes({ items }) {
  return (
    <details className="group space-y-6">
      <summary className="flex justify-between items-center gap-3 pb-2 border-b-2 border-black/80 dark:border-neutral-700 cursor-pointer list-none min-h-[44px] [&::-webkit-details-marker]:hidden">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          Common Mistakes
        </h2>
        <span className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">
            LOSE NO MARKS
          </span>
          <span aria-hidden="true" className="font-mono text-2xl leading-none text-black dark:text-white transition-transform group-open:rotate-45">+</span>
        </span>
      </summary>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {items.map((row, i) => (
          <div key={i} className="border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
            <div className="text-xs font-mono font-bold uppercase text-red-600 dark:text-red-400">
              MISTAKE {String(i + 1).padStart(2, '0')}
            </div>
            <p className="text-sm font-semibold text-black dark:text-white"><Md>{row.m}</Md></p>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-mono text-emerald-950 dark:text-emerald-200">
              <strong className="block mb-1">FIX</strong>
              <Md>{row.f}</Md>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
