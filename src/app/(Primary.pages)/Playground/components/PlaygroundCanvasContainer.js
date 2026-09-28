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
import { startAudioRecording, stopAudioRecording } from '../utils/audioRecorder';

import { clusterStrokes } from '../utils/spatialClusterer';
import { processClusterOCR } from '../utils/handwritingOCR';
import { preloadOCREngine } from '../utils/localOCRService';
import { initAutocompleteTrie } from '../utils/autocompleteTrie';
import { generateGraphDatasetFromLatex } from '../utils/equationToGraph';
import { exportCanvasToPng, exportCanvasToSvg, exportCanvasToPdf } from '../utils/exportEngine';
import {
  differentiateExpression,
  integrateExpression,
  solveRootsExpression,
  formatRawMathToTeX,
} from '../utils/mathASTEvaluator';
import {
  smartBlockReducer,
  INITIAL_SMART_BLOCK_STATE,
  saveSessionToIndexedDB,
  loadSessionFromIndexedDB,
} from '../utils/smartBlockStore';

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
  const [gridStyle, setGridStyle] = useState('dots');

  // Drawing & Live OCR Opt-In State (Default 'selection' = clean canvas, manual selection OCR!)
  const [isDrawing, setIsDrawing] = useState(false);
  const [showLiveOcr, setShowLiveOcr] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [ocrMode, setOcrMode] = useState('selection'); // 'selection' (manual on selection) | 'live' (auto on draw)

  // Notes Mode State — when true, enables lined paper, auto-OCR, and note-taking UI
  const [notesMode, setNotesMode] = useState(false);

  // Multi-Page Notebook State (Samsung Notes / Apple Notes parity)
  const [pages, setPages] = useState([{ id: 'page_1', title: 'Page 1', strokes: [], blocks: [], links: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Audio Voice Memo State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // Smart Block & Link Store (Reducer)
  const [blockState, dispatch] = useReducer(smartBlockReducer, INITIAL_SMART_BLOCK_STATE);

  // OCR Clusters State
  const [clusters, setClusters] = useState([]);

  // Modal States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingTargetUrl, setPendingTargetUrl] = useState(null);

  // Pan State, Canvas & Persistence Refs
  const containerRef = useRef(null);
  const isMiddlePanRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const ocrDebounceTimerRef = useRef(null);
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

  // Centralized Bulletproof Session Persistence Helper
  const persistSession = useCallback((overridePages, overrideIndex, overrideBlocks, overrideLinks) => {
    if (!isSessionLoadedRef.current) return; // Prevent overwriting session before initial load finishes!

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

    saveSessionToIndexedDB('default_session', sessionObj);
    try {
      localStorage.setItem('NETZ_PLAYGROUND_SESSION_BACKUP', JSON.stringify(sessionObj));
    } catch (e) {}
  }, []);

  // Save Feedback Toast State
  const [isSavedToastVisible, setIsSavedToastVisible] = useState(false);

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
      latestStrokesRef.current = activeStrokes;

      dispatch({
        type: 'SET_SESSION',
        payload: {
          blocks: activePage.blocks || saved.blocks || [],
          links: activePage.links || saved.links || [],
        },
      });

      isSessionLoadedRef.current = true;

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

    let restored = false;
    try {
      const backup = localStorage.getItem('NETZ_PLAYGROUND_SESSION_BACKUP');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed && parsed.pages && parsed.pages.length > 0) {
          restoreSession(parsed);
          restored = true;
        }
      }
    } catch (e) {}

    loadSessionFromIndexedDB('default_session', (saved) => {
      if (!restored && saved && saved.pages && saved.pages.length > 0) {
        restoreSession(saved);
      } else if (!restored) {
        isSessionLoadedRef.current = true;
      }
    });

    preloadOCREngine();
    initAutocompleteTrie();
  }, []);

  // Save Session whenever blocks or links change (guarded by isSessionLoadedRef)
  useEffect(() => {
    if (isSessionLoadedRef.current) {
      persistSession();
    }
  }, [blockState.blocks, blockState.links, persistSession]);

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
  }, [panOffset, dimensions, zoomLevel]);

  // Stroke Updates Listener (Auto-saves ink strokes & updates active page state)
  const handleStrokesUpdated = useCallback((allStrokes) => {
    latestStrokesRef.current = allStrokes;
    // Synchronously update active page strokes & persist session
    setPages((prevPages) => {
      const updatedPages = prevPages.map((p, idx) => {
        if (idx === currentPageIndex) {
          return { ...p, strokes: allStrokes };
        }
        return p;
      });

      pagesRef.current = updatedPages;

      const sessionObj = {
        pages: updatedPages,
        currentPageIndex,
        blocks: blockState.blocks,
        links: blockState.links,
      };

      saveSessionToIndexedDB('default_session', sessionObj);
      try {
        localStorage.setItem('NETZ_PLAYGROUND_SESSION_BACKUP', JSON.stringify(sessionObj));
      } catch (e) {}

      return updatedPages;
    });

    if (ocrDebounceTimerRef.current) {
      clearTimeout(ocrDebounceTimerRef.current);
    }

    // In 'selection' mode, do not auto-recompute OCR on every stroke write
    if (ocrMode === 'selection') {
      return;
    }

    const rawClusters = clusterStrokes(allStrokes, 90);
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

    ocrDebounceTimerRef.current = setTimeout(async () => {
      const processed = await Promise.all(
        rawClusters.map(async (c) => {
          const res = await processClusterOCR(c);
          return {
            ...c,
            detectedText: res ? res.detectedText : '',
            isMath: res ? res.isMath : false,
            evaluatedResult: res ? res.evaluatedResult : null,
            confidence: res ? res.confidence : 0,
            ocrStatus: res ? (res.status || 'recognized') : 'error',
            ocrError: res ? res.error : null,
          };
        })
      );

      setClusters(processed);

      // Auto-select latest recognized cluster if Lasso tool is active
      const recognizedClusters = processed.filter((c) => c.detectedText);
      if (recognizedClusters.length > 0 && activeTool === 'lasso') {
        setSelectedClusterId(recognizedClusters[recognizedClusters.length - 1].clusterId);
      }
    }, delay);
  }, [activeTool, ocrMode, currentPageIndex, blockState.blocks, blockState.links]);

  // Handle Manual Selection OCR Trigger (when user selects drawn area with Lasso)
  const handleSelectionCompleted = useCallback(async ({ strokes, strokeIds, bbox }) => {
    if (!strokes || strokes.length === 0) return;

    const selectionClusterId = `selection_${Date.now()}`;
    const selectionCluster = {
      clusterId: selectionClusterId,
      strokeIds,
      strokes,
      bbox,
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

    const res = await processClusterOCR(selectionCluster, { forceRefresh: true });

    if (res) {
      const updatedCluster = {
        ...selectionCluster,
        detectedText: res.detectedText || '',
        isMath: res.isMath || false,
        evaluatedResult: res.evaluatedResult || null,
        confidence: res.confidence || 0,
        ocrStatus: res.detectedText ? 'recognized' : (res.status || 'error'),
        ocrError: res.error || null,
      };

      setClusters((prev) =>
        prev.map((c) => (c.clusterId === selectionClusterId ? updatedCluster : c))
      );
    }
  }, []);

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

      if (linkedGraphIds.length > 0) {
        const newDataset = generateGraphDatasetFromLatex(content.latex, content.latex, [-10, 10], 0);
        if (newDataset) {
          linkedGraphIds.forEach((graphId) => {
            dispatch({
              type: 'UPDATE_BLOCK_CONTENT',
              payload: {
                blockId: graphId,
                content: {
                  graphData: { datasets: [newDataset] },
                },
              },
            });
          });
        }
      }
    }
  }, []);

  // Spawn New Smart Block with Compact Type-Specific Dimensions
  const handleAddBlock = (type) => {
    const newBlockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const spawnX = Math.round((-panOffset.x + dimensions.width / 2 - 190) / zoomLevel);
    const spawnY = Math.round((-panOffset.y + dimensions.height / 2 - 100) / zoomLevel);

    let defaultContent = {};
    let defaultSize = { width: 360, height: 140 };

    if (type === 'equation') {
      defaultContent = { latex: 'y = x^2 - 4x + 3' };
      defaultSize = { width: 360, height: 140 };
    } else if (type === 'graph') {
      const graphDataset = generateGraphDatasetFromLatex('y = x^2 - 4x + 3', 'f(x) = x² - 4x + 3', [-10, 10], 0);
      defaultContent = {
        graphData: {
          datasets: graphDataset ? [graphDataset] : [],
        },
      };
      defaultSize = { width: 440, height: 320 };
    } else if (type === 'theory') {
      defaultContent = { text: 'Class Notes: Tap anywhere on this text to edit or correct words.' };
      defaultSize = { width: 380, height: 220 };
    }

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
  };

  // Handle Image Insertion onto Canvas
  const handleInsertImage = (dataUrl) => {
    if (!dataUrl) return;
    const spawnX = Math.round((-panOffset.x + dimensions.width / 2 - 180) / zoomLevel);
    const spawnY = Math.round((-panOffset.y + dimensions.height / 2 - 140) / zoomLevel);

    const imageBlockId = `block_img_${Date.now()}`;
    const imageBlock = {
      blockId: imageBlockId,
      type: 'image',
      content: {
        imageUrl: dataUrl,
        caption: '',
      },
      linkedBlockIds: [],
      position: { x: spawnX, y: spawnY },
      size: { width: 360, height: 280 },
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
            size: { width: 320, height: 110 },
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
        alert(err.message || 'Microphone access is required for audio recording.');
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
      whiteboardCanvasRef.current.clearStrokes();
    }

    persistSession(nextPages, newIdx, [], []);
  };

  const handleClearPage = () => {
    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.clearStrokes();
    }
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

    persistSession(nextPages, newIdx, dupPage.blocks, dupPage.links);
  };

  // Convert OCR Handwriting Cluster to In-Place Editable Typed Block (Replacing Ink)
  // Accepts optional editedText override from user corrections in the preview pill
  const handleConvertClusterToBlock = (cluster, editedText = null) => {
    const spawnX = cluster.bbox.minX;
    const spawnY = cluster.bbox.minY;
    const width = Math.max(260, (cluster.bbox.maxX - cluster.bbox.minX) + 60);

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
      position: { x: spawnX, y: spawnY },
      size: { width, height: 100 },
      status: 'active',
      isMinimal: !cluster.isMath,
    };

    dispatch({ type: 'ADD_BLOCK', payload: newBlock });

    // Erase converted handwritten ink strokes from canvas
    if (whiteboardCanvasRef.current && cluster.strokeIds) {
      whiteboardCanvasRef.current.eraseStrokesByIds(cluster.strokeIds);
    }

    // Remove preview pill once converted
    setClusters((prev) => prev.filter((c) => c.clusterId !== cluster.clusterId));
    setSelectedClusterId(null);
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

    const dataset = generateGraphDatasetFromLatex(latexStr, latexStr || 'f(x)', [-10, 10], 0);

    if (existingLinkedGraph) {
      if (dataset) {
        dispatch({
          type: 'UPDATE_BLOCK_CONTENT',
          payload: {
            blockId: existingLinkedGraph.blockId,
            content: {
              graphData: { datasets: [dataset] },
            },
          },
        });
      }
      return;
    }

    const graphBlockId = `block_graph_${Date.now()}`;
    const graphBlock = {
      blockId: graphBlockId,
      type: 'graph',
      content: {
        graphData: {
          datasets: dataset ? [dataset] : [],
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
  const handleExportCanvas = (format) => {
    if (!containerRef.current) return;
    if (format === 'PNG') {
      exportCanvasToPng(containerRef.current);
    } else if (format === 'SVG') {
      exportCanvasToSvg(containerRef.current);
    } else if (format === 'PDF') {
      exportCanvasToPdf(containerRef.current);
    }
  };

  // Zoom Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev / 1.2, 0.2));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Wheel Handler for Panning & Pinch-Zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoomLevel((prevZoom) => Math.min(Math.max(prevZoom * zoomFactor, 0.2), 5));
    } else {
      setPanOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Middle-Click Pan Handler & Canvas Selection Click Handler
  const handleMouseDown = (e) => {
    if (e.button === 1 || activeTool === 'pan') {
      isMiddlePanRef.current = true;
      startPanRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
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
    setPanOffset({
      x: e.clientX - startPanRef.current.x,
      y: e.clientY - startPanRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isMiddlePanRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-screen h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 select-none"
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
        zoomLevel={zoomLevel}
        panOffset={panOffset}
        width={dimensions.width}
        height={dimensions.height}
        onStrokesUpdated={handleStrokesUpdated}
        onDrawingStateChange={setIsDrawing}
        onSelectionCompleted={handleSelectionCompleted}
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
      <div className="fixed top-4 left-4 z-40">
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
      />

      {/* Workspace Sync Modal */}
      <InkToBlockConverterModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        blocks={blockState.blocks}
        onConfirmSync={(payload) => {
          // Save to Notes workspace via localStorage
          try {
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
            localStorage.setItem('netz_notes', JSON.stringify(existingNotes));
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
        gridStyle={gridStyle}
        setGridStyle={setGridStyle}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
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
          // Auto-enable Live OCR when entering Notes Mode
          if (mode) {
            setShowLiveOcr(true);
            setOcrMode('live');
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
