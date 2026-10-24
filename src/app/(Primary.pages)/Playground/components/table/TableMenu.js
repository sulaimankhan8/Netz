'use client';

import React, { useState } from 'react';
import { LuTable } from 'react-icons/lu';
import { MenuHeader, menuPanelClass } from '../ui/parts';
import { Dialog, TOUCH_TARGET } from '../ui/Dialog';
import { MAX_TABLE_COLS, MAX_TABLE_ROWS } from '@/app/utils/tableCore';

const GRID_ROWS = 8;
const GRID_COLS = 10;

/**
 * Insert > Table, as in WPS Office (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 6): a grid to
 * point at (or tap) the size, the size shown above it as "3 × 4 Table", then Insert Table… for an
 * exact number of rows and columns.
 */
export default function TableMenu({ isMobile, onInsert, onInsertDialog, onClose }) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  const label = hover.r && hover.c ? `${hover.r} × ${hover.c} Table` : 'Insert Table';
  const cell = isMobile ? 28 : 20;

  return (
    <div
      role="dialog"
      aria-label="Table"
      data-table-menu
      className={`${menuPanelClass(isMobile, 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[var(--dock-panel-max,95vw)] rounded-2xl p-3 border')} z-50 flex flex-col gap-2`}
    >
      <MenuHeader title="Table" onClose={onClose} isMobile={isMobile} />
      <p className="m-0 text-pg-label font-semibold text-pg-ink" aria-live="polite">
        {label}
      </p>
      <div
        className="grid gap-[3px] self-start"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, ${cell}px)` }}
        onPointerLeave={() => setHover({ r: 0, c: 0 })}
        role="grid"
        aria-label="Table size"
      >
        {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => {
          const r = Math.floor(i / GRID_COLS) + 1;
          const c = (i % GRID_COLS) + 1;
          const on = r <= hover.r && c <= hover.c;
          return (
            <button
              key={i}
              type="button"
              data-table-size={`${r}x${c}`}
              aria-label={`${r} × ${c} table`}
              onPointerEnter={() => setHover({ r, c })}
              onFocus={() => setHover({ r, c })}
              onClick={() => onInsert(r, c)}
              className={`rounded-[3px] border ${on ? 'bg-pg-accent-tint border-pg-accent' : 'bg-pg-surface border-pg-line'}`}
              style={{ width: cell, height: cell }}
            />
          );
        })}
      </div>
      <button type="button" onClick={onInsertDialog} className={`flex items-center gap-2.5 px-2 min-h-[40px] ${TOUCH_TARGET} rounded-lg text-left text-pg-body font-medium text-pg-ink hover:bg-pg-tray`}>
        <LuTable className="w-[18px] h-[18px] text-pg-text2" aria-hidden="true" />
        Insert Table…
      </button>
    </div>
  );
}

/** Insert Table…: exact numbers of columns and rows (WPS asks for columns first). */
export function InsertTableDialog({ isMobile, onInsert, onClose }) {
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);
  const [header, setHeader] = useState(true);
  const clamp = (v, max) => Math.max(1, Math.min(max, Math.round(Number(v) || 1)));
  const field = 'w-24 h-11 px-3 rounded-xl border border-pg-line bg-pg-surface text-pg-body text-pg-ink tabular-nums outline-none focus:border-pg-accent';

  return (
    <Dialog
      title="Insert Table"
      isMobile={isMobile}
      onClose={onClose}
      width="w-[380px]"
      fullHeight={false}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl bg-pg-tray text-pg-ink font-semibold">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onInsert(clamp(rows, MAX_TABLE_ROWS), clamp(cols, MAX_TABLE_COLS), header);
              onClose();
            }}
            className="h-11 px-4 rounded-xl bg-pg-ink text-pg-on-ink font-semibold"
          >
            OK
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between gap-3 text-pg-body text-pg-ink">
          Number of columns
          <input type="number" min={1} max={MAX_TABLE_COLS} value={cols} onChange={(e) => setCols(e.target.value)} className={field} />
        </label>
        <label className="flex items-center justify-between gap-3 text-pg-body text-pg-ink">
          Number of rows
          <input type="number" min={1} max={MAX_TABLE_ROWS} value={rows} onChange={(e) => setRows(e.target.value)} className={field} />
        </label>
        <label className="flex items-center gap-2.5 text-pg-body text-pg-ink min-h-[44px]">
          <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} className="w-5 h-5" />
          First row is a header
        </label>
      </div>
    </Dialog>
  );
}
