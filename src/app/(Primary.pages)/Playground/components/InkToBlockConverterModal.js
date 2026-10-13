'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiFileText, FiLayers } from 'react-icons/fi';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export default function InkToBlockConverterModal({
  isOpen,
  onClose,
  blocks = [],
  onConfirmSync,
}) {
  const [noteTitle, setNoteTitle] = useState('Playground Math Session Notes');
  const [selectedBlockIds, setSelectedBlockIds] = useState(() => blocks.map((b) => b.blockId));
  const [isSynced, setIsSynced] = useState(false);

  // This component is mounted before the session has loaded, so the initial selection above is
  // empty. Every time the dialog opens, start with all of the page's blocks selected.
  useEffect(() => {
    if (isOpen) {
      setSelectedBlockIds(blocks.map((b) => b.blockId));
    }
  }, [isOpen, blocks]);

  if (!isOpen) return null;

  const toggleBlockSelection = (blockId) => {
    setSelectedBlockIds((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const handleSync = () => {
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.blockId));
    
    // Map Smart Blocks to Notion-style Notes workspace block JSON objects
    const noteBlocks = selectedBlocks.flatMap((b) => {
      if (b.type === 'equation') {
        return [{
          id: b.blockId,
          type: 'math',
          content: b.content?.latex || '',
        }];
      } else if (b.type === 'graph') {
        // The Notes workspace has no graph block: carry each plotted curve over as its equation
        return (b.content?.graphData?.datasets || [])
          .map((ds, idx) => ({
            id: `${b.blockId}_curve_${idx}`,
            type: 'math',
            content: ds.latex || ds.label || '',
          }))
          .filter((nb) => nb.content);
      } else if (b.type === 'theory') {
        return [{
          id: b.blockId,
          type: 'text',
          content: b.content?.text || '',
        }];
      }
      // Sketch, audio and image blocks have no equivalent in Notes yet
      return [];
    });

    if (onConfirmSync) {
      onConfirmSync({ title: noteTitle, blocks: noteBlocks });
    }

    setIsSynced(true);
    setTimeout(() => {
      setIsSynced(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center items-end justify-center sm:p-4 p-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <FiLayers className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Sync Whiteboard to Notes Workspace
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Note Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Target Note Title
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Block Selection List */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Select Blocks to Transcribe ({selectedBlockIds.length}/{blocks.length})
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {blocks.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400">
                  No active Smart Blocks found on canvas to convert.
                </div>
              ) : (
                blocks.map((block) => {
                  const isSelected = selectedBlockIds.includes(block.blockId);
                  return (
                    <div
                      key={block.blockId}
                      onClick={() => toggleBlockSelection(block.blockId)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500/60'
                          : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                          {block.type}
                        </span>
                        {block.type === 'equation' && block.content?.latex && (
                          <InlineMath math={block.content.latex} />
                        )}
                        {block.type === 'theory' && (
                          <span className="truncate max-w-[200px]">{block.content?.text}</span>
                        )}
                        {block.type === 'graph' && <span>Plot Curve Dataset</span>}
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-400'
                        }`}
                      >
                        {isSelected && <FiCheckCircle className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 min-h-[44px] flex items-center justify-center text-xs font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSync}
            disabled={selectedBlockIds.length === 0 || isSynced}
            className="flex items-center justify-center gap-1.5 px-5 py-2 min-h-[44px] text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSynced ? (
              <>
                <FiCheckCircle className="w-4 h-4" />
                <span>Synced to Notes Workspace!</span>
              </>
            ) : (
              <>
                <FiFileText className="w-4 h-4" />
                <span>Transcribe to Notes Page</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
