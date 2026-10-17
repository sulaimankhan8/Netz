'use client';

import React, { useState } from 'react';
import { Dialog } from './SymbolDialog';
import { NUMBER_FORMATS, formatNumber } from '../../utils/symbols/numberFormats';

/**
 * Insert > Symbol > Number, as in WPS Office: a number, a style (①, Ⅳ, 十五, ...), a preview.
 * A number the style cannot write says so instead of inserting something wrong.
 */
export default function NumberDialog({ isMobile, onInsert, onClose }) {
  const [value, setValue] = useState('1');
  const [style, setStyle] = useState(NUMBER_FORMATS[1].id);
  const result = formatNumber(value, style);
  const range = NUMBER_FORMATS.find((f) => f.id === style);

  const footer = (
    <>
      <button type="button" onClick={onClose} className="px-4 h-9 rounded-lg border border-pg-line hover:bg-pg-tray">
        Cancel
      </button>
      <button
        type="button"
        disabled={!result}
        onClick={() => {
          onInsert(result);
          onClose();
        }}
        className="px-4 h-9 rounded-lg bg-pg-accent-fill text-white font-semibold hover:bg-pg-accent-fill/90 disabled:opacity-40"
      >
        OK
      </button>
    </>
  );

  return (
    <Dialog title="Number" isMobile={isMobile} onClose={onClose} footer={footer} manageFocus={false}>
      <label className="flex items-center gap-2">
        <span className="w-24 shrink-0 font-semibold">Number:</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))}
          inputMode="numeric"
          autoFocus
          aria-label="Number"
          className="w-40 h-9 px-3 rounded-lg bg-pg-tray border border-pg-line tabular-nums"
        />
      </label>
      <div className="flex gap-2 items-start">
        <span className="w-24 shrink-0 font-semibold pt-2">Number type:</span>
        <div className="flex-1 grid grid-cols-2 gap-1" role="radiogroup" aria-label="Number type">
          {NUMBER_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={style === f.id}
              onClick={() => setStyle(f.id)}
              className={`h-9 px-3 rounded-lg text-left text-sm ${style === f.id ? 'bg-pg-ink text-pg-on-ink' : 'border border-pg-line hover:bg-pg-tray'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0 font-semibold">Preview:</span>
        <span className="text-2xl text-pg-ink min-h-[36px]" data-number-preview>
          {result || <span className="text-xs text-pg-danger">This style writes numbers from {range.min} to {range.max}.</span>}
        </span>
      </div>
    </Dialog>
  );
}
