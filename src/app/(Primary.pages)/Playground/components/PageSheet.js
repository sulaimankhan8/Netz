'use client';

import React, { useMemo, useRef, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Dialog, TOUCH_TARGET } from './ui/Dialog';
import { buildPageSvg, getPageBounds, shapeRects } from '../utils/pageSvg';
import { UI } from '../utils/uiText';

// Thumbnails are cached per page object: a page that changes is a new object (pages are never
// changed in place), so a changed page draws a new thumbnail and the others are reused.
const thumbCache = new WeakMap();

function pageThumbnail(page) {
  if (!page) return null;
  if (thumbCache.has(page)) return thumbCache.get(page);
  const strokes = page.strokes || [];
  const shapes = page.shapes || [];
  const blockRects = (page.blocks || []).map((b) => ({ x: b.position.x, y: b.position.y, width: b.size.width, height: b.size.height }));
  const bounds = getPageBounds(strokes, [...blockRects, ...shapeRects(shapes)]);
  let url = null;
  if (bounds) {
    let svg = buildPageSvg({ strokes, shapes, bounds, background: '#FFFFFF' });
    // Blocks as plain boxes: their real look needs the live page
    const boxes = blockRects
      .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="12" fill="#EEF2FF" stroke="#C7D2FE" stroke-width="2"/>`)
      .join('');
    svg = svg.replace('</svg>', `${boxes}</svg>`);
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  thumbCache.set(page, url);
  return url;
}

/**
 * All pages at a glance: open, rename, reorder, duplicate and delete pages, and add a new one.
 * Reordering: drag a page (a press of 350 ms first on touch), or the up and down buttons.
 */
export default function PageSheet({ pages, currentPageIndex, isMobile, onClose, onSelectPage, onAddPage, onDuplicatePage, onDeletePage, onRenamePage, onMovePage }) {
  const [renaming, setRenaming] = useState(null); // page id being renamed
  const [draft, setDraft] = useState('');
  const [drag, setDrag] = useState(null); // { from, over }
  const pressRef = useRef(null);
  const thumbs = useMemo(() => pages.map(pageThumbnail), [pages]);

  const startRename = (page) => {
    setRenaming(page.id);
    setDraft(page.title || '');
  };
  const finishRename = (idx) => {
    onRenamePage(idx, draft);
    setRenaming(null);
  };

  // Drag to reorder: works with mouse, pen and finger (a finger first holds still for 350 ms,
  // so a swipe still scrolls the list)
  const rowAt = (clientY) => {
    const rows = [...document.querySelectorAll('[data-page-row]')];
    const hit = rows.findIndex((r) => {
      const box = r.getBoundingClientRect();
      return clientY >= box.top && clientY <= box.bottom;
    });
    return hit;
  };
  const onRowPointerDown = (e, idx) => {
    if (e.target.closest('button, input')) return;
    const begin = () => setDrag({ from: idx, over: idx });
    if (e.pointerType === 'touch') {
      pressRef.current = setTimeout(begin, 350);
    } else {
      begin();
    }
  };
  const onRowPointerMove = (e) => {
    if (pressRef.current && !drag) return;
    if (!drag) return;
    const over = rowAt(e.clientY);
    if (over >= 0 && over !== drag.over) setDrag({ ...drag, over });
  };
  const endDrag = () => {
    if (pressRef.current) clearTimeout(pressRef.current);
    pressRef.current = null;
    if (drag && drag.over !== drag.from) onMovePage(drag.from, drag.over);
    setDrag(null);
  };

  const small = `w-9 h-9 ${TOUCH_TARGET} flex items-center justify-center rounded-lg text-pg-text2 hover:bg-pg-tray disabled:opacity-30`;

  const footer = (
    <button
      type="button"
      onClick={() => {
        onAddPage();
        onClose();
      }}
      className="flex items-center gap-1.5 px-4 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] rounded-xl bg-pg-accent-fill hover:bg-pg-accent-fill/90 text-white text-xs font-semibold"
    >
      <FiPlus className="w-4 h-4" aria-hidden="true" />
      {UI.addPage}
    </button>
  );

  return (
    <Dialog title={UI.pages} isMobile={isMobile} onClose={onClose} footer={footer} width="w-[520px]">
      <ol className="flex flex-col gap-2" onPointerMove={onRowPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag}>
        {pages.map((page, idx) => {
          const open = idx === currentPageIndex;
          const dropHere = drag && drag.over === idx && drag.from !== idx;
          return (
            <li
              key={page.id}
              data-page-row
              onPointerDown={(e) => onRowPointerDown(e, idx)}
              className={`flex items-center gap-3 p-2 rounded-xl border select-none touch-pan-y ${
                open ? 'border-pg-ink bg-pg-tray' : 'border-pg-line'
              } ${dropHere ? 'ring-2 ring-pg-accent' : ''} ${drag && drag.from === idx ? 'opacity-50' : ''}`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectPage(idx);
                  onClose();
                }}
                aria-label={`Open ${page.title || `Page ${idx + 1}`}`}
                aria-current={open ? 'page' : undefined}
                className="w-20 h-14 shrink-0 rounded-lg border border-pg-line bg-white overflow-hidden flex items-center justify-center"
              >
                {thumbs[idx] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbs[idx]} alt="" className="max-w-full max-h-full object-contain" draggable={false} />
                ) : (
                  <span className="text-pg-cap text-pg-text2">Empty</span>
                )}
              </button>

              <div className="flex-1 min-w-0">
                {renaming === page.id ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => finishRename(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRename(idx);
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setRenaming(null);
                      }
                    }}
                    aria-label="Page name"
                    maxLength={60}
                    className="w-full px-2 min-h-[36px] [@media(pointer:coarse)]:min-h-[44px] rounded-lg border border-pg-accent bg-pg-surface text-sm text-pg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-accent"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startRename(page)}
                    title="Rename"
                    className="max-w-full min-h-[36px] [@media(pointer:coarse)]:min-h-[44px] px-2 -mx-2 rounded-lg text-left text-sm font-semibold text-pg-ink truncate hover:bg-pg-tray"
                  >
                    {page.title || `Page ${idx + 1}`}
                  </button>
                )}
                <div className="text-[12px] text-pg-text2">{open ? 'Open now' : `Page ${idx + 1} of ${pages.length}`}</div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" onClick={() => onMovePage(idx, idx - 1)} disabled={idx === 0} aria-label={`Move ${page.title} up`} title="Move up" className={small}>
                  <FiArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => onMovePage(idx, idx + 1)} disabled={idx === pages.length - 1} aria-label={`Move ${page.title} down`} title="Move down" className={small}>
                  <FiArrowDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => onDuplicatePage(idx)} aria-label={`Duplicate ${page.title}`} title={UI.duplicatePage} className={small}>
                  <FiCopy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePage(idx)}
                  disabled={pages.length <= 1}
                  aria-label={`Delete ${page.title}`}
                  title={UI.deletePage}
                  className={`${small} hover:text-pg-danger`}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </Dialog>
  );
}
