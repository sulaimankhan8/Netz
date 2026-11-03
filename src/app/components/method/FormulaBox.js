// The dotted "How it works" card near the top of each method page.
import { BlockMath } from 'react-katex';

/** Card with a label on the left, a black tag on the right, and any content below. */
export function FormulaBox({ label, tag, children }) {
  return (
    <div className="border-2 border-black/80 dark:border-neutral-600 bg-[#FAF8F5] dark:bg-neutral-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
      <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-center border-b border-black/30 dark:border-neutral-700 pb-3">
          <span className="font-mono font-extrabold text-xs uppercase tracking-widest text-black dark:text-white">
            {label}
          </span>
          {tag && (
            <span className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
              {tag}
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

/** The main formula, centred and scrollable on narrow screens. */
export function Formula({ math }) {
  return (
    <div className="py-4 text-center overflow-x-auto">
      <BlockMath math={math} />
    </div>
  );
}

// Full class names so Tailwind generates them
const COLS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' };

/** Numbered tiles under the formula: [{ title, text }]. */
export function FormulaSteps({ steps }) {
  return (
    <div className={`grid grid-cols-1 ${COLS[steps.length] || COLS[3]} gap-3 pt-2 text-xs font-mono`}>
      {steps.map((s, i) => (
        <div key={i} className="p-3 border border-black/40 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 shadow-xs">
          <strong className="text-black dark:text-white block font-bold">{s.title}</strong>
          <span className="text-neutral-600 dark:text-neutral-400">
            {s.text}
          </span>
        </div>
      ))}
    </div>
  );
}
