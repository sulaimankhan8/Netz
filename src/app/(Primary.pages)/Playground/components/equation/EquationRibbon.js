'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { STRUCTURES, SYMBOL_PALETTES, templatePreview } from '../../utils/equations/equationTemplates';
import { latexForSymbol } from '../../utils/symbols/symbols';
import { COMMON_EQUATIONS } from '../../utils/equations/commonEquations';
import KatexView from './KatexView';
import CommonEquationList from './CommonEquationList';

// Ribbon buttons keep the cursor in the equation: a mouse press does not move the focus
const keepFocus = (e) => {
  if (e.pointerType === 'mouse') e.preventDefault();
};

/** A gallery opened from a ribbon button, placed by the button and kept on screen. */
function GalleryPopover({ anchor, title, onClose, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 8, top: 8 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const below = r.bottom + 6;
    const top = below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 6) : below;
    setPos({ left: Math.max(8, Math.min(window.innerWidth - w - 8, r.left)), top });
  }, [anchor]);

  useEffect(() => {
    const outside = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !(anchor && anchor.contains(e.target))) onClose();
    };
    const key = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('pointerdown', outside, true);
    window.addEventListener('keydown', key, true);
    return () => {
      window.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('keydown', key, true);
    };
  }, [anchor, onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      data-equation-gallery-popover={title}
      style={pos}
      className="fixed z-[75] w-[440px] max-w-[calc(100vw-16px)] max-h-[60vh] overflow-y-auto overscroll-contain p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-xs text-zinc-700 dark:text-zinc-300"
      onPointerDown={keepFocus}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{title}</span>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <FiX className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>,
    document.body
  );
}

/**
 * The equation ribbon, as in the Equation Tools tab of WPS Office and Word: Equation (the
 * Common Equations: Math, Physics, Chemistry), Professional / Linear (the visual editor or its
 * LaTeX), symbol palettes, and the structure galleries, each ending with common examples.
 * Picking a structure or symbol calls onInsert with LaTeX in which #? marks each box to fill in;
 * picking a common equation calls onInsertEquation with it.
 */
export default function EquationRibbon({ linear, onToggleLinear, onInsert, onInsertEquation }) {
  const [open, setOpen] = useState(null); // structure id, 'symbols', 'equations', or null
  const [anchor, setAnchor] = useState(null);
  const [palette, setPalette] = useState(SYMBOL_PALETTES[0].id);
  const [subject, setSubject] = useState(COMMON_EQUATIONS[0].id);
  const close = () => setOpen(null);

  const toggle = (id, e) => {
    if (open === id) {
      close();
      return;
    }
    setAnchor(e.currentTarget);
    setOpen(id);
  };
  const pick = (latex) => {
    onInsert(latex);
    close();
  };

  const structure = STRUCTURES.find((s) => s.id === open);
  const symbols = SYMBOL_PALETTES.find((p) => p.id === palette);

  return (
    <div className="flex items-center gap-1 overflow-x-auto overscroll-contain pb-1 -mx-1 px-1" role="toolbar" aria-label="Equation Tools" data-equation-ribbon>
      {onInsertEquation && (
        <button
          type="button"
          onPointerDown={keepFocus}
          onClick={(e) => toggle('equations', e)}
          aria-expanded={open === 'equations'}
          title="Equation: common equations (Math, Physics, Chemistry)"
          aria-label="Equation"
          data-equation-tool="equations"
          className={`shrink-0 h-9 px-2.5 rounded-lg flex items-center gap-1 border text-[11px] font-semibold ${open === 'equations' ? 'bg-indigo-500 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'}`}
        >
          <span className="text-sm font-serif italic font-normal" aria-hidden="true">π</span>
          Equation
          <span className="text-[9px]" aria-hidden="true">▾</span>
        </button>
      )}
      <button
        type="button"
        onPointerDown={keepFocus}
        onClick={onToggleLinear}
        aria-pressed={linear}
        title={linear ? 'Professional: edit the equation as it looks' : 'Linear: edit the equation as LaTeX'}
        className={`shrink-0 h-9 px-2.5 rounded-lg text-[11px] font-semibold border ${linear ? 'bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
      >
        {linear ? 'LaTeX' : 'Visual'}
      </button>
      <button
        type="button"
        onPointerDown={keepFocus}
        onClick={(e) => toggle('symbols', e)}
        aria-expanded={open === 'symbols'}
        title="Symbols"
        data-equation-tool="symbols"
        className={`shrink-0 h-9 px-2.5 rounded-lg text-sm border ${open === 'symbols' ? 'bg-indigo-500 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
      >
        ±∞
      </button>
      {STRUCTURES.map((s) => (
        <button
          key={s.id}
          type="button"
          onPointerDown={keepFocus}
          onClick={(e) => toggle(s.id, e)}
          aria-expanded={open === s.id}
          title={s.label}
          aria-label={s.label}
          data-equation-tool={s.id}
          className={`shrink-0 h-9 min-w-[44px] px-2 rounded-lg flex items-center justify-center border text-[11px] ${open === s.id ? 'bg-indigo-500 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'}`}
        >
          <span className="scale-[0.8] origin-center pointer-events-none">
            <KatexView latex={s.icon} />
          </span>
        </button>
      ))}

      {open === 'symbols' && (
        <GalleryPopover anchor={anchor} title="Symbols" onClose={close}>
          <div className="flex flex-wrap gap-1 mb-2">
            {SYMBOL_PALETTES.map((p) => (
              <button key={p.id} type="button" onClick={() => setPalette(p.id)} aria-pressed={palette === p.id} className={`h-8 px-2 rounded-lg ${palette === p.id ? 'bg-indigo-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {[...symbols.symbols].map((ch) => (
              <button key={ch} type="button" onClick={() => pick(latexForSymbol(ch))} title={ch} data-equation-symbol={ch} className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-base text-zinc-900 dark:text-zinc-100">
                {ch}
              </button>
            ))}
          </div>
        </GalleryPopover>
      )}

      {open === 'equations' && (
        <GalleryPopover anchor={anchor} title="Common Equations" onClose={close}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1" role="tablist" aria-label="Subject">
              {COMMON_EQUATIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={subject === c.id}
                  onClick={() => setSubject(c.id)}
                  data-equation-subject-tab={c.id}
                  className={`h-8 px-3 rounded-lg font-semibold ${subject === c.id ? 'bg-indigo-500 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <CommonEquationList
              subject={subject}
              listClassName="max-h-[40vh]"
              onPick={(latex) => {
                onInsertEquation(latex);
                close();
              }}
            />
          </div>
        </GalleryPopover>
      )}

      {structure && (
        <GalleryPopover anchor={anchor} title={structure.label} onClose={close}>
          <div className="flex flex-col gap-3">
            {structure.groups.map((g) => (
              <section key={g.label}>
                <div className="font-semibold text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">{g.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => pick(item.latex)}
                      title={item.name}
                      aria-label={item.name}
                      data-equation-template={item.name}
                      className="min-w-[56px] min-h-[48px] px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-center text-zinc-900 dark:text-zinc-100"
                    >
                      <span className="pointer-events-none">
                        <KatexView latex={templatePreview(item.latex)} />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </GalleryPopover>
      )}
    </div>
  );
}
