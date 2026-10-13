'use client';

import React, { useState, useEffect } from 'react';
import { FiCheck, FiCpu, FiLoader } from 'react-icons/fi';
import { modelManager } from '../utils/recognition/modelManager';

/**
 * AIModelLoadingStatusPill
 *
 * Floating, elegant status indicator that informs users when neural models
 * (Router, HMER, HTR) are being fetched and compiled by ONNX Runtime Web.
 * Smoothly dissolves once models are initialized and ready.
 */
export default function AIModelLoadingStatusPill() {
  const [status, setStatus] = useState({
    isLoading: false,
    modelName: '',
    message: '',
  });
  const [justFinished, setJustFinished] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer = null;

    const unsubscribe = modelManager.onStatusChange((newStatus) => {
      setStatus(newStatus);

      if (newStatus.isLoading) {
        setJustFinished(false);
        setVisible(true);
        if (hideTimer) clearTimeout(hideTimer);
      } else if (newStatus.message && !newStatus.isLoading) {
        setJustFinished(true);
        setVisible(true);
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          setVisible(false);
          setJustFinished(false);
        }, 2800);
      }
    });

    return () => {
      unsubscribe();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-14 sm:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl shadow-black/5 dark:shadow-black/20 text-xs">
        {status.isLoading ? (
          <>
            <div className="relative flex items-center justify-center w-4 h-4">
              <FiLoader className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              <span className="absolute w-2 h-2 rounded-full bg-blue-400/40 animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[11px] text-zinc-800 dark:text-zinc-200">
                {status.message || 'Initializing Neural AI Models...'}
              </span>
            </div>
          </>
        ) : justFinished ? (
          <>
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500">
              <FiCheck className="w-3 h-3 text-emerald-500 stroke-[3]" />
            </div>
            <span className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
              {status.message || 'Neural Models Ready'}
            </span>
          </>
        ) : (
          <>
            <FiCpu className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium text-[11px] text-zinc-500">
              AI Engine Ready
            </span>
          </>
        )}
      </div>
    </div>
  );
}
