'use client';

import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import CanvasGridBackground from './CanvasGridBackground';
import WhiteboardCanvas from './WhiteboardCanvas';
import PlaygroundDock from './PlaygroundDock';
import LiveMathPreviewOverlay from './LiveMathPreviewOverlay';
import BlockLinkRenderer from './BlockLinkRenderer';
import InkToBlockConverterModal from './InkToBlockConverterModal';
import SmartBlockWrapper from './blocks/SmartBlockWrapper';
import EquationBlock from './blocks/EquationBlock';
import GraphBlock from './blocks/GraphBlock';
import TheoryBlock from './blocks/TheoryBlock';
import SketchBlock from './blocks/SketchBlock';
import AudioMemoBlock from './blocks/AudioMemoBlock';
import ImageBlock from './blocks/ImageBlock';
import BackgroundMusicPlayer from './BackgroundMusicPlayer';
import PageManager from './PageManager';
import UnsavedChangesModal from './UnsavedChangesModal';
import SoftEditorModal from './SoftEditorModal';
import SemanticLassoModal from './SemanticLassoModal';
import AIModelLoadingStatusPill from './AIModelLoadingStatusPill';
import { startAudioRecording, stopAudioRecording } from '../utils/audioRecorder';

import { clusterStrokes } from '../utils/spatialClusterer';
import { processClusterOCR } from '../utils/handwritingOCR';
import { preloadOCREngine } from '../utils/localOCRService';
import { modelManager } from '../utils/recognition/modelManager';
import { recordUserCorrection } from '../utils/recognition/telemetryStore';
import { initAutocompleteTrie } from '../utils/autocompleteTrie';
import { generateGraphDatasetFromLatex, upsertCurveForSource } from '../utils/equationToGraph';
import { exportPage, renderView } from '../utils/exportEngine';
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
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import { LuShapes } from 'react-icons/lu';
import { prepareImage, fitImageBox } from '../utils/imageSizing';
import { zoomAtPoint } from '../utils/viewportMath';
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

// Pause after the last change before the session is written
const SAVE_DELAY_MS = 350;

// Single-key tool shortcuts (shown in the dock tooltips)
const TOOL_SHORTCUTS = { p: 'pen', h: 'highlighter', e: 'eraser', l: 'lasso', s: 'shape', m: 'pan' };

export default function PlaygroundCanvasContainer() {
  const router = useRouter();

  // Viewport Dimensions
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Viewport Transform Matrix State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Inking Tool State
  const [activeTool, setActiveTool] = useState('pen');
  // The gallery shape armed for drawing with the Shapes tool (null: freehand shapes snap)
  const [armedShape, setArmedShape] = useState(null);
  const [strokeColor, setStrokeColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeOpacity, setStrokeOpacity] = useState(1); // set by the pen presets (pencil, marker)
  const [gridStyle, setGridStyle] = useState('dots');

  // Eraser: 'stroke' removes whole strokes, 'partial' rubs out only what it passes over.
  // Size is the radius in screen pixels, independent of the pen width.
  const [eraserMode, setEraserMode] = useState('stroke');
  const [eraserSize, setEraserSize] = useState(16);

  // Drawing & Live OCR Opt-In State (Default 'selection' = clean canvas, manual selection OCR!)
  const [isDrawing, setIsDrawing] = useState(false);
  const [showLiveOcr, setShowLiveOcr] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [ocrMode, setOcrMode] = useState('selection'); // 'selection' (manual on selection) | 'live' (auto on draw)

  // Notes Mode State — when true, enables lined paper, auto-OCR, and note-taking UI
  const [notesMode, setNotesMode] = useState(false);
  const ocrBeforeNotesRef = useRef(null);

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
  const handleSetFingerDraws = (value) => {
    setFingerDraws(value);
    try {
      localStorage.setItem('netz_playground_finger_draws', String(value));
    } catch (e) {}
  };

  // Multi-Page Notebook State (Samsung Notes / Apple Notes parity)
  const [pages, setPages] = useState([{ id: 'page_1', title: 'Page 1', strokes: [], blocks: [], links: [], shapes: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Audio Voice Memo State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // Smart Block & Link Store (Reducer)
  const [blockState, dispatch] = useReducer(smartBlockReducer, INITIAL_SMART_BLOCK_STATE);

  // OCR Clusters State
  const [clusters, setClusters] = useState([]);

  // The block just added from the dock: it opens ready for typing
  const [autoEditBlockId, setAutoEditBlockId] = useState(null);

  // Ink currently selected with the lasso (drives the floating selection toolbar)
  const [inkSelection, setInkSelection] = useState(null);

  // Modal States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingTargetUrl, setPendingTargetUrl] = useState(null);
  const [softEditorCluster, setSoftEditorCluster] = useState(null);
  const [semanticLassoSelection, setSemanticLassoSelection] = useState(null);

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

    saveSession('default_session', sessionObj);
  }, []);

  const scheduleSave = useCallback(() => {
    if (!isSessionLoadedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSavePending(true);
    const run = () => {
      if (drawingNowRef.current) {
        saveTimerRef.current = setTimeout(run, SAVE_DELAY_MS);
        return;
      }
      saveTimerRef.current = null;
      persistSession();
    };
    saveTimerRef.current = setTimeout(run, SAVE_DELAY_MS);
  }, [persistSession]);

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
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);
  const showNotice = useCallback((message, durationMs = 3000) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNotice(message);
    noticeTimerRef.current = setTimeout(() => setNotice(null), durationMs);
  }, []);

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
    // Warm up lightweight 400KB neural router in background
    modelManager.loadRouter().catch(() => {});
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

  // Track if session has active content
  const hasUnsavedContent = latestStrokesRef.current.length > 0 || blockState.blocks.length > 0 || shapes.length > 0;

  // Expose global window handler for in-app navigation intercept (Sidebar links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__NETZ_PLAYGROUND_HAS_UNSAVED_CHANGES__ = hasUnsavedContent;
      window.__NETZ_OPEN_UNSAVED_MODAL__ = (targetUrl) => {
        setPendingTargetUrl(targetUrl);
        setIsUnsavedModalOpen(true);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.__NETZ_PLAYGROUND_HAS_UNSAVED_CHANGES__ = false;
        window.__NETZ_OPEN_UNSAVED_MODAL__ = null;
      }
    };
  }, [hasUnsavedContent]);

  // Auto-Save prevents data loss; native beforeunload disabled to eliminate ugly browser reload prompt
  // (Reloads F5 cleanly like Google Docs/Figma while restoring drawings instantly; in-app nav uses WPS popup)

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

    // In 'selection' mode, do not auto-recompute OCR on every stroke write
    if (ocrMode === 'selection') {
      return;
    }

    // In Notes Mode, writing is freeform and purely on-demand via the Lasso tool.
    // We only auto-evaluate if an explicit '=' gesture is drawn for instant math solving.
    if (notesMode) {
      const rawClusters = clusterStrokes(allStrokes, 32);
      const instantEqualsCluster = rawClusters.find((c) => c.hasEqualsGesture);
      if (!instantEqualsCluster) {
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

      // Auto-select latest recognized cluster if Lasso tool is active
      const recognizedClusters = processed.filter((c) => c.detectedText);
      if (recognizedClusters.length > 0 && activeTool === 'lasso') {
        setSelectedClusterId(recognizedClusters[recognizedClusters.length - 1].clusterId);
      }
    }, delay);
  }, [activeTool, ocrMode, notesMode, commitHistory, scheduleSave]);

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

  // Handle Manual Selection OCR Trigger (when user selects drawn area with Lasso)
  const handleSelectionCompleted = useCallback(async ({ strokes: selectedStrokes, bbox, lassoPolygon }) => {
    // Highlighter marks and snapped shapes inside the lasso are not writing and are left out of recognition
    const strokes = (selectedStrokes || []).filter((s) => s.tool !== 'highlighter' && !s.shape);
    if (strokes.length === 0) return;
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

  // Handle Voice Memo Recording Toggle
  const handleToggleRecordAudio = async () => {
    if (isRecordingAudio) {
      try {
        const audioResult = await stopAudioRecording();
        setIsRecordingAudio(false);

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
              title: `Lecture Audio (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            },
            linkedBlockIds: [],
            position: { x: spawnX, y: spawnY },
            size: { width: 360, height: 180 },
            status: 'active',
            isMinimal: false,
          };

          dispatch({ type: 'ADD_BLOCK', payload: audioBlock });
        }
      } catch (err) {
        console.error('Failed to stop audio recording:', err);
        setIsRecordingAudio(false);
      }
    } else {
      try {
        await startAudioRecording();
        setIsRecordingAudio(true);
      } catch (err) {
        showNotice(err.message || 'Microphone access is required for audio recording.', 5000);
        setIsRecordingAudio(false);
      }
    }
  };

  // Native Playground Save (Persists session right here in Playground without popups)
  const handleManualSave = () => {
    persistSession();
    setIsSavedToastVisible(true);
    setTimeout(() => setIsSavedToastVisible(false), 2000);
  };

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

  // Multi-Page Actions
  const handleSelectPage = (newIdx) => {
    if (newIdx === currentPageIndexRef.current || newIdx < 0 || newIdx >= pagesRef.current.length) return;
    
    const updatedPages = getSyncedPagesState();
    setPages(updatedPages);
    pagesRef.current = updatedPages;

    setCurrentPageIndex(newIdx);
    currentPageIndexRef.current = newIdx;

    const targetPage = updatedPages[newIdx];
    dispatch({
      type: 'SET_SESSION',
      payload: {
        blocks: targetPage.blocks || [],
        links: targetPage.links || [],
      },
    });
    applyShapes(targetPage.shapes || []);

    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.loadStrokes(targetPage.strokes || []);
    }
    resetHistory(targetPage.strokes || [], targetPage.blocks || [], targetPage.links || [], targetPage.shapes || []);

    persistSession(updatedPages, newIdx, targetPage.blocks || [], targetPage.links || []);
  };

  const handleAddPage = () => {
    const synced = getSyncedPagesState();
    const newPageNum = synced.length + 1;
    const newPage = {
      id: `page_${Date.now()}`,
      title: `Page ${newPageNum}`,
      strokes: [],
      blocks: [],
      links: [],
      shapes: [],
    };

    const nextPages = [...synced, newPage];
    const newIdx = nextPages.length - 1;

    setPages(nextPages);
    pagesRef.current = nextPages;

    setCurrentPageIndex(newIdx);
    currentPageIndexRef.current = newIdx;

    dispatch({ type: 'SET_SESSION', payload: { blocks: [], links: [] } });
    applyShapes([]);
    if (whiteboardCanvasRef.current) {
      // loadStrokes, not clearStrokes: showing an empty new page is not an edit to any page
      whiteboardCanvasRef.current.loadStrokes([]);
    }
    resetHistory([], [], [], []);

    persistSession(nextPages, newIdx, [], []);
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
  };

  const handleDeletePage = (delIdx) => {
    if (pagesRef.current.length <= 1) return;
    const synced = getSyncedPagesState();
    const remaining = synced.filter((_, idx) => idx !== delIdx);
    const newIdx = Math.min(currentPageIndexRef.current, remaining.length - 1);

    setPages(remaining);
    pagesRef.current = remaining;

    setCurrentPageIndex(newIdx);
    currentPageIndexRef.current = newIdx;

    const targetPage = remaining[newIdx];
    dispatch({
      type: 'SET_SESSION',
      payload: {
        blocks: targetPage.blocks || [],
        links: targetPage.links || [],
      },
    });
    applyShapes(targetPage.shapes || []);

    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.loadStrokes(targetPage.strokes || []);
    }
    resetHistory(targetPage.strokes || [], targetPage.blocks || [], targetPage.links || [], targetPage.shapes || []);

    persistSession(remaining, newIdx, targetPage.blocks || [], targetPage.links || []);
  };

  const handleDuplicatePage = (dupIdx) => {
    const synced = getSyncedPagesState();
    const srcPage = synced[dupIdx];
    const currentStrokes = whiteboardCanvasRef.current?.getStrokes ? whiteboardCanvasRef.current.getStrokes() : [];
    const srcStrokes = dupIdx === currentPageIndexRef.current ? currentStrokes : (srcPage.strokes || []);

    const dupPage = {
      id: `page_${Date.now()}`,
      title: `${srcPage.title} (Copy)`,
      strokes: JSON.parse(JSON.stringify(srcStrokes)),
      blocks: JSON.parse(JSON.stringify(srcPage.blocks || blockStateRef.current.blocks)),
      links: JSON.parse(JSON.stringify(srcPage.links || blockStateRef.current.links)),
      shapes: JSON.parse(JSON.stringify(dupIdx === currentPageIndexRef.current ? latestShapesRef.current : srcPage.shapes || [])),
    };

    const nextPages = [...synced.slice(0, dupIdx + 1), dupPage, ...synced.slice(dupIdx + 1)];
    const newIdx = dupIdx + 1;

    setPages(nextPages);
    pagesRef.current = nextPages;

    setCurrentPageIndex(newIdx);
    currentPageIndexRef.current = newIdx;

    dispatch({
      type: 'SET_SESSION',
      payload: {
        blocks: dupPage.blocks,
        links: dupPage.links,
      },
    });
    applyShapes(dupPage.shapes);

    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.loadStrokes(dupPage.strokes);
    }
    resetHistory(dupPage.strokes, dupPage.blocks, dupPage.links, dupPage.shapes);

    persistSession(nextPages, newIdx, dupPage.blocks, dupPage.links);
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
    dispatch({
      type: 'LINK_BLOCKS',
      payload: { sourceBlockId: equationBlock.blockId, targetBlockId: graphBlockId },
    });
  };

  // Handle Contextual CAS AI Actions
  // exampleLatex: an example picked in the menu goes into the equation first, then the action runs on it
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
    const pageTitle = pagesRef.current[currentPageIndexRef.current]?.title || 'page';
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
    });
    if (result.ok) {
      showNotice(`Saved ${result.fileName}`);
    } else if (result.reason === 'empty') {
      showNotice('There is nothing on this page to export yet.');
    } else {
      showNotice('The export failed. Please try again.');
    }
  };

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
    const areaTop = 72;
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
      const shift = Math.min(r.bottom - limit, Math.max(0, r.top - 72));
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
  const handleViewportGesture = useCallback((next) => {
    viewportRef.current = next;
    setZoomLevel(next.zoom);
    setPanOffset(next.pan);
  }, []);

  // Dock buttons anchor at the centre of the screen
  const viewCentre = () => ({ x: dimensions.width / 2, y: dimensions.height / 2 });
  const handleZoomIn = () => zoomTo(viewportRef.current.zoom * 1.2, viewCentre());
  const handleZoomOut = () => zoomTo(viewportRef.current.zoom / 1.2, viewCentre());
  const handleResetZoom = () => zoomTo(1, viewCentre());

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

  return (
    <div
      ref={containerRef}
      onPointerDown={handleMouseDown}
      onPointerMove={handleMouseMove}
      onPointerUp={handleMouseUp}
      onPointerCancel={handleMouseUp}
      className="relative w-full h-[100dvh] overflow-hidden bg-zinc-50 dark:bg-zinc-950 select-none overscroll-none touch-none touch-canvas-surface"
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

      {/* Shapes, under the ink so the pen writes on them */}
      <ShapeLayer shapes={shapes} zoomLevel={zoomLevel} panOffset={panOffset} width={dimensions.width} height={dimensions.height} editingId={editingShapeId} />

      {/* Layer 2 & 3: Hardware Accelerated Whiteboard Canvas */}
      <WhiteboardCanvas
        ref={whiteboardCanvasRef}
        activeTool={activeTool}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        zoomLevel={zoomLevel}
        panOffset={panOffset}
        width={dimensions.width}
        height={dimensions.height}
        shapeItem={activeTool === 'shape' ? armedShape : null}
        shapeDefaults={shapeDefaults}
        onShapeDrawn={handleShapeDrawn}
        onSelectPress={shapeEditor.handleSelectPress}
        onLassoFinished={handleLassoFinished}
        connectionHints={connectionHintsFor}
        onStrokesUpdated={handleStrokesUpdated}
        onDrawingStateChange={handleDrawingStateChange}
        onSelectionCompleted={handleSelectionCompleted}
        onSelectionChange={handleInkSelectionChange}
        fingerDraws={fingerDraws}
        onViewportChange={handleViewportGesture}
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
          onDeleteBlock={(blockId) => dispatch({ type: 'REMOVE_BLOCK', payload: blockId })}
          onSelectAiAction={handleSelectAiAction}
        >
          {block.type === 'equation' && (
            <EquationBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
              onPlotGraph={handlePlotGraph}
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
              onDeleteBlock={(blockId) => dispatch({ type: 'REMOVE_BLOCK', payload: blockId })}
            />
          )}

          {block.type === 'image' && (
            <ImageBlock
              block={block}
              onUpdateContent={handleUpdateBlockContent}
            />
          )}
        </SmartBlockWrapper>
      ))}

      {/* Top Floating Page Manager (Multi-Page Notebook) */}
      <div className="fixed top-3 sm:top-4 left-3 sm:left-16 md:left-[96px] z-40 transition-all max-w-[calc(100vw-24px)]">
        <PageManager
          pages={pages}
          currentPageIndex={currentPageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onClearPage={handleClearPage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onManualSave={handleManualSave}
          isJustSaved={isSavedToastVisible}
        />
      </div>

      {/* Short status message */}
      {/* Insert > Screenshot: the editor, the countdown, the photo picker */}
      {screenshot.elements}

      {notice && (
        <div
          role="status"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 dark:bg-zinc-100/95 text-white dark:text-zinc-900 text-xs font-medium shadow-xl pointer-events-none"
        >
          {notice}
        </div>
      )}

      {/* Floating AI Neural Engine Loading & Status Indicator */}
      <AIModelLoadingStatusPill />

      {/* Live Universal Text & KaTeX Preview Pill Overlay */}
      <LiveMathPreviewOverlay
        clusters={clusters}
        zoomLevel={zoomLevel}
        panOffset={panOffset}
        isDrawing={isDrawing}
        showLiveOcr={showLiveOcr || ocrMode === 'selection'}
        selectedClusterId={selectedClusterId}
        onConvertCluster={handleConvertClusterToBlock}
        onPlotClusterGraph={(cluster) => {
          handleConvertClusterToBlock(cluster);
        }}
        onOpenSoftEditor={(cluster) => setSoftEditorCluster(cluster)}
        onReadAsMath={handleReadClusterAsMath}
        onReadAsText={handleReadClusterAsText}
      />

      {/* Lasso selection toolbar: drag the selection to move it, its corner handle to resize it */}
      {inkSelection && !isDrawing && (() => {
        const rawScreenX = inkSelection.bbox.minX * zoomLevel + panOffset.x - 8;
        const clampedToolbarX = Math.max(12, Math.min(dimensions.width - 160, rawScreenX));
        const rawScreenY = inkSelection.bbox.maxY * zoomLevel + panOffset.y + 20;
        const clampedToolbarY = (rawScreenY + 60 > dimensions.height - 80)
          ? Math.max(70, inkSelection.bbox.minY * zoomLevel + panOffset.y - 56)
          : Math.max(70, Math.min(dimensions.height - 90, rawScreenY));
        return (
          <div
            style={{
              transform: `translate(${clampedToolbarX}px, ${clampedToolbarY}px)`,
            }}
            className="absolute top-0 left-0 z-30 flex items-center gap-1.5 p-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl select-none"
          >
            {(whiteboardCanvasRef.current?.getStrokes?.() || []).some((st) => inkSelection.strokeIds.includes(st.id) && isConvertibleStroke(st)) && (
              <button
                onClick={handleConvertInkToShapes}
                title="Convert to Shape: turn the snapped ink into shapes you can resize, colour and type in"
                aria-label="Convert to Shape"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                <LuShapes className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => whiteboardCanvasRef.current?.duplicateSelection()}
              title="Duplicate selection"
              aria-label="Duplicate selection"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <FiCopy className="w-5 h-5" />
            </button>
            <button
              onClick={() => whiteboardCanvasRef.current?.recolorSelection(strokeColor)}
              title="Apply the current pen colour to the selection"
              aria-label="Apply the current pen colour to the selection"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="block w-5 h-5 rounded-full border border-black/10 dark:border-white/20" style={{ backgroundColor: strokeColor }} />
            </button>
            <button
              onClick={() => whiteboardCanvasRef.current?.deleteSelection()}
              title="Delete selection (Delete key)"
              aria-label="Delete selection"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
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
          className="fixed z-50 px-2 py-1 rounded-md bg-zinc-900/85 text-white text-[11px] font-semibold tabular-nums pointer-events-none"
        >
          {shapeEditor.gestureInfo.kind === 'rotate'
            ? `${Math.round(shapeEditor.gestureInfo.rot)}°`
            : `${Math.round(shapeEditor.gestureInfo.w)} × ${Math.round(shapeEditor.gestureInfo.h)}`}
        </div>
      )}

      {/* Soft Editor & Hypotheses Resolver Modal */}
      <SoftEditorModal
        isOpen={Boolean(softEditorCluster)}
        cluster={softEditorCluster}
        onClose={() => setSoftEditorCluster(null)}
        onApplyCorrection={(cluster, correctedText, assignedType) => {
          const isMath = assignedType === 'MATH' || assignedType === 'FRACTION';
          const updatedCluster = {
            ...cluster,
            detectedText: correctedText,
            isMath,
            type: assignedType,
          };
          handleConvertClusterToBlock(updatedCluster, correctedText);
        }}
      />

      {/* Semantic Lasso Modal */}
      <SemanticLassoModal
        isOpen={Boolean(semanticLassoSelection)}
        selectedStrokes={semanticLassoSelection?.strokes || []}
        strokeIds={semanticLassoSelection?.strokeIds || []}
        bbox={semanticLassoSelection?.bbox || null}
        onClose={() => setSemanticLassoSelection(null)}
        onAssignSemanticType={async (typeId, strokes, strokeIds, bbox) => {
          const isMath = typeId === 'MATH' || typeId === 'FRACTION';
          const cluster = {
            clusterId: `lasso_${Date.now()}`,
            strokes,
            strokeIds,
            bbox,
            detectedText: '',
            isMath,
            type: typeId,
            ocrStatus: 'pending',
          };
          const currentMode = notesMode ? 'notes' : 'normal';
          const res = await processClusterOCR(cluster, { forceRefresh: true, mode: currentMode });
          if (res && res.detectedText) {
            handleConvertClusterToBlock({ ...cluster, ...res });
          } else {
            setSoftEditorCluster(cluster);
          }
        }}
      />

      {/* Workspace Sync Modal */}
      <InkToBlockConverterModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        blocks={blockState.blocks}
        onConfirmSync={(payload) => {
          // Save to Notes workspace via localStorage
          try {
            const rawV2 = localStorage.getItem('netz_notes_v2_data');
            const existingV2 = rawV2 ? JSON.parse(rawV2) : [];
            const existingNotes = JSON.parse(localStorage.getItem('netz_notes') || '[]');
            const newNote = {
              id: `note_${Date.now()}`,
              title: payload.title || 'Playground Math Session Notes',
              subtitle: 'Synced from Playground Whiteboard',
              tags: ['Playground', 'Math'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPublic: false,
              accessKey: `NETZ-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
              author: 'Student',
              blocks: payload.blocks.map((b, idx) => ({
                id: b.id || `b-${Date.now()}-${idx}`,
                type: b.type === 'math' ? 'math' : b.type === 'graph' ? 'paragraph' : 'paragraph',
                content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
              })),
            };
            existingNotes.unshift(newNote);
            existingV2.unshift(newNote);
            localStorage.setItem('netz_notes', JSON.stringify(existingNotes));
            localStorage.setItem('netz_notes_v2_data', JSON.stringify(existingV2));
          } catch (err) {
            console.error('Failed to sync to Notes workspace:', err);
          }
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
        setStrokeOpacity={setStrokeOpacity}
        gridStyle={gridStyle}
        setGridStyle={setGridStyle}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        fingerDraws={fingerDraws}
        setFingerDraws={handleSetFingerDraws}
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
        screenshot={screenshot}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onExportCanvas={handleExportCanvas}
        showLiveOcr={notesMode ? true : showLiveOcr}
        setShowLiveOcr={notesMode ? undefined : setShowLiveOcr}
        ocrMode={ocrMode}
        setOcrMode={setOcrMode}
        notesMode={notesMode}
        setNotesMode={(mode) => {
          setNotesMode(mode);
          if (mode) {
            // Auto-enable Live OCR when entering Notes Mode, remembering what was set before
            ocrBeforeNotesRef.current = { showLiveOcr, ocrMode };
            setShowLiveOcr(true);
            setOcrMode('live');
          } else if (ocrBeforeNotesRef.current) {
            setShowLiveOcr(ocrBeforeNotesRef.current.showLiveOcr);
            setOcrMode(ocrBeforeNotesRef.current.ocrMode);
            ocrBeforeNotesRef.current = null;
          }
        }}
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

      {/* Floating Ambient Background Music Player */}
      <BackgroundMusicPlayer />

      {/* Unsaved Changes WPS Prompt Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => {
          setIsUnsavedModalOpen(false);
          setPendingTargetUrl(null);
        }}
        pageTitle={pages[currentPageIndex]?.title || 'Page 1'}
        onSave={() => {
          handleManualSave();
          setIsUnsavedModalOpen(false);
          if (pendingTargetUrl) {
            router.push(pendingTargetUrl);
            setPendingTargetUrl(null);
          }
        }}
        onDontSave={() => {
          setIsUnsavedModalOpen(false);
          if (pendingTargetUrl) {
            router.push(pendingTargetUrl);
            setPendingTargetUrl(null);
          }
        }}
        onCancel={() => {
          setIsUnsavedModalOpen(false);
          setPendingTargetUrl(null);
        }}
      />
    </div>
  );
}
