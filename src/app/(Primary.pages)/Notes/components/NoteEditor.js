'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  LuAlertTriangle,
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuChevronUp,
  LuDownload,
  LuFileCode,
  LuFileDown,
  LuFileText,
  LuGlobe,
  LuGlobe2,
  LuPackage,
  LuLock,
  LuMoreHorizontal,
  LuPalette,
  LuPanelLeft,
  LuPlus,
  LuShare2,
  LuX
} from 'react-icons/lu';
import NoteBlockItem from './NoteBlockItem';
import NoteLookPanel from './NoteLookPanel';
import { BadgeRow, BannerFill, NoteIcon, StatusBadge, badgesOf, lookColour, lookOf } from '../utils/noteLook';
import { exportNoteHtml, exportNoteMarkdown, exportNoteNetz, noteTexZip } from '../utils/noteExport';
import { exportNoteToPdf } from '../utils/pdfExport';
import { recordActivity } from '@/app/utils/activity';
import { usePublishedIds } from '../utils/publishClient';
import { OFFERED_BLOCK_TYPES as BLOCK_TYPES, newQuizConfig } from '../utils/blockTypes';
import { newTable } from '@/app/utils/tableCore';
import { assetBlockFor, blocksFromNetz } from '../utils/noteInsert';
import { BTN_MAIN, BTN_QUIET, BTN_SECONDARY, ICON_BTN, Menu, Modal, TOUCH, useCoarsePointer } from './ui';
import { isProOnDevice } from '@/app/utils/proClient';
import dynamic from 'next/dynamic';
import { noteToTex } from '../utils/latexNote';

const ProExportDialog = dynamic(() => import('@/app/components/export/ProExportDialog'), { ssr: false });
const AssetLibrary = dynamic(() => import('./AssetLibrary'), { ssr: false });

const GRID_OPEN_KEY = 'netz_notes_add_grid_open';

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
function TagEditor({ tags, onChange, tagColours = {} }) {
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
        <span
          key={tag}
          data-tag-colour={tagColours[tag] || 'none'}
          className="inline-flex items-center h-8 pl-3 pr-1 rounded-full bg-nt-tray text-[13px] font-medium text-nt-text2"
          style={tagColours[tag] ? { background: lookColour(tagColours[tag]).tint, color: lookColour(tagColours[tag]).fg } : undefined}
        >
          # {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove tag ${tag}`}
            className={`ml-0.5 w-6 h-6 ${TOUCH} flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10`}
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
  onRestoreBlock,
  tagColours = {},
  onSetTagColour,
  onOpenBoard
}) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const publishedIds = usePublishedIds();
  const [exportOpen, setExportOpen] = useState(false);
  const [texOpen, setTexOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  // From Assets: the picker is open; targetId is the block it was asked from (null: where you are)
  const [assetPick, setAssetPick] = useState(null);
  // The block just added: it opens ready to type (a formula opens its LaTeX field)
  const [justAddedId, setJustAddedId] = useState(null);
  // The block you are in: on touch screens its grip shows
  const [activeBlockId, setActiveBlockId] = useState(null);
  // The block under the mouse: only one block shows its handle at a time
  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  useEffect(() => {
    setJustAddedId(null);
    setActiveBlockId(null);
    setHoveredBlockId(null);
  }, [note?.id]);
  // The Add block grid at the end of a note: folded away unless you open it (remembered)
  const [gridOpen, setGridOpen] = useState(false);
  useEffect(() => {
    try {
      setGridOpen(localStorage.getItem(GRID_OPEN_KEY) === '1');
    } catch {
      // storage blocked: stays folded
    }
  }, []);
  const toggleGrid = (open) => {
    setGridOpen(open);
    try {
      localStorage.setItem(GRID_OPEN_KEY, open ? '1' : '0');
    } catch {
      // storage blocked: only this visit remembers
    }
  };
  const exportRef = useRef(null);
  // Note look: the panel and the button (or, on phones, the ⋯ button) it opens from
  const [lookOpen, setLookOpen] = useState(false);
  const lookRef = useRef(null);
  useEffect(() => setLookOpen(false), [note?.id]);
  const coarse = useCoarsePointer();

  // Calculate word count & estimated reading time
  const wordCount = useMemo(() => {
    if (!note || !note.blocks) return 0;
    return note.blocks.reduce((acc, b) => {
      if (!b.content || typeof b.content !== 'string' || b.type === 'divider') return acc;
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

  // A click under the last block: type into it if it is an empty text block, else start one
  const handleClickBelow = () => {
    const last = note.blocks[note.blocks.length - 1];
    if (last && last.type === 'paragraph' && !last.content) {
      document.querySelector(`[data-block-id="${last.id}"] textarea`)?.focus();
      setActiveBlockId(last.id);
      return;
    }
    handleInsertBlockAfter(note.blocks.length - 1);
  };

  /**
   * Puts blocks where you are: in place of `targetId` if that is an empty text block, else after
   * it; with no target, after the block you are in, or at the end.
   */
  const insertBlocks = (newBlocks, targetId = null, baseNote = note) => {
    const blocks = [...baseNote.blocks];
    const anchorId = targetId || activeBlockId;
    let at = blocks.findIndex((b) => b.id === anchorId);
    let replace = false;
    if (at >= 0 && targetId) {
      const target = blocks[at];
      replace = target.type === 'paragraph' && !String(target.content || '').trim();
    }
    if (at < 0) at = blocks.length - 1;
    blocks.splice(replace ? at : at + 1, replace ? 1 : 0, ...newBlocks);
    // Something to keep writing in after what was inserted
    const lastNew = newBlocks[newBlocks.length - 1];
    if (!blocks[blocks.indexOf(lastNew) + 1]) blocks.push({ id: 'b-' + Date.now() + '-t', type: 'paragraph', content: '' });
    onUpdateNote({ ...baseNote, blocks });
  };

  const handlePickAsset = async (record) => {
    const targetId = assetPick?.targetId || null;
    setAssetPick(null);
    const block = await assetBlockFor(record);
    insertBlocks([block], targetId);
    setJustAddedId(block.id);
  };

  // From file: the content of a .netz note or board, with an "Inserted from ..." line above it
  const handleInsertFromFile = async (targetId = null) => {
    const { pickNetzFile } = await import('@/app/utils/netzFile');
    const result = await pickNetzFile();
    if (!result) return;
    if (!result.ok) {
      onNotify({ message: result.error });
      return;
    }
    try {
      const { blocks } = await blocksFromNetz(result, result.fileName);
      insertBlocks(blocks, targetId);
      onNotify({ message: `Inserted ${result.fileName}. You can write between its parts.` });
    } catch (err) {
      onNotify({ message: err.message || 'The file could not be inserted.' });
    }
  };

  const handleAddBlock = (type) => {
    setAddSheetOpen(false);
    if (type === 'widget') {
      onAddWidgetBlock();
      return;
    }
    if (type === 'assets') {
      setAssetPick({ targetId: null });
      return;
    }
    if (type === 'netzfile') {
      handleInsertFromFile(null);
      return;
    }
    if (type === 'table') {
      const block = { id: 'b-' + Date.now(), type: 'table', content: '', table: newTable(3, 3) };
      setJustAddedId(block.id);
      insertBlocks([block], null);
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
      await exportNoteToPdf(note, 'note-printable-area', { clean: isProOnDevice() });
      recordActivity('note.exported', { kind: 'pdf' });
    } catch (err) {
      alert('Could not export PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const look = lookOf(note);
  const badges = badgesOf(note);
  const lookC = lookColour(look.colour || 'grey');
  const exportItems = [
    ...(isPhone ? [{ id: 'look', label: 'Note look', icon: <LuPalette className="w-[18px] h-[18px]" />, onSelect: () => setLookOpen(true) }, 'divider'] : []),
    { id: 'pdf', label: isExportingPdf ? 'Exporting PDF…' : 'Export PDF', disabled: isExportingPdf, icon: <LuFileDown className="w-[18px] h-[18px]" />, onSelect: handleExportPdf },
    { id: 'md', label: 'Export Markdown (.md)', icon: <LuDownload className="w-[18px] h-[18px]" />, onSelect: () => exportNoteMarkdown(note).then(() => recordActivity('note.exported', { kind: 'md' })) },
    { id: 'html', label: 'Export web page (.html)', icon: <LuGlobe2 className="w-[18px] h-[18px]" />, onSelect: () => exportNoteHtml(note).then(() => recordActivity('note.exported', { kind: 'html' })) },
    { id: 'tex', label: 'Export LaTeX (.tex) · Pro', icon: <LuFileCode className="w-[18px] h-[18px]" />, onSelect: () => setTexOpen(true) },
    {
      id: 'netz',
      label: 'Export NETZ file (.netz) · Pro',
      icon: <LuPackage className="w-[18px] h-[18px]" />,
      onSelect: async () => {
        if (!isProOnDevice()) {
          onNotify({ message: 'NETZ files come with NETZ Pro: they open again fully editable, handwriting included.', actionLabel: 'See Pro', onAction: () => window.open('/Pricing', '_blank', 'noopener') });
          return;
        }
        try {
          const { items } = await exportNoteNetz(note);
          recordActivity('note.exported', { kind: 'netz' });
          onNotify({ message: items ? `Saved the note with ${items} item${items === 1 ? '' : 's'} from Assets.` : 'Saved the note as a NETZ file.' });
        } catch (err) {
          onNotify({ message: err.message || 'The NETZ file could not be made.' });
        }
      }
    }
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

  // Published for real (on the web), not the old local isPublic flag
  const isPublished = publishedIds.has(note.id);
  const privacyChip = (
    <span
      className={`inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full text-[13px] font-semibold shrink-0 ${
        isPublished ? 'bg-nt-ok-tint text-nt-ok' : 'bg-nt-tray text-nt-text2'
      }`}
    >
      {isPublished ? <LuGlobe className="w-[15px] h-[15px]" aria-hidden="true" /> : <LuLock className="w-[15px] h-[15px]" aria-hidden="true" />}
      {isPublished ? 'Published' : 'Private'}
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
          <button type="button" onClick={onOpenShareModal} aria-label="Share" title="Share" className={ICON_BTN} data-tour="notes-share">
            <LuShare2 className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            ref={exportRef}
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            data-tour="notes-export"
            aria-label="More: note look, export"
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
          <button
            ref={lookRef}
            type="button"
            onClick={() => setLookOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={lookOpen}
            className={`${BTN_SECONDARY} hover:brightness-95`}
            style={look.colour ? { background: lookC.tint, color: lookC.fg } : undefined}
          >
            <LuPalette className="w-[18px] h-[18px]" aria-hidden="true" />
            Note look
          </button>
          <button type="button" onClick={onOpenShareModal} className={BTN_SECONDARY} data-tour="notes-share">
            <LuShare2 className="w-[18px] h-[18px]" aria-hidden="true" />
            Share
          </button>
          <button
            ref={exportRef}
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            data-tour="notes-export"
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
      {exportOpen && <Menu title={isPhone ? 'This note' : 'Export'} items={exportItems} isPhone={isPhone} anchorRef={exportRef} onClose={() => setExportOpen(false)} />}
      {texOpen && (
        <ProExportDialog
          title={note.title || 'Untitled note'}
          getTex={() => noteToTex(note)}
          getZip={() => noteTexZip(note)}
          onClose={() => setTexOpen(false)}
          note="Solver blocks come with their answer and steps table, and tables as LaTeX tables. Sketches, boards and pictures come in the .zip, next to the .tex."
        />
      )}
      {assetPick && (
        <AssetLibrary isPhone={isPhone} mode="pick" onPick={handlePickAsset} onClose={() => setAssetPick(null)} onNotify={onNotify} />
      )}
      {lookOpen && (
        <NoteLookPanel
          note={note}
          onUpdateNote={onUpdateNote}
          tagColours={tagColours}
          onSetTagColour={onSetTagColour}
          anchorRef={isPhone ? exportRef : lookRef}
          onClose={() => setLookOpen(false)}
          isPhone={isPhone}
        />
      )}

      {/* The note */}
      <div className="flex-1 overflow-y-auto custom-notion-scrollbar">
        <div className={isPhone ? 'bg-nt-surface min-h-full' : 'px-4 md:px-8 pt-2 pb-16'}>
          <article
            className={
              isPhone
                ? 'px-5 pt-5 pb-32'
                : `mx-auto w-full max-w-[800px] bg-nt-surface border border-nt-line rounded-2xl px-8 md:px-16 pb-10 overflow-hidden ${look.cover ? 'pt-0' : 'pt-12'}`
            }
          >
            <div id="note-printable-area" className="flex flex-col gap-3">
              {/* Cover band: the note colour with an exercise-book pattern, edge to edge */}
              {look.cover && (
                <div
                  data-note-cover={look.cover.value}
                  data-cover-kind={look.cover.kind}
                  className={`relative shrink-0 ${isPhone ? '-mx-5 -mt-5 h-28' : '-mx-8 md:-mx-16 h-[150px]'}`}
                >
                  <button type="button" data-print="keep" aria-label="Change the banner (Note look)" onClick={() => setLookOpen(true)} className="absolute inset-0 block overflow-hidden">
                    <BannerFill cover={look.cover} colour={look.colour} />
                  </button>
                  <BadgeRow ids={badges} size={isPhone ? 32 : 36} className="absolute top-3 right-3 pointer-events-none" />
                </div>
              )}
              {/* Icon and status, above the title (a dashed tile invites a look when there is none) */}
              {(look.icon || note.status || !look.cover || isPhone || badges.length > 0) && (
                <div className={`relative flex items-end gap-3 ${look.cover && look.icon ? (isPhone ? '-mt-11' : '-mt-14') : ''}`}>
                  {look.icon ? (
                    <button type="button" data-print="keep" data-note-icon onClick={() => setLookOpen(true)} aria-label="Change the icon (Note look)" className="rounded-[22px] shrink-0">
                      <NoteIcon note={note} size={isPhone ? 64 : 80} ring={!!look.cover} />
                    </button>
                  ) : (
                    !note.status && badges.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setLookOpen(true)}
                        aria-label="Give this note a look"
                        title="Note look: colour, icon, cover, status"
                        className={`w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-nt-line text-nt-muted hover:text-nt-text2 hover:border-nt-text2 transition-colors`}
                      >
                        <LuPalette className="w-5 h-5" aria-hidden="true" />
                      </button>
                    )
                  )}
                  {note.status && (
                    <button type="button" data-print="keep" onClick={() => setLookOpen(true)} aria-label="Change the status (Note look)" className={look.icon ? 'mb-1' : ''}>
                      <StatusBadge id={note.status} />
                    </button>
                  )}
                  {!look.cover && badges.length > 0 && <BadgeRow ids={badges} size={30} className={look.icon ? 'mb-1' : ''} />}
                  {isPhone && (
                    <span className={`ml-auto flex flex-col items-end gap-1 ${look.icon ? 'mb-1' : ''}`}>
                      {privacyChip}
                      <span className="text-xs text-nt-text2 tabular-nums">
                        {wordCount} words · {readingTimeMinutes} min read
                      </span>
                    </span>
                  )}
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
                  <TagEditor tags={note.tags || []} onChange={handleTagsChange} tagColours={tagColours} />
                </div>
                {!isPhone && (
                  <span className="text-xs text-nt-text2 tabular-nums shrink-0">
                    {wordCount} words · {readingTimeMinutes} min read
                  </span>
                )}
              </div>

              {/* Blocks */}
              <div className="flex flex-col gap-1 pt-4" onMouseLeave={() => setHoveredBlockId(null)}>
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
                    hoveredId={hoveredBlockId}
                    onHover={setHoveredBlockId}
                    onRequestAssets={(id) => setAssetPick({ targetId: id })}
                    onRequestFile={(id) => handleInsertFromFile(id)}
                    onOpenBoard={onOpenBoard}
                  />
                ))}
              </div>
            </div>

            {/* The empty space under the last block: click it to keep typing (as in Notion) */}
            <div
              data-click-below
              onClick={handleClickBelow}
              className={`cursor-text ${isPhone ? 'min-h-[200px]' : 'min-h-[120px]'}`}
            />

            {/* Add a block (laptops and tablets; phones use the Add block button), folded away
                to one quiet row unless opened */}
            {!isPhone && !gridOpen && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={() => toggleGrid(true)} aria-expanded={false} className={`${BTN_QUIET} !px-2.5 !text-nt-text2 hover:!text-nt-ink`}>
                  <LuPlus className="w-4 h-4" aria-hidden="true" />
                  Add block
                </button>
                <span className="text-xs text-nt-text2">or type / in a text block</span>
              </div>
            )}
            {!isPhone && gridOpen && (
              <section aria-label="Add block" className="pt-6 border-t border-nt-line" data-tour="notes-add-block">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-[13px] font-semibold text-nt-text2">Add block</h2>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-nt-text2">or type / in a text block</span>
                    <button type="button" onClick={() => toggleGrid(false)} aria-expanded={true} className={`${BTN_QUIET} !h-8 !px-2 !text-nt-text2 hover:!text-nt-ink`}>
                      Hide
                      <LuChevronUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BLOCK_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleAddBlock(t.type)}
                      data-tour={`notes-block-${t.id}`}
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
          <div aria-hidden="true" className="pointer-events-none fixed left-0 right-0 bottom-[var(--app-tab-h,0px)] h-24 bg-gradient-to-t from-nt-surface to-transparent" />
          <button
            type="button"
            onClick={() => setAddSheetOpen(true)}
            data-tour="notes-add-block"
            className="fixed left-1/2 -translate-x-1/2 bottom-[calc(var(--app-tab-h,0px)+24px)] z-20 inline-flex items-center gap-2 h-[52px] pl-[18px] pr-[22px] rounded-full bg-nt-ink text-nt-on-ink text-base font-semibold shadow-nt-bar"
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
