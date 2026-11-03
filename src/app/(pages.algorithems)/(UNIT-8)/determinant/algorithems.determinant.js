'use client';
// The live determinant calculator. The maths is in src/app/utils/engines/determinant.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { EditorialButton } from '@/app/components/editorial';
import { MatrixInput, MatrixView, RowOps, matrixTex, texNumber } from '@/app/components/method/Matrix';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Notes, Choice } from '@/app/components/method/Calculator';
import { solve } from '@/app/utils/engines/determinant';

const START = [['2', '-3', '1'], ['2', '0', '-1'], ['1', '4', '5']];

export default function DeterminantCalculator() {
  const [cells, setCells] = useState(START);
  const [method, setMethod] = useState('cofactor');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('determinant', 8, answer, () => ({ size: cells.length, method }));

  // Cofactor expansion is offered up to 5×5; a 6×6 matrix always uses row reduction
  const tooBigForCofactors = cells.length > 5;
  const shownMethod = tooBigForCofactors ? 'rows' : method;

  const run = () => {
    try {
      setError('');
      setAnswer(solve({ cells, method: shownMethod }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the matrix.');
    }
  };
  const reset = () => { setCells(START); setMethod('cofactor'); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6">
      <CalcCard
        title="Determinant Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <ErrorBox>{error}</ErrorBox>
        <MatrixInput label="A" value={cells} onChange={(v) => { setCells(v); setAnswer(null); }} square max={6} />
        <Choice
          label="Method"
          value={shownMethod}
          onChange={(v) => { setMethod(v); setAnswer(null); }}
          options={[
            ...(tooBigForCofactors ? [] : [{ value: 'cofactor', label: 'Cofactor expansion' }]),
            { value: 'rows', label: 'Row reduction' },
          ]}
        />
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Calculate Determinant
          </EditorialButton>
        </div>

        {answer && (
          <ResultBox label="Determinant |A|">
            <BlockMath math={`|A| = ${texNumber(answer.result)}`} />
            {answer.result === 0 && <p className="text-sm font-semibold">|A| = 0, so A is singular: it has no inverse.</p>}
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title={answer.method === 'cofactor' ? 'Expansion along Row 1' : `Row Reduction (${answer.ops.length} operations)`}>
          <MatrixView matrix={answer.A} prefix="|A| = " bars="|" />
          <Notes notes={answer.notes} />
          {answer.method === 'cofactor' && answer.terms.length > 0 && answer.A.length > 2 && <CofactorTerms terms={answer.terms} result={answer.result} />}
          {answer.method === 'rows' && (
            <>
              <RowOps ops={answer.ops} />
              {answer.diagonal && (
                <div className="overflow-x-auto text-center">
                  <BlockMath math={`|A| = ${answer.sign < 0 ? '-' : ''}${answer.diagonal.map((d) => `(${texNumber(d)})`).join('')} = ${texNumber(answer.result)}`} />
                </div>
              )}
            </>
          )}
        </StepsCard>
      )}
    </div>
  );
}

/** One line per first-row entry: sign × entry × its minor, then the total. */
function CofactorTerms({ terms, result }) {
  return (
    <div className="space-y-2">
      {terms.map((t) => (
        <div key={t.j} className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-x-auto text-center text-black dark:text-white">
          <div className="text-xs font-mono font-bold uppercase text-neutral-500 text-left">Entry a₁{'₁₂₃₄₅'[t.j]} · sign {t.sign > 0 ? '+' : '−'}</div>
          <BlockMath math={`${t.sign > 0 ? '+' : '-'}(${texNumber(t.entry)})\\,${matrixTex(t.minor, { bars: '|' })} = ${t.sign > 0 ? '+' : '-'}(${texNumber(t.entry)})(${texNumber(t.minorDet)}) = ${texNumber(t.value)}`} />
        </div>
      ))}
      <div className="overflow-x-auto text-center text-black dark:text-white">
        <BlockMath math={`|A| = ${terms.map((t, i) => `${i === 0 ? (t.value < 0 ? '-' : '') : (t.value < 0 ? ' - ' : ' + ')}${texNumber(Math.abs(t.value))}`).join('')} = ${texNumber(result)}`} />
      </div>
    </div>
  );
}
