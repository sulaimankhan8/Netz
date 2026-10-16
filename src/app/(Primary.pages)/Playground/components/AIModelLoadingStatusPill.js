'use client';

import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheck, FiLoader, FiX } from 'react-icons/fi';
import { modelManager } from '../utils/recognition/modelManager';
import { UI } from '../utils/uiText';

// Size of the two large models on disk (maths 28.4 MB + text 7.4 MB), for the data-saver question
const LARGE_DOWNLOAD_MB = 36;

const mb = (bytes) => Math.max(0.1, bytes / 1048576).toFixed(bytes < 10485760 ? 1 : 0);

/**
 * The handwriting reader's status, shown in the status area under the top bar:
 *  - loading a large model: progress in MB
 *  - ready after such a load: a short confirmation
 *  - failed: a warning that stays, with Retry (the whiteboard keeps working)
 *  - data saver on: asks before the first large download
 * The small router warms up silently; it only shows if it fails.
 *
 * onDecline: "Not now" to the download (the caller turns reading off for this visit).
 */
export default function AIModelLoadingStatusPill({ onDecline }) {
  const [status, setStatus] = useState(modelManager.currentStatus);
  const [showReady, setShowReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let hideTimer = null;
    let wasLoadingLarge = false;
    const unsubscribe = modelManager.onStatusChange((next) => {
      setStatus(next);
      setDismissed(false);
      const large = next.modelName === 'htr' || next.modelName === 'hmer';
      if (next.state === 'loading' && large) wasLoadingLarge = true;
      if (next.state === 'ready' && wasLoadingLarge) {
        wasLoadingLarge = false;
        setShowReady(true);
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setShowReady(false), 2500);
      }
    });
    return () => {
      unsubscribe();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const large = status.modelName === 'htr' || status.modelName === 'hmer';
  const pill = 'flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl text-xs';
  const button = 'min-h-[32px] [@media(pointer:coarse)]:min-h-[44px] px-3 rounded-lg font-semibold';

  if (status.state === 'needs-consent') {
    return (
      <div role="status" className={`${pill} pointer-events-auto flex-wrap justify-center`}>
        <span className="text-zinc-800 dark:text-zinc-200">
          Reading handwriting needs a one-time download of about {LARGE_DOWNLOAD_MB} MB.
        </span>
        <span className="flex items-center gap-1">
          <button type="button" onClick={() => modelManager.acceptLargeDownloads()} className={`${button} bg-blue-500 text-white hover:bg-blue-600`}>
            Download
          </button>
          <button
            type="button"
            onClick={() => {
              modelManager.declineLargeDownloads();
              onDecline?.();
            }}
            className={`${button} text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
          >
            Not now
          </button>
        </span>
      </div>
    );
  }

  if (status.state === 'failed' && !dismissed) {
    return (
      <div role="alert" className={`${pill} pointer-events-auto`}>
        <FiAlertTriangle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
        <span className="text-zinc-800 dark:text-zinc-200">
          <span className="font-semibold">{UI.readerFailed}.</span> You can keep writing.
        </span>
        <button type="button" onClick={() => modelManager.retry()} className={`${button} text-blue-600 dark:text-blue-400 hover:bg-blue-500/10`}>
          {UI.retry}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="w-8 h-8 [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (status.state === 'loading' && large) {
    const p = status.progress;
    return (
      <div role="status" className={pill}>
        <FiLoader className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" aria-hidden="true" />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {UI.readerLoading}
          {p && p.loaded > 0 && (
            <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-400 tabular-nums">
              {p.total ? `${mb(p.loaded)} of ${mb(p.total)} MB` : `${mb(p.loaded)} MB`}
            </span>
          )}
        </span>
      </div>
    );
  }

  if (showReady) {
    return (
      <div role="status" className={pill}>
        <FiCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{UI.readerReady}</span>
      </div>
    );
  }

  return null;
}
