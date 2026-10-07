'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { FiCheck, FiX, FiAlertTriangle, FiSliders, FiEdit3, FiLayers } from 'react-icons/fi';
import { recordUserCorrection } from '../utils/recognition/telemetryStore';

/**
 * NETZ Soft Editor Modal (Section 21 & 23 of Master Blueprint)
 *
 * Appears when recognition confidence is low/ambiguous or when the user clicks "Edit".
 * Allows:
 *   - Reviewing top ranked candidates (Multi-hypothesis choices)
 *   - Direct text/LaTeX correction with instant preview
 *   - Explicit semantic type assignment
 *   - Telemetry capture into on-device IndexedDB flywheel
 */
export default function SoftEditorModal({
  isOpen,
  onClose,
  cluster,
  onApplyCorrection,
}) {
  const rawResult = cluster?.rawResult || {};
  const initialValue = cluster?.detectedText || '';
  const initialType = cluster?.type || (cluster?.isMath ? 'MATH' : 'TEXT');
  const alternatives = cluster?.alternatives || rawResult.alternatives || [];
  const confidence = cluster?.confidenceDetails || rawResult.confidence || {
    overall: cluster?.confidence || 0.7,
    recognition: 0.7,
    structure: 0.8,
    semantic: 0.8,
  };

  const [currentValue, setCurrentValue] = useState(initialValue);
  const [currentType, setCurrentType] = useState(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (cluster) {
      setCurrentValue(cluster.detectedText || '');
      setCurrentType(cluster.type || (cluster.isMath ? 'MATH' : 'TEXT'));
    }
  }, [cluster]);

  if (!isOpen || !cluster) return null;

  const handleSelectCandidate = (cand) => {
    setCurrentValue(cand.value);
    if (cand.type) setCurrentType(cand.type);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Save correction to local on-device telemetry flywheel
      await recordUserCorrection({
        sourceStrokeIds: cluster.strokeIds || [],
        strokes: cluster.strokes || [],
        predictedValue: initialValue,
        userCorrectedValue: currentValue,
        assignedType: currentType,
        confidence,
        modelVersion: '1.0.0',
      });
    } catch (err) {
      console.warn('[SoftEditor] Failed to record correction to IndexedDB:', err);
    }

    if (onApplyCorrection) {
      onApplyCorrection(cluster, currentValue, currentType);
    }
    setIsSubmitting(false);
    onClose();
  };

  const overallScore = Math.round((confidence.overall || 0.5) * 100);
  const confidenceBadgeColor =
    overallScore >= 80
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : overallScore >= 50
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FiSliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Soft Editor & Ambiguity Resolver</h3>
              <p className="text-xs text-zinc-400">Verify, select hypotheses, or correct ink interpretation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Live Preview Box */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col items-center justify-center min-h-[90px] relative">
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border border-solid">
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${confidenceBadgeColor}`}>
                {overallScore}% confidence
              </span>
            </div>

            <div className="w-full text-center overflow-x-auto py-2">
              {currentType === 'MATH' ? (
                currentValue ? (
                  <span className="text-xl text-blue-300">
                    <InlineMath math={currentValue} renderError={(e) => <span className="text-rose-400 text-sm font-mono">{currentValue}</span>} />
                  </span>
                ) : (
                  <span className="text-zinc-500 italic text-sm">Empty expression</span>
                )
              ) : (
                <span className="text-lg text-zinc-200 font-sans">{currentValue || <span className="text-zinc-500 italic text-sm">Empty text</span>}</span>
              )}
            </div>
          </div>

          {/* Semantic Type Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Semantic Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['MATH', 'TEXT', 'NUMBER', 'OBJECT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCurrentType(type)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition ${
                    currentType === type
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm'
                      : 'bg-zinc-800/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800/80 hover:text-zinc-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Ranked Hypotheses / Alternatives */}
          {alternatives.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <FiLayers className="w-3.5 h-3.5 text-blue-400" />
                Ranked Interpretation Hypotheses
              </label>
              <div className="space-y-1.5">
                {alternatives.slice(0, 4).map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCandidate(cand)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      currentValue === cand.value
                        ? 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                        : 'bg-zinc-950/40 border-zinc-800 hover:bg-zinc-800/50 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xs text-zinc-500 font-mono">#{idx + 1}</span>
                      <span className="text-sm font-mono truncate">{cand.value}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-zinc-500">{cand.description || cand.type}</span>
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        {Math.round((cand.score || 0.5) * 100)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Fine-Tuning Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <FiEdit3 className="w-3.5 h-3.5 text-blue-400" />
              Manual Correction (LaTeX or Text)
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-sm focus:outline-none focus:border-blue-500 transition"
              placeholder={currentType === 'MATH' ? '\\frac{x^2+1}{y}' : 'Type corrected text...'}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
          >
            <FiCheck className="w-4 h-4" />
            Accept & Convert
          </button>
        </div>
      </div>
    </div>
  );
}
