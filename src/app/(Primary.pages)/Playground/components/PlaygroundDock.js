'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { FiChevronDown, FiImage, FiMic } from 'react-icons/fi';
import {
  LuPencil,
  LuHighlighter,
  LuEraser,
  LuLassoSelect,
  LuHand,
  LuShapes,
  LuScissors,
  LuLayoutGrid,
  LuUndo2,
  LuRedo2,
  LuPlus,
  LuLineChart,
  LuType,
} from 'react-icons/lu';
import ShapeGallery, { ShapeIcon } from './shapes/ShapeGallery';
import SymbolMenu from './symbols/SymbolMenu';
import SymbolDialog from './symbols/SymbolDialog';
import NumberDialog from './symbols/NumberDialog';
import EquationMenu from './equation/EquationMenu';
import InsertLatexDialog from './equation/InsertLatexDialog';
import ScreenshotMenu from './screenshot/ScreenshotMenu';
import { Popover, TOUCH_TARGET, PLACE_ABOVE } from './ui/Dialog';
import { BAR_SHELL, Divider, toolButton, Segmented, SwatchButton, MENU_ROW, SECTION_LABEL } from './ui/parts';
import useSidebarRight from './ui/useSidebarRight';
import { UI } from '../utils/uiText';
import { PEN_TYPES } from '../utils/penTypes';

// The ink colours, graphite first (decision R1). Slate and White sit behind More colours, so one
// row fits a phone.
const PEN_COLOURS = [
  { value: '#18181B', name: 'Black' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#10B981', name: 'Green' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#F43F5E', name: 'Pink' },
  { value: '#F59E0B', name: 'Amber' },
  { value: '#06B6D4', name: 'Cyan' },
];
const PEN_MORE_COLOURS = [
  { value: '#64748B', name: 'Slate' },
  { value: '#FFFFFF', name: 'White (for dark pictures)' },
];

const HIGHLIGHTER_COLOURS = [
  { value: '#FACC15', name: 'Yellow' },
  { value: '#4ADE80', name: 'Green' },
  { value: '#F472B6', name: 'Pink' },
  { value: '#60A5FA', name: 'Blue' },
  { value: '#FB923C', name: 'Orange' },
];

const ERASER_MODES = [
  { label: 'Whole stroke', value: 'stroke', title: 'Remove every stroke the eraser touches' },
  { label: 'Part of stroke', value: 'partial', title: 'Rub out only the part the eraser passes over' },
];

const ERASER_SIZES = [
  { label: 'Small', value: 8, dot: 8 },
  { label: 'Medium', value: 16, dot: 14 },
  { label: 'Large', value: 32, dot: 22 },
];

const MANY_COLOURS = 'conic-gradient(#F43F5E, #F59E0B, #10B981, #06B6D4, #3B82F6, #8B5CF6, #F43F5E)';

const colourName = (colour, highlighter) =>
  (highlighter ? HIGHLIGHTER_COLOURS : [...PEN_COLOURS, ...PEN_MORE_COLOURS]).find((c) => c.value === colour)?.name || 'Custom colour';

const optionsTitle = (tool) => (tool === 'eraser' ? UI.eraserOptions : tool === 'highlighter' ? UI.highlighterOptions : UI.penOptions);
const sheetTitle = (tool) => (tool === 'eraser' ? UI.eraser : tool === 'highlighter' ? UI.highlighter : UI.pen);

/** A short line drawn the way a pen type draws (its width and opacity, in the pen colour). */
function StrokePreview({ colour, width, opacity, wide = false }) {
  return (
    <svg viewBox={wide ? '0 0 240 28' : '0 0 56 16'} className={wide ? 'w-full h-7' : 'w-14 h-4'} aria-hidden="true">
      <path
        d={wide ? 'M8 18 C 60 2, 100 30, 150 14 S 220 8, 232 14' : 'M4 11 C 14 3, 24 3, 30 8 S 44 13, 52 5'}
        fill="none"
        stroke={colour === '#FFFFFF' ? '#D4D4CF' : colour}
        strokeOpacity={opacity}
        strokeWidth={Math.min(width, wide ? 26 : 9)}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The options of the active tool: colour, pen type and width (pen, highlighter), or the eraser's. */
function ToolOptions(props) {
  const { activeTool } = props;
  const [moreColours, setMoreColours] = useState(false);

  if (activeTool === 'eraser') {
    return (
      <div className="flex flex-col gap-4 min-w-[280px]">
        <div>
          <div className={SECTION_LABEL}>Erase</div>
          <Segmented label="Erase" value={props.eraserMode} onChange={props.setEraserMode} options={ERASER_MODES} />
        </div>
        <div>
          <div className={SECTION_LABEL}>Size</div>
          <div className="flex gap-1.5">
            {ERASER_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => props.setEraserSize(size.value)}
                title={`${size.label} eraser`}
                aria-label={`${size.label} eraser`}
                aria-pressed={props.eraserSize === size.value}
                className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center ${props.eraserSize === size.value ? 'bg-pg-tray ring-1 ring-pg-line' : 'hover:bg-pg-tray'}`}
              >
                <span className="rounded-full border-[1.5px] border-pg-text2" style={{ width: size.dot, height: size.dot }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const highlighter = activeTool === 'highlighter';
  const lasso = activeTool === 'lasso';
  const colours = highlighter ? HIGHLIGHTER_COLOURS : PEN_COLOURS;
  const extras = highlighter ? [] : PEN_MORE_COLOURS;
  const colour = highlighter ? props.highlighterColor : props.strokeColor;
  const setColour = highlighter ? props.setHighlighterColor : props.setStrokeColor;
  const width = highlighter ? props.highlighterWidth : props.strokeWidth;
  const setWidth = highlighter ? props.setHighlighterWidth : props.setStrokeWidth;
  const opacity = highlighter ? 0.35 : props.strokeOpacity;
  const previewWidth = highlighter ? width * 4 : width;
  const inRow = colours.some((c) => c.value === colour);
  // The second row (Slate, White, Any colour) shows when asked for, or while its colour is in use
  const showExtras = moreColours || !inRow;

  return (
    <div className="flex flex-col gap-4 min-w-[280px] max-w-[340px]">
      <div>
        <div className={SECTION_LABEL}>Colour</div>
        <div className="flex items-center justify-between gap-0.5">
          {colours.map((c) => (
            <SwatchButton key={c.value} colour={c.value} name={c.name} selected={colour === c.value} onPick={setColour} />
          ))}
          <SwatchButton
            colour={colour}
            name={UI.moreColours}
            selected={!inRow}
            background={inRow ? MANY_COLOURS : colour}
            onPick={() => setMoreColours((v) => !v)}
          />
        </div>
        {showExtras && (
          <div className="flex items-center gap-1 mt-1.5">
            {extras.map((c) => (
              <SwatchButton key={c.value} colour={c.value} name={c.name} selected={colour === c.value} onPick={setColour} />
            ))}
            <label title="Any colour" className={`relative h-9 ${TOUCH_TARGET} px-3 flex items-center gap-2 rounded-full bg-pg-tray text-pg-label font-medium text-pg-ink cursor-pointer`}>
              <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: MANY_COLOURS }} />
              Any colour
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(colour) ? colour : '#18181B'}
                onChange={(e) => setColour(e.target.value.toUpperCase())}
                aria-label="Any colour"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>

      {!highlighter && !lasso && (
        <div>
          <div className={SECTION_LABEL}>Pen type</div>
          <Segmented
            tall
            label="Pen type"
            value={props.penType}
            onChange={props.setPenType}
            options={PEN_TYPES.map((t) => ({
              value: t.id,
              label: t.label,
              title: `${t.label}: ${props.penWidths?.[t.id] ?? t.width} px${t.opacity < 1 ? `, ${Math.round(t.opacity * 100)}% opaque` : ''}`,
              content: (
                <>
                  <StrokePreview colour={colour} width={props.penWidths?.[t.id] ?? t.width} opacity={t.opacity} />
                  <span>{t.label}</span>
                </>
              ),
            }))}
          />
        </div>
      )}

      {!lasso && (
        <div>
          <div className="flex items-baseline justify-between">
            <span className={SECTION_LABEL}>Width</span>
            <span className="text-pg-body font-semibold tabular-nums text-pg-ink">{width} px</span>
          </div>
          <input
            type="range"
            min="1"
            max={highlighter ? 10 : 16}
            step="1"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            aria-label={`${highlighter ? 'Highlighter' : 'Pen'} width`}
            className="w-full min-h-[32px] [@media(pointer:coarse)]:min-h-[44px] accent-[rgb(var(--pg-ink))]"
          />
          <StrokePreview wide colour={colour} width={previewWidth} opacity={opacity} />
        </div>
      )}
      {lasso && <p className="text-pg-cap text-pg-text2">The lasso&apos;s colour button paints the selection in this colour.</p>}
    </div>
  );
}

/**
 * The tool dock at the bottom of the screen (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, 4.1 and 4.2).
 *   Laptop: Undo · Redo | Pen · Highlighter · Eraser · Lasso · Move · [pen chip] | [Insert] | Blocks ▾
 *   Tablet: the same with the Insert group folded into one Insert ▾ menu.
 *   Phone:  Undo · Pen · Highlighter · Eraser · Lasso · ● · +  (+ opens "Add to page")
 * Zoom and the page menu live in the top bars (DocBar, PageManager).
 */
export default function PlaygroundDock(props) {
  const {
    activeTool,
    setActiveTool,
    strokeColor,
    highlighterColor,
    strokeWidth,
    highlighterWidth,
    eraserSize,
    onAddBlock,
    isRecording = false,
    onToggleRecordAudio,
    onInsertImage,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    armedShape = null,
    onPickShape,
    onFreehandShape,
    onCaptureTextTarget,
    onInsertSymbol,
    onSymbolsClosed,
    onInsertEquation,
    onMoveFolded,
    screenshot = null,
  } = props;

  // Which panel is open: 'options' | 'blocks' | 'insert' (tablet) | 'add' (phone) | null
  const [panel, setPanel] = useState(null);
  const [showShapes, setShowShapes] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const showSymbolsRef = useRef(false);
  showSymbolsRef.current = showSymbols;
  const [symbolDialog, setSymbolDialog] = useState(null); // 'more' | 'number' | null
  const [showEquation, setShowEquation] = useState(false);
  const [latexDialog, setLatexDialog] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const symbolInsertedRef = useRef(false);
  const [windowWidth, setWindowWidth] = useState(1280);

  const armed = activeTool === 'shape' ? armedShape : null;

  const fileInputRef = useRef(null);
  const dockRef = useRef(null);
  const optionsButtonRef = useRef(null);
  const blocksButtonRef = useRef(null);
  const addButtonRef = useRef(null);
  const insertButtonRef = useRef(null);

  // A Symbol session (menu, then perhaps More Symbols or Number) ends when they all close
  const endSymbols = () => {
    onSymbolsClosed?.(symbolInsertedRef.current);
    symbolInsertedRef.current = false;
  };
  const endSymbolsRef = useRef(endSymbols);
  endSymbolsRef.current = endSymbols;

  // The Insert menus (Shapes, Symbol, Equation, Screenshot): a press outside closes them and does
  // not also draw on the page. (The other panels are Popovers, which do the same themselves.)
  useEffect(() => {
    if (!showShapes && !showSymbols && !showEquation && !showScreenshot) return undefined;
    const handleOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        if (e.target.closest && e.target.closest('[data-keep-panels]')) return;
        e.stopPropagation();
        setShowShapes(false);
        setShowEquation(false);
        setShowScreenshot(false);
        if (showSymbolsRef.current) {
          setShowSymbols(false);
          endSymbolsRef.current();
        }
      }
    };
    window.addEventListener('pointerdown', handleOutside, true);
    return () => window.removeEventListener('pointerdown', handleOutside, true);
  }, [showShapes, showSymbols, showEquation, showScreenshot]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1100;
  const isDesktop = windowWidth >= 1100;

  // The dock keeps clear of the app's left sidebar and sits centred in the space that is left
  const sidebarRight = useSidebarRight();

  // When the buttons do not fit, the dock folds step by step, worked out again from 0 whenever
  // the space changes (key). Laptop: first the Insert labels go, then Move goes into the page
  // menu. Tablet: Move first, then the Insert label. Blocks always keeps its label.
  const foldSteps = isDesktop ? ['insertLabels', 'move'] : ['move', 'insertLabels'];
  const fitKey = `${windowWidth}:${sidebarRight}`;
  const [fit, setFit] = useState({ key: '', level: 0 });
  const level = fit.key === fitKey ? fit.level : 0;
  const barRef = useRef(null);
  useLayoutEffect(() => {
    if (fit.key !== fitKey) {
      setFit({ key: fitKey, level: 0 });
      return;
    }
    const bar = barRef.current;
    if (bar && fit.level < foldSteps.length && bar.scrollWidth > bar.clientWidth + 1) setFit({ key: fitKey, level: fit.level + 1 });
  }, [fit, fitKey, foldSteps.length]);
  const folded = new Set(foldSteps.slice(0, level));
  const moveInPage = !isMobile && folded.has('move');
  const insertLabels = !folded.has('insertLabels');

  // The page menu shows Move page when the dock has no room for it (and always on phones)
  useEffect(() => {
    onMoveFolded?.(moveInPage);
  }, [moveInPage, onMoveFolded]);

  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  const closePanels = () => {
    setPanel(null);
    setShowShapes(false);
    setShowEquation(false);
    setShowScreenshot(false);
    if (showSymbols) {
      setShowSymbols(false);
      endSymbols();
    }
  };
  const togglePanel = (name) => {
    const open = panel !== name;
    closePanels();
    if (open) setPanel(name);
  };
  // Run an action from a menu: the menu closes first
  const run = (fn) => () => {
    closePanels();
    fn?.();
  };

  // Escape closes the Insert menus (Popovers and Dialogs close themselves)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setShowShapes(false);
      setShowEquation(false);
      setShowScreenshot(false);
      if (showSymbolsRef.current) {
        setShowSymbols(false);
        endSymbolsRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSymbols = () => {
    const open = !showSymbols;
    closePanels();
    symbolInsertedRef.current = false;
    setShowSymbols(open);
  };
  const insertSymbol = (text) => {
    symbolInsertedRef.current = true;
    onInsertSymbol?.(text);
  };
  // The cursor's field is remembered at the press, before the button takes the focus
  const captureTarget = () => onCaptureTextTarget?.();

  const openEquation = () => {
    const open = !showEquation;
    closePanels();
    setShowEquation(open);
  };
  const newEquation = () => {
    closePanels();
    onInsertEquation?.('');
  };
  const openScreenshot = () => {
    const open = !showScreenshot;
    closePanels();
    setShowScreenshot(open);
  };
  const openShapes = () => {
    const open = !showShapes;
    closePanels();
    setShowShapes(open);
  };
  const openPicture = () => {
    closePanels();
    fileInputRef.current?.click();
  };

  // ---- The Insert group (laptop), in WPS order: Picture, Screenshot, Shapes, Symbol, Equation ----
  const label = (text) => (insertLabels ? <span>{text}</span> : null);
  // A split button: the main part and its arrow joined into one shape; the whole shape shows
  // whether its menu is open
  const splitShell = (open) => `flex items-center rounded-xl ${open ? 'bg-pg-tray text-pg-ink' : 'text-pg-text2'}`;
  const splitMain = `h-10 ${TOUCH_TARGET} pl-2.5 pr-1.5 flex items-center justify-center gap-1.5 rounded-l-xl text-pg-label font-medium hover:bg-pg-tray hover:text-pg-ink transition-colors`;
  const splitArrow = `h-10 w-[26px] ${TOUCH_TARGET} flex items-center justify-center rounded-r-xl hover:bg-pg-tray hover:text-pg-ink transition-colors`;
  const soloShape = (open) => `h-10 ${TOUCH_TARGET} px-2.5 flex items-center justify-center gap-1.5 rounded-xl text-pg-label font-medium transition-colors ${open ? 'bg-pg-tray text-pg-ink' : 'text-pg-text2 hover:bg-pg-tray hover:text-pg-ink'}`;

  // Insert > Equation, as in WPS: on a laptop the button inserts a new equation and its arrow opens
  // the menu; on a touch screen (two targets side by side would be too small) the button opens the menu
  const equationButton = (
    <div className={splitShell(showEquation)}>
      <button
        type="button"
        onClick={coarsePointer ? openEquation : newEquation}
        title={coarsePointer ? 'Equation (New Equation, LaTeX, Common Equations)' : 'Equation: Insert New Equation'}
        aria-label="Equation"
        aria-expanded={coarsePointer ? showEquation : undefined}
        className={coarsePointer ? soloShape(false) : splitMain}
      >
        <span className="text-[19px] leading-none font-serif italic" aria-hidden="true">π</span>
        {label('Equation')}
      </button>
      {!coarsePointer && (
        <button type="button" onClick={openEquation} title="Equation menu: Insert LaTeX, Common Equations" aria-label="Equation menu" aria-expanded={showEquation} className={splitArrow}>
          <FiChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  // Insert > Screenshot, as in WPS: on a laptop the button takes a screenshot the ticked way
  // (Screenshot, or Hide Current Window During Screenshot) and its arrow opens the menu. On a
  // touch screen, or where the browser cannot capture the screen, the button opens the menu.
  const screenshotDirect = Boolean(screenshot && screenshot.canCapture && !coarsePointer);
  const hideMode = Boolean(screenshot && screenshot.mode === 'hide');
  const takeScreenshot = () => {
    closePanels();
    screenshot.capture('rect', { hide: hideMode });
  };
  const screenshotButton = screenshot && (
    <div className={splitShell(showScreenshot)}>
      <button
        type="button"
        onClick={screenshotDirect ? takeScreenshot : openScreenshot}
        title={
          screenshotDirect
            ? hideMode
              ? 'Screenshot: Hide Current Window During Screenshot (Ctrl+Alt+C)'
              : 'Screenshot (Ctrl+Alt+X)'
            : 'Screenshot (the Playground view, a photo or a pasted picture, cropped to a shape)'
        }
        aria-label="Screenshot"
        aria-expanded={screenshotDirect ? undefined : showScreenshot}
        className={screenshotDirect ? splitMain : soloShape(false)}
      >
        <LuScissors className="w-[18px] h-[18px]" aria-hidden="true" />
        {label('Screenshot')}
      </button>
      {screenshotDirect && (
        <button
          type="button"
          onClick={openScreenshot}
          title="Screenshot menu: oval, rounded, polygon, Hide Current Window, Screen Grab Main Window"
          aria-label="Screenshot menu"
          aria-expanded={showScreenshot}
          className={splitArrow}
        >
          <FiChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  // Insert > Symbol: the field that had the cursor gets the symbol
  const symbolButton = (
    <button
      type="button"
      onPointerDown={captureTarget}
      onClick={openSymbols}
      title="Symbol (Insert a symbol: ©, ℃, ≤, α, ①...)"
      aria-label="Symbol"
      aria-expanded={showSymbols}
      className={soloShape(showSymbols || Boolean(symbolDialog))}
    >
      <span className="text-[18px] leading-none" aria-hidden="true">Ω</span>
      {label('Symbol')}
    </button>
  );

  // Insert > Shapes: the button shows the armed shape while one is picked, as WPS does. A shape
  // being drawn is a tool mode, so it takes the active (graphite) look.
  const shapesButton = (
    <button
      type="button"
      onClick={openShapes}
      title={armed ? `Shapes: ${armed.name} (drag on the page to draw it)` : 'Shapes (Insert a rectangle, arrow, flowchart symbol, callout...)'}
      aria-label="Shapes"
      aria-expanded={showShapes}
      aria-pressed={activeTool === 'shape'}
      className={activeTool === 'shape' ? `${soloShape(false)} !bg-pg-ink !text-pg-on-ink` : soloShape(showShapes)}
    >
      {armed ? <ShapeIcon item={armed} className="w-5 h-5" /> : <LuShapes className="w-[18px] h-[18px]" aria-hidden="true" />}
      {label('Shapes')}
    </button>
  );

  // ---- Tiles: the + sheet (phone) and the Insert menu (tablet) ----
  const tile = `flex flex-col items-center justify-center gap-2 min-h-[78px] px-1 rounded-[14px] bg-pg-paper hover:bg-pg-tray text-pg-ink text-pg-cap font-medium text-center transition-colors`;
  const insertTiles = (asMenu) => (
    <>
      {onInsertImage && (
        <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openPicture} title="Picture: insert an image or photo" aria-label="Insert Picture" className={tile}>
          <FiImage className="w-6 h-6" aria-hidden="true" />
          <span>Picture</span>
        </button>
      )}
      {screenshot && (
        <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openScreenshot} title="Screenshot: the Playground view, a photo or a pasted picture, cropped to a shape" aria-label="Insert Screenshot" className={tile}>
          <LuScissors className="w-6 h-6" aria-hidden="true" />
          <span>Screenshot</span>
        </button>
      )}
      <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openShapes} title="Shapes: rectangles, arrows, flowchart symbols, callouts..." aria-label="Insert Shapes" className={tile}>
        <LuShapes className="w-6 h-6" aria-hidden="true" />
        <span>Shapes</span>
      </button>
      <button type="button" role={asMenu ? 'menuitem' : undefined} onPointerDown={captureTarget} onClick={openSymbols} title="Symbol: ©, ℃, ≤, α, ①..." aria-label="Insert Symbol" className={tile}>
        <span className="text-[24px] leading-6" aria-hidden="true">Ω</span>
        <span>Symbol</span>
      </button>
      <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openEquation} title="Equation: New Equation, LaTeX, Common Equations" aria-label="Insert Equation" className={tile}>
        <span className="text-[25px] leading-6 font-serif italic" aria-hidden="true">π</span>
        <span>Equation</span>
      </button>
    </>
  );

  const blockTiles = (
    <>
      {onAddBlock && (
        <>
          <button type="button" onClick={run(() => onAddBlock('graph'))} title="Add a Graph block" aria-label="Add Graph Block" className={tile}>
            <LuLineChart className="w-6 h-6" aria-hidden="true" />
            <span>{UI.graph}</span>
          </button>
          <button type="button" onClick={run(() => onAddBlock('theory'))} title="Add a Text block" aria-label="Add Text Block" className={tile}>
            <LuType className="w-6 h-6" aria-hidden="true" />
            <span>{UI.text}</span>
          </button>
        </>
      )}
      {onToggleRecordAudio && (
        <button
          type="button"
          onClick={run(onToggleRecordAudio)}
          title={isRecording ? 'Stop recording' : 'Record a voice memo'}
          aria-label={isRecording ? 'Stop recording' : 'Record a voice memo'}
          className={`${tile} ${isRecording ? '!text-pg-danger' : ''}`}
        >
          <FiMic className="w-6 h-6" aria-hidden="true" />
          <span>{isRecording ? UI.stopRecording : UI.voiceMemo}</span>
        </button>
      )}
    </>
  );

  // Blocks menu (laptop, tablet): Graph, Text, Voice memo
  const blockRows = (
    <div className="flex flex-col w-[220px]">
      {onAddBlock && (
        <>
          <button type="button" onClick={run(() => onAddBlock('graph'))} title="Add a Graph block" aria-label="Add Graph Block" className={MENU_ROW}>
            <LuLineChart className="w-5 h-5 text-pg-text2" aria-hidden="true" />
            {UI.graph}
          </button>
          <button type="button" onClick={run(() => onAddBlock('theory'))} title="Add a Text block" aria-label="Add Text Block" className={MENU_ROW}>
            <LuType className="w-5 h-5 text-pg-text2" aria-hidden="true" />
            {UI.text}
          </button>
        </>
      )}
      {onToggleRecordAudio && (
        <button
          type="button"
          onClick={run(onToggleRecordAudio)}
          title={isRecording ? 'Stop recording' : 'Record a voice memo'}
          aria-label={isRecording ? 'Stop recording' : 'Record a voice memo'}
          className={`${MENU_ROW} ${isRecording ? '!text-pg-danger' : ''}`}
        >
          <FiMic className={`w-5 h-5 ${isRecording ? '' : 'text-pg-text2'}`} aria-hidden="true" />
          {isRecording ? UI.stopRecording : UI.voiceMemo}
        </button>
      )}
    </div>
  );

  // ---- The tools: one active look for all of them ----
  const tool = (id, name, shortcut, icon, title) => (
    <button
      type="button"
      onClick={() => setActiveTool(id)}
      title={title || `${name} - key ${shortcut}`}
      aria-label={name}
      aria-pressed={activeTool === id}
      className={toolButton({ active: activeTool === id })}
    >
      {icon}
    </button>
  );
  const iconSize = isMobile ? 'w-[22px] h-[22px]' : 'w-5 h-5';

  // The lasso shows the pen options too: its toolbar recolours a selection with the pen colour
  const hasOptions = activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser' || activeTool === 'lasso';
  const optionsColour = activeTool === 'highlighter' ? highlighterColor : strokeColor;
  const optionsWidth = activeTool === 'highlighter' ? highlighterWidth : strokeWidth;
  const eraserSizeName = (ERASER_SIZES.find((s) => s.value === eraserSize) || ERASER_SIZES[1]).label;
  const optionsDetail =
    activeTool === 'eraser'
      ? `${eraserSizeName} eraser`
      : activeTool === 'lasso'
        ? colourName(strokeColor, false)
        : `${colourName(optionsColour, activeTool === 'highlighter')}, ${optionsWidth} px`;
  const colourDot = (size) => (
    <span
      className={`${size} rounded-full border border-black/15 dark:border-white/20 shrink-0`}
      style={{ backgroundColor: optionsColour }}
      aria-hidden="true"
    />
  );

  // The pen chip (laptop, tablet): what you will draw with. The ● on phones.
  const optionsButton = hasOptions && (
    <button
      ref={optionsButtonRef}
      type="button"
      onClick={() => togglePanel('options')}
      title={`${optionsTitle(activeTool)}: ${optionsDetail}`}
      aria-label={optionsTitle(activeTool)}
      aria-expanded={panel === 'options'}
      data-tool-options
      className={
        isMobile
          ? toolButton({ expanded: panel === 'options' })
          : `h-10 ${TOUCH_TARGET} shrink-0 ml-1 px-2.5 flex items-center gap-2 rounded-xl border text-pg-label font-medium tabular-nums text-pg-ink transition-colors ${panel === 'options' ? 'bg-pg-tray border-pg-line' : 'bg-pg-surface border-pg-line hover:bg-pg-tray'}`
      }
    >
      {activeTool === 'eraser' ? (
        <span className="w-[18px] h-[18px] rounded-full border-2 border-pg-text2 shrink-0" aria-hidden="true" />
      ) : (
        colourDot(isMobile ? 'w-6 h-6 ring-[1.5px] ring-pg-line ring-offset-2 ring-offset-pg-surface' : 'w-[18px] h-[18px]')
      )}
      {!isMobile && activeTool !== 'lasso' && <span>{activeTool === 'eraser' ? eraserSizeName : `${optionsWidth} px`}</span>}
      {!isMobile && <FiChevronDown className="w-3.5 h-3.5 text-pg-text2" aria-hidden="true" />}
    </button>
  );

  const anyPanel = panel || showShapes || showSymbols || showEquation || showScreenshot || symbolDialog || latexDialog;
  const anyInsertMenu = showShapes || showSymbols || Boolean(symbolDialog) || showEquation || showScreenshot;

  return (
    <div
      ref={dockRef}
      // Centred with auto margins, not a transform: a transform would pin the phone bottom sheets
      // inside the dock to the dock instead of the screen
      // An open menu sits above everything on the page: blocks being edited (z-50)
      className={`fixed right-0 mx-auto w-fit ${anyPanel ? 'z-[60]' : 'z-40'} flex flex-col items-center gap-2 pointer-events-auto select-none`}
      style={{
        left: sidebarRight,
        maxWidth: `calc(100vw - ${sidebarRight + 16}px)`,
        // Pop-ups above the dock are centred on it, so this width keeps them clear of the sidebar too
        '--dock-panel-max': `calc(100vw - ${sidebarRight + 16}px)`,
        bottom: isMobile ? 'max(12px, env(safe-area-inset-bottom, 12px))' : 'max(16px, env(safe-area-inset-bottom, 16px))',
      }}
    >
      {/* Insert > Shapes gallery (WPS / Word categories) */}
      {showShapes && (
        <ShapeGallery
          isMobile={isMobile}
          armedId={armed ? armed.id : null}
          onPick={(item) => {
            setShowShapes(false);
            onPickShape?.(item);
          }}
          onFreehand={() => {
            setShowShapes(false);
            onFreehandShape?.();
          }}
          onClose={() => setShowShapes(false)}
        />
      )}

      {/* Insert > Symbol menu, and its More Symbols and Number dialogs */}
      {showSymbols && (
        <SymbolMenu
          isMobile={isMobile}
          onInsert={(char) => {
            insertSymbol(char);
            setShowSymbols(false);
            endSymbols();
          }}
          onMoreSymbols={() => {
            setShowSymbols(false);
            setSymbolDialog('more');
          }}
          onNumber={() => {
            setShowSymbols(false);
            setSymbolDialog('number');
          }}
          onClose={() => {
            setShowSymbols(false);
            endSymbols();
          }}
        />
      )}
      {symbolDialog === 'more' && (
        <SymbolDialog
          isMobile={isMobile}
          onInsert={insertSymbol}
          onClose={() => {
            setSymbolDialog(null);
            endSymbols();
          }}
        />
      )}
      {symbolDialog === 'number' && (
        <NumberDialog
          isMobile={isMobile}
          onInsert={insertSymbol}
          onClose={() => {
            setSymbolDialog(null);
            endSymbols();
          }}
        />
      )}

      {/* Insert > Equation menu, and the Insert LaTeX dialog */}
      {showEquation && (
        <EquationMenu
          isMobile={isMobile}
          onNewEquation={newEquation}
          onInsertLatex={() => {
            setShowEquation(false);
            setLatexDialog(true);
          }}
          onInsertCommon={(latex) => {
            setShowEquation(false);
            onInsertEquation?.(latex);
          }}
          onClose={() => setShowEquation(false)}
        />
      )}
      {latexDialog && <InsertLatexDialog isMobile={isMobile} onInsert={(latex) => onInsertEquation?.(latex)} onClose={() => setLatexDialog(false)} />}

      {/* Insert > Screenshot menu */}
      {showScreenshot && screenshot && (
        <ScreenshotMenu
          isMobile={isMobile}
          canCapture={screenshot.canCapture}
          mode={screenshot.mode}
          onCapture={(shape, options) => {
            closePanels();
            screenshot.capture(shape, options);
          }}
          onGrabView={() => {
            closePanels();
            screenshot.grabView();
          }}
          onFromPhotos={() => {
            closePanels();
            screenshot.fromPhotos();
          }}
          onPaste={() => {
            closePanels();
            screenshot.paste();
          }}
          onClose={() => setShowScreenshot(false)}
        />
      )}

      {/* Tablet: the Insert group, folded into one menu of tiles */}
      {panel === 'insert' && (
        <Popover title={UI.insert} isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={insertButtonRef} showHeader={false} role="menu" className="w-max">
          <div className="grid grid-cols-5 gap-1.5 w-[440px] max-w-full">{insertTiles(true)}</div>
        </Popover>
      )}

      {/* Phone: + "Add to page": the Insert group and the blocks, as tiles */}
      {panel === 'add' && (
        <Popover title={UI.addToPage} isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={addButtonRef}>
          <div className="flex flex-col gap-4">
            <section>
              <div className={SECTION_LABEL}>{UI.insert}</div>
              <div className="grid grid-cols-5 gap-1.5">{insertTiles(false)}</div>
            </section>
            <section>
              <div className={SECTION_LABEL}>{UI.blocks}</div>
              <div className="grid grid-cols-5 gap-1.5">{blockTiles}</div>
            </section>
          </div>
        </Popover>
      )}

      {/* The active tool's options: colour, pen type, width (pen, highlighter) or eraser options */}
      {panel === 'options' && hasOptions && (
        <Popover
          title={isMobile ? sheetTitle(activeTool) : optionsTitle(activeTool)}
          isMobile={isMobile}
          onClose={() => setPanel(null)}
          anchorRef={optionsButtonRef}
          placement={PLACE_ABOVE}
        >
          <ToolOptions {...props} />
        </Popover>
      )}

      {panel === 'blocks' && (
        <Popover title={UI.blocks} isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={blocksButtonRef}>
          {blockRows}
        </Popover>
      )}

      {/* Hidden File Input for Picture Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              onInsertImage?.(reader.result);
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }}
      />

      {/* The dock */}
      {/* CRITICAL: Must have button[title^="Pen"] as a direct child to satisfy screens.mjs audit */}
      {/* Items never shrink: a dock that does not fit overflows, which is what makes it fold */}
      <div
        ref={barRef}
        role="toolbar"
        aria-label="Whiteboard tools"
        data-dock
        className={`flex items-center [&>*]:shrink-0 gap-0.5 max-w-full overflow-hidden ${BAR_SHELL} ${
          isMobile ? 'w-[calc(100vw-24px)] justify-between px-1.5 py-2.5 rounded-[20px]' : 'p-1.5'
        }`}
      >
        {onUndo && (
          <button type="button" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z, or tap with two fingers)" aria-label={UI.undo} className={toolButton()}>
            <LuUndo2 className={iconSize} />
          </button>
        )}
        {!isMobile && onRedo && (
          <button type="button" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z, or tap with three fingers)" aria-label={UI.redo} className={toolButton()}>
            <LuRedo2 className={iconSize} />
          </button>
        )}
        {!isMobile && <Divider />}

        {tool('pen', UI.pen, 'P', <LuPencil className={iconSize} />, 'Pen (Stylus / Mouse Ink) - key P')}
        {tool('highlighter', UI.highlighter, 'H', <LuHighlighter className={iconSize} />)}
        {tool('eraser', UI.eraser, 'E', <LuEraser className={iconSize} />, 'Eraser (Whole Strokes or Part of a Stroke) - key E')}
        {tool('lasso', 'Lasso Select', 'L', <LuLassoSelect className={iconSize} />, 'Lasso Select (select ink to move it, or to read it) - key L')}
        {!isMobile && !moveInPage && tool('pan', UI.movePage, 'M', <LuHand className={iconSize} />, 'Move page - key M')}

        {/* The pen chip (laptop, tablet) or the ● (phone) */}
        {optionsButton}

        {/* Tablet: one Insert button for the Insert group */}
        {isTablet && (
          <>
            <Divider />
            <button
              ref={insertButtonRef}
              type="button"
              onClick={() => togglePanel('insert')}
              title="Insert (Picture, Screenshot, Shapes, Symbol, Equation)"
              aria-label={UI.insert}
              aria-expanded={panel === 'insert'}
              className={toolButton({ wide: insertLabels, active: activeTool === 'shape', expanded: panel === 'insert' || anyInsertMenu })}
            >
              {armed ? <ShapeIcon item={armed} className="w-5 h-5" /> : <LuPlus className="w-5 h-5" aria-hidden="true" />}
              {insertLabels && <span>{UI.insert}</span>}
              <FiChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Laptop: the Insert group, in WPS order: Picture, Screenshot, Shapes, Symbol, Equation */}
        {isDesktop && (
          <>
            <Divider />
            <div className="flex items-center gap-0.5 p-0.5 rounded-[13px] bg-pg-paper" role="group" aria-label={UI.insert}>
              {onInsertImage && (
                <button type="button" onClick={openPicture} title="Picture: insert an image or photo" aria-label="Insert Picture" className={soloShape(false)}>
                  <FiImage className="w-[18px] h-[18px]" aria-hidden="true" />
                  {label('Picture')}
                </button>
              )}
              {screenshotButton}
              {shapesButton}
              {symbolButton}
              {equationButton}
            </div>
          </>
        )}

        {/* Blocks (laptop, tablet) */}
        {!isMobile && (
          <>
            <Divider />
            <button
              ref={blocksButtonRef}
              type="button"
              onClick={() => togglePanel('blocks')}
              title="Blocks: Graph, Text, Voice memo"
              aria-label={isRecording ? `${UI.blocks}, ${UI.recording.toLowerCase()}` : UI.blocks}
              aria-expanded={panel === 'blocks'}
              className={`${toolButton({ wide: true, expanded: panel === 'blocks' })} !text-pg-ink`}
            >
              <LuLayoutGrid className="w-[18px] h-[18px]" aria-hidden="true" />
              <span>{UI.blocks}</span>
              {isRecording ? <span className="w-2 h-2 rounded-full bg-pg-danger animate-pulse" aria-hidden="true" /> : <FiChevronDown className="w-3.5 h-3.5 text-pg-text2" aria-hidden="true" />}
            </button>
          </>
        )}

        {/* Phone: + "Add to page" (Insert and Blocks). A shape being drawn lights it. */}
        {isMobile && (
          <button
            ref={addButtonRef}
            type="button"
            onClick={() => togglePanel('add')}
            title="Add to page: Picture, Screenshot, Shapes, Symbol, Equation, Graph, Text, Voice memo"
            aria-label={UI.addToPage}
            aria-expanded={panel === 'add'}
            className={
              activeTool === 'shape'
                ? toolButton({ active: true })
                : `${toolButton({ expanded: panel === 'add' || anyInsertMenu })} !bg-pg-tray !text-pg-ink`
            }
          >
            {armed ? <ShapeIcon item={armed} className="w-5 h-5" /> : <LuPlus className="w-[22px] h-[22px]" />}
          </button>
        )}
      </div>
    </div>
  );
}
