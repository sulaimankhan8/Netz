/**
 * Clean Lightweight Digital Ink & Vector Handwriting Recognition Service
 *
 * Streamlined production engine:
 *   Layer 0: Instant Vector Topology Matcher (sub-1ms punctuation, Greek, calculus & math primitives)
 *   Layer 1: Google Digital Ink Vector Engine (Online, 0 API keys required)
 *   Layer 2: Native W3C OS Handwriting API (Native OS offline engine on Chromium)
 *
 * Decommissioned:
 *   - Legacy Tesseract.js (removed 15MB WASM download & printed-OCR hallucinations)
 *   - Legacy TrOCR Vision Transformer (removed 150MB third-party model download)
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
 * Greek letter & math symbol candidate map for Google IME disambiguation.
 */
const GREEK_MATH_MAP = {
  'θ': '\\theta ',
  'theta': '\\theta ',
  'Theta': '\\Theta ',
  'Θ': '\\Theta ',
  'γ': '\\gamma ',
  'gamma': '\\gamma ',
  'Gamma': '\\Gamma ',
  'Γ': '\\Gamma ',
  'α': '\\alpha ',
  'alpha': '\\alpha ',
  'β': '\\beta ',
  'beta': '\\beta ',
  'δ': '\\delta ',
  'delta': '\\delta ',
  'Delta': '\\Delta ',
  'Δ': '\\Delta ',
  'λ': '\\lambda ',
  'lambda': '\\lambda ',
  'Lambda': '\\Lambda ',
  'Λ': '\\Lambda ',
  'μ': '\\mu ',
  'mu': '\\mu ',
  'pi': '\\pi ',
  'Pi': '\\Pi ',
  'Π': '\\Pi ',
  'σ': '\\sigma ',
  'sigma': '\\sigma ',
  'Sigma': '\\Sigma ',
  'Σ': '\\Sigma ',
  'ω': '\\omega ',
  'omega': '\\omega ',
  'Omega': '\\Omega ',
  'Ω': '\\Omega ',
  'phi': '\\phi ',
  'Phi': '\\Phi ',
  'Φ': '\\Phi ',
  'psi': '\\psi ',
  'Psi': '\\Psi ',
  'Ψ': '\\Psi ',
  'sqrt': '\\sqrt{',
  'infty': '\\infty ',
  'infinity': '\\infty ',
  'sum': '\\sum ',
  'int': '\\int ',
  'approx': '\\approx ',
  'pm': '\\pm ',
  'times': '\\times ',
  'div': '\\div ',
};

/**
 * Converts ink strokes into Google Digital Ink API payload format.
 */
function convertStrokesToInkPayload(strokes, width = 800, height = 600) {
  const ink = [];

  for (const stroke of strokes) {
    const pts = stroke.points || [];
    if (pts.length === 0) continue;

    const xArr = [];
    const yArr = [];
    const tArr = [];

    const baseTime = pts[0].timestamp || 0;
    for (let i = 0; i < pts.length; i++) {
      xArr.push(Math.round(pts[i].x));
      yArr.push(Math.round(pts[i].y));
      tArr.push(Math.round((pts[i].timestamp || i * 16) - baseTime));
    }

    ink.push([xArr, yArr, tArr]);
  }

  return {
    input_type: 0,
    requests: [
      {
        language: 'en',
        writing_guide: {
          writing_area_width: width,
          writing_area_height: height,
        },
        ink,
        pre_context: '',
        max_num_results: 5,
        max_completions: 0,
      },
    ],
  };
}

/**
 * Recognizes strokes using Google Digital Ink API.
 */
async function recognizeOnlineDigitalInk(strokes, bbox, signal = null) {
  const width = Math.max(300, Math.ceil(bbox.maxX - bbox.minX + 100));
  const height = Math.max(200, Math.ceil(bbox.maxY - bbox.minY + 100));

  const payload = convertStrokesToInkPayload(strokes, width, height);

  const res = await fetch('https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Google IME HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
    const candidates = data[1][0][1];
    if (candidates.length > 0) {
      for (const cand of candidates) {
        const lower = cand.toLowerCase().trim();
        if (GREEK_MATH_MAP[lower]) {
          return {
            text: GREEK_MATH_MAP[lower],
            confidence: 0.98,
          };
        }
      }
      return {
        text: candidates[0],
        confidence: 0.95,
      };
    }
  }

  return null;
}

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
 * Layer 1 (Online): Google Digital Ink vector engine.
 * Layer 2 (Native): W3C Handwriting Recognition API.
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

  // Layer 1: Google Digital Ink online vector engine
  if (strokeData && strokeData.strokes && strokeData.strokes.length > 0 && strokeData.bbox) {
    try {
      const onlineResult = await recognizeOnlineDigitalInk(strokeData.strokes, strokeData.bbox, signal);
      if (onlineResult && onlineResult.text) {
        const cleanedText = postProcessText(onlineResult.text);
        const isMath = onlineResult.isMath || mode === 'math' || (mode === 'auto' && classifyAsMath(cleanedText));

        return {
          text: isMath ? textToRichLatex(cleanedText) : cleanedText,
          isMath,
          confidence: onlineResult.confidence || 0.95,
          engine: 'google-digital-ink-online',
          error: null,
        };
      }
    } catch {
      // Offline fallback
    }
  }

  // Layer 2: Native W3C OS API
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
