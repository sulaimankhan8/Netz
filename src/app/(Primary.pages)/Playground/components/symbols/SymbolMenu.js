'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { readRecentSymbols, readCustomSymbols, rememberRecentSymbol, characterCode, VISIBLE_STAND_IN } from '../../utils/symbols/symbols';

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
        selected ? 'bg-indigo-500 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 text-zinc-900 dark:text-zinc-100'
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
      className={`${
        isMobile ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl p-4 border-t' : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[440px] max-w-[var(--dock-panel-max,95vw)] max-h-[70vh] rounded-2xl p-3 border'
      } overflow-y-auto overscroll-contain bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl z-50 flex flex-col gap-2 text-xs text-zinc-700 dark:text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-150`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Symbol</span>
        <button type="button" onClick={onClose} aria-label="Close Symbol" className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {recent.length > 0 && (
        <section data-symbol-section="recent">
          <div className="px-1 py-1 mb-1 rounded bg-zinc-100 dark:bg-zinc-800/70 font-semibold">Recently Used Symbols:</div>
          <div className="flex flex-wrap gap-1">{recent.map((c) => <SymbolCell key={`r-${c}`} char={c} onPick={pick} />)}</div>
        </section>
      )}

      <section data-symbol-section="custom">
        <div className="px-1 py-1 mb-1 rounded bg-zinc-100 dark:bg-zinc-800/70 font-semibold">Custom Symbols:</div>
        <div className="flex flex-wrap gap-1">{custom.map((c) => <SymbolCell key={`c-${c}`} char={c} onPick={pick} />)}</div>
      </section>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
      <button type="button" onClick={onMoreSymbols} className="flex items-center gap-2.5 px-2 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-sm">
        <span className="w-5 text-center text-base" aria-hidden="true">Ω</span>
        More Symbols...
      </button>
      <button type="button" onClick={onNumber} className="flex items-center gap-2.5 px-2 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-sm">
        <span className="w-5 text-center text-sm font-semibold" aria-hidden="true">#</span>
        Number
      </button>
    </div>
  );
}
