'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import AdSlot from '../ads/AdSlot';
import { PROGRESS_EVENT } from '../../utils/progress/engine';
import { methodByRoute, methodsInUnit, neighbours, unitById } from './catalog';
import { getProgress, markDone, onProgressChange, rememberVisit, setShowAll } from './progress';
import { AM_FONT } from './fonts';
import { EXPORT_INPUTS_EVENT, currentExportInputs } from '../../utils/codeExport/inputs';
import { escapeTex, solverPanelToTex, slugFile } from '../../utils/latexExport';
import './methods.css';

/**
 * The frame every method page sits in (board artboards 5–7): a top bar with the way back to the
 * hub, the unit, Learn / Solve and previous / next; a rail with "on this page" and the unit's other
 * methods; the method's name; then either the worked example (Learn) or the calculator (Solve).
 *
 *   <MethodShell route="/bisection-method" steps={6} solve={<BisectionMethod />}>
 *     …intro, formula, <Step n={1} title="…">…</Step> … <StepControls /> <StepsDone>…</StepsDone>
 *   </MethodShell>
 *
 * The calculator is mounted the first time Solve opens and then kept (hidden, not unmounted), so
 * switching back and forth keeps its inputs and result. `?mode=solve` opens on Solve.
 */

const ProExportDialog = dynamic(() => import('../export/ProExportDialog'), { ssr: false });

// How each shared input is named in the LaTeX file
const INPUT_LABELS = {
  f: 'Function', g: 'g(x)', a: 'a', b: 'b', tol: 'Tolerance', x0: '$x_0$', x1: '$x_1$', y0: '$y_0$', h: 'Step $h$', xn: 'Target $x$',
  n: 'Strips $n$', points: 'Points', maxIter: 'Most iterations', at: 'Interpolate at $x$', x: '$x$ values', y: '$y$ values',
  mean: 'Sample mean', mu: 'Population mean', sigma: 'Standard deviation', data: 'Sample', observed: 'Observed', expected: 'Expected',
  s1: 'Sample 1', s2: 'Sample 2', model: 'Model', A: 'Augmented matrix',
};

function inputsForTex(raw) {
  if (!raw) return [];
  return Object.entries(raw)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => {
      let value;
      if (k === 'A' && Array.isArray(v)) value = `$\\begin{bmatrix}${v.map((r) => r.map((c) => escapeTex(c)).join(' & ')).join(' \\\\ ')}\\end{bmatrix}$`;
      else if (Array.isArray(v)) value = escapeTex(v.join(', '));
      else if (k === 'f' || k === 'g') value = `\\texttt{${escapeTex(v)}}`;
      else value = escapeTex(v);
      return [INPUT_LABELS[k] || escapeTex(k), value];
    });
}

const StepsContext = createContext({ shown: 0, total: 0, reveal: () => {}, current: 0 });

export function useSteps() {
  return useContext(StepsContext);
}

/** One step of the worked example. Its body shows once the step is reached. */
export function Step({ n, title, children }) {
  const { shown, total, reveal } = useSteps();
  const open = n <= shown;
  const current = n === shown && shown < total;
  const state = current ? 'is-open is-current' : open ? 'is-open' : 'is-later';
  return (
    <section id={`am-step-${n}`} className={`am-step ${state}`} aria-label={`Step ${n}: ${title}`}>
      <div className="am-step-rail" aria-hidden="true">
        <span className="am-step-dot">{n}</span>
        <span className="am-step-line" />
      </div>
      <div className="am-step-card">
        {open ? (
          <h3 className="am-step-title">{title}</h3>
        ) : (
          <button type="button" className="am-step-title" onClick={() => reveal(n)}>
            {title}
          </button>
        )}
        {open && <div className="am-step-body">{children}</div>}
      </div>
    </section>
  );
}

/** "Show step k" / "Show all", kept at the bottom of the screen while steps are left. */
export function StepControls() {
  const { shown, total, reveal, showAll, stepThrough } = useSteps();
  if (!total) return null;
  if (shown >= total) {
    if (total < 2) return null;
    return (
      <div className="am-stepbar" style={{ position: 'static', background: 'transparent', borderTop: 0 }}>
        <button type="button" className="am-stepbar-again" onClick={stepThrough}>
          Go through it one step at a time
        </button>
      </div>
    );
  }
  return (
    <div className="am-stepbar" data-am-stepbar="">
      <button
        type="button"
        className="am-icon-btn"
        aria-label="Hide the last step"
        aria-disabled={shown <= 1 ? 'true' : 'false'}
        onClick={() => reveal(Math.max(1, shown - 1))}
      >
        ‹
      </button>
      <button type="button" className="am-btn am-btn-main" onClick={() => reveal(shown + 1, true)}>
        Show step {shown + 1}
      </button>
      <button type="button" className="am-btn am-btn-quiet" onClick={showAll}>
        Show all
      </button>
      <span className="am-stepbar-count">
        Step {shown} of {total}
      </span>
    </div>
  );
}

/** What comes after the last step (summary, answer): shown once every step is shown. */
export function StepsDone({ children }) {
  const { shown, total } = useSteps();
  if (total && shown < total) return null;
  return (
    <div id="am-done" className="am-step-body" style={{ scrollMarginTop: 92 }}>
      {children}
    </div>
  );
}

function ThemeButton() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // the class still changes for this visit
    }
    document.documentElement.classList.toggle('dark', next);
  };
  return (
    <button
      type="button"
      className="am-icon-btn am-bar-hide-phone"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

function MoreMenu({ onTheme, onExport }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const key = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  const fullScreen = async () => {
    setOpen(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // not allowed here (iPhone Safari): nothing to do
    }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
      setNote('Link copied');
    } catch {
      setNote('Could not copy');
    }
    setTimeout(() => {
      setNote('');
      setOpen(false);
    }, 900);
  };

  return (
    <div className="am-menu" ref={ref}>
      <button
        type="button"
        className="am-icon-btn"
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {open && (
        <div className="am-menu-pop" role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onExport(); }}>Export code or LaTeX</button>
          <button type="button" role="menuitem" onClick={fullScreen}>Full screen</button>
          <button type="button" role="menuitem" onClick={copyLink}>{note || 'Copy link'}</button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onTheme(); }}>Switch light / dark</button>
        </div>
      )}
    </div>
  );
}

export default function MethodShell({ route: routeProp, steps: total = 0, solve, children }) {
  const pathname = usePathname();
  const route = routeProp || pathname;
  const method = methodByRoute(route);
  const unit = method ? unitById(method.unit) : null;
  const { prev, next } = neighbours(method?.route);
  const siblings = method ? methodsInUnit(method.unit) : [];

  const [mode, setMode] = useState('learn');
  const [solveMounted, setSolveMounted] = useState(false);
  const [shown, setShown] = useState(total ? 1 : 0);
  const [done, setDone] = useState({});
  const mainRef = useRef(null);
  const userStepped = useRef(false);
  const [exporting, setExporting] = useState(false);
  const [exportInputs, setExportInputs] = useState(() => currentExportInputs());

  // The calculator shares its inputs for code export (utils/codeExport/inputs.js)
  useEffect(() => {
    const on = (e) => setExportInputs(e.detail);
    window.addEventListener(EXPORT_INPUTS_EVENT, on);
    return () => window.removeEventListener(EXPORT_INPUTS_EVENT, on);
  }, []);

  // Start where the person left off: ?mode=solve, the saved step, or every step if they chose that
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'solve') {
      setMode('solve');
      setSolveMounted(true);
    }
    const p = getProgress();
    if (total) {
      if (p.showAll) setShown(total);
      else if (p.last && p.last.route === method?.route && p.last.step > 1) setShown(Math.min(total, p.last.step));
    }
    setDone(p.done);
    return onProgressChange(() => setDone(getProgress().done));
  }, [total, method?.route]);

  useEffect(() => {
    if (method?.route) rememberVisit(method.route, shown, total);
  }, [method?.route, shown, total]);

  // A successful solve on this page counts the method as done
  useEffect(() => {
    if (!method?.route) return undefined;
    const onSolve = (e) => {
      if (e?.detail?.kind === 'solver.run') markDone(method.route);
    };
    window.addEventListener(PROGRESS_EVENT, onSolve);
    return () => window.removeEventListener(PROGRESS_EVENT, onSolve);
  }, [method?.route]);

  useEffect(() => {
    if (method) document.title = `${method.name} · NETZ`;
  }, [method]);

  const switchMode = useCallback((next) => {
    setMode(next);
    if (next === 'solve') setSolveMounted(true);
    try {
      const url = new URL(window.location.href);
      if (next === 'solve') url.searchParams.set('mode', 'solve');
      else url.searchParams.delete('mode');
      window.history.replaceState(window.history.state, '', url);
    } catch {
      // address stays as it was
    }
    const head = document.getElementById('am-top');
    if (head && head.getBoundingClientRect().top < 0) head.scrollIntoView({ block: 'start' });
  }, []);

  const reveal = useCallback(
    (n, scroll) => {
      const value = Math.max(1, Math.min(total, n));
      userStepped.current = true;
      setShown(value);
      if (value >= total && method?.route) markDone(method.route);
      if (scroll) {
        requestAnimationFrame(() => {
          const el = document.getElementById(value >= total ? 'am-done' : `am-step-${value}`) || document.getElementById(`am-step-${value}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    },
    [total, method?.route],
  );

  const steps = useMemo(
    () => ({
      shown,
      total,
      reveal,
      showAll: () => {
        setShowAll(true);
        reveal(total);
      },
      stepThrough: () => {
        setShowAll(false);
        setShown(1);
        document.getElementById('am-step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    }),
    [shown, total, reveal],
  );

  const toggleTheme = () => {
    const dark = !document.documentElement.classList.contains('dark');
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      // the class still changes for this visit
    }
    document.documentElement.classList.toggle('dark', dark);
  };

  const jump = (id) => (e) => {
    e.preventDefault();
    if (mode !== 'learn') switchMode('learn');
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const unitClass = method ? `am-${method.unit}` : 'am-u1';

  // Export works on the calculator, so it opens Solve first
  const openExport = () => {
    if (mode !== 'solve') switchMode('solve');
    setExporting(true);
  };

  return (
    <div className={`am-root ${AM_FONT} ${unitClass}`}>
      <div className="am-offset">
        <header className="am-bar">
          <Link href="/Algorithems" className="am-back" aria-label="All methods">
            <span aria-hidden="true">←</span>
            <span className="am-back-text">All methods</span>
          </Link>
          {unit && <span className="am-bar-unit">Unit {unit.num} · {unit.name}</span>}
          <span className="am-bar-title">{method?.name}</span>
          <div className="am-bar-spacer" />
          <div className="am-seg" role="tablist" aria-label="Learn or solve">
            <button type="button" role="tab" aria-selected={mode === 'learn'} aria-controls="am-learn" onClick={() => switchMode('learn')} data-tour="am-learn-tab">
              Learn
            </button>
            <button type="button" role="tab" aria-selected={mode === 'solve'} aria-controls="am-solve" onClick={() => switchMode('solve')} data-tour="am-solve-tab">
              Solve
            </button>
          </div>
          <div className="am-bar-spacer" />
          {prev ? (
            <Link href={prev.route} className="am-icon-btn am-bar-hide-phone" aria-label={`Previous: ${prev.name}`} title={`Previous: ${prev.name}`}>
              ‹
            </Link>
          ) : (
            <span className="am-icon-btn am-bar-hide-phone" aria-disabled="true">‹</span>
          )}
          {next && (
            <Link href={next.route} className="am-next-link" aria-label={`Next: ${next.name}`}>
              <span>Next: {next.name}</span>
              <span aria-hidden="true" style={{ display: 'inline' }}>›</span>
            </Link>
          )}
          <button type="button" className="am-icon-btn am-bar-hide-phone am-export-btn" onClick={openExport} aria-label="Export code or LaTeX" title="Export code or LaTeX">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" /></svg>
          </button>
          <ThemeButton />
          <MoreMenu onTheme={toggleTheme} onExport={openExport} />
        </header>

        <div className="am-body">
          <aside className="am-rail" aria-label="Page and unit">
            <nav aria-label="On this page">
              <div className="am-rail-head">On this page</div>
              <a href="#am-top" onClick={jump('am-top')}>Overview</a>
              {total > 0 && <a href="#am-step-1" onClick={jump('am-step-1')}>Worked example</a>}
              {total > 0 && shown >= total && <a href="#am-done" onClick={jump('am-done')}>Answer</a>}
              <button type="button" onClick={() => switchMode('solve')}>Solve your own</button>
            </nav>
            {unit && (
              <nav aria-label={`In unit ${unit.num}`}>
                <div className="am-rail-head">In Unit {unit.num}</div>
                {siblings.map((m) => (
                  <Link key={m.route} href={m.route} aria-current={m.route === method.route ? 'page' : undefined}>
                    <span>{m.name}</span>
                    {done[m.route] && <span className="am-tick" aria-label="done">✓</span>}
                  </Link>
                ))}
              </nav>
            )}
          </aside>

          <main className="am-main" ref={mainRef}>
            <div className="am-head" id="am-top">
              {unit && <span className="am-chip-unit">Unit {unit.num} · {unit.name}</span>}
              <h1>{method?.name || 'Method'}</h1>
              {method && <p>{method.desc}</p>}
            </div>

            <StepsContext.Provider value={steps}>
              <div id="am-learn" role="tabpanel" className="am-skin" hidden={mode !== 'learn'} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {children}
              </div>
            </StepsContext.Provider>

            <div id="am-solve" role="tabpanel" className="am-skin" hidden={mode !== 'solve'}>
              {solveMounted && solve}
            </div>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ALGORITHM} className="am-ad" />

            {exporting && (
              <ExportFor
                title={method?.name || 'Method'}
                inputs={exportInputs}
                onClose={() => setExporting(false)}
              />
            )}

            {next && (
              <Link href={next.route} className="am-next-card">
                <span style={{ flex: 1 }}>
                  <small>{next.unit === method?.unit ? `Next in Unit ${unit?.num}` : `Next: Unit ${unitById(next.unit)?.num}`}</small>
                  <strong>{next.name}</strong>
                </span>
                <span aria-hidden="true" style={{ fontSize: 20 }}>→</span>
              </Link>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/** The export dialog for the open solver: code from the shared inputs, LaTeX from the Solve panel. */
function ExportFor({ title, inputs, onClose }) {
  const [codeLib, setCodeLib] = useState(null);
  useEffect(() => {
    let live = true;
    import('../../utils/codeExport').then((m) => live && setCodeLib(m));
    return () => {
      live = false;
    };
  }, []);

  const getCode = useCallback(
    (lang) => {
      if (!codeLib) throw new Error('Getting code export ready…');
      if (!inputs?.method) throw new Error('Open Solve and enter your numbers first.');
      return codeLib.generateCode(inputs.method, inputs.raw, lang);
    },
    [codeLib, inputs],
  );
  const getTex = useCallback(
    () => ({
      tex: solverPanelToTex({ title, inputs: inputsForTex(inputs?.raw), root: document.getElementById('am-solve') }),
      filename: `netz-${slugFile(title)}.tex`,
    }),
    [title, inputs],
  );

  return <ProExportDialog title={title} getCode={getCode} getTex={getTex} onClose={onClose} note="The code uses the numbers now in the calculator. The LaTeX file has your inputs and the tables shown under Solve." />;
}
