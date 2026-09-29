'use client';

import { useState, useEffect, useMemo } from 'react';
import NoteBlockItem from './NoteBlockItem';
import { exportNoteAsMarkdown } from '../utils/noteStorage';
import { exportNoteToPdf } from '../utils/pdfExport';
import { 
  FaShareAlt, 
  FaDownload, 
  FaFilePdf,
  FaQuestionCircle,
  FaPen,
  FaHeading, 
  FaParagraph, 
  FaSquareRootAlt, 
  FaLightbulb, 
  FaCalculator,
  FaGlobe,
  FaLock,
  FaTag,
  FaClock,
  FaFileAlt,
  FaCheckCircle
} from 'react-icons/fa';

export default function NoteEditor({
  note,
  onUpdateNote,
  onOpenShareModal,
  onOpenPickerForBlock,
  onAddWidgetBlock,
  isSidebarOpen,
  onToggleSidebar
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [subtitle, setSubtitle] = useState(note?.subtitle || '');
  const [tagsInput, setTagsInput] = useState(note?.tags ? note.tags.join(', ') : '');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setSubtitle(note.subtitle || '');
      setTagsInput(note.tags ? note.tags.join(', ') : '');
    }
  }, [note]);

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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#191919] text-neutral-500 dark:text-neutral-400 font-sans transition-colors duration-200">
        <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-[#242424] border border-neutral-200 dark:border-[#333333] flex items-center justify-center mb-6 text-neutral-800 dark:text-white shadow-sm">
          <FaSquareRootAlt className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">No Active Note Selected</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md leading-relaxed">
          Select a note from the sidebar or click <span className="text-neutral-900 dark:text-white font-bold">"Create New Note"</span> to start writing interactive math formulas and algorithm solvers.
        </p>
      </div>
    );
  }

  const handleTitleChange = (val) => {
    setTitle(val);
    onUpdateNote({ ...note, title: val });
  };

  const handleSubtitleChange = (val) => {
    setSubtitle(val);
    onUpdateNote({ ...note, subtitle: val });
  };

  const handleTagsChange = (val) => {
    setTagsInput(val);
    const parsedTags = val
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onUpdateNote({ ...note, tags: parsedTags });
  };

  const handleUpdateBlock = (updatedBlock) => {
    const newBlocks = note.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    onUpdateNote({ ...note, blocks: newBlocks });
  };

  const handleDeleteBlock = (blockId) => {
    const newBlocks = note.blocks.filter((b) => b.id !== blockId);
    onUpdateNote({ ...note, blocks: newBlocks });
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
    onUpdateNote({ ...note, blocks: newBlocks });
  };

  const handleAddBlock = (type) => {
    if (type === 'widget') {
      onAddWidgetBlock();
      return;
    }

    if (type === 'quiz') {
      const newBlock = {
        id: 'b-' + Date.now(),
        type: 'quiz',
        content: 'Interactive Quiz Block',
        quizConfig: {
          question: 'What is the order of convergence for Newton-Raphson method?',
          mode: 'mcq',
          options: [
            'Linear (Order 1)',
            'Quadratic (Order 2)',
            'Superlinear (Order 1.618)',
            'Cubic (Order 3)'
          ],
          correctOptionIndex: 1,
          correctNumericValue: 2.7065,
          tolerance: 0.001,
          explanation: 'Newton-Raphson exhibits quadratic convergence (order 2) near simple roots.'
        }
      };
      onUpdateNote({ ...note, blocks: [...note.blocks, newBlock] });
      return;
    }

    if (type === 'ink') {
      const newBlock = {
        id: 'b-' + Date.now(),
        type: 'ink',
        content: '',
        caption: 'Figure: Handwritten calculation sketch'
      };
      onUpdateNote({ ...note, blocks: [...note.blocks, newBlock] });
      return;
    }

    let content = '';
    if (type === 'math') {
      content = 'e^{i\\pi} + 1 = 0';
    }

    const newBlock = {
      id: 'b-' + Date.now(),
      type,
      content
    };

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

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 font-sans overflow-hidden min-w-0 transition-colors duration-200">
      {/* Top Header */}
      <div className="h-14 px-4 md:px-6 border-b border-neutral-200 dark:border-[#2d2d2d] bg-white dark:bg-[#191919] flex items-center justify-between shrink-0 gap-3 z-10">
        <div className="flex items-center space-x-3 text-xs text-neutral-600 dark:text-neutral-300 min-w-0">
          <span className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-[#242424] px-3 py-1 rounded-lg border border-neutral-200 dark:border-[#333333] text-xs font-semibold">
            {note.isPublic ? (
              <>
                <FaGlobe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Public</span>
              </>
            ) : (
              <>
                <FaLock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300 font-bold">Private</span>
              </>
            )}
          </span>

          <span className="hidden lg:flex items-center space-x-1 font-mono text-neutral-500 dark:text-neutral-400 text-xs bg-neutral-100 dark:bg-[#242424] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-[#333333]">
            <span>Key:</span>
            <span className="text-neutral-900 dark:text-white font-bold">{note.accessKey}</span>
          </span>

          <span className="hidden sm:flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <FaCheckCircle className="w-3.5 h-3.5" />
            <span>Saved</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenShareModal}
            className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#292929] dark:hover:bg-[#333333] text-neutral-900 dark:text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-[#383838] transition-all shadow-sm active:scale-95"
          >
            <FaShareAlt className="w-3 h-3 text-neutral-500 dark:text-neutral-300" />
            <span className="hidden sm:inline">Share & Access</span>
            <span className="sm:hidden">Share</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Download un-watermarked high-resolution academic PDF report"
          >
            <FaFilePdf className="w-3 h-3" />
            <span className="hidden sm:inline">{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            <span className="sm:hidden">{isExportingPdf ? '...' : 'PDF'}</span>
          </button>

          <button
            onClick={() => exportNoteAsMarkdown(note)}
            className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#292929] dark:hover:bg-[#333333] text-neutral-900 dark:text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-[#383838] transition-all shadow-sm active:scale-95"
          >
            <FaDownload className="w-3 h-3 text-neutral-500 dark:text-neutral-300" />
            <span className="hidden sm:inline">Export (.md)</span>
          </button>
        </div>
      </div>

      {/* Editor Main Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-notion-scrollbar">
        <div id="note-printable-area" className="max-w-4xl w-full mx-auto px-4 sm:px-8 md:pl-16 md:pr-12 py-8 space-y-6">
          {/* Title, Subtitle, Tags Header */}
          <div className="space-y-4 border-b border-neutral-200 dark:border-[#2d2d2d] pb-6 w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white bg-transparent focus:outline-none placeholder-neutral-300 dark:placeholder-neutral-600 tracking-tight"
              placeholder="Untitled Note..."
            />

            <input
              type="text"
              value={subtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              className="w-full text-sm font-semibold text-neutral-600 dark:text-neutral-300 bg-transparent focus:outline-none placeholder-neutral-300 dark:placeholder-neutral-600"
              placeholder="Add brief description or topic subtitle..."
            />

            {/* Tags & Reading Statistics Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs min-w-0 flex-1">
                <FaTag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 dark:bg-[#202020] dark:border-[#2e2e2e] dark:text-neutral-200 dark:placeholder-neutral-600 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-[#444444] font-mono transition-all font-medium"
                  placeholder="e.g. Calculus, Newton Raphson, Unit 1"
                />
              </div>

              <div className="flex items-center space-x-3 text-xs text-neutral-600 dark:text-neutral-300 font-mono bg-neutral-100 dark:bg-[#202020] px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-[#2e2e2e] font-semibold shrink-0">
                <span className="flex items-center space-x-1">
                  <FaFileAlt className="w-3 h-3 text-neutral-400" />
                  <span>{wordCount} words</span>
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <span className="flex items-center space-x-1">
                  <FaClock className="w-3 h-3 text-neutral-400" />
                  <span>{readingTimeMinutes} min read</span>
                </span>
              </div>
            </div>
          </div>

          {/* Blocks Canvas */}
          <div className="space-y-2 min-h-[300px] w-full">
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
              />
            ))}
          </div>

          {/* Add Block Toolbar Footer */}
          <div className="pt-6 border-t border-neutral-200 dark:border-[#2d2d2d]">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-extrabold uppercase tracking-wider flex items-center space-x-1.5">
              <span>+ Add Content Block</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono font-normal">(or type '/' inside any text block)</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <button
                onClick={() => handleAddBlock('heading1')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] dark:border-[#333333] dark:text-neutral-200 text-xs font-bold transition-all"
              >
                <FaHeading className="w-3.5 h-3.5 text-blue-500" />
                <span>H1 Heading</span>
              </button>

              <button
                onClick={() => handleAddBlock('heading2')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] dark:border-[#333333] dark:text-neutral-200 text-xs font-bold transition-all"
              >
                <FaHeading className="w-3 h-3 text-cyan-500" />
                <span>H2 Subheading</span>
              </button>

              <button
                onClick={() => handleAddBlock('paragraph')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] dark:border-[#333333] dark:text-neutral-200 text-xs font-bold transition-all"
              >
                <FaParagraph className="w-3.5 h-3.5 text-neutral-500" />
                <span>Paragraph</span>
              </button>

              <button
                onClick={() => handleAddBlock('math')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] dark:border-[#333333] dark:text-neutral-200 text-xs font-bold transition-all"
              >
                <FaSquareRootAlt className="w-3.5 h-3.5 text-purple-500" />
                <span>LaTeX Math</span>
              </button>

              <button
                onClick={() => handleAddBlock('callout')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] dark:border-[#333333] dark:text-neutral-200 text-xs font-bold transition-all"
              >
                <FaLightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Callout</span>
              </button>

              <button
                onClick={() => handleAddBlock('quiz')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] dark:border-[#333333] dark:text-neutral-200 text-xs font-bold transition-all"
              >
                <FaQuestionCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Quiz Block</span>
              </button>

              <button
                onClick={() => handleAddBlock('ink')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 dark:bg-[#222222] dark:hover:bg-[#2a2a2a] dark:border-[#333333] dark:text-neutral-200 text-xs font-bold transition-all"
              >
                <FaPen className="w-3.5 h-3.5 text-pink-500" />
                <span>Ink Sketch</span>
              </button>

              <button
                onClick={() => handleAddBlock('widget')}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900 dark:bg-[#292929] dark:hover:bg-[#333333] dark:border-[#404040] dark:text-white text-xs font-extrabold transition-all"
              >
                <FaCalculator className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>+ Math Widget</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
