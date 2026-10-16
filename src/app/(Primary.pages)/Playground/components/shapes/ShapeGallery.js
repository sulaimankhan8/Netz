'use client';

import React, { useMemo, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { LuPencil, LuShapes } from 'react-icons/lu';
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

  const jumpTo = (id) => {
    const el = listRef.current && listRef.current.querySelector(`[data-shape-section="${id}"]`);
    if (el && listRef.current) listRef.current.scrollTo({ top: el.offsetTop - listRef.current.offsetTop, behavior: 'smooth' });
  };

  return (
    <div
      role="dialog"
      aria-label={changing ? 'Change Shape' : 'Shapes'}
      data-shape-gallery={changing ? 'change' : 'insert'}
      className={`${
        isMobile
          ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl p-4 border-t'
          : placement || 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[560px] max-w-[var(--dock-panel-max,95vw)] max-h-[70vh] rounded-2xl p-3 border'
      } bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl ${changing ? 'z-[70]' : 'z-50'} flex flex-col gap-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <LuShapes className="w-4 h-4" />
          </span>
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block leading-tight">{changing ? 'Change Shape' : 'Shapes'}</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {changing ? 'Pick the new shape: its size, colours and text stay' : 'Pick a shape, then drag on the page (or tap for the default size)'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!changing && <button
            onClick={onFreehand}
            title="Draw Freehand: rough shapes snap to lines, triangles, rectangles and circles (key S)"
            className="px-2.5 py-1.5 h-9 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center gap-1.5 rounded-xl font-medium text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Draw Freehand</span>
          </button>}
          <button
            onClick={onClose}
            title={changing ? 'Close Change Shape' : 'Close Shapes'}
            aria-label={changing ? 'Close Change Shape' : 'Close Shapes'}
            className="p-2 w-9 h-9 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick jumps, mostly for phones where the list is long. Laptops: they wrap, so none is
          hidden. Phones: one row that scrolls, faded at the edge to show there is more. */}
      <div
        className="flex items-center gap-1 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 shrink-0"
        style={isMobile ? { WebkitMaskImage: 'linear-gradient(to right, black 82%, transparent)', maskImage: 'linear-gradient(to right, black 82%, transparent)' } : undefined}
      >
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => jumpTo(s.id)}
            className="px-2.5 py-1 h-8 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] rounded-lg font-medium shrink-0 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {s.id === 'recent' ? 'Recent' : s.label}
          </button>
        ))}
      </div>

      <div ref={listRef} className="relative flex flex-col gap-3 overflow-y-auto overscroll-contain pr-1 min-h-0">
        {sections.map((section) => (
          <section key={section.id} data-shape-section={section.id} className="flex flex-col gap-1.5">
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{section.label}</h4>
            <div className="flex flex-wrap gap-1">
              {section.shapes.map((item) => (
                <button
                  key={`${section.id}-${item.id}`}
                  onClick={() => onPick(item)}
                  title={item.name}
                  aria-label={item.name}
                  aria-pressed={armedId === item.id}
                  data-shape-item={item.id}
                  className={`w-9 h-9 [@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11 flex items-center justify-center rounded-lg border transition-colors ${
                    armedId === item.id
                      ? 'bg-indigo-500 text-white border-indigo-600'
                      : 'border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700'
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
