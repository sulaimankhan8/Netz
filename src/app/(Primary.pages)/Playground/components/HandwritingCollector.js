'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { FiCheck, FiTrash2, FiSkipForward, FiDownload, FiCpu, FiClipboard, FiRotateCcw } from 'react-icons/fi';
import { recognizeInkCluster } from '../utils/recognition/recognitionPipeline';

/**
 * HandwritingCollector — Stage 0 evaluation-set recorder (/Playground/collect)
 *
 * Shows a prompt, records the strokes written for it, and stores { strokes, text, label, device }
 * on this device. Samples are exported as JSONL for benchmark_recognition.mjs and, later,
 * as real training data in the format the notebooks read.
 *
 * Also reports what this device actually delivers (pressure, tilt, event rate, WebGPU, audio
 * formats), which settles the "needs a device check" items in the improvement plan.
 *
 * Nothing is uploaded: samples stay in IndexedDB until the writer exports them.
 */

const LINE_SPACING = 32; // same ruling as Notes mode
const CANVAS_HEIGHT = 288;
const DB_NAME = 'netz_eval_db';
const STORE_NAME = 'samples';

const PROMPTS = [
  // Short words: some with no ascenders or descenders
  { text: 'can', label: 'TEXT', category: 'word' },
  { text: 'sum', label: 'TEXT', category: 'word' },
  { text: 'area', label: 'TEXT', category: 'word' },
  { text: 'error', label: 'TEXT', category: 'word' },
  { text: 'matrix', label: 'TEXT', category: 'word' },
  { text: 'tangent', label: 'TEXT', category: 'word' },
  { text: 'quickly', label: 'TEXT', category: 'word' },
  { text: 'Newton', label: 'TEXT', category: 'word' },
  { text: 'Simpson', label: 'TEXT', category: 'word' },
  { text: 'bisection', label: 'TEXT', category: 'word' },
  // Phrases
  { text: 'initial guess', label: 'TEXT', category: 'phrase' },
  { text: 'step size h', label: 'TEXT', category: 'phrase' },
  { text: 'rate of change', label: 'TEXT', category: 'phrase' },
  { text: 'root of the equation', label: 'TEXT', category: 'phrase' },
  { text: 'mean and variance', label: 'TEXT', category: 'phrase' },
  { text: 'upper and lower limits', label: 'TEXT', category: 'phrase' },
  // Full lines
  { text: 'The method converges when the error is small.', label: 'TEXT', category: 'line' },
  { text: 'Divide the interval into six equal parts.', label: 'TEXT', category: 'line' },
  { text: 'Find the area under the curve using the rule.', label: 'TEXT', category: 'line' },
  { text: 'Apply the formula again with the new value.', label: 'TEXT', category: 'line' },
  { text: 'Check the answer by substituting it back.', label: 'TEXT', category: 'line' },
  { text: 'We reject the null hypothesis at five percent.', label: 'TEXT', category: 'line' },
  // Several lines, one under the other (write each row on its own ruled line)
  { text: 'Newton method is fast\nbut needs a good start', label: 'TEXT', category: 'paragraph' },
  { text: 'First find the interval\nthen halve it each time\nuntil the error is small', label: 'TEXT', category: 'paragraph' },
  { text: 'Simpson rule needs\nan even number of strips', label: 'TEXT', category: 'paragraph' },
  { text: 'The slope is positive\nso the root lies\nto the left of x', label: 'TEXT', category: 'paragraph' },
  // Numbers
  { text: '24', label: 'NUMBER', category: 'number' },
  { text: '1024', label: 'NUMBER', category: 'number' },
  { text: '2026', label: 'NUMBER', category: 'number' },
  { text: '17.5', label: 'NUMBER', category: 'number' },
  { text: '3.1416', label: 'NUMBER', category: 'number' },
  { text: '0.0001', label: 'NUMBER', category: 'number' },
  { text: '98765', label: 'NUMBER', category: 'number' },
  // Text with digits and punctuation
  { text: 'Take n = 6 and h = 0.5', label: 'TEXT', category: 'mixed' },
  { text: "Unit 3: Simpson's 1/3 rule", label: 'TEXT', category: 'mixed' },
  { text: 'Page 42, question 7 (b)', label: 'TEXT', category: 'mixed' },
  { text: 'error < 0.001 after 5 steps', label: 'TEXT', category: 'mixed' },
  // Maths (ground truth is LaTeX)
  { text: '24\\times5=', label: 'MATH', category: 'maths' },
  { text: '120\\div5=', label: 'MATH', category: 'maths' },
  { text: '\\frac{3}{4}+2=', label: 'MATH', category: 'maths' },
  { text: '\\sqrt{16}', label: 'MATH', category: 'maths' },
  { text: 'y=mx+c', label: 'MATH', category: 'maths' },
  { text: 'x^{2}+3x-4=0', label: 'MATH', category: 'maths' },
  { text: 'a^{2}+b^{2}=c^{2}', label: 'MATH', category: 'maths' },
  { text: '\\frac{dy}{dx}=2x', label: 'MATH', category: 'maths' },
  { text: 'e^{-x}', label: 'MATH', category: 'maths' },
  { text: 'f(x)=\\sin(x)', label: 'MATH', category: 'maths' },
  { text: '\\int_{0}^{1}x^{2}dx', label: 'MATH', category: 'maths' },
  { text: '\\sum_{i=1}^{n}x_{i}', label: 'MATH', category: 'maths' },
];

// ── IndexedDB helpers ──────────────────────────────────────────────────────────
function openSamplesDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(mode, run) {
  const db = await openSamplesDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const req = run(tx.objectStore(STORE_NAME));
    tx.oncomplete = () => resolve(req ? req.result : null);
    tx.onerror = () => reject(tx.error);
  });
}

const saveSample = (sample) => withStore('readwrite', (store) => store.put(sample));
const loadSamples = async () => (await withStore('readonly', (store) => store.getAll())) || [];
const deleteSample = (id) => withStore('readwrite', (store) => store.delete(id));
const clearSamples = () => withStore('readwrite', (store) => store.clear());

// ── Device capability report ───────────────────────────────────────────────────
function readDeviceCapabilities() {
  const audioTypes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/mp4;codecs=mp4a.40.2'];
  const hasRecorder = typeof MediaRecorder !== 'undefined';
  return {
    userAgent: navigator.userAgent,
    devicePixelRatio: window.devicePixelRatio || 1,
    viewport: `${window.innerWidth} x ${window.innerHeight}`,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    coalescedEvents: typeof PointerEvent !== 'undefined' && 'getCoalescedEvents' in PointerEvent.prototype,
    predictedEvents: typeof PointerEvent !== 'undefined' && 'getPredictedEvents' in PointerEvent.prototype,
    webgpu: 'gpu' in navigator,
    crossOriginIsolated: Boolean(window.crossOriginIsolated),
    handwritingApi: 'createHandwritingRecognizer' in navigator,
    recordableAudio: hasRecorder
      ? audioTypes.filter((type) => MediaRecorder.isTypeSupported?.(type)).join(', ') || 'none reported'
      : 'MediaRecorder missing',
  };
}

export default function HandwritingCollector() {
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStrokeRef = useRef(null);
  const penSeenRef = useRef(false);

  const [promptIndex, setPromptIndex] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [samples, setSamples] = useState([]);
  const [writer, setWriter] = useState('');
  const [capabilities, setCapabilities] = useState(null);
  const [live, setLive] = useState({ pointerType: '-', pressure: 0, tiltX: 0, tiltY: 0, eventsPerSecond: 0 });
  const [timing, setTiming] = useState(null);
  const [isTiming, setIsTiming] = useState(false);
  const [copied, setCopied] = useState(false);

  const prompt = PROMPTS[promptIndex % PROMPTS.length];

  // Draw the ruled background and all recorded strokes (device-pixel sharp)
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(CANVAS_HEIGHT * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(CANVAS_HEIGHT * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, CANVAS_HEIGHT);

    const isDark = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = LINE_SPACING; y < CANVAS_HEIGHT; y += LINE_SPACING) {
      ctx.moveTo(0, Math.floor(y) + 0.5);
      ctx.lineTo(width, Math.floor(y) + 0.5);
    }
    ctx.stroke();

    ctx.strokeStyle = isDark ? '#E4E4E7' : '#18181B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of strokesRef.current) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      if (stroke.length === 1) ctx.lineTo(stroke[0].x + 0.1, stroke[0].y + 0.1);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    setCapabilities(readDeviceCapabilities());
    try {
      setWriter(localStorage.getItem('netz_collect_writer') || '');
      setPromptIndex(parseInt(localStorage.getItem('netz_collect_prompt_index') || '0', 10) || 0);
    } catch (e) {}
    loadSamples().then(setSamples).catch(() => {});
    redraw();
    window.addEventListener('resize', redraw);
    return () => window.removeEventListener('resize', redraw);
  }, [redraw]);

  const clearInk = useCallback(() => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    setTiming(null);
    redraw();
  }, [redraw]);

  const goToPrompt = (index) => {
    const next = ((index % PROMPTS.length) + PROMPTS.length) % PROMPTS.length;
    setPromptIndex(next);
    try {
      localStorage.setItem('netz_collect_prompt_index', String(next));
    } catch (e) {}
    clearInk();
  };

  // ── Pointer capture ──────────────────────────────────────────────────────────
  const readPoints = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const native = e.nativeEvent;
    const events = typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [];
    return (events.length > 0 ? events : [native]).map((ev) => ({
      x: Math.round((ev.clientX - rect.left) * 100) / 100,
      y: Math.round((ev.clientY - rect.top) * 100) / 100,
      t: Math.round(ev.timeStamp * 10) / 10,
      p: Math.round((ev.pressure || 0) * 1000) / 1000,
      tiltX: ev.tiltX || 0,
      tiltY: ev.tiltY || 0,
    }));
  };

  // Once a pen has been used, fingers and the resting palm no longer draw
  const shouldIgnore = (e) => e.pointerType === 'touch' && penSeenRef.current;

  const handlePointerDown = (e) => {
    if (e.pointerType === 'pen') penSeenRef.current = true;
    if (shouldIgnore(e)) return;
    canvasRef.current.setPointerCapture(e.pointerId);
    activeStrokeRef.current = { pointerId: e.pointerId, pointerType: e.pointerType, points: readPoints(e) };
    strokesRef.current.push(activeStrokeRef.current.points);
    redraw();
  };

  // Only the newest segment is drawn while writing, so ink keeps up with a 240 Hz Pencil
  const handlePointerMove = (e) => {
    const active = activeStrokeRef.current;
    if (!active || active.pointerId !== e.pointerId) return;
    const points = readPoints(e);
    const from = active.points[active.points.length - 1];
    active.points.push(...points);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#E4E4E7' : '#18181B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    for (let i = 0; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  };

  const handlePointerUp = (e) => {
    const active = activeStrokeRef.current;
    if (!active || active.pointerId !== e.pointerId) return;
    activeStrokeRef.current = null;
    const pts = active.points;
    const last = pts[pts.length - 1];
    const durationMs = pts.length > 1 ? last.t - pts[0].t : 0;
    const maxPressure = pts.reduce((max, pt) => Math.max(max, pt.p), 0);
    setLive((prev) => ({
      pointerType: active.pointerType,
      pressure: maxPressure,
      tiltX: last.tiltX,
      tiltY: last.tiltY,
      eventsPerSecond: durationMs > 0 ? Math.round(((pts.length - 1) * 1000) / durationMs) : prev.eventsPerSecond,
    }));
    setStrokeCount(strokesRef.current.length);
  };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (strokesRef.current.length === 0) return;
    const sample = {
      id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      text: prompt.text,
      label: prompt.label,
      category: prompt.category,
      strokes: strokesRef.current,
      pointerType: live.pointerType,
      eventsPerSecond: live.eventsPerSecond,
      writer: writer.trim() || 'anonymous',
      lineSpacing: LINE_SPACING,
      device: capabilities
        ? { userAgent: capabilities.userAgent, devicePixelRatio: capabilities.devicePixelRatio, viewport: capabilities.viewport }
        : null,
      deviceTiming: timing,
      createdAt: new Date().toISOString(),
    };
    await saveSample(sample);
    setSamples((prev) => [...prev, sample]);
    goToPrompt(promptIndex + 1);
  };

  const handleUndoLastSample = async () => {
    const last = samples[samples.length - 1];
    if (!last) return;
    await deleteSample(last.id);
    setSamples((prev) => prev.slice(0, -1));
  };

  const handleClearAll = async () => {
    if (!confirm(`Delete all ${samples.length} saved samples from this device?`)) return;
    await clearSamples();
    setSamples([]);
  };

  const handleExport = () => {
    if (samples.length === 0) return;
    const jsonl = samples.map((s) => JSON.stringify(s)).join('\n') + '\n';
    const url = URL.createObjectURL(new Blob([jsonl], { type: 'application/x-ndjson' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `netz_handwriting_samples_${new Date().toISOString().slice(0, 10)}.jsonl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Runs the app's own recognition pipeline on the ink above, on this device
  const handleTimeRecognition = async () => {
    if (strokesRef.current.length === 0 || isTiming) return;
    setIsTiming(true);
    setTiming(null);
    try {
      const strokes = strokesRef.current.map((points, idx) => ({
        id: `s_${idx}`,
        points: points.map((pt) => ({ x: pt.x, y: pt.y, timestamp: pt.t })),
      }));
      const ids = strokes.map((s) => s.id);
      const firstStart = performance.now();
      await recognizeInkCluster(strokes, ids, null, 'notes'); // first run includes any model download
      const firstMs = Math.round(performance.now() - firstStart);
      const warmStart = performance.now();
      const result = await recognizeInkCluster(strokes, ids, null, 'notes');
      setTiming({
        firstRunMs: firstMs,
        warmRunMs: Math.round(performance.now() - warmStart),
        type: result.type,
        value: result.value,
        stages: result.timings || null,
      });
    } catch (err) {
      setTiming({ error: err.message || String(err) });
    }
    setIsTiming(false);
  };

  const handleCopyReport = async () => {
    const report = JSON.stringify({ ...capabilities, lastInput: live, lastTiming: timing }, null, 2);
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const counts = samples.reduce((acc, s) => ({ ...acc, [s.label]: (acc[s.label] || 0) + 1 }), {});
  const yesNo = (value) => (value ? 'yes' : 'no');

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pl-0 md:pl-[78px] select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Handwriting test set</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Write each prompt on the lines, the way you normally write. Samples stay on this device until you export them.
            </p>
          </div>
          <input
            type="text"
            value={writer}
            onChange={(e) => {
              setWriter(e.target.value);
              try {
                localStorage.setItem('netz_collect_writer', e.target.value);
              } catch (err) {}
            }}
            placeholder="Writer name or initials"
            aria-label="Writer name or initials"
            className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-blue-500 select-text"
          />
        </div>

        {/* Prompt */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            <span>
              Prompt {(promptIndex % PROMPTS.length) + 1} / {PROMPTS.length} · {prompt.category}
            </span>
            <span>
              Saved: {samples.length} (text {counts.TEXT || 0}, numbers {counts.NUMBER || 0}, maths {counts.MATH || 0})
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold min-h-[40px] whitespace-pre-line">
            {prompt.label === 'MATH' ? <InlineMath math={prompt.text} /> : prompt.text}
          </div>
        </div>

        {/* Writing area */}
        <canvas
          ref={canvasRef}
          style={{ height: CANVAS_HEIGHT }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm touch-none cursor-crosshair"
        />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            disabled={strokeCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white shadow-sm transition-all active:scale-95"
          >
            <FiCheck className="w-4 h-4" />
            <span>Save & next</span>
          </button>
          <button
            onClick={clearInk}
            disabled={strokeCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            <FiRotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            onClick={() => goToPrompt(promptIndex + 1)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <FiSkipForward className="w-4 h-4" />
            <span>Skip</span>
          </button>
          <button
            onClick={handleTimeRecognition}
            disabled={strokeCount === 0 || isTiming}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            <FiCpu className="w-4 h-4" />
            <span>{isTiming ? 'Recognising...' : 'Time recognition on this device'}</span>
          </button>

          <div className="flex-1" />

          <button
            onClick={handleUndoLastSample}
            disabled={samples.length === 0}
            className="px-3 py-2 text-xs font-medium rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            Remove last saved
          </button>
          <button
            onClick={handleExport}
            disabled={samples.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white shadow-sm transition-all"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export {samples.length} samples</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={samples.length === 0}
            title="Delete all saved samples"
            aria-label="Delete all saved samples"
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>

        {/* On-device recognition timing */}
        {timing && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 text-xs font-mono space-y-1 select-text">
            {timing.error ? (
              <div className="text-rose-500">Recognition failed: {timing.error}</div>
            ) : (
              <>
                <div>
                  Read as {timing.type}: <span className="font-semibold">{timing.value || '(nothing)'}</span>
                </div>
                <div>
                  First run {timing.firstRunMs} ms (includes any model download) · warm run {timing.warmRunMs} ms
                </div>
                {timing.stages && (
                  <div>
                    Router {timing.stages.routerMs} ms · maths model {timing.stages.hmerMs} ms · text model {timing.stages.htrMs} ms
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Device report */}
        {capabilities && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 select-text">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold">This device</h2>
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <FiClipboard className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy report'}</span>
              </button>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-3 text-xs font-mono">
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Last input</dt><dd>{live.pointerType}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Points per second (last stroke)</dt><dd>{live.eventsPerSecond || '-'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Peak pressure (last stroke)</dt><dd>{live.pressure}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Tilt x / y</dt><dd>{live.tiltX} / {live.tiltY}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Coalesced events</dt><dd>{yesNo(capabilities.coalescedEvents)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Predicted events</dt><dd>{yesNo(capabilities.predictedEvents)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Pixel ratio</dt><dd>{capabilities.devicePixelRatio}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Viewport</dt><dd>{capabilities.viewport}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">WebGPU</dt><dd>{yesNo(capabilities.webgpu)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Cross-origin isolated</dt><dd>{yesNo(capabilities.crossOriginIsolated)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Browser handwriting API</dt><dd>{yesNo(capabilities.handwritingApi)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-500">Touch points</dt><dd>{capabilities.maxTouchPoints}</dd></div>
              <div className="flex justify-between gap-3 sm:col-span-2"><dt className="text-zinc-500 shrink-0">Recordable audio</dt><dd className="text-right">{capabilities.recordableAudio}</dd></div>
              <div className="flex justify-between gap-3 sm:col-span-2"><dt className="text-zinc-500 shrink-0">Browser</dt><dd className="text-right break-all">{capabilities.userAgent}</dd></div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
