'use client';

import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheck, FiCheckCircle } from 'react-icons/fi';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { Dialog } from './ui/Dialog';
import { UI, blockLabel } from '../utils/uiText';

// Block types the Notes workspace can hold (equations and graph curves as maths, text as text)
const SENDABLE = new Set(['equation', 'graph', 'theory']);

/** The Notes blocks one Playground block becomes (a graph becomes the equations of its curves). */
function toNoteBlocks(b) {
  if (b.type === 'equation') return [{ id: b.blockId, type: 'math', content: b.content?.latex || '' }];
  if (b.type === 'graph') {
    return (b.content?.graphData?.datasets || [])
      .map((ds, idx) => ({ id: `${b.blockId}_curve_${idx}`, type: 'math', content: ds.latex || ds.label || '' }))
      .filter((nb) => nb.content);
  }
  if (b.type === 'theory') return [{ id: b.blockId, type: 'text', content: b.content?.text || '' }];
  return [];
}

/**
 * Send to Notes: makes a new note in the Notes workspace from the page's typed blocks.
 * Pictures, voice memos and sketches cannot go yet, and say so; handwriting stays on the page.
 * onConfirmSync returns { ok, noteId } or { ok: false, reason }, and the dialog says which.
 */
export default function InkToBlockConverterModal({ isOpen, isMobile = false, onClose, blocks = [], onConfirmSync, onOpenNote }) {
  const [noteTitle, setNoteTitle] = useState('Playground notes');
  const [selectedBlockIds, setSelectedBlockIds] = useState([]);
  const [result, setResult] = useState(null); // { ok, noteId } | { ok: false, reason }

  // Each time it opens: every block that can be sent is ticked, and no earlier result shows
  useEffect(() => {
    if (isOpen) {
      setSelectedBlockIds(blocks.filter((b) => SENDABLE.has(b.type)).map((b) => b.blockId));
      setResult(null);
    }
  }, [isOpen, blocks]);

  if (!isOpen) return null;

  const toggle = (blockId) => {
    setResult(null);
    setSelectedBlockIds((prev) => (prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]));
  };

  const send = () => {
    const chosen = blocks.filter((b) => SENDABLE.has(b.type) && selectedBlockIds.includes(b.blockId));
    const outcome = onConfirmSync ? onConfirmSync({ title: noteTitle.trim() || 'Playground notes', blocks: chosen.flatMap(toNoteBlocks) }) : { ok: false, reason: 'Notes is not available.' };
    setResult(outcome || { ok: false, reason: 'The note could not be saved on this device.' });
  };

  const sentOk = result && result.ok;
  const button = 'px-4 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold';
  const footer = sentOk ? (
    <>
      <button type="button" onClick={onClose} className={`${button} text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
        Close
      </button>
      <button type="button" onClick={() => onOpenNote?.(result.noteId)} className={`${button} bg-blue-600 hover:bg-blue-700 text-white`}>
        Open note
      </button>
    </>
  ) : (
    <>
      <button type="button" onClick={onClose} className={`${button} text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
        Cancel
      </button>
      <button type="button" onClick={send} disabled={selectedBlockIds.length === 0} className={`${button} bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50`}>
        {UI.sendToNotes}
      </button>
    </>
  );

  const sendable = blocks.filter((b) => SENDABLE.has(b.type));

  return (
    <Dialog title={UI.sendToNotes} isMobile={isMobile} onClose={onClose} footer={footer} width="w-[520px]" fullHeight={false}>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Sends typed blocks to a new note. Handwriting stays on this page; turn it into typed text first to send it.
      </p>

      {sentOk && (
        <div role="status" className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
          <FiCheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          Sent to Notes as “{noteTitle.trim() || 'Playground notes'}”.
        </div>
      )}
      {result && !result.ok && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400">
          <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <span className="font-semibold">Couldn&apos;t send to Notes.</span> {result.reason}
          </span>
        </div>
      )}

      {!sentOk && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">Note title</span>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 min-h-[40px] [@media(pointer:coarse)]:min-h-[44px] rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </label>

          <div>
            <div className="font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
              Blocks to send ({selectedBlockIds.length} of {sendable.length})
            </div>
            {blocks.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">There are no typed blocks on this page yet.</div>
            ) : (
              <ul className="flex flex-col gap-2">
                {blocks.map((block) => {
                  const can = SENDABLE.has(block.type);
                  const ticked = can && selectedBlockIds.includes(block.blockId);
                  return (
                    <li key={block.blockId}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={ticked}
                        aria-disabled={!can}
                        disabled={!can}
                        onClick={() => toggle(block.blockId)}
                        className={`w-full flex items-center justify-between gap-3 p-3 min-h-[44px] rounded-xl border text-left ${
                          ticked ? 'bg-blue-500/10 border-blue-500/60' : 'border-zinc-200 dark:border-zinc-800'
                        } ${can ? 'hover:border-zinc-400' : 'opacity-60 cursor-not-allowed'}`}
                      >
                        <span className="flex items-center gap-2 min-w-0 text-zinc-800 dark:text-zinc-200">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 shrink-0">{blockLabel(block.type)}</span>
                          {block.type === 'equation' && block.content?.latex && <InlineMath math={block.content.latex} />}
                          {block.type === 'theory' && <span className="truncate">{block.content?.text}</span>}
                          {block.type === 'graph' && <span>Its curves, as equations</span>}
                          {!can && <span className="text-zinc-500 dark:text-zinc-400">Notes can&apos;t hold this yet</span>}
                        </span>
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${ticked ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-400'}`}>
                          {ticked && <FiCheck className="w-3.5 h-3.5" aria-hidden="true" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
