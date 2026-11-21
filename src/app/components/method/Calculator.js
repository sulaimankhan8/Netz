'use client';
// Cards for the live calculators, with the classes the Unit 4 calculators use (e.g. algorithems.gauss-elimination.js).
import { useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiList, FiPlay, FiSquare, FiBookOpen } from 'react-icons/fi';
import { useGuide, setGuide, runDemo } from './calcDemo';
import { rich } from './calcGuide';

const headerButton = 'inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg border-2 text-xs font-mono font-bold uppercase transition-colors';

/** Guide on: the help text shows. One switch for every calculator, remembered in this browser. */
function GuideSwitch() {
  const on = useGuide();
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setGuide(!on)}
      title={on ? 'Hide the help text' : 'Show how to use this calculator'}
      className={`${headerButton} ${on
        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
        : 'bg-white text-black border-black/40 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-800'}`}
    >
      <FiBookOpen className="w-3.5 h-3.5" /> Guide
    </button>
  );
}

/** Types the page's example in, one box at a time, then solves (calcDemo.js). Press again to stop. */
function DemoButton({ cardRef }) {
  const [running, setRunning] = useState(false);
  const stateRef = useRef(null);
  useEffect(() => () => { if (stateRef.current) stateRef.current.stopped = true; }, []);
  const click = async () => {
    if (stateRef.current) { stateRef.current.stopped = true; return; }
    const state = { stopped: false };
    stateRef.current = state;
    setRunning(true);
    try { await runDemo(cardRef.current, state); } finally { stateRef.current = null; setRunning(false); }
  };
  return (
    <button
      type="button"
      data-demo=""
      onClick={click}
      title={running ? 'Stop the demo' : 'Watch the example being typed in and solved'}
      className={`${headerButton} ${running
        ? 'bg-[#FFE600] text-black border-black'
        : 'bg-[#FFE600] text-black border-black hover:brightness-95'}`}
    >
      {running ? <><FiSquare className="w-3.5 h-3.5" /> Stop</> : <><FiPlay className="w-3.5 h-3.5" /> Demo</>}
    </button>
  );
}

/** The white lab card: small kicker, title, Guide / Demo / the page's buttons on the right, then the inputs. */
export function CalcCard({ kicker = 'LABORATORY', title, actions, children }) {
  const cardRef = useRef(null);
  return (
    <div ref={cardRef} data-calc-card="" className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
        <div>
          <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">{kicker}</span>
          <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <GuideSwitch />
          <DemoButton cardRef={cardRef} />
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}

/** Red message for input the engine can't use. */
export function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center gap-3">
      <FiAlertCircle className="w-5 h-5 shrink-0" /><span>{children}</span>
    </div>
  );
}

/** Green answer box. */
export function ResultBox({ label, actions, children }) {
  return (
    <div data-result="" className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono font-bold uppercase block text-emerald-700 dark:text-emerald-400">{label}</span>
        {actions}
      </div>
      <div className="text-black dark:text-white">{children}</div>
    </div>
  );
}

/** The card that holds the working under the calculator. */
export function StepsCard({ id, title, children }) {
  return (
    <div id={id} className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-4">
      <h4 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
        <FiList className="w-5 h-5 text-neutral-500" /> {title}
      </h4>
      {children}
    </div>
  );
}

/** Plain notes from the engine, one per line. */
export function Notes({ notes }) {
  if (!notes?.length) return null;
  return (
    <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
      {notes.map((n, i) => <li key={i}>{n}</li>)}
    </ul>
  );
}

/**
 * "How to use this calculator": a few numbered steps in plain words, at the top of the card, so someone who has
 * never seen the method knows what to type where. steps: [string | JSX]
 */
export function HowToUse({ steps }) {
  const guide = useGuide();
  const boxRef = useRef(null);
  // "{button}" in a step becomes this card's own Solve button text, e.g. **Find the Jacobian**
  const [button, setButton] = useState('the solve button');
  useEffect(() => {
    const text = boxRef.current?.closest('[data-calc-card]')?.querySelector('[data-solve]')?.textContent?.trim();
    if (text) setButton(text);
  }, [guide, steps]);
  if (!guide || !steps?.length) return null;
  return (
    <div ref={boxRef} data-how-to-use="" className="p-4 rounded-xl border-2 border-dashed border-black/40 dark:border-neutral-600 bg-[#FFE600]/10 dark:bg-neutral-800/60 space-y-2">
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white block">How to use this calculator</span>
      <ol className="space-y-1.5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
            <span aria-hidden="true" className="shrink-0 w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
            <span className="min-w-0 [&_code]:whitespace-nowrap">{rich(typeof s === 'string' ? s.replaceAll('{button}', `**${button}**`) : s)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// What the formula boxes accept (src/app/utils/symbolic/tree.js parse): keep this list in step with the parser
const TYPING = [
  ['x²,  x³', 'x^2,  x^3'],
  ['3x  (3 times x)', '3x  or  3*x'],
  ['a fraction  (x + 1) / (x − 1)', '(x+1)/(x-1)'],
  ['√x', 'sqrt(x)'],
  ['eˣ,  e²ˣ', 'e^x,  e^(2x)'],
  ['sin x,  cos 2x', 'sin(x),  cos(2x)'],
  ['ln x  (natural log)', 'ln(x)'],
  ['π', 'pi'],
  ['θ', 'θ  or  theta'],
  ['|x|', 'abs(x)'],
];

/** Fold-out table: how to type powers, roots, fractions and functions. For pages whose boxes take formulas. */
export function TypingGuide() {
  const guide = useGuide();
  if (!guide) return null;
  return (
    <details data-typing-guide="" className="group rounded-xl border-2 border-black/20 dark:border-neutral-700">
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 min-h-[44px] text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white [&::-webkit-details-marker]:hidden">
        <span>How to type maths</span>
        <span aria-hidden="true" className="font-mono text-lg leading-none transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-4 pb-4 space-y-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono uppercase text-neutral-500">
              <th className="py-1 pr-4 font-bold">To write</th>
              <th className="py-1 font-bold">Type</th>
            </tr>
          </thead>
          <tbody>
            {TYPING.map(([want, type]) => (
              <tr key={type} className="border-t border-black/10 dark:border-neutral-800">
                <td className="py-1.5 pr-4 text-neutral-800 dark:text-neutral-200">{want}</td>
                <td className="py-1.5 font-mono font-bold text-black dark:text-white whitespace-nowrap">{type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">Functions always need brackets: sin(x), not sin x. Spaces don&apos;t matter.</p>
      </div>
    </details>
  );
}

/** The plain-words line under a box: what the value is and how to type it. Shows only in guide mode. */
export function GuideNote({ children }) {
  const guide = useGuide();
  if (!guide || !children) return null;
  return <span className="block text-sm leading-snug font-normal text-neutral-600 dark:text-neutral-400 [&_code]:whitespace-nowrap">{rich(children)}</span>;
}

const fieldClass ='w-full min-h-[44px] px-3 text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';
const selectClass = 'w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-base font-bold text-black dark:text-white focus:outline-none';

/** A labelled text box for numbers (16px text, so phones don't zoom). Enter runs onEnter. */
export function Field({ label, value, onChange, onEnter, placeholder = '', inputMode = 'decimal', type = 'text', help = null }) {
  return (
    <label className="space-y-1 min-w-0 block">
      <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete="off"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        className={fieldClass}
      />
      <GuideNote>{help}</GuideNote>
    </label>
  );
}

/** A labelled drop-down. options: [{ value, label }] */
export function Select({ label, value, onChange, options, help = null }) {
  return (
    <label className="space-y-1 min-w-0 block">
      <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <GuideNote>{help}</GuideNote>
    </label>
  );
}

/** Two or three choices as buttons (method pickers). options: [{ value, label }] */
export function Choice({ label, value, onChange, options, help = null }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-mono font-bold uppercase text-black dark:text-white block">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 min-h-[44px] rounded-xl border-2 text-xs font-mono font-bold uppercase transition-all ${
              value === o.value
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-neutral-50 text-black border-black/40 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-white dark:border-neutral-600'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <GuideNote>{help}</GuideNote>
    </div>
  );
}
