'use client';

import React, { useState } from 'react';
import {
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiCopy,
  FiRefreshCw,
  FiSave,
  FiCheckCircle,
  FiCheck,
  FiMoreHorizontal,
  FiX,
} from 'react-icons/fi';

/**
 * PageManager Component — Multi-Page Notebook Navigator
 * Responsive and touch-first: compact on mobile screens, full toolset on desktop.
 */
export default function PageManager({
  pages = [{ id: 'page_1', title: 'Page 1' }],
  currentPageIndex = 0,
  onSelectPage,
  onAddPage,
  onClearPage,
  onDeletePage,
  onDuplicatePage,
  onManualSave,
  isJustSaved = false,
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="relative select-none">
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg text-xs font-medium">
        {/* Previous Page */}
        <button
          onClick={() => onSelectPage(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          title="Previous Page"
          aria-label="Previous Page"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {/* Current Page Index Indicator */}
        <div className="flex items-center gap-1 px-1.5 font-mono text-[11px] sm:text-xs text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
          <span className="hidden sm:inline">Page</span>
          <span className="font-bold text-blue-500">{currentPageIndex + 1}</span>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-400">{pages.length}</span>
        </div>

        {/* Next Page */}
        <button
          onClick={() => onSelectPage(Math.min(pages.length - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === pages.length - 1}
          title="Next Page"
          aria-label="Next Page"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        {/* Add Fresh Page */}
        <button
          onClick={onAddPage}
          title="Add Fresh Blank Page"
          aria-label="Add Fresh Blank Page"
          className="flex items-center justify-center gap-1 px-3 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 active:scale-95 transition-all text-[11px] font-semibold cursor-pointer"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Page</span>
        </button>

        {/* Desktop-only Direct Page Actions */}
        <div className="hidden sm:flex items-center gap-1">
          {/* Clear Active Page */}
          {onClearPage && (
            <button
              onClick={() => {
                if (confirm('Clear all drawings and blocks on this page?')) {
                  onClearPage();
                }
              }}
              title="Clear Current Page Ink & Blocks"
              aria-label="Clear Current Page Ink & Blocks"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-amber-500 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Duplicate Page */}
          {onDuplicatePage && (
            <button
              onClick={() => onDuplicatePage(currentPageIndex)}
              title="Duplicate Current Page"
              aria-label="Duplicate Current Page"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <FiCopy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Page */}
          {pages.length > 1 && onDeletePage && (
            <button
              onClick={() => onDeletePage(currentPageIndex)}
              title="Delete Page"
              aria-label="Delete Page"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Auto-Save Status Badge & Manual Save Button */}
          <div className="flex items-center gap-1.5 pl-1">
            <span
              title="Auto-Save is active: Changes are saved to memory in real-time"
              className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-full"
            >
              <FiCheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Auto-Saved</span>
            </span>

            {onManualSave && (
              <button
                onClick={onManualSave}
                title="Save Playground Session"
                aria-label="Save Playground Session"
                className={`flex items-center justify-center gap-1 px-3 h-11 min-w-[44px] min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isJustSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                }`}
              >
                {isJustSaved ? <FiCheck className="w-3.5 h-3.5" /> : <FiSave className="w-3.5 h-3.5" />}
                <span>{isJustSaved ? 'Saved ✓' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Page Options Menu Trigger */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            title="Page Options Menu"
            aria-label="Page Options Menu"
            className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {showMobileMenu ? <FiX className="w-4 h-4" /> : <FiMoreHorizontal className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Popover Menu for Page Tools */}
      {showMobileMenu && (
        <div className="sm:hidden absolute top-full left-0 mt-2 p-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl z-50 flex flex-col gap-1 min-w-[180px] animate-in fade-in slide-in-from-top-2">
          {onManualSave && (
            <button
              onClick={() => {
                onManualSave();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <FiSave className="w-4 h-4 text-blue-500" />
              <span>{isJustSaved ? 'Saved ✓' : 'Save Session'}</span>
            </button>
          )}

          {onDuplicatePage && (
            <button
              onClick={() => {
                onDuplicatePage(currentPageIndex);
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <FiCopy className="w-4 h-4" />
              <span>Duplicate Page</span>
            </button>
          )}

          {onClearPage && (
            <button
              onClick={() => {
                setShowMobileMenu(false);
                if (confirm('Clear all drawings and blocks on this page?')) {
                  onClearPage();
                }
              }}
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-left"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Clear Page</span>
            </button>
          )}

          {pages.length > 1 && onDeletePage && (
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onDeletePage(currentPageIndex);
              }}
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Page</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
