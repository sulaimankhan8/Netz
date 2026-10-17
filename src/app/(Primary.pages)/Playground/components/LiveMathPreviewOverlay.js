'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { FiAlertCircle, FiLoader, FiMoreHorizontal, FiEdit2, FiBarChart2 } from 'react-icons/fi';
import { UI } from '../utils/uiText';

// Room the status area under the top bars and the dock take, which pills keep clear of
const TOP_CLEAR = 120;
const BOTTOM_CLEAR = 96;
const PILL_H = 48; // a pill's height, for stacking (44 px buttons inside)
const PILL_W = 320; // the widest a pill gets

/**
 * Where each pill goes: at the right end of the ink it reads, centred on that line, so it never
 * covers the line above. Without room on the right it goes under the ink. Pills that would
 * overlap are stacked downwards. Everything stays clear of the top bars, the status area and the dock.
 */
function placePills(clusters, zoom, pan, vw, vh) {
  const placed = [];
  const sorted = [...clusters].sort((a, b) => a.bbox.minY - b.bbox.minY);
  for (const c of sorted) {
    const right = c.bbox.maxX * zoom + pan.x;
    const midY = ((c.bbox.minY + c.bbox.maxY) / 2) * zoom + pan.y;
    let x = right + 12;
    let y = midY - PILL_H / 2;
    if (x + PILL_W > vw - 12) {
      x = Math.max(12, Math.min(vw - PILL_W - 12, c.bbox.minX * zoom + pan.x));
      y = c.bbox.maxY * zoom + pan.y + 10;
    }
    y = Math.max(TOP_CLEAR, Math.min(vh - BOTTOM_CLEAR - PILL_H, y));
    for (const other of placed) {
      const overlapsX = x < other.x + PILL_W && other.x < x + PILL_W;
      if (overlapsX && Math.abs(y - other.y) < PILL_H + 4) y = other.y + PILL_H + 4;
    }
    placed.push({ id: c.clusterId, x, y });
  }
  return placed;
}

const btn = 'min-h-[32px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center gap-1.5 rounded-[9px] text-pg-label font-semibold transition-colors';
const iconBtn = 'w-8 h-8 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-[9px] text-pg-text2 hover:text-pg-ink hover:bg-pg-tray transition-colors';
const menuItem = `${btn} px-3 text-pg-ink hover:bg-pg-tray`;

/**
 * What a reading shows, shared by the pills beside ink and the lasso's context bar:
 *   row:  the status ("Reading…", the reading with any "=" answer, "Couldn't read this") and
 *         Turn into typed text and ⋯
 *   menu: what ⋯ opens (Fix, Read as maths or text, Plot graph), or null while closed
 * handlers: { onConvertCluster, onPlotClusterGraph, onOpenFix, onReadAsMath, onReadAsText }
 */
export function readingParts(cluster, { menuOpen, toggleMenu, closeMenu, handlers }) {
  const { onConvertCluster, onPlotClusterGraph, onOpenFix, onReadAsMath, onReadAsText } = handlers;
  const status = cluster.ocrStatus || 'pending';
  const { detectedText, isMath, evaluatedResult, action } = cluster;
  const failed = action !== 'keep_diagram' && action !== 'keep_ink' && (status === 'error' || status === 'raster_failed');
  const empty = status === 'recognized' && !detectedText;
  const read = action !== 'keep_diagram' && (status === 'recognized' || status === 'empty') && detectedText;

  const row = (
    <div className="flex items-center gap-1.5 min-w-0">
      {status === 'pending' && (
        <span className="flex items-center gap-2 py-1.5 pr-2 text-pg-text2">
          <span className="w-3.5 h-3.5 border-2 border-pg-text2 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span role="status">{UI.reading}</span>
        </span>
      )}
      {status === 'no_api_key' && (
        <span className="flex items-center gap-2 py-1.5 pr-2 text-pg-text2">
          <FiLoader className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          <span role="status">{UI.readerLoading}</span>
        </span>
      )}
      {action === 'keep_diagram' && <span className="py-1.5 pr-2 font-medium text-pg-text2">{UI.keptAsDrawing}</span>}
      {failed && (
        <>
          <FiAlertCircle className="w-4 h-4 text-pg-danger shrink-0" aria-hidden="true" />
          <span className="font-semibold text-pg-danger">{UI.couldNotRead}</span>
          <button type="button" onClick={() => onConvertCluster?.(cluster, '')} className={`${btn} px-3 bg-pg-tray text-pg-ink hover:bg-pg-line`}>
            <FiEdit2 className="w-3.5 h-3.5" aria-hidden="true" />
            {UI.typeIt}
          </button>
        </>
      )}
      {empty && (
        <>
          <span className="text-pg-text2">Nothing to read here</span>
          <button type="button" onClick={() => onConvertCluster?.(cluster, '')} className={`${btn} px-3 bg-pg-tray text-pg-ink hover:bg-pg-line`}>
            <FiEdit2 className="w-3.5 h-3.5" aria-hidden="true" />
            {UI.typeIt}
          </button>
        </>
      )}
      {read && (
        <>
          <span className="min-w-0 truncate text-pg-body text-pg-ink pr-1" title={detectedText}>
            {isMath ? <InlineMath math={detectedText} renderError={() => <span className="font-mono">{detectedText}</span>} /> : detectedText}
            {isMath && evaluatedResult !== null && evaluatedResult !== undefined && (
              <span className="ml-1 font-semibold tabular-nums text-pg-accent">{evaluatedResult}</span>
            )}
          </span>
          <button type="button" onClick={() => onConvertCluster?.(cluster)} className={`${btn} px-3 shrink-0 bg-pg-accent-tint text-pg-accent-on-tint hover:brightness-95`}>
            {UI.turnIntoText}
          </button>
          <button type="button" onClick={toggleMenu} aria-label="More for this reading" aria-expanded={menuOpen} title="More" className={`${iconBtn} shrink-0`}>
            <FiMoreHorizontal className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );

  const menu =
    read && menuOpen ? (
      <div role="menu" aria-label="Reading" className="flex flex-wrap items-center gap-1">
        {onOpenFix && (
          <button type="button" role="menuitem" onClick={() => { closeMenu(); onOpenFix(cluster); }} className={menuItem}>
            <FiEdit2 className="w-3.5 h-3.5 text-pg-text2" aria-hidden="true" />
            {UI.fix}
          </button>
        )}
        {!isMath && onReadAsMath && (
          <button type="button" role="menuitem" onClick={() => { closeMenu(); onReadAsMath(cluster); }} className={menuItem}>
            {UI.readAsMaths}
          </button>
        )}
        {isMath && onReadAsText && (
          <button type="button" role="menuitem" onClick={() => { closeMenu(); onReadAsText(cluster); }} className={menuItem}>
            {UI.readAsText}
          </button>
        )}
        {isMath && onPlotClusterGraph && (
          <button type="button" role="menuitem" onClick={() => { closeMenu(); onPlotClusterGraph(cluster); }} className={menuItem}>
            <FiBarChart2 className="w-3.5 h-3.5 text-pg-text2" aria-hidden="true" />
            {UI.plotGraph}
          </button>
        )}
      </div>
    ) : null;

  return { row, menu };
}

/**
 * The readings of handwriting, as small pills beside the ink.
 *
 * A pill shows what was read and "Turn into typed text". Its ⋯ button opens the rest: Fix,
 * Read as maths / Read as text, Plot graph. Pills are hidden while you write.
 * hideSelection: lassoed ink shows its reading in the lasso's context bar instead.
 */
export default function LiveMathPreviewOverlay({
  clusters = [],
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  isDrawing = false,
  visible = true,
  selectedClusterId = null,
  hideSelection = false,
  onConvertCluster,
  onPlotClusterGraph,
  onOpenFix,
  onReadAsMath,
  onReadAsText,
}) {
  const [menuFor, setMenuFor] = useState(null);

  if (isDrawing || !clusters || clusters.length === 0) return null;

  // Lassoed ink and the selected pill always show; the rest only while readings are on
  const shown = clusters.filter((cluster) => {
    const isSelection = cluster.clusterId && cluster.clusterId.startsWith('selection_');
    if (isSelection) return !hideSelection;
    if (selectedClusterId === cluster.clusterId) return true;
    if (!visible) return false;
    // Ordinary handwriting kept as ink has nothing to offer, unless it holds an "=" to answer
    return !(cluster.shouldConvert === false && !cluster.hasEqualsGesture);
  });
  if (shown.length === 0) return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const spots = new Map(placePills(shown, zoomLevel, panOffset, vw, vh).map((p) => [p.id, p]));
  const handlers = { onConvertCluster, onPlotClusterGraph, onOpenFix, onReadAsMath, onReadAsText };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {shown.map((cluster) => {
        const spot = spots.get(cluster.clusterId);
        const menuOpen = menuFor === cluster.clusterId;
        const { row, menu } = readingParts(cluster, {
          menuOpen,
          toggleMenu: () => setMenuFor(menuOpen ? null : cluster.clusterId),
          closeMenu: () => setMenuFor(null),
          handlers,
        });

        return (
          <div
            key={cluster.clusterId}
            data-reading-pill
            style={{ transform: `translate(${spot.x}px, ${spot.y}px)` }}
            className="absolute top-0 left-0 pointer-events-auto flex flex-col gap-1 max-w-[320px] min-h-[40px] justify-center p-1 pl-3 rounded-xl bg-pg-surface border border-pg-line shadow-pg-bar text-pg-label"
          >
            {row}
            {menu && <div className="pt-1 border-t border-pg-line">{menu}</div>}
          </div>
        );
      })}
    </div>
  );
}
