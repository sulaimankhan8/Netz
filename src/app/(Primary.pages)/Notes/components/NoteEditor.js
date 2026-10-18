'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  LuAlertTriangle,
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuDownload,
  LuFileDown,
  LuFileText,
  LuGlobe,
  LuLock,
  LuMoreHorizontal,
  LuPanelLeft,
  LuPlus,
  LuShare2,
  LuX
} from 'react-icons/lu';
import NoteBlockItem from './NoteBlockItem';
import { exportNoteAsMarkdown } from '../utils/noteStorage';
import { exportNoteToPdf } from '../utils/pdfExport';
import { BLOCK_TYPES, newQuizConfig } from '../utils/blockTypes';
import { BTN_MAIN, BTN_SECONDARY, ICON_BTN, Menu, Modal, TOUCH, useCoarsePointer } from './ui';

/** A text box that grows with its text and never wraps to a new line on Enter (title, subtitle). */
function GrowingLine({ value, onChange, className, placeholder, label }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      aria-label={label}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
      className={`block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-nt-muted ${className}`}
    />
  );
}

/**
 * The note's tags as chips (Q6). Enter or a comma adds what was typed, × removes a tag, and
 * Backspace in the empty box removes the last one. Saves the same `tags` list as before.
 */
function TagEditor({ tags, onChange }) {
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const commit = (text) => {
    const parts = text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !tags.includes(t));
    if (parts.length > 0) onChange([...tags, ...parts]);
    setDraft('');
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Tags">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center h-8 pl-3 pr-1 rounded-full bg-nt-tray text-[13px] font-medium text-nt-text2">
          # {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove tag ${tag}`}
            className={`ml-0.5 w-6 h-6 ${TOUCH} flex items-center justify-center rounded-full hover:bg-nt-line hover:text-nt-ink`}
          >
            <LuX className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          aria-label="New tag"
          placeholder="Tag name"
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(',')) commit(v);
            else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(draft);
            } else if (e.key === 'Escape') {
              setDraft('');
              setAdding(false);
            } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => {
            commit(draft);
            setAdding(false);
          }}
          className="h-8 w-32 px-3 rounded-full border border-nt-accent bg-nt-surface text-[13px] text-nt-ink outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={`inline-flex items-center gap-1 h-8 ${TOUCH} px-3 rounded-full border border-dashed border-nt-line text-[13px] font-medium text-nt-text2 hover:text-nt-ink hover:border-nt-text2`}
        >
          <LuPlus className="w-3.5 h-3.5" aria-hidden="true" />
          Add tag
        </button>
      )}
    </div>
  );
}

export default function NoteEditor({
  note,
  onUpdateNote,
  onOpenShareModal,
  onOpenPickerForBlock,
  onAddWidgetBlock,
  onCreateNote,
  isSidebarOpen,
  onShowSidebar,
  onBack,
  isPhone,
  saveFailed,
  onNotify,
  onRestoreBlock
}) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  // The block just added: it opens ready to type (a formula opens its LaTeX field)
  const [justAddedId, setJustAddedId] = useState(null);
  // The block you are in: on touch screens its grip shows
  const [activeBlockId, setActiveBlockId] = useState(null);
  useEffect(() => {
    setJustAddedId(null);
    setActiveBlockId(null);
  }, [note?.id]);
  const exportRef = useRef(null);
  const coarse = useCoarsePointer();

  // Calculate word count & estimated reading time
  const wordCount = useMemo(() => {
    if (!note || !note.blocks) return 0;
    return note.blocks.reduce((acc, b) => {
      if (!b.content) return acc;
      return acc + b.content.trim().split(/\s+/).filter(Boolean).length;
    }, 0);
  }, [note]);

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-nt-paper">
        <LuFileText className="w-10 h-10 text-nt-text2 mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold">No note open</h2>
        <p className="text-[15px] text-nt-text2 mt-2 max-w-sm">Pick a note from the list, or start a new one for formulas, solvers and quizzes.</p>
        <div className="mt-5 flex gap-2">
          {isPhone && (
            <button type="button" onClick={onBack} className={BTN_SECONDARY}>
              All notes
            </button>
          )}
          {!isPhone && !isSidebarOpen && (
            <button type="button" onClick={onShowSidebar} className={BTN_SECONDARY}>
              Show notes
            </button>
          )}
          <button type="button" onClick={onCreateNote} className={BTN_MAIN}>
            <LuPlus className="w-4 h-4" aria-hidden="true" />
            New note
          </button>
        </div>
      </div>
    );
  }

  const handleTitleChange = (val) => onUpdateNote({ ...note, title: val });
  const handleSubtitleChange = (val) => onUpdateNote({ ...note, subtitle: val });
  const handleTagsChange = (tags) => onUpdateNote({ ...note, tags });

  const handleUpdateBlock = (updatedBlock) => {
    const newBlocks = note.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    onUpdateNote({ ...note, blocks: newBlocks });
  };

  // notify: deleted from the block menu, so offer Undo (Backspace in an empty block does not)
  const handleDeleteBlock = (blockId, { notify = false } = {}) => {
    const index = note.blocks.findIndex((b) => b.id === blockId);
    const removed = note.blocks[index];
    const newBlocks = note.blocks.filter((b) => b.id !== blockId);
    onUpdateNote({ ...note, blocks: newBlocks });
    if (notify && removed) {
      const noteId = note.id;
      onNotify({
        message: 'Block deleted',
        actionLabel: 'Undo',
        onAction: () => {
          onRestoreBlock(noteId, removed, index);
          onNotify(null);
        }
      });
    }
  };

  const handleMoveBlock = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= note.blocks.length) return;
    const newBlocks = [...note.blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    onUpdateNote({ ...note, blocks: newBlocks });
  };

  const handleInsertBlockAfter = (index) => {
    const newBlock = {
      id: 'b-' + Date.now(),
      type: 'paragraph',
      content: ''
    };
    const newBlocks = [...note.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setJustAddedId(newBlock.id);
    onUpdateNote({ ...note, blocks: newBlocks });
  };

  const handleAddBlock = (type) => {
    setAddSheetOpen(false);
    if (type === 'widget') {
      onAddWidgetBlock();
      return;
    }

    let newBlock;
    if (type === 'quiz') {
      newBlock = { id: 'b-' + Date.now(), type: 'quiz', content: 'Interactive Quiz Block', quizConfig: newQuizConfig() };
    } else if (type === 'ink') {
      newBlock = { id: 'b-' + Date.now(), type: 'ink', content: '', caption: 'Figure: Handwritten calculation sketch' };
    } else {
      newBlock = { id: 'b-' + Date.now(), type, content: type === 'math' ? 'e^{i\\pi} + 1 = 0' : '' };
    }
    setJustAddedId(newBlock.id);
    onUpdateNote({ ...note, blocks: [...note.blocks, newBlock] });
  };

  const handleExportPdf = async () => {
    if (!note) return;
    setIsExportingPdf(true);
    try {
      await exportNoteToPdf(note, 'note-printable-area');
    } catch (err) {
      alert('Could not export PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const exportItems = [
    { id: 'pdf', label: isExportingPdf ? 'Exporting PDF…' : 'Export PDF', disabled: isExportingPdf, icon: <LuFileDown className="w-[18px] h-[18px]" />, onSelect: handleExportPdf },
    { id: 'md', label: 'Export Markdown (.md)', icon: <LuDownload className="w-[18px] h-[18px]" />, onSelect: () => exportNoteAsMarkdown(note) }
  ];

  const status = saveFailed ? (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-nt-danger" role="status">
      <LuAlertTriangle className="w-4 h-4" aria-hidden="true" />
      Couldn&apos;t save
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nt-text2" role="status">
      <LuCheck className="w-4 h-4" aria-hidden="true" />
      Saved
    </span>
  );

  const privacyChip = (
    <span
      className={`inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full text-[13px] font-semibold shrink-0 ${
        note.isPublic ? 'bg-nt-ok-tint text-nt-ok' : 'bg-nt-tray text-nt-text2'
      }`}
    >
      {note.isPublic ? <LuGlobe className="w-[15px] h-[15px]" aria-hidden="true" /> : <LuLock className="w-[15px] h-[15px]" aria-hidden="true" />}
      {note.isPublic ? 'Public' : 'Private'}
    </span>
  );

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-nt-paper text-nt-ink">
      {/* Top bar */}
      {isPhone ? (
        <div className="h-14 shrink-0 flex items-center gap-1 pl-1 pr-1.5 bg-nt-surface border-b border-nt-line">
          <button type="button" onClick={onBack} className={`inline-flex items-center gap-0.5 h-11 pl-1 pr-3 rounded-xl text-base font-medium text-nt-accent hover:bg-nt-tray`}>
            <LuChevronLeft className="w-6 h-6" aria-hidden="true" />
            Notes
          </button>
          <span className="flex-1" />
          {status}
          <button type="button" onClick={onOpenShareModal} aria-label="Share" title="Share" className={ICON_BTN}>
            <LuShare2 className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            ref={exportRef}
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            aria-label="More: export"
            aria-haspopup="menu"
            aria-expanded={exportOpen}
            className={ICON_BTN}
          >
            <LuMoreHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="h-14 shrink-0 flex items-center gap-3 pl-4 pr-4 md:pl-6">
          {!isSidebarOpen && (
            <button type="button" onClick={onShowSidebar} aria-label="Show the notes list" title="Show the notes list" className={`${ICON_BTN} -ml-2`}>
              <LuPanelLeft className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
          )}
          {privacyChip}
          <span className="hidden lg:inline font-nt-mono text-[13px] text-nt-text2" title="Access key">
            {note.accessKey}
          </span>
          {status}
          <span className="flex-1" />
          <button type="button" onClick={onOpenShareModal} className={BTN_SECONDARY}>
            <LuShare2 className="w-[18px] h-[18px]" aria-hidden="true" />
            Share
          </button>
          <button
            ref={exportRef}
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={exportOpen}
            className={`${BTN_SECONDARY} ${exportOpen ? '!bg-nt-line' : ''}`}
          >
            <LuDownload className="w-[18px] h-[18px]" aria-hidden="true" />
            {isExportingPdf ? 'Exporting…' : 'Export'}
            <LuChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {exportOpen && <Menu title="Export" items={exportItems} isPhone={isPhone} anchorRef={exportRef} onClose={() => setExportOpen(false)} />}

      {/* The note */}
      <div className="flex-1 overflow-y-auto custom-notion-scrollbar">
        <div className={isPhone ? 'bg-nt-surface min-h-full' : 'px-4 md:px-8 pt-2 pb-16'}>
          <article
            className={
              isPhone
                ? 'px-5 pt-5 pb-32'
                : 'mx-auto w-full max-w-[800px] bg-nt-surface border border-nt-line rounded-2xl px-8 md:px-14 lg:px-16 pt-12 pb-10'
            }
          >
            <div id="note-printable-area" className="flex flex-col gap-3">
              {isPhone && (
                <div className="flex items-center gap-2 mb-1">
                  {privacyChip}
                  <span className="text-xs text-nt-text2 tabular-nums">
                    {wordCount} words · {readingTimeMinutes} min read
                  </span>
                </div>
              )}
              <GrowingLine
                label="Title"
                value={note.title || ''}
                onChange={handleTitleChange}
                placeholder="Untitled note"
                className={`font-bold tracking-[-0.015em] text-nt-ink ${isPhone ? 'text-[28px] leading-[34px]' : 'text-[36px] leading-[44px]'}`}
              />
              <GrowingLine
                label="Subtitle"
                value={note.subtitle || ''}
                onChange={handleSubtitleChange}
                placeholder="Add a short description"
                className={`text-nt-text2 ${isPhone ? 'text-base leading-6' : 'text-[17px] leading-[26px]'}`}
              />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 pb-5 border-b border-nt-line">
                <div className="flex-1 min-w-0">
                  <TagEditor tags={note.tags || []} onChange={handleTagsChange} />
                </div>
                {!isPhone && (
                  <span className="text-xs text-nt-text2 tabular-nums shrink-0">
                    {wordCount} words · {readingTimeMinutes} min read
                  </span>
                )}
              </div>

              {/* Blocks */}
              <div className="flex flex-col gap-1 pt-4 min-h-[200px]">
                {note.blocks.map((block, idx) => (
                  <NoteBlockItem
                    key={block.id}
                    block={block}
                    index={idx}
                    totalBlocks={note.blocks.length}
                    onUpdate={handleUpdateBlock}
                    onDelete={handleDeleteBlock}
                    onMove={handleMoveBlock}
                    onOpenPicker={onOpenPickerForBlock}
                    onInsertBlockAfter={handleInsertBlockAfter}
                    isPhone={isPhone}
                    coarse={coarse}
                    isNew={block.id === justAddedId}
                    isActive={block.id === activeBlockId}
                    onActivate={setActiveBlockId}
                  />
                ))}
              </div>
            </div>

            {/* Add a block (laptops and tablets; phones use the Add block button) */}
            {!isPhone && (
              <section aria-label="Add block" className="mt-8 pt-6 border-t border-nt-line">
                <div className="flex items-baseline justify-between gap-3 mb-3">
                  <h2 className="text-[13px] font-semibold text-nt-text2">Add block</h2>
                  <span className="text-xs text-nt-text2">or type / in a text block</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BLOCK_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleAddBlock(t.type)}
                      className={`flex items-center gap-2.5 h-11 px-2.5 rounded-xl border border-nt-line bg-nt-surface text-left text-sm font-medium text-nt-ink hover:bg-nt-tray transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nt-accent`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.tile}`} aria-hidden="true">
                        <t.Icon className="w-4 h-4" />
                      </span>
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>

      {/* Phones: one button for every kind of block */}
      {isPhone && (
        <>
          <div aria-hidden="true" className="pointer-events-none fixed left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-nt-surface to-transparent" />
          <button
            type="button"
            onClick={() => setAddSheetOpen(true)}
            className="fixed left-1/2 -translate-x-1/2 bottom-6 z-20 inline-flex items-center gap-2 h-[52px] pl-[18px] pr-[22px] rounded-full bg-nt-ink text-nt-on-ink text-base font-semibold shadow-nt-bar"
          >
            <LuPlus className="w-5 h-5" aria-hidden="true" />
            Add block
          </button>
        </>
      )}
      {addSheetOpen && (
        <Modal title="Add block" isPhone={isPhone} onClose={() => setAddSheetOpen(false)}>
          <div className="px-5 pt-3 pb-6">
            <div className="grid grid-cols-3 gap-2.5">
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleAddBlock(t.type)}
                  className={`flex flex-col items-center justify-center gap-2 h-[92px] rounded-2xl text-sm font-semibold text-nt-ink ${t.tint === 'bg-nt-tray' ? 'bg-nt-paper' : t.tint}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center bg-nt-surface ${t.tile.split(' ').find((c) => c.startsWith('text-'))}`} aria-hidden="true">
                    <t.Icon className="w-5 h-5" />
                  </span>
                  {t.name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-nt-text2 text-center">With a keyboard, type / in any text block for the same list.</p>
          </div>
        </Modal>
      )}
    </main>
  );
}
