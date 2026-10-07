'use client';

import React from 'react';
import { FiType, FiHash, FiCode, FiPercent, FiSquare, FiSmile, FiX, FiCheck } from 'react-icons/fi';
import { recordUserCorrection } from '../utils/recognition/telemetryStore';

/**
 * NETZ Semantic Lasso Modal (Section 22 of Master Blueprint)
 *
 * Allows users to lasso any handwritten ink region and explicitly assign its semantic intent:
 *   - TEXT
 *   - NUMBER
 *   - MATH / EQUATION
 *   - FRACTION
 *   - SHAPE / OBJECT
 *   - EMOJI
 */
export default function SemanticLassoModal({
  isOpen,
  onClose,
  selectedStrokes = [],
  strokeIds = [],
  bbox = null,
  onAssignSemanticType,
}) {
  if (!isOpen || selectedStrokes.length === 0) return null;

  const SEMANTIC_TYPES = [
    { id: 'MATH', label: 'Math Equation', icon: FiCode, desc: 'HMER parsing (LaTeX, AST)' },
    { id: 'TEXT', label: 'Text / Sentence', icon: FiType, desc: 'Online HTR English & words' },
    { id: 'NUMBER', label: 'Numeric Values', icon: FiHash, desc: 'Pure digits & decimal constants' },
    { id: 'FRACTION', label: 'Fraction Block', icon: FiPercent, desc: 'Split into numerator & denominator' },
    { id: 'OBJECT', label: 'Shape / Diagram', icon: FiSquare, desc: 'Geometric primitives & sketch' },
    { id: 'EMOJI', label: 'Emoji / Icon', icon: FiSmile, desc: 'Educational symbols & stickers' },
  ];

  const handleSelect = async (typeId) => {
    try {
      await recordUserCorrection({
        sourceStrokeIds: strokeIds,
        strokes: selectedStrokes,
        predictedValue: '',
        userCorrectedValue: '',
        assignedType: typeId,
        confidence: { overall: 1.0 },
        modelVersion: '1.0.0',
      });
    } catch (err) {
      console.warn('[SemanticLasso] Telemetry record error:', err);
    }

    if (onAssignSemanticType) {
      onAssignSemanticType(typeId, selectedStrokes, strokeIds, bbox);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/80">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Semantic Lasso Assignment</h3>
            <p className="text-xs text-zinc-400">What did you write in this selection?</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Option Grid */}
        <div className="p-4 grid grid-cols-2 gap-2.5">
          {SEMANTIC_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="flex flex-col items-start p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 text-left transition group"
              >
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 group-hover:text-blue-300 group-hover:border-blue-500/30 transition mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition">
                  {item.label}
                </span>
                <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-zinc-950/40 border-t border-zinc-800/60 text-center">
          <p className="text-[11px] text-zinc-500">
            Selected <span className="font-mono text-zinc-400">{selectedStrokes.length}</span> strokes • Preserves raw digital ink
          </p>
        </div>
      </div>
    </div>
  );
}
