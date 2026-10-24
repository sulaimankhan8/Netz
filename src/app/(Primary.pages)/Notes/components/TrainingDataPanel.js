'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuDownload, LuPencil, LuTrash2 } from 'react-icons/lu';
import { BTN_MAIN, BTN_SECONDARY, ICON_BTN, Modal } from './ui';
import { formatBytes } from '../utils/assetCore';
import { TRAINING_EVENT, TRAINING_MAX_BYTES, clearTrainingSamples, deleteTrainingSample, listTrainingSamples, trainingToJsonl } from '../utils/assetStore';

const SHOWN = 60;

/** The ink of one sample, small. */
function InkThumb({ strokes }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const pts = (strokes || []).flatMap((s) => (s.points || []).map((p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p)));
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!pts.length) return;
    const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
    const scale = Math.min((canvas.width - 8) / Math.max(1, maxX - minX), (canvas.height - 8) / Math.max(1, maxY - minY));
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokes) {
      const p = (s.points || []).map((q) => (Array.isArray(q) ? { x: q[0], y: q[1] } : q));
      if (!p.length) continue;
      ctx.beginPath();
      p.forEach((q, i) => {
        const x = 4 + (q.x - minX) * scale;
        const y = 4 + (q.y - minY) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [strokes]);
  return <canvas ref={ref} width={240} height={60} className="w-[120px] h-[30px] bg-white rounded border border-nt-line shrink-0" aria-hidden="true" />;
}

/**
 * The Training data folder (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 4, owner decision D5):
 * every line read in Writing mode, with what the model read and what the writer accepted. It stays
 * on this device; Export JSONL gives the file the next text model is trained and measured on.
 */
export default function TrainingDataPanel({ isPhone, onClose }) {
  const [samples, setSamples] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const load = () => listTrainingSamples().then(setSamples);
    load();
    window.addEventListener(TRAINING_EVENT, load);
    return () => window.removeEventListener(TRAINING_EVENT, load);
  }, []);

  const total = (samples || []).reduce((s, x) => s + (x.bytes || 0), 0);
  const confirmed = (samples || []).filter((s) => s.acceptedText !== null && s.acceptedText !== undefined).length;

  const exportJsonl = () => {
    const blob = new Blob([trainingToJsonl(samples || []) + '\n'], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netz_training_data_${new Date().toISOString().slice(0, 10)}.jsonl`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <Modal title="Training data" isPhone={isPhone} onClose={onClose} width="max-w-[720px]">
      <div className="px-5 pt-2 pb-6 flex flex-col gap-3">
        <p className="m-0 text-sm text-nt-text2">
          Every line read in Writing mode is kept here with what NETZ read and what you accepted, to teach the next handwriting model. It stays on this device ({formatBytes(total)} of{' '}
          {formatBytes(TRAINING_MAX_BYTES)}; the oldest lines go first when it is full).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {samples ? `${samples.length} line${samples.length === 1 ? '' : 's'}, ${confirmed} confirmed` : 'Loading…'}
          </span>
          <span className="flex-1" />
          <button type="button" className={BTN_MAIN} disabled={!samples?.length} onClick={exportJsonl}>
            <LuDownload className="w-4 h-4" aria-hidden="true" />
            Export JSONL
          </button>
          {confirmClear ? (
            <button
              type="button"
              className={`${BTN_SECONDARY} !bg-nt-danger !text-white`}
              onClick={() => {
                clearTrainingSamples();
                setConfirmClear(false);
              }}
            >
              Yes, clear all
            </button>
          ) : (
            <button type="button" className={BTN_SECONDARY} disabled={!samples?.length} onClick={() => setConfirmClear(true)}>
              Clear
            </button>
          )}
        </div>
        {samples && samples.length === 0 && (
          <p className="m-0 py-8 text-center text-sm text-nt-text2">Nothing yet. Turn on Writing mode in the Playground and choose “As I write”.</p>
        )}
        <ul className="m-0 p-0 list-none flex flex-col divide-y divide-nt-line">
          {(samples || []).slice(0, SHOWN).map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2">
              <InkThumb strokes={s.strokes} />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm truncate">
                  <span className="text-nt-text2">Read: </span>
                  {s.readText || '—'}
                </p>
                {s.acceptedText !== null && s.acceptedText !== undefined && s.acceptedText !== s.readText && (
                  <p className="m-0 text-sm truncate">
                    <span className="text-nt-text2">You wrote: </span>
                    {s.acceptedText}
                  </p>
                )}
              </div>
              {s.converted && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-nt-ok shrink-0" title={s.edited ? 'Edited, then typed' : 'Typed as read'}>
                  {s.edited ? <LuPencil className="w-3.5 h-3.5" aria-hidden="true" /> : <LuCheck className="w-3.5 h-3.5" aria-hidden="true" />}
                  {s.edited ? 'Edited' : 'Typed'}
                </span>
              )}
              <button type="button" className={`${ICON_BTN} !w-9 !h-9`} aria-label="Delete this line" onClick={() => deleteTrainingSample(s.id)}>
                <LuTrash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        {samples && samples.length > SHOWN && <p className="m-0 text-xs text-nt-text2">Showing the newest {SHOWN}. Export JSONL has all of them.</p>}
      </div>
    </Modal>
  );
}
