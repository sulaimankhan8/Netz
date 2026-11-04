'use client';
// The live RK2 calculator (Heun or midpoint). The maths is in src/app/utils/engines/ode-methods.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import OdeCalculator from '@/app/components/method/OdeCalculator';
import { solve } from '@/app/utils/engines/rk2';

const START = { f: 'x + y', x0: '0', y0: '1', h: '0.1', xn: '0.2', variant: 'heun' };
const COLUMNS = [
  { key: 'n', label: 'n', bold: true }, { key: 'x', label: 'xₙ' }, { key: 'y', label: 'yₙ' },
  { key: 'k1', label: 'k₁ = f(xₙ, yₙ)' }, { key: 'k2', label: 'k₂' }, { key: 'yNext', label: 'yₙ₊₁', highlight: true },
];

export default function Rk2Calculator() {
  const [answer, setAnswer] = useState(null);
  useRecordSolve('rk2', 4, answer, () => ({ fn: answer?.fn }));
  return (
    <OdeCalculator
      onAnswer={(r, v) => setAnswer(r && { ...r, fn: v.f })} title="RK2 Engine" solve={solve} start={START} columns={COLUMNS}
      toRow={(r) => ({ n: r.n, x: r.x, y: r.y, k1: r.k1, k2: r.k2, yNext: r.yNext })}
      variants={[{ value: 'heun', label: 'Heun (improved Euler)' }, { value: 'midpoint', label: 'Midpoint' }]}
    />
  );
}
