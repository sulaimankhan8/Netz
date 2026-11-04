'use client';
// The live SOR calculator. The maths is in src/app/utils/engines/sor.js.
import React, { useState } from 'react';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Notes } from '@/app/components/method/Calculator';
import { MatrixInput } from '@/app/components/method/Matrix';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/sor';

const START = { cells: [['4', '3', '0'], ['3', '4', '-1'], ['0', '-1', '4']], b: '24, 30, -24', omega: '1.25', tol: '0.0001', maxIter: '100' };
const VARS = ['x', 'y', 'z', 'u', 'v', 'w'];

export default function SorCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('sor', 1, answer, () => ({ omega: s.omega }));
  const set = (patch) => { setS((o) => ({ ...o, ...patch })); setAnswer(null); setError(''); };

  const run = () => {
    try {
      setError('');
      setAnswer(solve(s));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the inputs.');
    }
  };
  const reset = () => { setS(START); setAnswer(null); setError(''); };
  const n = s.cells.length;
  const columns = answer ? [{ key: 'k', label: 'Iteration', bold: true }, ...VARS.slice(0, answer.n).map((v) => ({ key: v, label: v })), { key: 'change', label: 'Largest change', highlight: true }] : [];
  const rows = answer ? answer.rows.map((r) => ({ k: r.k, ...Object.fromEntries(r.x.map((v, i) => [VARS[i], sig(v, 7)])), change: sig(r.change, 4) })) : [];

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="SOR Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <MatrixInput label="A" value={s.cells} onChange={(v) => set({ cells: v })} square min={2} max={6} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label={`Right-hand side b (${n} numbers)`} value={s.b} inputMode="text" onChange={(v) => set({ b: v })} onEnter={run} />
          <Field label="ω (0 to 2)" value={s.omega} onChange={(v) => set({ omega: v })} onEnter={run} />
          <Field label="Tolerance" value={s.tol} onChange={(v) => set({ tol: v })} onEnter={run} />
          <Field label="Max iterations" value={s.maxIter} inputMode="numeric" onChange={(v) => set({ maxIter: v })} onEnter={run} />
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Solve with SOR
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label={answer.converged ? `Solution (${answer.rows.length} iterations)` : 'Not converged'}>
            <p className="text-xl font-black font-mono break-words">{answer.x.map((v, i) => `${VARS[i]} = ${sig(v, 7)}`).join(', ')}</p>
            {answer.converged && answer.gsIterations && (
              <p className="text-sm">With ω = {answer.omega}: {answer.rows.length} iterations. Gauss-Seidel (ω = 1) needs {answer.gsIterations}.</p>
            )}
          </ResultBox>
        )}
      </CalcCard>
      {answer && (
        <StepsCard title="Iterations">
          <div className="max-h-[520px] overflow-y-auto rounded-xl"><StepTable columns={columns} rows={rows} rowKey={(r) => r.k} /></div>
          <Notes notes={answer.notes} />
        </StepsCard>
      )}
    </div>
  );
}
