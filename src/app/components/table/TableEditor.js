'use client';

import { useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { LuAlignCenter, LuAlignLeft, LuAlignRight, LuColumns, LuHeading, LuRows, LuTrash2 } from 'react-icons/lu';
import { colCount, insertCol, insertRow, removeCol, removeRow, setAlign, setCell } from '@/app/utils/tableCore';

/**
 * The table editor shared by the Notes Table block and the Playground Table block
 * (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, steps 5 and 6).
 *
 * Tap a cell to type. Tab and Enter move on (a new row appears after the last one); Shift+Enter
 * starts a new line in the cell. `$…$` in a cell shows as maths when the cell is not being edited.
 * The bar above the table works on the row and column of the cell you are in. Wide tables scroll
 * sideways inside the block, never the page.
 *
 * tone: 'nt' (Notes colours) or 'pg' (Playground colours).
 */

const TONES = {
  nt: {
    line: 'border-nt-line',
    head: 'bg-nt-tray font-semibold',
    text: 'text-nt-ink',
    muted: 'text-nt-text2',
    btn: 'inline-flex items-center gap-1.5 h-9 [@media(pointer:coarse)]:h-11 px-2.5 rounded-lg text-[13px] font-medium text-nt-ink bg-nt-tray hover:bg-nt-line disabled:opacity-40',
    focus: 'outline outline-2 -outline-offset-2 outline-nt-accent',
  },
  pg: {
    line: 'border-pg-line',
    head: 'bg-pg-tray font-semibold',
    text: 'text-pg-ink',
    muted: 'text-pg-text2',
    btn: 'inline-flex items-center gap-1.5 h-9 [@media(pointer:coarse)]:h-11 px-2.5 rounded-lg text-[13px] font-medium text-pg-ink bg-pg-tray hover:bg-pg-line disabled:opacity-40',
    focus: 'outline outline-2 -outline-offset-2 outline-pg-accent',
  },
};

const ALIGN_CLASS = { left: 'text-left', center: 'text-center', right: 'text-right' };

/** Cell text with $…$ shown as maths (KaTeX escapes everything else it is given). */
export function CellText({ value, muted }) {
  const parts = String(value || '').split(/(\$[^$]+\$)/g);
  if (!value) return <span className={`${muted} select-none`}>&nbsp;</span>;
  return (
    <>
      {parts.map((part, i) =>
        /^\$[^$]+\$$/.test(part) ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(1, -1), { throwOnError: false, displayMode: false }) }} />
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        )
      )}
    </>
  );
}

export default function TableEditor({ table, onChange, readOnly = false, tone = 'nt', label = 'Table', compact = false }) {
  const t = TONES[tone] || TONES.nt;
  const [focus, setFocus] = useState(null); // { r, c }
  const [editing, setEditing] = useState(null); // { r, c }
  const wrapRef = useRef(null);
  const cols = colCount(table);
  const rows = table.rows || [];

  const focusCell = (r, c) => {
    setFocus({ r, c });
    setEditing({ r, c });
    requestAnimationFrame(() => {
      wrapRef.current?.querySelector(`[data-cell="${r}-${c}"] textarea`)?.focus();
    });
  };

  const move = (r, c, dr, dc) => {
    let nr = r + dr;
    let nc = c + dc;
    if (nc >= cols) {
      nc = 0;
      nr += 1;
    }
    if (nr >= rows.length) {
      onChange(insertRow(table));
    }
    focusCell(Math.max(0, nr), Math.max(0, nc));
  };

  const cur = focus || { r: rows.length - 1, c: cols - 1 };
  const curAlign = table.align?.[cur.c] || 'left';
  const nextAlign = { left: 'center', center: 'right', right: 'left' }[curAlign];
  const AlignIcon = { left: LuAlignLeft, center: LuAlignCenter, right: LuAlignRight }[curAlign];

  return (
    <div ref={wrapRef} className={`flex flex-col gap-2 ${t.text}`}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label={`${label} tools`}>
          <button type="button" className={t.btn} onClick={() => onChange(insertRow(table, cur.r + 1))} title="Add a row below" aria-label="Add a row below">
            <LuRows className="w-4 h-4" aria-hidden="true" />
            {!compact && 'Row'}
          </button>
          <button type="button" className={t.btn} onClick={() => onChange(insertCol(table, cur.c + 1))} title="Add a column to the right" aria-label="Add a column to the right">
            <LuColumns className="w-4 h-4" aria-hidden="true" />
            {!compact && 'Column'}
          </button>
          <button type="button" className={t.btn} aria-pressed={table.header} onClick={() => onChange({ ...table, header: !table.header })} title="First row is a header" aria-label="First row is a header">
            <LuHeading className="w-4 h-4" aria-hidden="true" />
            {!compact && 'Header'}
          </button>
          <button type="button" className={t.btn} onClick={() => onChange(setAlign(table, cur.c, nextAlign))} title={`Align this column ${nextAlign}`} aria-label={`Align column ${cur.c + 1}: now ${curAlign}`}>
            <AlignIcon className="w-4 h-4" aria-hidden="true" />
            {!compact && 'Align'}
          </button>
          <span className="flex-1" />
          <button type="button" className={t.btn} disabled={rows.length <= 1} onClick={() => {
            onChange(removeRow(table, cur.r));
            setFocus(null);
          }} title="Delete this row" aria-label={`Delete row ${cur.r + 1}`}>
            <LuTrash2 className="w-4 h-4" aria-hidden="true" />
            {!compact && 'Row'}
          </button>
          <button type="button" className={t.btn} disabled={cols <= 1} onClick={() => {
            onChange(removeCol(table, cur.c));
            setFocus(null);
          }} title="Delete this column" aria-label={`Delete column ${cur.c + 1}`}>
            <LuTrash2 className="w-4 h-4" aria-hidden="true" />
            {!compact && 'Column'}
          </button>
        </div>
      )}
      <div className="overflow-x-auto overscroll-x-contain" data-table-scroll>
        <table className="border-collapse min-w-full text-[15px]" aria-label={label}>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {Array.from({ length: cols }, (_, c) => {
                  const isHead = table.header && r === 0;
                  const Tag = isHead ? 'th' : 'td';
                  const isEditing = !readOnly && editing && editing.r === r && editing.c === c;
                  const isFocus = focus && focus.r === r && focus.c === c;
                  const align = ALIGN_CLASS[table.align?.[c]] || 'text-left';
                  return (
                    <Tag
                      key={c}
                      data-cell={`${r}-${c}`}
                      scope={isHead ? 'col' : undefined}
                      className={`border ${t.line} ${isHead ? t.head : ''} ${align} align-top min-w-[96px] p-0 ${isFocus && !readOnly ? t.focus : ''}`}
                      onClick={() => !readOnly && focusCell(r, c)}
                    >
                      {isEditing ? (
                        <textarea
                          rows={1}
                          value={row[c] || ''}
                          aria-label={`Row ${r + 1}, column ${c + 1}`}
                          onChange={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                            onChange(setCell(table, r, c, e.target.value));
                          }}
                          onFocus={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onBlur={() => setEditing(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              move(r, c, 0, e.shiftKey ? -1 : 1);
                            } else if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              move(r, c, 1, 0);
                            } else if (e.key === 'Escape') {
                              e.currentTarget.blur();
                            }
                            e.stopPropagation();
                          }}
                          className={`block w-full resize-none overflow-hidden bg-transparent outline-none px-2.5 py-2 ${align} ${isHead ? 'font-semibold' : ''}`}
                        />
                      ) : (
                        <div className={`px-2.5 py-2 min-h-[40px] ${readOnly ? '' : 'cursor-text'}`} tabIndex={readOnly ? undefined : 0} onFocus={() => !readOnly && focusCell(r, c)}>
                          <CellText value={row[c]} muted={t.muted} />
                        </div>
                      )}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
