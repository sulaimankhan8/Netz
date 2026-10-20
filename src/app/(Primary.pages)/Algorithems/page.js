'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Tour from '../../components/tour/Tour';
import AdSlot from '../../components/ads/AdSlot';
import { METHODS, UNITS, methodByRoute, searchText, unitById } from '../../components/algorithms/catalog';
import { getProgress, onProgressChange } from '../../components/algorithms/progress';
import { AM_FONT } from '../../components/algorithms/fonts';
import '../../components/algorithms/methods.css';

/**
 * The Algorithm hub (ALGORITHM_HUB_REDESIGN_PLAN.md, board artboards 3–4): search, unit chips,
 * each unit as its own section. A card opens the method page; "Solve" opens it on the Solve tab.
 * "Continue" and the ticks come from this device (components/algorithms/progress.js).
 */
export default function AlgorithmsPage() {
  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState('all');
  const [progress, setProgress] = useState({ last: null, done: {} });
  const searchRef = useRef(null);

  useEffect(() => {
    setProgress(getProgress());
    return onProgressChange(() => setProgress(getProgress()));
  }, []);

  // "/" jumps to the search box (not while typing somewhere else)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const sections = useMemo(
    () =>
      UNITS.filter((u) => unit === 'all' || u.id === unit)
        .map((u) => ({
          ...u,
          items: METHODS.filter((m) => m.unit === u.id && (!q || q.split(/\s+/).every((w) => searchText(m).includes(w)))),
        }))
        .filter((u) => u.items.length),
    [unit, q],
  );
  const shownCount = sections.reduce((n, s) => n + s.items.length, 0);

  const last = progress.last ? methodByRoute(progress.last.route) : null;
  const lastUnit = last ? unitById(last.unit) : null;

  return (
    <div className={`am-root ${AM_FONT}`}>
      <Tour ids={['hub']} />
      <div className="am-offset">
        <div className="am-hub">
          <div className="am-hub-wrap">
            <header className="am-hub-head">
              <div>
                <span className="am-eyebrow">Algorithms</span>
                <h1>{METHODS.length} methods. Every step shown.</h1>
                <p>Learn a method from a worked example, then solve your own question with it.</p>
              </div>
              {last && (
                <Link href={last.route} className={`am-continue am-${last.unit}`} data-tour="hub-continue">
                  <span className="am-tile" aria-hidden="true">{last.glyph}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <small>Continue where you left off</small>
                    <strong>
                      {last.name}
                      {progress.last.total > 1 && progress.last.step < progress.last.total
                        ? ` · step ${progress.last.step} of ${progress.last.total}`
                        : lastUnit
                          ? ` · Unit ${lastUnit.num}`
                          : ''}
                    </strong>
                  </span>
                  <span aria-hidden="true" style={{ color: 'var(--am-text2)', fontSize: 18 }}>›</span>
                </Link>
              )}
            </header>

            <div className="am-filters">
              <label className="am-search" data-tour="hub-search">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <span className="am-sr">Search methods</span>
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a method, a formula or a word like “root”"
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {query ? (
                  <button type="button" className="am-search-clear" onClick={() => setQuery('')}>
                    Clear
                  </button>
                ) : (
                  <kbd>/</kbd>
                )}
              </label>
              <div className="am-chips" role="group" aria-label="Units" data-tour="hub-units">
                <button type="button" className="am-chip" aria-pressed={unit === 'all'} onClick={() => setUnit('all')}>
                  All units <span className="am-chip-count">{METHODS.length}</span>
                </button>
                {UNITS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`am-chip am-${u.id}`}
                    aria-pressed={unit === u.id}
                    onClick={() => setUnit(unit === u.id ? 'all' : u.id)}
                    title={`Unit ${u.num}: ${u.name}`}
                  >
                    <span className="am-chip-dot" aria-hidden="true" />
                    {u.short}
                    <span className="am-chip-count">{METHODS.filter((m) => m.unit === u.id).length}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="am-sr" aria-live="polite">
              {shownCount} of {METHODS.length} methods shown
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} data-tour="hub-list">
              {sections.map((u) => (
                <section key={u.id} className={`am-unit am-${u.id}`} aria-labelledby={`am-unit-${u.id}`}>
                  <div className="am-unit-head">
                    <span className="am-chip-unit">Unit {u.num}</span>
                    <h2 id={`am-unit-${u.id}`}>{u.name}</h2>
                    <p>{u.lede}</p>
                  </div>
                  <div className="am-grid">
                    {u.items.map((m) => (
                      <article key={m.route} className="am-card">
                        <Link href={m.route} className="am-card-link" aria-label={`${m.name}: ${m.desc}`} />
                        <div className="am-card-top">
                          <span className="am-tile" aria-hidden="true">{m.glyph}</span>
                          <span className="am-card-text">
                            <span className="am-card-name">{m.name}</span>
                            <span className="am-card-desc">{m.desc}</span>
                          </span>
                          {progress.done[m.route] && (
                            <span className="am-done" title="Done" aria-label="Done">
                              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="am-card-foot">
                          <span className="am-mono">{m.needs}</span>
                          <Link href={`${m.route}?mode=solve`} className="am-card-solve" aria-label={`Solve with ${m.name}`}>
                            Solve →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}

              {sections.length === 0 && (
                <div className="am-empty">
                  No method matches “{query}”. Try a word like “root”, “table” or “integral”.
                </div>
              )}
            </div>

            {/* The hub's one ad, after the list (plan 6.2) */}
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HUB} />
          </div>
        </div>
      </div>
    </div>
  );
}
