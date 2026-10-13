/**
 * Universal Handwriting OCR & Text Recognition Pipeline
 *
 * Replaces the previous stub implementation with a real recognition engine.
 * Pipeline: Stroke Cluster → Rasterize to PNG → Gemini Vision API → Recognized Text/LaTeX
 *
 * For math expressions with '=', evaluates the LaTeX.
 * For general handwriting, returns the recognized text for typed block conversion.
 */

import { evaluateLatexExpression } from './latexEvaluator.js';
import { rasterizeStrokesToDataUrl, extractBase64FromDataUrl } from './strokeRasterizer.js';
import {
  recognizeHandwriting,
  getCachedResult,
  setCachedResult,
  generateCacheKey,
} from './localOCRService.js';
import { recognizeInkCluster } from './recognition/recognitionPipeline.js';

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

export { evaluateLatexExpression };

/**
 * Main OCR & Evaluation entry point for a stroke cluster.
 *
 * Pipeline:
 * 1. Check cache for previously recognized result
 * 2. Run NETZ On-Device Neural Pipeline (Router + HTR / HMER + Heuristics)
 * 3. Fallback to rasterization + localOCRService if offline/loading
 * 4. Cache and return standard result contract
 *
 * @param {Object} cluster - Stroke cluster with .clusterId, .strokes, .strokeIds, .bbox, .hasEqualsGesture
 * @param {Object} options - Optional: { forceRefresh: boolean, mode: 'normal'|'notes', alwaysRunMath: boolean, preferType: 'MATH'|'TEXT' }
 * @returns {Promise<{ clusterId, detectedText, isMath, evaluatedResult, confidence, status, error } | null>}
 */
export async function processClusterOCR(cluster, options = {}) {
  const { clusterId, strokeIds = [], strokes = [], bbox } = cluster;
  const mode = options.mode || (cluster.notesMode ? 'notes' : 'normal');

  if (!strokes || strokes.length === 0) {
    return {
      clusterId,
      detectedText: '',
      isMath: false,
      evaluatedResult: null,
      confidence: 0,
      status: 'empty',
      error: null,
      mode,
      shouldConvert: false,
      action: 'none',
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

    // PRIMARY ATTEMPT: Run on-device NETZ Neural Ink & Pure Heuristics Pipeline
    try {
      console.log(
        '%c[NETZ Neural Pipeline] Running on-device ONNX model on strokes...',
        'color: #10b981; font-weight: bold;',
        { strokeCount: strokes.length, clusterId, mode }
      );
      const pipelineResult = await recognizeInkCluster(strokes, strokeIds, bbox, mode, {
        // Ink ending in "=" is a calculation: never let the Notes-mode text fast path skip maths
        alwaysRunMath: Boolean(cluster.hasEqualsGesture) || Boolean(options.alwaysRunMath),
        preferType: options.preferType,
      });
      if (controller.signal.aborted) return null;
      pendingOcrControllers.delete(clusterId);

      if (pipelineResult && pipelineResult.value) {
        console.log(
          `%c[NETZ Neural Pipeline] Recognized: "${pipelineResult.value}" (Type: ${pipelineResult.type}, Action: ${pipelineResult.action}, Conf: ${Math.round((pipelineResult.confidence.overall || 0.8) * 100)}%)`,
          'color: #10b981; font-weight: bold;'
        );
        const detectedText = pipelineResult.value;
        const isMath = pipelineResult.type === 'MATH' || pipelineResult.type === 'MIXED';
        let evaluatedResult = null;

        if (isMath && detectedText.includes('=')) {
          evaluatedResult = evaluateLatexExpression(detectedText);
        }

        const shouldConvert = pipelineResult.shouldConvert !== undefined ? pipelineResult.shouldConvert : true;
        const action = pipelineResult.action || (isMath ? 'convert_equation' : 'convert_text');

        const result = {
          detectedText,
          isMath,
          evaluatedResult,
          confidence: pipelineResult.confidence.overall,
          status: 'recognized',
          error: null,
          rawResult: pipelineResult,
          type: pipelineResult.type,
          ast: pipelineResult.ast,
          alternatives: pipelineResult.alternatives,
          confidenceDetails: pipelineResult.confidence,
          sourceStrokeIds: strokeIds,
          mode,
          shouldConvert,
          action,
          // True when the router was confident this is writing and the maths recogniser was not run
          mathsSkipped: Boolean(pipelineResult.routing && pipelineResult.routing.mathsSkipped),
        };

        setCachedResult(strokeIds, result);
        return {
          clusterId,
          ...result,
        };
      }
    } catch (pipelineErr) {
      console.warn('[handwritingOCR] On-device neural pipeline error, trying fallback:', pipelineErr);
    }

    if (controller.signal.aborted) return null;

    // FALLBACK ATTEMPT: Rasterize the stroke cluster to a PNG image
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

    const base64Image = extractBase64FromDataUrl(rasterResult.dataUrl);
    const fallbackMode = classifyClusterMode(cluster);

    const recognition = await recognizeHandwriting(base64Image, fallbackMode, controller.signal, { strokes, bbox });

    if (controller.signal.aborted) return null;
    pendingOcrControllers.delete(clusterId);

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

    let evaluatedResult = null;
    const detectedText = recognition.text || '';
    const isMath = recognition.isMath || false;

    if (isMath && detectedText.includes('=')) {
      evaluatedResult = evaluateLatexExpression(detectedText);
    }

    let shouldConvert = true;
    let action = isMath ? 'convert_equation' : 'convert_text';
    if (mode === 'normal') {
      if (!isMath) {
        shouldConvert = false;
        action = 'keep_ink';
      }
    } else {
      shouldConvert = true;
      action = isMath ? 'convert_equation' : 'convert_text';
    }

    const result = {
      detectedText,
      isMath,
      evaluatedResult,
      confidence: recognition.confidence || 0,
      status: detectedText ? 'recognized' : 'empty',
      error: null,
      mode,
      shouldConvert,
      action,
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
