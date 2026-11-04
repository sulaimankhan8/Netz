'use client';
// The live Difference Table calculator. The maths is in src/app/utils/engines/central-interpolation.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import InterpolationCalculator from '@/app/components/method/InterpolationCalculator';
import { solve } from '@/app/utils/engines/difference-table';

const START = { x: '1, 2, 3, 4, 5', y: '1, 8, 27, 64, 125', notation: 'forward' };

export default function DifferenceTableCalculator() {
  const [answer, setAnswer] = useState(null);
  useRecordSolve('difference-table', 2, answer, () => ({ points: answer?.x?.length }));
  return <InterpolationCalculator title="Difference Table Engine" mode="table" button="Build Table" solve={solve} start={START} onAnswer={setAnswer} />;
}
