// Cards for the live calculators, with the classes the Unit 4 calculators use (e.g. algorithems.gauss-elimination.js).
import { FiAlertCircle, FiList } from 'react-icons/fi';

/** The white lab card: small kicker, title, buttons on the right, then the inputs. */
export function CalcCard({ kicker = 'LABORATORY', title, actions, children }) {
  return (
    <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-neutral-800">
        <div>
          <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">{kicker}</span>
          <h3 className="text-xl md:text-2xl font-black uppercase text-black dark:text-white">{title}</h3>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
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
    <div className="p-5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-3">
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

const fieldClass = 'w-full min-h-[44px] px-3 text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';
const selectClass = 'w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-black/80 dark:border-neutral-700 rounded-xl font-mono text-base font-bold text-black dark:text-white focus:outline-none';

/** A labelled text box for numbers (16px text, so phones don't zoom). Enter runs onEnter. */
export function Field({ label, value, onChange, onEnter, placeholder = '', inputMode = 'decimal' }) {
  return (
    <label className="space-y-1 min-w-0 block">
      <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        className={fieldClass}
      />
    </label>
  );
}

/** A labelled drop-down. options: [{ value, label }] */
export function Select({ label, value, onChange, options }) {
  return (
    <label className="space-y-1 min-w-0 block">
      <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 block">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/** Two or three choices as buttons (method pickers). options: [{ value, label }] */
export function Choice({ label, value, onChange, options }) {
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
    </div>
  );
}
