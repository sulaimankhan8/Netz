'use client';

import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { extractPointerPoints, shouldRejectTouch } from '../utils/pointerEventsHandler';
import { MIN_ZOOM, MAX_ZOOM, visibleWorldRect, boxTouchesRect } from '../utils/viewportMath';
import { orderStrokesForPainting, paintedWidth } from '../utils/pageSvg';
import { drawSmoothStroke, calculateBoundingBox, strokeHasPressure } from '../utils/strokeSmoother';
import { SpatialStrokeIndex, intersectsBBox } from '../utils/spatialIndexRTree';
import { detectScratchOutGesture } from '../utils/spatialClusterer';
import { recognizeAndSnapShape } from '../utils/shapeRecognizer';
import { eraseFromStroke, strokeTouchesCircle } from '../utils/strokeEraser';
import { bboxOfStrokes, translateStroke, scaleStroke, duplicateStroke, recolorStroke } from '../utils/strokeTransform';
import { createShape, boxFromDrag, LINE_PRESETS } from '../utils/shapes/shapeModel';
import { drawShapeOnCanvas } from '../utils/shapes/shapeRender';

/**
 * Ray-casting algorithm to test whether a 2D point is enclosed in a polygon.
 * Correctly supports non-convex, arbitrary, and L-shaped selection loops.
 */
function isPointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  const x = point.x;
  const y = point.y;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * The canvases are backed by device pixels (width x devicePixelRatio) so ink stays sharp on
 * high-density screens; everything is still drawn in CSS pixel / canvas-world coordinates.
 */
function getPixelRatio() {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
}

function clearCanvas(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Viewport transform matrix (Pan & Zoom), scaled to device pixels
function applyWorldTransform(ctx, zoomLevel, panOffset) {
  const ratio = getPixelRatio();
  ctx.setTransform(zoomLevel * ratio, 0, 0, zoomLevel * ratio, panOffset.x * ratio, panOffset.y * ratio);
}

const SELECTION_PADDING = 8; // px on screen between the selected ink and its box
const SELECTION_HANDLE = 12; // px on screen, the resize handle at the box's bottom-right corner
const SHAPE_TAP_DISTANCE = 6; // px on screen: a shorter drag with the Shapes tool is a tap (default size)
// Two- and three-finger taps (undo, redo), as in drawing apps: the fingers land within this time
// of the first, move less than this, and are all lifted within the last limit
const MULTI_TAP_LAND_MS = 250;
const MULTI_TAP_MOVE_PX = 10;
const MULTI_TAP_MAX_MS = 400;

const WhiteboardCanvas = forwardRef(function WhiteboardCanvas(
  {
    activeTool = 'pen',
    strokeColor = '#3B82F6',
    strokeWidth = 3,
    strokeOpacity = 1,
    zoomLevel = 1,
    panOffset = { x: 0, y: 0 },
    width,
    height,
    snapShapes = false,
    shapeItem = null, // a gallery shape armed for drawing (Shapes tool), or null for freehand snapping
    shapeDefaults = null, // the user's default shape style
    onShapeDrawn,
    onSelectPress, // Select tool: (worldPoint, event) => true when a shape took the press
    onLassoFinished, // Select tool: (polygon, event) after every lasso (shapes inside it are selected)
    connectionHints, // Drawing a line: (start, end) => connection points of shapes near its ends ({ x, y, attached })
    fingerDraws = true,
    onViewportChange,
    eraserMode = 'stroke',
    eraserSize = 16,
    onStrokeAdded,
    onStrokesErased,
    onStrokesUpdated,
    onDrawingStateChange,
    onSelectionCompleted,
    onSelectionChange,
    onTwoFingerTap, // two fingers tap together: undo
    onThreeFingerTap, // three fingers tap together: redo
  },
  ref
) {
  // Canvas Refs
  const staticCanvasRef = useRef(null);
  const activeCanvasRef = useRef(null);
  const pixelRatio = getPixelRatio();

  // Inking State Refs
  const isDrawingRef = useRef(false);
  const activePointsRef = useRef([]);
  const activePointerTypeRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const shapeOriginRef = useRef(null);

  // Touch navigation & palm rejection state
  const touchPointsRef = useRef(new Map()); // pointerId -> { x, y } relative to the canvas
  const gestureRef = useRef(null); // two-finger pinch/pan, or one-finger pan when fingers do not draw
  const penStateRef = useRef({ isDown: false, lastActive: -Infinity });
  // A tap with several fingers (undo, redo): when it began, the most fingers down, where each
  // finger started, and whether it is still a tap (fingers landed together and did not move)
  const multiTapRef = useRef(null);

  // Lasso selection: the selected stroke ids with their bounding box, and a move / resize in progress
  const selectionRef = useRef(null);
  const selectionDragRef = useRef(null);

  // Eraser drag state
  const lastEraserPointRef = useRef(null);
  const erasedDuringDragRef = useRef(false);
  const strokesRef = useRef([]);
  const rtreeRef = useRef(new SpatialStrokeIndex());

  // Renders all committed strokes onto the Middle Static Offscreen Canvas Layer
  const redrawStaticLayer = useCallback(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    clearCanvas(ctx);

    // Apply viewport transform matrix (Pan & Zoom)
    applyWorldTransform(ctx, zoomLevel, panOffset);

    // Ink that is off screen is skipped: on a large page, zoomed in, that is most of it.
    // The margin covers the stroke's thickness, including the points of sharp shape corners.
    const view = visibleWorldRect(panOffset, zoomLevel, width, height);

    // Highlighter marks are painted first, so they sit under the writing instead of dimming it
    const strokes = orderStrokesForPainting(strokesRef.current);
    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i];
      if (!boxTouchesRect(stroke.bbox, view, paintedWidth(stroke) * 6 + 4)) continue;
      drawSmoothStroke(ctx, stroke.points, {
        color: stroke.color,
        width: stroke.width,
        tool: stroke.tool,
        shape: stroke.shape,
        opacity: stroke.opacity,
        hasPressure: stroke.hasPressure,
      });
    }
  }, [zoomLevel, panOffset, width, height]);

  // Adds one finished stroke to the committed-ink layer without repainting everything under it.
  // Right only for ink that belongs on top: a highlighter mark goes beneath the writing.
  const paintNewStroke = useCallback((stroke) => {
    const ctx = stroke.tool === 'highlighter' ? null : staticCanvasRef.current?.getContext('2d');
    if (!ctx) {
      redrawStaticLayer();
      return;
    }
    applyWorldTransform(ctx, zoomLevel, panOffset);
    drawSmoothStroke(ctx, stroke.points, {
      color: stroke.color,
      width: stroke.width,
      tool: stroke.tool,
      shape: stroke.shape,
      opacity: stroke.opacity,
      hasPressure: stroke.hasPressure,
    });
  }, [redrawStaticLayer, zoomLevel, panOffset]);

  // Expose imperatively callable helper to erase specific stroke IDs & load/clear page strokes
  useImperativeHandle(ref, () => ({
    getStrokes: () => strokesRef.current || [],
    eraseStrokesByIds: (strokeIdsToErase) => {
      if (!strokeIdsToErase || strokeIdsToErase.length === 0) return;
      clearSelection('cleared');
      strokesRef.current = strokesRef.current.filter((s) => !strokeIdsToErase.includes(s.id));
      rtreeRef.current.clear();
      strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
      redrawStaticLayer();
      if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
    },
    loadStrokes: (newStrokes = []) => {
      clearSelection('cleared');
      strokesRef.current = Array.isArray(newStrokes) ? [...newStrokes] : [];
      rtreeRef.current.clear();
      strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
      redrawStaticLayer();
    },
    clearStrokes: () => {
      clearSelection('cleared');
      strokesRef.current = [];
      rtreeRef.current.clear();
      redrawStaticLayer();
      if (onStrokesUpdated) onStrokesUpdated([]);
    },
    // Lasso selection actions (used by the selection toolbar and the Delete key)
    hasSelection: () => Boolean(selectionRef.current),
    deleteSelection,
    duplicateSelection,
    recolorSelection,
    clearSelection: () => clearSelection('cleared'),
  }));

  // Initial setup & resize handling (resizing the canvas element clears it, so it must be redrawn)
  useEffect(() => {
    redrawStaticLayer();
  }, [redrawStaticLayer, width, height]);

  // ── Lasso selection: move, resize, duplicate, recolour, delete ───────────────
  // Strokes are replaced by transformed copies, never changed in place: undo history and
  // saved pages keep references to the existing stroke objects.
  const getSelectedStrokes = () => {
    const selection = selectionRef.current;
    if (!selection) return [];
    const ids = new Set(selection.ids);
    return strokesRef.current.filter((s) => ids.has(s.id));
  };

  const notifySelection = (reason) => {
    if (!onSelectionChange) return;
    const selection = selectionRef.current;
    onSelectionChange(
      selection ? { strokeIds: selection.ids, strokes: getSelectedStrokes(), bbox: selection.bbox } : null,
      reason
    );
  };

  // Dashed box around the selected ink, with a resize handle at its bottom-right corner
  const drawSelectionOverlay = () => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    clearCanvas(ctx);

    const selection = selectionRef.current;
    if (!selection) return;

    applyWorldTransform(ctx, zoomLevel, panOffset);
    const pad = SELECTION_PADDING / zoomLevel;
    const handle = SELECTION_HANDLE / zoomLevel;
    const { minX, minY, maxX, maxY } = selection.bbox;

    ctx.save();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 1.5 / zoomLevel;
    ctx.setLineDash([6 / zoomLevel, 4 / zoomLevel]);
    ctx.strokeRect(minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad);
    ctx.setLineDash([]);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(maxX + pad - handle / 2, maxY + pad - handle / 2, handle, handle);
    ctx.strokeRect(maxX + pad - handle / 2, maxY + pad - handle / 2, handle, handle);
    ctx.restore();
  };

  const clearSelection = (reason) => {
    if (!selectionRef.current) return;
    selectionRef.current = null;
    selectionDragRef.current = null;
    const ctx = activeCanvasRef.current ? activeCanvasRef.current.getContext('2d') : null;
    if (ctx) clearCanvas(ctx);
    notifySelection(reason);
  };

  const replaceSelectedStrokes = (transform) => {
    const ids = new Set(selectionRef.current.ids);
    strokesRef.current = strokesRef.current.map((s) => (ids.has(s.id) ? transform(s) : s));
  };

  // Finishes an edit to the selection: one stroke update, so one undo step
  const commitSelectionEdit = (reason) => {
    rtreeRef.current.clear();
    strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
    redrawStaticLayer();
    if (selectionRef.current) {
      selectionRef.current = { ...selectionRef.current, bbox: bboxOfStrokes(getSelectedStrokes()) };
      drawSelectionOverlay();
    }
    if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
    notifySelection(reason);
  };

  const toCanvasPoint = (e) => {
    const rect = activeCanvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoomLevel,
      y: (e.clientY - rect.top - panOffset.y) / zoomLevel,
    };
  };

  // The shape a drag from `start` to the pointer makes (Shift: equal sides or 15° lines,
  // Ctrl: from the centre), or null while the press is still a tap
  const shapeFromPointer = (e, start) => {
    const end = toCanvasPoint(e);
    if (Math.hypot(end.x - start.x, end.y - start.y) * zoomLevel < SHAPE_TAP_DISTANCE) return null;
    const box = boxFromDrag(shapeItem, start, end, { keepRatio: e.shiftKey, fromCentre: e.ctrlKey || e.metaKey });
    return { box, shape: createShape(shapeItem, box, shapeDefaults) };
  };

  // Dashed box around a shape being drawn, with its size underneath (world transform already set)
  const drawShapeGuide = (ctx, box) => {
    const w = Math.round(box.w);
    const h = Math.round(box.h);
    ctx.save();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 1.5 / zoomLevel;
    ctx.setLineDash([5 / zoomLevel, 4 / zoomLevel]);
    ctx.strokeRect(box.x, box.y, Math.max(1, box.w), Math.max(1, box.h));
    ctx.setLineDash([]);
    const label = `${w} × ${h}`;
    ctx.font = `600 ${11 / zoomLevel}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const badgeW = ctx.measureText(label).width + 12 / zoomLevel;
    const badgeH = 18 / zoomLevel;
    const badgeX = box.x + box.w - badgeW;
    const badgeY = box.y + box.h + 6 / zoomLevel;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4 / zoomLevel);
    else ctx.rect(badgeX, badgeY, badgeW, badgeH);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, badgeX + badgeW / 2, badgeY + badgeH / 2);
    ctx.restore();
  };

  // Returns true when the press landed on the selection (or its handle) and a drag has begun
  const beginSelectionDrag = (e) => {
    const selection = selectionRef.current;
    const pt = toCanvasPoint(e);
    const pad = SELECTION_PADDING / zoomLevel;
    const handle = SELECTION_HANDLE / zoomLevel;
    const { minX, minY, maxX, maxY } = selection.bbox;

    const onHandle = Math.abs(pt.x - (maxX + pad)) <= handle && Math.abs(pt.y - (maxY + pad)) <= handle;
    const inside = pt.x >= minX - pad && pt.x <= maxX + pad && pt.y >= minY - pad && pt.y <= maxY + pad;
    if (!onHandle && !inside) return false;

    selectionDragRef.current = {
      type: onHandle ? 'scale' : 'move',
      start: pt,
      startBBox: selection.bbox,
      originals: getSelectedStrokes(),
      changed: false,
    };

    activeCanvasRef.current.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    activePointerTypeRef.current = e.pointerType;
    activePointerIdRef.current = e.pointerId;
    if (onDrawingStateChange) onDrawingStateChange(true);
    return true;
  };

  const updateSelectionDrag = (e) => {
    const drag = selectionDragRef.current;
    const pt = toCanvasPoint(e);
    const originalById = new Map(drag.originals.map((s) => [s.id, s]));

    if (drag.type === 'move') {
      const dx = pt.x - drag.start.x;
      const dy = pt.y - drag.start.y;
      replaceSelectedStrokes((s) => translateStroke(originalById.get(s.id), dx, dy));
    } else {
      // Resize from the bottom-right handle, keeping the top-left corner fixed and the proportions
      const origin = { x: drag.startBBox.minX, y: drag.startBBox.minY };
      const startWidth = Math.max(drag.startBBox.maxX - drag.startBBox.minX, 1);
      const startHeight = Math.max(drag.startBBox.maxY - drag.startBBox.minY, 1);
      // Follow the handle along the selection's longer side, measured from where the drag began,
      // so a flat selection (a single line) does not blow up and nothing jumps on the first move
      const rawFactor = startWidth >= startHeight
        ? (startWidth + (pt.x - drag.start.x)) / startWidth
        : (startHeight + (pt.y - drag.start.y)) / startHeight;
      const factor = Math.min(10, Math.max(0.1, rawFactor));
      replaceSelectedStrokes((s) => scaleStroke(originalById.get(s.id), factor, origin));
    }

    drag.changed = true;
    selectionRef.current = { ...selectionRef.current, bbox: bboxOfStrokes(getSelectedStrokes()) };
    redrawStaticLayer();
    drawSelectionOverlay();
  };

  const finishSelectionDrag = () => {
    const drag = selectionDragRef.current;
    selectionDragRef.current = null;
    if (drag.changed) {
      commitSelectionEdit('transform');
    } else {
      drawSelectionOverlay();
    }
  };

  const deleteSelection = () => {
    if (!selectionRef.current) return;
    const ids = new Set(selectionRef.current.ids);
    strokesRef.current = strokesRef.current.filter((s) => !ids.has(s.id));
    selectionRef.current = null;
    const ctx = activeCanvasRef.current ? activeCanvasRef.current.getContext('2d') : null;
    if (ctx) clearCanvas(ctx);
    commitSelectionEdit('deleted');
  };

  // The copies become the selection, so they can be dragged into place straight away
  const duplicateSelection = () => {
    if (!selectionRef.current) return;
    const offset = 24 / zoomLevel;
    const copies = getSelectedStrokes().map((s, i) =>
      duplicateStroke(s, offset, offset, `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${i}`)
    );
    strokesRef.current = [...strokesRef.current, ...copies];
    selectionRef.current = { ids: copies.map((s) => s.id), bbox: bboxOfStrokes(copies) };
    commitSelectionEdit('transform');
  };

  const recolorSelection = (color) => {
    if (!selectionRef.current) return;
    replaceSelectedStrokes((s) => recolorStroke(s, color));
    commitSelectionEdit('transform');
  };

  // The selection box follows the page when it is panned or zoomed
  useEffect(() => {
    if (selectionRef.current) drawSelectionOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel, panOffset, width, height]);

  // A selection belongs to the lasso; leaving any tool also clears what it drew on the top layer
  useEffect(() => {
    if (activeTool !== 'lasso') {
      clearSelection('cleared');
    } else if (selectionRef.current) {
      drawSelectionOverlay();
    }
    if (!isDrawingRef.current && !selectionRef.current) {
      const ctx = activeCanvasRef.current ? activeCanvasRef.current.getContext('2d') : null;
      if (ctx) clearCanvas(ctx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  // ── Eraser ───────────────────────────────────────────────────────────────────
  // The eraser has its own size, constant on screen whatever the zoom, and two modes:
  //   'stroke'  removes every stroke it touches
  //   'partial' rubs out only the part it passes over
  const eraseAlong = (points) => {
    const radius = eraserSize / zoomLevel;
    const erasedIds = [];

    // Fill the gaps of a fast drag so thin strokes between two pointer samples are not skipped
    const path = [];
    for (let i = 0; i < points.length; i++) {
      const prev = lastEraserPointRef.current;
      const pt = points[i];
      if (prev) {
        const steps = Math.ceil(Math.hypot(pt.x - prev.x, pt.y - prev.y) / Math.max(radius / 2, 0.5));
        for (let s = 1; s < steps; s++) {
          path.push({ x: prev.x + ((pt.x - prev.x) * s) / steps, y: prev.y + ((pt.y - prev.y) * s) / steps });
        }
      }
      path.push(pt);
      lastEraserPointRef.current = pt;
    }

    for (let i = 0; i < path.length; i++) {
      const { x, y } = path[i];
      const remaining = [];
      for (let j = 0; j < strokesRef.current.length; j++) {
        const stroke = strokesRef.current[j];
        if (eraserMode === 'partial') {
          const pieces = eraseFromStroke(stroke, x, y, radius, (n) => `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${n}`);
          if (pieces === null) {
            remaining.push(stroke);
          } else {
            erasedIds.push(stroke.id);
            remaining.push(...pieces);
          }
        } else if (strokeTouchesCircle(stroke, x, y, radius)) {
          erasedIds.push(stroke.id);
        } else {
          remaining.push(stroke);
        }
      }
      strokesRef.current = remaining;
    }

    if (erasedIds.length > 0) {
      erasedDuringDragRef.current = true;
      rtreeRef.current.clear();
      strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
      redrawStaticLayer();
      if (onStrokesErased) onStrokesErased(erasedIds);
      // "transient": more of the same drag may follow; the whole drag is one undo step
      if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current], { transient: true });
    }
  };

  // Shows the eraser's reach as a circle under the pointer (drawn in screen pixels)
  const drawEraserCursor = (clientX, clientY) => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = getPixelRatio();
    clearCanvas(ctx);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, eraserSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.10)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
  };

  // Pointer Down Handler
  const handlePointerDown = (e) => {
    if (activeTool === 'pan') return;

    const canvas = activeCanvasRef.current;
    if (!canvas) return;

    // With something selected, a press on it moves or resizes it; a press elsewhere lets it go
    if (activeTool === 'lasso' && selectionRef.current) {
      if (beginSelectionDrag(e)) return;
      clearSelection('cleared');
    }

    // A press on a shape selects it and starts moving it; anywhere else the lasso starts
    if (activeTool === 'lasso' && onSelectPress && onSelectPress(toCanvasPoint(e), e)) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    activePointerTypeRef.current = e.pointerType;
    activePointerIdRef.current = e.pointerId;

    if (onDrawingStateChange) onDrawingStateChange(true);

    const rect = canvas.getBoundingClientRect();
    const transform = { panOffset, zoomLevel };
    const points = extractPointerPoints(e.nativeEvent, rect, transform);

    activePointsRef.current = points;

    if (activeTool === 'shape' && shapeItem) {
      shapeOriginRef.current = toCanvasPoint(e);
      const ctx = canvas.getContext('2d');
      if (ctx) clearCanvas(ctx);
      return;
    }

    if (activeTool === 'eraser') {
      lastEraserPointRef.current = null;
      erasedDuringDragRef.current = false;
      eraseAlong(points);
      drawEraserCursor(e.clientX, e.clientY);
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        clearCanvas(ctx);
        applyWorldTransform(ctx, zoomLevel, panOffset);
        drawSmoothStroke(ctx, points, {
          color: strokeColor,
          width: strokeWidth,
          tool: activeTool,
          opacity: strokeOpacity,
        });
      }
    }
  };

  // Pointer Move Handler
  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;

    const canvas = activeCanvasRef.current;
    if (!canvas) return;

    if (selectionDragRef.current) {
      updateSelectionDrag(e);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const transform = { panOffset, zoomLevel };
    const newPoints = extractPointerPoints(e.nativeEvent, rect, transform);

    activePointsRef.current.push(...newPoints);

    // Drawing an armed shape: a live preview inside a dashed box, with its size
    if (activeTool === 'shape' && shapeItem) {
      const ctx = canvas.getContext('2d');
      const start = shapeOriginRef.current;
      if (!ctx || !start) return;
      clearCanvas(ctx);
      const preview = shapeFromPointer(e, start);
      if (preview) {
        applyWorldTransform(ctx, zoomLevel, panOffset);
        drawShapeOnCanvas(ctx, preview.shape, { scale: zoomLevel * getPixelRatio() });
        drawShapeGuide(ctx, preview.box);
        // A connector being drawn: the connection points near its ends, the one it attaches to filled
        if (connectionHints && LINE_PRESETS.has(shapeItem.preset)) {
          ctx.save();
          ctx.lineWidth = 1.5 / zoomLevel;
          ctx.strokeStyle = '#3B82F6';
          for (const hint of connectionHints(start, toCanvasPoint(e))) {
            ctx.beginPath();
            ctx.arc(hint.x, hint.y, (hint.attached ? 6 : 4) / zoomLevel, 0, Math.PI * 2);
            ctx.fillStyle = hint.attached ? '#3B82F6' : '#FFFFFF';
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      return;
    }

    if (activeTool === 'eraser') {
      eraseAlong(newPoints);
      drawEraserCursor(e.clientX, e.clientY);
    } else if (activeTool === 'lasso') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        clearCanvas(ctx);
        applyWorldTransform(ctx, zoomLevel, panOffset);

        const pts = activePointsRef.current;
        if (pts.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([6, 5]);
          ctx.strokeStyle = '#8B5CF6';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          // Pure open line lasso while actively drawing — no premature loop closure or fill
          ctx.stroke();
          ctx.restore();
        }
      }
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        clearCanvas(ctx);
        applyWorldTransform(ctx, zoomLevel, panOffset);

        drawSmoothStroke(ctx, activePointsRef.current, {
          color: strokeColor,
          width: strokeWidth,
          tool: activeTool,
          opacity: strokeOpacity,
          hasPressure: activePointerTypeRef.current === 'pen' && strokeHasPressure(activePointsRef.current),
        });
      }
    }
  };

  // Pointer Up Handler
  const handlePointerUp = (e) => {
    if (!isDrawingRef.current) return;

    const canvas = activeCanvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    isDrawingRef.current = false;
    activePointerTypeRef.current = null;
    activePointerIdRef.current = null;

    if (onDrawingStateChange) onDrawingStateChange(false);

    if (selectionDragRef.current) {
      finishSelectionDrag();
      return;
    }

    // Finishing an armed shape: the dragged box, or the shape's default size for a tap
    if (activeTool === 'shape' && shapeItem) {
      const start = shapeOriginRef.current;
      shapeOriginRef.current = null;
      activePointsRef.current = [];
      const ctx = canvas ? canvas.getContext('2d') : null;
      if (ctx) clearCanvas(ctx);
      if (start && onShapeDrawn) {
        const preview = shapeFromPointer(e, start);
        onShapeDrawn(preview ? preview.box : boxFromDrag(shapeItem, start, start, { tapped: true }), shapeItem);
      }
      return;
    }

    // A finger has no hover: once it lifts, the eraser ring under it goes too
    if (activeTool === 'eraser' && e.pointerType === 'touch') {
      const ctx = canvas ? canvas.getContext('2d') : null;
      if (ctx) clearCanvas(ctx);
    }

    // One eraser drag is one edit: report it once more, as final, so it becomes a single undo step
    if (activeTool === 'eraser' && erasedDuringDragRef.current) {
      erasedDuringDragRef.current = false;
      if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
    }

    if (activeTool === 'lasso' && activePointsRef.current.length > 2) {
      const pts = activePointsRef.current;
      const selectionBbox = calculateBoundingBox(pts);

      // Ray-Casting Point-in-Polygon Selection (Supports non-convex and L-shaped selections)
      const selectedStrokes = strokesRef.current.filter((s) => {
        // Fast AABB broad-phase rejection
        if (!intersectsBBox(selectionBbox, s.bbox)) {
          return false;
        }

        const strokePts = s.points || [];
        if (strokePts.length === 0) return false;

        let insideCount = 0;
        const step = strokePts.length > 20 ? 2 : 1;
        let totalTested = 0;
        for (let i = 0; i < strokePts.length; i += step) {
          totalTested++;
          if (isPointInPolygon(strokePts[i], pts)) {
            insideCount++;
          }
        }

        const ratio = insideCount / totalTested;
        const centroid = {
          x: (s.bbox.minX + s.bbox.maxX) / 2,
          y: (s.bbox.minY + s.bbox.maxY) / 2,
        };
        const centroidInside = isPointInPolygon(centroid, pts);

        // Include stroke if majority of points or centroid is strictly inside the lasso polygon
        return ratio >= 0.50 || (ratio >= 0.30 && centroidInside);
      });

      if (onLassoFinished) onLassoFinished(pts, e);

      // Clear the temporary lasso selection line from active canvas
      const canvas = activeCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          clearCanvas(ctx);
        }
      }

      if (selectedStrokes.length > 0) {
        // The selection box hugs the ink, not the loop that was drawn around it
        const inkBbox = bboxOfStrokes(selectedStrokes);
        selectionRef.current = { ids: selectedStrokes.map((s) => s.id), bbox: inkBbox };
        notifySelection('new');
        if (onSelectionCompleted) {
          onSelectionCompleted({
            strokes: selectedStrokes,
            strokeIds: selectedStrokes.map((s) => s.id),
            bbox: inkBbox,
            lassoPolygon: pts,
          });
        }
      }
    } else if (activeTool !== 'eraser' && activeTool !== 'lasso' && activePointsRef.current.length > 0) {
      let finalPoints = [...activePointsRef.current];
      let strokeBbox = calculateBoundingBox(finalPoints);

      // Auto-snap shape if shape snapping is enabled or requested
      let snappedShape = null;
      if (snapShapes || activeTool === 'shape') {
        const snapResult = recognizeAndSnapShape(finalPoints, strokeBbox);
        if (snapResult.isSnapped && snapResult.points) {
          finalPoints = snapResult.points;
          strokeBbox = calculateBoundingBox(finalPoints);
          snappedShape = snapResult.shape;
        }
      }

      const newStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        color: strokeColor,
        width: strokeWidth,
        tool: activeTool === 'shape' ? 'pen' : activeTool,
        points: finalPoints,
        bbox: strokeBbox,
        // A snapped shape is a drawing, not writing: it is drawn with sharp corners and
        // kept out of handwriting recognition
        ...(snappedShape ? { shape: snappedShape } : {}),
        // Pen presets may be translucent (pencil, marker); the highlighter has its own fixed look
        ...(strokeOpacity < 1 && activeTool !== 'highlighter' ? { opacity: strokeOpacity } : {}),
        // A real stylus varies its pressure: such strokes are drawn with a varying width
        ...(!snappedShape && strokeHasPressure(finalPoints) ? { hasPressure: true } : {}),
      };

      // Only pen ink can scratch out: colouring back and forth with the highlighter must not delete writing
      const scratchResult = activeTool === 'pen'
        ? detectScratchOutGesture(newStroke, strokesRef.current)
        : { isScratch: false, targetIds: [] };
      if (scratchResult.isScratch) {
        strokesRef.current = strokesRef.current.filter((s) => !scratchResult.targetIds.includes(s.id));
        rtreeRef.current.clear();
        strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
        redrawStaticLayer();
        if (onStrokesErased) onStrokesErased(scratchResult.targetIds);
        if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
      } else {
        strokesRef.current.push(newStroke);
        rtreeRef.current.insert(newStroke);
        paintNewStroke(newStroke);

        if (onStrokeAdded) onStrokeAdded(newStroke);
        if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
      }
    }

    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        clearCanvas(ctx);
      }
    }

    activePointsRef.current = [];
    if (selectionRef.current) drawSelectionOverlay();
  };

  // ── Input routing: who draws, who navigates ──────────────────────────────────
  // Every pointer may draw: mouse, trackpad cursor, finger, pen. On top of that:
  //   - two fingers pan and pinch-zoom the page (and never leave a mark)
  //   - a touch is ignored while a pen is writing or has just lifted (the resting palm)
  //   - with "finger draws" switched off, one finger moves the page instead of drawing

  // Drops a stroke that was started but must not be kept (second finger landed, pen arrived)
  const cancelActiveStroke = () => {
    if (!isDrawingRef.current) return;
    const canvas = activeCanvasRef.current;
    if (canvas && activePointerIdRef.current !== null && canvas.hasPointerCapture(activePointerIdRef.current)) {
      canvas.releasePointerCapture(activePointerIdRef.current);
    }
    isDrawingRef.current = false;
    shapeOriginRef.current = null;
    activePointerTypeRef.current = null;
    activePointerIdRef.current = null;
    activePointsRef.current = [];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) clearCanvas(ctx);
    }
    if (onDrawingStateChange) onDrawingStateChange(false);
  };

  const touchPosition = (e) => {
    const rect = activeCanvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const twoFingerState = () => {
    const [a, b] = [...touchPointsRef.current.values()];
    return {
      distance: Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  const onPointerDown = (e) => {
    const now = performance.now();

    if (e.pointerType === 'pen') {
      penStateRef.current = { isDown: true, lastActive: now };
      // The palm usually lands a moment before the pen tip: whatever it started is not writing
      if (activePointerTypeRef.current === 'touch') cancelActiveStroke();
      touchPointsRef.current.clear();
      gestureRef.current = null;
    }

    if (e.pointerType === 'touch') {
      if (shouldRejectTouch(penStateRef.current, now)) return;

      const canvas = activeCanvasRef.current;
      if (!canvas) return;
      const pos = touchPosition(e);
      if (touchPointsRef.current.size === 0) {
        multiTapRef.current = { start: now, starts: new Map(), most: 0, valid: true, view: { zoom: zoomLevel, pan: panOffset } };
      }
      const tap = multiTapRef.current;
      if (tap) {
        if (now - tap.start > MULTI_TAP_LAND_MS) tap.valid = false;
        tap.starts.set(e.pointerId, pos);
      }
      touchPointsRef.current.set(e.pointerId, pos);
      if (tap) tap.most = Math.max(tap.most, touchPointsRef.current.size);

      if (touchPointsRef.current.size === 2) {
        // Second finger: this is navigation, so the first finger's stroke is dropped
        cancelActiveStroke();
        canvas.setPointerCapture(e.pointerId);
        const { distance, mid } = twoFingerState();
        gestureRef.current = { type: 'pinch', startDistance: distance, startMid: mid, startZoom: zoomLevel, startPan: panOffset };
        return;
      }
      if (touchPointsRef.current.size > 2) return;

      if (!fingerDraws || activeTool === 'pan') {
        canvas.setPointerCapture(e.pointerId);
        gestureRef.current = { type: 'pan', pointerId: e.pointerId, start: touchPosition(e), startPan: panOffset };
        return;
      }
    }

    if (isDrawingRef.current) return; // another pointer is already drawing
    handlePointerDown(e);
  };

  const onPointerMove = (e) => {
    if (e.pointerType === 'pen') penStateRef.current.lastActive = performance.now();

    if (e.pointerType === 'touch' && touchPointsRef.current.has(e.pointerId)) {
      const pos = touchPosition(e);
      touchPointsRef.current.set(e.pointerId, pos);
      const tap = multiTapRef.current;
      const from = tap && tap.starts.get(e.pointerId);
      if (from && Math.hypot(pos.x - from.x, pos.y - from.y) > MULTI_TAP_MOVE_PX) tap.valid = false;
      const gesture = gestureRef.current;

      if (gesture && gesture.type === 'pinch') {
        if (touchPointsRef.current.size >= 2 && onViewportChange) {
          const { distance, mid } = twoFingerState();
          const zoom = Math.min(Math.max(gesture.startZoom * (distance / gesture.startDistance), MIN_ZOOM), MAX_ZOOM);
          // The canvas point that was between the fingers stays between the fingers
          const anchorX = (gesture.startMid.x - gesture.startPan.x) / gesture.startZoom;
          const anchorY = (gesture.startMid.y - gesture.startPan.y) / gesture.startZoom;
          onViewportChange({ zoom, pan: { x: mid.x - anchorX * zoom, y: mid.y - anchorY * zoom } });
        }
        return;
      }

      if (gesture && gesture.type === 'pan' && gesture.pointerId === e.pointerId) {
        if (onViewportChange) {
          const pos = touchPosition(e);
          onViewportChange({
            zoom: zoomLevel,
            pan: { x: gesture.startPan.x + (pos.x - gesture.start.x), y: gesture.startPan.y + (pos.y - gesture.start.y) },
          });
        }
        return;
      }
    }

    if (e.pointerId !== activePointerIdRef.current) {
      // Hovering with the eraser shows its reach before anything is touched
      if (activeTool === 'eraser' && !isDrawingRef.current && e.pointerType !== 'touch') {
        drawEraserCursor(e.clientX, e.clientY);
      }
      return;
    }
    handlePointerMove(e);
  };

  const onPointerLeave = () => {
    if (activeTool === 'eraser' && !isDrawingRef.current) {
      const ctx = activeCanvasRef.current ? activeCanvasRef.current.getContext('2d') : null;
      if (ctx) clearCanvas(ctx);
    }
  };

  // Returns true when the event belonged to touch navigation and is fully handled
  const finishMultiTap = () => {
    const tap = multiTapRef.current;
    multiTapRef.current = null;
    if (!tap || !tap.valid || performance.now() - tap.start > MULTI_TAP_MAX_MS) return;
    if (tap.most !== 2 && tap.most !== 3) return;
    // The fingers may have nudged the zoom a little: a tap leaves the view as it was
    if (onViewportChange && (tap.view.zoom !== zoomLevel || tap.view.pan.x !== panOffset.x || tap.view.pan.y !== panOffset.y)) {
      onViewportChange(tap.view);
    }
    if (tap.most === 2) onTwoFingerTap?.();
    else onThreeFingerTap?.();
  };

  const releaseTouch = (e) => {
    if (e.pointerType !== 'touch' || !touchPointsRef.current.has(e.pointerId)) return false;
    touchPointsRef.current.delete(e.pointerId);
    if (touchPointsRef.current.size === 0) finishMultiTap();

    const canvas = activeCanvasRef.current;
    const gesture = gestureRef.current;
    if (!gesture) return false;

    if (canvas && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (gesture.type === 'pan' || touchPointsRef.current.size < 2) {
      // The finger left on the screen after a pinch does nothing until it is lifted
      gestureRef.current = null;
    }
    return true;
  };

  const onPointerUp = (e) => {
    if (e.pointerType === 'pen') penStateRef.current = { isDown: false, lastActive: performance.now() };
    if (releaseTouch(e)) return;
    if (e.pointerId !== activePointerIdRef.current) return;
    handlePointerUp(e);
  };

  const onPointerCancel = (e) => {
    if (e.pointerType === 'pen') penStateRef.current = { isDown: false, lastActive: performance.now() };
    if (releaseTouch(e)) return;
    if (e.pointerId !== activePointerIdRef.current) return;
    // The system took the touch away mid-stroke (a gesture, an alert): that was not a finished stroke
    if (e.pointerType === 'touch') {
      cancelActiveStroke();
    } else {
      handlePointerUp(e);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Middle Layer: Static Ink Canvas (Offscreen Baked Strokes) */}
      <canvas
        ref={staticCanvasRef}
        width={Math.round(width * pixelRatio)}
        height={Math.round(height * pixelRatio)}
        style={{ width, height }}
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* Top Layer: Active Scratchpad Canvas (O(1) Active Stroke Render & Pointer Events) */}
      <canvas
        ref={activeCanvasRef}
        width={Math.round(width * pixelRatio)}
        height={Math.round(height * pixelRatio)}
        style={{ width, height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
        className={`absolute inset-0 z-20 touch-none ${
          activeTool === 'pan'
            ? 'cursor-grab active:cursor-grabbing'
            : activeTool === 'eraser'
            ? 'cursor-none'
            : 'cursor-crosshair'
        }`}
      />
    </div>
  );
});

export default WhiteboardCanvas;
