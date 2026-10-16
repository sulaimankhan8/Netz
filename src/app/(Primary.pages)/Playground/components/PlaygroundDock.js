'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  FiEdit2,
  FiMove,
  FiZoomIn,
  FiZoomOut,
  FiCheck,
  FiBarChart2,
  FiFileText,
  FiDownload,
  FiLayers,
  FiBookOpen,
  FiMic,
  FiImage,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiMoreHorizontal,
  FiMaximize,
  FiSettings,
  FiChevronDown,
} from 'react-icons/fi';
import { FaHighlighter, FaEraser } from 'react-icons/fa6';
import { LuLassoSelect, LuShapes, LuScissors, LuPlusSquare as LuInsert, LuMusic, LuLayoutGrid } from 'react-icons/lu';
import ShapeGallery, { ShapeIcon } from './shapes/ShapeGallery';
import SymbolMenu from './symbols/SymbolMenu';
import SymbolDialog from './symbols/SymbolDialog';
import NumberDialog from './symbols/NumberDialog';
import EquationMenu from './equation/EquationMenu';
import InsertLatexDialog from './equation/InsertLatexDialog';
import ScreenshotMenu from './screenshot/ScreenshotMenu';
import { Dialog, Popover, TOUCH_TARGET } from './ui/Dialog';
import { UI } from '../utils/uiText';

// Pen types: each sets width and opacity together, so they look different on the page
const PEN_TYPES = [
  { label: 'Ballpoint', width: 2, opacity: 1.0 },
  { label: 'Fountain', width: 5, opacity: 1.0 },
  { label: 'Pencil', width: 3, opacity: 0.7 },
  { label: 'Marker', width: 10, opacity: 0.85 },
];

const PEN_COLOURS = [
  { value: '#18181B', name: 'Black' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#10B981', name: 'Green' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#F43F5E', name: 'Pink' },
  { value: '#F59E0B', name: 'Amber' },
  { value: '#06B6D4', name: 'Cyan' },
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

const PAGE_BACKGROUNDS = [
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'lines', label: 'Lines' },
  { value: 'none', label: 'Plain' },
];

const READ_MODES = [
  { value: 'off', label: UI.readOff, hint: 'Never read handwriting' },
  { value: 'select', label: UI.readSelect, hint: 'Read ink you circle with the lasso' },
  { value: 'live', label: UI.readLive, hint: 'Read as you write and show the readings' },
];

// Shared looks
const toolButton = 'w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all';
const idle = 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800';
const divider = <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />;
const sectionTitle = 'text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5';
const chip = (active) =>
  `px-3 min-h-[36px] ${TOUCH_TARGET} flex items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
    active ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
  }`;
const menuRow = 'w-full flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors';
const tile = 'flex-1 flex flex-col items-center justify-center gap-1 p-2 min-h-[56px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold';

/** A colour swatch with a name (read out by screen readers, shown as the tooltip). */
function Swatch({ colour, name, selected, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(colour)}
      title={name}
      aria-label={name}
      aria-pressed={selected}
      className={`w-8 h-8 ${TOUCH_TARGET} rounded-full flex items-center justify-center`}
    >
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center border border-black/15 dark:border-white/20 ${selected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}
        style={{ backgroundColor: colour }}
      >
        {selected && <FiCheck className={`w-3.5 h-3.5 ${colour === '#FFFFFF' || colour === '#FACC15' ? 'text-black' : 'text-white'}`} />}
      </span>
    </button>
  );
}

/** The options of the active drawing tool: pen, highlighter or eraser. */
function ToolOptions(props) {
  const { activeTool } = props;
  if (activeTool === 'eraser') {
    return (
      <div className="flex flex-col gap-3 min-w-[260px]">
        <div>
          <div className={sectionTitle}>Erase</div>
          <div className="flex flex-wrap gap-1.5">
            {ERASER_MODES.map((mode) => (
              <button key={mode.value} type="button" onClick={() => props.setEraserMode(mode.value)} title={mode.title} aria-pressed={props.eraserMode === mode.value} className={chip(props.eraserMode === mode.value)}>
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className={sectionTitle}>Size</div>
          <div className="flex gap-1.5">
            {ERASER_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => props.setEraserSize(size.value)}
                title={`${size.label} eraser`}
                aria-label={`${size.label} eraser`}
                aria-pressed={props.eraserSize === size.value}
                className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center ${props.eraserSize === size.value ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <span className="rounded-full border border-rose-500 bg-rose-500/20" style={{ width: size.dot, height: size.dot }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const highlighter = activeTool === 'highlighter';
  const colours = highlighter ? HIGHLIGHTER_COLOURS : PEN_COLOURS;
  const colour = highlighter ? props.highlighterColor : props.strokeColor;
  const setColour = highlighter ? props.setHighlighterColor : props.setStrokeColor;
  const width = highlighter ? props.highlighterWidth : props.strokeWidth;
  const setWidth = highlighter ? props.setHighlighterWidth : props.setStrokeWidth;
  const opacity = highlighter ? 0.35 : props.strokeOpacity;
  const previewWidth = highlighter ? width * 4 : width;
  const custom = !colours.some((c) => c.value === colour);

  return (
    <div className="flex flex-col gap-3 min-w-[260px] max-w-[340px]">
      <div>
        <div className={sectionTitle}>Colour</div>
        <div className="flex flex-wrap items-center gap-0.5">
          {colours.map((c) => (
            <Swatch key={c.value} colour={c.value} name={c.name} selected={colour === c.value} onPick={setColour} />
          ))}
          <label title="Any colour" className={`relative w-8 h-8 ${TOUCH_TARGET} rounded-full flex items-center justify-center cursor-pointer`}>
            <span
              className={`w-7 h-7 rounded-full border border-black/15 dark:border-white/20 ${custom ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}
              style={{ background: custom ? colour : 'conic-gradient(#F43F5E, #F59E0B, #10B981, #06B6D4, #3B82F6, #8B5CF6, #F43F5E)' }}
            />
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(colour) ? colour : '#3B82F6'}
              onChange={(e) => setColour(e.target.value.toUpperCase())}
              aria-label="Any colour"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {!highlighter && (
        <div>
          <div className={sectionTitle}>Pen type</div>
          <div className="flex flex-wrap gap-1.5">
            {PEN_TYPES.map((t) => {
              const active = props.strokeWidth === t.width && props.strokeOpacity === t.opacity;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    props.setStrokeWidth(t.width);
                    props.setStrokeOpacity(t.opacity);
                  }}
                  aria-pressed={active}
                  title={`${t.label}: ${t.width} px${t.opacity < 1 ? `, ${Math.round(t.opacity * 100)}% opaque` : ''}`}
                  className={chip(active)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <span className={sectionTitle}>Width</span>
          <span className="text-[12px] font-mono text-zinc-600 dark:text-zinc-300 mb-1.5">{width} px</span>
        </div>
        <input
          type="range"
          min="1"
          max={highlighter ? 10 : 16}
          step="1"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          aria-label={`${highlighter ? 'Highlighter' : 'Pen'} width`}
          className="w-full accent-blue-500 min-h-[32px]"
        />
        {/* What a stroke looks like with these settings */}
        <svg viewBox="0 0 240 28" className="w-full h-7 mt-1" aria-hidden="true">
          <path d="M8 18 C 60 2, 100 30, 150 14 S 220 8, 232 14" fill="none" stroke={colour} strokeOpacity={opacity} strokeWidth={Math.min(previewWidth, 26)} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/** Preferences: what one finger does, and when handwriting is read. */
function PreferencesDialog({ isMobile, onClose, fingerDraws, setFingerDraws, readMode, setReadMode, notesMode }) {
  return (
    <Dialog title={UI.preferences} isMobile={isMobile} onClose={onClose} width="w-[460px]" fullHeight={false}>
      <div>
        <div className={sectionTitle}>One finger</div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="One finger">
          <button type="button" role="radio" aria-checked={fingerDraws} onClick={() => setFingerDraws(true)} className={chip(fingerDraws)}>
            Draws
          </button>
          <button type="button" role="radio" aria-checked={!fingerDraws} onClick={() => setFingerDraws(false)} className={chip(!fingerDraws)}>
            Moves the page
          </button>
        </div>
        <p className="mt-1.5 text-[12px] text-zinc-500 dark:text-zinc-400">Two fingers always move and zoom the page. A pen and a mouse always draw.</p>
      </div>
      <div>
        <div className={sectionTitle}>{UI.readMyWriting}</div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={UI.readMyWriting}>
          {READ_MODES.map((m) => (
            <button key={m.value} type="button" role="radio" aria-checked={readMode === m.value} title={m.hint} onClick={() => setReadMode(m.value)} className={chip(readMode === m.value)}>
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[12px] text-zinc-500 dark:text-zinc-400">
          {READ_MODES.find((m) => m.value === readMode)?.hint}.{notesMode ? ` ${UI.writingMode} is on, so this is set to “${UI.readLive}”.` : ''}
        </p>
      </div>
    </Dialog>
  );
}

export default function PlaygroundDock(props) {
  const {
    activeTool,
    setActiveTool,
    strokeColor,
    highlighterColor,
    gridStyle,
    setGridStyle,
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onFitToContent,
    onAddBlock,
    onOpenSyncModal,
    onExportCanvas,
    readMode = 'select',
    setReadMode,
    notesMode = false,
    setNotesMode,
    isRecording = false,
    onToggleRecordAudio,
    onInsertImage,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    fingerDraws = true,
    setFingerDraws,
    armedShape = null,
    onPickShape,
    onFreehandShape,
    onCaptureTextTarget,
    onInsertSymbol,
    onSymbolsClosed,
    onInsertEquation,
    onOpenMusic,
    screenshot = null,
  } = props;

  // Which panel is open: 'options' | 'blocks' | 'page' | 'zoom' | 'more' | 'insert' | null
  const [panel, setPanel] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
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
  const pageButtonRef = useRef(null);
  const zoomButtonRef = useRef(null);
  const moreButtonRef = useRef(null);
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

  // The dock keeps clear of the app's left sidebar (72 px collapsed, wider when open; on phones it
  // is a sliding overlay, so it does not count) and sits centred in the space that is left.
  const [sidebarRight, setSidebarRight] = useState(0);
  useEffect(() => {
    const sidebar = document.querySelector('[data-app-sidebar]');
    const measure = () => {
      const r = sidebar ? sidebar.getBoundingClientRect() : null;
      setSidebarRight(r && window.innerWidth >= 768 && r.right > 0 && r.width < window.innerWidth / 2 ? Math.round(r.right) : 0);
    };
    measure();
    const observer = sidebar && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (observer) observer.observe(sidebar);
    window.addEventListener('resize', measure);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // When the buttons do not fit, the dock folds step by step:
  //   1: no text labels (except Blocks and Page)   2: the zoom buttons become one
  //   3: Move goes into the Page menu (laptop, tablet)
  // The level is worked out again, from 0, whenever the space changes (key)
  const fitKey = `${windowWidth}:${sidebarRight}`;
  const [fit, setFit] = useState({ key: '', level: 0 });
  const compact = fit.key === fitKey ? fit.level : 0;
  const barRef = useRef(null);
  useLayoutEffect(() => {
    if (fit.key !== fitKey) {
      setFit({ key: fitKey, level: 0 });
      return;
    }
    const bar = barRef.current;
    if (bar && fit.level < 3 && bar.scrollWidth > bar.clientWidth + 1) setFit({ key: fitKey, level: fit.level + 1 });
  }, [fit, fitKey]);
  const showLabels = compact === 0;
  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  const foldZoom = compact >= 2;
  const moveInPage = compact >= 3;

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

  // Insert > Equation, as in WPS: on a laptop the button inserts a new equation and its arrow opens
  // the menu; on a touch screen (two targets side by side would be too small) the button opens the menu
  const equationButton = (
    <div className={`flex items-center rounded-xl ${showEquation ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-zinc-600 dark:text-zinc-300'}`}>
      <button
        type="button"
        onClick={coarsePointer ? openEquation : newEquation}
        title={coarsePointer ? 'Equation (New Equation, LaTeX, Common Equations)' : 'Equation: Insert New Equation'}
        aria-label="Equation"
        aria-expanded={coarsePointer ? showEquation : undefined}
        className={`h-11 min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 rounded-xl transition-all ${showEquation ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
      >
        <span className="text-base leading-none font-serif italic" aria-hidden="true">π</span>
        {isDesktop && showLabels && <span className="text-[12px] font-semibold not-italic">Equation</span>}
      </button>
      {!coarsePointer && (
        <button
          type="button"
          onClick={openEquation}
          title="Equation menu: Insert LaTeX, Common Equations"
          aria-label="Equation menu"
          aria-expanded={showEquation}
          className={`h-11 min-h-[44px] w-6 flex items-center justify-center rounded-xl ${showEquation ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
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
    <div className={`flex items-center rounded-xl ${showScreenshot ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-zinc-600 dark:text-zinc-300'}`}>
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
        className={`h-11 min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 rounded-xl transition-all ${showScreenshot ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
      >
        <LuScissors className="w-4 h-4" />
        {isDesktop && showLabels && <span className="text-[12px] font-semibold">Screenshot</span>}
      </button>
      {screenshotDirect && (
        <button
          type="button"
          onClick={openScreenshot}
          title="Screenshot menu: oval, rounded, polygon, Hide Current Window, Screen Grab Main Window"
          aria-label="Screenshot menu"
          aria-expanded={showScreenshot}
          className={`h-11 min-h-[44px] w-6 flex items-center justify-center rounded-xl ${showScreenshot ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
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
      className={`h-11 min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 rounded-xl transition-all ${
        showSymbols || symbolDialog ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : idle
      }`}
    >
      <span className="text-base leading-none font-semibold" aria-hidden="true">Ω</span>
      {isDesktop && showLabels && <span className="text-[12px] font-semibold">Symbol</span>}
    </button>
  );

  // Insert > Shapes: the button shows the armed shape while one is picked, as WPS does
  const shapesButton = (
    <button
      type="button"
      onClick={openShapes}
      title={armed ? `Shapes: ${armed.name} (drag on the page to draw it)` : 'Shapes (Insert a rectangle, arrow, flowchart symbol, callout...)'}
      aria-label="Shapes"
      aria-expanded={showShapes}
      aria-pressed={activeTool === 'shape'}
      className={`h-11 min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 rounded-xl transition-all relative ${
        activeTool === 'shape' || showShapes ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : idle
      }`}
    >
      {armed ? <ShapeIcon item={armed} className="w-5 h-5" /> : <LuShapes className="w-4 h-4" />}
      {isDesktop && showLabels && <span className="text-[12px] font-semibold">Shapes</span>}
    </button>
  );

  // The five Insert items as tiles (phone More sheet, tablet Insert menu)
  const insertTiles = (asMenu) => (
    <div className="flex items-stretch gap-2">
      {onInsertImage && (
        <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openPicture} title="Picture: insert an image or photo" aria-label="Insert Picture" className={tile}>
          <FiImage className="w-4 h-4" aria-hidden="true" />
          <span>Picture</span>
        </button>
      )}
      {screenshot && (
        <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openScreenshot} title="Screenshot: the Playground view, a photo or a pasted picture, cropped to a shape" aria-label="Insert Screenshot" className={tile}>
          <LuScissors className="w-4 h-4" aria-hidden="true" />
          <span>Screenshot</span>
        </button>
      )}
      <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openShapes} title="Shapes: rectangles, arrows, flowchart symbols, callouts..." aria-label="Insert Shapes" className={tile}>
        <LuShapes className="w-4 h-4" aria-hidden="true" />
        <span>Shapes</span>
      </button>
      <button type="button" role={asMenu ? 'menuitem' : undefined} onPointerDown={captureTarget} onClick={openSymbols} title="Symbol: ©, ℃, ≤, α, ①..." aria-label="Insert Symbol" className={tile}>
        <span className="text-base leading-none" aria-hidden="true">Ω</span>
        <span>Symbol</span>
      </button>
      <button type="button" role={asMenu ? 'menuitem' : undefined} onClick={openEquation} title="Equation: New Equation, LaTeX, Common Equations" aria-label="Insert Equation" className={tile}>
        <span className="text-base leading-none font-serif italic" aria-hidden="true">π</span>
        <span>Equation</span>
      </button>
    </div>
  );

  // Blocks: Graph, Text, Voice memo
  const blockRows = (
    <div className="flex flex-col gap-1">
      {onAddBlock && (
        <>
          <button type="button" onClick={run(() => onAddBlock('graph'))} title="Add a Graph block" aria-label="Add Graph Block" className={menuRow}>
            <FiBarChart2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            {UI.graph}
          </button>
          <button type="button" onClick={run(() => onAddBlock('theory'))} title="Add a Text block" aria-label="Add Text Block" className={menuRow}>
            <FiFileText className="w-4 h-4 text-purple-600" aria-hidden="true" />
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
          className={`${menuRow} ${isRecording ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}`}
        >
          <FiMic className="w-4 h-4" aria-hidden="true" />
          {isRecording ? UI.stopRecording : UI.voiceMemo}
        </button>
      )}
    </div>
  );

  // Page menu contents: Writing mode, background, Send to Notes, Export, Focus music, Preferences
  const pageRows = (withMove) => (
    <div className="flex flex-col gap-3 min-w-[260px]">
      <div className="flex flex-col gap-1">
        {withMove && (
          <button type="button" onClick={run(() => setActiveTool('pan'))} title="Move page - key M" aria-label={UI.movePage} aria-pressed={activeTool === 'pan'} className={`${menuRow} ${activeTool === 'pan' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : ''}`}>
            <FiMove className="w-4 h-4" aria-hidden="true" />
            {UI.movePage}
          </button>
        )}
        {setNotesMode && (
          <button
            type="button"
            onClick={run(() => setNotesMode(!notesMode))}
            title={notesMode ? 'Writing mode is on: lined paper, reading as you write' : 'Writing mode: lined paper, reading as you write'}
            aria-label={UI.writingMode}
            aria-pressed={notesMode}
            className={`${menuRow} justify-between`}
          >
            <span className="flex items-center gap-2.5">
              <FiBookOpen className="w-4 h-4" aria-hidden="true" />
              {UI.writingMode}
            </span>
            <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${notesMode ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>{notesMode ? 'On' : 'Off'}</span>
          </button>
        )}
      </div>

      <div>
        <div className={sectionTitle}>Page background{notesMode ? ' (lines while Writing mode is on)' : ''}</div>
        <div className="flex flex-wrap gap-1.5">
          {PAGE_BACKGROUNDS.map((b) => (
            <button key={b.value} type="button" disabled={notesMode} onClick={() => setGridStyle(b.value)} aria-pressed={gridStyle === b.value} className={`${chip(gridStyle === b.value)} disabled:opacity-50`}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {onOpenSyncModal && (
          <button type="button" onClick={run(onOpenSyncModal)} title="Send typed blocks to a new note" aria-label={UI.sendToNotes} className={menuRow}>
            <FiLayers className="w-4 h-4 text-blue-600" aria-hidden="true" />
            {UI.sendToNotes}
          </button>
        )}
        {onExportCanvas && (
          <div className="flex items-center gap-1.5 px-3 min-h-[44px]">
            <FiDownload className="w-4 h-4 text-zinc-600 dark:text-zinc-300 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mr-1">{UI.export}</span>
            {['PNG', 'SVG', 'PDF'].map((format) => (
              <button key={format} type="button" onClick={run(() => onExportCanvas(format))} title={`Export this page as ${format}`} aria-label={`Export as ${format}`} className={chip(false)}>
                {format}
              </button>
            ))}
          </div>
        )}
        {onOpenMusic && (
          <button type="button" onClick={run(onOpenMusic)} aria-label={UI.focusMusic} className={menuRow}>
            <LuMusic className="w-4 h-4" aria-hidden="true" />
            {UI.focusMusic}
          </button>
        )}
        <button type="button" onClick={run(() => setShowPreferences(true))} aria-label={UI.preferences} className={menuRow}>
          <FiSettings className="w-4 h-4" aria-hidden="true" />
          {UI.preferences}
        </button>
      </div>
    </div>
  );

  // Zoom: out, the percentage (a menu: 100%, Fit), in
  const zoomRows = (
    <div className="flex flex-col gap-1 min-w-[200px]">
      <button type="button" onClick={run(onResetZoom)} title="Reset Zoom to 100% (Ctrl 0)" aria-label="Reset Zoom to 100%" className={menuRow}>
        Zoom to 100%
      </button>
      {onFitToContent && (
        <button type="button" onClick={run(onFitToContent)} title="Fit to content (Shift+1)" aria-label={UI.fit} className={menuRow}>
          <FiMaximize className="w-4 h-4" aria-hidden="true" />
          {UI.fit}
        </button>
      )}
      <button type="button" onClick={onZoomIn} title="Zoom In (Ctrl +)" aria-label="Zoom In" className={menuRow}>
        <FiZoomIn className="w-4 h-4" aria-hidden="true" />
        Zoom in
      </button>
      <button type="button" onClick={onZoomOut} title="Zoom Out (Ctrl -)" aria-label="Zoom Out" className={menuRow}>
        <FiZoomOut className="w-4 h-4" aria-hidden="true" />
        Zoom out
      </button>
    </div>
  );

  // The tool buttons
  const tool = (id, label, shortcut, icon, activeClass, title) => (
    <button
      type="button"
      onClick={() => setActiveTool(id)}
      title={title || `${label} - key ${shortcut}`}
      aria-label={label}
      aria-pressed={activeTool === id}
      className={`${toolButton} ${activeTool === id ? `${activeClass} text-white font-bold` : idle}`}
    >
      {icon}
    </button>
  );

  // The lasso shows the pen options too: its toolbar recolours a selection with the pen colour
  const hasOptions = activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser' || activeTool === 'lasso';
  const optionsColour = activeTool === 'highlighter' ? highlighterColor : strokeColor;
  const anyPanel = panel || showShapes || showSymbols || showEquation || showScreenshot || symbolDialog || latexDialog;

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
        bottom: 'max(0.75rem, env(safe-area-inset-bottom, 12px))',
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

      {/* Tablet: the Insert group, folded into one menu */}
      {panel === 'insert' && (
        <Popover title={UI.insert} isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={insertButtonRef} showHeader={false} role="menu" className="w-max">
          {insertTiles(true)}
        </Popover>
      )}

      {/* The active tool's options: colour, pen type, width (pen, highlighter) or eraser options */}
      {panel === 'options' && hasOptions && (
        <Popover
          title={activeTool === 'eraser' ? 'Eraser options' : activeTool === 'highlighter' ? 'Highlighter options' : 'Pen options'}
          isMobile={isMobile}
          onClose={() => setPanel(null)}
          anchorRef={optionsButtonRef}
        >
          <ToolOptions {...props} />
        </Popover>
      )}

      {panel === 'blocks' && (
        <Popover title={UI.blocks} isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={blocksButtonRef} className="min-w-[220px]">
          {blockRows}
        </Popover>
      )}

      {panel === 'page' && (
        <Popover title={UI.pageMenu} isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={pageButtonRef} placement="absolute bottom-full right-0 mb-2">
          {pageRows(moveInPage)}
        </Popover>
      )}

      {panel === 'zoom' && (
        <Popover title="Zoom" isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={zoomButtonRef} showHeader={false} placement="absolute bottom-full right-0 mb-2" role="menu">
          {zoomRows}
        </Popover>
      )}

      {/* Phone: everything that is not on the bar, in headed sections */}
      {panel === 'more' && (
        <Popover title={UI.more} isMobile={isMobile} onClose={() => setPanel(null)} anchorRef={moreButtonRef} placement="absolute bottom-full right-0 mb-2">
          <div className="flex flex-col gap-4">
            <section>
              <div className={sectionTitle}>{UI.insert}</div>
              {insertTiles(false)}
            </section>
            <section>
              <div className={sectionTitle}>{UI.blocks}</div>
              {blockRows}
            </section>
            <section>
              <div className={sectionTitle}>{UI.pageMenu}</div>
              <div className="flex flex-col gap-1 mb-2">
                {onRedo && (
                  <button type="button" onClick={run(onRedo)} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" aria-label={UI.redo} className={`${menuRow} disabled:opacity-40`}>
                    <FiCornerUpRight className="w-4 h-4" aria-hidden="true" />
                    {UI.redo}
                  </button>
                )}
              </div>
              {pageRows(true)}
            </section>
            <section>
              <div className={sectionTitle}>View</div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={onZoomOut} title="Zoom Out (Ctrl -)" aria-label="Zoom Out" className={`${toolButton} bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200`}>
                  <FiZoomOut className="w-4 h-4" />
                </button>
                <button type="button" onClick={onResetZoom} title="Reset Zoom to 100% (Ctrl 0)" aria-label="Reset Zoom to 100%" className="h-11 min-h-[44px] px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button type="button" onClick={onZoomIn} title="Zoom In (Ctrl +)" aria-label="Zoom In" className={`${toolButton} bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200`}>
                  <FiZoomIn className="w-4 h-4" />
                </button>
                {onFitToContent && (
                  <button type="button" onClick={run(onFitToContent)} title="Fit to content" aria-label={UI.fit} className="h-11 min-h-[44px] px-3 flex items-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    <FiMaximize className="w-4 h-4" aria-hidden="true" />
                    Fit
                  </button>
                )}
              </div>
            </section>
          </div>
        </Popover>
      )}

      {showPreferences && (
        <PreferencesDialog
          isMobile={isMobile}
          onClose={() => setShowPreferences(false)}
          fingerDraws={fingerDraws}
          setFingerDraws={setFingerDraws}
          readMode={readMode}
          setReadMode={setReadMode}
          notesMode={notesMode}
        />
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
        className="flex items-center [&>*]:shrink-0 gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl max-w-full overflow-hidden"
      >
        {onUndo && (
          <button type="button" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z, or tap with two fingers)" aria-label={UI.undo} className={`${toolButton} ${idle} disabled:opacity-30 disabled:hover:bg-transparent`}>
            <FiCornerUpLeft className="w-4 h-4" />
          </button>
        )}
        {!isMobile && onRedo && (
          <button type="button" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z, or tap with three fingers)" aria-label={UI.redo} className={`${toolButton} ${idle} disabled:opacity-30 disabled:hover:bg-transparent`}>
            <FiCornerUpRight className="w-4 h-4" />
          </button>
        )}
        {!isMobile && divider}

        {tool('pen', UI.pen, 'P', <FiEdit2 className="w-4 h-4" />, 'bg-blue-500 shadow-md shadow-blue-500/30', 'Pen (Stylus / Mouse Ink) - key P')}
        {tool('highlighter', UI.highlighter, 'H', <FaHighlighter className="w-4 h-4" />, 'bg-yellow-500 shadow-md shadow-yellow-500/30')}
        {tool('eraser', UI.eraser, 'E', <FaEraser className="w-4 h-4" />, 'bg-rose-500 shadow-md shadow-rose-500/30', 'Eraser (Whole Strokes or Part of a Stroke) - key E')}
        {tool('lasso', 'Lasso Select', 'L', <LuLassoSelect className="w-4 h-4" />, 'bg-purple-500 shadow-md shadow-purple-500/30', 'Lasso Select (select ink to move it, or to read it) - key L')}
        {!isMobile && !moveInPage && tool('pan', UI.movePage, 'M', <FiMove className="w-4 h-4" />, 'bg-zinc-800 dark:bg-zinc-200 dark:!text-black shadow-md', 'Move page - key M')}

        {/* Phone: a recording in progress stays visible and can be stopped from the bar */}
        {isMobile && isRecording && onToggleRecordAudio && (
          <button type="button" onClick={onToggleRecordAudio} title="Stop recording" aria-label={UI.stopRecording} className={`${toolButton} bg-rose-500 text-white animate-pulse`}>
            <FiMic className="w-4 h-4" />
          </button>
        )}

        {/* Tablet: one Insert button for the Insert group */}
        {isTablet && (
          <>
            {divider}
            <button
              ref={insertButtonRef}
              type="button"
              onClick={() => togglePanel('insert')}
              title="Insert (Picture, Screenshot, Shapes, Symbol, Equation)"
              aria-label={UI.insert}
              aria-expanded={panel === 'insert'}
              className={`${toolButton} relative ${
                activeTool === 'shape' || panel === 'insert' || showShapes || showSymbols || symbolDialog || showEquation || showScreenshot ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : idle
              }`}
            >
              {armed ? <ShapeIcon item={armed} className="w-5 h-5" /> : <LuInsert className="w-4 h-4" />}
            </button>
          </>
        )}

        {/* Laptop: the Insert group, in WPS order: Picture, Screenshot, Shapes, Symbol, Equation */}
        {isDesktop && (
          <>
            {divider}
            <div className="flex items-center gap-1" role="group" aria-label={UI.insert}>
              {onInsertImage && (
                <button type="button" onClick={openPicture} title="Picture: insert an image or photo" aria-label="Insert Picture" className={`${toolButton} ${idle}`}>
                  <FiImage className="w-4 h-4" />
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
          <button
            ref={blocksButtonRef}
            type="button"
            onClick={() => togglePanel('blocks')}
            title="Blocks: Graph, Text, Voice memo"
            aria-label={UI.blocks}
            aria-expanded={panel === 'blocks'}
            className={`h-11 min-h-[44px] px-2.5 flex items-center gap-1.5 rounded-xl text-xs font-semibold ${panel === 'blocks' || isRecording ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : idle} ${isRecording ? 'ring-2 ring-rose-500' : ''}`}
          >
            <LuLayoutGrid className="w-4 h-4" aria-hidden="true" />
            <span>{UI.blocks}</span>
            {isRecording && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" aria-label="Recording" />}
          </button>
        )}

        {divider}

        {/* The active tool's options (pen, highlighter, eraser) */}
        {hasOptions && (
          <button
            ref={optionsButtonRef}
            type="button"
            onClick={() => togglePanel('options')}
            title={`Stroke & Canvas Settings: ${activeTool === 'eraser' ? 'eraser' : activeTool === 'highlighter' ? 'highlighter' : 'pen'} options`}
            aria-label={activeTool === 'eraser' ? 'Eraser options' : activeTool === 'highlighter' ? 'Highlighter options' : 'Pen options'}
            aria-expanded={panel === 'options'}
            className={`${toolButton} gap-1.5 ${panel === 'options' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : idle}`}
          >
            {activeTool === 'eraser' ? (
              <span className="w-4 h-4 rounded-full border-2 border-rose-500" aria-hidden="true" />
            ) : (
              <span className="w-5 h-5 rounded-full border border-black/15 dark:border-white/20" style={{ backgroundColor: optionsColour }} aria-hidden="true" />
            )}
          </button>
        )}

        {/* Zoom (laptop, tablet): out, the percentage (menu: 100%, Fit), in; folded: the percentage only */}
        {!isMobile && (
          <>
            {!foldZoom && (
              <button type="button" onClick={onZoomOut} title="Zoom Out (Ctrl -)" aria-label="Zoom Out" className={`${toolButton} ${idle}`}>
                <FiZoomOut className="w-4 h-4" />
              </button>
            )}
            <button
              ref={zoomButtonRef}
              type="button"
              onClick={() => togglePanel('zoom')}
              title="Zoom (Ctrl + / Ctrl - / Ctrl 0, Shift+1 to fit)"
              aria-label="Zoom"
              aria-expanded={panel === 'zoom'}
              className={`h-11 min-h-[44px] px-2.5 min-w-[44px] flex items-center justify-center text-xs font-mono font-semibold rounded-xl ${idle}`}
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            {!foldZoom && (
              <button type="button" onClick={onZoomIn} title="Zoom In (Ctrl +)" aria-label="Zoom In" className={`${toolButton} ${idle}`}>
                <FiZoomIn className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Page menu (laptop, tablet) or More (phone) */}
        {!isMobile ? (
          <button
            ref={pageButtonRef}
            type="button"
            onClick={() => togglePanel('page')}
            title="Page: Writing mode, background, Send to Notes, Export, Focus music, Preferences"
            aria-label={UI.pageMenu}
            aria-expanded={panel === 'page'}
            className={`h-11 min-h-[44px] px-2.5 flex items-center gap-1.5 rounded-xl text-xs font-semibold ${panel === 'page' || notesMode ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : idle}`}
          >
            <FiMoreHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>{UI.pageMenu}</span>
          </button>
        ) : (
          <button
            ref={moreButtonRef}
            type="button"
            onClick={() => togglePanel('more')}
            title="More Tools"
            aria-label={UI.more}
            aria-expanded={panel === 'more'}
            className={`${toolButton} ${panel === 'more' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : idle}`}
          >
            <FiMoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
