'use client';

import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { PG_FONT } from '../../utils/fonts';

// A control at least 44 x 44 px on touch screens (coarse pointers), its own size with a mouse
export const TOUCH_TARGET = '[@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px]';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"], math-field';

/**
 * Keeps keyboard focus sensible for a panel: focus moves into it when it opens (unless a control
 * inside already took it), Tab stays inside a modal one, and focus goes back to where it came
 * from when it closes, unless something else has taken it meanwhile.
 */
function usePanelFocus(panelRef, { manage, trap }) {
  useEffect(() => {
    if (!manage) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;
    const opener = document.activeElement;
    if (!panel.contains(document.activeElement)) panel.focus({ preventScroll: true });

    const onKey = (e) => {
      if (!trap || e.key !== 'Tab') return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items.at(-1);
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener('keydown', onKey);
    return () => {
      panel.removeEventListener('keydown', onKey);
      const now = document.activeElement;
      const lost = !now || now === document.body || panel.contains(now);
      if (lost && opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
  }, [panelRef, manage, trap]);
}

/** Escape closes the panel (and nothing behind it). */
function useEscape(onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        closeRef.current?.();
      }
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, []);
}

function CloseButton({ title, onClose }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={`Close ${title}`}
      title="Close"
      className={`w-8 h-8 ${TOUCH_TARGET} shrink-0 flex items-center justify-center rounded-lg text-pg-text2 hover:bg-pg-tray hover:text-pg-ink`}
    >
      <FiX className="w-4 h-4" />
    </button>
  );
}

/** The bar at the top of a phone sheet (a cue that it is a sheet; it does not drag). */
function SheetHandle() {
  return <span aria-hidden="true" className="block mx-auto mb-1 w-9 h-[5px] rounded-full bg-pg-line" />;
}

/**
 * A dialog in the middle of the screen (a bottom sheet on phones), above everything else.
 * A press on the dimmed backdrop closes it and never reaches the page behind.
 *
 * manageFocus: false leaves focus alone (the Symbol dialogs type into a field that keeps it).
 */
export function Dialog({ title, isMobile, onClose, children, footer, label, manageFocus = true, width = 'w-[620px]', fullHeight = true, headerExtra = null }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useEscape(onClose);
  usePanelFocus(panelRef, { manage: manageFocus, trap: true });

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={`${PG_FONT} fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/20`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label && label !== title ? label : undefined}
        aria-labelledby={label && label !== title ? undefined : titleId}
        data-insert-dialog={label || title}
        className={`${isMobile ? `w-full ${fullHeight ? 'h-[85vh]' : 'max-h-[85vh]'} rounded-t-3xl pt-2` : `${width} max-w-[95vw] max-h-[85vh] rounded-2xl`} flex flex-col bg-pg-surface border border-pg-line shadow-pg-menu text-pg-label text-pg-text2 outline-none`}
        style={isMobile ? { paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}
      >
        {isMobile && <SheetHandle />}
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
          <span id={titleId} className={`font-semibold text-pg-ink ${isMobile ? 'text-pg-title' : 'text-pg-body'}`}>{title}</span>
          <div className="flex items-center gap-1">
            {headerExtra}
            <CloseButton title={title} onClose={onClose} />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-3">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 border-t border-pg-line">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/**
 * A panel that opens from a toolbar button: above the button on tablets and laptops, a bottom
 * sheet with a dimmed backdrop on phones. A press outside it closes it and is swallowed, so it
 * never draws on the page; a press on the button that opened it (anchorRef) is left to that
 * button, so the button can toggle it.
 *
 * placement: the classes that position it on tablets and laptops (relative to its parent); the
 * PLACE_* presets cover the dock (above) and the top bars (below).
 */
export const PLACE_ABOVE = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2';
export const PLACE_ABOVE_RIGHT = 'absolute bottom-full right-0 mb-2';
export const PLACE_BELOW_LEFT = 'absolute top-full left-0 mt-2';
export const PLACE_BELOW_RIGHT = 'absolute top-full right-0 mt-2';

export function Popover({ title, isMobile, onClose, children, anchorRef, placement = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2', className = '', showHeader = true, manageFocus = true, role = 'dialog' }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEscape(onClose);
  usePanelFocus(panelRef, { manage: manageFocus, trap: false });

  useEffect(() => {
    const outside = (e) => {
      const panel = panelRef.current;
      if (!panel || panel.contains(e.target)) return;
      if (anchorRef && anchorRef.current && anchorRef.current.contains(e.target)) return;
      // Another panel (a dialog this one opened, a sheet) is not "outside"
      if (e.target.closest && e.target.closest('[role="dialog"], [role="menu"], [data-keep-panels]')) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      closeRef.current?.();
    };
    window.addEventListener('pointerdown', outside, true);
    return () => window.removeEventListener('pointerdown', outside, true);
  }, [anchorRef]);

  const panel = (
    <div
      ref={panelRef}
      tabIndex={-1}
      role={role}
      aria-labelledby={showHeader ? titleId : undefined}
      aria-label={showHeader ? undefined : title}
      className={`${
        isMobile
          ? `${PG_FONT} fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl px-4 pt-2 border-t z-[70]`
          : `${placement} max-w-[var(--dock-panel-max,95vw)] rounded-2xl p-3 border z-50`
      } bg-pg-surface border-pg-line shadow-pg-menu overflow-y-auto text-pg-label text-pg-text2 outline-none animate-in fade-in slide-in-from-bottom-2 duration-150 ${className}`}
      // Above the dock, never taller than the room there is (a phone on its side is only ~390 px high)
      style={isMobile ? { paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' } : { maxHeight: 'calc(100dvh - 96px)' }}
    >
      {isMobile && <SheetHandle />}
      {showHeader && (
        <div className={`flex items-center justify-between gap-2 ${isMobile ? 'mb-3' : 'mb-2 pl-1'}`}>
          <span id={titleId} className={`font-semibold text-pg-ink ${isMobile ? 'text-pg-title' : 'text-pg-body'}`}>{title}</span>
          <CloseButton title={title} onClose={onClose} />
        </div>
      )}
      {children}
    </div>
  );

  if (!isMobile) return panel;
  if (typeof document === 'undefined') return null;
  // Phones: a sheet over a dimmed page (the backdrop takes the press that closes it)
  return createPortal(
    <>
      <div className="fixed inset-0 z-[65] bg-black/20" aria-hidden="true" />
      {panel}
    </>,
    document.body
  );
}

export default Dialog;
