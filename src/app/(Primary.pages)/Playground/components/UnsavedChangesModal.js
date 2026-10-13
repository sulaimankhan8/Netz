'use client';

import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * UnsavedChangesModal Component
 * WPS / Office-style prompt shown when attempting to leave Playground with unsaved changes.
 * Features Save (Yes), Don't Save (No), and Cancel action buttons.
 */
export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onSave,
  onDontSave,
  onCancel,
  pageTitle = 'Page 1',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex sm:items-center items-end justify-center sm:p-4 p-0 bg-black/50 backdrop-blur-xs animate-fade-in select-none">
      <div className="relative w-full max-w-[440px] p-6 rounded-t-2xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header with Orange Alert Triangle and Close X */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-500">
              <FiAlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Save
            </h3>
          </div>

          <button
            onClick={onCancel || onClose}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body text like WPS prompt */}
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
          Do you want to save the changes you made to &quot;{pageTitle}&quot;?
        </p>

        {/* Action Buttons Row: Save (Yes), Don't Save (No), Cancel */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onSave}
            className="px-5 py-2.5 min-h-[44px] flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Save
          </button>

          <button
            onClick={onDontSave}
            className="px-4 py-2.5 min-h-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-300 dark:border-zinc-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Don&apos;t Save
          </button>

          <button
            onClick={onCancel || onClose}
            className="px-4 py-2.5 min-h-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-300 dark:border-zinc-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

