'use client';
// A worked example drawn in the original method-page style (the cards of /bisection-method), from data:
//   { title?, question, given?, steps: [{ title, text?, math?: [latex], table?: { columns, rows }, after? }], answer, check? }
// Strings may hold $…$ maths and **bold**. Used where a page's example is kept in src/app/data/workedExamples/.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion } from './WorkedExample';
import { Md } from './TheoryExtras';

const stripDisplay = (s) => String(s || '').trim().replace(/^\$\$/, '').replace(/\$\$$/, '').trim();
// A table cell written **x** is highlighted, as in the original summary tables
const Cell = ({ v }) => {
  const s = String(v ?? '');
  const hi = /^\*\*.*\*\*$/.test(s);
  return <td className={`p-2 border-r last:border-r-0 border-black/15 dark:border-neutral-700 ${hi ? 'font-bold bg-[#FFE600]/20 dark:bg-amber-950/40' : ''}`}><Md>{hi ? s.slice(2, -2) : s}</Md></td>;
};

export default function DataExample({ ex }) {
  if (!ex) return null;
  return (
    <WorkedExample>
      <ExampleProblem>
        <Md>{ex.question}</Md>
        {ex.given && <span className="block mt-1 text-sm font-medium"><Md>{ex.given}</Md></span>}
      </ExampleProblem>
      {ex.steps.map((s, i) => (
        <ExampleStep key={i} n={i + 1} title={String(s.title).toUpperCase()}>
          {s.text && <StepText><Md>{s.text}</Md></StepText>}
          {s.math?.length > 0 && (
            <MathPanel>{s.math.map((m, j) => <BlockMath key={j} math={m} />)}</MathPanel>
          )}
          {s.table && (
            <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
              <table className="w-full text-center text-xs md:text-sm font-mono border-collapse">
                <thead>
                  <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white font-bold border-b border-black/30 dark:border-neutral-700">
                    {s.table.columns.map((c, j) => <th key={j} className="p-2 border-r last:border-r-0 border-black/20 dark:border-neutral-700"><Md>{c}</Md></th>)}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row, r) => (
                    <tr key={r} className="border-t border-black/15 dark:border-neutral-700">{row.map((v, j) => <Cell key={j} v={v} />)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {s.after && <StepText><Md>{s.after}</Md></StepText>}
        </ExampleStep>
      ))}
      <Conclusion result={<Md>{`$${stripDisplay(ex.answer)}$`}</Md>} math={<BlockMath math={stripDisplay(ex.answer)} />}>
        {ex.check ? <Md>{`Check: ${ex.check}`}</Md> : 'The calculator below opens on this example.'}
      </Conclusion>
    </WorkedExample>
  );
}
