'use client';

import dynamic from 'next/dynamic';
import Tour from '../../components/tour/Tour';

const PlaygroundCanvasContainer = dynamic(
  () => import('./components/PlaygroundCanvasContainer'),
  { ssr: false }
);

export default function PlaygroundPage() {
  return (
    <main className="w-full h-[100dvh] overflow-hidden overscroll-none select-none touch-none">
      <PlaygroundCanvasContainer />
      <Tour ids={['playground', 'insert']} />
    </main>
  );
}