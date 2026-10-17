'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * The menu for selected shapes on right-click (mouse) or a long press (touch), as in WPS
 * and Word: Cut, Copy, Paste, Duplicate, Delete, Edit Text, layer order, Set as Default
 * Shape, Format Shape. Kept on screen; closes on any press outside, Escape or a choice.
 *
 * items: Array<{ id, label, shortcut?, disabled?, separator? }>
 */
export default function ShapeContextMenu({ x, y, items, onChoose, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });
  // Lifting the finger after a long press "clicks" whatever is under it: a choice counts only
  // after a press that began inside the menu (or from the keyboard)
  const pressedInsideRef = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setPos({ left: Math.max(8, Math.min(window.innerWidth - w - 8, x)), top: Math.max(8, Math.min(window.innerHeight - h - 8, y)) });
  }, [x, y]);

  useEffect(() => {
    const outside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    // Escape closes the menu only (not the shape selection as well)
    const key = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', key, true);
    // Registered after the press that opened the menu has finished
    const timer = setTimeout(() => window.addEventListener('pointerdown', outside, true), 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('keydown', key, true);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Shape"
      data-shape-context-menu
      style={pos}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={() => {
        pressedInsideRef.current = true;
      }}
      className="fixed z-[70] min-w-[220px] py-1.5 rounded-xl bg-pg-surface backdrop-blur-xl border border-pg-line shadow-2xl text-xs text-pg-ink select-none"
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={`sep-${i}`} className="my-1 h-px bg-pg-line" role="separator" />
        ) : (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={(e) => {
              // detail 0: chosen with the keyboard
              if (!pressedInsideRef.current && e.detail !== 0) return;
              onChoose(item.id);
              onClose();
            }}
            className="w-full h-8 px-3 flex items-center justify-between gap-6 text-left hover:bg-pg-tray disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="text-pg-text2 tabular-nums">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
}
