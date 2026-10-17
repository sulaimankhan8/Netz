'use client';

import React, { useState } from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { COMMON_EQUATIONS } from '../../utils/equations/commonEquations';
import { MenuHeader, menuPanelClass, SECTION_LABEL } from '../ui/parts';
import { TOUCH_TARGET } from '../ui/Dialog';
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
  const row = `flex items-center gap-2.5 px-2 min-h-[40px] ${TOUCH_TARGET} rounded-lg text-left text-pg-body text-pg-ink`;

  const list = (
    <div className="flex flex-col gap-0.5 w-full sm:w-[220px] shrink-0">
      <button type="button" onClick={onNewEquation} className={`${row} font-medium hover:bg-pg-tray`}>
        <span className="w-6 text-center font-serif italic text-pg-text2" aria-hidden="true">π</span>
        Insert New Equation
      </button>
      <button type="button" onClick={onInsertLatex} className={`${row} font-medium hover:bg-pg-tray`}>
        <span className="w-6 text-center text-pg-cap font-bold text-pg-text2" aria-hidden="true">TeX</span>
        Insert LaTeX
      </button>
      <div className={`${SECTION_LABEL} px-2 pt-2 !mb-0.5`}>Common Equations</div>
      {COMMON_EQUATIONS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => setSubject(c.id)}
          aria-expanded={subject === c.id}
          data-equation-subject={c.id}
          className={`${row} justify-between ${subject === c.id ? 'bg-pg-tray font-semibold' : 'hover:bg-pg-tray'}`}
        >
          <span className="flex items-center gap-2.5">
            <span className="w-6 text-center text-pg-cap font-semibold text-pg-text2" aria-hidden="true">{c.id === 'math' ? 'fx' : c.id === 'physics' ? 'mc²' : 'H⁺'}</span>
            {c.label}
          </span>
          <FiChevronRight className="w-4 h-4 text-pg-text2" />
        </button>
      ))}
    </div>
  );

  const galleryPane = gallery && (
    <div className="flex flex-col gap-2 min-w-0 flex-1" data-equation-gallery={gallery.id}>
      <div className="flex items-center gap-2">
        {isMobile && (
          <button type="button" onClick={() => setSubject(null)} aria-label="Back" className={`w-9 h-9 ${TOUCH_TARGET} flex items-center justify-center rounded-lg text-pg-text2 hover:bg-pg-tray`}>
            <FiChevronLeft className="w-4 h-4" />
          </button>
        )}
        <span className="font-semibold text-pg-body text-pg-ink">Built-In: {gallery.label}</span>
      </div>
      <CommonEquationList subject={gallery.id} onPick={onInsertCommon} />
    </div>
  );

  return (
    <div
      role="dialog"
      aria-label="Equation"
      data-equation-menu
      className={`${menuPanelClass(
        isMobile,
        `absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${gallery ? 'w-[700px]' : 'w-[260px]'} max-w-[var(--dock-panel-max,95vw)] max-h-[75vh] rounded-2xl p-3 border`
      )} overflow-hidden z-50 flex flex-col gap-2`}
    >
      <MenuHeader title="Equation" onClose={onClose} isMobile={isMobile} />
      <div className="flex gap-3 min-h-0 flex-1 overflow-hidden">
        {(!isMobile || !gallery) && list}
        {galleryPane}
      </div>
    </div>
  );
}
