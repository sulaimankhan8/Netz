'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  FiEdit2,
  FiMove,
  FiZoomIn,
  FiZoomOut,
  FiSliders,
  FiCheck,
  FiPlus,
  FiBarChart2,
  FiFileText,
  FiDownload,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiBookOpen,
  FiMic,
  FiImage,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiMoreHorizontal,
  FiX,
} from 'react-icons/fi';
import { FaHighlighter, FaEraser } from 'react-icons/fa6';
import { LuLassoSelect, LuPencil, LuShapes, LuScissors, LuPlusSquare as LuInsert } from 'react-icons/lu';
import ShapeGallery, { ShapeIcon } from './shapes/ShapeGallery';
import SymbolMenu from './symbols/SymbolMenu';
import SymbolDialog from './symbols/SymbolDialog';
import NumberDialog from './symbols/NumberDialog';
import EquationMenu from './equation/EquationMenu';
import InsertLatexDialog from './equation/InsertLatexDialog';
import ScreenshotMenu from './screenshot/ScreenshotMenu';

// Each preset sets width and opacity together, so they look different on the page.
const PEN_PRESETS = [
  { label: 'Ballpoint', width: 2, opacity: 1.0 },
  { label: 'Fountain', width: 5, opacity: 1.0 },
  { label: 'Pencil', width: 3, opacity: 0.7 },
  { label: 'Marker', width: 10, opacity: 0.85 },
];

const COLOR_PALETTE = [
  '#18181B', // Ink Black
  '#3B82F6', // Netz Electric Blue
  '#10B981', // Emerald Green
  '#8B5CF6', // Vivid Purple
  '#F43F5E', // Rose Pink
  '#F59E0B', // Warm Amber
  '#06B6D4', // Cyan
  '#64748B', // Slate
  '#FFFFFF', // White / Dark Contrast
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

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Bold', value: 8 },
];

export default function PlaygroundDock({
  activeTool,
  setActiveTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  strokeOpacity = 1,
  setStrokeOpacity,
  gridStyle,
  setGridStyle,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onAddBlock,
  onOpenSyncModal,
  onExportCanvas,
  showLiveOcr = false,
  setShowLiveOcr,
  ocrMode = 'selection',
  setOcrMode,
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
  eraserMode = 'stroke',
  setEraserMode,
  eraserSize = 16,
  setEraserSize,
  armedShape = null,
  onPickShape,
  onFreehandShape,
  onCaptureTextTarget,
  onInsertSymbol,
  onSymbolsClosed,
  onInsertEquation,
  screenshot = null,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false); // tablet: the Insert group folded into one button
  const [showSymbols, setShowSymbols] = useState(false);
  const showSymbolsRef = useRef(false);
  showSymbolsRef.current = showSymbols;
  const [symbolDialog, setSymbolDialog] = useState(null); // 'more' | 'number' | null
  const [showZoomMenu, setShowZoomMenu] = useState(false); // a folded dock: the zoom buttons in one menu
  const [showEquation, setShowEquation] = useState(false);
  const [latexDialog, setLatexDialog] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const symbolInsertedRef = useRef(false);
  const [windowWidth, setWindowWidth] = useState(1280);

  const armed = activeTool === 'shape' ? armedShape : null;

  const fileInputRef = useRef(null);
  const moreMenuRef = useRef(null);
  const dockRef = useRef(null);

  useEffect(() => {
    if (!showShapes && !showInsertMenu && !showSymbols && !showZoomMenu && !showEquation && !showScreenshot) return;
    // The press only closes the menu: it does not also draw on the page
    const handleOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        e.stopPropagation();
        setShowShapes(false);
        setShowInsertMenu(false);
        setShowZoomMenu(false);
        setShowEquation(false);
        setShowScreenshot(false);
        if (showSymbols) {
          setShowSymbols(false);
          endSymbolsRef.current();
        }
      }
    };
    window.addEventListener('pointerdown', handleOutside, true);
    return () => window.removeEventListener('pointerdown', handleOutside, true);
  }, [showShapes, showInsertMenu, showSymbols, showZoomMenu, showEquation, showScreenshot]);

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
  //   1: no text labels   2: the zoom buttons become one   3: less used tools move to More
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
  const toolsInMore = compact >= 3;

  // Close menus on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSettings(false);
        setShowExportMenu(false);
        setShowMoreMenu(false);
        setShowShapes(false);
        setShowInsertMenu(false);
        setShowEquation(false);
        setShowScreenshot(false);
        if (showSymbolsRef.current) {
          setShowSymbols(false);
          endSymbolsRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // A Symbol session (menu, then perhaps More Symbols or Number) ends when they all close
  const endSymbols = () => {
    onSymbolsClosed?.(symbolInsertedRef.current);
    symbolInsertedRef.current = false;
  };
  const endSymbolsRef = useRef(endSymbols);
  endSymbolsRef.current = endSymbols;

  const closePanels = () => {
    setShowSettings(false);
    setShowExportMenu(false);
    setShowMoreMenu(false);
    setShowShapes(false);
    setShowInsertMenu(false);
    setShowZoomMenu(false);
    setShowEquation(false);
    setShowScreenshot(false);
    if (showSymbols) {
      setShowSymbols(false);
      endSymbols();
    }
  };
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
  // Insert > Equation, as in WPS: on a laptop the button inserts a new equation and its arrow opens
  // the menu; on a touch screen (two targets side by side would be too small) the button opens the menu
  const equationButton = (
    <div className={`flex items-center rounded-xl ${showEquation ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-zinc-600 dark:text-zinc-400'}`}>
      <button
        onClick={coarsePointer ? openEquation : newEquation}
        title={coarsePointer ? 'Equation (New Equation, LaTeX, Common Equations)' : 'Equation: Insert New Equation'}
        aria-label="Equation"
        aria-expanded={coarsePointer ? showEquation : undefined}
        className={`h-11 min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 rounded-xl transition-all ${showEquation ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
      >
        <span className="text-base leading-none font-serif italic" aria-hidden="true">π</span>
        {isDesktop && showLabels && <span className="text-[11px] font-semibold not-italic">Equation</span>}
      </button>
      {!coarsePointer && (
        <button
          onClick={openEquation}
          title="Equation menu: Insert LaTeX, Common Equations"
          aria-label="Equation menu"
          aria-expanded={showEquation}
          className={`h-11 min-h-[44px] w-5 flex items-center justify-center rounded-xl text-[10px] ${showEquation ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          ▾
        </button>
      )}
    </div>
  );

  // Insert > Screenshot, as in WPS: on a laptop the button takes a screenshot the ticked way
  // (Screenshot, or Hide Current Window During Screenshot) and its arrow opens the menu. On a
  // touch screen, or where the browser cannot capture the screen, the button opens the menu.
  const openScreenshot = () => {
    const open = !showScreenshot;
    closePanels();
    setShowScreenshot(open);
  };
  const screenshotDirect = Boolean(screenshot && screenshot.canCapture && !coarsePointer);
  const hideMode = Boolean(screenshot && screenshot.mode === 'hide');
  const takeScreenshot = () => {
    closePanels();
    screenshot.capture('rect', { hide: hideMode });
  };
  const screenshotButton = screenshot && (
    <div className={`flex items-center rounded-xl ${showScreenshot ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-zinc-600 dark:text-zinc-400'}`}>
      <button
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
        {isDesktop && showLabels && <span className="text-[11px] font-semibold">Screenshot</span>}
      </button>
      {screenshotDirect && (
        <button
          onClick={openScreenshot}
          title="Screenshot menu: oval, rounded, polygon, Hide Current Window, Screen Grab Main Window"
          aria-label="Screenshot menu"
          aria-expanded={showScreenshot}
          className={`h-11 min-h-[44px] w-5 flex items-center justify-center rounded-xl text-[10px] ${showScreenshot ? '' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          ▾
        </button>
      )}
    </div>
  );

  // Insert > Symbol: the field that had the cursor gets the symbol
  const symbolButton = (
    <button
      onPointerDown={captureTarget}
      onClick={openSymbols}
      title="Symbol (Insert a symbol: ©, ℃, ≤, α, ①...)"
      aria-label="Symbol"
      aria-expanded={showSymbols}
      className={`h-11 min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 rounded-xl transition-all ${
        showSymbols || symbolDialog ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      <span className="text-base leading-none font-semibold" aria-hidden="true">Ω</span>
      {isDesktop && showLabels && <span className="text-[11px] font-semibold">Symbol</span>}
    </button>
  );
  const openShapes = () => {
    const open = !showShapes;
    closePanels();
    setShowShapes(open);
  };
  const openPicture = () => {
    closePanels();
    fileInputRef.current?.click();
  };

  // Insert > Shapes: the button shows the armed shape while one is picked, as WPS does
  const shapesButton = (
    <button
      onClick={openShapes}
      title={armed ? `Shapes: ${armed.name} (drag on the page to draw it)` : 'Shapes (Insert a rectangle, arrow, flowchart symbol, callout...)'}
      aria-label="Shapes"
      aria-expanded={showShapes}
      className={`h-11 min-w-[44px] min-h-[44px] px-2 flex items-center justify-center gap-1 rounded-xl transition-all relative ${
        activeTool === 'shape' || showShapes
          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      {armed ? <ShapeIcon item={armed} className="w-5 h-5" /> : <LuShapes className="w-4 h-4" />}
      {isDesktop && showLabels && <span className="text-[11px] font-semibold">Shapes</span>}
    </button>
  );

  return (
    <div
      ref={dockRef}
      // Centred with auto margins, not a transform: a transform would pin the phone bottom sheets
      // inside the dock to the dock instead of the screen
      // An open menu sits above everything on the page: blocks being edited (z-50), the music player (z-50)
      className={`fixed right-0 mx-auto w-fit ${
        showSettings || showMoreMenu || showShapes || showExportMenu || showSymbols || showInsertMenu || showZoomMenu || showEquation || showScreenshot ? 'z-[60]' : 'z-40'
      } flex flex-col items-center gap-2 pointer-events-auto select-none`}
      style={{
        left: sidebarRight,
        maxWidth: `calc(100vw - ${sidebarRight + 16}px)`,
        // Pop-ups above the dock are centred on it, so this width keeps them clear of the sidebar too
        '--dock-panel-max': `calc(100vw - ${sidebarRight + 16}px)`,
        bottom: 'max(0.75rem, env(safe-area-inset-bottom, 12px))',
      }}
    >
      {/* 1. Stroke, Color & Canvas Settings Panel */}
      {showSettings && (
        <div
          className={`${
            isMobile
              ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl p-5 border-t'
              : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 max-w-[var(--dock-panel-max,95vw)] rounded-2xl p-3 border'
          } bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl z-50 overflow-y-auto flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3.5 sm:gap-4 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150`}
        >
          {isMobile && (
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Stroke & Canvas Settings
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close Settings"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap sm:pr-3 sm:border-r border-zinc-200 dark:border-zinc-800">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                title={`Color ${color}`}
                aria-label={`Color ${color}`}
                className={`w-7 h-7 sm:w-6 sm:h-6 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 rounded-full transition-transform flex items-center justify-center border border-black/10 dark:border-white/10 ${
                  strokeColor === color
                    ? 'scale-110 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900'
                    : 'hover:scale-105 active:scale-95'
                }`}
                style={{ backgroundColor: color }}
              >
                {strokeColor === color && (
                  <FiCheck className={`w-3.5 h-3.5 ${color === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            ))}

            {/* Custom color picker */}
            <label
              title="Choose any colour"
              aria-label="Choose any colour"
              className={`relative w-7 h-7 sm:w-6 sm:h-6 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 rounded-full overflow-hidden cursor-pointer border border-black/10 dark:border-white/10 transition-transform flex items-center justify-center ${
                COLOR_PALETTE.includes(strokeColor)
                  ? 'hover:scale-105'
                  : 'scale-110 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900'
              }`}
              style={{
                background: COLOR_PALETTE.includes(strokeColor)
                  ? 'conic-gradient(#F43F5E, #F59E0B, #10B981, #06B6D4, #3B82F6, #8B5CF6, #F43F5E)'
                  : strokeColor,
              }}
            >
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(strokeColor) ? strokeColor : '#3B82F6'}
                onChange={(e) => setStrokeColor(e.target.value.toUpperCase())}
                aria-label="Choose any pen colour"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1 sm:pl-1">
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w.value}
                onClick={() => {
                  setStrokeWidth(w.value);
                  if (setStrokeOpacity) setStrokeOpacity(1);
                }}
                className={`px-3 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-xs rounded-xl font-medium transition-colors flex items-center justify-center ${
                  strokeWidth === w.value
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Grid Background Selector */}
          <div className="flex items-center gap-1 sm:pl-3 sm:border-l border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-semibold">Grid:</span>
            {['dots', 'grid', 'lines', 'none'].map((style) => (
              <button
                key={style}
                onClick={() => setGridStyle(style)}
                className={`px-2.5 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 capitalize rounded-xl transition-colors flex items-center justify-center ${
                  gridStyle === style
                    ? 'bg-zinc-200 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Pen Style Presets */}
          <div className="flex items-center gap-1 sm:pl-3 sm:border-l border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-400 dark:text-zinc-500 mr-1">
              <LuPencil className="w-3.5 h-3.5 inline" />
            </span>
            {PEN_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setStrokeWidth(preset.width);
                  if (setStrokeOpacity) setStrokeOpacity(preset.opacity);
                }}
                title={`${preset.label}: ${preset.width} px${
                  preset.opacity < 1 ? `, ${Math.round(preset.opacity * 100)}% opaque` : ''
                }`}
                className={`px-2.5 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl transition-colors flex items-center justify-center ${
                  strokeWidth === preset.width && strokeOpacity === preset.opacity
                    ? 'bg-zinc-200 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Touch: what one finger does */}
          {setFingerDraws && (
            <div className="flex items-center gap-1 sm:pl-3 sm:border-l border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-semibold">Finger:</span>
              <button
                onClick={() => setFingerDraws(true)}
                title="One finger draws, like the mouse or a pen. Two fingers move and zoom the page."
                className={`px-2.5 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl transition-colors flex items-center justify-center ${
                  fingerDraws
                    ? 'bg-zinc-200 dark:bg-zinc-800 font-semibold font-bold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Draws
              </button>
              <button
                onClick={() => setFingerDraws(false)}
                title="One finger moves the page. Draw with a pen or the mouse."
                className={`px-2.5 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl transition-colors flex items-center justify-center ${
                  !fingerDraws
                    ? 'bg-zinc-200 dark:bg-zinc-800 font-semibold font-bold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Moves page
              </button>
            </div>
          )}

          {/* OCR Mode Selector */}
          {setOcrMode && (
            <div className="flex items-center gap-1 sm:pl-3 sm:border-l border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-semibold">OCR:</span>
              <button
                onClick={() => setOcrMode('selection')}
                title="Convert ink only when selecting drawn areas with Lasso tool"
                className={`px-2.5 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl transition-colors font-medium flex items-center justify-center ${
                  ocrMode === 'selection'
                    ? 'bg-purple-500 text-white font-semibold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                Selection
              </button>
              <button
                onClick={() => setOcrMode('live')}
                title="Auto-convert every word continuously while writing"
                className={`px-2.5 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl transition-colors font-medium flex items-center justify-center ${
                  ocrMode === 'live'
                    ? 'bg-blue-500 text-white font-semibold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                Live Auto
              </button>
            </div>
          )}

          {/* Live OCR Tags Opt-In */}
          {setShowLiveOcr && ocrMode === 'live' && (
            <div className="flex items-center gap-1 sm:pl-3 sm:border-l border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setShowLiveOcr(!showLiveOcr)}
                title="Toggle Live Handwriting Recognition Preview Tags"
                className={`flex items-center gap-1 px-3 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl transition-colors font-medium justify-center ${
                  showLiveOcr
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {showLiveOcr ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                <span>Live OCR Tags</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Eraser options: shown while eraser is active */}
      {activeTool === 'eraser' && setEraserMode && (
        <div
          className={`${
            isMobile
              ? 'fixed bottom-16 left-3 right-3 sm:static'
              : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2'
          } flex items-center justify-between sm:justify-start gap-2.5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl animate-in fade-in slide-in-from-bottom-2 text-xs z-50`}
        >
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-semibold">Erase:</span>
            {ERASER_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setEraserMode(mode.value)}
                title={mode.title}
                className={`px-3 py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl font-medium transition-colors flex items-center justify-center ${
                  eraserMode === mode.value
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-semibold">Size:</span>
            {ERASER_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setEraserSize(size.value)}
                title={`${size.label} eraser`}
                aria-label={`${size.label} eraser`}
                className={`w-9 h-9 sm:w-8 sm:h-8 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl flex items-center justify-center transition-colors ${
                  eraserSize === size.value
                    ? 'bg-zinc-200 dark:bg-zinc-800'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span
                  className="rounded-full border border-rose-500 bg-rose-500/20"
                  style={{ width: size.dot, height: size.dot }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2b. Insert > Shapes gallery (WPS / Word categories) */}
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

      {/* 2b'. Insert > Symbol menu, and its More Symbols and Number dialogs */}
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

      {/* 2b''. Insert > Equation menu, and the Insert LaTeX dialog */}
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

      {/* 2b'''. Insert > Screenshot menu */}
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

      {/* 2c. Tablet: the Insert group, folded into one menu */}
      {showInsertMenu && (
        <div
          role="menu"
          aria-label="Insert"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[var(--dock-panel-max,95vw)] rounded-2xl p-2 border bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl z-50 flex items-center gap-1.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {onInsertImage && (
            <button
              role="menuitem"
              onClick={openPicture}
              title="Picture: insert an image or photo"
              className="flex items-center gap-2 px-3 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              <FiImage className="w-4 h-4" />
              <span>Picture</span>
            </button>
          )}
          {screenshot && (
            <button
              role="menuitem"
              onClick={openScreenshot}
              title="Screenshot: capture and crop to a rectangle, oval, rounded rectangle or polygon"
              className="flex items-center gap-2 px-3 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              <LuScissors className="w-4 h-4" />
              <span>Screenshot</span>
            </button>
          )}
          <button
            role="menuitem"
            onClick={openShapes}
            title="Shapes: rectangles, arrows, flowchart symbols, callouts..."
            className="flex items-center gap-2 px-3 min-h-[44px] rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
          >
            <LuShapes className="w-4 h-4" />
            <span>Shapes</span>
          </button>
          <button
            role="menuitem"
            onPointerDown={captureTarget}
            onClick={openSymbols}
            title="Symbol: ©, ℃, ≤, α, ①..."
            className="flex items-center gap-2 px-3 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
          >
            <span className="text-base leading-none" aria-hidden="true">Ω</span>
            <span>Symbol</span>
          </button>
          <button
            role="menuitem"
            onClick={openEquation}
            title="Equation: New Equation, LaTeX, Common Equations"
            className="flex items-center gap-2 px-3 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
          >
            <span className="text-base leading-none font-serif italic" aria-hidden="true">π</span>
            <span>Equation</span>
          </button>
        </div>
      )}

      {/* 3. Export Format Popover Menu */}
      {showExportMenu && (
        <div
          className={`${
            isMobile
              ? 'fixed bottom-16 left-4 right-4'
              : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2'
          } flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl animate-in fade-in slide-in-from-bottom-2 text-xs z-50`}
        >
          <button
            onClick={() => {
              setShowExportMenu(false);
              onExportCanvas('PNG');
            }}
            className="px-3.5 py-2.5 min-h-[44px] font-semibold rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-left sm:text-center transition-colors"
          >
            Export PNG Image
          </button>
          <button
            onClick={() => {
              setShowExportMenu(false);
              onExportCanvas('SVG');
            }}
            className="px-3.5 py-2.5 min-h-[44px] font-semibold rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-left sm:text-center transition-colors"
          >
            Export SVG Vector
          </button>
          <button
            onClick={() => {
              setShowExportMenu(false);
              onExportCanvas('PDF');
            }}
            className="px-3.5 py-2.5 min-h-[44px] font-semibold rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-left sm:text-center transition-colors"
          >
            Export PDF Document
          </button>
        </div>
      )}

      {/* 4. More Tools Menu (Bottom Sheet on Mobile, Popover on Tablet) */}
      {showMoreMenu && (
        <div
          ref={moreMenuRef}
          className={`${
            isMobile
              ? 'fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl p-5 border-t'
              : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[var(--dock-panel-max,95vw)] rounded-2xl p-4 border'
          } bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150`}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              More Whiteboard Tools
            </span>
            <button
              onClick={() => setShowMoreMenu(false)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close More Tools"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Insert (WPS order): Picture, Screenshot, Shapes, Symbol, Equation */}
          {isMobile && (
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Insert</div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {onInsertImage && (
                  <button
                    onClick={openPicture}
                    title="Picture: insert an image or photo"
                    aria-label="Insert Picture"
                    className="flex-1 flex flex-col items-center justify-center gap-1 p-2 min-h-[56px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
                  >
                    <FiImage className="w-4 h-4" />
                    <span>Picture</span>
                  </button>
                )}
                {screenshot && (
                  <button
                    onClick={openScreenshot}
                    title="Screenshot: the Playground view, a photo or a pasted picture, cropped to a shape"
                    aria-label="Insert Screenshot"
                    className="flex-1 flex flex-col items-center justify-center gap-1 p-2 min-h-[56px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
                  >
                    <LuScissors className="w-4 h-4" />
                    <span>Screenshot</span>
                  </button>
                )}
                <button
                  onClick={openShapes}
                  title="Shapes: rectangles, arrows, flowchart symbols, callouts..."
                  aria-label="Insert Shapes"
                  className="flex-1 flex flex-col items-center justify-center gap-1 p-2 min-h-[56px] rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                >
                  <LuShapes className="w-4 h-4" />
                  <span>Shapes</span>
                </button>
                <button
                  onPointerDown={captureTarget}
                  onClick={openSymbols}
                  title="Symbol: ©, ℃, ≤, α, ①..."
                  aria-label="Insert Symbol"
                  className="flex-1 flex flex-col items-center justify-center gap-1 p-2 min-h-[56px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
                >
                  <span className="text-base leading-none" aria-hidden="true">Ω</span>
                  <span>Symbol</span>
                </button>
                <button
                  onClick={openEquation}
                  title="Equation: New Equation, LaTeX, Common Equations"
                  aria-label="Insert Equation"
                  className="flex-1 flex flex-col items-center justify-center gap-1 p-2 min-h-[56px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
                >
                  <span className="text-base leading-none font-serif italic" aria-hidden="true">π</span>
                  <span>Equation</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-semibold">
            {/* Mobile-only secondary primary tools (Move and Notes also on a folded tablet dock) */}
            {(isMobile || (isTablet && toolsInMore)) && (
              <>
                {isMobile && <button
                  onClick={() => {
                    onRedo?.();
                    setShowMoreMenu(false);
                  }}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Shift+Z)"
                  aria-label="Redo"
                  className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 disabled:opacity-40"
                >
                  <FiCornerUpRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span>Redo</span>
                </button>}

                <button
                  onClick={() => {
                    setActiveTool('pan');
                    setShowMoreMenu(false);
                  }}
                  title="Move the Page - key M"
                  className={`flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl ${
                    activeTool === 'pan'
                      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <FiMove className="w-4 h-4" />
                  <span>Move Canvas</span>
                </button>

                {setNotesMode && (
                  <button
                    onClick={() => {
                      setNotesMode(!notesMode);
                      setShowMoreMenu(false);
                    }}
                    title={notesMode ? 'Switch to Whiteboard Mode' : 'Switch to Notes Mode'}
                    className={`flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl ${
                      notesMode
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <FiBookOpen className="w-4 h-4" />
                    <span>{notesMode ? 'Whiteboard' : 'Notes Mode'}</span>
                  </button>
                )}
              </>
            )}

            {/* Smart Blocks */}
            {onAddBlock && (
              <>
                <button
                  onClick={() => {
                    onAddBlock('graph');
                    setShowMoreMenu(false);
                  }}
                  title="Add Graph Block"
                  aria-label="Add Graph Block"
                  className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                >
                  <FiBarChart2 className="w-4 h-4" />
                  <span>Graph Block</span>
                </button>

                <button
                  onClick={() => {
                    onAddBlock('theory');
                    setShowMoreMenu(false);
                  }}
                  title="Add Theory Block"
                  aria-label="Add Theory Block"
                  className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
                >
                  <FiFileText className="w-4 h-4" />
                  <span>Theory Block</span>
                </button>
              </>
            )}

            {/* Audio Voice Memo */}
            {onToggleRecordAudio && (
              <button
                onClick={() => {
                  onToggleRecordAudio();
                  setShowMoreMenu(false);
                }}
                title={isRecording ? 'Stop Voice Recording' : 'Record Voice Note'}
                className={`flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <FiMic className="w-4 h-4" />
                <span>{isRecording ? 'Stop Recording' : 'Voice Memo'}</span>
              </button>
            )}

            {/* Workspace Sync */}
            {onOpenSyncModal && (
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenSyncModal();
                }}
                title="Sync Whiteboard to Notes Workspace"
                className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
              >
                <FiLayers className="w-4 h-4" />
                <span>Sync to Notes</span>
              </button>
            )}

            {/* Export Canvas */}
            {onExportCanvas && (
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowExportMenu(true);
                }}
                title="Export Canvas (PNG / SVG / PDF)"
                className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
              >
                <FiDownload className="w-4 h-4" />
                <span>Export Page</span>
              </button>
            )}
          </div>

          {/* Zoom & Finger preference in bottom sheet for mobile */}
          {isMobile && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 text-xs font-semibold">Canvas Zoom:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onZoomOut}
                  title="Zoom Out (Ctrl -)"
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  <FiZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={onResetZoom}
                  title="Reset Zoom to 100% (Ctrl 0)"
                  className="px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center font-mono font-bold text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={onZoomIn}
                  title="Zoom In (Ctrl +)"
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  <FiZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
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
        }}
      />

      {/* 5. Main Dock Toolbar */}
      {/* CRITICAL: Must have button[title^="Pen"] as a direct child to satisfy screens.mjs audit */}
      {/* Items never shrink: a dock that does not fit overflows, which is what makes it fold */}
      <div ref={barRef} className="flex items-center [&>*]:shrink-0 gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl max-w-full">
        {/* Undo */}
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <FiCornerUpLeft className="w-4 h-4" />
          </button>
        )}

        {/* Redo: Visible on tablet & desktop */}
        {!isMobile && onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <FiCornerUpRight className="w-4 h-4" />
          </button>
        )}

        {!isMobile && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />}

        {/* Pen (Stylus / Mouse Ink) */}
        <button
          onClick={() => setActiveTool('pen')}
          title="Pen (Stylus / Mouse Ink) - key P"
          aria-label="Pen"
          className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
            activeTool === 'pen'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FiEdit2 className="w-4 h-4" />
        </button>

        {/* Highlighter */}
        <button
          onClick={() => setActiveTool('highlighter')}
          title="Highlighter - key H"
          aria-label="Highlighter"
          className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
            activeTool === 'highlighter'
              ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FaHighlighter className="w-4 h-4" />
        </button>

        {/* Eraser */}
        <button
          onClick={() => setActiveTool('eraser')}
          title="Eraser (Whole Strokes or Part of a Stroke) - key E"
          aria-label="Eraser"
          className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
            activeTool === 'eraser'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FaEraser className="w-4 h-4" />
        </button>

        {/* Lasso Select */}
        <button
          onClick={() => setActiveTool('lasso')}
          title="Lasso Select (Tap or Select Ink to Convert to Typed Block) - key L"
          aria-label="Lasso Select"
          className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
            activeTool === 'lasso'
              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <LuLassoSelect className="w-4 h-4" />
        </button>

        {/* Tablet: one Insert button for the Insert group */}
        {isTablet && (
          <button
            onClick={() => {
              const open = !showInsertMenu;
              closePanels();
              setShowInsertMenu(open);
            }}
            title="Insert (Picture, Screenshot, Shapes, Symbol, Equation)"
            aria-label="Insert"
            aria-expanded={showInsertMenu}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all relative ${
              activeTool === 'shape' || showInsertMenu || showShapes || showSymbols || symbolDialog || showEquation || showScreenshot
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {armed ? <ShapeIcon item={armed} className="w-5 h-5" /> : <LuInsert className="w-4 h-4" />}
          </button>
        )}

        {/* Pan / Move: Visible on tablet & desktop (in More on a folded tablet dock) */}
        {!isMobile && !(isTablet && toolsInMore) && (
          <button
            onClick={() => setActiveTool('pan')}
            title="Move the Page - key M"
            aria-label="Move the Page"
            className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
              activeTool === 'pan'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FiMove className="w-4 h-4" />
          </button>
        )}

        {!isMobile && !(isTablet && toolsInMore) && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />}

        {/* Notes Mode Toggle: Visible on tablet & desktop (in More on a folded tablet dock) */}
        {!isMobile && !(isTablet && toolsInMore) && setNotesMode && (
          <button
            onClick={() => setNotesMode(!notesMode)}
            title={notesMode ? 'Switch to Whiteboard Mode' : 'Switch to Notes Mode'}
            aria-label={notesMode ? 'Switch to Whiteboard Mode' : 'Switch to Notes Mode'}
            aria-pressed={notesMode}
            className={`h-11 min-h-[44px] px-3 min-w-[44px] flex items-center justify-center gap-1.5 rounded-xl transition-all ${
              notesMode
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FiBookOpen className="w-4 h-4" />
            {showLabels && <span className="text-[11px] font-semibold">Notes</span>}
          </button>
        )}

        {/* Desktop-only Direct Tools (Insert group, Eq, Graph, Theory, Mic, Sync, Export) */}
        {isDesktop && (
          <>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

            {/* Insert group, in WPS order: Picture, Screenshot, Shapes, Symbol, Equation */}
            <div className="flex items-center gap-1" role="group" aria-label="Insert">
              {onInsertImage && (
                <button
                  onClick={openPicture}
                  title="Picture: insert an image or photo"
                  aria-label="Insert Picture"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  <FiImage className="w-4 h-4" />
                </button>
              )}
              {screenshotButton}
              {shapesButton}
              {symbolButton}
              {equationButton}
            </div>

            {!toolsInMore && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />}

            {/* Smart Blocks */}
            {onAddBlock && !toolsInMore && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAddBlock('graph')}
                  title="Add Graph Block"
                  aria-label="Add Graph Block"
                  className="px-3 h-11 min-w-[44px] min-h-[44px] rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <FiBarChart2 className="w-3.5 h-3.5" />
                  {showLabels && <span>Graph</span>}
                </button>

                <button
                  onClick={() => onAddBlock('theory')}
                  title="Add Theory Block"
                  aria-label="Add Theory Block"
                  className="px-3 h-11 min-w-[44px] min-h-[44px] rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  {showLabels && <span>Theory</span>}
                </button>
              </div>
            )}

            {!toolsInMore && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />}

            {/* Voice Memo Recording */}
            {onToggleRecordAudio && !toolsInMore && (
              <button
                onClick={onToggleRecordAudio}
                title={isRecording ? 'Stop Voice Recording' : 'Record Voice Note'}
                aria-label="Record Voice Note"
                className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <FiMic className="w-4 h-4" />
              </button>
            )}

            {!toolsInMore && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />}

            {/* Workspace Sync */}
            {onOpenSyncModal && !toolsInMore && (
              <button
                onClick={onOpenSyncModal}
                title="Sync Whiteboard to Notes Workspace"
                aria-label="Sync Whiteboard to Notes Workspace"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <FiLayers className="w-4 h-4 text-blue-500" />
              </button>
            )}

            {/* Export Canvas */}
            {onExportCanvas && !toolsInMore && (
              <button
                onClick={() => {
                  const open = !showExportMenu;
                  closePanels();
                  setShowExportMenu(open);
                }}
                title="Export Canvas (PNG / SVG / PDF)"
                aria-label="Export Canvas (PNG / SVG / PDF)"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <FiDownload className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        {/* Toggle Style Settings Panel */}
        <button
          onClick={() => {
            const open = !showSettings;
            closePanels();
            setShowSettings(open);
          }}
          title="Stroke & Canvas Settings"
          aria-label="Stroke & Canvas Settings"
          className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl transition-all ${
            showSettings
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 shrink-0"
            style={{ backgroundColor: strokeColor }}
          />
          <FiSliders className="w-4 h-4 shrink-0" />
        </button>

        {/* Zoom Controls: Visible on tablet & desktop */}
        {!isMobile && (
          <>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

            {foldZoom && (
              <div className="relative">
                <button
                  onClick={() => {
                    const open = !showZoomMenu;
                    closePanels();
                    setShowZoomMenu(open);
                  }}
                  title="Zoom (Ctrl + / Ctrl - / Ctrl 0)"
                  aria-label="Zoom"
                  aria-expanded={showZoomMenu}
                  className="h-11 min-h-[44px] px-2.5 min-w-[44px] flex items-center justify-center text-xs font-mono font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                {showZoomMenu && (
                  <div role="menu" aria-label="Zoom" className="absolute bottom-full right-0 mb-3 flex items-center gap-0.5 p-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl">
                    <button onClick={onZoomOut} title="Zoom Out (Ctrl -)" aria-label="Zoom Out" className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <FiZoomOut className="w-4 h-4" />
                    </button>
                    <button onClick={onResetZoom} title="Reset Zoom to 100% (Ctrl 0)" aria-label="Reset Zoom to 100%" className="h-11 px-2.5 min-w-[44px] flex items-center justify-center text-xs font-mono font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      100%
                    </button>
                    <button onClick={onZoomIn} title="Zoom In (Ctrl +)" aria-label="Zoom In" className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <FiZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            {!foldZoom && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={onZoomOut}
                title="Zoom Out (Ctrl -)"
                aria-label="Zoom Out"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <FiZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={onResetZoom}
                title="Reset Zoom to 100% (Ctrl 0)"
                aria-label="Reset Zoom to 100%"
                className="h-11 min-h-[44px] px-2.5 min-w-[44px] flex items-center justify-center text-xs font-mono font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                onClick={onZoomIn}
                title="Zoom In (Ctrl +)"
                aria-label="Zoom In"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <FiZoomIn className="w-4 h-4" />
              </button>
            </div>
            )}
          </>
        )}

        {/* "More Tools" Button (on mobile and tablet, and on a folded laptop dock) */}
        {(!isDesktop || toolsInMore) && (
          <>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

            <button
              onClick={() => {
                const open = !showMoreMenu;
                closePanels();
                setShowMoreMenu(open);
              }}
              title="More Tools"
              aria-label="More Tools"
              className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
                showMoreMenu
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FiMoreHorizontal className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
