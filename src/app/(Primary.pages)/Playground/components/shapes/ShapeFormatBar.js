'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import {
  LuPaintBucket, LuPenLine, LuCopy, LuTrash2, LuPalette, LuSparkles, LuType, LuLayers, LuSlidersHorizontal,
  LuMoreHorizontal, LuBringToFront, LuSendToBack, LuArrowUp, LuArrowDown, LuRotateCw, LuRotateCcw,
  LuFlipHorizontal, LuFlipVertical, LuBold, LuItalic, LuUnderline, LuAlignLeft, LuAlignCenter, LuAlignRight,
  LuAlignVerticalJustifyStart, LuAlignVerticalJustifyCenter, LuAlignVerticalJustifyEnd, LuMinus, LuPlus,
  LuAlignStartVertical, LuAlignCenterVertical, LuAlignEndVertical, LuAlignStartHorizontal, LuAlignCenterHorizontal,
  LuAlignEndHorizontal, LuAlignHorizontalDistributeCenter, LuAlignVerticalDistributeCenter, LuGroup, LuUngroup, LuReplace,
} from 'react-icons/lu';
import ColorPicker from './ColorPicker';
import { LINE_DASHES, isLineShape, hasFill, hasOutline } from '../../utils/shapes/shapeModel';
import { SHAPE_STYLES, SHADOW_PRESETS } from '../../utils/shapes/shapeStyles';

// Outline weights in points, as Word lists them (1 pt = 4/3 px)
const WEIGHTS = [0.25, 0.5, 0.75, 1, 1.5, 2.25, 3, 4.5, 6];
const FONT_SIZES_PT = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];
const ARROW_TYPES = [
  { id: 'none', label: 'None' },
  { id: 'triangle', label: 'Arrow' },
  { id: 'arrow', label: 'Open Arrow' },
  { id: 'stealth', label: 'Stealth Arrow' },
  { id: 'diamond', label: 'Diamond Arrow' },
  { id: 'oval', label: 'Oval Arrow' },
];

const pxToPt = (px) => Math.round(px * 0.75 * 100) / 100;
const ptToPx = (pt) => Math.round((pt * 4) / 3 * 100) / 100;

function ArrowIcon({ type, atStart }) {
  const tip = atStart ? 4 : 36;
  const dir = atStart ? 1 : -1;
  const head = {
    triangle: `M${tip} 8L${tip + dir * 9} 3L${tip + dir * 9} 13Z`,
    stealth: `M${tip} 8L${tip + dir * 10} 3L${tip + dir * 6} 8L${tip + dir * 10} 13Z`,
    diamond: `M${tip - dir * 5} 8L${tip} 3L${tip + dir * 5} 8L${tip} 13Z`,
    oval: `M${tip - dir * 5} 8A5 5 0 1 0 ${tip + dir * 5} 8A5 5 0 1 0 ${tip - dir * 5} 8Z`,
  }[type];
  return (
    <svg viewBox="0 0 40 16" className="w-10 h-4" aria-hidden="true">
      <path d="M4 8H36" stroke="currentColor" strokeWidth="1.5" />
      {type === 'arrow' && <path d={`M${tip + dir * 8} 3L${tip} 8L${tip + dir * 8} 13`} stroke="currentColor" strokeWidth="1.5" fill="none" />}
      {head && <path d={head} fill="currentColor" />}
    </svg>
  );
}

function SectionTitle({ children }) {
  return <div className="font-semibold text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">{children}</div>;
}

function MenuButton({ icon, label, onClick, pressed, disabled, shortcut }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-2 h-9 rounded-lg text-left disabled:opacity-40 ${pressed ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:hover:bg-transparent'}`}
    >
      {icon}
      <span>{label}</span>
      {shortcut && <span className="ml-auto pl-4 text-zinc-400 tabular-nums">{shortcut}</span>}
    </button>
  );
}

/** A style preview, as the swatches in WPS's Shape Styles gallery. */
function StylePreview({ style }) {
  const fill = style.fill.type === 'gradient' ? `linear-gradient(180deg, ${style.fill.stops[0]}, ${style.fill.stops[1]})` : style.fill.color;
  return (
    <span
      className="w-full h-full rounded-[3px] flex items-center justify-center text-[10px] font-semibold"
      style={{
        background: fill,
        border: style.line.type === 'none' ? '1px solid transparent' : `${Math.min(2, style.line.width)}px solid ${style.line.color}`,
        color: style.text.color,
        boxShadow: style.shadow ? '1px 2px 3px rgba(0,0,0,0.35)' : undefined,
      }}
    >
      Abc
    </span>
  );
}

/** A shadow preset preview: a white square casting the shadow. */
function ShadowPreview({ preset }) {
  const rad = (preset.angle * Math.PI) / 180;
  const dx = Math.round(Math.cos(rad) * preset.dist * 0.75);
  const dy = Math.round(Math.sin(rad) * preset.dist * 0.75);
  return <span className="w-6 h-6 bg-white border border-zinc-300" style={{ boxShadow: `${dx}px ${dy}px ${Math.round(preset.blur * 0.75)}px rgba(0,0,0,0.45)` }} />;
}

/**
 * The floating bar for selected shapes, our version of WPS's Drawing Tools: Shape Styles,
 * Fill, Outline, Shape Effects, Text, Arrange (layer order, rotate, flip), Duplicate, Delete and
 * the Format Shape pane. On phones the less used ones are under More, and menus are bottom sheets.
 */
export default function ShapeFormatBar({
  shapes, screenBox, viewport, isMobile, coarse, onStyle, onReorder, onDuplicate, onDelete, onEditText, onOpenPane, onSheetOpen,
  onRotate, onFlip, onAlign, onDistribute, onGroup, onUngroup, onChangeShape, canGroup = false, canUngroup = false, canChangeShape = false,
}) {
  const [menu, setMenu] = useState(null);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const barRef = useRef(null);
  const [barWidth, setBarWidth] = useState(240);
  const first = shapes[0];
  const allLines = shapes.every(isLineShape);
  const key = shapes.map((s) => s.id).join(',');

  // A new selection starts with the menus closed
  useEffect(() => {
    setMenu(null);
    setTextColorOpen(false);
  }, [key]);

  // On phones a menu is a bottom sheet: the page moves the shape into view above it
  const sheetOpen = Boolean(isMobile && menu);
  useEffect(() => {
    if (sheetOpen && onSheetOpen) onSheetOpen();
  }, [sheetOpen, onSheetOpen]);

  // Escape closes an open menu first, as in WPS (the selection stays)
  useEffect(() => {
    if (!menu) return;
    const handleKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setMenu(null);
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [menu]);

  // The bar is placed by its real width (touch screens make its buttons larger)
  useLayoutEffect(() => {
    const width = barRef.current ? barRef.current.offsetWidth : 0;
    if (width && Math.abs(width - barWidth) > 1) setBarWidth(width);
  }, [allLines, coarse, isMobile, barWidth]);

  if (!first) return null;

  const fillColor = hasFill(first) ? first.fill.color : null;
  const lineColor = hasOutline(first) ? first.line.color : null;
  const lineWidthPt = hasOutline(first) ? pxToPt(first.line.width) : null;
  const text = first.text || {};
  const textSizePt = pxToPt(text.size || 16);
  const toggle = (id) => setMenu(menu === id ? null : id);

  // Below the selection, or above it when there is no room; always on screen
  const x = Math.max(8, Math.min(viewport.width - barWidth - 8, (screenBox.minX + screenBox.maxX) / 2 - barWidth / 2));
  const below = screenBox.maxY + 16;
  const above = screenBox.minY - 66;
  const fitsBelow = below + 60 <= viewport.height - 90;
  const fitsAbove = above >= 70;
  const y = fitsBelow ? Math.max(70, below) : fitsAbove ? above : Math.max(70, Math.min(viewport.height - 140, below));
  // A menu opens on the side of the bar with more room, and is no taller than that room
  const barHeight = 56;
  const roomAbove = y - 16;
  const roomBelow = viewport.height - (y + barHeight) - 16;
  const menuAbove = roomAbove > roomBelow;
  const menuMaxHeight = Math.max(160, (menuAbove ? roomAbove : roomBelow) - 8);

  const button = (id, label, icon, colour, onClick) => (
    <button
      key={label}
      type="button"
      onClick={onClick || (() => toggle(id))}
      title={label}
      aria-label={label}
      aria-expanded={id ? menu === id : undefined}
      className={`w-11 h-11 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
        id && menu === id ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
      } text-zinc-700 dark:text-zinc-200`}
    >
      {icon}
      {colour !== undefined && (
        <span
          className="block w-5 h-1 rounded-sm border border-black/10 dark:border-white/20"
          style={colour ? { backgroundColor: colour } : { background: 'repeating-linear-gradient(45deg,#e4e4e7 0 2px,#fff 2px 4px)' }}
        />
      )}
    </button>
  );
  const divider = (k) => <div key={k} className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />;

  const stylesButton = !allLines && button('styles', 'Shape Styles', <LuPalette className="w-4 h-4" />);
  const fillButton = !allLines && button('fill', 'Fill', <LuPaintBucket className="w-4 h-4" />, fillColor);
  const outlineButton = button('outline', allLines ? 'Line' : 'Outline', <LuPenLine className="w-4 h-4" />, lineColor);
  const effectsButton = button('effects', 'Shape Effects', <LuSparkles className="w-4 h-4" />);
  const textButton = !allLines && button('text', 'Text', <LuType className="w-4 h-4" />);
  const arrangeButton = button('arrange', 'Arrange', <LuLayers className="w-4 h-4" />);
  const rotateButton = button('rotate', 'Rotate', <LuRotateCw className="w-4 h-4" />);
  const duplicateButton = button(null, 'Duplicate (Ctrl+D)', <LuCopy className="w-4 h-4" />, undefined, onDuplicate);
  const deleteButton = button(null, 'Delete (Delete key)', <LuTrash2 className="w-4 h-4" />, undefined, onDelete);
  const paneButton = button(null, 'Format Shape pane', <LuSlidersHorizontal className="w-4 h-4" />, undefined, () => {
    setMenu(null);
    onOpenPane();
  });

  const bar = isMobile
    ? [stylesButton, fillButton, outlineButton, textButton, rotateButton, button('more', 'More', <LuMoreHorizontal className="w-4 h-4" />)]
    : [stylesButton, fillButton, outlineButton, effectsButton, !allLines && divider('d1'), textButton, divider('d2'), arrangeButton, rotateButton, divider('d3'), duplicateButton, deleteButton, divider('d4'), paneButton];

  const panelClass = isMobile
    ? 'fixed bottom-0 left-0 right-0 max-h-[60vh] rounded-t-3xl p-4 border-t overflow-y-auto overscroll-contain'
    : `absolute left-0 ${menuAbove ? 'bottom-full mb-2' : 'top-full mt-2'} w-max max-w-[min(560px,calc(100vw-16px))] overflow-y-auto overscroll-contain rounded-2xl p-3 border`;

  const titles = { styles: 'Shape Styles', fill: 'Shape Fill', outline: allLines ? 'Line' : 'Shape Outline', effects: 'Shape Effects', text: 'Text', arrange: 'Arrange', rotate: 'Rotate', more: 'More' };

  const effectsMenu = (
    <div>
      <SectionTitle>Shadow</SectionTitle>
      <div className="flex flex-wrap gap-1">
        <button type="button" onClick={() => onStyle({ shadow: null })} aria-pressed={!first.shadow} className={`h-11 px-3 rounded-lg border ${!first.shadow ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-200 dark:border-zinc-700'}`}>
          No Shadow
        </button>
        {SHADOW_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.label}
            aria-label={`Shadow: ${p.label}`}
            aria-pressed={first.shadow && first.shadow.preset === p.id}
            onClick={() => onStyle({ shadow: { preset: p.id } })}
            className={`w-11 h-11 flex items-center justify-center rounded-lg border ${first.shadow && first.shadow.preset === p.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-200 dark:border-zinc-700'}`}
          >
            <ShadowPreview preset={p} />
          </button>
        ))}
      </div>
      <button type="button" onClick={() => { setMenu(null); onOpenPane('effects'); }} className="mt-2 px-2 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
        Shadow Options...
      </button>
    </div>
  );

  // Align needs two or more (a group counts as one); Distribute three or more
  const units = new Set(shapes.map((s) => s.groupId || s.id)).size;
  const sep = <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />;
  const rotateMenu = (
    <div className="flex flex-col gap-0.5 min-w-[220px]" data-rotate-menu>
      <MenuButton icon={<LuRotateCw className="w-4 h-4" />} label="Rotate Right 90°" onClick={() => onRotate(90)} />
      <MenuButton icon={<LuRotateCcw className="w-4 h-4" />} label="Rotate Left 90°" onClick={() => onRotate(-90)} />
      <MenuButton icon={<LuFlipVertical className="w-4 h-4" />} label="Flip Vertical" onClick={() => onFlip('v')} />
      <MenuButton icon={<LuFlipHorizontal className="w-4 h-4" />} label="Flip Horizontal" onClick={() => onFlip('h')} />
      <button type="button" onClick={() => { setMenu(null); onOpenPane('size'); }} className="mt-1 px-2 h-8 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
        More Rotation Options...
      </button>
      <p className="px-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Or drag the round handle above the shape to turn it freely (Shift: 15° steps).</p>
    </div>
  );

  const arrangeMenu = (
    <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-2 gap-x-3'} gap-y-0.5 min-w-[220px]`} data-arrange-menu>
      <div className="flex flex-col gap-0.5">
        <SectionTitle>Order</SectionTitle>
        <MenuButton icon={<LuBringToFront className="w-4 h-4" />} label="Bring to Front" onClick={() => onReorder('front')} />
        <MenuButton icon={<LuArrowUp className="w-4 h-4" />} label="Bring Forward" onClick={() => onReorder('forward')} />
        <MenuButton icon={<LuArrowDown className="w-4 h-4" />} label="Send Backward" onClick={() => onReorder('backward')} />
        <MenuButton icon={<LuSendToBack className="w-4 h-4" />} label="Send to Back" onClick={() => onReorder('back')} />
        {sep}
        <SectionTitle>Group</SectionTitle>
        <MenuButton icon={<LuGroup className="w-4 h-4" />} label="Group" shortcut="Ctrl+G" disabled={!canGroup} onClick={onGroup} />
        <MenuButton icon={<LuUngroup className="w-4 h-4" />} label="Ungroup" shortcut="Ctrl+Shift+G" disabled={!canUngroup} onClick={onUngroup} />
        {sep}
        <MenuButton icon={<LuReplace className="w-4 h-4" />} label="Change Shape..." disabled={!canChangeShape} onClick={() => { setMenu(null); onChangeShape(); }} />
      </div>
      <div className="flex flex-col gap-0.5">
        {isMobile && sep}
        <SectionTitle>Align</SectionTitle>
        <MenuButton icon={<LuAlignStartVertical className="w-4 h-4" />} label="Align Left" disabled={units < 2} onClick={() => onAlign('left')} />
        <MenuButton icon={<LuAlignCenterVertical className="w-4 h-4" />} label="Align Center" disabled={units < 2} onClick={() => onAlign('center')} />
        <MenuButton icon={<LuAlignEndVertical className="w-4 h-4" />} label="Align Right" disabled={units < 2} onClick={() => onAlign('right')} />
        <MenuButton icon={<LuAlignStartHorizontal className="w-4 h-4" />} label="Align Top" disabled={units < 2} onClick={() => onAlign('top')} />
        <MenuButton icon={<LuAlignCenterHorizontal className="w-4 h-4" />} label="Align Middle" disabled={units < 2} onClick={() => onAlign('middle')} />
        <MenuButton icon={<LuAlignEndHorizontal className="w-4 h-4" />} label="Align Bottom" disabled={units < 2} onClick={() => onAlign('bottom')} />
        <MenuButton icon={<LuAlignHorizontalDistributeCenter className="w-4 h-4" />} label="Distribute Horizontally" disabled={units < 3} onClick={() => onDistribute('h')} />
        <MenuButton icon={<LuAlignVerticalDistributeCenter className="w-4 h-4" />} label="Distribute Vertically" disabled={units < 3} onClick={() => onDistribute('v')} />
        {sep}
        <SectionTitle>Rotate</SectionTitle>
        <MenuButton icon={<LuRotateCw className="w-4 h-4" />} label="Rotate Right 90°" onClick={() => onRotate(90)} />
        <MenuButton icon={<LuRotateCcw className="w-4 h-4" />} label="Rotate Left 90°" onClick={() => onRotate(-90)} />
        <MenuButton icon={<LuFlipVertical className="w-4 h-4" />} label="Flip Vertical" onClick={() => onFlip('v')} />
        <MenuButton icon={<LuFlipHorizontal className="w-4 h-4" />} label="Flip Horizontal" onClick={() => onFlip('h')} />
        <button type="button" onClick={() => { setMenu(null); onOpenPane('size'); }} className="mt-1 px-2 h-8 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
          More Rotation Options...
        </button>
      </div>
    </div>
  );

  return (
    // Placed with left/top, not a transform: a transform would pin the phone sheets to the bar instead of the screen.
    // An open menu sits above everything on the page: blocks (z-40, z-50 while edited), the dock (z-40), the music player (z-50).
    <div
      style={{ left: x, top: y }}
      className={`absolute ${menu ? 'z-[60]' : 'z-30'} select-none`}
      data-shape-format-bar
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div ref={barRef} className="flex items-center gap-1 p-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
        {bar.filter(Boolean)}
      </div>

      {menu && (
        <div className={`${panelClass} bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl z-50 flex flex-col gap-3 text-xs text-zinc-700 dark:text-zinc-300`} style={isMobile ? undefined : { maxHeight: menuMaxHeight }} data-shape-menu={menu}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{titles[menu]}</span>
            <button type="button" onClick={() => setMenu(null)} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {menu === 'styles' && (
            <div className="flex flex-col gap-1" role="grid" aria-label="Shape Styles">
              {SHAPE_STYLES.map((row) => (
                <div key={row.id} className="flex gap-1" role="row">
                  {row.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      title={item.name}
                      aria-label={item.name}
                      data-shape-style={item.id}
                      onClick={() => onStyle({ fill: item.style.fill, line: item.style.line, shadow: item.style.shadow, text: { color: item.style.text.color } })}
                      className={`${coarse ? 'w-11 h-11' : 'w-12 h-8'} p-0.5 rounded-md border border-transparent hover:border-indigo-400`}
                    >
                      <StylePreview style={item.style} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {menu === 'fill' && (
            <>
              <ColorPicker
                current={fillColor}
                noneLabel="No Fill"
                coarse={coarse}
                onPick={(hex) => onStyle({ fill: { type: 'solid', color: hex } })}
                onNone={() => onStyle({ fill: { type: 'none' } })}
              />
              {fillColor && (
                <label className="flex items-center gap-2">
                  <span className="w-24 shrink-0">Transparency</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((1 - (first.fill.alpha ?? 1)) * 100)}
                    onChange={(e) => onStyle({ fill: { alpha: 1 - Number(e.target.value) / 100 } })}
                    className="flex-1 accent-indigo-500"
                    aria-label="Fill transparency"
                  />
                  <span className="w-9 text-right tabular-nums">{Math.round((1 - (first.fill.alpha ?? 1)) * 100)}%</span>
                </label>
              )}
              <button type="button" onClick={() => { setMenu(null); onOpenPane('fill'); }} className="px-2 h-8 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Gradient and more fill options...
              </button>
            </>
          )}

          {menu === 'outline' && (
            <>
              <ColorPicker
                current={lineColor}
                noneLabel={allLines ? null : 'No Outline'}
                coarse={coarse}
                onPick={(hex) => onStyle({ line: { type: 'solid', color: hex } })}
                onNone={() => onStyle({ line: { type: 'none' } })}
              />
              <div>
                <SectionTitle>Weight</SectionTitle>
                <div className="grid grid-cols-3 gap-1">
                  {WEIGHTS.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => onStyle({ line: { type: 'solid', width: ptToPx(pt) } })}
                      aria-pressed={lineWidthPt === pt}
                      className={`flex items-center gap-2 px-2 h-8 rounded-lg ${lineWidthPt === pt ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      <span className="w-8 shrink-0 bg-current rounded-sm" style={{ height: Math.max(1, ptToPx(pt)) }} />
                      <span>{pt} pt</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SectionTitle>Dashes</SectionTitle>
                <div className="grid grid-cols-2 gap-1">
                  {LINE_DASHES.map((dash) => (
                    <button
                      key={dash.id}
                      type="button"
                      title={dash.label}
                      onClick={() => onStyle({ line: { type: 'solid', dash: dash.id } })}
                      aria-pressed={(first.line?.dash || 'solid') === dash.id}
                      className={`flex items-center gap-2 px-2 h-8 rounded-lg ${(first.line?.dash || 'solid') === dash.id ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      <svg viewBox="0 0 48 6" className="w-12 h-1.5 shrink-0" aria-hidden="true">
                        <line x1="0" y1="3" x2="48" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray={dash.pattern ? dash.pattern.map((v) => v * 2).join(' ') : undefined} strokeLinecap={dash.cap || 'butt'} />
                      </svg>
                      <span className="truncate">{dash.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {allLines && (
                <div>
                  <SectionTitle>Arrows</SectionTitle>
                  {[['head', 'Begin'], ['tail', 'End']].map(([end, label]) => (
                    <div key={end} className="flex items-center gap-1 flex-wrap mb-1">
                      <span className="w-10 shrink-0">{label}</span>
                      {ARROW_TYPES.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          title={`${label}: ${a.label}`}
                          aria-label={`${label} arrow: ${a.label}`}
                          aria-pressed={((first.line?.[end]?.type) || 'none') === a.id}
                          onClick={() => onStyle({ line: { [end]: a.id === 'none' ? { type: 'none' } : { type: a.id, w: 'med', len: 'med' } } })}
                          className={`px-1 h-8 rounded-lg ${((first.line?.[end]?.type) || 'none') === a.id ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                          {a.id === 'none' ? <span className="inline-block w-10 text-center">None</span> : <ArrowIcon type={a.id} atStart={end === 'head'} />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {menu === 'effects' && effectsMenu}

          {menu === 'text' && (
            <div className="flex flex-col gap-2 min-w-[260px]">
              <button type="button" onClick={() => { setMenu(null); onEditText(); }} className="h-9 px-3 rounded-lg bg-indigo-500 text-white font-semibold">
                Edit Text
              </button>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Decrease Font Size" onClick={() => onStyle({ text: { size: ptToPx(Math.max(4, (FONT_SIZES_PT.filter((s) => s < textSizePt).pop() || textSizePt - 1))) } })} className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <LuMinus className="w-4 h-4" />
                </button>
                <select
                  aria-label="Font size"
                  value={FONT_SIZES_PT.includes(textSizePt) ? textSizePt : ''}
                  onChange={(e) => onStyle({ text: { size: ptToPx(Number(e.target.value)) } })}
                  className="h-9 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 tabular-nums"
                >
                  {!FONT_SIZES_PT.includes(textSizePt) && <option value="">{textSizePt}</option>}
                  {FONT_SIZES_PT.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                </select>
                <button type="button" aria-label="Increase Font Size" onClick={() => onStyle({ text: { size: ptToPx(FONT_SIZES_PT.find((s) => s > textSizePt) || textSizePt + 1) } })} className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <LuPlus className="w-4 h-4" />
                </button>
                <span className="text-zinc-500">pt</span>
              </div>
              <div className="flex items-center gap-1">
                {[['bold', LuBold, 'Bold'], ['italic', LuItalic, 'Italic'], ['underline', LuUnderline, 'Underline']].map(([k, Icon, name]) => (
                  <button key={k} type="button" aria-label={name} aria-pressed={Boolean(text[k])} onClick={() => onStyle({ text: { [k]: !text[k] } })} className={`w-9 h-9 flex items-center justify-center rounded-lg border ${text[k] ? 'bg-indigo-500 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
                <button type="button" aria-label="Text color" aria-expanded={textColorOpen} onClick={() => setTextColorOpen(!textColorOpen)} className="h-9 px-2 flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <span className="font-bold">A</span>
                  <span className="w-5 h-1.5 rounded-sm border border-black/10" style={{ backgroundColor: text.color && text.color !== 'auto' ? text.color : '#18181B' }} />
                </button>
              </div>
              {textColorOpen && <ColorPicker current={text.color === 'auto' ? null : text.color} coarse={coarse} onPick={(hex) => onStyle({ text: { color: hex } })} />}
              <div className="flex items-center gap-1">
                {[['left', LuAlignLeft, 'Align Left'], ['center', LuAlignCenter, 'Center'], ['right', LuAlignRight, 'Align Right']].map(([v, Icon, name]) => (
                  <button key={v} type="button" aria-label={name} aria-pressed={(text.align || 'center') === v} onClick={() => onStyle({ text: { align: v } })} className={`w-9 h-9 flex items-center justify-center rounded-lg border ${(text.align || 'center') === v ? 'bg-indigo-500 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
                <span className="w-2" />
                {[['top', LuAlignVerticalJustifyStart, 'Top'], ['middle', LuAlignVerticalJustifyCenter, 'Middle'], ['bottom', LuAlignVerticalJustifyEnd, 'Bottom']].map(([v, Icon, name]) => (
                  <button key={v} type="button" aria-label={`Align ${name}`} aria-pressed={(text.valign || 'middle') === v} onClick={() => onStyle({ text: { valign: v } })} className={`w-9 h-9 flex items-center justify-center rounded-lg border ${(text.valign || 'middle') === v ? 'bg-indigo-500 text-white border-indigo-600' : 'border-zinc-200 dark:border-zinc-700'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setMenu(null); onOpenPane('text'); }} className="px-2 h-8 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Font, autofit and margins...
              </button>
            </div>
          )}

          {menu === 'arrange' && arrangeMenu}

          {menu === 'rotate' && rotateMenu}

          {menu === 'more' && (
            <div className="flex flex-col gap-3">
              {effectsMenu}
              <div>
                <SectionTitle>Arrange</SectionTitle>
                {arrangeMenu}
              </div>
              <div className="flex flex-col gap-0.5">
                <MenuButton icon={<LuCopy className="w-4 h-4" />} label="Duplicate" onClick={onDuplicate} />
                <MenuButton icon={<LuTrash2 className="w-4 h-4" />} label="Delete" onClick={onDelete} />
                <MenuButton icon={<LuSlidersHorizontal className="w-4 h-4" />} label="Format Shape..." onClick={() => { setMenu(null); onOpenPane(); }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
