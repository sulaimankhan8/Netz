/**
 * Clean Lightweight Digital Ink & Vector Handwriting Recognition Service
 *
 * Streamlined production engine (fully on-device: no ink is sent over the network):
 *   Layer 0: Instant Vector Topology Matcher (sub-1ms punctuation, Greek, calculus & math primitives)
 *   Layer 1: Native W3C OS Handwriting API (Native OS offline engine where the browser provides one)
 *
 * Decommissioned:
 *   - Legacy Tesseract.js (removed 15MB WASM download & printed-OCR hallucinations)
 *   - Legacy TrOCR Vision Transformer (removed 150MB third-party model download)
 *   - Google Digital Ink online endpoint (removed: sent user strokes off the device).
 *     It survives only in benchmark_recognition.mjs as a developer reference score.
 *   - Replaced by native NETZ ONNX Neural Pipeline (Router, HMER, HTR).
 */

import { getStrokesBBox } from './strokeRasterizer.js';
import { matchVectorSymbol } from './vectorSymbolMatcher.js';

/**
 * Recognition result cache.
 */
const recognitionCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * Recognizes strokes via native W3C Handwriting Recognition API (Chromium).
 */
async function recognizeWithNativeHandwritingAPI(strokes, bbox) {
  if (typeof navigator === 'undefined' || !navigator.queryHandwritingRecognizer) {
    return null;
  }

  try {
    const recognizer = await navigator.createHandwritingRecognizer({
      languages: ['en'],
      alternatives: 3,
    });
    if (!recognizer) return null;

    const strokeList = strokes.map((s) => ({
      pointList: (s.points || []).map((p) => ({ x: p.x, y: p.y, t: p.timestamp || 0 })),
    }));

    const drawing = recognizer.startDrawing();
    for (const st of strokeList) {
      drawing.addStroke(st);
    }

    const predictions = await drawing.getPrediction();
    if (predictions && predictions.length > 0 && predictions[0].text) {
      return {
        text: predictions[0].text.trim(),
        confidence: 0.98,
        engine: 'native-w3c-os',
      };
    }
  } catch (err) {
    // Silent
  }

  return null;
}

/**
 * Regex patterns for detecting math content in recognized text.
 */
const MATH_PATTERNS = [
  /^\s*[\d\s+\-*/^=().]+\s*$/,
  /[a-zA-Z]\s*=\s*[\d\s+\-*/^().]+/,
  /[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)/,
  /\b(sin|cos|tan|cot|sec|csc|log|ln|sqrt|lim|sum|int|theta|alpha|beta|gamma|delta|lambda|sigma|pi|mu|phi|psi|omega|infty)\b/i,
  /[∫∑∏√±∞πθαβγδεζηλμσϕψωΓΔΘΛΣΦΩ≠≈≤≥×÷∂∇∈∉⊂∪∩∅∀∃→⇒]/,
  /\d+\s*[+\-*/^]\s*\d+/,
  /[a-zA-Z]\^[\d{]/,
];

export function classifyAsMath(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return MATH_PATTERNS.some((pat) => pat.test(trimmed));
}

export function textToRichLatex(text) {
  if (!text) return text;
  let s = text.trim();

  s = s.replace(/([a-zA-Z])\s*\^\s*(\d+)/g, '$1^{$2}');
  s = s.replace(/(?<=[0-9a-zA-Z])\s*\/\s*(?=[0-9a-zA-Z])/g, ' \\div ');
  s = s.replace(/(?<=[0-9a-zA-Z])\s*\*\s*(?=[0-9a-zA-Z])/g, ' \\times ');

  s = s.replace(/\bsqrt\(([^)]+)\)/gi, '\\sqrt{$1}');
  s = s.replace(/\bsqrt\s*\{([^}]+)\}/gi, '\\sqrt{$1}');
  s = s.replace(/\bsqrt\s+([0-9a-zA-Z]+)/gi, '\\sqrt{$1}');

  s = s.replace(/\b(sin|cos|tan|cot|sec|csc|log|ln|lim)\b/gi, '\\$1');
  s = s.replace(/\b(theta|alpha|beta|gamma|delta|lambda|sigma|pi|mu|phi|psi|omega)\b/gi, '\\$1');
  s = s.replace(/\b(Gamma|Delta|Lambda|Sigma|Phi|Psi|Omega)\b/g, '\\$1');
  s = s.replace(/\b(int|sum|prod|infty)\b/gi, '\\$1');

  return s;
}

export function postProcessText(rawText) {
  if (!rawText) return '';
  let cleaned = rawText
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  cleaned = cleaned.replace(/^['"`~|\\]+|['"`~|\\]+$/g, '');
  return cleaned;
}

/**
 * Main handwriting fallback recognition entry point.
 * Layer 0: High-speed Vector Topological Matcher (deterministic 0ms symbol recognition).
 * Layer 1 (Native): W3C Handwriting Recognition API.
 */
export async function recognizeHandwriting(base64Image, mode = 'auto', signal = null, strokeData = null) {
  // Layer 0: Fast Vector Geometry & Topological Matcher
  if (strokeData && strokeData.strokes && strokeData.strokes.length > 0) {
    const vectorMatch = matchVectorSymbol(strokeData.strokes, strokeData.bbox || getStrokesBBox(strokeData.strokes));
    if (vectorMatch && vectorMatch.confidence >= 0.90) {
      const isMath = vectorMatch.isMath;
      return {
        text: isMath ? textToRichLatex(vectorMatch.text) : vectorMatch.text,
        isMath,
        confidence: vectorMatch.confidence,
        engine: 'vector-topology-matcher',
        error: null,
      };
    }
  }

  // Layer 1: Native W3C OS API
  if (strokeData && strokeData.strokes && strokeData.strokes.length > 0 && strokeData.bbox) {
    try {
      if (signal?.aborted) return { text: '', isMath: false, confidence: 0, error: 'ABORTED' };
      const nativeResult = await recognizeWithNativeHandwritingAPI(strokeData.strokes, strokeData.bbox);
      if (nativeResult && nativeResult.text) {
        const cleanedText = postProcessText(nativeResult.text);
        const isMath = nativeResult.isMath || mode === 'math' || (mode === 'auto' && classifyAsMath(cleanedText));

        return {
          text: isMath ? textToRichLatex(cleanedText) : cleanedText,
          isMath,
          confidence: nativeResult.confidence || 0.98,
          engine: 'native-w3c-os',
          error: null,
        };
      }
    } catch {}
  }

  return {
    text: '',
    isMath: false,
    confidence: 0,
    error: null,
  };
}

export function getOCREngineStatus() {
  return 'ready';
}

export function preloadOCREngine() {
  // Legacy stub retained for backward compatibility with no-op execution
}

export function generateCacheKey(strokeIds) {
  if (!strokeIds || strokeIds.length === 0) return '';
  return strokeIds.slice().sort().join('|');
}

export function getCachedResult(strokeIds) {
  const key = generateCacheKey(strokeIds);
  return recognitionCache.get(key) || null;
}

export function setCachedResult(strokeIds, result) {
  const key = generateCacheKey(strokeIds);

  if (recognitionCache.size >= MAX_CACHE_SIZE) {
    const firstKey = recognitionCache.keys().next().value;
    recognitionCache.delete(firstKey);
  }

  recognitionCache.set(key, result);
}

export function clearRecognitionCache() {
  recognitionCache.clear();
}

export function terminateOCREngine() {
  // No workers to terminate
}
