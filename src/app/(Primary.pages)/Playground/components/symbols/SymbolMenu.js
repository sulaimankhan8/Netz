'use client';

import React, { useState } from 'react';
import { readRecentSymbols, readCustomSymbols, rememberRecentSymbol, characterCode, VISIBLE_STAND_IN } from '../../utils/symbols/symbols';
import { MenuHeader, menuPanelClass, SECTION_LABEL } from '../ui/parts';

export function SymbolCell({ char, onPick, selected = false, title }) {
  return (
    <button
      type="button"
      onClick={() => onPick(char)}
      title={title || `${char}  U+${characterCode(char)}`}
      aria-label={`Symbol ${char}`}
      aria-pressed={selected || undefined}
      data-symbol={char}
      className={`w-8 h-8 flex items-center justify-center rounded-md text-lg leading-none border transition-colors ${
        selected ? 'bg-pg-ink text-pg-on-ink border-pg-ink' : 'border-pg-line hover:bg-pg-tray text-pg-ink'
      }`}
    >
      {VISIBLE_STAND_IN[char] || char}
    </button>
  );
}

/**
 * The Symbol menu, as in WPS Office: Recently Used Symbols, Custom Symbols, More Symbols...
 * and Number. A symbol goes in where the cursor was; with no cursor, into a new text box.
 */
export default function SymbolMenu({ isMobile, onInsert, onMoreSymbols, onNumber, onClose }) {
  const [recent, setRecent] = useState(() => readRecentSymbols());
  const [custom] = useState(() => readCustomSymbols());

  const pick = (char) => {
    setRecent(rememberRecentSymbol(char, recent));
    onInsert(char);
  };

  const row = 'flex items-center gap-2.5 px-2 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] rounded-lg hover:bg-pg-tray text-left text-pg-body text-pg-ink';

  return (
    <div
      role="dialog"
      aria-label="Symbol"
      data-symbol-menu
      // A mouse press here leaves the cursor where it was (in the field the symbol goes into),
      // so the field never loses it; a touch still focuses, and the insert gives it back
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse') e.preventDefault();
      }}
      className={`${menuPanelClass(isMobile, 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[440px] max-w-[var(--dock-panel-max,95vw)] max-h-[70vh] rounded-2xl p-3 border')} overflow-y-auto overscroll-contain z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150`}
    >
      <MenuHeader title="Symbol" onClose={onClose} isMobile={isMobile} />

      {recent.length > 0 && (
        <section data-symbol-section="recent">
          <div className={`${SECTION_LABEL} px-1`}>Recently Used Symbols:</div>
          <div className="flex flex-wrap gap-1">{recent.map((c) => <SymbolCell key={`r-${c}`} char={c} onPick={pick} />)}</div>
        </section>
      )}

      <section data-symbol-section="custom">
        <div className={`${SECTION_LABEL} px-1`}>Custom Symbols:</div>
        <div className="flex flex-wrap gap-1">{custom.map((c) => <SymbolCell key={`c-${c}`} char={c} onPick={pick} />)}</div>
      </section>

      <div className="h-px bg-pg-line my-1" />
      <button type="button" onClick={onMoreSymbols} className={row}>
        <span className="w-5 text-center text-base text-pg-text2" aria-hidden="true">Ω</span>
        More Symbols...
      </button>
      <button type="button" onClick={onNumber} className={row}>
        <span className="w-5 text-center text-sm font-semibold text-pg-text2" aria-hidden="true">#</span>
        Number
      </button>
    </div>
  );
}
