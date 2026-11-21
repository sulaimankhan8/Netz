'use client';
// The live integral calculator. The maths is in src/app/utils/engines/integral.js and src/app/utils/symbolic/integral.js.
import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw, FiInfo } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Notes, HowToUse, GuideNote, TypingGuide } from '@/app/components/method/Calculator';
import { useCalcGuide } from '@/app/components/method/calcGuide';
import CoordPlot from '@/app/components/method/CoordPlot';
import StepList from '@/app/components/method/StepList';
import { useLoadInput } from '@/app/components/method/calcDemo';
import { solve } from '@/app/utils/engines/integral';

const START = { f: 'x^2 e^x', kind: 'indefinite', a: '0', b: '1' };
// Each example shows a different method
const EXAMPLES = [
  { label: 'x cos(x^2)', input: { f: 'x cos(x^2)', kind: 'indefinite' } },
  { label: 'x ln(x)', input: { f: 'x ln(x)', kind: 'indefinite' } },
  { label: '1/(x^2-1)', input: { f: '1/(x^2-1)', kind: 'indefinite' } },
  { label: 'cos(x)^2', input: { f: 'cos(x)^2', kind: 'indefinite' } },
  { label: 'e^x sin(x)', input: { f: 'e^x sin(x)', kind: 'indefinite' } },
  { label: '1/(1+x^2), 0 to 1', input: { f: '1/(1+x^2)', kind: 'definite', a: '0', b: '1' } },
  { label: 'sin(x), 0 to π', input: { f: 'sin(x)', kind: 'definite', a: '0', b: 'pi' } },
];

/** A window for the graph: x around [a, b] (or −4…4), y from the middle 90% of sampled values. */
function viewFor(f, a, b) {
  const has = Number.isFinite(a) && Number.isFinite(b);
  const lo = has ? Math.min(a, b) : -4, hi = has ? Math.max(a, b) : 4;
  const pad = has ? Math.max((hi - lo) * 0.35, 0.5) : 0;
  const x0 = lo - pad, x1 = hi + pad;
  const ys = [];
  for (let k = 0; k <= 80; k++) { const y = f(x0 + (k / 80) * (x1 - x0)); if (Number.isFinite(y)) ys.push(y); }
  if (ys.length < 5) return { x0, x1, y0: -5, y1: 5 };
  ys.sort((p, q) => p - q);
  let y0 = ys[Math.floor(ys.length * 0.05)], y1 = ys[Math.ceil(ys.length * 0.95) - 1];
  if (y1 - y0 < 1) { y0 -= 1; y1 += 1; }
  return { x0, x1, y0: Math.min(y0, 0), y1: Math.max(y1, 0) };
}

/** The whole working as one numbered list: integration steps, simplify, the limits, then the check. */
function workingSteps(answer, definite, x) {
  const check = answer.steps.filter((s) => s.title === 'Check by differentiating');
  const main = answer.steps.filter((s) => s.title !== 'Check by differentiating');
  const out = [...main];
  if (answer.simplified) {
    out.push({ title: 'Simplify', text: 'Collect like terms and tidy the answer into its simplest form. It is the same function, just written more neatly.', lines: [`${answer.raw} = ${answer.answer}`] });
  }
  if (definite && answer.evaluation.length > 0) {
    out.push({
      title: 'Put in the limits',
      text: `For a definite integral we do not need + C: work out F at the upper limit, then at the lower limit, and subtract, F(b) − F(a).`,
      formula: `\\int_a^b f(${x})\\,d${x} = F(b) - F(a)`,
      lines: answer.evaluation,
    });
  }
  return [...out, ...check];
}

export default function IntegralCalculator() {
  const [v, setV] = useState(START);
  const guide = useCalcGuide('integral');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('integral', 6, answer, () => ({ fn: v.f, kind: v.kind }));
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
  // Values sent with loadIntoCalculator() (calcDemo.js) load here and solve
  useLoadInput((values) => { const next = { ...START, ...values }; setV(next); run(next); });

  const x = answer?.variable ?? 'x';
  const definite = answer?.kind === 'definite';
  const intTex = definite ? `\\int_{${answer.a.tex}}^{${answer.b.tex}} ${answer.f}\\,d${x}` : answer ? `\\int ${answer.f}\\,d${x}` : '';

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Integral Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <HowToUse steps={guide?.howTo} />
        <ErrorBox>{error}</ErrorBox>
        <Choice label="Integral" value={v.kind} onChange={(kind) => set({ kind })} options={[{ value: 'indefinite', label: 'Indefinite ∫ f dx' }, { value: 'definite', label: 'Definite ∫ₐᵇ f dx' }]} help={guide?.help?.kind} />
        <Field label="f(x) =" value={v.f} inputMode="text" placeholder="e.g. x^2 e^x" onChange={(f) => set({ f })} onEnter={() => run()} help={guide?.help?.f} />
        {v.kind === 'definite' && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="From a =" value={v.a} inputMode="text" onChange={(a) => set({ a })} onEnter={() => run()} help={guide?.help?.a} />
            <Field label="To b =" value={v.b} inputMode="text" onChange={(b) => set({ b })} onEnter={() => run()} help={guide?.help?.b} />
          </div>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">Try an example:</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" onClick={() => { set(e.input); run(e.input); }} className="px-3 py-1.5 min-h-[36px] rounded-lg border border-black/30 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700">{e.label}</button>
          ))}
        </div>
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Use ^ for powers and brackets for functions: sin(3x), ln(x), e^(2x), sqrt(x). Limits can be numbers, pi, pi/2 or e.</p>
        {guide?.maths?.length > 0 && <TypingGuide />}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" data-solve="" size="md" onClick={() => run()} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Integrate
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label={definite ? 'Definite integral' : 'Integral'}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                {definite ? (
                  <div className="overflow-x-auto text-lg"><BlockMath math={`${intTex} = ${answer.valueTex}`} /></div>
                ) : (
                  <div className="overflow-x-auto text-lg"><BlockMath math={`${intTex} = ${answer.answer} + C`} /></div>
                )}
                {definite && answer.found && (
                  <div className="overflow-x-auto text-sm"><BlockMath math={`F(${x}) = ${answer.answer}`} /></div>
                )}
                {definite && !answer.found && (
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 flex gap-2">
                    <FiInfo className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{answer.why} This value is numerical (adaptive Simpson&apos;s rule), accurate to about 9 decimal places.</span>
                  </p>
                )}
                {definite && <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Shaded: the signed area under f, from {x} = a to {x} = b (area below the axis counts as negative).</p>}
              </div>
              <div className="flex justify-center">
                <CoordPlot
                  fn={answer.fAt}
                  view={viewFor(answer.fAt, answer.a?.value, answer.b?.value)}
                  shade={definite ? { a: answer.a.value, b: answer.b.value } : null}
                />
              </div>
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && answer.found && (
        <StepsCard title="Step-by-Step Working">
          <div className="overflow-x-auto"><BlockMath math={definite ? `\\int ${answer.f}\\,d${x}` : intTex} /></div>
          <StepList steps={workingSteps(answer, definite, x)} />
          {!definite && <p className="text-sm text-neutral-700 dark:text-neutral-300">Add + C at the end: every antiderivative differs from another by a constant, and differentiating a constant gives 0.</p>}
        </StepsCard>
      )}
      {answer?.notes?.length > 0 && <Notes notes={answer.notes} />}
    </div>
  );
}
