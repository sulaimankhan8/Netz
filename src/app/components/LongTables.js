'use client';

import { useEffect } from 'react';

const LONG = 30; // tables with more body rows than this are collapsed

/**
 * Long result tables on the method pages (iteration logs, Simpson grids, ODE steps) could run to
 * hundreds of rows: a 1,000-row grid made a 33,600px-tall phone page. Any table with more than
 * 30 rows shows its first 15 and last 5 rows (CSS in alg.css), with a "Show all N rows" button after it.
 * Works on every page without touching the tables themselves; the button sits outside them.
 */
export default function LongTables() {
  useEffect(() => {
    let frame = 0;
    let idle = 0;
    let ready = false;

    const label = (table) => {
      const n = table.tBodies[0]?.rows.length || 0;
      return table.classList.contains('alg-rows-open') ? 'Show fewer rows' : `Show all ${n.toLocaleString('en-US')} rows`;
    };

    const run = () => {
      frame = 0;
      const live = new Set();
      document.querySelectorAll('.alg-body table').forEach((table) => {
        const n = table.tBodies[0]?.rows.length || 0;
        if (n <= LONG) {
          table.classList.remove('alg-rows-collapsed', 'alg-rows-open');
          return;
        }
        table.classList.add('alg-rows-collapsed');
        const host = table.closest('.overflow-x-auto') || table;
        let btn = host.nextElementSibling;
        if (!btn || !btn.classList.contains('alg-rows-toggle')) {
          btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'alg-rows-toggle';
          host.insertAdjacentElement('afterend', btn);
        }
        btn.__table = table;
        const text = label(table);
        if (btn.textContent !== text) btn.textContent = text;
        btn.setAttribute('aria-expanded', String(table.classList.contains('alg-rows-open')));
        live.add(btn);
      });
      // Buttons whose table was redrawn short or removed
      document.querySelectorAll('.alg-rows-toggle').forEach((btn) => {
        if (!live.has(btn)) btn.remove();
      });
    };
    const schedule = () => {
      if (ready && !frame) frame = requestAnimationFrame(run);
    };

    const onClick = (e) => {
      const btn = e.target instanceof Element ? e.target.closest('.alg-rows-toggle') : null;
      if (!btn || !btn.__table) return;
      const table = btn.__table;
      const opening = !table.classList.contains('alg-rows-open');
      table.classList.toggle('alg-rows-open', opening);
      btn.textContent = label(table);
      btn.setAttribute('aria-expanded', String(opening));
      // Collapsing a long list: bring the table top back into view instead of leaving the reader far below it
      if (!opening) (table.closest('.overflow-x-auto') || table).scrollIntoView({ block: 'nearest' });
    };

    const start = () => {
      const go = () => { ready = true; schedule(); };
      idle = window.requestIdleCallback ? window.requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 300);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', onClick);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', start);
      if (frame) cancelAnimationFrame(frame);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  return null;
}
