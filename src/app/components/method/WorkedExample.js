// The step-by-step worked example: heading, problem card, numbered step cards and the conclusion.

/** Section heading plus the example's cards. */
export function WorkedExample({ heading = 'Step-by-Step Worked Example', tag = 'HAND-HOLDING TUTORIAL', children }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b-2 border-black/80 dark:border-neutral-700">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {heading}
        </h2>
        {tag && (
          <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-lg border border-black/40 dark:border-neutral-600">
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Green card stating the example problem. */
export function ExampleProblem({ label = 'OUR PROBLEM TO SOLVE', children }) {
  return (
    <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-2">
      <div className="flex items-center gap-2">
        <span className="bg-emerald-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase">
          {label}
        </span>
      </div>
      <p className="text-sm md:text-base font-semibold text-emerald-950 dark:text-emerald-200">
        {children}
      </p>
    </div>
  );
}

// Full class names so Tailwind generates them
const SPACE = { 2: 'space-y-2', 3: 'space-y-3', 4: 'space-y-4' };

/** One numbered step card: "STEP 01 • TITLE". `space` is the gap between its parts (2, 3 or 4). */
export function ExampleStep({ n, title, space = 3, children }) {
  return (
    <div className={`border-2 border-black/80 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none ${SPACE[space] || SPACE[3]}`}>
      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-500">
        <span>{`STEP ${String(n).padStart(2, '0')}`}</span> • <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

/** Plain sentence inside a step card. */
export function StepText({ children }) {
  return <p className="text-sm text-neutral-700 dark:text-neutral-300">{children}</p>;
}

/** Grey panel for the working (usually BlockMath lines). */
export function MathPanel({ children }) {
  return (
    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center space-y-2">
      {children}
    </div>
  );
}

/** Grey panel for one iteration's working, with an amber label. */
export function IterationPanel({ label, children }) {
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-2 text-xs font-mono">
      <strong className="text-amber-600 dark:text-amber-400 block">{label}</strong>
      {children}
    </div>
  );
}

/** Dotted card with the final answer. `result` is the big line; children go in the panel and note below it. */
export function Conclusion({ label = 'FINAL CONCLUSION', result, math, children }) {
  return (
    <div className="border-2 border-black/80 dark:border-neutral-600 rounded-2xl p-6 relative overflow-hidden bg-[#FAF8F5] dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none">
      <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-40 editorial-dots-bg" />
      <div className="relative z-10 space-y-3">
        <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase">
          {label}
        </span>
        <h3 className="text-xl font-bold text-black dark:text-white">
          {result}
        </h3>
        {math && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 rounded-xl font-mono text-xs overflow-x-auto text-center">
            {math}
          </div>
        )}
        {children && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
            {children}
          </p>
        )}
      </div>
    </div>
  );
}
