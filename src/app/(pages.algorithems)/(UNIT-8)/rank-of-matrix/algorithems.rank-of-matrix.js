'use client';
// The live rank / RREF calculator. The maths is in src/app/utils/engines/rank.js.
import React, { useState } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useRecordSolve } from '@/app/utils/activity';
import { useExportBar } from '@/app/components/method/ExportBar';
import { EditorialButton } from '@/app/components/editorial';
import { MatrixInput, MatrixView, RowOps } from '@/app/components/method/Matrix';
import { CalcCard, ErrorBox, ResultBox, StepsCard, Notes, HowToUse, GuideNote, TypingGuide } from '@/app/components/method/Calculator';
import { useCalcGuide } from '@/app/components/method/calcGuide';
import { solve } from '@/app/utils/engines/rank';
import { useLoadInput, solveSoon } from '@/app/components/method/calcDemo';

const START = [['1', '2', '3'], ['2', '4', '6'], ['1', '1', '1']];

export default function RankCalculator() {
  const [cells, setCells] = useState(START);
  const guide = useCalcGuide('rank');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  useRecordSolve('rank', 8, answer, () => ({ rows: cells.length, cols: cells[0].length }));
  const exportBar = useExportBar('rank', () => ({ cells }), !!answer);

  // Values sent with loadIntoCalculator() (calcDemo.js) load its inputs here, then the page's own solve button is pressed
  useLoadInput((x) => { setCells(x.cells ? x.cells.map((r) => r.map(String)) : x); solveSoon(); });
  const run = () => {
    try {
      setError('');
      setAnswer(solve({ cells }));
    } catch (e) {
      setAnswer(null);
      setError(e.name === 'EngineError' ? e.message : 'Something went wrong. Please check the matrix.');
    }
  };
  const reset = () => { setCells(START); setAnswer(null); setError(''); };

  return (
    <div className="w-full space-y-6" id="netz-solve-rank">
      <CalcCard
        title="Rank & RREF Engine"
        actions={<EditorialButton variant="outline" size="sm" onClick={reset}><FiRotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</EditorialButton>}
      >
        <HowToUse steps={guide?.howTo} />
        <ErrorBox>{error}</ErrorBox>
        <MatrixInput label="A" value={cells} onChange={(v) => { setCells(v); setAnswer(null); }} max={6} />
        <GuideNote>{guide?.help?.matrix}</GuideNote>
        {guide?.maths?.length > 0 && <TypingGuide />}
        <div className="pt-2 flex justify-end">
          <EditorialButton variant="primary" data-solve="" size="md" onClick={run} className="w-full sm:w-auto">
            <FiCheckCircle className="w-4 h-4 mr-2" /> Find Rank
          </EditorialButton>
        </div>

        {answer && exportBar}
        {answer && (
          <ResultBox label="Rank and reduced row echelon form">
            <div className="overflow-x-auto text-center"><BlockMath math={`\\rho(A) = ${answer.result}`} /></div>
            <MatrixView matrix={answer.rref} prefix="\operatorname{RREF}(A) = " />
          </ResultBox>
        )}
      </CalcCard>

      {answer && (
        <StepsCard title={`Row Reduction (${answer.ops.length} operations)`}>
          <MatrixView matrix={answer.A} prefix="A = " />
          {answer.ops.length === 0 && <p className="text-sm text-neutral-700 dark:text-neutral-300">No row operations needed: A is already in reduced row echelon form.</p>}
          <RowOps ops={answer.ops} />
          <Notes notes={answer.notes} />
        </StepsCard>
      )}
    </div>
  );
}
