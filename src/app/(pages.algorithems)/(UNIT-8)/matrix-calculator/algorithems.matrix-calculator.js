'use client';
// The live matrix calculator. The maths is in src/app/utils/engines/matrix-calculator.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { MatrixInput, MatrixView } from '@/app/components/method/Matrix';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Notes, Choice } from '@/app/components/method/Calculator';
import { solve, OPERATIONS } from '@/app/utils/engines/matrix-calculator';

const START_A = [['1', '2'], ['3', '4']];
const START_B = [['5', '6'], ['7', '8']];
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const RESULT_TEX = { add: 'A + B', subtract: 'A - B', multiply: 'AB', transpose: 'A^{T}' };

export default function MatrixCalculator() {
  const [a, setA] = useState(START_A);
  const [b, setB] = useState(START_B);
  const [op, setOp] = useState('multiply');
  const [k, setK] = useState('2');
  const [n, setN] = useState('3');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('matrix-calculator', 8, answer, () => ({ op }));
  const needsB = OPERATIONS.find((o) => o.op === op)?.needsB;

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ op, a, b, k, n }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the matrices.');
    }
  };
  const reset = () => { setA(START_A); setB(START_B); setOp('multiply'); setK('2'); setN('3'); setAnswer(null); setError(''); };
  const clearAnswer = (fn) => (v) => { fn(v); setAnswer(null); };

  const resultTex = answer && (answer.op === 'scale' ? `${answer.k}A` : answer.op === 'power' ? `A^{${answer.n}}` : RESULT_TEX[answer.op]);

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Matrix Operations Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <Choice label="Operation" value={op} onChange={clearAnswer(setOp)} options={OPERATIONS.map((o) => ({ value: o.op, label: o.label }))} />
        <MatrixInput label="A" value={a} onChange={clearAnswer(setA)} max={6} square={op === 'power'} />
        {needsB && <MatrixInput label="B" value={b} onChange={clearAnswer(setB)} max={6} />}
        {op === 'scale' && <NumberField label="Number k" value={k} onChange={clearAnswer(setK)} />}
        {op === 'power' && <NumberField label="Power n (0 to 50)" value={n} onChange={clearAnswer(setN)} />}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Result">
            <MatrixView matrix={answer.result} prefix={`${resultTex} = `} />
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title="Working">
          <Notes notes={answer.notes} />
          {answer.op === 'multiply' && (
            <ol className="space-y-1 font-mono text-xs text-black dark:text-white">
              {answer.working.map((w) => (
                <li key={`${w.i}-${w.j}`} className="p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-x-auto whitespace-nowrap">
                  c{SUB[w.i + 1]}{SUB[w.j + 1]} = {w.text}
                </li>
              ))}
            </ol>
          )}
          {answer.op === 'power' && answer.powers.slice(2, 11).map((P, p) => (
            <MatrixView key={p} matrix={P} prefix={`A^{${p + 2}} = `} />
          ))}
          {answer.op === 'power' && answer.n > 10 && <p className="text-sm text-neutral-600 dark:text-neutral-400">Powers up to A¹⁰ are shown; the result above is A^{answer.n}.</p>}
        </StepsCard>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-mono font-bold uppercase text-black dark:text-white">{label}:</span>
      <input
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 min-h-[44px] px-3 text-center font-mono font-bold text-base rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-black/60 dark:border-neutral-600 text-black dark:text-white"
      />
    </label>
  );
}
