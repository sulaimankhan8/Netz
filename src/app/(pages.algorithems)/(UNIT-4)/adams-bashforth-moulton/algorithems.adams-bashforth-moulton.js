'use client';
// The live Adams calculator. The maths is in src/app/utils/engines/ode-methods.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import OdeCalculator from '@/app/components/method/OdeCalculator';
import { solve } from '@/app/utils/engines/adams';

const START = { f: 'x + y', x0: '0', y0: '1', h: '0.1', xn: '0.4' };
const COLUMNS = [
  { key: 'n', label: 'n', bold: true }, { key: 'x', label: 'xₙ' }, { key: 'how', label: 'How' },
  { key: 'yp', label: 'Predicted yᴾ' }, { key: 'y', label: 'yₙ (corrected)', highlight: true }, { key: 'f', label: 'f(xₙ, yₙ)' }, { key: 'passes', label: 'Corrector passes' },
];

export default function AdamsCalculator() {
  const [answer, setAnswer] = useState(null);
  useRecordSolve('adams', 4, answer, () => ({ fn: answer?.fn }));
  return (
    <OdeCalculator
      onAnswer={(r, v) => setAnswer(r && { ...r, fn: v.f })} title="Adams-Bashforth-Moulton Engine" solve={solve} start={START} columns={COLUMNS}
      toRow={(r) => ({ n: r.n, x: r.x, how: r.how === 'P-C' ? 'predict + correct' : r.how, yp: r.yp, y: r.y, f: r.f, passes: r.passes })}
    />
  );
}
