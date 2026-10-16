'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  hitTestShapes, moveShape, resizeShape, rotateShape, adjustShape, moveLineEnd,
  duplicateShape, styleShape, reorderShapes, rotateBy, flipShape, lineEndpoints,
} from '../../utils/shapes/shapeModel';
import {
  expandToGroups, isWholeGroup, groupShapes, ungroupShapes, alignShapes, distributeShapes,
  framesBounds, frameBounds, resizeBox, scaleShapes, rotateShapesAbout, flipShapesAbout, handleAngle,
  changeShape, canChangeShape, snapMove, nearestConnection, shapesNear, connectionPoints, setConnection,
  lineBetween, detachMoved, nextShapeSelection, steppedTextSize, newGroupId,
} from '../../utils/shapes/shapeArrange';

const DRAG_THRESHOLD = 3; // screen px a press must travel before it moves a shape
const DUPLICATE_OFFSET = 20; // canvas px
const DOUBLE_TAP_MS = 400; // a second tap on the same shape within this opens its text
const LONG_PRESS_MS = 550; // a finger or pen held still this long opens the shape menu
const GUIDE_SNAP_PX = 6; // screen px within which a moved shape snaps to another's edge or middle
const CONNECT_SNAP_PX = 12; // screen px within which a connector end attaches to a connection point
const CONNECT_SHOW_PX = 40; // screen px around a shape within which its connection points show

// Cut and copied shapes, shared by every page of the notebook
let shapeClipboard = [];

/** Copies get new ids; a group stays a group (with a new group id), connectors stay attached among the copies. */
function copiesOf(shapes, dx, dy) {
  const ids = new Map();
  const groups = new Map();
  const copies = shapes.map((s) => {
    const c = duplicateShape(s, dx, dy);
    ids.set(s.id, c.id);
    if (s.groupId) {
      if (!groups.has(s.groupId)) groups.set(s.groupId, newGroupId());
      c.groupId = groups.get(s.groupId);
    }
    return c;
  });
  return copies.map((c) => {
    if (!c.conn) return c;
    let next = c;
    for (const which of ['start', 'end']) {
      const end = c.conn[which];
      if (!end) continue;
      next = ids.has(end.id) ? setConnection(next, which, { id: ids.get(end.id), idx: end.idx }) : setConnection(next, which, null);
    }
    return next;
  });
}

/**
 * Selecting and editing shapes.
 *
 * @param {Object} options
 * @param {{ current: Array<Object> }} options.shapesRef - The page's shapes, always current
 * @param {(next: Array<Object>, info?: { live?: boolean }) => void} options.applyShapes
 *   Replaces the page's shapes. `live` marks the in-between states of a drag.
 * @param {{ current: { zoom: number, pan: { x: number, y: number } } }} options.viewportRef
 * @param {{ current: HTMLElement }} options.containerRef
 * @param {(active: boolean) => void} options.onGestureActive - A drag started or ended
 *   (the page holds saving and undo steps until it ends, so one drag is one undo step)
 * @param {(shapeId: string) => void} [options.onDoubleTap] - Double tap or double click on a shape (type in it)
 * @param {(point: { x: number, y: number }) => void} [options.onLongPress] - Touch or pen held on a shape (its menu)
 */
export function useShapeEditor({ shapes, shapesRef, applyShapes, viewportRef, containerRef, onGestureActive, onDoubleTap, onLongPress }) {
  const [selectedIds, setSelectedIdsRaw] = useState([]);
  const [gestureInfo, setGestureInfo] = useState(null);
  const selectedRef = useRef(selectedIds);
  selectedRef.current = selectedIds;
  // A group is always selected whole
  const setSelectedIds = useCallback((ids) => {
    setSelectedIdsRaw((current) => {
      const raw = typeof ids === 'function' ? ids(current) : ids;
      const next = expandToGroups(shapesRef.current, raw);
      return next.length === current.length && next.every((id, i) => id === current[i]) ? current : next;
    });
  }, [shapesRef]);
  const gestureRef = useRef(null);
  // The latest callbacks, so the functions below never change identity (a drag in progress
  // must not be ended because the page re-rendered)
  const applyRef = useRef(applyShapes);
  applyRef.current = applyShapes;
  const gestureActiveRef = useRef(onGestureActive);
  gestureActiveRef.current = onGestureActive;
  const doubleTapRef = useRef(onDoubleTap);
  doubleTapRef.current = onDoubleTap;
  const longPressRef = useRef(onLongPress);
  longPressRef.current = onLongPress;
  const lastTapRef = useRef({ id: null, time: 0 });
  const pasteCountRef = useRef(0);

  // The selection only ever holds shapes that exist (after undo, delete, another page)
  useEffect(() => {
    setSelectedIdsRaw((ids) => {
      if (ids.length === 0) return ids;
      const alive = ids.filter((id) => shapes.some((s) => s.id === id));
      return alive.length === ids.length ? ids : alive;
    });
  }, [shapes]);

  const toWorld = useCallback((e) => {
    const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : { left: 0, top: 0 };
    const { zoom, pan } = viewportRef.current;
    return { x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom };
  }, [containerRef, viewportRef]);

  const finishGesture = useCallback((commit) => {
    const g = gestureRef.current;
    if (!g) return;
    gestureRef.current = null;
    g.cleanup();
    setGestureInfo(null);
    if (!g.active) {
      // A tap: a second one on the same shape opens its text, as a double click does in Word
      if (commit && g.kind === 'move' && g.opts.hitId && !g.longPressed) {
        const now = performance.now();
        const last = lastTapRef.current;
        if (last.id === g.opts.hitId && now - last.time < DOUBLE_TAP_MS) {
          lastTapRef.current = { id: null, time: 0 };
          if (doubleTapRef.current) doubleTapRef.current(g.opts.hitId);
        } else {
          lastTapRef.current = { id: g.opts.hitId, time: now };
        }
      }
      return;
    }
    if (!commit) {
      const originals = new Map(g.originals.map((s) => [s.id, s]));
      applyRef.current(shapesRef.current.map((s) => originals.get(s.id) || s), { live: true });
    }
    gestureActiveRef.current(false);
  }, [shapesRef]);

  /**
   * Starts a drag: 'move' (opts.ids), 'resize' (opts.handle), 'rotate', 'adjust' (opts.index),
   * 'line-end' (opts.which), or for several shapes or a group as one: 'resize-many' (opts.handle)
   * and 'rotate-many'. Pointer events follow on the window until the press ends.
   */
  const beginGesture = useCallback((kind, e, opts = {}) => {
    finishGesture(true);
    const ids = opts.ids || selectedRef.current;
    const originals = shapesRef.current.filter((s) => ids.includes(s.id));
    if (originals.length === 0) return;

    const zoom = viewportRef.current.zoom || 1;
    const g = {
      kind,
      opts,
      pointerId: e.pointerId,
      startScreen: { x: e.clientX, y: e.clientY },
      start: toWorld(e),
      originals,
      active: false,
      box: framesBounds(originals),
    };
    if (kind === 'move') {
      // Smart guides: the other shapes' edges and middles (not ones being moved)
      const moving = new Set(originals.map((s) => s.id));
      g.others = shapesRef.current.filter((s) => !moving.has(s.id)).map(frameBounds);
    }
    if (kind === 'rotate-many') {
      g.centre = { x: (g.box.minX + g.box.maxX) / 2, y: (g.box.minY + g.box.maxY) / 2 };
      g.startAngle = handleAngle(g.centre, g.start);
    }

    const onMove = (ev) => {
      if (ev.pointerId !== g.pointerId) return;
      if (!g.active) {
        if (kind === 'move' && Math.hypot(ev.clientX - g.startScreen.x, ev.clientY - g.startScreen.y) < DRAG_THRESHOLD) return;
        g.active = true;
        gestureActiveRef.current(true);
      }
      const p = toWorld(ev);
      const changed = new Map();
      const first = g.originals[0];
      let info = null;
      switch (kind) {
        case 'move': {
          let dx = p.x - g.start.x;
          let dy = p.y - g.start.y;
          // Shift keeps the move straight across or straight down
          if (ev.shiftKey) {
            if (Math.abs(dx) > Math.abs(dy)) dy = 0;
            else dx = 0;
          }
          let guides = [];
          // Smart guides line it up with other shapes; Alt moves freely, as in Word. A Shift
          // move stays on its line (only the direction it moves in snaps)
          if (!ev.altKey && g.others.length) {
            const snapped = snapMove(g.box, g.others, dx, dy, GUIDE_SNAP_PX / zoom);
            const lockX = ev.shiftKey && dx === 0;
            const lockY = ev.shiftKey && dy === 0;
            if (!lockX) dx = snapped.dx;
            if (!lockY) dy = snapped.dy;
            guides = snapped.guides.filter((gd) => (gd.axis === 'x' ? !lockX : !lockY));
          }
          for (const s of g.originals) changed.set(s.id, moveShape(s, dx, dy));
          info = { guides };
          break;
        }
        case 'resize':
          changed.set(first.id, resizeShape(first, opts.handle, p, { keepRatio: ev.shiftKey || Boolean(first.lockRatio), fromCentre: ev.ctrlKey || ev.metaKey }));
          break;
        case 'rotate':
          changed.set(first.id, rotateShape(first, p, { step: ev.shiftKey ? 15 : 0, magnet: ev.pointerType === 'mouse' ? 0 : 3 }));
          break;
        case 'adjust':
          changed.set(first.id, adjustShape(first, opts.index, p));
          break;
        case 'line-end': {
          // Near a shape its connection points show; close to one, the end attaches to it
          const near = nearestConnection(shapesRef.current, p, CONNECT_SNAP_PX / zoom, [first.id]);
          let moved;
          if (near && !ev.altKey) {
            const ends = lineEndpoints(first);
            moved = setConnection(lineBetween(first, opts.which === 'start' ? near : ends.start, opts.which === 'end' ? near : ends.end), opts.which, near);
          } else {
            moved = setConnection(moveLineEnd(first, opts.which, p, { snap: ev.shiftKey }), opts.which, null);
          }
          changed.set(first.id, moved);
          const nearby = shapesNear(shapesRef.current, p, CONNECT_SHOW_PX / zoom, [first.id]);
          info = { connections: nearby.flatMap(connectionPoints), attached: near && !ev.altKey ? near : null };
          break;
        }
        case 'resize-many': {
          const to = resizeBox(g.box, opts.handle, p, { keepRatio: ev.shiftKey || g.originals.some((s) => s.lockRatio), fromCentre: ev.ctrlKey || ev.metaKey });
          for (const s of scaleShapes(g.originals, g.box, to)) changed.set(s.id, s);
          info = { w: Math.abs(to.x1 - to.x0), h: Math.abs(to.y1 - to.y0) };
          break;
        }
        case 'rotate-many': {
          let delta = handleAngle(g.centre, p) - g.startAngle;
          if (ev.shiftKey) delta = Math.round(delta / 15) * 15;
          for (const s of rotateShapesAbout(g.originals, g.centre, delta)) changed.set(s.id, s);
          info = { rot: ((Math.round(delta) % 360) + 360) % 360 };
          break;
        }
        default:
          return;
      }
      let next = shapesRef.current.map((s) => changed.get(s.id) || s);
      // A connector moved on its own lets go of the shapes it was attached to
      if (kind === 'move') next = detachMoved(next, g.originals.map((s) => s.id));
      applyRef.current(next, { live: true });
      const shown = changed.get(first.id);
      setGestureInfo({ kind, rot: shown.rot || 0, w: shown.w, h: shown.h, x: ev.clientX, y: ev.clientY, ...(info || {}) });
    };
    const onUp = (ev) => {
      if (ev.pointerId === g.pointerId) finishGesture(true);
    };
    const onCancel = (ev) => {
      if (ev.pointerId === g.pointerId) finishGesture(false);
    };
    // A second finger means the page is being pinched or panned: the drag is called off
    const onOtherDown = (ev) => {
      if (ev.pointerId !== g.pointerId && ev.pointerType === 'touch') finishGesture(false);
    };

    // A finger or pen held still on a shape opens its menu (a mouse uses the right button)
    const pressTimer = kind === 'move' && e.pointerType !== 'mouse' && longPressRef.current
      ? setTimeout(() => {
        if (gestureRef.current !== g || g.active) return;
        g.longPressed = true;
        const point = { x: g.startScreen.x, y: g.startScreen.y };
        finishGesture(true);
        longPressRef.current(point);
      }, LONG_PRESS_MS)
      : null;

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('pointerdown', onOtherDown, true);
    g.cleanup = () => {
      if (pressTimer) clearTimeout(pressTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('pointerdown', onOtherDown, true);
    };
    gestureRef.current = g;
  }, [finishGesture, shapesRef, toWorld, viewportRef]);

  useEffect(() => () => finishGesture(true), [finishGesture]);

  /**
   * A press on the page with the Select tool. Selects the shape under it (a group whole; Shift
   * adds or removes one) and starts moving it in the same press, as in Word. Returns false when
   * the press missed every shape, so the lasso can start instead (Shift keeps the selection,
   * so a lasso adds to it).
   */
  const handleSelectPress = useCallback((point, e) => {
    const zoom = viewportRef.current.zoom || 1;
    const tolerance = (e.pointerType === 'mouse' ? 6 : 12) / zoom;
    const hit = hitTestShapes(shapesRef.current, point, tolerance);
    if (!hit) {
      if (selectedRef.current.length > 0 && !e.shiftKey) setSelectedIds([]);
      return false;
    }
    const unit = expandToGroups(shapesRef.current, [hit.id]);
    const current = selectedRef.current;
    let ids;
    if (e.shiftKey) {
      ids = current.includes(hit.id) ? current.filter((id) => !unit.includes(id)) : [...current, ...unit.filter((id) => !current.includes(id))];
    } else {
      ids = current.includes(hit.id) ? current : unit;
    }
    setSelectedIds(ids);
    if (ids.includes(hit.id)) beginGesture('move', e, { ids, hitId: hit.id });
    return true;
  }, [beginGesture, shapesRef, viewportRef, setSelectedIds]);

  const select = useCallback((ids) => setSelectedIds(ids), [setSelectedIds]);
  const clearSelection = useCallback(() => setSelectedIdsRaw((ids) => (ids.length ? [] : ids)), []);

  /**
   * A lasso drawn around shapes selects every shape (and every whole group) inside it.
   * add: keep what was selected (Shift).
   */
  const selectEnclosed = useCallback((polygon, add = false) => {
    const inside = (p) => {
      let hit = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i];
        const b = polygon[j];
        if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
      }
      return hit;
    };
    const enclosed = (s) => {
      const b = frameBounds(s);
      return [[b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY]].every(([x, y]) => inside({ x, y }));
    };
    const all = shapesRef.current;
    const picked = all.filter((s) => {
      if (!enclosed(s)) return false;
      return !s.groupId || all.filter((m) => m.groupId === s.groupId).every(enclosed);
    }).map((s) => s.id);
    if (picked.length === 0) return false;
    setSelectedIds(add ? [...new Set([...selectedRef.current, ...picked])] : picked);
    return true;
  }, [shapesRef, setSelectedIds]);

  const deleteSelected = useCallback(() => {
    const ids = new Set(selectedRef.current);
    if (ids.size === 0) return false;
    applyRef.current(shapesRef.current.filter((s) => !ids.has(s.id)));
    setSelectedIds([]);
    return true;
  }, [shapesRef, setSelectedIds]);

  // The copies become the selection, so they can be dragged into place straight away
  const duplicateSelected = useCallback(() => {
    const ids = new Set(selectedRef.current);
    if (ids.size === 0) return false;
    const copies = copiesOf(shapesRef.current.filter((s) => ids.has(s.id)), DUPLICATE_OFFSET, DUPLICATE_OFFSET);
    applyRef.current([...shapesRef.current, ...copies]);
    setSelectedIds(copies.map((s) => s.id));
    return true;
  }, [shapesRef, setSelectedIds]);

  const updateSelected = useCallback((transform) => {
    const ids = new Set(selectedRef.current);
    if (ids.size === 0) return;
    applyRef.current(shapesRef.current.map((s) => (ids.has(s.id) ? transform(s) : s)));
  }, [shapesRef]);

  const applyStyle = useCallback((patch) => updateSelected((s) => styleShape(s, patch)), [updateSelected]);
  const nudge = useCallback((dx, dy) => {
    const ids = selectedRef.current;
    if (ids.length === 0) return;
    const set = new Set(ids);
    applyRef.current(detachMoved(shapesRef.current.map((s) => (set.has(s.id) ? moveShape(s, dx, dy) : s)), ids));
  }, [shapesRef]);

  /** Layer order: 'front', 'back', 'forward', 'backward'. */
  const reorderSelected = useCallback((action) => {
    if (selectedRef.current.length === 0) return;
    applyRef.current(reorderShapes(shapesRef.current, selectedRef.current, action));
  }, [shapesRef]);

  /** The selected shapes as a list, and whether they are one group. */
  const selection = () => {
    const ids = new Set(selectedRef.current);
    const picked = shapesRef.current.filter((s) => ids.has(s.id));
    return { picked, group: isWholeGroup(shapesRef.current, picked) };
  };
  const replace = (changed) => {
    const byId = new Map(changed.map((s) => [s.id, s]));
    applyRef.current(shapesRef.current.map((s) => byId.get(s.id) || s));
  };

  /** Rotate Right 90° (+90) / Left 90° (-90): a group turns as one, other shapes each on their own. */
  const rotateSelectedBy = useCallback((degrees) => {
    const { picked, group } = selection();
    if (picked.length === 0) return;
    if (group) {
      const box = framesBounds(picked);
      replace(rotateShapesAbout(picked, { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 }, degrees));
    } else {
      replace(picked.map((s) => rotateBy(s, degrees)));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Flip Horizontal ('h') / Vertical ('v'): a group flips as one, other shapes each on their own. */
  const flipSelected = useCallback((axis) => {
    const { picked, group } = selection();
    if (picked.length === 0) return;
    replace(group ? flipShapesAbout(picked, framesBounds(picked), axis) : picked.map((s) => flipShape(s, axis)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Align Left / Center / Right / Top / Middle / Bottom, relative to the selection. */
  const alignSelected = useCallback((mode) => {
    if (selectedRef.current.length < 2) return;
    applyRef.current(alignShapes(shapesRef.current, selectedRef.current, mode));
  }, [shapesRef]);

  /** Distribute Horizontally ('h') / Vertically ('v'): three or more. */
  const distributeSelected = useCallback((axis) => {
    if (selectedRef.current.length < 3) return;
    applyRef.current(distributeShapes(shapesRef.current, selectedRef.current, axis));
  }, [shapesRef]);

  const groupSelected = useCallback(() => {
    const ids = selectedRef.current;
    if (ids.length < 2) return false;
    applyRef.current(groupShapes(shapesRef.current, ids));
    setSelectedIdsRaw([...ids]);
    return true;
  }, [shapesRef]);

  const ungroupSelected = useCallback(() => {
    const ids = selectedRef.current;
    if (!shapesRef.current.some((s) => ids.includes(s.id) && s.groupId)) return false;
    applyRef.current(ungroupShapes(shapesRef.current, ids));
    return true;
  }, [shapesRef]);

  /** Change Shape: every selected shape (not lines) becomes the preset. */
  const changeSelected = useCallback((preset) => {
    updateSelected((s) => (canChangeShape(s) ? changeShape(s, preset) : s));
  }, [updateSelected]);

  /** Tab / Shift+Tab: the next or previous shape (or group). */
  const selectNext = useCallback((backwards = false) => {
    const ids = nextShapeSelection(shapesRef.current, selectedRef.current, backwards);
    if (ids.length) setSelectedIds(ids);
    return ids.length > 0;
  }, [shapesRef, setSelectedIds]);

  /** Ctrl+Shift+> / Ctrl+Shift+<: text one size larger or smaller. */
  const stepTextSize = useCallback((up) => {
    updateSelected((s) => (s.text ? styleShape(s, { text: { size: steppedTextSize(s.text.size || 16, up) } }) : s));
  }, [updateSelected]);

  const copySelected = useCallback(() => {
    const ids = new Set(selectedRef.current);
    if (ids.size === 0) return false;
    shapeClipboard = shapesRef.current.filter((s) => ids.has(s.id)).map((s) => JSON.parse(JSON.stringify(s)));
    pasteCountRef.current = 0;
    return true;
  }, [shapesRef]);

  const cutSelected = useCallback(() => {
    if (!copySelected()) return false;
    pasteCountRef.current = -1; // pasting after a cut puts the shapes back where they were
    const ids = new Set(selectedRef.current);
    applyRef.current(shapesRef.current.filter((s) => !ids.has(s.id)));
    setSelectedIds([]);
    return true;
  }, [copySelected, shapesRef, setSelectedIds]);

  /** Pastes cut or copied shapes, each paste a little further down and to the right. */
  const paste = useCallback(() => {
    if (shapeClipboard.length === 0) return false;
    pasteCountRef.current += 1;
    const offset = DUPLICATE_OFFSET * pasteCountRef.current;
    const copies = copiesOf(shapeClipboard, offset, offset);
    applyRef.current([...shapesRef.current, ...copies]);
    setSelectedIds(copies.map((s) => s.id));
    return true;
  }, [shapesRef, setSelectedIds]);

  const canPaste = () => shapeClipboard.length > 0;

  const selectedShapes = shapes.filter((s) => selectedIds.includes(s.id));

  return {
    selectedIds,
    selectedShapes,
    gestureInfo,
    select,
    clearSelection,
    selectEnclosed,
    handleSelectPress,
    beginGesture,
    deleteSelected,
    duplicateSelected,
    applyStyle,
    updateSelected,
    nudge,
    reorderSelected,
    rotateSelectedBy,
    flipSelected,
    alignSelected,
    distributeSelected,
    groupSelected,
    ungroupSelected,
    changeSelected,
    selectNext,
    stepTextSize,
    copySelected,
    cutSelected,
    paste,
    canPaste,
  };
}
