'use client';

import React, { useMemo, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { LuPencil } from 'react-icons/lu';
import { Tabs, BTN_SECONDARY } from '../ui/parts';
import { SHAPE_CATEGORIES, getGalleryItem } from '../../utils/shapes/shapeGallery';
import { createShape, isLineShape, boxFromDrag, shapeGeometry, LINE_PRESETS } from '../../utils/shapes/shapeModel';
import { shapePaint, matrixAttribute } from '../../utils/shapes/shapeRender';
import { geometryBounds } from '../../utils/shapes/presetEvaluator';

const RECENT_KEY = 'netz_playground_recent_shapes';
const ICON_BOX = 40; // icons are drawn at this size, then scaled into the button

const iconCache = new Map();

/** An outline drawing of a gallery item, made by the same geometry as the real shape. */
function galleryIcon(item) {
  if (iconCache.has(item.id)) return iconCache.get(item.id);
  const size = item.size || { w: 1, h: 1 };
  let box;
  if (isLineShape({ preset: item.preset })) {
    // Lines are drawn from bottom-left to top-right, as in Word's gallery
    box = boxFromDrag(item, { x: 0, y: ICON_BOX * 0.85 }, { x: ICON_BOX, y: ICON_BOX * 0.15 });
  } else {
    const scale = ICON_BOX / Math.max(size.w, size.h, 1);
    box = { x: 0, y: 0, w: Math.max(4, size.w * scale), h: Math.max(4, size.h * scale) };
  }
  const created = createShape(item, box);
  const shape = {
    ...created,
    fill: { type: 'none' },
    line: { ...created.line, type: 'solid', color: 'currentColor', width: 2.2, dash: 'solid' },
  };
  const paint = shapePaint(shape);
  const g = geometryBounds(shapeGeometry(shape)) || { minX: 0, minY: 0, maxX: box.w, maxY: box.h };
  const pad = 4;
  const minX = Math.min(g.minX, 0) + box.x - pad;
  const minY = Math.min(g.minY, 0) + box.y - pad;
  const w = Math.max(g.maxX, box.w) - Math.min(g.minX, 0) + pad * 2;
  const h = Math.max(g.maxY, box.h) - Math.min(g.minY, 0) + pad * 2;
  const side = Math.max(w, h);
  const icon = {
    viewBox: `${minX - (side - w) / 2} ${minY - (side - h) / 2} ${side} ${side}`,
    transform: matrixAttribute(paint.matrix),
    // Text Box: draw its box so the icon is not empty
    parts: item.textBox ? [{ d: `M0 0H${box.w}V${box.h}H0Z`, stroke: 'currentColor', strokeWidth: 2.2 }, { d: `M${box.w * 0.2} ${box.h * 0.35}H${box.w * 0.8}M${box.w * 0.2} ${box.h * 0.65}H${box.w * 0.6}`, stroke: 'currentColor', strokeWidth: 2.2 }] : paint.parts,
  };
  iconCache.set(item.id, icon);
  return icon;
}

export function ShapeIcon({ item, className = 'w-6 h-6' }) {
  const icon = galleryIcon(item);
  return (
    <svg viewBox={icon.viewBox} className={className} aria-hidden="true">
      <g transform={item.textBox ? undefined : icon.transform}>
        {icon.parts.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.fill ? 'currentColor' : 'none'}
            stroke={p.stroke ? 'currentColor' : 'none'}
            strokeWidth={p.strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}

export function readRecentShapes() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(list) ? list.filter((id) => getGalleryItem(id)).slice(0, 12) : [];
  } catch (e) {
    return [];
  }
}

export function rememberRecentShape(id) {
  try {
    const next = [id, ...readRecentShapes().filter((x) => x !== id)].slice(0, 12);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch (e) {}
}

/**
 * The Shapes menu, as in WPS Office and Word: Recently Used Shapes, then every category
 * (Lines, Rectangles, Basic Shapes, Block Arrows, Equation Shapes, Flowchart, Stars and
 * Banners, Callouts). Picking a shape arms it: drag on the page to draw it, or tap for its
 * default size. A bottom sheet on phones.
 *
 * mode 'change': the same gallery for Change Shape (Word's Edit Shape > Change Shape): lines,
 * connectors and the text box are left out, and a pick changes the selected shapes.
 * placement: classes that place it (the gallery is placed above the dock by default).
 */
export default function ShapeGallery({ isMobile, armedId, onPick, onFreehand, onClose, mode = 'insert', placement = null }) {
  const [recent] = useState(() => readRecentShapes());
  const listRef = useRef(null);
  const changing = mode === 'change';
  const sections = useMemo(() => {
    const list = [];
    if (recent.length) list.push({ id: 'recent', label: 'Recently Used Shapes', shapes: recent.map(getGalleryItem).filter(Boolean) });
    const all = list.concat(SHAPE_CATEGORIES);
    if (!changing) return all;
    return all
      .filter((section) => section.id !== 'lines')
      .map((section) => ({ ...section, shapes: section.shapes.filter((item) => !item.textBox && !LINE_PRESETS.has(item.preset)) }))
      .filter((section) => section.shapes.length > 0);
  }, [recent, changing]);

  // The tab of the category in view: set by a tab press, and followed while the list scrolls
  const [current, setCurrent] = useState(sections[0] ? sections[0].id : null);
  const jumpTo = (id) => {
    setCurrent(id);
    const el = listRef.current && listRef.current.querySelector(`[data-shape-section="${id}"]`);
    if (el && listRef.current) listRef.current.scrollTo({ top: el.offsetTop - listRef.current.offsetTop, behavior: 'smooth' });
  };
  const followScroll = () => {
    const list = listRef.current;
    if (!list) return;
    let inView = sections[0] && sections[0].id;
    for (const el of list.querySelectorAll('[data-shape-section]')) {
      if (el.offsetTop - list.offsetTop <= list.scrollTop + 12) inView = el.getAttribute('data-shape-section');
    }
    if (inView && inView !== current) setCurrent(inView);
  };

  return (
    <div
      role="dialog"
      aria-label={changing ? 'Change Shape' : 'Shapes'}
      data-shape-gallery={changing ? 'change' : 'insert'}
      className={`${
        isMobile
          ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl px-4 pt-2 pb-4 border-t'
          : placement || 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[560px] max-w-[var(--dock-panel-max,95vw)] max-h-[70vh] rounded-2xl p-3 border'
      } bg-pg-surface border-pg-line shadow-pg-menu ${changing ? 'z-[70]' : 'z-50'} flex flex-col gap-2 text-pg-label text-pg-text2 animate-in fade-in slide-in-from-bottom-2 duration-150`}
    >
      {isMobile && <span aria-hidden="true" className="block mx-auto w-9 h-[5px] rounded-full bg-pg-line" />}
      <div className="flex items-center justify-between gap-2 pl-1">
        <div className="min-w-0">
          <span className={`font-semibold text-pg-ink block leading-tight ${isMobile ? 'text-pg-title' : 'text-pg-body'}`}>{changing ? 'Change Shape' : 'Shapes'}</span>
          <span className="text-pg-cap text-pg-text2">
            {changing ? 'Pick the new shape: its size, colours and text stay' : 'Pick a shape, then drag on the page (or tap for the default size)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!changing && <button
            onClick={onFreehand}
            title="Draw Freehand: rough shapes snap to lines, triangles, rectangles and circles (key S)"
            className={`${BTN_SECONDARY} px-3`}
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Draw Freehand</span>
          </button>}
          <button
            onClick={onClose}
            title={changing ? 'Close Change Shape' : 'Close Shapes'}
            aria-label={changing ? 'Close Change Shape' : 'Close Shapes'}
            className="w-8 h-8 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-lg text-pg-text2 hover:bg-pg-tray hover:text-pg-ink transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick jumps to each category: one row that never wraps, faded where there is more */}
      <Tabs
        label="Shape categories"
        className="pb-2 border-b border-pg-line"
        items={sections.map((s) => ({ id: s.id, label: s.id === 'recent' ? 'Recent' : s.label }))}
        value={current}
        onSelect={jumpTo}
      />

      <div ref={listRef} onScroll={followScroll} className="relative flex flex-col gap-3 overflow-y-auto overscroll-contain pr-1 min-h-0">
        {sections.map((section) => (
          <section key={section.id} data-shape-section={section.id} className="flex flex-col gap-1.5">
            <h4 className="text-pg-cap font-semibold text-pg-text2">{section.label}</h4>
            <div className="flex flex-wrap gap-1">
              {section.shapes.map((item) => (
                <button
                  key={`${section.id}-${item.id}`}
                  onClick={() => onPick(item)}
                  title={item.name}
                  aria-label={item.name}
                  aria-pressed={armedId === item.id}
                  data-shape-item={item.id}
                  className={`w-9 h-9 [@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11 flex items-center justify-center rounded-lg transition-colors ${
                    armedId === item.id ? 'bg-pg-ink text-pg-on-ink' : 'text-pg-ink hover:bg-pg-tray'
                  }`}
                >
                  <ShapeIcon item={item} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
