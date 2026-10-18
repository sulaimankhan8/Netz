'use client';

import { useEffect } from 'react';

/**
 * One labelled AdSense block with its height reserved, so nothing on the page moves when it fills
 * (replaces the old 30-second full-screen ad). The AdSense script itself loads when the page is
 * idle (layout.js, lazyOnload); pushing before that only queues the request.
 */
export default function AdSlot() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // An ad that cannot load leaves the reserved space empty; nothing else depends on it.
    }
  }, []);

  return (
    <aside className="ld-ad" aria-label="Advertisement">
      <span className="ld-ad-label">ADVERTISEMENT</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3746721364737268"
        data-ad-slot="1328005139"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
