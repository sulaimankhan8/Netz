'use client';
// The live limit calculator. The maths is in src/app/utils/engines/limit.js and src/app/utils/symbolic/limit.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice } from '@/app/components/method/Calculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { texValue } from '@/app/utils/symbolic/limit';
import { solve } from '@/app/utils/engines/limit';

const START = { f: '(x^2-5x+6)/(x^2-4)', a: '2', dir: 'both' };
const EXAMPLES = [['sin(x)/x', '0'], ['(1-cos(x))/x^2', '0'], ['(3x^2+1)/(2x^2-x)', 'inf'], ['(sqrt(x)-2)/(x-4)', '4'], ['1/x', '0'], ['ln(x)/x', 'inf']];

/** Graph window: around a finite point (or 0…40 towards ∞), y from the middle of the sampled values. */
function viewFor(f, a) {
  const [x0, x1] = a === Infinity ? [0, 40] : a === -Infinity ? [-40, 0] : [a - 3, a + 3];
  const ys = [];
  for (let k = 0; k <= 120; k++) { const y = f(x0 + (k / 120) * (x1 - x0)); if (Number.isFinite(y)) ys.push(y); }
  if (ys.length < 5) return { x0, x1, y0: -5, y1: 5 };
  ys.sort((p, q) => p - q);
  let lo = ys[Math.floor(ys.length * 0.1)], hi = ys[Math.ceil(ys.length * 0.9) - 1];
  if (hi - lo < 1) { lo -= 1; hi += 1; }
  return { x0, x1, y0: Math.min(lo, 0), y1: Math.max(hi, 0) };
}

export default function LimitCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('limit', 6, answer, () => ({ fn: v.f, at: v.a }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };
  const run = (override) => {
    try {
      setError('');
      setAnswer(solve({ ...v, ...override }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expression.');
    }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };

  const x = answer?.variable ?? 'x';
  const aTex = answer ? (answer.aTex ?? texValue(answer.a)) : '';
  const arrow = answer ? `${x} \\to ${aTex}${answer.dir === 'left' ? '^-' : answer.dir === 'right' ? '^+' : ''}` : '';
  const showMarker = answer && Number.isFinite(answer.a) && Number.isFinite(answer.value);

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Limit Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_10rem] gap-3">
          <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. sin(x)/x" onChange={(f) => set({ f })} onEnter={() => run()} />
          <Field label="as x →" value={v.a} inputMode="text" placeholder="0, pi/2, inf" onChange={(a) => set({ a })} onEnter={() => run()} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map(([f, a]) => (
            <button key={f} type="button" onClick={() => { set({ f, a, dir: 'both' }); run({ f, a, dir: 'both' }); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">
              {f}, x→{a === 'inf' ? '∞' : a}
            </button>
          ))}
        </div>
        <Choice label="Approach from" value={v.dir} onChange={(dir) => set({ dir })} options={[{ value: 'both', label: 'Both sides' }, { value: 'left', label: 'Left (x → a⁻)' }, { value: 'right', label: 'Right (x → a⁺)' }]} />
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Type inf or -inf for infinity. Use ^ for powers and brackets for functions: sin(x), ln(x), sqrt(x).</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Find Limit
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Limit">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto text-lg"><BlockMath math={`\\lim_{${arrow}} ${answer.f} = ${answer.exactTex}`} /></div>
                {answer.sides && answer.dir === 'both' && answer.exactTex.includes('does not exist') && answer.sides.left !== null && (
                  <p className="text-sm font-mono">From the left: {fmtSide(answer.sides.left)} · from the right: {fmtSide(answer.sides.right)}</p>
                )}
                {answer.estimated && (
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> This value is a careful numerical estimate: NETZ could not find it step by step yet.</p>
                )}
                {!answer.estimated && !answer.verified && (
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> The numerical check did not confirm this answer. Treat it with care.</p>
                )}
              </div>
              <div className="flex justify-center">
                <CoordPlot
                  fn={answer.fAt}
                  view={viewFor(answer.fAt, answer.a)}
                  points={showMarker ? [{ x: answer.a, y: answer.value, label: 'L' }] : []}
                />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Step-by-Step Working">
          <ol className="space-y-3">
            {answer.steps.map((s, i) => (
              <li key={i} className="border border-black/20 dark:border-neutral-700 rounded-xl overflow-hidden">
                <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-xs font-mono font-bold text-black dark:text-white border-b border-black/20 dark:border-neutral-700">Step {i + 1}: {s.title}</div>
                <div className="px-2 overflow-x-auto text-center text-black dark:text-white">
                  {s.lines.map((l, j) => <BlockMath key={j} math={l} />)}
                </div>
              </li>
            ))}
          </ol>
        </StepsCard>
      )}
    </div>
  );
}

function fmtSide(s) {
  if (s === Infinity) return '+∞';
  if (s === -Infinity) return '−∞';
  if (Number.isNaN(s) || s === null) return 'no value';
  return String(Number(s.toPrecision(6)));
}
