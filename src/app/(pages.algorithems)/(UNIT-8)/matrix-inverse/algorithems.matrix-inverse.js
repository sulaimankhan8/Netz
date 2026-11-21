'use client';
// The live matrix-inverse calculator. The maths is in src/app/utils/engines/matrix-inverse.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { useExportBar } from '@/app/components/method/ExportBar';
import { EditorialButton } from '@/app/components/editorial';
import { MatrixInput, MatrixView, RowOps, matrixTex, texNumber } from '@/app/components/method/Matrix';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Choice, HowToUse, GuideNote, TypingGuide } from '@/app/components/method/Calculator';
import { useCalcGuide } from '@/app/components/method/calcGuide';
import { identity } from '@/app/utils/numeric/matrix';
import { solve } from '@/app/utils/engines/matrix-inverse';
import { useLoadInput, solveSoon } from '@/app/components/method/calcDemo';

const START = [['1', '2', '3'], ['0', '1', '4'], ['5', '6', '0']];

const Label = ({ children }) => (
  <div className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">{children}</div>
);

export default function MatrixInverseCalculator() {
  const [cells, setCells] = useState(START);
  const guide = useCalcGuide('matrix-inverse');
  const [method, setMethod] = useState('adjoint');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('matrix-inverse', 8, answer, () => ({ size: cells.length, method }));
  const exportBar = useExportBar('matrix-inverse', () => ({ cells, method }), !!answer);

  // The adjoint method is offered up to 4×4; bigger matrices use Gauss-Jordan
  const adjointAllowed = cells.length <= 4;
  const shownMethod = adjointAllowed ? method : 'gauss-jordan';

  // Values sent with loadIntoCalculator() (calcDemo.js) load its inputs here, then the page's own solve button is pressed
  useLoadInput((x) => { setCells(x.cells ? x.cells.map((r) => r.map(String)) : x); solveSoon(); });
  const run = () => {
    try {
      setError('');
      setAnswer(solve({ cells, method: shownMethod }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the matrix.');
    }
  };
  const reset = () => { setCells(START); setMethod('adjoint'); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6" id="netz-solve-matrix-inverse">
      <CalcCard
        title="Matrix Inverse Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <HowToUse steps={guide?.howTo} />
        <ErrorBox>{error}</ErrorBox>
        <MatrixInput label="A" value={cells} onChange={(v) => { setCells(v); setAnswer(null); }} square max={6} />
        <GuideNote>{guide?.help?.matrix}</GuideNote>
        <Choice
          label="Method"
          value={shownMethod}
          onChange={(v) => { setMethod(v); setAnswer(null); }}
          options={[
            ...(adjointAllowed ? [{ value: 'adjoint', label: 'Adjoint method' }] : []),
            { value: 'gauss-jordan', label: 'Gauss-Jordan' },
          ]}
        />
        {guide?.maths?.length > 0 && <TypingGuide />}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" data-solve="" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Find Inverse
          </EditorialButton>
        </div>

        {answer && exportBar}
        {answer && (
          <ResultBox label="Inverse A⁻¹">
            <MatrixView matrix={answer.result} prefix="A^{-1} = " />
            <p className="text-sm font-semibold">{answer.checks ? 'Check: A · A⁻¹ = I ✓' : 'Check: A · A⁻¹ is not exactly I (rounding in a nearly singular matrix).'}</p>
          </ResultBox>
        )}
      </CalcCard>

      {answer?.method === 'adjoint' && (
        <StepsCard title="Adjoint Method">
          <Label>Step 1 · Determinant</Label>
          <div className="overflow-x-auto text-center"><BlockMath math={`|A| = ${texNumber(answer.det)} \\neq 0`} /></div>
          <Label>Step 2 · Cofactor matrix (Cᵢⱼ = (−1)ⁱ⁺ʲ Mᵢⱼ)</Label>
          <MatrixView matrix={answer.cofactors} prefix="C = " />
          <Label>Step 3 · Adjoint = transpose of the cofactor matrix</Label>
          <MatrixView matrix={answer.adjoint} prefix="\operatorname{adj} A = C^{T} = " />
          <Label>Step 4 · Divide by |A|</Label>
          <div className="overflow-x-auto text-center text-black dark:text-white">
            <BlockMath math={`A^{-1} = \\frac{1}{${texNumber(answer.det)}}\\,${matrixTex(answer.adjoint)} = ${matrixTex(answer.result)}`} />
          </div>
        </StepsCard>
      )}

      {answer?.method === 'gauss-jordan' && (
        <StepsCard title={`Gauss-Jordan on [A | I] (${answer.ops.length} operations)`}>
          <Label>Start with A next to the identity matrix</Label>
          <MatrixView matrix={answer.A.map((r, i) => [...r, ...identity(r.length)[i]])} divider={answer.A.length} />
          <RowOps ops={answer.ops} divider={answer.A.length} />
          <Label>The left half is now I, so the right half is A⁻¹</Label>
        </StepsCard>
      )}
    </div>
  );
}
