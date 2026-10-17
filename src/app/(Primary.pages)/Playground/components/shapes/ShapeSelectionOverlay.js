'use client';

import React from 'react';
import {
  RESIZE_HANDLES, frameToWorld, localToWorld, shapeGeometry, isLineShape, lineEndpoints,
} from '../../utils/shapes/shapeModel';
import { framesBounds } from '../../utils/shapes/shapeArrange';
import { pgColour } from '../ui/tokens';

const HANDLE_ANGLES = { n: -90, ne: -45, e: 0, se: 45, s: 90, sw: 135, w: 180, nw: -135 };
const CURSORS = ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'];
const GUIDE = '#EC4899'; // smart guides, as Word draws them in a bright colour

const rotateOffsetFor = (coarse) => (coarse ? 36 : 26); // screen px above the top edge

/**
 * Where the rotate handle is on screen (null when there is none: a single line). The format
 * bar is placed clear of it, so the handle is never covered.
 */
export function rotateHandleAt(shapes, zoomLevel, panOffset, coarse = false) {
  if (!shapes || shapes.length === 0) return null;
  const toScreen = (p) => ({ x: p.x * zoomLevel + panOffset.x, y: p.y * zoomLevel + panOffset.y });
  const rotateOffset = rotateOffsetFor(coarse);
  if (shapes.length === 1) {
    const shape = shapes[0];
    if (isLineShape(shape)) return null;
    return toScreen(frameToWorld(shape, { x: shape.w / 2, y: -rotateOffset / zoomLevel }));
  }
  const box = framesBounds(shapes);
  const top = toScreen({ x: (box.minX + box.maxX) / 2, y: box.minY });
  return { x: top.x, y: top.y - rotateOffset };
}

// The resize cursor follows the shape's rotation, as in Word
function resizeCursor(handle, rot) {
  const angle = ((((HANDLE_ANGLES[handle] + rot) % 180) + 180) % 180);
  return CURSORS[Math.round(angle / 45) % 4];
}

/**
 * Handles around the selected shapes, in screen space, Word style: a frame that turns with the
 * shape, 8 white resize handles, a rotate handle above the top edge, yellow adjustment handles
 * from the shape's own definition, and end handles on lines. Several shapes, or a group, get
 * one frame around them all with the same handles, so they resize and rotate as one. Each
 * handle is small to look at but takes a 44 px touch on touch screens.
 *
 * While shapes are moved, smart guides show where they line up with others (`guides`); while a
 * connector end is dragged, the connection points of shapes nearby show (`connections`), the
 * one it will attach to larger (`attached`).
 */
export default function ShapeSelectionOverlay({ shapes, zoomLevel, panOffset, width, height, coarse = false, group = false, guides = null, connections = null, attached = null, onBeginGesture, onBodyContextMenu }) {
  if (!shapes || shapes.length === 0) return null;

  const toScreen = (p) => ({ x: p.x * zoomLevel + panOffset.x, y: p.y * zoomLevel + panOffset.y });
  const single = shapes.length === 1 ? shapes[0] : null;
  const hitR = coarse ? 22 : 10;
  const dotR = coarse ? 7 : 5;
  // The selection look shared with ink and blocks: outline and handle edges in the selection
  // colour, square resize handles, a round rotate handle
  const ACCENT = pgColour('accent');
  const SURFACE = pgColour('surface');

  const grab = (kind, opts, cursor) => ({
    style: { pointerEvents: 'all', cursor, touchAction: 'none' },
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      onBeginGesture(kind, e, opts);
    },
  });

  const handleDot = (key, at, kind, opts, cursor, look) => (
    <g key={key} transform={`translate(${at.x} ${at.y})`} {...grab(kind, opts, cursor)} data-shape-handle={key}>
      <circle r={hitR} fill="transparent" />
      {look}
    </g>
  );
  const resizeLook = <rect x={-dotR} y={-dotR} width={dotR * 2} height={dotR * 2} rx="1.5" fill={SURFACE} stroke={ACCENT} strokeWidth="1.5" />;
  const rotateLook = (
    <g>
      <circle r={dotR + 3} fill={SURFACE} stroke={ACCENT} strokeWidth="1.5" />
      <path d="M3.2 -2.2 A3.6 3.6 0 1 0 3.4 1.8" fill="none" stroke={ACCENT} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M1.4 -3.6 L3.6 -2.1 L1.6 -0.4" fill="none" stroke={ACCENT} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

  const items = [];
  const ids = shapes.map((s) => s.id);
  for (const shape of shapes) {
    if (isLineShape(shape)) {
      const ends = lineEndpoints(shape);
      const a = toScreen(ends.start);
      const b = toScreen(ends.end);
      items.push(<line key={`${shape.id}-hl`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={ACCENT} strokeOpacity="0.35" strokeWidth={Math.max(4, shape.line.width * zoomLevel + 4)} strokeLinecap="round" />);
      // Several shapes: the line's body moves them all
      if (!single) {
        items.push(<line key={`${shape.id}-body`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={Math.max(hitR, shape.line.width * zoomLevel + 8)} {...grab('move', { ids, hitId: shape.id }, 'move')} data-shape-body={shape.id} />);
      }
      if (single) {
        for (const [which, at] of [['start', a], ['end', b]]) {
          // An attached end is drawn filled, as Word marks a glued connector end
          const glued = shape.conn && shape.conn[which];
          items.push(handleDot(`${shape.id}-${which}`, at, 'line-end', { which }, 'move', <circle r={dotR + 1} fill={glued ? ACCENT : SURFACE} stroke={ACCENT} strokeWidth="1.5" />));
        }
      }
    } else {
      const corners = [[0, 0], [shape.w, 0], [shape.w, shape.h], [0, shape.h]].map(([x, y]) => toScreen(frameToWorld(shape, { x, y })));
      const points = corners.map((c) => `${c.x},${c.y}`).join(' ');
      // The body: dragging it moves the selection; a second tap or click opens the text;
      // the right button opens the shape menu
      items.push(
        <polygon
          key={`${shape.id}-body`}
          points={points}
          fill="transparent"
          {...grab('move', { ids, hitId: shape.id }, 'move')}
          onContextMenu={onBodyContextMenu ? (e) => {
            e.preventDefault();
            onBodyContextMenu({ x: e.clientX, y: e.clientY });
          } : undefined}
          data-shape-body={shape.id}
        />
      );
      items.push(<polygon key={`${shape.id}-frame`} points={points} fill="none" stroke={ACCENT} strokeWidth="1.5" strokeOpacity={single ? 1 : 0.6} strokeDasharray={group ? '3 3' : undefined} pointerEvents="none" />);

      if (single) {
        const screenW = shape.w * zoomLevel;
        const screenH = shape.h * zoomLevel;
        for (const [handle, [fx, fy]] of Object.entries(RESIZE_HANDLES)) {
          // Small shapes keep only their corner handles, as in Word
          const edge = fx === 0.5 || fy === 0.5;
          if (edge && ((fx === 0.5 && screenW < 40) || (fy === 0.5 && screenH < 40))) continue;
          const at = toScreen(frameToWorld(shape, { x: fx * shape.w, y: fy * shape.h }));
          items.push(handleDot(`${shape.id}-${handle}`, at, 'resize', { handle }, resizeCursor(handle, shape.rot || 0), resizeLook));
        }
        items.push(handleDot(`${shape.id}-rotate`, rotateHandleAt(shapes, zoomLevel, panOffset, coarse), 'rotate', {}, 'grab', rotateLook));
      }
    }

    if (single) {
      shapeGeometry(shape).handles.forEach((h, index) => {
        const at = toScreen(localToWorld(shape, h));
        items.push(handleDot(`${shape.id}-adj-${index}`, at, 'adjust', { index }, 'pointer', <rect x={-dotR} y={-dotR} width={dotR * 2} height={dotR * 2} rx={dotR} fill="#FACC15" stroke="#713F12" strokeWidth="1" />));
      });
    }
  }

  // Several shapes or a group: one frame around them all, resized and rotated as one
  if (!single) {
    const box = framesBounds(shapes);
    const a = toScreen({ x: box.minX, y: box.minY });
    const b = toScreen({ x: box.maxX, y: box.maxY });
    const w = b.x - a.x;
    const h = b.y - a.y;
    items.push(<rect key="all-frame" x={a.x} y={a.y} width={w} height={h} fill="none" stroke={ACCENT} strokeWidth="1.5" pointerEvents="none" data-selection-frame={group ? 'group' : 'many'} />);
    for (const [handle, [fx, fy]] of Object.entries(RESIZE_HANDLES)) {
      const edge = fx === 0.5 || fy === 0.5;
      if (edge && ((fx === 0.5 && w < 40) || (fy === 0.5 && h < 40))) continue;
      items.push(handleDot(`all-${handle}`, { x: a.x + fx * w, y: a.y + fy * h }, 'resize-many', { handle }, resizeCursor(handle, 0), resizeLook));
    }
    items.push(handleDot('all-rotate', rotateHandleAt(shapes, zoomLevel, panOffset, coarse), 'rotate-many', {}, 'grab', rotateLook));
  }

  // Smart guides while moving
  for (const [i, gd] of (guides || []).entries()) {
    const p = gd.axis === 'x' ? [toScreen({ x: gd.at, y: gd.from }), toScreen({ x: gd.at, y: gd.to })] : [toScreen({ x: gd.from, y: gd.at }), toScreen({ x: gd.to, y: gd.at })];
    items.push(<line key={`guide-${i}`} x1={p[0].x} y1={p[0].y} x2={p[1].x} y2={p[1].y} stroke={GUIDE} strokeWidth="1" strokeDasharray="4 3" pointerEvents="none" data-smart-guide={gd.axis} />);
  }

  // Connection points near a connector end being dragged
  for (const c of connections || []) {
    const at = toScreen(c);
    const on = attached && Math.abs(attached.x - c.x) < 1e-6 && Math.abs(attached.y - c.y) < 1e-6;
    items.push(
      <g key={`cxn-${c.x}-${c.y}-${c.idx}`} transform={`translate(${at.x} ${at.y})`} pointerEvents="none" data-connection-point={on ? 'attached' : 'free'}>
        <circle r={on ? 6 : 4} fill={on ? ACCENT : SURFACE} stroke={ACCENT} strokeWidth="1.5" />
      </g>
    );
  }

  return (
    <svg className="absolute inset-0 z-30 pointer-events-none" width={width} height={height} data-shape-selection>
      {items}
    </svg>
  );
}
