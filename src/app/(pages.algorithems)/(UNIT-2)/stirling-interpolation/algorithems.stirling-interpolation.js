'use client';
// The live Stirling calculator. The maths is in src/app/utils/engines/central-interpolation.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import InterpolationCalculator from '@/app/components/method/InterpolationCalculator';
import { solve } from '@/app/utils/engines/stirling';

const START = { x: '1, 2, 3, 4, 5', y: '1, 8, 27, 64, 125', at: '3.2' };

export default function StirlingCalculator() {
  const [answer, setAnswer] = useState(null);
  useRecordSolve('stirling', 2, answer, () => ({ points: answer?.x?.length }));
  return <InterpolationCalculator title="Stirling Engine" mode="interpolate" button="Interpolate" solve={solve} start={START} onAnswer={setAnswer} />;
}
