'use client';
// The live Bessel calculator. The maths is in src/app/utils/engines/central-interpolation.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import InterpolationCalculator from '@/app/components/method/InterpolationCalculator';
import { solve } from '@/app/utils/engines/bessel';

const START = { x: '1, 2, 3, 4, 5', y: '1, 8, 27, 64, 125', at: '3.5' };

export default function BesselCalculator() {
  const [answer, setAnswer] = useState(null);
  useRecordSolve('bessel', 2, answer, () => ({ points: answer?.x?.length }));
  return <InterpolationCalculator title="Bessel Engine" mode="interpolate" button="Interpolate" solve={solve} start={START} onAnswer={setAnswer} />;
}
