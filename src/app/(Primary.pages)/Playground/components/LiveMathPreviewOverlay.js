'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { FiCheck, FiBarChart2, FiEdit2, FiAlertCircle, FiLoader } from 'react-icons/fi';

/**
 * LiveMathPreviewOverlay
 *
 * Floating preview pills attached to handwritten stroke clusters.
 * Shows 3 states:
 *   - Pending:    Spinner while OCR is in progress
 *   - Recognized: Shows detected text/LaTeX with Edit and Convert buttons
 *   - Error:      Shows error message with "Tap to type manually" option
 *
 * Supports inline text editing so users can correct OCR mistakes before converting.
 */
export default function LiveMathPreviewOverlay({
  clusters = [],
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  isDrawing = false,
  showLiveOcr = false,
  selectedClusterId = null,
  onConvertCluster,
  onPlotClusterGraph,
}) {
  // Track inline editing state per cluster
  const [editingClusterId, setEditingClusterId] = useState(null);
  const [editText, setEditText] = useState('');

  // Hide preview overlays while actively drawing
  if (isDrawing || !clusters || clusters.length === 0) return null;

  const handleStartEdit = (cluster) => {
    setEditingClusterId(cluster.clusterId);
    setEditText(cluster.detectedText || '');
  };

  const handleConfirmEdit = (cluster) => {
    if (onConvertCluster) {
      onConvertCluster(cluster, editText);
    }
    setEditingClusterId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingClusterId(null);
    setEditText('');
  };

  const handleConvertManual = (cluster) => {
    // Open an editable block with empty text for manual typing
    if (onConvertCluster) {
      onConvertCluster(cluster, '');
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {clusters.map((cluster) => {
        const ocrStatus = cluster.ocrStatus || 'pending';

        // Show pill if live OCR is toggled ON, if cluster is selected, or if it is a manual Lasso selection cluster
        const isSelectionCluster = cluster.clusterId && cluster.clusterId.startsWith('selection_');
        const isSelected = selectedClusterId === cluster.clusterId;
        if (!showLiveOcr && !isSelected && !isSelectionCluster) return null;

        const { bbox, detectedText, isMath, evaluatedResult } = cluster;
        const isEditing = editingClusterId === cluster.clusterId;

        // Position pill floating cleanly ABOVE the top of the stroke bounding box
        const screenX = bbox.minX * zoomLevel + panOffset.x;
        const screenY = bbox.minY * zoomLevel + panOffset.y - 48;

        return (
          <div
            key={cluster.clusterId}
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
            }}
            className="absolute top-0 left-0 pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl text-xs transition-all duration-200 select-none animate-in fade-in zoom-in-95"
          >
            {/* ── STATE: PENDING (OCR in progress) ── */}
            {ocrStatus === 'pending' && (
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium text-[11px]">Recognizing...</span>
              </div>
            )}

            {/* ── STATE: OCR ENGINE LOADING (first-time WASM download) ── */}
            {ocrStatus === 'no_api_key' && (
              <div className="flex items-center gap-2">
                <FiLoader className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  Loading OCR engine...
                </span>
              </div>
            )}

            {/* ── STATE: ERROR ── */}
            {(ocrStatus === 'error' || ocrStatus === 'raster_failed') && (
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[11px] font-medium text-rose-500">
                  Recognition failed
                </span>
                <button
                  onClick={() => handleConvertManual(cluster)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <FiEdit2 className="w-3 h-3" />
                  <span>Type manually</span>
                </button>
              </div>
            )}

            {/* ── STATE: RECOGNIZED (text detected) ── */}
            {(ocrStatus === 'recognized' || ocrStatus === 'empty') && detectedText && !isEditing && (
              <>
                {/* Recognized Text or KaTeX Math Formula */}
                <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100 max-w-[280px]">
                  {isMath ? (
                    <InlineMath math={detectedText} renderError={(error) => <span className="font-mono text-xs">{detectedText}</span>} />
                  ) : (
                    <span className="font-sans text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {detectedText}
                    </span>
                  )}

                  {/* Evaluated Live Math Result */}
                  {isMath && evaluatedResult !== null && evaluatedResult !== undefined && (
                    <span className="ml-1 text-blue-600 dark:text-blue-400 font-bold font-mono">
                      {evaluatedResult}
                    </span>
                  )}
                </div>

                {/* Selection Action Toolbar */}
                <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                  {/* Edit recognized text */}
                  <button
                    onClick={() => handleStartEdit(cluster)}
                    title="Edit recognized text"
                    className="p-1 text-zinc-400 hover:text-blue-500 rounded-md transition-colors"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Plot Graph (math only) */}
                  {isMath && onPlotClusterGraph && (
                    <button
                      onClick={() => onPlotClusterGraph(cluster)}
                      title="Plot Graph from Equation"
                      className="p-1 text-zinc-400 hover:text-blue-500 rounded-md transition-colors"
                    >
                      <FiBarChart2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Convert to typed block */}
                  {onConvertCluster && (
                    <button
                      onClick={() => onConvertCluster(cluster)}
                      title="Convert handwriting to editable typed block"
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-sm transition-all"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>Convert</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ── STATE: EDITING (inline text correction) ── */}
            {isEditing && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmEdit(cluster);
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelEdit();
                    }
                  }}
                  autoFocus
                  placeholder="Correct the text..."
                  className="w-48 px-2 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-blue-500 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  onClick={() => handleConfirmEdit(cluster)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>Save & Convert</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ── STATE: RECOGNIZED BUT EMPTY (recognized but no text found) ── */}
            {ocrStatus === 'recognized' && !detectedText && !isEditing && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  No text detected
                </span>
                <button
                  onClick={() => handleConvertManual(cluster)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <FiEdit2 className="w-3 h-3" />
                  <span>Type manually</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
