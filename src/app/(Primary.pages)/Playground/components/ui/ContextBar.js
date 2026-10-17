'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

/** A button in a context bar: 36 px with a mouse, 44 px on touch. */
export const CTX_BUTTON =
  'h-9 min-w-[36px] [@media(pointer:coarse)]:min-h-[44px] [@media(pointer:coarse)]:min-w-[44px] px-2 shrink-0 inline-flex items-center justify-center gap-1.5 rounded-[10px] text-pg-label font-medium text-pg-text2 hover:bg-pg-tray hover:text-pg-ink transition-colors';

/** The line between groups in a context bar. */
export function CtxDivider() {
  return <span aria-hidden="true" className="w-px h-6 bg-pg-line mx-1 shrink-0" />;
}

/**
 * The one floating bar for whatever is selected on the page (PLAYGROUND_VISUAL_REDESIGN_PLAN.md,
 * step 6.2): lassoed ink, a block, a shape. It sits above the selection with an 8 px gap, never
 * over it; with no room under the top bars it goes below; it stays 12 px inside the screen and
 * clear of the top bars (top) and the dock (bottom).
 *
 * box: the selection on screen { minX, minY, maxX, maxY }; viewport: { width, height }.
 * below: a second row under the buttons (a reading's ⋯ menu).
 */
export default function ContextBar({ box, viewport, label, top = 84, bottom = 96, below = null, children, className = '' }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Measured when it appears and whenever its contents change size (a reading arrives, a menu opens)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () =>
      setSize((prev) => (prev.w === el.offsetWidth && prev.h === el.offsetHeight ? prev : { w: el.offsetWidth, h: el.offsetHeight }));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const gap = 8;
  let y = box.minY - gap - size.h;
  if (y < top) y = box.maxY + gap;
  if (y + size.h > viewport.height - bottom) y = Math.max(top, viewport.height - bottom - size.h);
  const x = Math.max(12, Math.min(viewport.width - size.w - 12, box.minX));

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      data-context-bar
      style={{ transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)`, visibility: size.w ? 'visible' : 'hidden' }}
      className={`absolute top-0 left-0 z-30 flex flex-col gap-1 p-1 max-w-[calc(100vw-24px)] rounded-[14px] bg-pg-surface border border-pg-line shadow-pg-bar text-pg-label select-none pointer-events-auto ${className}`}
    >
      <div className="flex items-center gap-0.5 min-w-0">{children}</div>
      {below}
    </div>
  );
}
