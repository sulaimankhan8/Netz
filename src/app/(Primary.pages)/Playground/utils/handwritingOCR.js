/**
 * Universal Handwriting OCR & Text Recognition Pipeline
 *
 * Replaces the previous stub implementation with a real recognition engine.
 * Pipeline: Stroke Cluster → Rasterize to PNG → Gemini Vision API → Recognized Text/LaTeX
 *
 * For math expressions with '=', evaluates the LaTeX.
 * For general handwriting, returns the recognized text for typed block conversion.
 */

import { evaluateMath } from '../../../utils/evaluateMath';
import { rasterizeStrokesToDataUrl, extractBase64FromDataUrl } from './strokeRasterizer';
import {
  recognizeHandwriting,
  getCachedResult,
  setCachedResult,
  generateCacheKey,
} from './localOCRService';

/**
 * Task cancellation registry for OCR requests in flight.
 */
const pendingOcrControllers = new Map();

/**
 * Determines recognition mode based on stroke cluster geometry heuristics.
 *
 * @param {Object} cluster - Stroke cluster with .strokes, .hasEqualsGesture, .bbox
 * @returns {'math' | 'text' | 'auto'} Recognition mode hint
 */
function classifyClusterMode(cluster) {
  // If equals gesture is detected, definitely math
  if (cluster.hasEqualsGesture) {
    return 'math';
  }

  // Default: let the recognition engine auto-classify based on recognized content
  return 'auto';
}

/**
 * Evaluates a math expression string if it ends with '='.
 *
 * @param {string} latexStr - LaTeX or plain math expression
 * @returns {string|null} Evaluated result string, or null if not evaluable
 */
export function evaluateLatexExpression(latexStr) {
  if (!latexStr || !latexStr.endsWith('=')) return null;

  try {
    const cleanExpr = latexStr.replace(/\s*=\s*$/, '').trim();
    if (!cleanExpr) return null;

    const result = evaluateMath(cleanExpr, 1);
    if (result !== undefined && result !== null) {
      return String(result);
    }
  } catch (err) {
    // Evaluation failed — expression may be symbolic
  }

  return null;
}

/**
 * Main OCR & Evaluation entry point for a stroke cluster.
 *
 * Pipeline:
 * 1. Check cache for previously recognized result
 * 2. Rasterize stroke cluster to PNG bitmap
 * 3. Send to Gemini Vision API for recognition
 * 4. Cache and return result
 * 5. Evaluate math if applicable
 *
 * @param {Object} cluster - Stroke cluster with .clusterId, .strokes, .strokeIds, .bbox, .hasEqualsGesture
 * @param {Object} options - Optional: { forceRefresh: boolean }
 * @returns {Promise<{ clusterId, detectedText, isMath, evaluatedResult, confidence, status, error } | null>}
 */
export async function processClusterOCR(cluster, options = {}) {
  const { clusterId, strokeIds = [], strokes = [], bbox } = cluster;

  if (!strokes || strokes.length === 0) {
    return {
      clusterId,
      detectedText: '',
      isMath: false,
      evaluatedResult: null,
      confidence: 0,
      status: 'empty',
      error: null,
    };
  }

  // Cancel any previous pending OCR for this cluster
  if (pendingOcrControllers.has(clusterId)) {
    const prevController = pendingOcrControllers.get(clusterId);
    prevController.abort();
    pendingOcrControllers.delete(clusterId);
  }

  // Check cache first (unless forceRefresh is requested)
  if (!options.forceRefresh) {
    const cached = getCachedResult(strokeIds);
    if (cached) {
      return {
        clusterId,
        ...cached,
      };
    }
  }

  // Create AbortController for this request
  const controller = new AbortController();
  pendingOcrControllers.set(clusterId, controller);

  try {
    if (controller.signal.aborted) return null;

    // Step 1: Rasterize the stroke cluster to a PNG image
    const rasterResult = rasterizeStrokesToDataUrl(strokes, bbox);

    if (!rasterResult || !rasterResult.dataUrl) {
      pendingOcrControllers.delete(clusterId);
      return {
        clusterId,
        detectedText: '',
        isMath: false,
        evaluatedResult: null,
        confidence: 0,
        status: 'raster_failed',
        error: 'RASTER_FAILED',
      };
    }

    if (controller.signal.aborted) return null;

    // Step 2: Extract base64 and determine recognition mode
    const base64Image = extractBase64FromDataUrl(rasterResult.dataUrl);
    const mode = classifyClusterMode(cluster);

    // Step 3: Run recognition (Digital Ink vector engine with offline WASM fallback)
    const recognition = await recognizeHandwriting(base64Image, mode, controller.signal, { strokes, bbox });

    if (controller.signal.aborted) return null;

    pendingOcrControllers.delete(clusterId);

    // Handle recognition errors gracefully
    if (recognition.error && recognition.error !== 'ABORTED') {
      return {
        clusterId,
        detectedText: '',
        isMath: false,
        evaluatedResult: null,
        confidence: 0,
        status: 'error',
        error: recognition.error,
      };
    }

    // Step 4: Evaluate math if applicable
    let evaluatedResult = null;
    const detectedText = recognition.text || '';
    const isMath = recognition.isMath || false;

    if (isMath && detectedText.includes('=')) {
      evaluatedResult = evaluateLatexExpression(detectedText);
    }

    // Step 5: Cache the result
    const result = {
      detectedText,
      isMath,
      evaluatedResult,
      confidence: recognition.confidence || 0,
      status: detectedText ? 'recognized' : 'empty',
      error: null,
    };

    setCachedResult(strokeIds, result);

    return {
      clusterId,
      ...result,
    };
  } catch (err) {
    pendingOcrControllers.delete(clusterId);

    if (err.name === 'AbortError') {
      return null;
    }

    console.error('[HandwritingOCR] Unexpected error:', err);
    return {
      clusterId,
      detectedText: '',
      isMath: false,
      evaluatedResult: null,
      confidence: 0,
      status: 'error',
      error: 'UNEXPECTED_ERROR',
    };
  }
}

/**
 * Cancels all pending OCR requests.
 */
export function cancelAllPendingOCR() {
  for (const [, controller] of pendingOcrControllers) {
    controller.abort();
  }
  pendingOcrControllers.clear();
}
