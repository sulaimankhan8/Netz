'use client';
// The live volume & surface area calculator. The maths is in src/app/utils/engines/volume-surface-area.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import ShapeCalculator from '@/app/components/method/ShapeCalculator';
import { solve, SHAPES_3D } from '@/app/utils/engines/volume-surface-area';

const START = { shape: 'cylinder', values: { r: '7', h: '10' }, pi: '22/7' };

export default function VolumeSurfaceAreaCalculator() {
  const [answer, setAnswer] = useState(null);
  useRecordSolve('volume-surface-area', 9, answer, () => ({ shape: answer?.shape }));
  return <ShapeCalculator title="Volume & Surface Area Engine" shapes={SHAPES_3D} solve={solve} start={START} onAnswer={setAnswer} />;
}
