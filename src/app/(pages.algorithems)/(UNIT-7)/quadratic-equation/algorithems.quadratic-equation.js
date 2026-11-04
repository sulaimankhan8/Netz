'use client';
// The live quadratic equation solver. The maths is in src/app/utils/engines/quadratic.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field } from '@/app/components/method/Calculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/quadratic';
import { texNumber } from '@/app/utils/numeric/latex';

const START = { a: '2', b: '-7', c: '3' };
const Panel = ({ title, lines }) => (
  <div className="space-y-1">
    <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">{title}</div>
    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
      {lines.map((l, i) => <BlockMath key={i} math={l} />)}
    </div>
  </div>
);

export default function QuadraticSolver() {
  const [v, setV] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('quadratic', 7, answer, () => ({ fn: answer ? `${answer.a}x^2+${answer.b}x+${answer.c}` : '' }));
  const set = (k, x) => { setV((o) => ({ ...o, [k]: x })); setAnswer(null); setError(''); };

  const run = () => {
    try {
      setError('');
      setAnswer(solve(v));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setV(START); setAnswer(null); setError(''); };

  const plot = answer && {
    fn: (x) => answer.a * x * x + answer.b * x + answer.c,
    points: [
      { x: answer.h, y: answer.k, label: 'V' },
      ...answer.roots.map((r, i) => ({ x: r, y: 0, label: answer.roots.length > 1 ? `x${i + 1}` : 'x' })),
    ],
  };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Quadratic Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">Solve <strong>ax² + bx + c = 0</strong>. Fractions like 1/2 are fine.</p>
        <div className="grid grid-cols-3 gap-3 max-w-xl">
          <Field label="a" value={v.a} onChange={(x) => set('a', x)} onEnter={run} />
          <Field label="b" value={v.b} onChange={(x) => set('b', x)} onEnter={run} />
          <Field label="c" value={v.c} onChange={(x) => set('c', x)} onEnter={run} />
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Solve Equation
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Roots">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={answer.eq} /></div>
                <div className="overflow-x-auto text-lg">
                  <BlockMath math={answer.exact ? `x = ${answer.exact}` : answer.roots.length === 1 ? `x = ${texNumber(answer.roots[0])}` : `x = ${texNumber(answer.roots[0])} \\ \\text{or} \\ ${texNumber(answer.roots[1])}`} />
                </div>
                <p className="text-sm font-semibold">D = {sig(answer.D, 8)}: {answer.nature}.</p>
                {answer.factored && <div className="overflow-x-auto"><BlockMath math={`\\text{Factors: } ${answer.eq.replace(' = 0', '')} = ${answer.factored}`} /></div>}
                <p className="text-sm font-mono">Vertex ({sig(answer.h, 6)}, {sig(answer.k, 6)}) · sum of roots {sig(answer.sum, 6)} · product {sig(answer.product, 6)}</p>
              </div>
              <div className="flex justify-center"><CoordPlot {...plot} /></div>
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <Panel title="1 · Discriminant" lines={answer.lines.discriminant} />
          <Panel title="2 · Roots by the quadratic formula" lines={answer.lines.roots} />
          <Panel title="3 · Completing the square" lines={answer.lines.square} />
          <Panel title="4 · Vertex and graph" lines={answer.lines.vertex} />
          <Panel title="5 · Check: sum and product of roots" lines={[`\\alpha + \\beta = -\\frac{b}{a} = ${sig(answer.sum, 6)}, \\qquad \\alpha\\beta = \\frac{c}{a} = ${sig(answer.product, 6)}`]} />
        </StepsCard>
      )}
    </div>
  );
}
