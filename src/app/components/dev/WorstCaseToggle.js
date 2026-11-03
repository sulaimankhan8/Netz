'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { STATES, STATE_LABELS, scenarioKey, applyScenario } from '@/app/utils/dev/worstCaseInputs';

/**
 * DEV ONLY (never rendered in production). Break-ui switch for the method calculators:
 * Demo / Worst case / Empty / One / Huge. Open a page with ?data=worst (or demo, empty, one, huge)
 * to show it. The choice is typed into the page's real inputs and the solve button is pressed,
 * so the calculator gets the data exactly as a student would give it.
 * Also exposes window.__netzWorstCase for the browser check script.
 */
export default function WorstCaseToggle() {
  const pathname = usePathname();
  const key = scenarioKey(pathname);
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!key) return undefined;
    const fromUrl = new URLSearchParams(window.location.search).get('data');
    if (!fromUrl || !STATES.includes(fromUrl)) return undefined;
    setState(fromUrl);
    window.__netzWorstCase = { key, apply: (s) => applyScenario(key, s) };
    // Let the page finish starting before typing into it
    const id = window.setTimeout(() => {
      if (fromUrl !== 'demo') applyScenario(key, fromUrl);
    }, 1500);
    return () => window.clearTimeout(id);
  }, [key]);

  if (process.env.NODE_ENV === 'production' || !key || !state) return null;

  const choose = async (next) => {
    const url = new URL(window.location.href);
    url.searchParams.set('data', next);
    if (next === 'demo') {
      // The page's own defaults: a fresh load
      window.location.assign(url.toString());
      return;
    }
    window.history.replaceState(null, '', url.toString());
    setState(next);
    setBusy(true);
    await applyScenario(key, next);
    setBusy(false);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Test data"
      style={{
        position: 'fixed', left: '50%', transform: 'translateX(-50%)',
        // Sits outside the app shell, so it cannot read --app-tab-h: clear the phone bottom buttons by hand
        bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 88 : 12, zIndex: 2147483000,
        display: 'flex', gap: 2, padding: 3, borderRadius: 999,
        background: '#d4d4d8', font: '12px/1 system-ui, sans-serif', color: '#18181b',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)', opacity: busy ? 0.6 : 1, maxWidth: 'calc(100vw - 16px)', overflowX: 'auto',
      }}
    >
      {STATES.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={state === s}
          onClick={() => choose(s)}
          style={{
            border: 0, borderRadius: 999, padding: '7px 10px', whiteSpace: 'nowrap', cursor: 'pointer',
            background: state === s ? '#ffffff' : 'transparent', fontWeight: state === s ? 600 : 400, color: 'inherit',
          }}
        >
          {STATE_LABELS[s]}
        </button>
      ))}
    </div>
  );
}
