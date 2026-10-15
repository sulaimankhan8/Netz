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
import { exportPage } from '../utils/exportEngine';
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
import { zoomAtPoint } from '../utils/viewportMath';
import { prepareImage, fitImageBox } from '../utils/imageSizing';

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
  const [pages, setPages] = useState([{ id: 'page_1', title: 'Page 1', strokes: [], blocks: [], links: [] }]);
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
    });
  }
  // Set while one user action changes both ink and blocks, so it becomes a single undo step
  const holdStrokeCommitRef = useRef(false);
  const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });

  const syncHistoryFlags = useCallback(() => {
    const canUndo = historyRef.current.canUndo();
    const canRedo = historyRef.current.canRedo();
    setHistoryFlags((prev) => (prev.canUndo === canUndo && prev.canRedo === canRedo ? prev : { canUndo, canRedo }));
  }, []);

  // Records the page's current state as a new undo step (no-op when nothing changed)
  const commitHistory = useCallback(() => {
    if (!isSessionLoadedRef.current) return;
    const committed = historyRef.current.commit({
      strokes: latestStrokesRef.current,
      blocks: blockStateRef.current.blocks,
      links: blockStateRef.current.links,
    });
    if (committed) syncHistoryFlags();
  }, [syncHistoryFlags]);

  // Starts a fresh history from this state (another page was opened, or the session was restored)
  const resetHistory = useCallback((strokes, blocks, links) => {
    latestStrokesRef.current = strokes;
    historyRef.current.reset({ strokes, blocks, links });
    syncHistoryFlags();
  }, [syncHistoryFlags]);

  // Block edits arrive in bursts (dragging, typing): one undo step once they settle
  useEffect(() => {
    const timer = setTimeout(commitHistory, 350);
    return () => clearTimeout(timer);
  }, [blockState.blocks, blockState.links, commitHistory]);

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
      // The restored page is the starting point: undo must never step back to an empty page
      resetHistory(activeStrokes, activeBlocks, activeLinks);

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
  }, [resetHistory]);

  // Save Session when blocks or links change (dragging or typing changes them many times a second)
  useEffect(() => {
    scheduleSave();
  }, [blockState.blocks, blockState.links, scheduleSave]);

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

    const activePageIndex = currentPageIndexRef.current;
    setPages((prevPages) =>
      prevPages.map((p, idx) =>
        idx === activePageIndex ? { ...p, strokes: snapshot.strokes, blocks: snapshot.blocks, links: snapshot.links } : p
      )
    );

    // Recognition results refer to ink that may no longer exist
    if (ocrDebounceTimerRef.current) clearTimeout(ocrDebounceTimerRef.current);
    ocrPassRef.current++;
    setClusters([]);
    setSelectedClusterId(null);

    persistSession(undefined, undefined, snapshot.blocks, snapshot.links);
    syncHistoryFlags();
  }, [persistSession, syncHistoryFlags]);

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
  const hasUnsavedContent = latestStrokesRef.current.length > 0 || blockState.blocks.length > 0;

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

  // Spawn New Smart Block with Compact Type-Specific Dimensions
  const handleAddBlock = (type) => {
    const newBlockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    // Each new block lands a little down and to the right of the last, so they do not stack
    const cascade = (blockStateRef.current.blocks.length % 6) * 28;

    // Clamp block width so new blocks are never wider than the visible screen minus margin
    const screenMargin = 32;
    const maxVisibleWidth = Math.max(260, Math.floor((dimensions.width - screenMargin) / zoomLevel));

    let defaultContent = {};
    let defaultSize = { width: Math.min(360, maxVisibleWidth), height: 140 };

    if (type === 'equation') {
      defaultContent = { latex: '' };
      defaultSize = { width: Math.min(360, maxVisibleWidth), height: 140 };
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
    // Equation and text blocks open in edit mode, with the cursor in them
    if (type === 'equation' || type === 'theory') setAutoEditBlockId(newBlockId);
  };

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

    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.loadStrokes(targetPage.strokes || []);
    }
    resetHistory(targetPage.strokes || [], targetPage.blocks || [], targetPage.links || []);

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
    };

    const nextPages = [...synced, newPage];
    const newIdx = nextPages.length - 1;

    setPages(nextPages);
    pagesRef.current = nextPages;

    setCurrentPageIndex(newIdx);
    currentPageIndexRef.current = newIdx;

    dispatch({ type: 'SET_SESSION', payload: { blocks: [], links: [] } });
    if (whiteboardCanvasRef.current) {
      // loadStrokes, not clearStrokes: showing an empty new page is not an edit to any page
      whiteboardCanvasRef.current.loadStrokes([]);
    }
    resetHistory([], [], []);

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

    const synced = getSyncedPagesState();
    synced[currentPageIndexRef.current].strokes = [];
    synced[currentPageIndexRef.current].blocks = [];
    synced[currentPageIndexRef.current].links = [];

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

    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.loadStrokes(targetPage.strokes || []);
    }
    resetHistory(targetPage.strokes || [], targetPage.blocks || [], targetPage.links || []);

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

    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.loadStrokes(dupPage.strokes);
    }
    resetHistory(dupPage.strokes, dupPage.blocks, dupPage.links);

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
  const handleSelectAiAction = (block, actionKey) => {
    const latexStr = block.content?.latex || 'x^2 - 4';

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
