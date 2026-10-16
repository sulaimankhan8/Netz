'use client';

import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { Dialog } from './ui/Dialog';

/**
 * Shown only when someone leaves the Playground after a save has failed: everything else is
 * saved automatically, so there is nothing to ask about.
 *
 * Try again saves now (the caller leaves once that works), Leave anyway leaves, Stay closes.
 */
export default function UnsavedChangesModal({ isOpen, isMobile = false, retrying = false, onRetry, onLeave, onStay }) {
  if (!isOpen) return null;

  const button = 'px-4 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-xl text-xs font-semibold transition-colors';
  const footer = (
    <>
      <button type="button" onClick={onStay} className={`${button} text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
        Stay
      </button>
      <button type="button" onClick={onLeave} className={`${button} border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
        Leave anyway
      </button>
      <button type="button" onClick={onRetry} disabled={retrying} className={`${button} bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60`}>
        {retrying ? 'Saving…' : 'Try again'}
      </button>
    </>
  );

  return (
    <Dialog title="Your latest changes aren't saved" isMobile={isMobile} onClose={onStay} footer={footer} width="w-[440px]" fullHeight={false}>
      <div className="flex items-start gap-3">
        <span className="p-2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-500 shrink-0">
          <FiAlertTriangle className="w-5 h-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          The last save on this device failed. If you leave now, changes since then may be lost.
        </p>
      </div>
    </Dialog>
  );
}
