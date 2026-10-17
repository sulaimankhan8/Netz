'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiChevronDown, FiMaximize, FiPause, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { LuFileUp, LuMoreHorizontal } from 'react-icons/lu';
import { Popover, TOUCH_TARGET, PLACE_BELOW_RIGHT } from './ui/Dialog';
import { BAR_SHELL, Divider, MENU_ROW, toolButton } from './ui/parts';
import PageMenu from './PageMenu';
import { UI } from '../utils/uiText';

/**
 * The save status: quiet grey "Saved", "Saving…" (only once a save has taken a moment, so it does
 * not flicker on every stroke), or "Couldn't save · Retry" in red, the only time it has colour.
 * compact: the tick only (the word stays as its accessible name).
 */
export function SaveStatus({ status, justSaved, onRetry, compact }) {
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
      <span role="alert" className="flex items-center gap-1.5 h-9 pl-2.5 pr-1 rounded-xl bg-pg-danger-tint text-pg-danger text-pg-label font-semibold">
        <FiAlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className={compact ? 'sr-only' : ''}>{UI.saveFailed}</span>
        <button type="button" onClick={onRetry} className={`h-7 px-2.5 ${TOUCH_TARGET} rounded-lg bg-pg-danger text-white text-pg-cap font-semibold hover:bg-pg-danger/90`}>
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
      className={`flex items-center gap-1.5 h-9 px-2.5 text-pg-label font-medium transition-colors ${justSaved ? 'text-pg-ink' : 'text-pg-text2'}`}
    >
      {saving ? <span className="w-2 h-2 rounded-full bg-pg-muted animate-pulse" aria-hidden="true" /> : <FiCheck className="w-4 h-4" aria-hidden="true" />}
      <span className={compact ? 'sr-only' : ''}>{saving ? UI.saving : UI.saved}</span>
    </span>
  );
}

/**
 * The top-right bar on laptops and tablets: everything about the document and the view.
 * [Saved] | [100% ▾] | [Send to Notes] [⋯ Page menu]
 * While focus music plays, its pause button leads the bar.
 * compact (narrow screens): Send to Notes and Saved drop their words.
 */
export default function DocBar({
  compact = false,
  saveStatus,
  isJustSaved,
  onRetrySave,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToContent,
  onOpenSyncModal,
  music,
  onPauseMusic,
  pageMenu,
}) {
  const [open, setOpen] = useState(null); // 'zoom' | 'page' | null
  const zoomRef = useRef(null);
  const pageRef = useRef(null);
  const toggle = (name) => setOpen((now) => (now === name ? null : name));
  const run = (fn) => () => {
    setOpen(null);
    fn?.();
  };

  return (
    <div className={`relative flex items-center gap-0.5 p-1.5 ${BAR_SHELL}`} data-doc-bar>
      {music && music.playing && (
        <>
          <button type="button" onClick={onPauseMusic} aria-label={`Pause ${music.title}`} title={`Pause ${music.title}`} className={toolButton()}>
            <FiPause className="w-4 h-4" aria-hidden="true" />
          </button>
          <Divider className="!mx-1" />
        </>
      )}

      <SaveStatus status={saveStatus} justSaved={isJustSaved} onRetry={onRetrySave} compact={compact} />
      <Divider className="!mx-1" />

      <button
        ref={zoomRef}
        type="button"
        onClick={() => toggle('zoom')}
        title="Zoom (Ctrl + / Ctrl - / Ctrl 0, Shift+1 to fit)"
        aria-label={UI.zoom}
        aria-expanded={open === 'zoom'}
        className={`${toolButton({ wide: true, expanded: open === 'zoom' })} !gap-1 !text-pg-ink font-semibold tabular-nums`}
      >
        {Math.round(zoomLevel * 100)}%
        <FiChevronDown className="w-3.5 h-3.5 text-pg-text2" aria-hidden="true" />
      </button>
      {open === 'zoom' && (
        <Popover title={UI.zoom} isMobile={false} onClose={() => setOpen(null)} anchorRef={zoomRef} showHeader={false} placement={PLACE_BELOW_RIGHT} role="menu" className="w-[220px]">
          <button type="button" onClick={run(onResetZoom)} title="Reset Zoom to 100% (Ctrl 0)" aria-label="Reset Zoom to 100%" className={MENU_ROW}>
            <span className="w-5 text-center text-pg-cap font-semibold text-pg-text2" aria-hidden="true">1:1</span>
            Zoom to 100%
          </button>
          {onFitToContent && (
            <button type="button" onClick={run(onFitToContent)} title="Fit to content (Shift+1)" aria-label={UI.fit} className={MENU_ROW}>
              <FiMaximize className="w-5 h-5 text-pg-text2" aria-hidden="true" />
              {UI.fit}
            </button>
          )}
          <button type="button" onClick={onZoomIn} title="Zoom In (Ctrl +)" aria-label="Zoom In" className={MENU_ROW}>
            <FiZoomIn className="w-5 h-5 text-pg-text2" aria-hidden="true" />
            Zoom in
          </button>
          <button type="button" onClick={onZoomOut} title="Zoom Out (Ctrl -)" aria-label="Zoom Out" className={MENU_ROW}>
            <FiZoomOut className="w-5 h-5 text-pg-text2" aria-hidden="true" />
            Zoom out
          </button>
        </Popover>
      )}
      <Divider className="!mx-1" />

      {onOpenSyncModal && (
        <button type="button" onClick={onOpenSyncModal} title="Send typed blocks to a new note" aria-label={UI.sendToNotes} className={`${toolButton({ wide: !compact })} !text-pg-ink`}>
          <LuFileUp className="w-[18px] h-[18px]" aria-hidden="true" />
          {!compact && <span>{UI.sendToNotes}</span>}
        </button>
      )}
      <button
        ref={pageRef}
        type="button"
        onClick={() => toggle('page')}
        title="Page: Writing mode, background, Export, Focus music, Preferences, Duplicate, Clear, Delete"
        aria-label={UI.pageMenu}
        aria-expanded={open === 'page'}
        className={toolButton({ expanded: open === 'page' || pageMenu.notesMode })}
      >
        <LuMoreHorizontal className="w-5 h-5" aria-hidden="true" />
      </button>
      {open === 'page' && (
        <Popover title={UI.pageMenu} isMobile={false} onClose={() => setOpen(null)} anchorRef={pageRef} placement={PLACE_BELOW_RIGHT}>
          <PageMenu {...pageMenu} isMobile={false} run={run} />
        </Popover>
      )}
    </div>
  );
}
