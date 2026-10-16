'use client';

import React, { useState } from 'react';
import { FiX, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { COMMON_EQUATIONS } from '../../utils/equations/commonEquations';
import CommonEquationList from './CommonEquationList';

/**
 * The Equation menu, as in WPS Office: Insert New Equation, Insert LaTeX, and Common Equations
 * by subject (Math, Physics, Chemistry), each a gallery of named equations drawn as they will look.
 * On a laptop a subject's gallery opens beside the menu; on a phone it replaces it (with Back).
 * A long subject (Physics, Chemistry) is in topics, with a row of topic names that jump to each.
 */
export default function EquationMenu({ isMobile, onNewEquation, onInsertLatex, onInsertCommon, onClose }) {
  const [subject, setSubject] = useState(null);
  const gallery = subject ? COMMON_EQUATIONS.find((c) => c.id === subject) : null;

  const list = (
    <div className="flex flex-col gap-0.5 w-full sm:w-[220px] shrink-0">
      <button type="button" onClick={onNewEquation} className="flex items-center gap-2.5 px-2 h-10 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-sm font-medium">
        <span className="w-6 text-center font-serif italic" aria-hidden="true">π</span>
        Insert New Equation
      </button>
      <button type="button" onClick={onInsertLatex} className="flex items-center gap-2.5 px-2 h-10 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-sm font-medium">
        <span className="w-6 text-center text-[11px] font-bold" aria-hidden="true">TeX</span>
        Insert LaTeX
      </button>
      <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Common Equations</div>
      {COMMON_EQUATIONS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => setSubject(c.id)}
          aria-expanded={subject === c.id}
          data-equation-subject={c.id}
          className={`flex items-center justify-between gap-2 px-2 h-10 rounded-lg text-left text-sm ${subject === c.id ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          <span className="flex items-center gap-2.5">
            <span className="w-6 text-center text-xs font-semibold" aria-hidden="true">{c.id === 'math' ? 'fx' : c.id === 'physics' ? 'mc²' : 'H⁺'}</span>
            {c.label}
          </span>
          <FiChevronRight className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  const galleryPane = gallery && (
    <div className="flex flex-col gap-2 min-w-0 flex-1" data-equation-gallery={gallery.id}>
      <div className="flex items-center gap-2">
        {isMobile && (
          <button type="button" onClick={() => setSubject(null)} aria-label="Back" className="w-9 h-9 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <FiChevronLeft className="w-4 h-4" />
          </button>
        )}
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Built-In: {gallery.label}</span>
      </div>
      <CommonEquationList subject={gallery.id} onPick={onInsertCommon} />
    </div>
  );

  return (
    <div
      role="dialog"
      aria-label="Equation"
      data-equation-menu
      className={`${
        isMobile ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl p-4 border-t' : `absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${gallery ? 'w-[700px]' : 'w-[260px]'} max-w-[var(--dock-panel-max,95vw)] max-h-[75vh] rounded-2xl p-3 border`
      } overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl z-50 flex flex-col gap-2 text-xs text-zinc-700 dark:text-zinc-300`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Equation</span>
        <button type="button" onClick={onClose} aria-label="Close Equation" className="w-8 h-8 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-3 min-h-0 flex-1 overflow-hidden">
        {(!isMobile || !gallery) && list}
        {galleryPane}
      </div>
    </div>
  );
}
