'use client';

import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { extractPointerPoints, isPalmTouch } from '../utils/pointerEventsHandler';
import { drawSmoothStroke, calculateBoundingBox } from '../utils/strokeSmoother';
import { SpatialStrokeIndex, intersectsBBox } from '../utils/spatialIndexRTree';
import { detectScratchOutGesture } from '../utils/spatialClusterer';
import { recognizeAndSnapShape } from '../utils/shapeRecognizer';

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

const WhiteboardCanvas = forwardRef(function WhiteboardCanvas(
  {
    activeTool = 'pen',
    strokeColor = '#3B82F6',
    strokeWidth = 3,
    zoomLevel = 1,
    panOffset = { x: 0, y: 0 },
    width,
    height,
    snapShapes = false,
    onStrokeAdded,
    onStrokesErased,
    onStrokesUpdated,
    onDrawingStateChange,
    onSelectionCompleted,
  },
  ref
) {
  // Canvas Refs
  const staticCanvasRef = useRef(null);
  const activeCanvasRef = useRef(null);

  // Inking State Refs
  const isDrawingRef = useRef(false);
  const activePointsRef = useRef([]);
  const activePointerTypeRef = useRef(null);
  const strokesRef = useRef([]);
  const rtreeRef = useRef(new SpatialStrokeIndex());

  // Renders all committed strokes onto the Middle Static Offscreen Canvas Layer
  const redrawStaticLayer = useCallback(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Apply viewport transform matrix (Pan & Zoom)
    ctx.setTransform(zoomLevel, 0, 0, zoomLevel, panOffset.x, panOffset.y);

    const strokes = strokesRef.current;
    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i];
      drawSmoothStroke(ctx, stroke.points, {
        color: stroke.color,
        width: stroke.width,
        tool: stroke.tool,
      });
    }
  }, [width, height, zoomLevel, panOffset]);

  // Expose imperatively callable helper to erase specific stroke IDs & load/clear page strokes
  useImperativeHandle(ref, () => ({
    getStrokes: () => strokesRef.current || [],
    eraseStrokesByIds: (strokeIdsToErase) => {
      if (!strokeIdsToErase || strokeIdsToErase.length === 0) return;
      strokesRef.current = strokesRef.current.filter((s) => !strokeIdsToErase.includes(s.id));
      rtreeRef.current.clear();
      strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
      redrawStaticLayer();
      if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
    },
    loadStrokes: (newStrokes = []) => {
      strokesRef.current = Array.isArray(newStrokes) ? [...newStrokes] : [];
      rtreeRef.current.clear();
      strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
      redrawStaticLayer();
    },
    clearStrokes: () => {
      strokesRef.current = [];
      rtreeRef.current.clear();
      redrawStaticLayer();
      if (onStrokesUpdated) onStrokesUpdated([]);
    },
  }));

  // Initial setup & resize handling
  useEffect(() => {
    redrawStaticLayer();
  }, [redrawStaticLayer]);

  // Pointer Down Handler
  const handlePointerDown = (e) => {
    if (activeTool === 'pan') return;
    if (isPalmTouch(e.nativeEvent, activePointerTypeRef.current)) return;

    const canvas = activeCanvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    activePointerTypeRef.current = e.pointerType;

    if (onDrawingStateChange) onDrawingStateChange(true);

    const rect = canvas.getBoundingClientRect();
    const transform = { panOffset, zoomLevel };
    const points = extractPointerPoints(e.nativeEvent, rect, transform);

    activePointsRef.current = points;

    if (activeTool === 'eraser') {
      const pt = points[0];
      if (pt) {
        const hits = rtreeRef.current.queryPoint(pt.x, pt.y, strokeWidth * 3);
        if (hits.length > 0) {
          const hitIds = hits.map((s) => s.id);
          strokesRef.current = strokesRef.current.filter((s) => !hitIds.includes(s.id));
          rtreeRef.current.clear();
          strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
          redrawStaticLayer();
          if (onStrokesErased) onStrokesErased(hitIds);
          if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
        }
      }
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.setTransform(zoomLevel, 0, 0, zoomLevel, panOffset.x, panOffset.y);
        drawSmoothStroke(ctx, points, {
          color: strokeColor,
          width: strokeWidth,
          tool: activeTool,
        });
      }
    }
  };

  // Pointer Move Handler
  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;
    if (isPalmTouch(e.nativeEvent, activePointerTypeRef.current)) return;

    const canvas = activeCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const transform = { panOffset, zoomLevel };
    const newPoints = extractPointerPoints(e.nativeEvent, rect, transform);

    activePointsRef.current.push(...newPoints);

    if (activeTool === 'eraser') {
      let erasedAny = false;
      const hitIds = [];

      for (let i = 0; i < newPoints.length; i++) {
        const pt = newPoints[i];
        const hits = rtreeRef.current.queryPoint(pt.x, pt.y, strokeWidth * 3);
        for (let j = 0; j < hits.length; j++) {
          if (!hitIds.includes(hits[j].id)) {
            hitIds.push(hits[j].id);
            erasedAny = true;
          }
        }
      }

      if (erasedAny) {
        strokesRef.current = strokesRef.current.filter((s) => !hitIds.includes(s.id));
        rtreeRef.current.clear();
        strokesRef.current.forEach((s) => rtreeRef.current.insert(s));
        redrawStaticLayer();
        if (onStrokesErased) onStrokesErased(hitIds);
        if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
      }
    } else if (activeTool === 'lasso') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.setTransform(zoomLevel, 0, 0, zoomLevel, panOffset.x, panOffset.y);

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
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.setTransform(zoomLevel, 0, 0, zoomLevel, panOffset.x, panOffset.y);

        drawSmoothStroke(ctx, activePointsRef.current, {
          color: strokeColor,
          width: strokeWidth,
          tool: activeTool,
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

    if (onDrawingStateChange) onDrawingStateChange(false);

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

      // Clear the temporary lasso selection line from active canvas
      const canvas = activeCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, width, height);
        }
      }

      if (onSelectionCompleted && selectedStrokes.length > 0) {
        onSelectionCompleted({
          strokes: selectedStrokes,
          strokeIds: selectedStrokes.map((s) => s.id),
          bbox: selectionBbox,
          lassoPolygon: pts,
        });
      }
    } else if (activeTool !== 'eraser' && activeTool !== 'lasso' && activePointsRef.current.length > 0) {
      let finalPoints = [...activePointsRef.current];
      let strokeBbox = calculateBoundingBox(finalPoints);

      // Auto-snap shape if shape snapping is enabled or requested
      if (snapShapes || activeTool === 'shape') {
        const snapResult = recognizeAndSnapShape(finalPoints, strokeBbox);
        if (snapResult.isSnapped && snapResult.points) {
          finalPoints = snapResult.points;
          strokeBbox = calculateBoundingBox(finalPoints);
        }
      }

      const newStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        color: strokeColor,
        width: strokeWidth,
        tool: activeTool === 'shape' ? 'pen' : activeTool,
        points: finalPoints,
        bbox: strokeBbox,
      };

      const scratchResult = detectScratchOutGesture(newStroke, strokesRef.current);
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
        redrawStaticLayer();

        if (onStrokeAdded) onStrokeAdded(newStroke);
        if (onStrokesUpdated) onStrokesUpdated([...strokesRef.current]);
      }
    }

    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
      }
    }

    activePointsRef.current = [];
  };

  return (
    <div className="relative w-full h-full">
      {/* Middle Layer: Static Ink Canvas (Offscreen Baked Strokes) */}
      <canvas
        ref={staticCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* Top Layer: Active Scratchpad Canvas (O(1) Active Stroke Render & Pointer Events) */}
      <canvas
        ref={activeCanvasRef}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 z-20 touch-none ${
          activeTool === 'pan'
            ? 'cursor-grab active:cursor-grabbing'
            : activeTool === 'eraser'
            ? 'cursor-crosshair'
            : 'cursor-crosshair'
        }`}
      />
    </div>
  );
});

export default WhiteboardCanvas;
