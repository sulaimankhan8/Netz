'use client';

import React, { useEffect, useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { Dialog } from './ui/Dialog';
import { recordUserCorrection } from '../utils/recognition/telemetryStore';
import { UI } from '../utils/uiText';

/**
 * Fix: the one place to correct how a piece of handwriting was read.
 * Pick another reading, say whether it is text or maths, or type it; then turn it into typed text.
 * The correction is kept on this device as training data (as the old Soft Editor did).
 */
export default function FixReadingDialog({ cluster, isMobile, onClose, onApply }) {
  const initialValue = cluster?.detectedText || '';
  const initialType = cluster?.isMath || cluster?.type === 'MATH' || cluster?.type === 'FRACTION' ? 'MATH' : 'TEXT';
  const [value, setValue] = useState(initialValue);
  const [type, setType] = useState(initialType);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(cluster?.detectedText || '');
    setType(cluster?.isMath || cluster?.type === 'MATH' || cluster?.type === 'FRACTION' ? 'MATH' : 'TEXT');
  }, [cluster]);

  if (!cluster) return null;

  const alternatives = (cluster.alternatives || cluster.rawResult?.alternatives || [])
    .filter((a) => a && a.value && a.value !== value)
    .slice(0, 4);

  const apply = async () => {
    setBusy(true);
    try {
      await recordUserCorrection({
        sourceStrokeIds: cluster.strokeIds || [],
        strokes: cluster.strokes || [],
        predictedValue: initialValue,
        userCorrectedValue: value,
        assignedType: type,
        confidence: cluster.confidenceDetails || { overall: cluster.confidence || 0 },
        modelVersion: '1.0.0',
      });
    } catch (err) {
      console.warn('[Fix] Could not keep the correction:', err);
    }
    setBusy(false);
    onApply(cluster, value, type);
    onClose();
  };

  const choice = (active) =>
    `px-4 min-h-[36px] [@media(pointer:coarse)]:min-h-[44px] rounded-xl text-xs font-semibold border transition-colors ${
      active ? 'bg-pg-ink text-pg-on-ink border-pg-ink' : 'border-pg-line text-pg-ink hover:bg-pg-tray'
    }`;

  const footer = (
    <>
      <button type="button" onClick={onClose} className="px-4 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] rounded-xl text-xs font-semibold text-pg-text2 hover:bg-pg-tray">
        Cancel
      </button>
      <button
        type="button"
        onClick={apply}
        disabled={busy || !value.trim()}
        className="px-5 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] rounded-xl text-xs font-semibold bg-pg-accent-fill hover:bg-pg-accent-fill/90 text-white disabled:opacity-50"
      >
        {UI.turnIntoText}
      </button>
    </>
  );

  return (
    <Dialog title={UI.fix} isMobile={isMobile} onClose={onClose} footer={footer} width="w-[520px]" fullHeight={false}>
      <p className="text-pg-text2">{UI.fixHint}.</p>

      <div className="min-h-[64px] px-4 py-3 rounded-xl bg-pg-paper border border-pg-line flex items-center justify-center overflow-x-auto text-base text-pg-ink" aria-live="polite">
        {!value.trim() ? (
          <span className="text-pg-text2 text-xs">Nothing yet</span>
        ) : type === 'MATH' ? (
          <InlineMath math={value} renderError={() => <span className="font-mono text-sm text-pg-danger">{value}</span>} />
        ) : (
          <span>{value}</span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label={UI.thisIs}>
        <span className="font-semibold text-pg-text2 mr-1">{UI.thisIs}:</span>
        <button type="button" role="radio" aria-checked={type === 'TEXT'} onClick={() => setType('TEXT')} className={choice(type === 'TEXT')}>
          Text
        </button>
        <button type="button" role="radio" aria-checked={type === 'MATH'} onClick={() => setType('MATH')} className={choice(type === 'MATH')}>
          Maths
        </button>
      </div>

      {alternatives.length > 0 && (
        <div>
          <div className="font-semibold text-pg-text2 mb-1.5">Other readings</div>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((alt, idx) => (
              <button
                key={`${alt.value}-${idx}`}
                type="button"
                onClick={() => {
                  setValue(alt.value);
                  if (alt.type === 'MATH' || alt.type === 'TEXT') setType(alt.type);
                }}
                className="px-3 min-h-[36px] [@media(pointer:coarse)]:min-h-[44px] rounded-xl border border-pg-line font-mono text-sm text-pg-ink hover:bg-pg-tray"
              >
                {alt.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="font-semibold text-pg-text2">{type === 'MATH' ? 'Type it (as LaTeX, for example \\frac{1}{2})' : 'Type it'}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              e.preventDefault();
              apply();
            }
          }}
          className={`w-full px-3 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] rounded-xl bg-pg-surface border border-pg-text2/30 text-sm text-pg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-accent ${type === 'MATH' ? 'font-mono' : ''}`}
        />
      </label>
    </Dialog>
  );
}
