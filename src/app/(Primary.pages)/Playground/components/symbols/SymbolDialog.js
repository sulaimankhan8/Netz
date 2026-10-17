'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { SymbolCell } from './SymbolMenu';
import {
  SPECIAL_CHARACTERS, VISIBLE_STAND_IN, readRecentSymbols, rememberRecentSymbol, readCustomSymbols, addCustomSymbol,
  removeCustomSymbol, parseCharacterCode, characterCode, displayName, searchSymbols,
} from '../../utils/symbols/symbols';

// The shared dialog (a bottom sheet on phones). Other Insert dialogs import it from here.
export { Dialog };

/**
 * More Symbols, as in WPS Office and Word: a Symbols tab (subset, a grid, search by name or
 * code, character code, recently used) and a Special Characters tab. Insert keeps the dialog
 * open, so several symbols can go in one after another.
 */
export default function SymbolDialog({ isMobile, onInsert, onClose }) {
  const [blocks, setBlocks] = useState(null);
  const [tab, setTab] = useState('symbols');
  const [subset, setSubset] = useState(0);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [codeBase, setCodeBase] = useState('hex');
  const [codeText, setCodeText] = useState('');
  const [recent, setRecent] = useState(() => readRecentSymbols());
  const [custom, setCustom] = useState(() => readCustomSymbols());
  const [special, setSpecial] = useState(SPECIAL_CHARACTERS[0].char);

  // The character list (about 150 KB) is loaded only now
  useEffect(() => {
    let alive = true;
    import('../../utils/symbols/symbolData.generated').then((m) => {
      if (alive) setBlocks(m.SYMBOL_BLOCKS);
    });
    return () => {
      alive = false;
    };
  }, []);

  const names = useMemo(() => {
    const map = new Map();
    if (blocks) for (const b of blocks) for (const [code, name] of b.chars) map.set(code, name);
    return map;
  }, [blocks]);

  const shown = useMemo(() => {
    if (!blocks) return [];
    if (query.trim()) return searchSymbols(blocks, query);
    return blocks[subset] ? blocks[subset].chars : [];
  }, [blocks, subset, query]);

  const choose = (char) => {
    setSelected(char);
    setCodeText(characterCode(char, codeBase));
  };

  const insert = (char) => {
    if (!char) return;
    setRecent(rememberRecentSymbol(char, recent));
    onInsert(char);
  };

  // A typed character code picks that character and shows its subset
  const typeCode = (text) => {
    setCodeText(text);
    const char = parseCharacterCode(text, codeBase);
    if (!char) return;
    setSelected(char);
    setQuery('');
    if (blocks) {
      const code = char.codePointAt(0);
      const index = blocks.findIndex((b) => b.chars.some((c) => c[0] === code));
      if (index >= 0) setSubset(index);
    }
  };

  const current = tab === 'symbols' ? selected : special;
  const selectedName = selected ? names.get(selected.codePointAt(0)) : null;
  const isCustom = selected && custom.includes(selected);

  const footer = (
    <>
      {tab === 'symbols' && (
        <button
          type="button"
          disabled={!selected}
          onClick={() => setCustom(isCustom ? removeCustomSymbol(selected, custom) : addCustomSymbol(selected, custom))}
          className="mr-auto px-3 h-9 rounded-lg border border-pg-line hover:bg-pg-tray disabled:opacity-40"
        >
          {isCustom ? 'Remove from Custom Symbols' : 'Add to Custom Symbols'}
        </button>
      )}
      <button type="button" onClick={onClose} className="px-4 h-9 rounded-lg border border-pg-line hover:bg-pg-tray">
        Close
      </button>
      <button type="button" disabled={!current} onClick={() => insert(current)} className="px-4 h-9 rounded-lg bg-pg-accent-fill text-white font-semibold hover:bg-pg-accent-fill/90 disabled:opacity-40">
        Insert
      </button>
    </>
  );

  return (
    <Dialog title="Symbol" label="More Symbols" isMobile={isMobile} onClose={onClose} footer={footer} manageFocus={false}>
      <div className="flex gap-1" role="tablist">
        {[['symbols', 'Symbols'], ['special', 'Special Characters']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`px-3 h-8 rounded-lg font-semibold ${tab === id ? 'bg-pg-ink text-pg-on-ink' : 'hover:bg-pg-tray'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'symbols' && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or code (integral, arrow, 2211)"
              aria-label="Search symbols"
              className="flex-1 h-9 px-3 rounded-lg bg-pg-tray border border-pg-line"
            />
            <label className="flex items-center gap-2">
              <span className="shrink-0">Subset:</span>
              <select
                value={subset}
                onChange={(e) => {
                  setSubset(Number(e.target.value));
                  setQuery('');
                }}
                aria-label="Subset"
                className="h-9 px-2 rounded-lg bg-pg-tray border border-pg-line max-w-[260px]"
              >
                {(blocks || []).map((b, i) => <option key={b.name} value={i}>{b.name}</option>)}
              </select>
            </label>
          </div>

          <div className={`${isMobile ? 'flex-1 min-h-[180px]' : 'h-[260px]'} overflow-y-auto overscroll-contain rounded-lg border border-pg-line p-1.5`} data-symbol-grid>
            {!blocks && <div className="p-3 text-pg-text2">Loading symbols...</div>}
            {blocks && shown.length === 0 && <div className="p-3 text-pg-text2">No symbol matches &ldquo;{query}&rdquo;.</div>}
            <div className="flex flex-wrap gap-1">
              {shown.map(([code, name]) => {
                const char = String.fromCodePoint(code);
                return (
                  <span key={code} onDoubleClick={() => insert(char)}>
                    <SymbolCell char={char} selected={selected === char} title={`${displayName(name)}  U+${characterCode(char)}`} onPick={choose} />
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-1">Recently used symbols:</div>
            <div className="flex flex-wrap gap-1 min-h-[32px]">
              {recent.length === 0 && <span className="text-pg-text2 self-center">None yet</span>}
              {recent.map((c) => <SymbolCell key={c} char={c} selected={selected === c} onPick={choose} />)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg border border-pg-line text-pg-ink" aria-hidden="true">
              {selected ? VISIBLE_STAND_IN[selected] || selected : ''}
            </span>
            <span className="flex-1 min-w-[140px] font-semibold text-pg-ink" data-symbol-name>
              {selectedName ? displayName(selectedName) : selected ? '' : 'Pick a symbol'}
            </span>
            <label className="flex items-center gap-1.5">
              <span>Character code:</span>
              <input value={codeText} onChange={(e) => typeCode(e.target.value)} aria-label="Character code" className="w-20 h-9 px-2 rounded-lg bg-pg-tray border border-pg-line font-mono uppercase" />
            </label>
            <label className="flex items-center gap-1.5">
              <span>from:</span>
              <select
                value={codeBase}
                onChange={(e) => {
                  setCodeBase(e.target.value);
                  if (selected) setCodeText(characterCode(selected, e.target.value));
                }}
                aria-label="Code from"
                className="h-9 px-2 rounded-lg bg-pg-tray border border-pg-line"
              >
                <option value="hex">Unicode (hex)</option>
                <option value="decimal">Unicode (decimal)</option>
              </select>
            </label>
          </div>
        </>
      )}

      {tab === 'special' && (
        <div className="rounded-lg border border-pg-line divide-y divide-pg-line" role="listbox" aria-label="Special Characters">
          {SPECIAL_CHARACTERS.map((s) => (
            <button
              key={s.name}
              type="button"
              role="option"
              aria-selected={special === s.char}
              onClick={() => setSpecial(s.char)}
              onDoubleClick={() => insert(s.char)}
              className={`w-full flex items-center gap-4 px-3 h-9 text-left ${special === s.char ? 'bg-pg-ink text-pg-on-ink' : 'hover:bg-pg-tray'}`}
            >
              <span className="w-8 text-center text-base">{VISIBLE_STAND_IN[s.char] || s.char}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </Dialog>
  );
}
