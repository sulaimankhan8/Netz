'use client';

import dynamic from 'next/dynamic';

const HandwritingCollector = dynamic(
  () => import('../components/HandwritingCollector'),
  { ssr: false }
);

export default function HandwritingCollectPage() {
  return <HandwritingCollector />;
}
