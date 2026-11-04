'use client';
// The live system-of-equations solver. The maths is in src/app/utils/engines/system-of-equations.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Choice, Notes } from '@/app/components/method/Calculator';
import { RowOps, MatrixView } from '@/app/components/method/Matrix';
import CoordPlot from '@/app/components/method/CoordPlot';
import { texNumber } from '@/app/utils/numeric/latex';
import { solve, VARS } from '@/app/utils/engines/system-of-equations';

const START = {
  2: [['2', '3', '13'], ['1', '-1', '-1']],
  3: [['1', '1', '1', '6'], ['0', '2', '5', '-4'], ['2', '5', '-1', '27']],
};
const cellClass = 'w-full min-w-0 min-h-[44px] px-2 text-center text-base font-mono font-bold rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

export default function SystemSolver() {
  const [size, setSize] = useState(2);
  const [cells, setCells] = useState(START[2]);
  const [method, setMethod] = useState('cramer');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('system-of-equations', 7, answer, () => ({ size, method }));

  const clear = () => { setAnswer(null); setError(''); };
  const setCell = (i, j, v) => { setCells((m) => m.map((r, a) => (a === i ? r.map((x, b) => (b === j ? v : x)) : r))); clear(); };
  const pickSize = (s) => { setSize(s); setCells(START[s]); if (s === 3 && method === 'substitution') setMethod('cramer'); clear(); };
  const run = () => {
    try {
      setError('');
      setAnswer(solve({ cells, method }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the numbers.');
    }
  };
  const reset = () => { setSize(2); setCells(START[2]); setMethod('cramer'); clear(); };

  // For two equations: draw both lines (a·x + b·y = c → a·x + b·y − c = 0) and where they meet
  const plot = answer && size === 2 && {
    lines: answer.A.map((r, i) => ({ a: r[0], b: r[1], c: -answer.b[i] })),
    points: answer.kind === 'unique' ? [{ x: answer.result[0], y: answer.result[1], label: 'P' }] : [],
  };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Simultaneous Equations Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <div className="flex flex-wrap gap-6">
          <Choice label="Number of equations" value={String(size)} onChange={(v) => pickSize(Number(v))} options={[{ value: '2', label: '2 (x, y)' }, { value: '3', label: '3 (x, y, z)' }]} />
          <Choice
            label="Method"
            value={method}
            onChange={(v) => { setMethod(v); clear(); }}
            options={[{ value: 'cramer', label: "Cramer's rule" }, { value: 'elimination', label: 'Elimination' }, ...(size === 2 ? [{ value: 'substitution', label: 'Substitution' }] : [])]}
          />
        </div>

        <div className="space-y-2">
          {cells.map((row, i) => (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2 font-mono font-bold text-black dark:text-white">
              {row.slice(0, size).map((v, j) => (
                <React.Fragment key={j}>
                  {j > 0 && <span aria-hidden="true">+</span>}
                  <input type="text" inputMode="decimal" autoComplete="off" value={v} aria-label={`Equation ${i + 1}, coefficient of ${VARS[j]}`} onChange={(e) => setCell(i, j, e.target.value)} className={cellClass} />
                  <span className="italic font-serif">{VARS[j]}</span>
                </React.Fragment>
              ))}
              <span aria-hidden="true">=</span>
              <input type="text" inputMode="decimal" autoComplete="off" value={row[size]} aria-label={`Equation ${i + 1}, constant`} onChange={(e) => setCell(i, size, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') run(); }} className={`${cellClass} bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700`} />
            </div>
          ))}
          <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Type 0 for a missing term and a negative number for a minus sign (x − y = −1 is 1, −1, −1).</p>
        </div>

        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Solve System
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label={answer.kind === 'unique' ? 'Solution' : answer.kind === 'none' ? 'No solution' : 'Infinitely many solutions'}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
              <div className="space-y-2 min-w-0">
                <div className="overflow-x-auto"><BlockMath math={`\\begin{cases} ${answer.system.join(' \\\\ ')} \\end{cases}`} /></div>
                {answer.kind === 'unique'
                  ? <div className="overflow-x-auto text-lg"><BlockMath math={answer.result.map((v, j) => `${VARS[j]} = ${texNumber(v)}`).join(',\\quad ')} /></div>
                  : <p className="font-semibold">{answer.verdict}</p>}
              </div>
              {plot && <div className="flex justify-center"><CoordPlot {...plot} /></div>}
            </div>
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title={answer.kind !== 'unique' ? 'Why' : answer.method === 'cramer' ? "Cramer's Rule" : answer.method === 'elimination' ? 'Elimination (Gauss-Jordan)' : 'Substitution'}>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
            {answer.lines.map((l, i) => <BlockMath key={i} math={l} />)}
          </div>
          {answer.ops && (
            <>
              <MatrixView matrix={answer.A.map((r, i) => [...r, answer.b[i]])} prefix="[A \mid b] = " divider={answer.size} />
              <RowOps ops={answer.ops} divider={answer.size} />
            </>
          )}
          {answer.kind !== 'unique' && answer.rref && <MatrixView matrix={answer.rref} prefix="\text{Reduced: } " divider={answer.size} />}
          <Notes notes={answer.notes} />
        </StepsCard>
      )}
    </div>
  );
}
