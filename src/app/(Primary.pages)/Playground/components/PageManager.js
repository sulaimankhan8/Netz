'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiPlus, FiChevronLeft, FiChevronRight, FiTrash2, FiCopy, FiCheck, FiMoreHorizontal, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { LuEraser } from 'react-icons/lu';
import { Popover, TOUCH_TARGET } from './ui/Dialog';
import { UI } from '../utils/uiText';

/**
 * The save status: "Saved", "Saving…" (only once a save has taken a moment, so it does not
 * flicker on every stroke) or "Couldn't save · Retry". On phones only its icon shows, unless the
 * save failed.
 */
function SaveStatus({ status, justSaved, onRetry, compact }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (status !== 'saving') {
      setSlow(false);
      return undefined;
    }
    const timer = setTimeout(() => setSlow(true), 800);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'failed') {
    return (
      <span role="alert" className="flex items-center gap-1 pl-2 pr-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[12px] font-semibold">
        <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className={compact ? 'sr-only' : ''}>{UI.saveFailed}</span>
        <button type="button" onClick={onRetry} className={`px-2.5 min-h-[32px] ${TOUCH_TARGET} rounded-full hover:bg-rose-500/10 underline underline-offset-2`}>
          {UI.retry}
        </button>
      </span>
    );
  }
  const saving = status === 'saving' && slow;
  return (
    <span
      role="status"
      title={saving ? 'Saving your changes on this device' : 'Everything is saved on this device'}
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[12px] font-semibold transition-colors ${
        saving ? 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300' : justSaved ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      }`}
    >
      {saving ? <FiLoader className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <FiCheck className="w-3.5 h-3.5" aria-hidden="true" />}
      <span className={compact ? 'sr-only' : ''}>{saving ? UI.saving : UI.saved}</span>
    </span>
  );
}

/**
 * The top bar: previous / next page, the page name (opens the page sheet), Add page, the page
 * actions (Duplicate, Clear, Delete; behind ⋯ on phones) and the save status.
 * Clear and Delete do not ask first: they offer Undo instead.
 */
export default function PageManager({
  pages = [{ id: 'page_1', title: 'Page 1' }],
  currentPageIndex = 0,
  onSelectPage,
  onAddPage,
  onClearPage,
  onDeletePage,
  onDuplicatePage,
  onOpenPages,
  onRetrySave,
  saveStatus = 'saved',
  isJustSaved = false,
  isMobile = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef(null);
  const page = pages[currentPageIndex];
  const title = page?.title || `Page ${currentPageIndex + 1}`;

  const iconButton = 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors';
  const menuItem = 'flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold text-left transition-colors';

  return (
    <div className="relative select-none">
      <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg text-xs font-medium">
        <button
          type="button"
          onClick={() => onSelectPage(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          title="Previous Page"
          aria-label="Previous page"
          className={`${iconButton} text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent`}
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {/* The page name and number: opens the page sheet */}
        <button
          type="button"
          onClick={onOpenPages}
          title="All pages: open, rename, reorder"
          aria-label={`${title}, page ${currentPageIndex + 1} of ${pages.length}. Show all pages`}
          className="min-h-[44px] px-2 rounded-xl flex flex-col items-center justify-center leading-tight hover:bg-zinc-100 dark:hover:bg-zinc-800 max-w-[38vw] sm:max-w-[200px]"
        >
          <span className="hidden sm:block max-w-full truncate font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
          <span className="font-mono text-[12px] text-zinc-600 dark:text-zinc-400">
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentPageIndex + 1}</span> / {pages.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPage(Math.min(pages.length - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === pages.length - 1}
          title="Next Page"
          aria-label="Next page"
          className={`${iconButton} text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent`}
        >
          <FiChevronRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        <button
          type="button"
          onClick={onAddPage}
          title={UI.addPage}
          aria-label={UI.addPage}
          className="flex items-center justify-center gap-1 px-3 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-semibold"
        >
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{UI.addPage}</span>
        </button>

        {!isMobile && (
          <>
            <button type="button" onClick={() => onDuplicatePage(currentPageIndex)} title={UI.duplicatePage} aria-label={UI.duplicatePage} className={`${iconButton} text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
              <FiCopy className="w-4 h-4" />
            </button>
            <button type="button" onClick={onClearPage} title={`${UI.clearPage} (ink, shapes and blocks)`} aria-label={UI.clearPage} className={`${iconButton} text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40`}>
              <LuEraser className="w-4 h-4" />
            </button>
            {pages.length > 1 && (
              <button type="button" onClick={() => onDeletePage(currentPageIndex)} title={UI.deletePage} aria-label={UI.deletePage} className={`${iconButton} text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40`}>
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {isMobile && (
          <div className="relative">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              title="Page actions"
              aria-label="Page actions"
              aria-expanded={showMenu}
              className={`${iconButton} text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
            >
              <FiMoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <Popover title="Page actions" isMobile onClose={() => setShowMenu(false)} anchorRef={menuButtonRef}>
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => { setShowMenu(false); onOpenPages(); }} className={`${menuItem} text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
                    All pages
                  </button>
                  <button type="button" onClick={() => { setShowMenu(false); onDuplicatePage(currentPageIndex); }} className={`${menuItem} text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
                    <FiCopy className="w-4 h-4" aria-hidden="true" />
                    {UI.duplicatePage}
                  </button>
                  <button type="button" onClick={() => { setShowMenu(false); onClearPage(); }} className={`${menuItem} text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40`}>
                    <LuEraser className="w-4 h-4" aria-hidden="true" />
                    {UI.clearPage}
                  </button>
                  {pages.length > 1 && (
                    <button type="button" onClick={() => { setShowMenu(false); onDeletePage(currentPageIndex); }} className={`${menuItem} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}>
                      <FiTrash2 className="w-4 h-4" aria-hidden="true" />
                      {UI.deletePage}
                    </button>
                  )}
                </div>
              </Popover>
            )}
          </div>
        )}

        <div className="pl-1 pr-1">
          <SaveStatus status={saveStatus} justSaved={isJustSaved} onRetry={onRetrySave} compact={isMobile} />
        </div>
      </div>
    </div>
  );
}
