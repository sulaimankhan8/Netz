'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { TOUCH_TARGET } from './Dialog';

/**
 * The shell of a menu that opens from the dock (Shapes, Symbol, Equation, Screenshot): a bottom
 * sheet on phones; on laptops and tablets `desktop` places it (above the dock).
 */
export function menuPanelClass(isMobile, desktop) {
  return `${isMobile ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl px-4 pt-2 pb-4 border-t' : desktop} bg-pg-surface border-pg-line shadow-pg-menu text-pg-label text-pg-text2`;
}

/** A menu's title row: the title (18 px in a phone sheet, 15 px otherwise) and its close button. */
export function MenuHeader({ title, onClose, isMobile, closeLabel, children = null }) {
  return (
    <>
      {isMobile && <span aria-hidden="true" className="block mx-auto mb-1 w-9 h-[5px] rounded-full bg-pg-line" />}
      <div className="flex items-center justify-between gap-2 pl-1">
        <span className={`font-semibold text-pg-ink ${isMobile ? 'text-pg-title' : 'text-pg-body'}`}>{title}</span>
        <div className="flex items-center gap-1.5">
          {children}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel || `Close ${title}`}
            title="Close"
            className={`w-8 h-8 ${TOUCH_TARGET} flex items-center justify-center rounded-lg text-pg-text2 hover:bg-pg-tray hover:text-pg-ink`}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

/*
 * The Playground's shared looks (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, step 0.3). Every bar, menu
 * and sheet uses these, so a look changes in one place. Colours are the pg-* tokens from
 * ../../playground.css.
 */

/** A floating bar: the dock, the two top bars. */
export const BAR_SHELL = 'bg-pg-surface border border-pg-line rounded-2xl shadow-pg-bar';

/**
 * A toolbar button: 40 px with a mouse, 44 px on touch screens.
 * active: the tool in use (graphite, the one "you are here" look for every tool).
 * expanded: its menu is open (pressed in).
 * wide: holds a label as well as an icon.
 */
export function toolButton({ active = false, expanded = false, wide = false } = {}) {
  const shape = wide ? 'h-10 px-2.5 gap-1.5' : 'w-10 h-10';
  const state = active
    ? 'bg-pg-ink text-pg-on-ink'
    : expanded
      ? 'bg-pg-tray text-pg-ink'
      : 'text-pg-text2 hover:bg-pg-tray hover:text-pg-ink disabled:hover:bg-transparent';
  return `${shape} ${TOUCH_TARGET} shrink-0 inline-flex items-center justify-center rounded-xl text-pg-label font-medium transition-colors disabled:text-pg-muted disabled:cursor-default ${state}`;
}

/** A thin upright line between groups in a bar. */
export function Divider({ className = '' }) {
  return <span aria-hidden="true" className={`w-px h-6 bg-pg-line mx-1.5 shrink-0 ${className}`} />;
}

// Buttons, by weight
const BUTTON = `inline-flex items-center justify-center gap-1.5 min-h-[36px] ${TOUCH_TARGET} px-3.5 rounded-xl text-pg-label font-semibold transition-colors disabled:opacity-50 disabled:cursor-default`;
/** The one main action of a panel (Insert, Send to Notes, Done). */
export const BTN_MAIN = `${BUTTON} bg-pg-accent-fill text-white hover:bg-pg-accent-fill/90`;
/** A second action (Cancel, Draw Freehand). */
export const BTN_SECONDARY = `${BUTTON} bg-pg-tray text-pg-ink hover:bg-pg-line`;
/** A quiet action with no fill until hovered. */
export const BTN_QUIET = `${BUTTON} text-pg-ink hover:bg-pg-tray`;
/** A soft action that belongs to a selection (Turn into typed text). */
export const BTN_TINT = `${BUTTON} bg-pg-accent-tint text-pg-accent-on-tint hover:brightness-95`;

/** A row in a menu: icon, label, optional detail on the right. */
export const MENU_ROW = `w-full flex items-center gap-3 px-3 min-h-[44px] rounded-xl text-pg-body font-medium text-left text-pg-ink hover:bg-pg-tray transition-colors disabled:opacity-40`;

/** A small grey label over a group of controls. */
export const SECTION_LABEL = 'text-pg-cap font-semibold text-pg-text2 mb-1.5';

/**
 * Choose one of a few options: a tray with the chosen option raised. Buttons carry aria-pressed,
 * or role="radio" with aria-checked when radio is set.
 * options: [{ value, label, title?, ariaLabel?, content?, disabled? }]
 * tall: room for a small picture over each label (pen types).
 */
export function Segmented({ options, value, onChange, label, radio = false, disabled = false, tall = false, className = '' }) {
  return (
    <div
      role={radio ? 'radiogroup' : 'group'}
      aria-label={label}
      className={`grid gap-1 p-1 rounded-[14px] bg-pg-tray ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled || o.disabled}
            onClick={() => onChange(o.value)}
            title={o.title}
            aria-label={o.ariaLabel}
            {...(radio ? { role: 'radio', 'aria-checked': on } : { 'aria-pressed': on })}
            className={`${tall ? 'min-h-[64px] flex-col gap-1.5' : 'min-h-[36px]'} ${TOUCH_TARGET} px-2 flex items-center justify-center rounded-[11px] text-pg-label transition-colors disabled:opacity-50 disabled:cursor-default ${
              on ? 'bg-pg-surface text-pg-ink font-semibold shadow-sm' : 'text-pg-text2 font-medium hover:text-pg-ink'
            }`}
          >
            {o.content || o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * An on / off row in a menu: the whole row is the switch (a large target), with the track drawn
 * at the right. role="switch" with aria-checked; its accessible name is the label.
 */
export function SwitchRow({ checked, onChange, label, detail, icon, disabled = false, title }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`${MENU_ROW} justify-between`}
    >
      <span className="flex items-center gap-3 min-w-0">
        {icon}
        <span className="flex flex-col min-w-0">
          <span>{label}</span>
          {detail && <span className="text-pg-cap font-normal text-pg-text2">{detail}</span>}
        </span>
      </span>
      <span aria-hidden="true" className={`relative shrink-0 block w-12 h-7 rounded-full transition-colors ${checked ? 'bg-pg-accent-fill' : 'bg-pg-line'}`}>
        <span className={`absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

/**
 * A colour to pick: a dot in a 36 px button (44 px on touch). The chosen one has a graphite ring
 * with a gap; no tick, so the colour itself stays visible.
 * background: what the dot shows, when it is not just the colour (the many-colours dot).
 */
export function SwatchButton({ colour, name, selected, onPick, background }) {
  return (
    <button
      type="button"
      onClick={() => onPick(colour)}
      title={name}
      aria-label={name}
      aria-pressed={selected}
      className={`w-9 h-9 ${TOUCH_TARGET} shrink-0 flex items-center justify-center rounded-full`}
    >
      <span
        className="w-7 h-7 rounded-full border border-black/10 dark:border-white/20"
        style={{
          background: background || colour,
          boxShadow: selected ? '0 0 0 2px rgb(var(--pg-surface)), 0 0 0 4px rgb(var(--pg-ink))' : undefined,
        }}
      />
    </button>
  );
}

/**
 * One row of tabs that never wraps: it scrolls sideways, fades at an edge where there is more,
 * and with a mouse shows ‹ › buttons at those edges. The chosen tab is a graphite pill.
 * items: [{ id, label }]
 */
export function Tabs({ items, value, onSelect, label, className = '' }) {
  const rowRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  // The ‹ › buttons are for a mouse; on a touch screen the row is swiped
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia('(pointer: fine)');
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setEdges({ left: row.scrollLeft > 2, right: row.scrollLeft + row.clientWidth < row.scrollWidth - 2 });
  }, []);

  useLayoutEffect(measure, [measure, items.length]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Keep the chosen tab in view (without scrolling anything else on the page)
  useEffect(() => {
    const row = rowRef.current;
    const tab = row && row.querySelector(`[data-tab-id="${CSS.escape(String(value))}"]`);
    if (!row || !tab) return;
    const start = tab.offsetLeft - row.offsetLeft;
    const end = start + tab.offsetWidth;
    if (start < row.scrollLeft) row.scrollTo({ left: start - 24, behavior: 'smooth' });
    else if (end > row.scrollLeft + row.clientWidth) row.scrollTo({ left: end - row.clientWidth + 24, behavior: 'smooth' });
  }, [value]);

  const page = (direction) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: 'smooth' });
  };

  const fade = `linear-gradient(to right, ${edges.left ? 'transparent, black 40px' : 'black'}, ${edges.right ? 'black calc(100% - 40px), transparent' : 'black'})`;
  const arrow = 'absolute top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-pg-surface border border-pg-line text-pg-text2 hover:text-pg-ink shadow-sm';

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        ref={rowRef}
        role="tablist"
        aria-label={label}
        onScroll={measure}
        className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitMaskImage: fade, maskImage: fade }}
      >
        {items.map((item) => {
          const on = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              data-tab-id={item.id}
              onClick={() => onSelect(item.id)}
              className={`shrink-0 h-8 ${TOUCH_TARGET} px-3 rounded-full text-pg-label transition-colors ${on ? 'bg-pg-ink text-pg-on-ink font-semibold' : 'text-pg-text2 font-medium hover:bg-pg-tray hover:text-pg-ink'}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {finePointer && edges.left && (
        <button type="button" onClick={() => page(-1)} aria-label="Scroll tabs left" className={`${arrow} left-0`}>
          <FiChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
      {finePointer && edges.right && (
        <button type="button" onClick={() => page(1)} aria-label="Scroll tabs right" className={`${arrow} right-0`}>
          <FiChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
