'use client';

/*
 * The Notes shared looks (NOTES_VISUAL_REDESIGN_PLAN.md, section 1). Every bar, menu, dialog and
 * block uses these, so a look changes in one place. Colours are the nt-* tokens from ../notes.css.
 */

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import { NT_FONT } from '../utils/fonts';

// At least 44 x 44 px on touch screens (coarse pointers), its own size with a mouse
export const TOUCH = '[@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px]';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-nt-surface';

// Buttons, by weight
const BUTTON = `inline-flex items-center justify-center gap-2 h-10 ${TOUCH} px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-default ${FOCUS_RING}`;
/** The one main action of an area (Calculate, Check answer, Copy key, Save sketch). */
export const BTN_MAIN = `${BUTTON} bg-nt-accent-fill text-white hover:bg-nt-accent-fill/90`;
/** A second action (Share, Export, Try again). */
export const BTN_SECONDARY = `${BUTTON} bg-nt-tray text-nt-ink hover:bg-nt-line`;
/** No fill until hovered (Cancel, Edit). */
export const BTN_QUIET = `${BUTTON} text-nt-ink hover:bg-nt-tray`;
/** A soft action (Clone). */
export const BTN_TINT = `${BUTTON} bg-nt-accent-tint text-nt-accent-on-tint hover:brightness-95`;
/** Deletes or clears something. */
export const BTN_DANGER = `${BUTTON} text-nt-danger hover:bg-nt-danger-tint`;
/** An icon-only button: 40 px with a mouse, 44 px on touch. Give it an aria-label. */
export const ICON_BTN = `inline-flex items-center justify-center shrink-0 w-10 h-10 ${TOUCH} rounded-xl text-nt-text2 hover:bg-nt-tray hover:text-nt-ink transition-colors disabled:opacity-40 disabled:cursor-default ${FOCUS_RING}`;

/** A text field's box (the input inside it has no border of its own). */
export const FIELD = 'flex items-center gap-2 h-10 [@media(pointer:coarse)]:h-11 px-3 rounded-xl bg-nt-surface border border-nt-line text-sm text-nt-ink focus-within:border-nt-accent focus-within:ring-2 focus-within:ring-nt-accent/20 transition-colors';
export const FIELD_INPUT = 'flex-1 min-w-0 bg-transparent outline-none placeholder:text-nt-text2/70';
/** A small grey label over a control. */
export const LABEL = 'text-[13px] leading-[18px] font-semibold text-nt-text2';

/** A chip: tags, filters. on: chosen (graphite). */
export function chipClass(on = false) {
  return `inline-flex items-center gap-1.5 shrink-0 h-8 ${TOUCH} px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${FOCUS_RING} ${
    on ? 'bg-nt-ink text-nt-on-ink' : 'bg-nt-tray text-nt-text2 hover:text-nt-ink'
  }`;
}

/** A row in a menu: icon, label. */
export const MENU_ROW = `w-full flex items-center gap-3 px-3 min-h-[44px] rounded-xl text-[15px] font-medium text-left transition-colors disabled:opacity-40 disabled:cursor-default outline-none`;

/** A textarea that grows with its text (no inner scrollbar, nothing cut off). */
export const AutoTextarea = forwardRef(function AutoTextarea({ value, className = '', ...rest }, outerRef) {
  const innerRef = useRef(null);
  useImperativeHandle(outerRef, () => innerRef.current);
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  // The text rewraps when the screen turns or the window is resized
  useEffect(() => {
    const fit = () => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return <textarea ref={innerRef} rows={1} value={value} className={`block w-full resize-none overflow-hidden bg-transparent outline-none ${className}`} {...rest} />;
});

/** Is this a phone-sized screen (under 768 px)? */
export function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setPhone(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return phone;
}

/** Is the main pointer a finger (no hover)? */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarse(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return coarse;
}

/**
 * Choose one of a few options: a tray with the chosen option raised.
 * options: [{ value, label }]
 */
export function Segmented({ options, value, onChange, label, className = '' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`grid gap-0.5 p-1 rounded-[14px] bg-nt-tray ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`h-8 [@media(pointer:coarse)]:h-9 px-2 rounded-[10px] text-[13px] whitespace-nowrap transition-colors ${FOCUS_RING} ${
              on ? 'bg-nt-surface text-nt-ink font-semibold shadow-sm' : 'text-nt-text2 font-medium hover:text-nt-ink'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** An on / off switch: a real button with role="switch". */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 inline-flex items-center justify-center w-12 h-11 rounded-full ${FOCUS_RING}`}
    >
      <span aria-hidden="true" className={`block w-12 h-7 rounded-full transition-colors ${checked ? 'bg-nt-accent-fill' : 'bg-nt-line'}`}>
        <span className={`block mt-[3px] ml-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps focus sensible for an open panel: it moves in when the panel opens, Tab stays inside
 * (trap), and it goes back to where it came from when the panel closes.
 */
function usePanelFocus(panelRef, { trap, initial, ready }) {
  useEffect(() => {
    if (!ready) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;
    const opener = document.activeElement;
    if (!panel.contains(document.activeElement)) {
      const first = initial === 'first' ? panel.querySelector(FOCUSABLE) : null;
      (first || panel).focus({ preventScroll: true });
    }
    const onKey = (e) => {
      if (!trap || e.key !== 'Tab') return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
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
  }, [panelRef, trap, initial, ready]);
}

/** Escape closes the newest open panel only. */
function useEscape(onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        closeRef.current?.();
      }
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, []);
}

/** The bar at the top of a phone sheet (a cue that it is a sheet; it does not drag). */
export function SheetHandle() {
  return <span aria-hidden="true" className="block mx-auto mb-2 w-9 h-[5px] rounded-full bg-nt-line" />;
}

/** A close (×) button for a panel's header. */
export function CloseButton({ onClose, label = 'Close' }) {
  return (
    <button type="button" onClick={onClose} aria-label={label} title="Close" className={ICON_BTN}>
      <LuX className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

function usePortalReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

/**
 * A dialog: in the middle of the screen on laptops and tablets, a bottom sheet on phones.
 * Escape, the × and a press on the dimmed backdrop close it; focus stays inside while it is open.
 */
export function Modal({ title, onClose, children, isPhone, width = 'max-w-[640px]', headerExtra = null }) {
  const panelRef = useRef(null);
  const ready = usePortalReady();
  usePanelFocus(panelRef, { trap: true, ready });
  useEscape(onClose);
  if (!ready) return null;

  return createPortal(
    <div
      className={`${NT_FONT} fixed inset-0 z-[200] flex ${isPhone ? 'items-end' : 'items-center justify-center p-6'} bg-black/30 text-nt-ink`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`flex flex-col bg-nt-surface border border-nt-line shadow-nt-menu outline-none overflow-hidden ${
          isPhone ? 'w-full max-h-[92vh] rounded-t-3xl pt-2' : `w-full ${width} max-h-[85vh] rounded-2xl`
        }`}
      >
        {isPhone && <SheetHandle />}
        <div className={`flex items-center gap-2 shrink-0 ${isPhone ? 'pl-5 pr-3' : 'pl-6 pr-3 pt-3'}`}>
          <h2 className="flex-1 text-lg font-bold">{title}</h2>
          {headerExtra}
          <CloseButton onClose={onClose} label={`Close ${title}`} />
        </div>
        <div className="flex-1 overflow-y-auto custom-notion-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/**
 * A short menu of actions. On phones it is a bottom sheet with a title; otherwise a popover
 * placed next to the button that opened it (anchorRef), drawn above everything so scrolling
 * lists never clip it. Arrow keys move between rows, Escape and an outside press close it.
 *
 * items: [{ id, label, icon, onSelect, danger, disabled }] or 'divider'
 * align: 'end' (right edges line up) or 'start'.
 */
export function Menu({ title, items, onClose, anchorRef, isPhone, align = 'end', width = 240 }) {
  const panelRef = useRef(null);
  const ready = usePortalReady();
  const [pos, setPos] = useState(null);
  usePanelFocus(panelRef, { trap: isPhone, initial: 'first', ready });
  useEscape(onClose);

  useLayoutEffect(() => {
    if (isPhone || !anchorRef?.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const height = panelRef.current?.offsetHeight || 200;
    const below = r.bottom + 6 + height <= window.innerHeight - 8;
    const left = align === 'end' ? r.right - width : r.left;
    setPos({
      left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
      top: below ? r.bottom + 6 : Math.max(8, r.top - 6 - height),
    });
  }, [anchorRef, isPhone, align, width, ready]);

  // Close on an outside press (laptop popover); the sheet has its own backdrop
  useEffect(() => {
    if (isPhone) return undefined;
    const down = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onClose();
    };
    const away = () => onClose();
    window.addEventListener('pointerdown', down, true);
    window.addEventListener('resize', away);
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('resize', away);
    };
  }, [isPhone, anchorRef, onClose]);

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const rows = [...panelRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')];
    const i = rows.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % rows.length : (i - 1 + rows.length) % rows.length;
    rows[next]?.focus();
  };

  if (!ready) return null;

  const rows = items.map((item, i) =>
    item === 'divider' ? (
      <div key={`d${i}`} role="separator" className="h-px bg-nt-line my-1 mx-2" />
    ) : (
      <button
        key={item.id}
        type="button"
        role="menuitem"
        disabled={item.disabled}
        onClick={() => {
          onClose();
          item.onSelect();
        }}
        className={`${MENU_ROW} ${isPhone ? 'min-h-[52px] text-[17px]' : ''} ${
          item.danger ? 'text-nt-danger hover:bg-nt-danger-tint focus:bg-nt-danger-tint' : 'text-nt-ink hover:bg-nt-tray focus:bg-nt-tray'
        }`}
      >
        {item.icon && <span aria-hidden="true" className="w-5 h-5 shrink-0 flex items-center justify-center">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
      </button>
    )
  );

  if (isPhone) {
    return createPortal(
      <div
        className={`${NT_FONT} fixed inset-0 z-[210] flex items-end bg-black/20 text-nt-ink`}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={panelRef}
          role="menu"
          aria-label={title}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="w-full rounded-t-3xl bg-nt-surface pt-2 pb-6 px-3 outline-none shadow-nt-menu"
        >
          <SheetHandle />
          {title && <div className="px-3 pt-1 pb-2 text-lg font-bold">{title}</div>}
          {rows}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={panelRef}
      role="menu"
      aria-label={title}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={`${NT_FONT} fixed z-[210] p-1.5 rounded-2xl bg-nt-surface border border-nt-line shadow-nt-menu text-nt-ink outline-none`}
      style={{ width, left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
    >
      {rows}
    </div>,
    document.body
  );
}

/**
 * A panel of controls opened from a button (Note look). On phones it is a bottom sheet (Modal);
 * otherwise it floats next to anchorRef, drawn above everything so scrolling never clips it.
 * Escape, the × and an outside press close it; focus stays inside while it is open.
 */
export function Popover({ title, onClose, anchorRef, isPhone, children, width = 380, icon = null }) {
  const panelRef = useRef(null);
  const ready = usePortalReady();
  const [pos, setPos] = useState(null);
  usePanelFocus(panelRef, { trap: !isPhone, ready });
  useEscape(isPhone ? () => {} : onClose);

  useLayoutEffect(() => {
    if (isPhone || !ready || !anchorRef?.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const height = Math.min(panelRef.current?.scrollHeight || 500, window.innerHeight - 16);
    // Below the button when it fits, else as low as it can go; never past the screen's bottom
    // edge (the panel scrolls inside instead)
    const top = r.bottom + 8 + height <= window.innerHeight - 8 ? r.bottom + 8 : Math.max(8, Math.min(r.bottom + 8, window.innerHeight - 8 - height));
    setPos({
      left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)),
      top,
      maxH: window.innerHeight - top - 8
    });
  }, [anchorRef, isPhone, width, ready]);

  useEffect(() => {
    if (isPhone) return undefined;
    const down = (e) => {
      if (panelRef.current?.contains(e.target) || anchorRef?.current?.contains(e.target)) return;
      onClose();
    };
    window.addEventListener('pointerdown', down, true);
    return () => window.removeEventListener('pointerdown', down, true);
  }, [isPhone, anchorRef, onClose]);

  if (isPhone) {
    return (
      <Modal title={title} onClose={onClose} isPhone>
        {children}
      </Modal>
    );
  }
  if (!ready) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className={`${NT_FONT} fixed z-[210] flex flex-col rounded-2xl bg-nt-surface border border-nt-line shadow-nt-menu text-nt-ink outline-none overflow-hidden`}
      style={{ width, left: pos?.left ?? -9999, top: pos?.top ?? -9999, maxHeight: pos?.maxH ?? '80vh' }}
    >
      <div className="flex items-center gap-2.5 pl-4 pr-2 pt-3 pb-2 shrink-0">
        {icon}
        <h2 className="flex-1 text-base font-bold">{title}</h2>
        <CloseButton onClose={onClose} label={`Close ${title}`} />
      </div>
      <div className="overflow-y-auto custom-notion-scrollbar">{children}</div>
    </div>,
    document.body
  );
}

/**
 * A short notice at the bottom of the screen, with one action (Undo). The owner decides when it
 * goes away; it is announced to screen readers.
 */
export function Notice({ message, actionLabel, onAction, onDismiss, raised = false }) {
  const ready = usePortalReady();
  if (!ready) return null;
  return createPortal(
    <div className={`${NT_FONT} fixed left-1/2 -translate-x-1/2 ${raised ? 'bottom-[92px]' : 'bottom-6'} z-[220] max-w-[calc(100vw-32px)]`} role="status" aria-live="polite">
      <div className="flex items-center gap-2 h-12 pl-4 pr-1.5 rounded-2xl bg-[#1D1D1F] text-white text-sm shadow-nt-menu">
        <span className="flex-1 truncate">{message}</span>
        {actionLabel && (
          <button type="button" onClick={onAction} className={`h-9 ${TOUCH} px-3 rounded-xl font-semibold text-[rgb(199_203_255)] hover:bg-white/10`}>
            {actionLabel}
          </button>
        )}
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className={`w-9 h-9 ${TOUCH} flex items-center justify-center rounded-xl text-white/70 hover:bg-white/10`}>
          <LuX className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body
  );
}
