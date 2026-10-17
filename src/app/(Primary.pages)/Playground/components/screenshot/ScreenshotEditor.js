'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LuSquare, LuCircle, LuArrowUpRight, LuPencil, LuType, LuGrid, LuUndo2, LuCopy, LuDownload, LuX, LuCheck,
} from 'react-icons/lu';
import {
  regionFromCorners, polygonRegion, isUsableRegion, moveRegion, resizeRegion, fitPicture, regionOutline,
  closesPolygon, cropPicture, mosaic,
} from '../../utils/screenCapture';
import { SHAPE_CHOICES, ShapeOutlineIcon } from './screenshotShapes';
import { PG_FONT } from '../../utils/fonts';
import { pgColour } from '../ui/tokens';

const HANDLES = { nw: [0, 0], n: [0.5, 0], ne: [1, 0], e: [1, 0.5], se: [1, 1], s: [0.5, 1], sw: [0, 1], w: [0, 0.5] };
const MARK_TOOLS = [
  { id: 'box', label: 'Rectangle', Icon: LuSquare },
  { id: 'ellipse', label: 'Ellipse', Icon: LuCircle },
  { id: 'arrow', label: 'Arrow', Icon: LuArrowUpRight },
  { id: 'pen', label: 'Pen', Icon: LuPencil },
  { id: 'text', label: 'Text', Icon: LuType },
  { id: 'mosaic', label: 'Mosaic', Icon: LuGrid },
];
const MARK_COLORS = ['#FF0000', '#FFC000', '#00B050', '#0070C0', '#000000', '#FFFFFF'];

function drawMark(ctx, m) {
  ctx.save();
  ctx.strokeStyle = m.color;
  ctx.fillStyle = m.color;
  ctx.lineWidth = m.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (m.type === 'box') ctx.strokeRect(Math.min(m.a.x, m.b.x), Math.min(m.a.y, m.b.y), Math.abs(m.b.x - m.a.x), Math.abs(m.b.y - m.a.y));
  if (m.type === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse((m.a.x + m.b.x) / 2, (m.a.y + m.b.y) / 2, Math.abs(m.b.x - m.a.x) / 2, Math.abs(m.b.y - m.a.y) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (m.type === 'arrow') {
    const ang = Math.atan2(m.b.y - m.a.y, m.b.x - m.a.x);
    const head = Math.max(10, m.width * 4);
    ctx.beginPath();
    ctx.moveTo(m.a.x, m.a.y);
    ctx.lineTo(m.b.x, m.b.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(m.b.x, m.b.y);
    ctx.lineTo(m.b.x - head * Math.cos(ang - 0.45), m.b.y - head * Math.sin(ang - 0.45));
    ctx.lineTo(m.b.x - head * Math.cos(ang + 0.45), m.b.y - head * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  if (m.type === 'pen' && m.points.length) {
    ctx.beginPath();
    ctx.moveTo(m.points[0].x, m.points[0].y);
    for (const p of m.points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  if (m.type === 'text') {
    ctx.font = `600 ${m.size}px "Segoe UI", Roboto, Arial, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(m.text, m.a.x, m.a.y);
  }
  ctx.restore();
}

/**
 * The screenshot editor, as in WPS Office: the captured picture fills the screen; choose the
 * part to keep in the chosen shape (rectangle, oval, rounded rectangle, or tap the corners of a
 * polygon), adjust it with its handles, mark it up (rectangle, ellipse, arrow, pen, text, mosaic),
 * then Copy, Save, or Finish to put it on the page. Escape cancels.
 *
 * @param {HTMLCanvasElement} source - The captured picture at its full pixel size
 */
export default function ScreenshotEditor({ source, initialShape = 'rect', coarse = false, onFinish, onCancel, onNotice }) {
  const size = useMemo(() => ({ width: source.width, height: source.height }), [source]);
  const pictureUrl = useMemo(() => source.toDataURL('image/png'), [source]);
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const fit = useMemo(() => fitPicture(size, { left: 0, top: 0, width: viewport.width, height: viewport.height }), [size, viewport]);
  const [shape, setShape] = useState(initialShape);
  const [region, setRegion] = useState(null);
  const [points, setPoints] = useState([]); // polygon corners, picture pixels
  const [hover, setHover] = useState(null); // the pointer while drawing a polygon
  const [tool, setTool] = useState(null);
  const [color, setColor] = useState(MARK_COLORS[0]);
  const [marks, setMarks] = useState([]);
  const [draft, setDraft] = useState(null);
  const [textAt, setTextAt] = useState(null);
  const discardTextRef = useRef(false);
  const [lens, setLens] = useState(null); // the magnifier beside a finger
  const dragRef = useRef(null);
  const lensRef = useRef(null);
  const toolbarRef = useRef(null);
  const [toolbarWidth, setToolbarWidth] = useState(600);
  // The bar is placed by its real width (touch screens make its buttons larger)
  useLayoutEffect(() => {
    const w = toolbarRef.current ? toolbarRef.current.offsetWidth : 0;
    if (w && Math.abs(w - toolbarWidth) > 1) setToolbarWidth(w);
  }, [toolbarWidth, viewport.width, coarse]);
  const markWidth = Math.max(3, Math.round(3 / fit.scale));

  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const toPicture = (e) => fit.toPicture({ x: e.clientX, y: e.clientY });
  const closedPolygon = shape !== 'polygon' || (region && points.length >= 3);
  const selected = Boolean(region && isUsableRegion(region) && closedPolygon);

  // ── Finishing ──────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const base = document.createElement('canvas');
    base.width = size.width;
    base.height = size.height;
    const ctx = base.getContext('2d');
    ctx.drawImage(source, 0, 0);
    for (const m of marks) if (m.type === 'mosaic') mosaic(ctx, { x: Math.min(m.a.x, m.b.x), y: Math.min(m.a.y, m.b.y), w: Math.abs(m.b.x - m.a.x), h: Math.abs(m.b.y - m.a.y) }, Math.max(8, Math.round(10 / fit.scale)));
    for (const m of marks) if (m.type !== 'mosaic') drawMark(ctx, m);
    return cropPicture(base, shape, region, points);
  }, [size, source, marks, shape, region, points, fit.scale]);

  const finish = useCallback(() => {
    if (!selected) return;
    onFinish(render().toDataURL('image/png'));
  }, [selected, render, onFinish]);

  const copy = async () => {
    if (!selected) return;
    try {
      const blob = await new Promise((r) => render().toBlob(r, 'image/png'));
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      if (onNotice) onNotice('Screenshot copied');
    } catch (e) {
      if (onNotice) onNotice('This browser did not allow copying the picture. Use Save or Finish instead.');
    }
  };

  const save = () => {
    if (!selected) return;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
    const link = document.createElement('a');
    link.download = `netz-screenshot-${stamp}.png`;
    link.href = render().toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // While the editor is open, keys belong to it: none reaches the page underneath (Ctrl+Z would
  // undo the page, Delete would delete a selected shape, letters would switch tools)
  useEffect(() => {
    const key = (e) => {
      if (textAt) return;
      if (e.key === 'Tab') return; // moving between the toolbar's buttons
      e.stopImmediatePropagation();
      // Enter or Space on a toolbar button presses that button
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-screenshot-toolbar] button')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        finish();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setMarks((list) => list.slice(0, -1));
      }
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, [onCancel, finish, textAt]);

  // ── The magnifier ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = lensRef.current;
    if (!el || !lens) return;
    const ctx = el.getContext('2d');
    const zoom = 3;
    const r = 60 / (fit.scale * zoom);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, el.width, el.height);
    ctx.drawImage(source, lens.p.x - r, lens.p.y - r, r * 2, r * 2, 0, 0, el.width, el.height);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(el.width / 2, 0);
    ctx.lineTo(el.width / 2, el.height);
    ctx.moveTo(0, el.height / 2);
    ctx.lineTo(el.width, el.height / 2);
    ctx.stroke();
  }, [lens, source, fit.scale]);

  // ── Pointer input ──────────────────────────────────────────────────────────
  const insideRegion = (p) => region && p.x >= region.x && p.x <= region.x + region.w && p.y >= region.y && p.y <= region.y + region.h;

  const onPointerDown = (e) => {
    if (e.target.closest('[data-screenshot-toolbar], [data-screenshot-text]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    const p = toPicture(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.pointerType !== 'mouse') setLens({ x: e.clientX, y: e.clientY, p });

    // Marking up the chosen part
    if (selected && tool && insideRegion(p)) {
      if (tool === 'text') {
        setTextAt({ p, screen: fit.toScreen(p), value: '' });
        return;
      }
      dragRef.current = { kind: 'mark' };
      setDraft(tool === 'pen' ? { type: 'pen', points: [p], color, width: markWidth } : { type: tool, a: p, b: p, color, width: markWidth });
      return;
    }

    // Polygon: each tap adds a corner; a tap on the first corner closes it
    if (shape === 'polygon' && !selected) {
      if (closesPolygon(points, p, 14 / fit.scale)) {
        setRegion(polygonRegion(points, size));
      } else {
        setPoints((list) => [...list, p]);
      }
      return;
    }

    // Adjusting the chosen part: a handle resizes, inside moves
    const handleEl = e.target.closest && e.target.closest('[data-region-handle]');
    const handle = handleEl && handleEl.getAttribute('data-region-handle');
    if (selected && handle && shape !== 'polygon') {
      dragRef.current = { kind: 'resize', handle, start: region };
      return;
    }
    if (selected && insideRegion(p)) {
      dragRef.current = { kind: 'move', from: p, start: region, startPoints: points };
      return;
    }

    // A new part: drag from corner to corner
    setPoints([]);
    setMarks([]);
    dragRef.current = { kind: 'select', from: p };
    setRegion({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (e) => {
    const p = toPicture(e);
    if (shape === 'polygon' && !selected) setHover(p);
    const drag = dragRef.current;
    if (!drag) return;
    if (e.pointerType !== 'mouse') setLens({ x: e.clientX, y: e.clientY, p });
    if (drag.kind === 'select') setRegion(regionFromCorners(drag.from, p, size));
    if (drag.kind === 'resize') setRegion(resizeRegion(drag.start, drag.handle, p, size));
    if (drag.kind === 'move') {
      const moved = moveRegion(drag.start, p.x - drag.from.x, p.y - drag.from.y, size);
      setRegion(moved);
      if (drag.startPoints.length) setPoints(drag.startPoints.map((q) => ({ x: q.x + moved.x - drag.start.x, y: q.y + moved.y - drag.start.y })));
    }
    if (drag.kind === 'mark') setDraft((d) => (d.type === 'pen' ? { ...d, points: [...d.points, p] } : { ...d, b: p }));
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setLens(null);
    if (!drag) return;
    if (drag.kind === 'select' && region && !isUsableRegion(region)) setRegion(null);
    if (drag.kind === 'mark' && draft) {
      setMarks((list) => [...list, draft]);
      setDraft(null);
    }
  };

  // ── Drawing ────────────────────────────────────────────────────────────────
  const scr = (p) => fit.toScreen(p);
  const regionScreen = region ? { x: fit.left + region.x * fit.scale, y: fit.top + region.y * fit.scale, w: region.w * fit.scale, h: region.h * fit.scale } : null;
  const outline = region && (shape !== 'polygon' || points.length >= 3)
    ? regionOutline(shape, region, points)
    : null;
  const markSvg = (m, i) => {
    const s = (q) => scr(q);
    const stroke = { stroke: m.color, strokeWidth: m.width * fit.scale, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (m.type === 'box' || m.type === 'mosaic') {
      const a = s(m.a), b = s(m.b);
      return <rect key={i} x={Math.min(a.x, b.x)} y={Math.min(a.y, b.y)} width={Math.abs(b.x - a.x)} height={Math.abs(b.y - a.y)} {...stroke} {...(m.type === 'mosaic' ? { stroke: '#FFFFFF', strokeDasharray: '4 3', fill: 'rgba(120,120,120,0.55)' } : {})} />;
    }
    if (m.type === 'ellipse') {
      const a = s(m.a), b = s(m.b);
      return <ellipse key={i} cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} rx={Math.abs(b.x - a.x) / 2} ry={Math.abs(b.y - a.y) / 2} {...stroke} />;
    }
    if (m.type === 'arrow') {
      const a = s(m.a), b = s(m.b);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const head = Math.max(10, m.width * 4) * fit.scale;
      return (
        <g key={i}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} {...stroke} />
          <path d={`M${b.x} ${b.y}L${b.x - head * Math.cos(ang - 0.45)} ${b.y - head * Math.sin(ang - 0.45)}L${b.x - head * Math.cos(ang + 0.45)} ${b.y - head * Math.sin(ang + 0.45)}Z`} fill={m.color} />
        </g>
      );
    }
    if (m.type === 'pen') return <polyline key={i} points={m.points.map((q) => { const t = s(q); return `${t.x},${t.y}`; }).join(' ')} {...stroke} />;
    if (m.type === 'text') {
      const a = s(m.a);
      return <text key={i} x={a.x} y={a.y} fill={m.color} fontSize={m.size * fit.scale} fontWeight="600" dominantBaseline="hanging" fontFamily='"Segoe UI", Roboto, Arial, sans-serif'>{m.text}</text>;
    }
    return null;
  };

  // Under the chosen part, its right edge lined up with the part's, as in WPS (placed by the bar's
  // real width, and never wider than the screen). Phones and touch screens: along the bottom.
  const toolbarTop = regionScreen ? Math.min(viewport.height - 64, regionScreen.y + regionScreen.h + 10) : viewport.height - 64;
  const alongBottom = coarse || viewport.width < 640;
  const barWidth = Math.min(toolbarWidth, viewport.width - 16);
  const toolbarStyle = alongBottom
    ? { left: 8, right: 8, bottom: 8 }
    : { left: Math.max(8, Math.min(viewport.width - barWidth - 8, (regionScreen ? regionScreen.x + regionScreen.w : viewport.width / 2 + barWidth / 2) - barWidth)), top: toolbarTop, maxWidth: viewport.width - 16 };
  const toolButton = (id, label, icon, onClick, pressed, disabled) => (
    <button key={id} type="button" title={label} aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick} className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-lg ${pressed ? 'bg-pg-ink text-pg-on-ink' : 'text-pg-ink hover:bg-pg-tray'} disabled:opacity-30`}>
      {icon}
    </button>
  );

  // The chosen part is outlined in the selection colour
  const accent = pgColour('accent');
  const content = (
    <div
      className={`${PG_FONT} fixed inset-0 z-[90] bg-black select-none touch-none`}
      role="dialog"
      aria-label="Screenshot"
      data-screenshot-editor
      style={{ cursor: 'crosshair' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => {
        if (shape === 'polygon' && !selected && points.length >= 3) setRegion(polygonRegion(points, size));
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={pictureUrl} alt="Captured screen" draggable={false} style={{ position: 'absolute', left: fit.left, top: fit.top, width: fit.width, height: fit.height }} />
      <svg className="absolute inset-0 pointer-events-none" width={viewport.width} height={viewport.height}>
        {/* Dim everything outside the chosen part (all of it until a part is chosen) */}
        {!outline && <rect x="0" y="0" width={viewport.width} height={viewport.height} fill="rgba(0,0,0,0.5)" />}
        {outline && (
          <>
            <defs>
              <mask id="netz-shot-mask">
                <rect x="0" y="0" width={viewport.width} height={viewport.height} fill="white" />
                <path d={outline} transform={`translate(${regionScreen.x} ${regionScreen.y}) scale(${fit.scale})`} fill="black" />
              </mask>
            </defs>
            <rect x="0" y="0" width={viewport.width} height={viewport.height} fill="rgba(0,0,0,0.5)" mask="url(#netz-shot-mask)" />
            <path d={outline} transform={`translate(${regionScreen.x} ${regionScreen.y}) scale(${fit.scale})`} fill="none" stroke={accent} strokeWidth={2} vectorEffect="non-scaling-stroke" data-screenshot-region />
          </>
        )}
        {shape === 'polygon' && !selected && points.length > 0 && (
          <polyline points={[...points, ...(hover ? [hover] : [])].map((q) => { const t = scr(q); return `${t.x},${t.y}`; }).join(' ')} fill="none" stroke={accent} strokeWidth="2" strokeDasharray="6 4" />
        )}
        {shape === 'polygon' && points.map((q, i) => { const t = scr(q); return <circle key={i} cx={t.x} cy={t.y} r={i === 0 && !selected ? 7 : 4} fill={i === 0 ? accent : '#FFFFFF'} stroke={accent} strokeWidth="2" />; })}
        {marks.map(markSvg)}
        {draft && markSvg(draft, 'draft')}
      </svg>

      {/* Size of the chosen part, in the picture's pixels */}
      {regionScreen && isUsableRegion(region) && (
        <div className="absolute px-2 py-0.5 rounded bg-black/75 text-white text-pg-cap font-semibold tabular-nums pointer-events-none" style={{ left: regionScreen.x, top: Math.max(4, regionScreen.y - 24) }} data-screenshot-size>
          {Math.round(region.w)} × {Math.round(region.h)}
        </div>
      )}

      {/* Handles: resize the chosen part (not while marking it up). On touch the dot is 18 px
          and the area that takes the finger 44 px */}
      {selected && !tool && shape !== 'polygon' && Object.entries(HANDLES).map(([h, [fx, fy]]) => {
        const hit = coarse ? 44 : 16;
        return (
          <div
            key={h}
            data-region-handle={h}
            className="absolute flex items-center justify-center"
            style={{ width: hit, height: hit, left: regionScreen.x + fx * regionScreen.w - hit / 2, top: regionScreen.y + fy * regionScreen.h - hit / 2, cursor: `${h}-resize`, touchAction: 'none' }}
          >
            <span className="block rounded-full bg-white border-2 border-pg-accent pointer-events-none" style={{ width: coarse ? 18 : 12, height: coarse ? 18 : 12 }} />
          </div>
        );
      })}

      {lens && (
        <canvas ref={lensRef} width={120} height={120} className="absolute rounded-full border-2 border-white shadow-xl pointer-events-none" style={{ left: Math.max(4, lens.x - 150), top: Math.max(4, lens.y - 150), width: 120, height: 120 }} />
      )}

      {textAt && (
        <input
          data-screenshot-text
          autoFocus
          value={textAt.value}
          onChange={(e) => setTextAt({ ...textAt, value: e.target.value })}
          // Enter keeps the text, Escape drops it; both end with the field losing focus, which adds it once
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              discardTextRef.current = e.key === 'Escape';
              e.currentTarget.blur();
            }
          }}
          onBlur={() => {
            if (!discardTextRef.current && textAt.value.trim()) setMarks((list) => [...list, { type: 'text', a: textAt.p, text: textAt.value, color, size: Math.max(16, Math.round(18 / fit.scale)) }]);
            discardTextRef.current = false;
            setTextAt(null);
          }}
          aria-label="Text on the screenshot"
          className="absolute px-1 bg-white/90 text-black text-sm rounded border border-pg-accent outline-none"
          style={{ left: textAt.screen.x, top: textAt.screen.y, minWidth: 140 }}
        />
      )}

      {!selected && (
        <div className="absolute left-1/2 -translate-x-1/2 top-4 px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs pointer-events-none" data-screenshot-hint>
          {shape === 'polygon'
            ? points.length < 3 ? 'Tap the corners of the area. Tap the first corner to finish.' : 'Tap the first corner (or double-click) to close the shape.'
            : 'Drag over the area to keep. Escape cancels.'}
        </div>
      )}

      <div
        ref={toolbarRef}
        data-screenshot-toolbar
        className="absolute flex items-center gap-1 p-1.5 rounded-2xl bg-pg-surface border border-pg-line shadow-pg-menu"
        style={toolbarStyle}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* The tools scroll sideways on a narrow screen; Cancel and Finish always show */}
        <div className="flex items-center gap-1 overflow-x-auto overscroll-contain min-w-0 flex-1" data-screenshot-tools>
        {SHAPE_CHOICES.map((c) => toolButton(c.id, c.label, <ShapeOutlineIcon d={c.d} />, () => {
          setShape(c.id);
          setRegion(null);
          setPoints([]);
          setMarks([]);
          setTool(null);
        }, shape === c.id))}
        <div className="w-px h-6 bg-pg-line mx-0.5 shrink-0" />
        {MARK_TOOLS.map(({ id, label, Icon }) => toolButton(id, label, <Icon className="w-4 h-4" />, () => setTool(tool === id ? null : id), tool === id, !selected))}
        <div className="flex items-center gap-0.5 shrink-0">
          {MARK_COLORS.map((c) => (
            <button key={c} type="button" title={`Colour ${c}`} aria-label={`Colour ${c}`} aria-pressed={color === c} onClick={() => setColor(c)} className="w-7 h-11 flex items-center justify-center">
              <span className={`w-5 h-5 rounded-full border ${color === c ? 'ring-2 ring-pg-ink ring-offset-1' : 'border-pg-line'}`} style={{ backgroundColor: c }} />
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-pg-line mx-0.5 shrink-0" />
        {toolButton('undo', 'Undo (Ctrl+Z)', <LuUndo2 className="w-4 h-4" />, () => setMarks((list) => list.slice(0, -1)), false, marks.length === 0)}
        {toolButton('copy', 'Copy', <LuCopy className="w-4 h-4" />, copy, false, !selected)}
        {toolButton('save', 'Save as picture', <LuDownload className="w-4 h-4" />, save, false, !selected)}
        </div>
        <div className="w-px h-6 bg-pg-line mx-0.5 shrink-0" />
        {toolButton('cancel', 'Cancel (Esc)', <LuX className="w-4 h-4" />, onCancel)}
        <button type="button" onClick={finish} disabled={!selected} title="Finish: put it on the page (Enter)" aria-label="Finish" className="h-11 px-3 shrink-0 flex items-center gap-1.5 rounded-lg bg-pg-accent-fill text-white font-semibold hover:bg-pg-accent-fill/90 text-sm disabled:opacity-40">
          <LuCheck className="w-4 h-4" />
          Finish
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
