'use client';
// The live derivative calculator. The maths is in src/app/utils/engines/derivative.js and src/app/utils/symbolic.
import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Notes } from '@/app/components/method/Calculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/derivative';

const START = { f: 'x^2 sin(3x)', order: '1', at: '' };
const EXAMPLES = ['x^3 - 4x + 1', 'sin(x^2)', '(x+1)/(x-1)', 'e^(2x) cos(x)', 'ln(x^2+1)', 'sqrt(1-x^2)'];
/** A window for the graph: x around the point (or −4…4), y from the middle 90% of sampled values. */
function viewFor(f, centre = 0) {
  const x0 = centre - 4, x1 = centre + 4;
  const ys = [];
  for (let k = 0; k <= 80; k++) { const y = f(x0 + (k / 80) * (x1 - x0)); if (Number.isFinite(y)) ys.push(y); }
  if (ys.length < 5) return { x0, x1, y0: -5, y1: 5 };
  ys.sort((a, b) => a - b);
  let lo = ys[Math.floor(ys.length * 0.05)], hi = ys[Math.ceil(ys.length * 0.95) - 1];
  if (hi - lo < 1) { lo -= 1; hi += 1; }
  return { x0, x1, y0: Math.min(lo, 0), y1: Math.max(hi, 0) };
}

export default function DerivativeCalculator() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('derivative', 6, answer, () => ({ fn: v.f, order: v.order }));
  const set = (patch) => { setV((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };

  const run = (override) => {
    const input = { ...v, ...override };
    try {
      setError('');
      setAnswer(solve(input));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the expression.');
    }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };

  const x = answer?.variable ?? 'x';
  const dName = answer ? (answer.order === 1 ? `f'(${x})` : `f^{(${answer.order})}(${x})`) : '';
  const tangent = answer?.point && answer.order === 1 && answer.point.fa !== null
    ? { m: answer.point.slope, c: answer.point.fa - answer.point.slope * answer.point.a }
    : null;

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Derivative Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. x^2 sin(3x)" onChange={(f) => set({ f })} onEnter={() => run()} />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e} type="button" onClick={() => { set({ f: e }); run({ f: e }); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,14rem)] gap-4 items-end">
          <Choice label="Derivative" value={v.order} onChange={(order) => set({ order })} options={[{ value: '1', label: "1st f'" }, { value: '2', label: "2nd f''" }, { value: '3', label: "3rd f'''" }]} />
          <Field label="Slope at x = (optional)" value={v.at} onChange={(at) => set({ at })} onEnter={() => run()} />
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Use ^ for powers and brackets for functions: sin(3x), ln(x), e^(2x), sqrt(x).</p>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Differentiate
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label={answer.order === 1 ? 'Derivative' : `${['', '', 'Second', 'Third'][answer.order]} derivative`}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={`f(${x}) = ${answer.f}`} /></div>
                <div className="overflow-x-auto text-lg"><BlockMath math={`${dName} = ${answer.answer}`} /></div>
                {answer.point && (
                  <p className="text-sm font-mono">
                    At {x} = {sig(answer.point.a, 6)}: {answer.order === 1 ? 'slope' : 'value'} = {sig(answer.point.slope, 8)}
                    {tangent && <> · tangent line y = {sig(tangent.m, 6)}{x} {tangent.c < 0 ? '−' : '+'} {sig(Math.abs(tangent.c), 6)}</>}
                  </p>
                )}
                {!answer.verified && (
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex gap-2"><FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> NETZ could not double-check this answer numerically. Treat it with care.</p>
                )}
              </div>
              <div className="flex justify-center">
                <CoordPlot
                  fn={answer.fAt}
                  view={viewFor(answer.fAt, answer.point?.a ?? 0)}
                  points={answer.point && answer.point.fa !== null ? [{ x: answer.point.a, y: answer.point.fa, label: 'P' }] : []}
                  lines={tangent ? [{ a: -tangent.m, b: 1, c: -tangent.c }] : []}
                />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && answer.rounds.map((round) => (
        <StepsCard key={round.k} title={answer.order === 1 ? 'Step-by-Step Working' : `Derivative ${round.k} of ${answer.order}`}>
          <div className="overflow-x-auto"><BlockMath math={`\\frac{d}{d${x}}\\left[${round.from}\\right]`} /></div>
          {round.steps.length === 0 && <p className="text-sm text-neutral-700 dark:text-neutral-300">This is a constant, so its derivative is 0.</p>}
          <ol className="space-y-2">
            {round.steps.map((s, i) => (
              <li key={i} style={{ marginLeft: `${Math.min(s.depth, 4) * 12}px` }} className="border border-black/20 dark:border-neutral-700 rounded-xl overflow-hidden">
                <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-xs font-mono font-bold text-black dark:text-white border-b border-black/20 dark:border-neutral-700 flex flex-wrap gap-x-3 justify-between">
                  <span>{s.rule}</span>
                  <span className="font-normal text-neutral-600 dark:text-neutral-400"><InlineMath math={s.formula} /></span>
                </div>
                <div className="px-2 overflow-x-auto text-center text-black dark:text-white"><BlockMath math={s.line} /></div>
              </li>
            ))}
          </ol>
          {round.changed && (
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">Simplify</div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
                <BlockMath math={`${round.raw} = ${round.best}`} />
              </div>
            </div>
          )}
        </StepsCard>
      ))}
      {answer?.notes?.length > 0 && <Notes notes={answer.notes} />}
    </div>
  );
}
