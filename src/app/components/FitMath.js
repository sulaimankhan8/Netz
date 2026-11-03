'use client';

import { useEffect } from 'react';

const PHONE = '(max-width: 639px)';
const MIN_PX = 10.5;

/** The box an equation slides in, when it is still too wide. */
function scroller(katex) {
  for (let p = katex.parentElement; p && p !== document.body; p = p.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(p).overflowX)) return p;
  }
  return null;
}

/** Marks the end of a sliding box once it is scrolled all the way, which removes its fade. */
function markEnd(box) {
  box.classList.toggle('fit-end', box.scrollLeft + box.clientWidth >= box.scrollWidth - 2);
}

/** Shrinks one display equation until it fits its box (never below MIN_PX; past that it slides, with a fade). */
function fit(katex, wide) {
  katex.style.fontSize = '';
  // A few passes: parts of an equation do not all shrink in step with the font size
  for (let pass = 0; pass < 4; pass += 1) {
    const width = katex.clientWidth;
    const needed = katex.scrollWidth;
    if (!width || needed <= width + 1) return;
    const size = parseFloat(getComputedStyle(katex).fontSize);
    if (size <= MIN_PX) break;
    katex.style.fontSize = `${Math.max(MIN_PX, Math.floor(size * (width / needed) * 0.98 * 10) / 10)}px`;
  }
  if (katex.scrollWidth > katex.clientWidth + 1) {
    const box = scroller(katex);
    if (box) wide.add(box);
  }
}

/**
 * Phones only: long equations on the method pages were cut off at the box edge.
 * Each display equation that is wider than its box is scaled down to fit.
 * Watches the page because the calculators draw their steps after a click.
 */
export default function FitMath() {
  useEffect(() => {
    const phone = window.matchMedia(PHONE);
    let frame = 0;
    let idle = 0;
    // Nothing is touched until the page has loaded and React has taken over the server HTML:
    // changing equations earlier makes React report a mismatch
    let ready = false;

    const run = () => {
      frame = 0;
      const all = document.querySelectorAll('.katex-display > .katex');
      const wide = new Set();
      if (phone.matches) all.forEach((el) => fit(el, wide));
      else all.forEach((el) => { el.style.fontSize = ''; });
      document.querySelectorAll('.fit-wide').forEach((box) => {
        if (!wide.has(box)) box.classList.remove('fit-wide', 'fit-end');
      });
      wide.forEach((box) => {
        box.classList.add('fit-wide');
        markEnd(box);
      });
    };
    // Sliding a wide equation to its end removes the fade (scroll events do not bubble, so listen in the capture phase)
    const onScroll = (e) => {
      if (e.target instanceof Element && e.target.classList.contains('fit-wide')) markEnd(e.target);
    };
    document.addEventListener('scroll', onScroll, true);
    const schedule = () => {
      if (ready && !frame) frame = requestAnimationFrame(run);
    };
    const start = () => {
      const go = () => { ready = true; schedule(); };
      idle = window.requestIdleCallback ? window.requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 300);
    };

    // Only new or removed nodes trigger a pass: the font sizes set here do not
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    phone.addEventListener('change', schedule);
    // KaTeX fonts change widths once they load
    document.fonts?.ready.then(schedule);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', start);
      phone.removeEventListener('change', schedule);
      if (frame) cancelAnimationFrame(frame);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  return null;
}
