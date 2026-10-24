'use client';

import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import CanvasGridBackground from './CanvasGridBackground';
import WhiteboardCanvas from './WhiteboardCanvas';
import PlaygroundDock from './PlaygroundDock';
import LiveMathPreviewOverlay, { readingParts } from './LiveMathPreviewOverlay';
import ContextBar, { CTX_BUTTON, CtxDivider } from './ui/ContextBar';
import BlockLinkRenderer from './BlockLinkRenderer';
import InkToBlockConverterModal from './InkToBlockConverterModal';
import SmartBlockWrapper from './blocks/SmartBlockWrapper';
import EquationBlock from './blocks/EquationBlock';
import GraphBlock from './blocks/GraphBlock';
import TheoryBlock from './blocks/TheoryBlock';
import SketchBlock from './blocks/SketchBlock';
import AudioMemoBlock from './blocks/AudioMemoBlock';
import ImageBlock from './blocks/ImageBlock';
import TableBlock from './blocks/TableBlock';
import { newTable } from '@/app/utils/tableCore';
import BackgroundMusicPlayer from './BackgroundMusicPlayer';
import PageManager from './PageManager';
import PageSheet from './PageSheet';
import UnsavedChangesModal from './UnsavedChangesModal';
import FixReadingDialog from './FixReadingDialog';
import AIModelLoadingStatusPill from './AIModelLoadingStatusPill';
import { startAudioRecording, stopAudioRecording } from '../utils/audioRecorder';

import { clusterStrokes } from '../utils/spatialClusterer';
import { processClusterOCR } from '../utils/handwritingOCR';
import { preloadOCREngine } from '../utils/localOCRService';
import { modelManager } from '../utils/recognition/modelManager';
import { recordUserCorrection } from '../utils/recognition/telemetryStore';
import { initAutocompleteTrie } from '../utils/autocompleteTrie';
import { generateGraphDatasetFromLatex, upsertCurveForSource } from '../utils/equationToGraph';
import { exportPage, pageToSvgString, renderInkOnly, renderPagePreview, renderView } from '../utils/exportEngine';
import { boardTitle, freshPages, noteBlocksToCanvas, offsetPage, pageBottom, pageTopLeft } from '../utils/boardStudio';
import { Dialog } from './ui/Dialog';
import {
  differentiateExpression,
  integrateExpression,
  solveRootsExpression,
  formatRawMathToTeX,
} from '../utils/mathASTEvaluator';
import {
  smartBlockReducer,
  INITIAL_SMART_BLOCK_STATE,
  saveSession,
  readSessionBackup,
  pickNewerSession,
  loadSessionFromIndexedDB,
} from '../utils/smartBlockStore';
import { createHistoryStack } from '../utils/historyStack';
import { bboxOfStrokes } from '../utils/strokeTransform';
import { FiCopy, FiPause, FiTrash2 } from 'react-icons/fi';
import { LuShapes, LuLineChart } from 'react-icons/lu';
import { prepareImage, fitImageBox } from '../utils/imageSizing';
import { zoomAtPoint, fitViewToBox } from '../utils/viewportMath';
import ShapeLayer from './shapes/ShapeLayer';
import ShapeSelectionOverlay, { rotateHandleAt } from './shapes/ShapeSelectionOverlay';
import ShapeFormatBar from './shapes/ShapeFormatBar';
import ShapeTextEditor from './shapes/ShapeTextEditor';
import ShapeContextMenu from './shapes/ShapeContextMenu';
import FormatShapePane from './shapes/FormatShapePane';
import { useShapeEditor } from './shapes/useShapeEditor';
import useScreenshot from './screenshot/useScreenshot';
import ShapeGallery, { rememberRecentShape } from './shapes/ShapeGallery';
import {
  createShape, boundsOfShapes, isLineShape, hitTestShapes, shapeDefaultsFrom, DEFAULT_TEXT, lineEndpoints,
} from '../utils/shapes/shapeModel';
import { browserMeasure, shapeWithText } from '../utils/shapes/shapeText';
import {
  rerouteConnectors, canGroup, canUngroup, isWholeGroup, canChangeShape, isConvertibleStroke, shapeFromStroke,
  nearestConnection, lineBetween, setConnection, shapesNear, connectionPoints,
} from '../utils/shapes/shapeArrange';
import { getGalleryItem } from '../utils/shapes/shapeGallery';
import { captureTextTarget, insertIntoField, spliceText } from '../utils/symbols/insertAtCaret';
import { latexForSymbol } from '../utils/symbols/symbols';
import { UI, blockLabel } from '../utils/uiText';
import { getPageBounds, shapeRects } from '../utils/pageSvg';
import { PG_FONT } from '../utils/fonts';
import { DEFAULT_INK, DEFAULT_PEN_TYPE, DEFAULT_PEN_WIDTHS, penTypeOf, readPenSettings, writePenSettings } from '../utils/penTypes';
import DocBar from './DocBar';
import { PreferencesDialog } from './PageMenu';
import useSidebarRight from './ui/useSidebarRight';
import { recordActivity } from '@/app/utils/activity';
import { isProOnDevice } from '@/app/utils/proClient';
import { downloadText } from '@/app/utils/latexExport';
import { pageToTex } from '../utils/latexPage';
import { inkGoesOver } from '../utils/blockLayers';

// A function whose identity never changes but always runs the latest version: memoized blocks
// skip re-rendering only while what they are given stays the same
function useStableCallback(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args) => ref.current(...args), []);
}

// How far below the top of the screen the top bars end, plus a gap: the status area starts here
const TOP_CHROME = 78;

/** "Recording 0:12 · Stop": shown in the status area while a voice memo records, on every screen. */
function RecordingPill({ since, onStop }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.floor((now - since) / 1000));
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return (
    <div role="status" className="pointer-events-auto flex items-center gap-2 h-11 pl-3.5 pr-1.5 rounded-[14px] bg-pg-surface border border-pg-line shadow-pg-bar text-pg-label font-medium text-pg-ink">
      <span className="w-2.5 h-2.5 rounded-full bg-pg-danger animate-pulse" aria-hidden="true" />
      <span className="tabular-nums">
        {UI.recording} {clock}
      </span>
      <button type="button" onClick={onStop} aria-label={UI.stopRecording} title="Stop recording" className="h-9 min-h-[36px] [@media(pointer:coarse)]:min-h-[44px] px-3 rounded-[10px] bg-pg-tray text-pg-danger font-semibold hover:bg-pg-line">
        Stop
      </button>
    </div>
  );
}

// Pause after the last change before the session is written
const SAVE_DELAY_MS = 350;

// Undo histories kept for pages other than the open one (the most recently visited)
const MAX_KEPT_PAGE_HISTORIES = 5;

// Whether `el`, or something between it and `stop`, is a box with its own scrollbar and more
// content than it shows: the wheel should scroll that box, not move the canvas.
function scrollsItself(el, stop) {
  for (let node = el; node && node !== stop && node.nodeType === 1; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    const scrollsY = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
    const scrollsX = /(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1;
    if (scrollsY || scrollsX) return true;
  }
  return false;
}

// Single-key tool shortcuts (shown in the dock tooltips)
const TOOL_SHORTCUTS = { p: 'pen', h: 'highlighter', e: 'eraser', l: 'lasso', s: 'shape', m: 'pan' };

export default function PlaygroundCanvasContainer() {
  const router = useRouter();

  // Viewport Dimensions
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  // Where the app's left sidebar ends: the top bars and the status area keep clear of it
  const sidebarRight = useSidebarRight();

  // Viewport Transform Matrix State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Inking Tool State
  const [activeTool, setActiveTool] = useState('pen');
  // The gallery shape armed for drawing with the Shapes tool (null: freehand shapes snap)
  const [armedShape, setArmedShape] = useState(null);
  // Graphite is the default ink (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, decision R1)
  const [strokeColor, setStrokeColor] = useState(DEFAULT_INK);
  // The pen type is a real setting: each type keeps its own width (the width slider changes the
  // current type's) and sets the opacity. Colour, type and widths are remembered on this device.
  const [penType, setPenType] = useState(DEFAULT_PEN_TYPE);
  const [penWidths, setPenWidths] = useState(DEFAULT_PEN_WIDTHS);
  const strokeWidth = penWidths[penType] ?? penTypeOf(penType).width;
  const strokeOpacity = penTypeOf(penType).opacity;
  const setStrokeWidth = (width) => setPenWidths((prev) => ({ ...prev, [penType]: width }));
  const penLoadedRef = useRef(false);
  useEffect(() => {
    const saved = readPenSettings();
    if (saved) {
      if (saved.colour) setStrokeColor(saved.colour);
      setPenType(saved.type);
      setPenWidths(saved.widths);
    }
    penLoadedRef.current = true;
  }, []);
  useEffect(() => {
    if (penLoadedRef.current) writePenSettings({ colour: strokeColor, type: penType, widths: penWidths });
  }, [strokeColor, penType, penWidths]);
  // The highlighter has its own colour and width (painted 4x wider and see-through)
  const [highlighterColor, setHighlighterColor] = useState('#FACC15');
  const [highlighterWidth, setHighlighterWidth] = useState(4);
  const [gridStyle, setGridStyle] = useState('dots');

  // Eraser: 'stroke' removes whole strokes, 'partial' rubs out only what it passes over.
  // Size is the radius in screen pixels, independent of the pen width.
  const [eraserMode, setEraserMode] = useState('stroke');
  const [eraserSize, setEraserSize] = useState(16);

  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState(null);

  // "Read my writing": 'off' (never), 'select' (when ink is lassoed; the default) or 'live' (as you
  // write, with the readings shown). One setting, remembered on this device.
  const [readMode, setReadModeState] = useState('select');
  const setReadMode = useCallback((mode) => {
    setReadModeState(mode);
    try {
      localStorage.setItem('netz_playground_read_mode', mode);
    } catch (e) {}
  }, []);

  // Writing mode (stored as notesMode): lined paper, reading as you write, blocks snapped to the
  // lines. It switches "Read my writing" to 'live' and puts the earlier choice back when it ends.
  const [notesMode, setNotesModeState] = useState(false);
  const readBeforeWritingRef = useRef(null);
  useEffect(() => {
    try {
      const savedRead = localStorage.getItem('netz_playground_read_mode');
      if (savedRead === 'off' || savedRead === 'select' || savedRead === 'live') setReadModeState(savedRead);
      const savedWriting = localStorage.getItem('netz_playground_writing_mode');
      if (savedWriting) {
        const parsed = JSON.parse(savedWriting);
        if (parsed && parsed.on) {
          setNotesModeState(true);
          readBeforeWritingRef.current = parsed.readBefore || 'select';
        }
      }
    } catch (e) {}
  }, []);
  const readModeRef = useRef(readMode);
  readModeRef.current = readMode;
  const setNotesMode = useCallback((on) => {
    lineBaselineRef.current = null;
    if (on) {
      readBeforeWritingRef.current = readModeRef.current;
      setReadMode('live');
    } else {
      setReadMode(readBeforeWritingRef.current || 'select');
      readBeforeWritingRef.current = null;
    }
    setNotesModeState(on);
    try {
      localStorage.setItem('netz_playground_writing_mode', JSON.stringify({ on, readBefore: readBeforeWritingRef.current }));
    } catch (e) {}
  }, [setReadMode]);

  // Touch preference: fingers draw like any other pointer (default), or move the page instead.
  // Two fingers always pan and zoom; mouse, trackpad and pen always draw.
  const [fingerDraws, setFingerDraws] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem('netz_playground_finger_draws') === 'false') setFingerDraws(false);
    } catch (e) {}

    const preventGesture = (e) => e.preventDefault();
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', preventGesture);
    };
  }, []);
  const handleSetFingerDraws = useCallback((value) => {
    setFingerDraws(value);
    try {
      localStorage.setItem('netz_playground_finger_draws', String(value));
    } catch (e) {}
  }, []);

  // Multi-Page Notebook State (Samsung Notes / Apple Notes parity)
  const [pages, setPages] = useState([{ id: 'page_1', title: 'Page 1', strokes: [], blocks: [], links: [], shapes: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Audio Voice Memo State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // Smart Block & Link Store (Reducer)
  const [blockState, dispatch] = useReducer(smartBlockReducer, INITIAL_SMART_BLOCK_STATE);

  // OCR Clusters State
  const [clusters, setClusters] = useState([]);
  const clustersRef = useRef([]);
  clustersRef.current = clusters;
  // Writing mode "As I write": reads each finished line (set up next to handleConvertClusterToBlock)
  const lineReaderRef = useRef(null);
  const lineTimerRef = useRef(null);
  // Ink already on the page when writing started (Writing mode turned on, or the page opened):
  // it is not read, so drawings and old notes never go into the Training data
  const lineBaselineRef = useRef(null);

  // The block just added from the dock: it opens ready for typing
  const [autoEditBlockId, setAutoEditBlockId] = useState(null);

  // Ink currently selected with the lasso (drives its context bar), and whether the ⋯ menu of
  // its reading is open (closed again for each new selection)
  const [inkSelection, setInkSelection] = useState(null);
  const [selectionMenuOpen, setSelectionMenuOpen] = useState(false);
  useEffect(() => {
    setSelectionMenuOpen(false);
  }, [inkSelection]);

  // Modal States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingTargetUrl, setPendingTargetUrl] = useState(null);
  const [softEditorCluster, setSoftEditorCluster] = useState(null);

  // Pan State, Canvas & Persistence Refs
  const containerRef = useRef(null);
  const isMiddlePanRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const ocrDebounceTimerRef = useRef(null);
  const ocrPassRef = useRef(0);
  const whiteboardCanvasRef = useRef(null);

  // Refs to eliminate race conditions and stale closures
  const isSessionLoadedRef = useRef(false);
  const pagesRef = useRef(pages);
  const currentPageIndexRef = useRef(currentPageIndex);
  const blockStateRef = useRef(blockState);
  const latestStrokesRef = useRef([]);
  // How many strokes the open page has (the empty-page hint shows while there are none)
  const [inkCount, setInkCount] = useState(0);

  // Shapes on the active page (Insert > Shapes). The ref is always current, also between renders.
  const [shapes, setShapes] = useState([]);
  const latestShapesRef = useRef([]);
  // Connector ends attached to shapes follow them, whatever changed the shapes
  const applyShapes = useCallback((next) => {
    const routed = rerouteConnectors(next);
    latestShapesRef.current = routed;
    setShapes(routed);
  }, []);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex;
  }, [currentPageIndex]);

  useEffect(() => {
    blockStateRef.current = blockState;
  }, [blockState]);

  // Undo / Redo: whole-page snapshots of { strokes, blocks, links } for the active page
  const historyRef = useRef(null);
  if (historyRef.current === null) {
    historyRef.current = createHistoryStack(100);
    historyRef.current.reset({
      strokes: latestStrokesRef.current,
      blocks: INITIAL_SMART_BLOCK_STATE.blocks,
      links: INITIAL_SMART_BLOCK_STATE.links,
      shapes: latestShapesRef.current,
    });
  }
  // Set while one user action changes both ink and blocks, so it becomes a single undo step
  const holdStrokeCommitRef = useRef(false);
  // Set while a shape is being dragged, resized or rotated: the whole drag is one undo step
  const holdHistoryRef = useRef(false);
  const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });

  const syncHistoryFlags = useCallback(() => {
    const canUndo = historyRef.current.canUndo();
    const canRedo = historyRef.current.canRedo();
    setHistoryFlags((prev) => (prev.canUndo === canUndo && prev.canRedo === canRedo ? prev : { canUndo, canRedo }));
  }, []);

  // Records the page's current state as a new undo step (no-op when nothing changed)
  const commitHistory = useCallback(() => {
    if (!isSessionLoadedRef.current || holdHistoryRef.current) return;
    const committed = historyRef.current.commit({
      strokes: latestStrokesRef.current,
      blocks: blockStateRef.current.blocks,
      links: blockStateRef.current.links,
      shapes: latestShapesRef.current,
    });
    if (committed) syncHistoryFlags();
  }, [syncHistoryFlags]);

  // Starts a fresh history from this state (another page was opened, or the session was restored)
  const resetHistory = useCallback((strokes, blocks, links, pageShapes = []) => {
    latestStrokesRef.current = strokes;
    setInkCount((strokes || []).length);
    historyRef.current.reset({ strokes, blocks, links, shapes: pageShapes });
    syncHistoryFlags();
  }, [syncHistoryFlags]);

  // Block and shape edits arrive in bursts (dragging, typing): one undo step once they settle
  useEffect(() => {
    const timer = setTimeout(commitHistory, 350);
    return () => clearTimeout(timer);
  }, [blockState.blocks, blockState.links, shapes, commitHistory]);

  // A save writes the whole session, which on a full page takes long enough to interrupt
  // writing. Changes are therefore saved after a short pause, and never while a stroke is
  // being drawn. (The flag on window lets automated checks wait for the save.)
  const saveTimerRef = useRef(null);
  const drawingNowRef = useRef(false);
  const setSavePending = (pending) => {
    if (typeof window !== 'undefined') window.__NETZ_PLAYGROUND_SAVE_PENDING__ = pending;
  };

  // What the top bar says about saving: 'saved', 'saving' (a change is waiting or being written)
  // or 'failed' (IndexedDB refused the last write; the next change or Retry tries again)
  const [saveStatus, setSaveStatusState] = useState('saved');
  const saveStatusRef = useRef('saved');
  const setSaveStatus = useCallback((next) => {
    if (saveStatusRef.current === next) return;
    saveStatusRef.current = next;
    setSaveStatusState(next);
  }, []);
  // Only the newest save's result counts (an older write can finish after a newer one started)
  const saveSeqRef = useRef(0);

  // Centralized Bulletproof Session Persistence Helper
  const persistSession = useCallback((overridePages, overrideIndex, overrideBlocks, overrideLinks) => {
    if (!isSessionLoadedRef.current) return; // Prevent overwriting session before initial load finishes!

    // This save covers whatever a waiting one would have written
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setSavePending(false);

    let currentStrokes = null;
    if (whiteboardCanvasRef.current?.getStrokes) {
      currentStrokes = whiteboardCanvasRef.current.getStrokes();
    } else {
      currentStrokes = latestStrokesRef.current;
    }

    const targetPages = overridePages || pagesRef.current;
    const targetIndex = overrideIndex !== undefined ? overrideIndex : currentPageIndexRef.current;
    const targetBlocks = overrideBlocks || blockStateRef.current.blocks;
    const targetLinks = overrideLinks || blockStateRef.current.links;

    const finalPages = targetPages.map((p, idx) => {
      if (idx === targetIndex) {
        const strokesToSave = (currentStrokes !== null && Array.isArray(currentStrokes))
          ? currentStrokes
          : (p.strokes || []);
        return {
          ...p,
          strokes: strokesToSave,
          blocks: targetBlocks,
          links: targetLinks,
          shapes: latestShapesRef.current,
        };
      }
      return p;
    });

    pagesRef.current = finalPages;

    const sessionObj = {
      pages: finalPages,
      currentPageIndex: targetIndex,
      blocks: targetBlocks,
      links: targetLinks,
    };

    const seq = ++saveSeqRef.current;
    setSaveStatus('saving');
    saveSession('default_session', sessionObj, {
      onStored: (ok, err) => {
        if (seq !== saveSeqRef.current) return;
        if (!ok) console.error('[Playground] The session could not be saved:', err);
        setSaveStatus(ok ? 'saved' : 'failed');
      },
    });
  }, [setSaveStatus]);

  const scheduleSave = useCallback(() => {
    if (!isSessionLoadedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSavePending(true);
    setSaveStatus('saving');
    const run = () => {
      if (drawingNowRef.current) {
        saveTimerRef.current = setTimeout(run, SAVE_DELAY_MS);
        return;
      }
      saveTimerRef.current = null;
      persistSession();
    };
    saveTimerRef.current = setTimeout(run, SAVE_DELAY_MS);
  }, [persistSession, setSaveStatus]);

  // Writes a waiting save now (the tab is being hidden, closed or reloaded)
  const flushSave = useCallback(() => {
    if (saveTimerRef.current) persistSession();
  }, [persistSession]);

  const handleDrawingStateChange = useCallback((drawing) => {
    drawingNowRef.current = drawing;
    setIsDrawing(drawing);
  }, []);

  // Save Feedback Toast State
  const [isSavedToastVisible, setIsSavedToastVisible] = useState(false);

  // Short message shown at the top of the page (export finished, nothing to export, ...)
  // The second argument is a duration in ms, or { duration, action: { label, onClick } }: a notice
  // with an action (Undo) stays 8 s, and while a pointer rests on it.
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);
  const showNotice = useCallback((message, options = 3000) => {
    const opts = typeof options === 'number' ? { duration: options } : options || {};
    const action = opts.action || null;
    const duration = opts.duration || (action ? 8000 : 3000);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNotice({ message, action, duration });
    noticeTimerRef.current = setTimeout(() => setNotice(null), duration);
  }, []);
  // The zoom shown while two fingers pinch (null when no pinch is going on)
  const [pinchZoom, setPinchZoom] = useState(null);
  const holdNotice = useCallback(() => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = null;
  }, []);
  const releaseNotice = useCallback(() => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 3000);
  }, []);

  // One finger draws by default (handoff rule 2). After the first finger stroke, people are told
  // once, with a way to make one finger scroll instead. Not shown if they ever chose.
  const previousStrokeCountRef = useRef(0);
  const routerWarmedRef = useRef(false);
  const maybeShowFingerHint = useCallback(() => {
    try {
      if (localStorage.getItem('netz_playground_finger_draws') !== null) return;
      if (localStorage.getItem('netz_playground_finger_hint_seen')) return;
      localStorage.setItem('netz_playground_finger_hint_seen', '1');
    } catch (e) {
      return;
    }
    showNotice('One finger draws. Two fingers move the page.', {
      action: {
        label: 'Scroll with one finger',
        onClick: () => {
          handleSetFingerDraws(false);
          showNotice('One finger now moves the page. Change it in Preferences.', 5000);
        },
      },
    });
  }, [showNotice, handleSetFingerDraws]);

  // Load Session on Mount (Restores Multi-Page Notebook, Page Index & Ink Strokes)
  useEffect(() => {
    const restoreSession = (saved) => {
      if (!saved || !saved.pages || saved.pages.length === 0) return;

      setPages(saved.pages);
      pagesRef.current = saved.pages;

      const restoredIdx = Math.min(Math.max(0, saved.currentPageIndex || 0), saved.pages.length - 1);
      setCurrentPageIndex(restoredIdx);
      currentPageIndexRef.current = restoredIdx;

      const activePage = saved.pages[restoredIdx];
      const activeStrokes = activePage.strokes || [];
      const activeBlocks = activePage.blocks || saved.blocks || [];
      const activeLinks = activePage.links || saved.links || [];
      const activeShapes = activePage.shapes || [];

      dispatch({
        type: 'SET_SESSION',
        payload: {
          blocks: activeBlocks,
          links: activeLinks,
        },
      });
      // The dispatch only lands on the next render, but saving is allowed from this point on.
      // Without this the first save writes the still-empty block list over the restored one.
      blockStateRef.current = { ...blockStateRef.current, blocks: activeBlocks, links: activeLinks };
      applyShapes(activeShapes);
      // The restored page is the starting point: undo must never step back to an empty page
      resetHistory(activeStrokes, activeBlocks, activeLinks, activeShapes);

      // Retry loadStrokes to ensure static canvas is ready in DOM
      const tryLoad = (attempts = 0) => {
        if (whiteboardCanvasRef.current && whiteboardCanvasRef.current.loadStrokes) {
          whiteboardCanvasRef.current.loadStrokes(activeStrokes);
        } else if (attempts < 20) {
          setTimeout(() => tryLoad(attempts + 1), 50);
        }
      };
      tryLoad();
    };

    // The localStorage backup is read synchronously, so the page appears at once. IndexedDB
    // answers a moment later and overrules it when it holds a later save (the backup is dropped
    // once a session outgrows localStorage). Nothing is saved until both have been looked at,
    // so an older copy can never be written over a newer one.
    const backup = readSessionBackup();
    if (backup) restoreSession(backup);

    let finished = false;
    const finishLoading = (saved) => {
      if (finished) return;
      finished = true;
      const newest = pickNewerSession(backup, saved);
      if (newest && newest !== backup) restoreSession(newest);
      isSessionLoadedRef.current = true;
    };
    loadSessionFromIndexedDB('default_session', finishLoading);
    // If IndexedDB never answers (blocked or broken), carry on with what was restored
    const loadFallbackTimer = setTimeout(() => finishLoading(null), 2000);

    preloadOCREngine();
    initAutocompleteTrie();
    return () => clearTimeout(loadFallbackTimer);
  }, [resetHistory, applyShapes]);

  // Save Session when blocks, links or shapes change (dragging or typing changes them many times a second)
  useEffect(() => {
    scheduleSave();
  }, [blockState.blocks, blockState.links, shapes, scheduleSave]);

  // A save still waiting must not be lost when the tab is hidden, closed or reloaded
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushSave();
    };
    window.addEventListener('pagehide', flushSave);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('pagehide', flushSave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [flushSave]);

  // Applies an undo / redo snapshot to the canvas, the blocks and the saved session
  const applyHistorySnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    latestStrokesRef.current = snapshot.strokes;
    setInkCount((snapshot.strokes || []).length);
    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.loadStrokes(snapshot.strokes);
    }
    dispatch({ type: 'SET_SESSION', payload: { blocks: snapshot.blocks, links: snapshot.links } });
    applyShapes(snapshot.shapes || []);

    const activePageIndex = currentPageIndexRef.current;
    setPages((prevPages) =>
      prevPages.map((p, idx) =>
        idx === activePageIndex ? { ...p, strokes: snapshot.strokes, blocks: snapshot.blocks, links: snapshot.links, shapes: snapshot.shapes || [] } : p
      )
    );

    // Recognition results refer to ink that may no longer exist
    if (ocrDebounceTimerRef.current) clearTimeout(ocrDebounceTimerRef.current);
    ocrPassRef.current++;
    setClusters([]);
    setSelectedClusterId(null);

    persistSession(undefined, undefined, snapshot.blocks, snapshot.links);
    syncHistoryFlags();
  }, [persistSession, syncHistoryFlags, applyShapes]);

  const handleUndo = useCallback(() => {
    commitHistory(); // make sure an edit still waiting to settle is on the stack first
    applyHistorySnapshot(historyRef.current.undo());
  }, [commitHistory, applyHistorySnapshot]);

  const handleRedo = useCallback(() => {
    applyHistorySnapshot(historyRef.current.redo());
  }, [applyHistorySnapshot]);

  // For notices whose Undo button outlives the render that made them
  const handleUndoRef = useRef(handleUndo);
  handleUndoRef.current = handleUndo;

  // Ctrl/Cmd + key actions other than undo / redo. Filled in on every render (further down, once
  // the zoom and save handlers exist) so the key listener always calls the current ones.
  const shortcutActionsRef = useRef({});

  // Keyboard: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo (left to the browser inside text fields)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const target = e.target;
      const tag = target && target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (target && target.isContentEditable)) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        handleRedo();
      } else {
        const action = shortcutActionsRef.current[key];
        if (action) {
          e.preventDefault();
          action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Synchronous Unmount Cleanup: Flushes latest strokes & session state before unmounting
  useEffect(() => {
    return () => {
      if (isSessionLoadedRef.current) {
        persistSession();
      }
    };
  }, [persistSession]);

  // Leaving the Playground from the app's sidebar. Everything is saved automatically, so leaving
  // asks nothing; a save still waiting is written on the way out (the unmount above). Only when
  // the last save failed does it ask, because changes since then may be lost.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.__NETZ_PLAYGROUND_HAS_UNSAVED_CHANGES__ = saveStatus !== 'saved';
    window.__NETZ_OPEN_UNSAVED_MODAL__ = (targetUrl) => {
      if (saveStatusRef.current === 'failed') {
        setPendingTargetUrl(targetUrl);
        setIsUnsavedModalOpen(true);
      } else {
        flushSave();
        router.push(targetUrl);
      }
    };
    return () => {
      window.__NETZ_PLAYGROUND_HAS_UNSAVED_CHANGES__ = false;
      window.__NETZ_OPEN_UNSAVED_MODAL__ = null;
    };
  }, [saveStatus, flushSave, router]);

  // Window Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Clipboard Paste Handler (Ctrl+V / Cmd+V for images)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              handleInsertImage(event.target.result);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stroke Updates Listener (Auto-saves ink strokes & updates active page state)
  const handleStrokesUpdated = useCallback((allStrokes, options = {}) => {
    latestStrokesRef.current = allStrokes;
    setInkCount(allStrokes.length);
    // A "transient" update is one of several inside a single gesture (an eraser drag):
    // it is saved like any other change, but only the gesture's final update becomes an undo step
    if (!holdStrokeCommitRef.current && !options.transient) commitHistory();

    // The page these strokes belong to is read from the ref, not from this callback's closure:
    // page actions change the active page and then touch the canvas within the same event.
    const activePageIndex = currentPageIndexRef.current;

    // Update the active page's strokes now; the save follows once writing pauses
    const updatedPages = pagesRef.current.map((p, idx) => (idx === activePageIndex ? { ...p, strokes: allStrokes } : p));
    pagesRef.current = updatedPages;
    setPages(updatedPages);
    scheduleSave();

    if (ocrDebounceTimerRef.current) {
      clearTimeout(ocrDebounceTimerRef.current);
    }

    // A first stroke drawn with a finger: say once what one finger does, and how to change it
    const newest = allStrokes.length > previousStrokeCountRef.current ? allStrokes[allStrokes.length - 1] : null;
    previousStrokeCountRef.current = allStrokes.length;
    if (newest && newest.points && newest.points[0] && newest.points[0].pointerType === 'touch') maybeShowFingerHint();

    // The small router model (and the recognition runtime it brings, about 28 MB) warms up once
    // the first stroke is down, not when the page opens; never while reading is off
    if (newest && !routerWarmedRef.current && readModeRef.current !== 'off') {
      routerWarmedRef.current = true;
      const warm = () => modelManager.loadRouter().catch(() => {});
      if (typeof window !== 'undefined' && window.requestIdleCallback) window.requestIdleCallback(warm, { timeout: 2000 });
      else setTimeout(warm, 500);
    }

    // Reading as you write only in 'live'; 'select' reads lassoed ink, 'off' reads nothing
    if (readModeRef.current !== 'live') {
      return;
    }

    // Writing mode: each finished line is read by the text model (lineReaderRef, below). Ink with
    // an "=" gesture is a calculation and goes the usual way, through the maths model.
    if (notesMode) {
      const rawClusters = clusterStrokes(allStrokes, 32);
      const instantEqualsCluster = rawClusters.find((c) => c.hasEqualsGesture);
      if (!instantEqualsCluster) {
        lineReaderRef.current?.(allStrokes);
        return;
      }
    }

    const rawClusters = clusterStrokes(allStrokes, 32);
    const hasInstantEquals = rawClusters.some((c) => c.hasEqualsGesture);
    const delay = hasInstantEquals ? 100 : 800;

    // Immediately show clusters in 'pending' state so preview pills render with spinners
    const pendingClusters = rawClusters.map((c) => ({
      ...c,
      detectedText: '',
      isMath: false,
      evaluatedResult: null,
      confidence: 0,
      ocrStatus: 'pending', // 'pending' | 'recognized' | 'error' | 'no_api_key'
    }));
    setClusters(pendingClusters);

    const passId = ++ocrPassRef.current;

    ocrDebounceTimerRef.current = setTimeout(async () => {
      const currentMode = notesMode ? 'notes' : 'normal';
      const processed = await Promise.all(
        rawClusters.map(async (c) => {
          const res = await processClusterOCR(c, { mode: currentMode });
          return {
            ...c,
            detectedText: res ? res.detectedText : '',
            isMath: res ? res.isMath : false,
            evaluatedResult: res ? res.evaluatedResult : null,
            confidence: res ? res.confidence : 0,
            ocrStatus: res ? (res.status || 'recognized') : 'error',
            ocrError: res ? res.error : null,
            shouldConvert: res ? res.shouldConvert : true,
            action: res ? res.action : 'convert_equation',
            type: res ? res.type : undefined,
            alternatives: res ? res.alternatives : undefined,
            confidenceDetails: res ? res.confidenceDetails : undefined,
            mathsSkipped: res ? Boolean(res.mathsSkipped) : false,
          };
        })
      );

      // A newer stroke started a newer pass: its results replace these, so drop the stale ones
      if (passId !== ocrPassRef.current) return;

      setClusters(processed);
      if (processed.some((c) => c.evaluatedResult !== null && c.evaluatedResult !== undefined && c.evaluatedResult !== '')) {
        recordActivity('playground.eval', {});
      }

      // Auto-select latest recognized cluster if Lasso tool is active
      const recognizedClusters = processed.filter((c) => c.detectedText);
      if (recognizedClusters.length > 0 && activeTool === 'lasso') {
        setSelectedClusterId(recognizedClusters[recognizedClusters.length - 1].clusterId);
      }
    }, delay);
  }, [activeTool, notesMode, commitHistory, scheduleSave, maybeShowFingerHint]);

  // Convert OCR Handwriting Cluster to In-Place Editable Typed Block (Replacing Ink)
  // In Notes Mode, snaps position and dimensions directly to ruled paper grid lines
  const handleConvertClusterToBlock = useCallback((cluster, editedText = null) => {
    let spawnX = cluster.bbox.minX;
    let spawnY = cluster.bbox.minY;
    let width = Math.max(260, (cluster.bbox.maxX - cluster.bbox.minX) + 60);
    let height = 100;

    // Guideline Snapping in Notes Mode: aligns directly onto the 32px lined paper grid
    if (notesMode) {
      const gridSpacing = 32;
      spawnY = Math.round(cluster.bbox.minY / gridSpacing) * gridSpacing;
      const rawHeight = Math.max(gridSpacing, cluster.bbox.maxY - cluster.bbox.minY);
      height = Math.max(gridSpacing * 2, Math.ceil(rawHeight / gridSpacing) * gridSpacing);
    }

    const finalText = editedText !== null ? editedText : (cluster.detectedText || '');

    // Training data: what the writer accepted for a line read in Writing mode
    if (cluster.trainingId) {
      import('../../Notes/utils/assetStore')
        .then((m) => m.updateTrainingSample(cluster.trainingId, { converted: true, acceptedText: finalText, edited: editedText !== null && editedText !== cluster.detectedText }))
        .catch(() => {});
    }

    const newBlockId = `block_${Date.now()}`;
    const blockType = cluster.isMath ? 'equation' : 'theory';
    const content = cluster.isMath
      ? { latex: finalText }
      : { text: finalText };

    const newBlock = {
      blockId: newBlockId,
      type: blockType,
      content,
      linkedBlockIds: [],
      sourceStrokeIds: cluster.strokeIds || [],
      sourceStrokes: cluster.strokes || [],
      position: { x: spawnX, y: spawnY },
      size: { width, height },
      status: 'active',
      isMinimal: !cluster.isMath,
      isRuledLineAligned: Boolean(notesMode),
    };

    dispatch({ type: 'ADD_BLOCK', payload: newBlock });
    if (finalText.trim()) recordActivity('ink.converted', { kind: cluster.isMath ? 'math' : 'text' });

    // Erase converted handwritten ink strokes from canvas.
    // The new block and the erased ink are one undo step, recorded once the block has landed.
    if (whiteboardCanvasRef.current && cluster.strokeIds) {
      holdStrokeCommitRef.current = true;
      whiteboardCanvasRef.current.eraseStrokesByIds(cluster.strokeIds);
      holdStrokeCommitRef.current = false;
    }

    // Remove preview pill once converted
    setClusters((prev) => prev.filter((c) => c.clusterId !== cluster.clusterId));
    setSelectedClusterId(null);
  }, [notesMode]);

  // ── Writing mode, "As I write" (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 4) ──────────
  // Writing is grouped by the 32 px ruled line it sits on. A line is read by the text model
  // alone when you move down to another line, or after a one-second pause. Its reading shows as
  // a pill; nothing is converted until you tap it (owner decision D2). Writing more on a line
  // that is still waiting reads the whole line again. Every reading is saved to the Training
  // data folder in Notes Studio (D5), and updated with what you accept.
  const readLine = async (lineIdx, strokes, pageId, replacesTrainingId = null) => {
    const cluster = {
      clusterId: `line_${lineIdx}_${Date.now()}`,
      lineIdx,
      strokeIds: strokes.map((st) => st.id),
      strokes,
      bbox: bboxOfStrokes(strokes),
      hasEqualsGesture: false,
      detectedText: '',
      isMath: false,
      evaluatedResult: null,
      confidence: 0,
      ocrStatus: 'pending',
    };
    setClusters((prev) => [...prev.filter((c) => !(c.lineIdx === lineIdx && c.clusterId.startsWith('line_'))), cluster]);
    const res = await processClusterOCR(cluster, { mode: 'notes', forceRefresh: true });
    if (pagesRef.current[currentPageIndexRef.current]?.id !== pageId) return;
    let trainingId = null;
    const store = await import('../../Notes/utils/assetStore');
    // The line was read before, with fewer strokes: this reading replaces that sample
    if (replacesTrainingId) await store.deleteTrainingSample(replacesTrainingId).catch(() => {});
    if (res && res.detectedText) {
      const { addTrainingSample } = store;
      trainingId = await addTrainingSample({
        strokes,
        readText: res.detectedText,
        alternatives: res.alternatives,
        routing: res.rawResult?.routing || null,
        pointerType: strokes[0]?.points?.[0]?.pointerType || '',
      });
    }
    setClusters((prev) =>
      prev.map((c) =>
        c.clusterId === cluster.clusterId
          ? {
              ...c,
              detectedText: res ? res.detectedText : '',
              isMath: res ? res.isMath : false,
              evaluatedResult: res ? res.evaluatedResult : null,
              confidence: res ? res.confidence : 0,
              ocrStatus: res ? (res.status || 'recognized') : 'error',
              ocrError: res ? res.error : null,
              shouldConvert: res ? res.shouldConvert : true,
              action: res ? res.action : 'convert_text',
              type: res ? res.type : undefined,
              alternatives: res ? res.alternatives : undefined,
              confidenceDetails: res ? res.confidenceDetails : undefined,
              mathsSkipped: res ? Boolean(res.mathsSkipped) : false,
              trainingId,
            }
          : c
      )
    );
  };

  lineReaderRef.current = (allStrokes) => {
    clearTimeout(lineTimerRef.current);
    const pageId = pagesRef.current[currentPageIndexRef.current]?.id;
    if (!lineBaselineRef.current || lineBaselineRef.current.pageId !== pageId) {
      lineBaselineRef.current = { pageId, ids: new Set(allStrokes.slice(0, -1).map((st) => st.id)) };
    }
    const before = lineBaselineRef.current.ids;
    const writing = allStrokes.filter((st) => !before.has(st.id) && st.tool !== 'highlighter' && st.tool !== 'eraser' && !st.shape && st.bbox);
    const byId = new Map(writing.map((st) => [st.id, st]));
    const lineClusters = clustersRef.current.filter((c) => c.clusterId?.startsWith('line_'));
    // A line whose ink was erased (even partly) loses its pill; what is left is read again
    const broken = lineClusters.filter((c) => c.strokeIds.some((id) => !byId.has(id)));
    if (broken.length) setClusters((prev) => prev.filter((c) => !broken.some((b) => b.clusterId === c.clusterId)));
    const waiting = lineClusters.filter((c) => !broken.includes(c));
    const taken = new Set(waiting.flatMap((c) => c.strokeIds));
    const unread = writing.filter((st) => !taken.has(st.id));
    if (!unread.length) return;

    const lineOf = (st) => Math.floor((st.bbox.minY + st.bbox.maxY) / 2 / 32);
    const groups = new Map();
    unread.forEach((st) => {
      const k = lineOf(st);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(st);
    });
    const readGroup = (k) => {
      const earlier = waiting.find((c) => c.lineIdx === k);
      const strokes = earlier ? [...earlier.strokeIds.map((id) => byId.get(id)).filter(Boolean), ...groups.get(k)] : groups.get(k);
      readLine(k, strokes, pageId, earlier?.trainingId || null);
    };
    const newest = allStrokes[allStrokes.length - 1];
    const newestLine = newest?.bbox ? lineOf(newest) : null;
    // Lines other than the one being written are finished: read them now
    [...groups.keys()].filter((k) => k !== newestLine).forEach(readGroup);
    // The line being written: after a pause
    if (newestLine !== null && groups.has(newestLine)) {
      lineTimerRef.current = setTimeout(() => readGroup(newestLine), 1000);
    }
  };
  useEffect(() => () => clearTimeout(lineTimerRef.current), []);

  // Handle Manual Selection OCR Trigger (when user selects drawn area with Lasso)
  const handleSelectionCompleted = useCallback(async ({ strokes: selectedStrokes, bbox, lassoPolygon }) => {
    // Highlighter marks and snapped shapes inside the lasso are not writing and are left out of recognition
    const strokes = (selectedStrokes || []).filter((s) => s.tool !== 'highlighter' && !s.shape);
    if (strokes.length === 0 || readModeRef.current === 'off') return;
    const strokeIds = strokes.map((s) => s.id);

    const selectionClusterId = `selection_${Date.now()}`;
    const selectionCluster = {
      clusterId: selectionClusterId,
      strokeIds,
      strokes,
      bbox,
      lassoPolygon,
      hasEqualsGesture: false,
      status: 'pending',
      detectedText: '',
      isMath: false,
      evaluatedResult: null,
      confidence: 0,
      ocrStatus: 'pending',
    };

    setClusters((prev) => [...prev.filter((c) => !c.clusterId.startsWith('selection_')), selectionCluster]);
    setSelectedClusterId(selectionClusterId);

    const currentMode = notesMode ? 'notes' : 'normal';
    const res = await processClusterOCR(selectionCluster, { forceRefresh: true, mode: currentMode });

    if (res) {
      const updatedCluster = {
        ...selectionCluster,
        detectedText: res.detectedText || '',
        isMath: res.isMath || false,
        evaluatedResult: res.evaluatedResult || null,
        confidence: res.confidence || 0,
        ocrStatus: res.detectedText ? 'recognized' : (res.status || 'error'),
        ocrError: res.error || null,
        shouldConvert: res.shouldConvert !== undefined ? res.shouldConvert : true,
        action: res.action || (res.isMath ? 'convert_equation' : 'convert_text'),
        type: res.type,
        alternatives: res.alternatives,
        confidenceDetails: res.confidenceDetails,
        mathsSkipped: Boolean(res.mathsSkipped),
      };

      setClusters((prev) =>
        prev.map((c) => (c.clusterId === selectionClusterId ? updatedCluster : c))
      );
    }
  }, [notesMode]);

  // The lasso selection changed on the canvas: moved, resized, recoloured, duplicated, deleted or let go.
  // The recognition pill of that selection follows the ink, or goes away with it.
  const handleInkSelectionChange = useCallback((selection, reason) => {
    setInkSelection(selection ? { strokeIds: selection.strokeIds, bbox: selection.bbox } : null);
    if (reason === 'new') return; // a fresh lasso starts its own recognition in handleSelectionCompleted

    setClusters((prev) => {
      const writing = selection ? selection.strokes.filter((st) => st.tool !== 'highlighter' && !st.shape) : [];
      if (writing.length === 0) return prev.filter((c) => !c.clusterId.startsWith('selection_'));
      const bbox = bboxOfStrokes(writing);
      return prev.map((c) =>
        c.clusterId.startsWith('selection_') ? { ...c, strokes: writing, strokeIds: writing.map((st) => st.id), bbox } : c
      );
    });
  }, []);

  // Single keys (left to the browser inside text fields): Delete / Backspace removes the lasso
  // selection, Escape lets it go, and a letter picks a tool.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target;
      const tag = target && target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable)) return;

      if (e.key !== 'Delete' && e.key !== 'Backspace') {
        if (e.repeat) return;
        if (e.key === 'Escape') {
          whiteboardCanvasRef.current?.clearSelection?.();
          return;
        }
        // Shift+1: fit to content (as in Figma and other whiteboards)
        if (e.shiftKey && e.code === 'Digit1') {
          e.preventDefault();
          handleFitToContentRef.current();
          return;
        }
        const tool = TOOL_SHORTCUTS[e.key.toLowerCase()];
        if (tool) {
          e.preventDefault();
          setActiveTool(tool);
        }
        return;
      }
      if (whiteboardCanvasRef.current?.hasSelection?.()) {
        e.preventDefault();
        whiteboardCanvasRef.current.deleteSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // "Read as maths": the text fast path skipped the maths recogniser and the user says it is maths.
  // Re-reads the same ink with maths preferred and keeps the correction as router training data.
  const handleReadClusterAsMath = useCallback(async (cluster) => {
    if (!cluster || !cluster.strokes || cluster.strokes.length === 0) return;
    const previousText = cluster.detectedText || '';

    setClusters((prev) =>
      prev.map((c) => (c.clusterId === cluster.clusterId ? { ...c, ocrStatus: 'pending', detectedText: '' } : c))
    );

    const currentMode = notesMode ? 'notes' : 'normal';
    const res = await processClusterOCR(cluster, { forceRefresh: true, mode: currentMode, preferType: 'MATH' });

    setClusters((prev) =>
      prev.map((c) => {
        if (c.clusterId !== cluster.clusterId) return c;
        if (!res || !res.detectedText) {
          return { ...c, ocrStatus: 'recognized', detectedText: previousText };
        }
        return {
          ...c,
          detectedText: res.detectedText,
          isMath: res.isMath || false,
          evaluatedResult: res.evaluatedResult || null,
          confidence: res.confidence || 0,
          ocrStatus: 'recognized',
          ocrError: null,
          shouldConvert: res.shouldConvert !== undefined ? res.shouldConvert : true,
          action: res.action || 'convert_equation',
          type: res.type,
          alternatives: res.alternatives,
          confidenceDetails: res.confidenceDetails,
          mathsSkipped: false,
        };
      })
    );

    if (res && res.isMath && res.detectedText) {
      recordUserCorrection({
        sourceStrokeIds: cluster.strokeIds || [],
        strokes: cluster.strokes,
        predictedValue: previousText,
        userCorrectedValue: res.detectedText,
        assignedType: 'MATH',
        confidence: res.confidenceDetails || {},
      }).catch(() => {});
    }
  }, [notesMode]);

  // "Read as text": the math recogniser was chosen and the user says it is ordinary text.
  // Re-reads the same ink with text preferred and keeps the correction as router training data.
  const handleReadClusterAsText = useCallback(async (cluster) => {
    if (!cluster || !cluster.strokes || cluster.strokes.length === 0) return;
    const previousText = cluster.detectedText || '';

    setClusters((prev) =>
      prev.map((c) => (c.clusterId === cluster.clusterId ? { ...c, ocrStatus: 'pending', detectedText: '' } : c))
    );

    const currentMode = notesMode ? 'notes' : 'normal';
    const res = await processClusterOCR(cluster, { forceRefresh: true, mode: currentMode, preferType: 'TEXT' });

    setClusters((prev) =>
      prev.map((c) => {
        if (c.clusterId !== cluster.clusterId) return c;
        if (!res || !res.detectedText) {
          return { ...c, ocrStatus: 'recognized', detectedText: previousText };
        }
        return {
          ...c,
          detectedText: res.detectedText,
          isMath: false,
          evaluatedResult: null,
          confidence: res.confidence || 0,
          ocrStatus: 'recognized',
          ocrError: null,
          shouldConvert: res.shouldConvert !== undefined ? res.shouldConvert : true,
          action: res.action || 'convert_text',
          type: res.type || 'TEXT',
          alternatives: res.alternatives,
          confidenceDetails: res.confidenceDetails,
          mathsSkipped: true,
        };
      })
    );

    if (res && !res.isMath && res.detectedText) {
      recordUserCorrection({
        sourceStrokeIds: cluster.strokeIds || [],
        strokes: cluster.strokes,
        predictedValue: previousText,
        userCorrectedValue: res.detectedText,
        assignedType: 'TEXT',
        confidence: res.confidenceDetails || {},
      }).catch(() => {});
    }
  }, [notesMode]);

  // Unified Block Content Update Handler with Reactive Link Propagation
  const handleUpdateBlockContent = useCallback((blockId, content) => {
    dispatch({ type: 'UPDATE_BLOCK_CONTENT', payload: { blockId, content } });

    // If an equation block updates its LaTeX formula, reactively update any linked graph blocks
    if (content && content.latex !== undefined) {
      const currentBlocks = blockStateRef.current.blocks;
      const currentLinks = blockStateRef.current.links;

      const linkedGraphIds = currentLinks
        .filter((l) => l.sourceBlockId === blockId || l.targetBlockId === blockId)
        .map((l) => (l.sourceBlockId === blockId ? l.targetBlockId : l.sourceBlockId))
        .filter((otherId) => {
          const otherBlock = currentBlocks.find((b) => b.blockId === otherId);
          return otherBlock && otherBlock.type === 'graph';
        });

      // Only this equation's curve is replaced: other curves on the graph are kept
      linkedGraphIds.forEach((graphId) => {
        const graphBlock = currentBlocks.find((b) => b.blockId === graphId);
        const datasets = upsertCurveForSource(graphBlock?.content?.graphData?.datasets, blockId, content.latex);
        if (datasets) {
          dispatch({
            type: 'UPDATE_BLOCK_CONTENT',
            payload: {
              blockId: graphId,
              content: {
                graphData: { datasets },
              },
            },
          });
        }
      });
    }
  }, []);

  // Spawn New Smart Block with Compact Type-Specific Dimensions.
  // content: starting content (Insert > Equation passes the LaTeX and display style)
  const handleAddBlock = (type, content = null) => {
    if (type === 'graph') recordActivity('playground.block', { type: 'graph' });
    const newBlockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    // Each new block lands a little down and to the right of the last, so they do not stack
    const cascade = (blockStateRef.current.blocks.length % 6) * 28;

    // Clamp block width so new blocks are never wider than the visible screen minus margin
    const screenMargin = 32;
    const maxVisibleWidth = Math.max(260, Math.floor((dimensions.width - screenMargin) / zoomLevel));

    let defaultContent = {};
    let defaultSize = { width: Math.min(360, maxVisibleWidth), height: 140 };

    if (type === 'equation') {
      defaultContent = { latex: '', ...(content || {}) };
      // A finished equation (Common Equations, LaTeX) gets room for its full width
      defaultSize = { width: Math.min(defaultContent.latex ? 520 : 400, maxVisibleWidth), height: 140 };
    } else if (type === 'graph') {
      const graphDataset = generateGraphDatasetFromLatex('y = x^2 - 4x + 3', 'f(x) = x² - 4x + 3', [-10, 10], 0);
      defaultContent = {
        graphData: {
          datasets: graphDataset ? [graphDataset] : [],
        },
      };
      defaultSize = { width: Math.min(440, maxVisibleWidth), height: 320 };
    } else if (type === 'theory') {
      defaultContent = { text: '' };
      defaultSize = { width: Math.min(380, maxVisibleWidth), height: 220 };
    }

    // Place inside visible screen boundaries
    const rawX = Math.round((-panOffset.x + (dimensions.width - defaultSize.width * zoomLevel) / 2) / zoomLevel) + cascade;
    const rawY = Math.round((-panOffset.y + (dimensions.height - defaultSize.height * zoomLevel) / 2) / zoomLevel) + cascade;

    const minX = Math.round((-panOffset.x + 16) / zoomLevel);
    const maxX = Math.round((-panOffset.x + dimensions.width - 16) / zoomLevel - defaultSize.width);
    const minY = Math.round((-panOffset.y + 60) / zoomLevel);
    const maxY = Math.round((-panOffset.y + dimensions.height - 80) / zoomLevel - defaultSize.height);

    const spawnX = maxX >= minX ? Math.max(minX, Math.min(maxX, rawX)) : minX;
    const spawnY = maxY >= minY ? Math.max(minY, Math.min(maxY, rawY)) : minY;

    const newBlock = {
      blockId: newBlockId,
      type,
      content: defaultContent,
      linkedBlockIds: [],
      position: { x: spawnX, y: spawnY },
      size: defaultSize,
      status: 'active',
      isMinimal: false,
    };

    dispatch({ type: 'ADD_BLOCK', payload: newBlock });
    // New empty equation and text blocks open in edit mode, with the cursor in them
    if ((type === 'equation' && !defaultContent.latex) || type === 'theory') setAutoEditBlockId(newBlockId);
  };

  // Send to Notes: a new note made from the chosen blocks, written where the Notes workspace reads.
  // Returns { ok: true, noteId } or { ok: false, reason } so the dialog can say what happened.
  const handleSendToNotes = (payload) => {
    try {
      const rawV2 = localStorage.getItem('netz_notes_v2_data');
      const existingV2 = rawV2 ? JSON.parse(rawV2) : [];
      const existingNotes = JSON.parse(localStorage.getItem('netz_notes') || '[]');
      const now = new Date().toISOString();
      const newNote = {
        id: `note_${Date.now()}`,
        title: payload.title || 'Playground notes',
        subtitle: 'Sent from the Playground',
        tags: ['Playground'],
        createdAt: now,
        updatedAt: now,
        isPublic: false,
        accessKey: `NETZ-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        author: 'Student',
        blocks: payload.blocks.map((b, idx) => ({
          id: b.id || `b-${Date.now()}-${idx}`,
          type: b.type === 'math' ? 'math' : 'paragraph',
          content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
        })),
      };
      existingNotes.unshift(newNote);
      existingV2.unshift(newNote);
      localStorage.setItem('netz_notes', JSON.stringify(existingNotes));
      localStorage.setItem('netz_notes_v2_data', JSON.stringify(existingV2));
      return { ok: true, noteId: newNote.id };
    } catch (err) {
      console.error('Failed to send to Notes:', err);
      const full = err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014);
      return { ok: false, reason: full ? "Your browser's storage is full." : 'The note could not be saved on this device.' };
    }
  };

  // Focus music (the lo-fi player): closed until opened from a menu. While it plays, a pause
  // button sits in the top-right bar (laptops, tablets) or the status area (phones).
  const [musicOpen, setMusicOpen] = useState(false);
  const musicRef = useRef(null);
  const [music, setMusic] = useState({ playing: false, title: '' });
  const handleMusicPlaying = useCallback((playing, title) => setMusic({ playing, title }), []);

  // Preferences (opened from the page menu) and whether the dock has folded Move page into it
  const [showPreferences, setShowPreferences] = useState(false);
  const [moveFolded, setMoveFolded] = useState(false);

  // When a voice memo started recording (the status area shows the time)
  const [recordingSince, setRecordingSince] = useState(null);

  // Deleting a block is one tap; the notice offers Undo (blocks are on the undo history)
  const handleDeleteBlock = (blockId) => {
    const block = blockStateRef.current.blocks.find((b) => b.blockId === blockId);
    dispatch({ type: 'REMOVE_BLOCK', payload: blockId });
    if (block) showNotice(`${blockLabel(block.type)} deleted`, { action: { label: UI.undo, onClick: () => handleUndoRef.current() } });
  };

  // Insert > Equation: a new equation (empty, ready to edit) or a finished one, full-size as in WPS
  const handleInsertEquation = (latex = '') => handleAddBlock('equation', { latex, display: true });

  // Handle Image Insertion onto Canvas
  // Large photos are scaled down first (they are stored inside the session), and the block
  // takes the picture's own proportions.
  const handleInsertImage = async (dataUrl) => {
    if (!dataUrl) return;

    let image;
    try {
      image = await prepareImage(dataUrl);
    } catch (err) {
      showNotice('That picture could not be read.');
      return;
    }

    const size = fitImageBox(image.width, image.height);
    const view = viewportRef.current;
    const cascade = (blockStateRef.current.blocks.length % 6) * 28;
    const spawnX = Math.round((-view.pan.x + window.innerWidth / 2) / view.zoom - size.width / 2) + cascade;
    const spawnY = Math.round((-view.pan.y + window.innerHeight / 2) / view.zoom - size.height / 2) + cascade;

    const imageBlockId = `block_img_${Date.now()}`;
    const imageBlock = {
      blockId: imageBlockId,
      type: 'image',
      content: {
        imageUrl: image.dataUrl,
        caption: '',
        aspectRatio: image.aspectRatio,
      },
      linkedBlockIds: [],
      position: { x: spawnX, y: spawnY },
      size,
      status: 'active',
      isMinimal: false,
    };

    dispatch({ type: 'ADD_BLOCK', payload: imageBlock });
  };

  // Insert > Table: a table block in the middle of the view, ready to type in
  const handleInsertTable = (rows, cols, header = true) => {
    const table = newTable(rows, cols, header);
    const width = Math.min(720, Math.max(320, cols * 120));
    // The rows; while it is being edited the block grows to fit the table's tool bar too
    const height = Math.min(720, 24 + rows * 44);
    const view = viewportRef.current;
    const spawnX = Math.round((-view.pan.x + window.innerWidth / 2) / view.zoom - width / 2);
    const spawnY = Math.round((-view.pan.y + window.innerHeight / 2) / view.zoom - height / 2);
    const blockId = `block_table_${Date.now()}`;
    dispatch({
      type: 'ADD_BLOCK',
      payload: {
        blockId,
        type: 'table',
        content: { table },
        linkedBlockIds: [],
        position: { x: spawnX, y: spawnY },
        size: { width, height },
        status: 'active',
        isMinimal: false,
      },
    });
    setAutoEditBlockId(blockId);
  };

  // Handle Voice Memo Recording Toggle
  const handleToggleRecordAudio = async () => {
    if (isRecordingAudio) {
      try {
        const audioResult = await stopAudioRecording();
        setIsRecordingAudio(false);
        setRecordingSince(null);

        if (audioResult && audioResult.dataUrl) {
          const spawnX = Math.round((-panOffset.x + dimensions.width / 2 - 160) / zoomLevel);
          const spawnY = Math.round((-panOffset.y + dimensions.height / 2 - 60) / zoomLevel);

          const audioBlockId = `block_audio_${Date.now()}`;
          const audioBlock = {
            blockId: audioBlockId,
            type: 'audio',
            content: {
              audioUrl: audioResult.dataUrl,
              durationSec: Math.round(audioResult.durationMs / 1000),
              title: `Voice memo (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            },
            linkedBlockIds: [],
            position: { x: spawnX, y: spawnY },
            size: { width: 360, height: 104 },
            status: 'active',
            isMinimal: false,
          };

          dispatch({ type: 'ADD_BLOCK', payload: audioBlock });
        }
      } catch (err) {
        console.error('Failed to stop audio recording:', err);
        setIsRecordingAudio(false);
        setRecordingSince(null);
      }
    } else {
      try {
        await startAudioRecording();
        setIsRecordingAudio(true);
        setRecordingSince(Date.now());
      } catch (err) {
        showNotice(err.message || 'Microphone access is required for audio recording.', 5000);
        setIsRecordingAudio(false);
      }
    }
  };

  // Ctrl+S and Retry: save now (the status chip in the top bar shows the result)
  const handleManualSave = () => {
    persistSession();
    setIsSavedToastVisible(true);
    setTimeout(() => setIsSavedToastVisible(false), 1500);
  };

  // "Try again" in the leave prompt: once that save lands, leave as asked
  const [retryLeaving, setRetryLeaving] = useState(false);
  useEffect(() => {
    if (!retryLeaving || saveStatus === 'saving') return;
    setRetryLeaving(false);
    if (saveStatus === 'saved') {
      setIsUnsavedModalOpen(false);
      if (pendingTargetUrl) router.push(pendingTargetUrl);
      setPendingTargetUrl(null);
    }
  }, [retryLeaving, saveStatus, pendingTargetUrl, router]);

  // Helper to synchronize active page strokes and blocks before page transitions
  const getSyncedPagesState = () => {
    const currentStrokes = whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : [];
    return pagesRef.current.map((p, idx) => {
      if (idx === currentPageIndexRef.current) {
        return {
          ...p,
          strokes: currentStrokes,
          blocks: blockStateRef.current.blocks,
          links: blockStateRef.current.links,
          shapes: latestShapesRef.current,
        };
      }
      return p;
    });
  };

  // Undo history per page: the open page's stack is historyRef; the stacks of the pages visited
  // most recently wait here, keyed by page id (older pages start a fresh history when reopened).
  const pageHistoriesRef = useRef(new Map());

  // Makes targetPage's history the active one (keeping fromPageId's, unless it is gone) and returns
  // the state to show. A kept history brings back the exact snapshot it was left at, so the
  // stroke and block arrays are the very ones on its stack and no false undo step appears.
  const activatePageHistory = useCallback((fromPageId, targetPage) => {
    const kept = pageHistoriesRef.current;
    if (fromPageId) {
      kept.delete(fromPageId);
      kept.set(fromPageId, historyRef.current);
      while (kept.size > MAX_KEPT_PAGE_HISTORIES) kept.delete(kept.keys().next().value);
    }
    const existing = kept.get(targetPage.id);
    let snapshot;
    if (existing) {
      kept.delete(targetPage.id);
      historyRef.current = existing;
      snapshot = existing.current();
    } else {
      snapshot = {
        strokes: targetPage.strokes || [],
        blocks: targetPage.blocks || [],
        links: targetPage.links || [],
        shapes: targetPage.shapes || [],
      };
      historyRef.current = createHistoryStack(100);
      historyRef.current.reset(snapshot);
    }
    latestStrokesRef.current = snapshot.strokes;
    setInkCount((snapshot.strokes || []).length);
    syncHistoryFlags();
    return snapshot;
  }, [syncHistoryFlags]);

  // Shows a page's content (ink, blocks, links, shapes) on the canvas
  const showPageContent = (snapshot) => {
    dispatch({ type: 'SET_SESSION', payload: { blocks: snapshot.blocks, links: snapshot.links } });
    blockStateRef.current = { ...blockStateRef.current, blocks: snapshot.blocks, links: snapshot.links };
    applyShapes(snapshot.shapes || []);
    if (whiteboardCanvasRef.current) {
      // loadStrokes, not clearStrokes: showing a page is not an edit to it
      whiteboardCanvasRef.current.loadStrokes(snapshot.strokes);
    }
    previousStrokeCountRef.current = snapshot.strokes.length;
    // Readings belong to the page that was open
    if (ocrDebounceTimerRef.current) clearTimeout(ocrDebounceTimerRef.current);
    ocrPassRef.current++;
    setClusters([]);
    setSelectedClusterId(null);
  };

  // Opens nextPages[newIdx] (pages already updated by the caller) and saves
  const openPage = (nextPages, newIdx, fromPageId) => {
    const target = nextPages[newIdx];
    const snapshot = activatePageHistory(fromPageId, target);
    const finalPages = nextPages.map((p, idx) =>
      idx === newIdx ? { ...p, strokes: snapshot.strokes, blocks: snapshot.blocks, links: snapshot.links, shapes: snapshot.shapes || [] } : p
    );
    setPages(finalPages);
    pagesRef.current = finalPages;
    setCurrentPageIndex(newIdx);
    currentPageIndexRef.current = newIdx;
    showPageContent(snapshot);
    persistSession(finalPages, newIdx, snapshot.blocks, snapshot.links);
  };

  // "Page N" for a new page: one more than the highest number in use, so names never repeat
  const nextPageTitle = (list) => {
    let highest = list.length;
    list.forEach((p) => {
      const match = /^Page (\d+)$/.exec(p.title || '');
      if (match) highest = Math.max(highest, Number(match[1]));
    });
    return `Page ${highest + 1}`;
  };

  // Multi-Page Actions
  const handleSelectPage = (newIdx) => {
    if (newIdx === currentPageIndexRef.current || newIdx < 0 || newIdx >= pagesRef.current.length) return;
    commitHistory(); // an edit still settling belongs to the page being left
    const fromPageId = pagesRef.current[currentPageIndexRef.current]?.id;
    openPage(getSyncedPagesState(), newIdx, fromPageId);
  };

  const handleAddPage = () => {
    commitHistory();
    const synced = getSyncedPagesState();
    const fromPageId = synced[currentPageIndexRef.current]?.id;
    const newPage = {
      id: `page_${Date.now()}`,
      title: nextPageTitle(synced),
      strokes: [],
      blocks: [],
      links: [],
      shapes: [],
    };
    const nextPages = [...synced, newPage];
    openPage(nextPages, nextPages.length - 1, fromPageId);
  };

  const handleClearPage = () => {
    // Clearing is one undoable step: the ink and the blocks go together
    holdStrokeCommitRef.current = true;
    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.clearStrokes();
    }
    holdStrokeCommitRef.current = false;
    dispatch({ type: 'SET_SESSION', payload: { blocks: [], links: [] } });
    applyShapes([]);

    const synced = getSyncedPagesState();
    synced[currentPageIndexRef.current].strokes = [];
    synced[currentPageIndexRef.current].blocks = [];
    synced[currentPageIndexRef.current].links = [];
    synced[currentPageIndexRef.current].shapes = [];

    setPages(synced);
    pagesRef.current = synced;

    persistSession(synced, currentPageIndexRef.current, [], []);
    showNotice('Page cleared', { action: { label: UI.undo, onClick: () => handleUndoRef.current() } });
  };

  // The page sheet (all pages) is open
  const [pageSheetOpen, setPageSheetOpen] = useState(false);

  // The page deleted last, with its place and its undo history, until Undo or the next delete
  const deletedPageRef = useRef(null);

  const handleDeletePage = (delIdx) => {
    if (pagesRef.current.length <= 1) return;
    commitHistory();
    const synced = getSyncedPagesState();
    const deleted = synced[delIdx];
    const wasOpen = delIdx === currentPageIndexRef.current;
    deletedPageRef.current = {
      page: deleted,
      index: delIdx,
      history: wasOpen ? historyRef.current : pageHistoriesRef.current.get(deleted.id) || null,
    };
    pageHistoriesRef.current.delete(deleted.id);

    const remaining = synced.filter((_, idx) => idx !== delIdx);
    if (wasOpen) {
      openPage(remaining, Math.min(delIdx, remaining.length - 1), null);
    } else {
      const newIdx = currentPageIndexRef.current > delIdx ? currentPageIndexRef.current - 1 : currentPageIndexRef.current;
      setPages(remaining);
      pagesRef.current = remaining;
      setCurrentPageIndex(newIdx);
      currentPageIndexRef.current = newIdx;
      persistSession(remaining, newIdx);
    }
    showNotice(`${deleted.title || 'Page'} deleted`, { action: { label: UI.undo, onClick: () => handleRestoreDeletedPage() } });
  };

  // Undo for Delete page: the page comes back in its place, with its history, and opens
  const handleRestoreDeletedPage = () => {
    const deleted = deletedPageRef.current;
    if (!deleted) return;
    deletedPageRef.current = null;
    commitHistory();
    const synced = getSyncedPagesState();
    const fromPageId = synced[currentPageIndexRef.current]?.id;
    const index = Math.min(deleted.index, synced.length);
    const nextPages = [...synced.slice(0, index), deleted.page, ...synced.slice(index)];
    if (deleted.history) pageHistoriesRef.current.set(deleted.page.id, deleted.history);
    openPage(nextPages, index, fromPageId);
  };

  const handleDuplicatePage = (dupIdx) => {
    commitHistory();
    const synced = getSyncedPagesState();
    const srcPage = synced[dupIdx];
    const fromPageId = synced[currentPageIndexRef.current]?.id;

    const dupPage = {
      id: `page_${Date.now()}`,
      title: `${srcPage.title} (Copy)`,
      strokes: JSON.parse(JSON.stringify(srcPage.strokes || [])),
      blocks: JSON.parse(JSON.stringify(srcPage.blocks || [])),
      links: JSON.parse(JSON.stringify(srcPage.links || [])),
      shapes: JSON.parse(JSON.stringify(srcPage.shapes || [])),
    };

    const nextPages = [...synced.slice(0, dupIdx + 1), dupPage, ...synced.slice(dupIdx + 1)];
    openPage(nextPages, dupIdx + 1, fromPageId);
  };

  // Page sheet: rename a page
  const handleRenamePage = (idx, title) => {
    const clean = String(title || '').trim().slice(0, 60);
    if (!clean) return;
    const synced = getSyncedPagesState();
    if (!synced[idx] || synced[idx].title === clean) return;
    synced[idx] = { ...synced[idx], title: clean };
    setPages(synced);
    pagesRef.current = synced;
    persistSession(synced, currentPageIndexRef.current);
  };

  // Page sheet: move a page from one place to another; the open page stays open
  const handleMovePage = (fromIdx, toIdx) => {
    const synced = getSyncedPagesState();
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= synced.length || toIdx >= synced.length) return;
    const openId = synced[currentPageIndexRef.current]?.id;
    const moved = [...synced];
    const [page] = moved.splice(fromIdx, 1);
    moved.splice(toIdx, 0, page);
    const newIdx = Math.max(0, moved.findIndex((p) => p.id === openId));
    setPages(moved);
    pagesRef.current = moved;
    setCurrentPageIndex(newIdx);
    currentPageIndexRef.current = newIdx;
    persistSession(moved, newIdx);
  };

  // Plot Graph from Equation Block (Reuses or Appends if Already Linked)
  const handlePlotGraph = (equationBlock, latexStr) => {
    const currentBlocks = blockStateRef.current.blocks;
    const currentLinks = blockStateRef.current.links;

    const existingLinkedGraph = currentLinks
      .filter((l) => l.sourceBlockId === equationBlock.blockId || l.targetBlockId === equationBlock.blockId)
      .map((l) => (l.sourceBlockId === equationBlock.blockId ? l.targetBlockId : l.sourceBlockId))
      .map((id) => currentBlocks.find((b) => b && b.blockId === id && b.type === 'graph'))
      .find(Boolean);

    if (existingLinkedGraph) {
      // Only this equation's curve is replaced: other curves on the graph are kept
      const datasets = upsertCurveForSource(existingLinkedGraph.content?.graphData?.datasets, equationBlock.blockId, latexStr);
      if (datasets) {
        dispatch({
          type: 'UPDATE_BLOCK_CONTENT',
          payload: {
            blockId: existingLinkedGraph.blockId,
            content: {
              graphData: { datasets },
            },
          },
        });
      }
      return;
    }

    // New graph: its first curve is tagged with the equation it follows
    const firstCurve = upsertCurveForSource([], equationBlock.blockId, latexStr);

    const graphBlockId = `block_graph_${Date.now()}`;
    const graphBlock = {
      blockId: graphBlockId,
      type: 'graph',
      content: {
        graphData: {
          datasets: firstCurve || [],
        },
      },
      linkedBlockIds: [equationBlock.blockId],
      position: {
        x: equationBlock.position.x + 400,
        y: equationBlock.position.y,
      },
      size: { width: 440, height: 320 },
      status: 'active',
      isMinimal: false,
    };

    dispatch({ type: 'ADD_BLOCK', payload: graphBlock });
    recordActivity('playground.block', { type: 'graph' });
    dispatch({
      type: 'LINK_BLOCKS',
      payload: { sourceBlockId: equationBlock.blockId, targetBlockId: graphBlockId },
    });
  };

  // Handle Contextual CAS AI Actions
  // exampleLatex: an example picked in the menu goes into the equation first, then the action runs on it
  const plotGraphStable = useStableCallback(handlePlotGraph);

  const handleSelectAiAction = (block, actionKey, exampleLatex) => {
    if (exampleLatex) {
      dispatch({ type: 'UPDATE_BLOCK_CONTENT', payload: { blockId: block.blockId, content: { latex: exampleLatex } } });
    }
    const latexStr = exampleLatex || block.content?.latex || 'x^2 - 4';

    if (actionKey === 'PLOT_GRAPH') {
      handlePlotGraph(block, latexStr);
    } else if (actionKey === 'DIFFERENTIATE') {
      const derivLatex = differentiateExpression(latexStr, 'x');
      const derivBlockId = `block_deriv_${Date.now()}`;
      const derivBlock = {
        blockId: derivBlockId,
        type: 'equation',
        content: { latex: derivLatex },
        linkedBlockIds: [block.blockId],
        position: { x: block.position.x + 390, y: block.position.y },
        size: { width: 360, height: 140 },
        status: 'active',
        isMinimal: false,
      };
      dispatch({ type: 'ADD_BLOCK', payload: derivBlock });
      dispatch({ type: 'LINK_BLOCKS', payload: { sourceBlockId: block.blockId, targetBlockId: derivBlockId } });
    } else if (actionKey === 'INTEGRATE') {
      const integLatex = integrateExpression(latexStr, 'x');
      const integBlockId = `block_integ_${Date.now()}`;
      const integBlock = {
        blockId: integBlockId,
        type: 'equation',
        content: { latex: integLatex },
        linkedBlockIds: [block.blockId],
        position: { x: block.position.x + 390, y: block.position.y + 110 },
        size: { width: 360, height: 140 },
        status: 'active',
        isMinimal: false,
      };
      dispatch({ type: 'ADD_BLOCK', payload: integBlock });
      dispatch({ type: 'LINK_BLOCKS', payload: { sourceBlockId: block.blockId, targetBlockId: integBlockId } });
    } else if (actionKey === 'FIND_ROOTS') {
      const roots = solveRootsExpression(latexStr, 'x');
      const rootsFormatted = roots.length > 0
        ? roots.map((r) => formatRawMathToTeX(r)).join(', ')
        : '';
      const rootsText = roots.length > 0
        ? `Roots of $${latexStr}$: $x = ${rootsFormatted}$`
        : `No real roots found for $${latexStr}$.`;

      const rootsBlockId = `block_roots_${Date.now()}`;
      const rootsBlock = {
        blockId: rootsBlockId,
        type: 'theory',
        content: { text: rootsText },
        linkedBlockIds: [block.blockId],
        position: { x: block.position.x + 390, y: block.position.y },
        size: { width: 380, height: 160 },
        status: 'active',
        isMinimal: false,
      };
      dispatch({ type: 'ADD_BLOCK', payload: rootsBlock });
      dispatch({ type: 'LINK_BLOCKS', payload: { sourceBlockId: block.blockId, targetBlockId: rootsBlockId } });
    }
  };

  // Export Canvas Handler
  // Exports the whole current page from its data (not a screenshot of the screen)
  const handleExportCanvas = async (format) => {
    if (!containerRef.current) return;
    // SVG is a Pro export; Free PDFs carry a small NETZ mark (NETZ_LAUNCH_PLAN.md 5.1)
    const pro = isProOnDevice();
    if ((format === 'SVG' || format === 'TEX') && !pro) {
      showNotice(`${format === 'TEX' ? 'LaTeX' : 'SVG'} export comes with NETZ Pro. PNG and PDF are free.`);
      return;
    }
    const pageTitle = pagesRef.current[currentPageIndexRef.current]?.title || 'page';
    if (format === 'TEX') {
      // LaTeX is written from the blocks (typed maths, text, tables). Handwriting and drawings
      // come along as one picture: then the download is a .zip with the .tex and images/.
      const strokes = whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : [];
      const inkPng = strokes.length || latestShapesRef.current.length ? await renderInkOnly({ strokes, shapes: latestShapesRef.current }) : null;
      const inkImage = inkPng ? 'images/handwriting.png' : null;
      const { tex, filename } = pageToTex({ title: pageTitle, blocks: blockStateRef.current.blocks, strokeCount: strokes.length, inkImage });
      if (inkPng) {
        const { makeZip, dataUrlBytes } = await import('@/app/utils/zip');
        const zip = makeZip([{ name: filename, data: tex }, { name: inkImage, data: dataUrlBytes(inkPng).bytes }]);
        const zipName = filename.replace(/\.tex$/, '.zip');
        downloadText(new Blob([zip], { type: 'application/zip' }), zipName, 'application/zip');
        showNotice(`Saved ${zipName} (the .tex and a picture of the handwriting)`);
      } else {
        downloadText(tex, filename, 'application/x-tex');
        showNotice(`Saved ${filename}`);
      }
      recordActivity('page.exported', { format });
      return;
    }
    if (format === 'NETZ') {
      // The whole notebook, every page fully editable (NETZ Pro)
      if (!pro) {
        showNotice('NETZ files come with NETZ Pro. PNG and PDF are free.');
        return;
      }
      const { buildNetzFile, netzFileName } = await import('@/app/utils/netzFile');
      const pagesNow = getSyncedPagesState();
      const title = boardTitle(pagesNow);
      const text = buildNetzFile({ kind: 'document', document: { title, pages: pagesNow.map(({ id, title: t, strokes, blocks, links, shapes }) => ({ id, title: t, strokes, blocks, links, shapes })) } });
      const name = netzFileName(title, 'board');
      downloadText(new Blob([text], { type: 'application/json' }), name, 'application/json');
      showNotice(`Saved ${name} (${pagesNow.length} page${pagesNow.length === 1 ? '' : 's'})`);
      recordActivity('page.exported', { format });
      return;
    }
    if (format === 'HTML') {
      // A web page: the page as a picture (ink as vectors), then its typed text and maths as text
      const isDarkNow = document.documentElement.classList.contains('dark');
      const svg = await pageToSvgString({
        strokes: whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : [],
        blocks: blockStateRef.current.blocks,
        shapes: latestShapesRef.current,
        darkPage: isDarkNow,
        containerElement: containerRef.current,
        background: '#FFFFFF',
      });
      if (!svg) {
        showNotice('There is nothing on this page to export yet.');
        return;
      }
      const { pageToHtml } = await import('../utils/pageHtml');
      const html = pageToHtml({ title: pageTitle, svg, blocks: blockStateRef.current.blocks });
      const name = `netz-${pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'}.html`;
      downloadText(new Blob([html], { type: 'text/html' }), name, 'text/html');
      showNotice(`Saved ${name}`);
      recordActivity('page.exported', { format });
      return;
    }
    const isDark = document.documentElement.classList.contains('dark');
    showNotice(`Preparing ${format}...`, 60000);
    const result = await exportPage(format, {
      strokes: whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : [],
      blocks: blockStateRef.current.blocks,
      shapes: latestShapesRef.current,
      darkPage: isDark,
      containerElement: containerRef.current,
      fileBaseName: `netz-${pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'}`,
      background: isDark ? '#09090B' : '#FFFFFF',
      mark: !pro,
    });
    if (result.ok) {
      showNotice(`Saved ${result.fileName}`);
      recordActivity('page.exported', { format });
    } else if (result.reason === 'empty') {
      showNotice('There is nothing on this page to export yet.');
    } else {
      showNotice('The export failed. Please try again.');
    }
  };

  // ── Notes Studio (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, steps 2b and 3) ──────────────
  // Each page remembers the library board it belongs to (page.boardId). Save to Notes Studio
  // saves the open page's board: every page with the same boardId (pages with none form the
  // notebook's own board, which gets an id on its first save).

  // A .netz file waiting for "As new pages" or "Onto this page"
  const [insertChoice, setInsertChoice] = useState(null);

  const currentPagePreview = async () => {
    const isDarkNow = document.documentElement.classList.contains('dark');
    const canvas = await renderPagePreview({
      strokes: whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : latestStrokesRef.current,
      blocks: blockStateRef.current.blocks,
      shapes: latestShapesRef.current,
      darkPage: isDarkNow,
      containerElement: containerRef.current,
      background: isDarkNow ? '#09090B' : '#FFFFFF',
    });
    if (!canvas) return null;
    return new Promise((resolve) => canvas.toBlob((b) => (b ? resolve(b) : canvas.toBlob(resolve, 'image/jpeg', 0.85)), 'image/webp', 0.8));
  };

  const handleSaveToStudio = async ({ asNew = false } = {}) => {
    const synced = getSyncedPagesState();
    const openBoardId = synced[currentPageIndexRef.current]?.boardId || null;
    const inBoard = (p) => (p.boardId || null) === openBoardId;
    const group = synced.filter(inBoard);
    if (!group.some((p) => (p.strokes || []).length || (p.blocks || []).length || (p.shapes || []).length)) {
      showNotice('There is nothing on this board to save yet.');
      return;
    }
    showNotice('Saving to Notes Studio…', 30000);
    try {
      const { saveBoardAsset, getAsset } = await import('../../Notes/utils/assetStore');
      const existing = !asNew && openBoardId ? await getAsset(openBoardId) : null;
      const previewBlob = await currentPagePreview();
      const record = await saveBoardAsset({
        title: existing?.title || boardTitle(group),
        pages: group.map(({ id, title, strokes, blocks, links, shapes }) => ({ id, title, strokes, blocks, links, shapes })),
        previewBlob,
        assetId: existing ? existing.id : null,
      });
      const stamped = synced.map((p) => (inBoard(p) ? { ...p, boardId: record.id } : p));
      setPages(stamped);
      pagesRef.current = stamped;
      persistSession(stamped, currentPageIndexRef.current);
      showNotice(existing ? `Updated “${record.title}” in Notes Studio` : `Saved “${record.title}” to Notes Studio`, {
        action: { label: 'Open in Notes', onClick: () => router.push('/Notes?assets=1') },
      });
    } catch (err) {
      showNotice(err?.message || 'The board could not be saved to Notes Studio.');
    }
  };

  // Adds pages after the open ones and opens the first of them
  const appendPages = (newPages) => {
    if (!newPages.length) return;
    const synced = getSyncedPagesState();
    const fromPageId = synced[currentPageIndexRef.current]?.id;
    openPage([...synced, ...newPages], synced.length, fromPageId);
  };

  // Puts content below what is already on the open page: one undo step
  const placeOntoThisPage = (content) => {
    const strokesNow = whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : latestStrokesRef.current;
    const here = { strokes: strokesNow, blocks: blockStateRef.current.blocks, shapes: latestShapesRef.current };
    const hasContent = strokesNow.length || here.blocks.length || here.shapes.length;
    const anchor = pageTopLeft(here) || { x: 80, y: 80 };
    const corner = pageTopLeft(content) || { x: 0, y: 0 };
    const top = hasContent ? pageBottom(here) + 96 : anchor.y;
    const moved = offsetPage(content, anchor.x - corner.x, top - corner.y);
    const strokes = [...strokesNow, ...(moved.strokes || [])];
    const blocks = [...here.blocks, ...(moved.blocks || [])];
    const links = [...blockStateRef.current.links, ...(moved.links || [])];
    latestStrokesRef.current = strokes;
    setInkCount(strokes.length);
    whiteboardCanvasRef.current?.loadStrokes(strokes);
    dispatch({ type: 'SET_SESSION', payload: { blocks, links } });
    blockStateRef.current = { ...blockStateRef.current, blocks, links };
    applyShapes([...here.shapes, ...(moved.shapes || [])]);
    commitHistory();
    scheduleSave();
    setTimeout(() => handleFitToContentRef.current?.(), 60);
  };

  // Insert from file: a .netz board or note someone gave you
  const handleInsertFromFile = async () => {
    const { pickNetzFile } = await import('@/app/utils/netzFile');
    const result = await pickNetzFile();
    if (!result) return;
    if (!result.ok) {
      showNotice(result.error);
      return;
    }
    setInsertChoice(result);
  };

  const finishInsert = (where) => {
    const result = insertChoice;
    setInsertChoice(null);
    if (!result) return;
    const label = (result.fileName || 'file').replace(/\.netz$/i, '');
    const pagesIn =
      result.kind === 'document'
        ? freshPages(result.document.pages)
        : freshPages([{ title: result.note.title || label, strokes: [], links: [], shapes: [], blocks: noteBlocksToCanvas(result.note.blocks) }]);
    if (where === 'new') {
      appendPages(pagesIn);
      showNotice(`Added ${pagesIn.length} page${pagesIn.length === 1 ? '' : 's'} from ${label}`);
    } else {
      // Every page of the file, one under the other, below what is on this page
      let stacked = { strokes: [], blocks: [], links: [], shapes: [] };
      pagesIn.forEach((pg) => {
        const corner = pageTopLeft(pg);
        if (!corner) return;
        const top = stacked.strokes.length || stacked.blocks.length || stacked.shapes.length ? pageBottom(stacked) + 96 : 0;
        const m = offsetPage(pg, -corner.x, top - corner.y);
        stacked = {
          strokes: [...stacked.strokes, ...m.strokes],
          blocks: [...stacked.blocks, ...m.blocks],
          links: [...stacked.links, ...(m.links || [])],
          shapes: [...stacked.shapes, ...m.shapes],
        };
      });
      placeOntoThisPage(stacked);
      showNotice(`Put ${label} on this page`, { action: { label: UI.undo, onClick: () => handleUndoRef.current() } });
    }
  };

  // ?asset=<id>: a board from the Notes Studio library opens here (Open in Playground)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const assetId = new URLSearchParams(window.location.search).get('asset');
    if (!assetId) return undefined;
    let cancelled = false;
    let tries = 0;
    const go = async () => {
      if (cancelled) return;
      if (!isSessionLoadedRef.current) {
        if (tries++ < 80) setTimeout(go, 100);
        return;
      }
      // The address loses ?asset= (a reload must not open the board again); no navigation
      window.history.replaceState(window.history.state, '', window.location.pathname);
      const { readBoardPages, getAsset } = await import('../../Notes/utils/assetStore');
      const [data, record] = await Promise.all([readBoardPages(assetId), getAsset(assetId)]);
      if (cancelled) return;
      if (!data) {
        showNotice('That board is not on this device. Sign in to get it from your account.');
        return;
      }
      const synced = getSyncedPagesState();
      const already = synced.findIndex((p) => p.boardId === assetId);
      if (already >= 0) {
        // Its pages are here already (with any changes made since): open them
        if (already !== currentPageIndexRef.current) openPage(synced, already, synced[currentPageIndexRef.current]?.id);
        showNotice(`“${record?.title || 'Board'}” is open`);
        return;
      }
      const added = freshPages(data.pages).map((p) => ({ ...p, boardId: assetId }));
      appendPages(added);
      showNotice(`Opened “${record?.title || 'Board'}”: ${added.length} page${added.length === 1 ? '' : 's'}. Save to Notes Studio updates it.`, 6000);
    };
    go();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zoom Handlers: zoom keeps the point under the anchor still, so content does not slide away.
  // The refs hold the latest viewport so several wheel events inside one frame build on each other.
  const viewportRef = useRef({ zoom: zoomLevel, pan: panOffset });
  useEffect(() => {
    viewportRef.current = { zoom: zoomLevel, pan: panOffset };
  }, [zoomLevel, panOffset]);

  const zoomTo = useCallback((targetZoom, anchor) => {
    const next = zoomAtPoint(viewportRef.current.pan, viewportRef.current.zoom, targetZoom, anchor);
    viewportRef.current = next;
    setZoomLevel(next.zoom);
    setPanOffset(next.pan);
  }, []);

  // ── Shapes: selecting and editing (useShapeEditor), drawing a new one with the Shapes tool ──
  // A drag holds saving and undo steps until it ends, so the whole drag is one undo step
  const handleShapeGestureActive = useCallback((active) => {
    holdHistoryRef.current = active;
    handleDrawingStateChange(active);
    if (!active) commitHistory();
  }, [handleDrawingStateChange, commitHistory]);

  // Typing in a shape (its id), the shape menu (where it opened) and the Format Shape pane (its tab)
  const [editingShapeId, setEditingShapeId] = useState(null);
  // Where the cursor goes when typing reopens after a symbol (key: a new editor each time)
  const [editingCaret, setEditingCaret] = useState(null);
  const [shapeMenu, setShapeMenu] = useState(null);
  const [shapePaneTab, setShapePaneTab] = useState(null);
  const [changeShapeOpen, setChangeShapeOpen] = useState(false); // the Change Shape gallery

  const startShapeText = useCallback((id) => {
    const shape = latestShapesRef.current.find((s) => s.id === id);
    if (!shape || isLineShape(shape)) return;
    // A shape gets its text settings the first time it is typed in (Word: white, centred)
    if (!shape.text) {
      const defaults = shapeDefaultsRef.current;
      applyShapes(latestShapesRef.current.map((s) => (s.id === id ? { ...s, text: { ...DEFAULT_TEXT, ...((defaults && defaults.text) || {}), value: '' } } : s)));
    }
    shapeEditorRef.current.select([id]);
    setShapeMenu(null);
    setEditingCaret(null);
    setEditingShapeId(id);
  }, [applyShapes]);

  // ── Ink over blocks (PLAYGROUND_HANDOFF.md C2) ──
  // A block with "Draw on it" sits under the ink, so the pen writes over it. Pictures and graphs start
  // with it on. With the Select tool, a press on such a block picks it up (above the ink) to move or
  // edit it; when it is let go it goes back under the ink.
  const [liftedBlockId, setLiftedBlockId] = useState(null);
  const [liftSignal, setLiftSignal] = useState(0);
  const handleToggleDrawOver = useCallback((blockId) => {
    const block = blockStateRef.current.blocks.find((b) => b.blockId === blockId);
    if (!block) return;
    handleUpdateBlockContent(blockId, { drawOver: !inkGoesOver(block) });
  }, [handleUpdateBlockContent]);
  const handleBlockLetGo = useCallback((blockId) => {
    setLiftedBlockId((current) => (current === blockId ? null : current));
  }, []);
  const pickBlockUnderInk = useCallback((e) => {
    const candidates = blockStateRef.current.blocks.filter((b) => inkGoesOver(b));
    // The block drawn last is on top
    for (let i = candidates.length - 1; i >= 0; i--) {
      const el = containerRef.current?.querySelector(`[data-block-id="${candidates[i].blockId}"]`);
      const r = el?.getBoundingClientRect();
      if (r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        setLiftedBlockId(candidates[i].blockId);
        setLiftSignal((n) => n + 1);
        return true;
      }
    }
    return false;
  }, []);

  const shapeEditor = useShapeEditor({
    shapes,
    shapesRef: latestShapesRef,
    applyShapes,
    viewportRef,
    containerRef,
    onGestureActive: handleShapeGestureActive,
    onDoubleTap: startShapeText,
    // The menu opens beside the finger, not under it
    onLongPress: (point) => setShapeMenu({ x: point.x + 18, y: point.y - 24 }),
  });
  const shapeEditorRef = useRef(shapeEditor);
  shapeEditorRef.current = shapeEditor;

  // Typing: "Resize shape to fit text" grows or shrinks the shape with its text, top edge fixed
  const setShapeTextValue = useCallback((id, value) => {
    applyShapes(latestShapesRef.current.map((s) => (s.id === id ? shapeWithText(s, value, browserMeasure) : s)));
  }, [applyShapes]);
  const handleShapeTextChange = useCallback((value) => setShapeTextValue(editingShapeIdRef.current, value), [setShapeTextValue]);
  const editingShapeIdRef = useRef(editingShapeId);
  editingShapeIdRef.current = editingShapeId;

  // Finishing: an empty text box would be invisible, so it is removed (not while a symbol is
  // being chosen for it: the Symbol button takes the focus, which ends the typing)
  const symbolSessionRef = useRef(false);
  const finishShapeText = useCallback(() => {
    const id = editingShapeIdRef.current;
    setEditingShapeId(null);
    if (symbolSessionRef.current) return;
    const shape = latestShapesRef.current.find((s) => s.id === id);
    if (shape && shape.textBox && !(shape.text && shape.text.value && shape.text.value.trim())) {
      applyShapes(latestShapesRef.current.filter((s) => s.id !== id));
    }
  }, [applyShapes]);

  // ── Insert > Symbol: into the field that had the cursor when Symbol was pressed ──
  const capturedTextTargetRef = useRef(null);
  const handleCaptureTextTarget = useCallback(() => {
    capturedTextTargetRef.current = captureTextTarget();
    symbolSessionRef.current = true;
  }, []);

  // Typing in a shape reopens with the cursor at `caret`
  const reopenShapeText = useCallback((id, caret) => {
    setActiveTool('lasso');
    shapeEditorRef.current.select([id]);
    setEditingCaret({ at: caret, key: Date.now() });
    setEditingShapeId(id);
  }, []);

  const handleInsertSymbol = useCallback((text) => {
    recordActivity('playground.block', { type: 'symbol' });
    const target = capturedTextTargetRef.current;

    // The text of a shape: changed in the page (its editor closed when Symbol took the focus)
    if (target && target.shapeId) {
      const shape = latestShapesRef.current.find((s) => s.id === target.shapeId);
      if (shape) {
        const { value, caret } = spliceText((shape.text && shape.text.value) || '', target.start, target.end, text);
        setShapeTextValue(shape.id, value);
        capturedTextTargetRef.current = { ...target, el: null, start: caret, end: caret };
        reopenShapeText(shape.id, caret);
        return;
      }
    }

    // A block's field (equation, text, caption): typed in, as LaTeX for an equation
    if (target && target.el) {
      const next = insertIntoField(target, target.latex ? latexForSymbol(text) : text);
      if (next) {
        capturedTextTargetRef.current = next;
        return;
      }
    }

    // No cursor anywhere: a new text box in the middle of the view, holding the symbol
    const { zoom, pan } = viewportRef.current;
    const cx = (dimensions.width / 2 - pan.x) / zoom;
    const cy = (dimensions.height / 2 - pan.y) / zoom;
    const box = shapeWithText(createShape(getGalleryItem('textbox'), { x: cx - 80, y: cy - 20, w: 160, h: 40 }), text, browserMeasure);
    applyShapes([...latestShapesRef.current, box]);
    capturedTextTargetRef.current = { el: null, shapeId: box.id, start: text.length, end: text.length, latex: false };
    reopenShapeText(box.id, text.length);
  }, [applyShapes, dimensions.width, dimensions.height, setShapeTextValue, reopenShapeText]);

  // The Symbol menu and dialogs have closed. Typing that Symbol interrupted carries on; a text
  // box left empty goes away.
  const handleSymbolsClosed = useCallback((inserted) => {
    symbolSessionRef.current = false;
    const target = capturedTextTargetRef.current;
    capturedTextTargetRef.current = null;
    if (inserted || !target || !target.shapeId) return;
    const shape = latestShapesRef.current.find((s) => s.id === target.shapeId);
    if (!shape) return;
    if (shape.textBox && !(shape.text && shape.text.value && shape.text.value.trim())) {
      applyShapes(latestShapesRef.current.filter((s) => s.id !== shape.id));
    } else {
      reopenShapeText(shape.id, target.start);
    }
  }, [applyShapes, reopenShapeText]);

  // "Set as Default Shape": the look new shapes start with, remembered on this device
  const [shapeDefaults, setShapeDefaults] = useState(null);
  const shapeDefaultsRef = useRef(null);
  shapeDefaultsRef.current = shapeDefaults;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('netz_playground_default_shape') || 'null');
      if (saved && typeof saved === 'object') setShapeDefaults(saved);
    } catch (e) {}
  }, []);
  const setDefaultShapeFromSelection = useCallback(() => {
    const shape = shapeEditorRef.current.selectedShapes[0];
    if (!shape || isLineShape(shape) || shape.textBox) return;
    const look = shapeDefaultsFrom(shape);
    setShapeDefaults(look);
    try {
      localStorage.setItem('netz_playground_default_shape', JSON.stringify(look));
    } catch (e) {}
    showNotice('New shapes will look like this one');
  }, [showNotice]);

  const handleShapeMenuChoice = useCallback((id) => {
    const editor = shapeEditorRef.current;
    const first = editor.selectedShapes[0];
    switch (id) {
      case 'cut': editor.cutSelected(); break;
      case 'copy': editor.copySelected(); break;
      case 'paste': editor.paste(); break;
      case 'duplicate': editor.duplicateSelected(); break;
      case 'delete': editor.deleteSelected(); break;
      case 'text': if (first) startShapeText(first.id); break;
      case 'front': case 'back': case 'forward': case 'backward': editor.reorderSelected(id); break;
      case 'group': editor.groupSelected(); break;
      case 'ungroup': editor.ungroupSelected(); break;
      case 'change': setChangeShapeOpen(true); break;
      case 'default': setDefaultShapeFromSelection(); break;
      case 'format': setShapePaneTab('fill'); break;
      default: break;
    }
  }, [startShapeText, setDefaultShapeFromSelection]);

  // Right-click on a shape with the Select tool opens its menu (the browser's own menu otherwise)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleContextMenu = (e) => {
      if (activeToolRef.current !== 'lasso') return;
      if (e.target.closest && e.target.closest('[data-shape-format-bar], [data-format-pane], [data-block-id], [data-shape-context-menu]')) return;
      const { zoom, pan } = viewportRef.current;
      const rect = container.getBoundingClientRect();
      const point = { x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom };
      const hit = hitTestShapes(latestShapesRef.current, point, 6 / zoom);
      if (!hit) return;
      e.preventDefault();
      if (!shapeEditorRef.current.selectedIds.includes(hit.id)) shapeEditorRef.current.select([hit.id]);
      setShapeMenu({ x: e.clientX, y: e.clientY });
    };
    container.addEventListener('contextmenu', handleContextMenu);
    return () => container.removeEventListener('contextmenu', handleContextMenu);
  }, []);
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;

  // A phone bottom sheet (shape menus, Format Shape) covers the lower 60% of the screen: the page
  // moves so the selected shapes sit in the free part above it, under the top bar
  const SHEET_TOP_SHARE = 0.4;
  const revealSelectionAboveSheet = useCallback(() => {
    const box = boundsOfShapes(shapeEditorRef.current.selectedShapes);
    if (!box) return;
    const { zoom, pan } = viewportRef.current;
    const top = box.minY * zoom + pan.y;
    const bottom = box.maxY * zoom + pan.y;
    const areaTop = TOP_CHROME;
    const areaBottom = window.innerHeight * SHEET_TOP_SHARE - 8;
    if (top >= areaTop && bottom <= areaBottom) return;
    const height = bottom - top;
    // Centred in the free area, or its top just under the bar when it is taller than the area
    const targetTop = height < areaBottom - areaTop ? areaTop + (areaBottom - areaTop - height) / 2 : areaTop;
    const next = { zoom, pan: { x: pan.x, y: pan.y + (targetTop - top) } };
    viewportRef.current = next;
    setPanOffset(next.pan);
  }, []);
  useEffect(() => {
    if (shapePaneTab && dimensions.width < 640) revealSelectionAboveSheet();
  }, [shapePaneTab, dimensions.width, revealSelectionAboveSheet]);

  // Phones and tablets: the maths keyboard of the equation editor (MathLive) covers the lower part
  // of the screen. The page moves so the equation being edited sits above it, its top kept
  // under the top bar.
  useEffect(() => {
    let watched = null;
    let timer = null;
    const reveal = () => {
      const keyboard = window.mathVirtualKeyboard;
      if (!keyboard || !keyboard.visible) return;
      const field = document.activeElement && document.activeElement.tagName === 'MATH-FIELD' ? document.activeElement : null;
      const block = field && field.closest('[data-block-id]');
      const top = keyboard.boundingRect && keyboard.boundingRect.height > 0 ? keyboard.boundingRect.top : null;
      if (!block || !top) return;
      const r = block.getBoundingClientRect();
      const limit = top - 12;
      if (r.bottom <= limit) return;
      const shift = Math.min(r.bottom - limit, Math.max(0, r.top - TOP_CHROME));
      if (shift <= 0) return;
      const { zoom, pan } = viewportRef.current;
      const next = { zoom, pan: { x: pan.x, y: pan.y - shift } };
      viewportRef.current = next;
      setPanOffset(next.pan);
    };
    const onFocus = (e) => {
      if (!e.target || e.target.tagName !== 'MATH-FIELD') return;
      const keyboard = window.mathVirtualKeyboard;
      if (keyboard && watched !== keyboard) {
        watched = keyboard;
        keyboard.addEventListener('geometrychange', reveal);
      }
      clearTimeout(timer);
      timer = setTimeout(reveal, 400); // once the keyboard has slid up
    };
    document.addEventListener('focusin', onFocus);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('focusin', onFocus);
      if (watched) watched.removeEventListener('geometrychange', reveal);
    };
  }, []);

  // The menu, pane and typing belong to a selection: they close when it goes
  useEffect(() => {
    if (shapeEditor.selectedIds.length === 0) {
      setShapeMenu(null);
      setShapePaneTab(null);
      setChangeShapeOpen(false);
    }
    if (editingShapeId && !shapeEditor.selectedIds.includes(editingShapeId)) setEditingShapeId(null);
  }, [shapeEditor.selectedIds, editingShapeId]);

  // Touch screens get larger handles and colour swatches
  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  // Insert > Screenshot. Screen Grab Main Window: the part of the page on screen, as shown
  const renderPlaygroundView = useCallback(async () => {
    const container = containerRef.current;
    const { zoom, pan } = viewportRef.current;
    const isDark = document.documentElement.classList.contains('dark');
    const rect = container.getBoundingClientRect();
    return renderView({
      strokes: whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : [],
      blocks: blockStateRef.current.blocks,
      shapes: latestShapesRef.current,
      darkPage: isDark,
      containerElement: container,
      view: { x: -pan.x / zoom, y: -pan.y / zoom, width: rect.width / zoom, height: rect.height / zoom },
      pixelsPerUnit: zoom * (window.devicePixelRatio || 1),
      grid: container.querySelector('[data-grid-background]'),
      background: isDark ? '#09090B' : '#FFFFFF',
    });
  }, []);
  // Finish puts the screenshot on the page as a picture, like Insert > Picture
  const insertImageRef = useRef(handleInsertImage);
  insertImageRef.current = handleInsertImage;
  const insertScreenshot = useCallback((dataUrl) => insertImageRef.current(dataUrl), []);
  const screenshot = useScreenshot({ renderView: renderPlaygroundView, onInsert: insertScreenshot, showNotice, coarse: coarsePointer });

  // The Change Shape gallery closes on Escape (the selection stays) or a press outside it
  useEffect(() => {
    if (!changeShapeOpen) return undefined;
    const key = (e) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setChangeShapeOpen(false);
    };
    const outside = (e) => {
      if (!(e.target.closest && e.target.closest('[data-shape-gallery="change"]'))) setChangeShapeOpen(false);
    };
    window.addEventListener('keydown', key, true);
    const timer = setTimeout(() => window.addEventListener('pointerdown', outside, true), 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('pointerdown', outside, true);
    };
  }, [changeShapeOpen]);

  // Drawing a connector: the connection points of shapes near its ends (it attaches on release)
  const connectionHintsFor = useCallback((start, end) => {
    const zoom = viewportRef.current.zoom || 1;
    const all = latestShapesRef.current;
    const hints = [];
    for (const point of [start, end]) {
      const near = nearestConnection(all, point, 16 / zoom);
      for (const shape of shapesNear(all, point, 40 / zoom)) {
        for (const c of connectionPoints(shape)) hints.push({ x: c.x, y: c.y, attached: Boolean(near && near.id === shape.id && near.idx === c.idx) });
      }
    }
    return hints;
  }, []);

  // A lasso drawn around shapes selects them (Shift adds to the selection)
  const handleLassoFinished = useCallback((polygon, e) => {
    shapeEditorRef.current.selectEnclosed(polygon, Boolean(e && e.shiftKey));
  }, []);

  // Convert to Shape: ink that snapped to a line, triangle, rectangle, circle or polygon becomes
  // an editable shape (one undo step: the shapes are added, then the ink is removed)
  const handleConvertInkToShapes = useCallback(() => {
    const canvas = whiteboardCanvasRef.current;
    const ids = inkSelectionRef.current ? inkSelectionRef.current.strokeIds : [];
    if (!canvas || ids.length === 0) return;
    const strokes = canvas.getStrokes().filter((st) => ids.includes(st.id) && isConvertibleStroke(st));
    const made = strokes.map(shapeFromStroke).filter(Boolean);
    if (made.length === 0) return;
    applyShapes([...latestShapesRef.current, ...made]);
    canvas.eraseStrokesByIds(strokes.map((st) => st.id));
    shapeEditorRef.current.select(made.map((sh) => sh.id));
    showNotice(made.length === 1 ? 'Converted to a shape: drag its handles to change it' : `Converted to ${made.length} shapes`);
  }, [applyShapes, showNotice]);
  const inkSelectionRef = useRef(inkSelection);
  inkSelectionRef.current = inkSelection;

  // A shape picked in the gallery is armed: drag on the page to draw it, or tap for its default size
  const handlePickShape = useCallback((item) => {
    recordActivity('playground.block', { type: 'shape' });
    setArmedShape(item);
    setActiveTool('shape');
    showNotice(`${item.name}: drag on the page to draw it, or tap for the default size`, 3000);
  }, [showNotice]);

  // The Shapes tool without a picked shape: rough shapes drawn by hand snap into shape
  const handleFreehandShape = useCallback(() => {
    setArmedShape(null);
    setActiveTool('shape');
    showNotice('Draw a rough line, triangle, rectangle or circle: it snaps into shape', 3000);
  }, [showNotice]);

  // As in Word, a new shape is selected and the tool goes back to selecting
  const handleShapeDrawn = useCallback((box, item) => {
    let shape = createShape(item, box, shapeDefaultsRef.current);
    // A line or connector drawn from a shape's connection point to another's attaches to them
    if (isLineShape(shape)) {
      const reach = 16 / (viewportRef.current.zoom || 1);
      const ends = lineEndpoints(shape);
      const from = nearestConnection(latestShapesRef.current, ends.start, reach);
      const to = nearestConnection(latestShapesRef.current, ends.end, reach);
      if (from || to) {
        shape = lineBetween(shape, from || ends.start, to || ends.end);
        if (from) shape = setConnection(shape, 'start', from);
        if (to) shape = setConnection(shape, 'end', to);
      }
    }
    applyShapes([...latestShapesRef.current, shape]);
    rememberRecentShape(item.id);
    setNotice(null); // the "drag on the page" hint has done its job
    setArmedShape(null);
    setActiveTool('lasso');
    shapeEditorRef.current.select([shape.id]);
    // A text box opens ready to type, as in Word
    if (item.textBox) {
      setEditingCaret(null);
      setEditingShapeId(shape.id);
    }
  }, [applyShapes]);

  // A selection belongs to the Select tool; the armed shape belongs to the Shapes tool
  useEffect(() => {
    if (activeTool !== 'lasso') shapeEditorRef.current.clearSelection();
    if (activeTool !== 'shape') setArmedShape(null);
  }, [activeTool]);

  // Keys for selected shapes (left to the browser inside text fields): Delete, Escape,
  // arrows nudge 1 px (Shift: 10 px), Ctrl+D duplicates
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const tag = target && target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable)) return;
      const editor = shapeEditorRef.current;
      if (editor.selectedIds.length === 0) return;
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'g') {
          // Ctrl+G groups, Ctrl+Shift+G ungroups
          e.preventDefault();
          if (e.shiftKey) editor.ungroupSelected();
          else editor.groupSelected();
          return;
        }
        if (e.shiftKey && (e.key === '>' || e.key === '<' || e.code === 'Period' || e.code === 'Comma')) {
          // Ctrl+Shift+> and Ctrl+Shift+<: text one size larger or smaller
          e.preventDefault();
          editor.stepTextSize(e.key === '>' || e.code === 'Period');
          return;
        }
        if (key === 'd') {
          e.preventDefault();
          editor.duplicateSelected();
        } else if (key === 'c') {
          editor.copySelected();
        } else if (key === 'x') {
          e.preventDefault();
          editor.cutSelected();
        }
        return;
      }
      if (e.altKey) return;
      if (e.key === 'Tab') {
        // Tab: the next shape (Shift+Tab: the previous one), as in Word. Not while moving
        // through the toolbar's buttons with Tab
        if (target && target !== document.body && target.closest && target.closest('button, a, [role="menu"], [role="dialog"]')) return;
        e.preventDefault();
        editor.selectNext(e.shiftKey);
        return;
      }
      if ((e.key === 'Enter' || e.key === 'F2') && editor.selectedIds.length === 1) {
        e.preventDefault();
        startShapeTextRef.current(editor.selectedIds[0]);
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      const arrows = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        editor.deleteSelected();
      } else if (e.key === 'Escape') {
        editor.clearSelection();
      } else if (arrows[e.key]) {
        e.preventDefault();
        editor.nudge(...arrows[e.key]);
      }
    };
    // Ctrl+V: cut or copied shapes are pasted when the clipboard holds no picture (pictures are inserted as before)
    const handlePaste = (e) => {
      const target = e.target;
      const tag = target && target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (target && target.isContentEditable)) return;
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (let i = 0; i < items.length; i++) if (items[i].type.indexOf('image') !== -1) return;
      if (shapeEditorRef.current.canPaste()) {
        e.preventDefault();
        setActiveTool('lasso');
        shapeEditorRef.current.paste();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, []);
  const startShapeTextRef = useRef(startShapeText);
  startShapeTextRef.current = startShapeText;

  // Two-finger pinch / pan (and one-finger pan when fingers do not draw) report the new viewport here
  // A pinch shows the zoom in the status area, until a second after the fingers stop
  const pinchZoomTimerRef = useRef(null);
  const handleViewportGesture = useCallback((next) => {
    if (next.zoom !== viewportRef.current.zoom) {
      setPinchZoom(next.zoom);
      if (pinchZoomTimerRef.current) clearTimeout(pinchZoomTimerRef.current);
      pinchZoomTimerRef.current = setTimeout(() => setPinchZoom(null), 1000);
    }
    viewportRef.current = next;
    setZoomLevel(next.zoom);
    setPanOffset(next.pan);
  }, []);

  // Dock buttons anchor at the centre of the screen
  const viewCentre = () => ({ x: dimensions.width / 2, y: dimensions.height / 2 });
  const handleZoomIn = () => zoomTo(viewportRef.current.zoom * 1.2, viewCentre());
  const handleZoomOut = () => zoomTo(viewportRef.current.zoom / 1.2, viewCentre());
  const handleResetZoom = () => zoomTo(1, viewCentre());

  // Fit to content: everything on the page (ink, shapes, blocks) in the space between the top bar
  // and the dock. An empty page goes back to 100%.
  const handleFitToContent = () => {
    const strokes = whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : latestStrokesRef.current;
    const blockRects = blockStateRef.current.blocks.map((b) => ({ x: b.position.x, y: b.position.y, width: b.size.width, height: b.size.height }));
    const box = getPageBounds(strokes, [...blockRects, ...shapeRects(latestShapesRef.current)]);
    const next = fitViewToBox(box, dimensions.width, dimensions.height, { top: TOP_CHROME, bottom: 92 }, { margin: 24, maxZoom: 2 });
    viewportRef.current = next;
    setZoomLevel(next.zoom);
    setPanOffset(next.pan);
  };
  const handleFitToContentRef = useRef(handleFitToContent);
  handleFitToContentRef.current = handleFitToContent;

  // Ctrl/Cmd + 0 / + / - zoom the page (not the browser), S saves, D duplicates the selection
  shortcutActionsRef.current = {
    '0': handleResetZoom,
    '=': handleZoomIn,
    '+': handleZoomIn,
    '-': handleZoomOut,
    s: handleManualSave,
    d: () => whiteboardCanvasRef.current?.duplicateSelection?.(),
  };

  // Wheel Handler for Panning & Pinch-Zoom (zoom anchors at the cursor)
  const handleWheel = useCallback((e) => {
    // Over something that scrolls by itself (a menu, the Shapes gallery, a dialog, a long text
    // block), the wheel scrolls that, as everywhere else; only Ctrl + wheel is kept from the
    // browser (it would zoom the whole page). Anywhere else the wheel pans or zooms the canvas.
    if (scrollsItself(e.target, containerRef.current)) {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
      return;
    }
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : { left: 0, top: 0 };
      zoomTo(viewportRef.current.zoom * zoomFactor, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      const pan = { x: viewportRef.current.pan.x - e.deltaX, y: viewportRef.current.pan.y - e.deltaY };
      viewportRef.current = { ...viewportRef.current, pan };
      setPanOffset(pan);
    }
  }, [zoomTo]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Middle-Click Pan Handler & Canvas Selection Click Handler.
  // Pointer events, so a pen pans with the Move tool as the mouse does. Fingers are handled by
  // the canvas itself (one-finger pan, two-finger pinch).
  const handleMouseDown = (e) => {
    if (e.pointerType === 'touch') return;
    if (e.button === 1 || activeTool === 'pan') {
      isMiddlePanRef.current = true;
      startPanRef.current = {
        x: e.clientX - viewportRef.current.pan.x,
        y: e.clientY - viewportRef.current.pan.y,
      };
    } else if (activeTool === 'lasso' && clusters.length > 0) {
      // Find cluster under click point
      const canvasX = (e.clientX - panOffset.x) / zoomLevel;
      const canvasY = (e.clientY - panOffset.y) / zoomLevel;

      const hitCluster = clusters.find((c) =>
        canvasX >= c.bbox.minX - 20 &&
        canvasX <= c.bbox.maxX + 20 &&
        canvasY >= c.bbox.minY - 20 &&
        canvasY <= c.bbox.maxY + 20
      );

      if (hitCluster) {
        setSelectedClusterId(hitCluster.clusterId);
      } else {
        setSelectedClusterId(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isMiddlePanRef.current) return;
    const pan = {
      x: e.clientX - startPanRef.current.x,
      y: e.clientY - startPanRef.current.y,
    };
    viewportRef.current = { ...viewportRef.current, pan };
    setPanOffset(pan);
  };

  const handleMouseUp = () => {
    isMiddlePanRef.current = false;
  };

  // What a reading's buttons do, in the pills beside ink and in the lasso's context bar
  const readingHandlers = {
    onConvertCluster: handleConvertClusterToBlock,
    onPlotClusterGraph: (cluster) => handleConvertClusterToBlock(cluster),
    onOpenFix: (cluster) => setSoftEditorCluster(cluster),
    onReadAsMath: handleReadClusterAsMath,
    onReadAsText: handleReadClusterAsText,
  };

  // The page menu (⋯): in the top-right bar on laptops and tablets, a sheet from the top bar on
  // phones, where it also holds Zoom, Redo and Send to Notes
  const isPhone = dimensions.width < 640;
  const pageMenu = {
    notesMode,
    setNotesMode,
    gridStyle,
    setGridStyle,
    showMove: isPhone || moveFolded,
    activeTool,
    setActiveTool,
    onOpenSyncModal: () => setIsSyncModalOpen(true),
    onExportCanvas: handleExportCanvas,
    onSaveToStudio: () => handleSaveToStudio(),
    onSaveToStudioAsNew: pages[currentPageIndex]?.boardId ? () => handleSaveToStudio({ asNew: true }) : null,
    boardSaved: Boolean(pages[currentPageIndex]?.boardId),
    onInsertFromFile: handleInsertFromFile,
    onOpenMusic: () => setMusicOpen(true),
    onOpenPreferences: () => setShowPreferences(true),
    onDuplicatePage: () => handleDuplicatePage(currentPageIndex),
    onClearPage: handleClearPage,
    onDeletePage: () => handleDeletePage(currentPageIndex),
    canDelete: pages.length > 1,
    onRedo: handleRedo,
    canRedo: historyFlags.canRedo,
    zoomLevel,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onResetZoom: handleResetZoom,
    onFitToContent: handleFitToContent,
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleMouseDown}
      onPointerMove={handleMouseMove}
      onPointerUp={handleMouseUp}
      onPointerCancel={handleMouseUp}
      data-playground
      data-zoom-level={`${Math.round(zoomLevel * 100)}%`}
      className={`${PG_FONT} relative w-full h-[100dvh] overflow-hidden bg-pg-paper text-pg-ink select-none overscroll-none touch-none touch-canvas-surface`}
      style={{
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        overscrollBehavior: 'none',
      }}
    >
      {/* Layer 1: Static Grid Background */}
      <CanvasGridBackground
        gridStyle={notesMode ? 'lines' : gridStyle}
        zoomLevel={zoomLevel}
        panOffset={panOffset}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* A new, empty page says what the Playground does; it never takes a press, goes with the
          first stroke and comes back only if the page is emptied again */}
      {inkCount === 0 && shapes.length === 0 && blockState.blocks.length === 0 && !isDrawing && (
        <div data-empty-hint className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center pointer-events-none select-none">
          <span className="text-pg-title font-semibold text-pg-text2">{UI.emptyTitle}</span>
          {readMode !== 'off' && <span className="text-pg-body text-pg-text2">{UI.emptyHint}</span>}
        </div>
      )}

      {/* Shapes, under the ink so the pen writes on them */}
      <ShapeLayer shapes={shapes} zoomLevel={zoomLevel} panOffset={panOffset} width={dimensions.width} height={dimensions.height} editingId={editingShapeId} />

      {/* Layer 2 & 3: Hardware Accelerated Whiteboard Canvas */}
      <WhiteboardCanvas
        ref={whiteboardCanvasRef}
        activeTool={activeTool}
        strokeColor={activeTool === 'highlighter' ? highlighterColor : strokeColor}
        strokeWidth={activeTool === 'highlighter' ? highlighterWidth : strokeWidth}
        strokeOpacity={strokeOpacity}
        zoomLevel={zoomLevel}
        panOffset={panOffset}
        width={dimensions.width}
        height={dimensions.height}
        shapeItem={activeTool === 'shape' ? armedShape : null}
        shapeDefaults={shapeDefaults}
        onShapeDrawn={handleShapeDrawn}
        onSelectPress={(point, e) => pickBlockUnderInk(e) || shapeEditor.handleSelectPress(point, e)}
        onLassoFinished={handleLassoFinished}
        connectionHints={connectionHintsFor}
        onStrokesUpdated={handleStrokesUpdated}
        onDrawingStateChange={handleDrawingStateChange}
        onSelectionCompleted={handleSelectionCompleted}
        onSelectionChange={handleInkSelectionChange}
        fingerDraws={fingerDraws}
        onViewportChange={handleViewportGesture}
        onTwoFingerTap={() => {
          if (!historyRef.current.canUndo()) return;
          handleUndo();
          showNotice('Undone', 1200);
        }}
        onThreeFingerTap={() => {
          if (!historyRef.current.canRedo()) return;
          handleRedo();
          showNotice('Redone', 1200);
        }}
        eraserMode={eraserMode}
        eraserSize={eraserSize}
      />

      {/* Layer 4: SVG Bézier Link Path Connectors */}
      <BlockLinkRenderer
        links={blockState.links}
        blocks={blockState.blocks}
        zoomLevel={zoomLevel}
        panOffset={panOffset}
      />

      {/* Layer 5: Smart Blocks Suite */}
      {blockState.blocks.map((block) => (
        <SmartBlockWrapper
          key={block.blockId}
          block={block}
          autoEdit={block.blockId === autoEditBlockId}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
          onUpdatePosition={(blockId, pos) => dispatch({ type: 'UPDATE_BLOCK_POSITION', payload: { blockId, position: pos } })}
          onUpdateSize={(blockId, size) => dispatch({ type: 'UPDATE_BLOCK_SIZE', payload: { blockId, size } })}
          onDeleteBlock={handleDeleteBlock}
          onSelectAiAction={handleSelectAiAction}
          drawOver={inkGoesOver(block)}
          underInk={inkGoesOver(block) && liftedBlockId !== block.blockId}
          onToggleDrawOver={handleToggleDrawOver}
          selectSignal={liftedBlockId === block.blockId ? liftSignal : 0}
          onDeselect={handleBlockLetGo}
          actions={
            block.type === 'equation'
              ? [{ key: 'plot', label: 'Plot', title: 'Plot this equation on a graph', icon: <LuLineChart className="w-4 h-4 pointer-events-none" aria-hidden="true" />, onClick: () => plotGraphStable(block, block.content?.latex || '') }]
              : undefined
          }
        >
          {block.type === 'equation' && (
            <EquationBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
              onPlotGraph={plotGraphStable}
            />
          )}

          {block.type === 'graph' && (
            <GraphBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
            />
          )}

          {block.type === 'theory' && (
            <TheoryBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
            />
          )}

          {block.type === 'sketch' && (
            <SketchBlock
              block={block}
              onConvertSketchToEquation={(sketchBlock, latexStr) => {
                const eqId = `block_eq_${Date.now()}`;
                const newEqBlock = {
                  blockId: eqId,
                  type: 'equation',
                  content: { latex: latexStr },
                  linkedBlockIds: [],
                  position: { x: sketchBlock.position.x + 400, y: sketchBlock.position.y },
                  size: { width: 360, height: 140 },
                  status: 'active',
                  isMinimal: false,
                };
                dispatch({ type: 'ADD_BLOCK', payload: newEqBlock });
              }}
            />
          )}

          {block.type === 'audio' && (
            <AudioMemoBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
            />
          )}

          {block.type === 'image' && (
            <ImageBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
            />
          )}

          {block.type === 'table' && (
            <TableBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
            />
          )}
        </SmartBlockWrapper>
      ))}

      {/* The top bars. Laptops and tablets: the page bar top-left (16 px from the app sidebar) and
          the document bar top-right. Phones: one bar across the top, 12 px from each edge. */}
      <div
        className="fixed z-40"
        style={
          isPhone
            ? { top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: 12, right: 12 }
            : { top: 'calc(env(safe-area-inset-top, 0px) + 16px)', left: sidebarRight + 16 }
        }
      >
        <PageManager
          pages={pages}
          currentPageIndex={currentPageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onOpenPages={() => setPageSheetOpen(true)}
          saveStatus={saveStatus}
          isMobile={isPhone}
          pageMenu={isPhone ? pageMenu : null}
        />
      </div>
      {!isPhone && (
        <div className="fixed z-40 right-4" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <DocBar
            compact={dimensions.width - sidebarRight < 960}
            saveStatus={saveStatus}
            isJustSaved={isSavedToastVisible}
            onRetrySave={handleManualSave}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onFitToContent={handleFitToContent}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            music={music}
            onPauseMusic={() => musicRef.current?.pause()}
            pageMenu={pageMenu}
          />
        </div>
      )}

      {insertChoice && (
        <Dialog title="Insert from file" isMobile={isPhone} onClose={() => setInsertChoice(null)} width="w-[440px]" fullHeight={false}>
          <p className="m-0 text-pg-body text-pg-text2">
            {insertChoice.kind === 'document'
              ? `${insertChoice.fileName}: a board with ${insertChoice.document.pages.length} page${insertChoice.document.pages.length === 1 ? '' : 's'}.`
              : `${insertChoice.fileName}: the note “${insertChoice.note.title}”.`}{' '}
            Handwriting stays handwriting, so you can write between it, erase it and read it.
          </p>
          <div className="flex flex-col gap-2 pt-3">
            <button type="button" className="min-h-[48px] rounded-xl bg-pg-ink text-pg-on-ink font-semibold" onClick={() => finishInsert('new')}>
              As new page{insertChoice.kind === 'document' && insertChoice.document.pages.length > 1 ? 's' : ''}
            </button>
            <button type="button" className="min-h-[48px] rounded-xl bg-pg-tray text-pg-ink font-semibold hover:bg-pg-line" onClick={() => finishInsert('here')}>
              Onto this page, below what is here
            </button>
          </div>
        </Dialog>
      )}

      {showPreferences && (
        <PreferencesDialog
          isMobile={isPhone}
          onClose={() => setShowPreferences(false)}
          fingerDraws={fingerDraws}
          setFingerDraws={handleSetFingerDraws}
          readMode={readMode}
          setReadMode={setReadMode}
          notesMode={notesMode}
        />
      )}

      {/* All pages: open, rename, reorder, duplicate, delete */}
      {pageSheetOpen && (
        <PageSheet
          pages={getSyncedPagesState()}
          currentPageIndex={currentPageIndex}
          isMobile={dimensions.width < 640}
          onClose={() => setPageSheetOpen(false)}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onRenamePage={handleRenamePage}
          onMovePage={handleMovePage}
        />
      )}

      {/* Short status message */}
      {/* Insert > Screenshot: the editor, the countdown, the photo picker */}
      {screenshot.elements}

      {/* Status area, under the top bars and centred in the space right of the app sidebar: model
          status, recording, music (phones), a failed save (phones), short notices (with Undo), the
          zoom while pinching */}
      <div
        data-status-area
        className="fixed z-50 flex justify-center pointer-events-none"
        style={{ top: `calc(env(safe-area-inset-top, 0px) + ${TOP_CHROME}px)`, left: sidebarRight + 12, right: 12 }}
      >
        <div className="flex flex-col items-center gap-2 w-max max-w-full">
          <AIModelLoadingStatusPill
            onDecline={() => {
              setReadMode('off');
              showNotice('Reading handwriting is off. Turn it on in Preferences.', 5000);
            }}
          />
          {isRecordingAudio && recordingSince && <RecordingPill since={recordingSince} onStop={handleToggleRecordAudio} />}
          {isPhone && music.playing && (
            <div role="status" className="pointer-events-auto flex items-center gap-2 h-11 pl-3.5 pr-1.5 rounded-[14px] bg-pg-surface border border-pg-line shadow-pg-bar text-pg-label font-medium text-pg-ink">
              <span className="max-w-[180px] truncate">{music.title}</span>
              <button type="button" onClick={() => musicRef.current?.pause()} aria-label={`Pause ${music.title}`} title={`Pause ${music.title}`} className="w-11 h-11 -my-1 flex items-center justify-center rounded-[10px] text-pg-ink hover:bg-pg-tray">
                <FiPause className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
          {isPhone && saveStatus === 'failed' && (
            <div role="alert" className="pointer-events-auto flex items-center gap-2 h-12 pl-4 pr-1.5 rounded-[14px] bg-pg-danger-tint text-pg-danger text-pg-label font-semibold shadow-pg-bar">
              {UI.saveFailed}
              <button type="button" onClick={handleManualSave} className="h-11 px-3.5 rounded-[10px] bg-pg-danger text-white font-semibold">
                {UI.retry}
              </button>
            </div>
          )}
          {pinchZoom !== null && (
            <div role="status" className="px-3.5 py-2 rounded-[14px] bg-pg-ink text-pg-on-ink text-pg-label font-semibold tabular-nums shadow-pg-bar">
              {Math.round(pinchZoom * 100)}%
            </div>
          )}
          {notice && (
            <div
              role="status"
              onPointerEnter={notice.action ? holdNotice : undefined}
              onPointerLeave={notice.action ? releaseNotice : undefined}
              className={`flex items-center gap-2 ${notice.action ? 'min-h-[48px] pl-4 pr-1.5 py-1 pointer-events-auto' : 'min-h-[40px] px-4 py-2'} rounded-[14px] bg-pg-ink text-pg-on-ink text-[14px] font-medium shadow-pg-menu`}
            >
              <span>{notice.message}</span>
              {notice.action && (
                <button
                  type="button"
                  onClick={() => {
                    const run = notice.action.onClick;
                    setNotice(null);
                    holdNotice();
                    run();
                  }}
                  className="min-h-[36px] [@media(pointer:coarse)]:min-h-[44px] px-3 rounded-[10px] font-semibold text-pg-notice-action hover:bg-pg-on-ink/10"
                >
                  {notice.action.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Universal Text & KaTeX Preview Pill Overlay */}
      <LiveMathPreviewOverlay
        clusters={clusters}
        zoomLevel={zoomLevel}
        panOffset={panOffset}
        isDrawing={isDrawing}
        visible={readMode !== 'off'}
        selectedClusterId={selectedClusterId}
        onConvertCluster={handleConvertClusterToBlock}
        onPlotClusterGraph={(cluster) => {
          handleConvertClusterToBlock(cluster);
        }}
        onOpenFix={(cluster) => setSoftEditorCluster(cluster)}
        onReadAsMath={handleReadClusterAsMath}
        onReadAsText={handleReadClusterAsText}
        hideSelection={Boolean(inkSelection)}
      />

      {/* Lassoed ink: one context bar above it. The reading leads (while handwriting is read),
          then Convert to Shape, Duplicate, Colour and Delete. Drag the selection to move it,
          its corner handle to resize it. */}
      {inkSelection && !isDrawing && (() => {
        const pad = 8; // the selection box's padding on screen (WhiteboardCanvas SELECTION_PADDING)
        const box = {
          minX: inkSelection.bbox.minX * zoomLevel + panOffset.x - pad,
          minY: inkSelection.bbox.minY * zoomLevel + panOffset.y - pad,
          maxX: inkSelection.bbox.maxX * zoomLevel + panOffset.x + pad,
          maxY: inkSelection.bbox.maxY * zoomLevel + panOffset.y + pad,
        };
        const selectionCluster = clusters.find((c) => c.clusterId && c.clusterId.startsWith('selection_'));
        const reading = selectionCluster
          ? readingParts(selectionCluster, {
              menuOpen: selectionMenuOpen,
              toggleMenu: () => setSelectionMenuOpen((open) => !open),
              closeMenu: () => setSelectionMenuOpen(false),
              handlers: readingHandlers,
            })
          : null;
        const convertible = (whiteboardCanvasRef.current?.getStrokes?.() || []).some((st) => inkSelection.strokeIds.includes(st.id) && isConvertibleStroke(st));
        return (
          <ContextBar
            box={box}
            viewport={dimensions}
            label="Selection"
            top={TOP_CHROME}
            below={reading && reading.menu ? <div className="pt-1 pl-1 border-t border-pg-line">{reading.menu}</div> : null}
          >
            {reading && (
              <>
                <div data-reading-pill className="pl-2 min-w-0 flex items-center">
                  {reading.row}
                </div>
                <CtxDivider />
              </>
            )}
            {convertible && (
              <button
                type="button"
                onClick={handleConvertInkToShapes}
                title="Convert to Shape: turn the snapped ink into shapes you can resize, colour and type in"
                aria-label="Convert to Shape"
                className={CTX_BUTTON}
              >
                <LuShapes className="w-[18px] h-[18px]" />
              </button>
            )}
            <button type="button" onClick={() => whiteboardCanvasRef.current?.duplicateSelection()} title="Duplicate selection" aria-label="Duplicate selection" className={CTX_BUTTON}>
              <FiCopy className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => whiteboardCanvasRef.current?.recolorSelection(strokeColor)}
              title="Apply the current pen colour to the selection"
              aria-label="Apply the current pen colour to the selection"
              className={CTX_BUTTON}
            >
              <span className="block w-[18px] h-[18px] rounded-full border border-black/10 dark:border-white/20" style={{ backgroundColor: strokeColor }} />
            </button>
            <button type="button" onClick={() => whiteboardCanvasRef.current?.deleteSelection()} title="Delete selection (Delete key)" aria-label="Delete selection" className={`${CTX_BUTTON} hover:!text-pg-danger`}>
              <FiTrash2 className="w-[18px] h-[18px]" />
            </button>
          </ContextBar>
        );
      })()}

      {/* Selected shapes: handles, and the format bar once nothing is being dragged */}
      {activeTool === 'lasso' && shapeEditor.selectedShapes.length > 0 && (
        <ShapeSelectionOverlay
          shapes={shapeEditor.selectedShapes}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
          width={dimensions.width}
          height={dimensions.height}
          coarse={coarsePointer}
          group={isWholeGroup(shapes, shapeEditor.selectedShapes)}
          guides={shapeEditor.gestureInfo && shapeEditor.gestureInfo.guides}
          connections={shapeEditor.gestureInfo && shapeEditor.gestureInfo.connections}
          attached={shapeEditor.gestureInfo && shapeEditor.gestureInfo.attached}
          onBeginGesture={shapeEditor.beginGesture}
          onBodyContextMenu={(point) => setShapeMenu(point)}
        />
      )}
      {editingShapeId && (() => {
        const shape = shapes.find((s) => s.id === editingShapeId);
        if (!shape) return null;
        return (
          <ShapeTextEditor
            key={`${shape.id}-${editingCaret ? editingCaret.key : 0}`}
            caret={editingCaret ? editingCaret.at : null}
            shape={shape}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            darkPage={typeof document !== 'undefined' && document.documentElement.classList.contains('dark')}
            onChange={handleShapeTextChange}
            onDone={finishShapeText}
          />
        );
      })()}
      {activeTool === 'lasso' && shapeEditor.selectedShapes.length > 0 && !shapeEditor.gestureInfo && !editingShapeId && (() => {
        const box = boundsOfShapes(shapeEditor.selectedShapes);
        const screenBox = {
          minX: box.minX * zoomLevel + panOffset.x,
          minY: box.minY * zoomLevel + panOffset.y,
          maxX: box.maxX * zoomLevel + panOffset.x,
          maxY: box.maxY * zoomLevel + panOffset.y,
        };
        // The bar keeps clear of the rotate handle too (it sits above the top edge)
        const rotateAt = rotateHandleAt(shapeEditor.selectedShapes, zoomLevel, panOffset, coarsePointer);
        if (rotateAt) {
          const reach = coarsePointer ? 22 : 12;
          screenBox.minX = Math.min(screenBox.minX, rotateAt.x - reach);
          screenBox.maxX = Math.max(screenBox.maxX, rotateAt.x + reach);
          screenBox.minY = Math.min(screenBox.minY, rotateAt.y - reach);
          screenBox.maxY = Math.max(screenBox.maxY, rotateAt.y + reach);
        }
        return (
          <ShapeFormatBar
            shapes={shapeEditor.selectedShapes}
            screenBox={screenBox}
            viewport={dimensions}
            isMobile={dimensions.width < 640}
            coarse={coarsePointer}
            onStyle={shapeEditor.applyStyle}
            onReorder={shapeEditor.reorderSelected}
            onRotate={shapeEditor.rotateSelectedBy}
            onFlip={shapeEditor.flipSelected}
            onAlign={shapeEditor.alignSelected}
            onDistribute={shapeEditor.distributeSelected}
            onGroup={shapeEditor.groupSelected}
            onUngroup={shapeEditor.ungroupSelected}
            onChangeShape={() => setChangeShapeOpen(true)}
            canGroup={canGroup(shapeEditor.selectedShapes)}
            canUngroup={canUngroup(shapeEditor.selectedShapes)}
            canChangeShape={shapeEditor.selectedShapes.some(canChangeShape)}
            onDuplicate={shapeEditor.duplicateSelected}
            onDelete={shapeEditor.deleteSelected}
            onEditText={() => shapeEditor.selectedShapes[0] && startShapeText(shapeEditor.selectedShapes[0].id)}
            onOpenPane={(tab) => setShapePaneTab(tab || 'fill')}
            onSheetOpen={revealSelectionAboveSheet}
          />
        );
      })()}
      {shapePaneTab && shapeEditor.selectedShapes.length > 0 && (
        <FormatShapePane
          shape={shapeEditor.selectedShapes[0]}
          initialTab={shapePaneTab}
          isMobile={dimensions.width < 640}
          coarse={coarsePointer}
          onStyle={shapeEditor.applyStyle}
          onUpdate={shapeEditor.updateSelected}
          onClose={() => setShapePaneTab(null)}
        />
      )}
      {changeShapeOpen && shapeEditor.selectedShapes.length > 0 && (
        <div className="contents" data-change-shape onPointerDown={(e) => e.stopPropagation()}>
          <ShapeGallery
            mode="change"
            isMobile={dimensions.width < 640}
            placement="fixed left-1/2 top-20 -translate-x-1/2 w-[560px] max-w-[calc(100vw-16px)] max-h-[70vh] rounded-2xl p-3 border"
            onPick={(item) => {
              shapeEditor.changeSelected(item.preset);
              setChangeShapeOpen(false);
            }}
            onClose={() => setChangeShapeOpen(false)}
          />
        </div>
      )}
      {shapeMenu && shapeEditor.selectedShapes.length > 0 && (
        <ShapeContextMenu
          x={shapeMenu.x}
          y={shapeMenu.y}
          onClose={() => setShapeMenu(null)}
          onChoose={handleShapeMenuChoice}
          items={[
            { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
            { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
            { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', disabled: !shapeEditor.canPaste() },
            { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D' },
            { id: 'delete', label: 'Delete', shortcut: 'Del' },
            { separator: true },
            ...(shapeEditor.selectedShapes.some((s) => !isLineShape(s)) ? [{ id: 'text', label: 'Edit Text', shortcut: 'F2' }, { separator: true }] : []),
            ...(canGroup(shapeEditor.selectedShapes) ? [{ id: 'group', label: 'Group', shortcut: 'Ctrl+G' }] : []),
            ...(canUngroup(shapeEditor.selectedShapes) ? [{ id: 'ungroup', label: 'Ungroup', shortcut: 'Ctrl+Shift+G' }] : []),
            { id: 'front', label: 'Bring to Front' },
            { id: 'forward', label: 'Bring Forward' },
            { id: 'backward', label: 'Send Backward' },
            { id: 'back', label: 'Send to Back' },
            { separator: true },
            { id: 'change', label: 'Change Shape...', disabled: !shapeEditor.selectedShapes.some(canChangeShape) },
            { id: 'default', label: 'Set as Default Shape', disabled: !shapeEditor.selectedShapes.some((s) => !isLineShape(s) && !s.textBox) },
            { id: 'format', label: 'Format Shape...' },
          ]}
        />
      )}
      {shapeEditor.gestureInfo && (shapeEditor.gestureInfo.kind === 'rotate' || shapeEditor.gestureInfo.kind === 'resize') && (
        <div
          role="status"
          style={{ left: shapeEditor.gestureInfo.x + 18, top: shapeEditor.gestureInfo.y + 18 }}
          className="fixed z-50 px-2 py-1 rounded-lg bg-pg-ink text-pg-on-ink text-pg-cap font-semibold tabular-nums shadow-pg-bar pointer-events-none"
        >
          {shapeEditor.gestureInfo.kind === 'rotate'
            ? `${Math.round(shapeEditor.gestureInfo.rot)}°`
            : `${Math.round(shapeEditor.gestureInfo.w)} × ${Math.round(shapeEditor.gestureInfo.h)}`}
        </div>
      )}

      {/* Fix: correct how handwriting was read */}
      {softEditorCluster && (
        <FixReadingDialog
          cluster={softEditorCluster}
          isMobile={dimensions.width < 640}
          onClose={() => setSoftEditorCluster(null)}
          onApply={(cluster, correctedText, assignedType) => {
            const isMath = assignedType === 'MATH' || assignedType === 'FRACTION';
            handleConvertClusterToBlock({ ...cluster, detectedText: correctedText, isMath, type: assignedType }, correctedText);
          }}
        />
      )}

      {/* Send to Notes */}
      <InkToBlockConverterModal
        isOpen={isSyncModalOpen}
        isMobile={dimensions.width < 640}
        onClose={() => setIsSyncModalOpen(false)}
        blocks={blockState.blocks}
        onConfirmSync={handleSendToNotes}
        onOpenNote={(noteId) => {
          setIsSyncModalOpen(false);
          flushSave();
          router.push(`/Notes?open=${encodeURIComponent(noteId)}`);
        }}
      />

      {/* Floating Dock Controls */}
      <PlaygroundDock
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        strokeOpacity={strokeOpacity}
        penType={penType}
        setPenType={setPenType}
        penWidths={penWidths}
        highlighterColor={highlighterColor}
        setHighlighterColor={setHighlighterColor}
        highlighterWidth={highlighterWidth}
        setHighlighterWidth={setHighlighterWidth}
        onMoveFolded={setMoveFolded}
        eraserMode={eraserMode}
        setEraserMode={setEraserMode}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyFlags.canUndo}
        canRedo={historyFlags.canRedo}
        onAddBlock={handleAddBlock}
        onInsertEquation={handleInsertEquation}
        onInsertTable={handleInsertTable}
        screenshot={screenshot}
        isRecording={isRecordingAudio}
        onToggleRecordAudio={handleToggleRecordAudio}
        onInsertImage={handleInsertImage}
        armedShape={armedShape}
        onPickShape={handlePickShape}
        onFreehandShape={handleFreehandShape}
        onCaptureTextTarget={handleCaptureTextTarget}
        onInsertSymbol={handleInsertSymbol}
        onSymbolsClosed={handleSymbolsClosed}
      />

      {/* Focus music: opened from the page menu; while it plays, a pause button sits in the
          top-right bar (laptops, tablets) or the status area (phones) */}
      <BackgroundMusicPlayer ref={musicRef} open={musicOpen} onClose={() => setMusicOpen(false)} isMobile={isPhone} onPlayingChange={handleMusicPlaying} />

      {/* Leaving after a failed save: the only time leaving asks anything */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        isMobile={dimensions.width < 640}
        retrying={retryLeaving && saveStatus === 'saving'}
        onRetry={() => {
          setRetryLeaving(true);
          persistSession();
        }}
        onLeave={() => {
          setIsUnsavedModalOpen(false);
          setRetryLeaving(false);
          if (pendingTargetUrl) router.push(pendingTargetUrl);
          setPendingTargetUrl(null);
        }}
        onStay={() => {
          setIsUnsavedModalOpen(false);
          setRetryLeaving(false);
          setPendingTargetUrl(null);
        }}
      />
    </div>
  );
}
