'use client';
// The live area & perimeter calculator. The maths is in src/app/utils/engines/area-perimeter.js.
import React, { useState } from 'react';
import { useRecordSolve } from '@/app/utils/activity';
import ShapeCalculator from '@/app/components/method/ShapeCalculator';
import { solve, SHAPES_2D } from '@/app/utils/engines/area-perimeter';

const START = { shape: 'triangle-sss', values: { a: '13', b: '14', c: '15' } };

export default function AreaPerimeterCalculator() {
  const [answer, setAnswer] = useState(null);
  useRecordSolve('area-perimeter', 9, answer, () => ({ shape: answer?.shape }));
  return <ShapeCalculator title="Area & Perimeter Engine" shapes={SHAPES_2D} solve={solve} start={START} onAnswer={setAnswer} />;
}
