'use client';

import React, { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiPlus } from 'react-icons/fi';
import { LuMoreHorizontal } from 'react-icons/lu';
import { Popover } from './ui/Dialog';
import { BAR_SHELL, Divider, toolButton } from './ui/parts';
import PageMenu from './PageMenu';
import { UI } from '../utils/uiText';

/**
 * The page bar. Laptops and tablets (top-left): ‹ | page name, "Page 2 of 3" ▾ | › | +.
 * Phones (one bar across the top): the same, with the save status under the page name and the
 * ⋯ page menu (as a sheet) at the end; the laptop has those in the top-right bar (DocBar).
 * The page name opens the page sheet (all pages: open, rename, reorder, duplicate, delete).
 */
export default function PageManager({
  pages = [{ id: 'page_1', title: 'Page 1' }],
  currentPageIndex = 0,
  onSelectPage,
  onAddPage,
  onOpenPages,
  saveStatus = 'saved',
  isMobile = false,
  pageMenu = null,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef(null);
  const page = pages[currentPageIndex];
  const title = page?.title || `Page ${currentPageIndex + 1}`;
  const where = UI.pageOf(currentPageIndex + 1, pages.length);
  const run = (fn) => () => {
    setShowMenu(false);
    fn?.();
  };

  // On phones the save status rides under the page name ("Couldn't save" also shows, with Retry,
  // in the status area)
  const saveWord = saveStatus === 'failed' ? UI.saveFailed : saveStatus === 'saving' ? UI.saving : UI.saved;

  return (
    <nav aria-label={UI.pages} className={`relative flex items-center gap-0.5 p-1.5 select-none ${BAR_SHELL} ${isMobile ? 'w-full' : ''}`} data-page-bar>
      <button
        type="button"
        onClick={() => onSelectPage(Math.max(0, currentPageIndex - 1))}
        disabled={currentPageIndex === 0}
        title="Previous Page"
        aria-label="Previous page"
        className={toolButton()}
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {/* The page name and number: opens the page sheet */}
      <button
        type="button"
        onClick={onOpenPages}
        title="All pages: open, rename, reorder"
        aria-label={`${title}, page ${currentPageIndex + 1} of ${pages.length}${isMobile ? `, ${saveWord}` : ''}. Show all pages`}
        className={`h-10 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] px-2.5 flex items-center gap-2 rounded-xl hover:bg-pg-tray ${isMobile ? 'flex-1 min-w-0 justify-center' : 'max-w-[240px]'}`}
      >
        <span className={`flex flex-col min-w-0 leading-tight ${isMobile ? 'items-center' : 'items-start'}`}>
          <span className="max-w-full truncate text-pg-body font-semibold text-pg-ink">{title}</span>
          <span className="max-w-full truncate text-pg-cap font-medium tabular-nums text-pg-text2">
            {where}
            {isMobile && (
              <>
                {' · '}
                <span className={saveStatus === 'failed' ? 'text-pg-danger font-semibold' : ''}>{saveWord}</span>
              </>
            )}
          </span>
        </span>
        <FiChevronDown className="w-4 h-4 shrink-0 text-pg-text2" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onSelectPage(Math.min(pages.length - 1, currentPageIndex + 1))}
        disabled={currentPageIndex === pages.length - 1}
        title="Next Page"
        aria-label="Next page"
        className={toolButton()}
      >
        <FiChevronRight className="w-5 h-5" />
      </button>

      <Divider className="!mx-1" />

      <button type="button" onClick={onAddPage} title={UI.addPage} aria-label={UI.addPage} className={toolButton()}>
        <FiPlus className="w-5 h-5" />
      </button>

      {isMobile && pageMenu && (
        <>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            title="Page: Writing mode, background, zoom, Send to Notes, Export, Focus music, Preferences, Duplicate, Clear, Delete"
            aria-label={UI.pageMenu}
            aria-expanded={showMenu}
            className={toolButton({ expanded: showMenu || pageMenu.notesMode })}
          >
            <LuMoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <Popover title={UI.thisPage} isMobile onClose={() => setShowMenu(false)} anchorRef={menuButtonRef}>
              <PageMenu {...pageMenu} isMobile run={run} />
            </Popover>
          )}
        </>
      )}
    </nav>
  );
}
