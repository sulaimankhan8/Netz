'use client';
// The live power method calculator. The maths is in src/app/utils/engines/power-method.js.
import React, { useState } from 'react';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { sig } from '@/app/utils/numberFormat';
import { EditorialButton } from '@/app/components/editorial';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Field, Choice, Notes } from '@/app/components/method/Calculator';
import { MatrixInput } from '@/app/components/method/Matrix';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/power-method';

const START = { cells: [['1', '6', '1'], ['1', '2', '0'], ['0', '0', '3']], x0: '1, 0, 0', mode: 'largest', tol: '0.0001', maxIter: '50' };
const vec = (v) => `[${v.map((x) => sig(x, 6)).join(', ')}]`;

export default function PowerMethodCalculator() {
  const [s, setS] = useState(START);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('power-method', 4, answer, () => ({ mode: s.mode, size: s.cells.length }));
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
  const columns = [
    { key: 'k', label: 'k', bold: true }, { key: 'x', label: 'x⁽ᵏ⁻¹⁾' }, { key: 'y', label: s.mode === 'smallest' ? 'A⁻¹x' : 'Ax' },
    { key: 'lambda', label: 'λ (largest entry)', highlight: true }, { key: 'next', label: 'x⁽ᵏ⁾ = Ax ÷ λ' },
  ];

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Power Method Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <MatrixInput label="A" value={s.cells} onChange={(v) => set({ cells: v })} square min={2} max={6} />
        <Choice label="Find" value={s.mode} onChange={(mode) => set({ mode })} options={[{ value: 'largest', label: 'Largest eigenvalue' }, { value: 'smallest', label: 'Smallest (inverse power)' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Starting vector x₀ (blank = all 1s)" value={s.x0} inputMode="text" onChange={(x0) => set({ x0 })} onEnter={run} />
          <Field label="Tolerance" value={s.tol} onChange={(tol) => set({ tol })} onEnter={run} />
          <Field label="Max iterations" value={s.maxIter} inputMode="numeric" onChange={(maxIter) => set({ maxIter })} onEnter={run} />
        </div>
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Find Eigenvalue
          </EditorialButton>
        </div>
        {answer && (
          <ResultBox label={`${answer.mode === 'smallest' ? 'Smallest' : 'Dominant'} eigenvalue${answer.converged ? ` (${answer.rows.length} iterations)` : ' (not settled)'}`}>
            <p className="text-2xl font-black font-mono break-all">λ ≈ {sig(answer.eigenvalue, 8)}</p>
            <p className="text-sm font-mono break-words">Eigenvector ≈ {vec(answer.vector)}</p>
          </ResultBox>
        )}
      </CalcCard>
      {answer && (
        <StepsCard title="Iterations">
          <div className="max-h-[520px] overflow-y-auto rounded-xl">
            <StepTable columns={columns} rows={answer.rows.map((r) => ({ k: r.k, x: vec(r.x), y: vec(r.y), lambda: sig(r.lambda, 8), next: vec(r.next) }))} rowKey={(r) => r.k} />
          </div>
          <Notes notes={answer.notes} />
        </StepsCard>
      )}
    </div>
  );
}
