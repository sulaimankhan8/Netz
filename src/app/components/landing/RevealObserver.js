'use client';

import { useEffect } from 'react';

/**
 * Fades blocks marked data-reveal in once, the first time they scroll into view (320 ms, 12 px
 * rise; see landing.css). Blocks already on screen are shown at once, and nothing is hidden until
 * this has run, so the page reads fine without JavaScript or with "reduce motion".
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.querySelector('.ld-root');
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const blocks = Array.from(root.querySelectorAll('[data-reveal]'));
    const pending = [];
    blocks.forEach((block) => {
      const rect = block.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) block.classList.add('is-in');
      else pending.push(block);
    });
    root.classList.add('ld-reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    pending.forEach((block) => observer.observe(block));

    return () => {
      observer.disconnect();
      root.classList.remove('ld-reveal-ready');
      blocks.forEach((block) => block.classList.add('is-in'));
    };
  }, []);

  return null;
}
