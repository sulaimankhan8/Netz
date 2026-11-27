'use client';

import NetzLoader from '@/lib/NetzLoader';

const STEPS = [
  'Reading your input',
  'Choosing the method',
  'Running the algorithm',
  'Checking the result',
];

export default function Loading() {
  return <NetzLoader steps={STEPS} />;
}
