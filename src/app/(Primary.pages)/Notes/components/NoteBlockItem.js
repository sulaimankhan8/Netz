'use client';

import { useState } from 'react';
import EmbeddedMathWidget from './EmbeddedMathWidget';
import KaTeXRenderer from './KaTeXRenderer';
import SlashCommandMenu from './SlashCommandMenu';
import QuizBlock from './QuizBlock';
import InkSketchBlock from './InkSketchBlock';
import { 
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaLightbulb
} from 'react-icons/fa';

export default function NoteBlockItem({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onMove,
  onOpenPicker,
  onInsertBlockAfter
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [isSlashOpen, setIsSlashOpen] = useState(false);

  const handleContentChange = (val) => {
    // Only trigger slash menu if slash is at line start or preceded by a whitespace
    const slashMatch = val.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);
    if (slashMatch) {
      setSlashQuery(slashMatch[1]);
      setIsSlashOpen(true);
    } else {
      setIsSlashOpen(false);
    }

    onUpdate({ ...block, content: val });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onInsertBlockAfter(index);
    } else if (e.key === 'Backspace' && (!block.content || block.content.trim() === '')) {
      if (totalBlocks > 1) {
        e.preventDefault();
        onDelete(block.id);
      }
    }
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    if (block.type === 'paragraph' && !block.content) {
      setSlashQuery('');
      setIsSlashOpen(true);
    } else {
      onInsertBlockAfter(index);
    }
  };

  const handleSelectSlashItem = (item) => {
    setIsSlashOpen(false);
    // Remove only the triggering slash command pattern
    let cleanContent = block.content ? block.content.replace(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/, '').trim() : '';

    if (item.type === 'open-picker') {
      onOpenPicker(block.id);
      return;
    }

    if (item.type === 'widget') {
      onUpdate({
        ...block,
        type: 'widget',
        content: item.title,
        widgetConfig: item.widgetConfig
      });
    } else if (item.type === 'quiz') {
      onUpdate({
        ...block,
        type: 'quiz',
        content: 'Interactive Quiz Block',
        quizConfig: {
          question: 'What is the order of convergence for the Newton-Raphson method?',
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
          explanation: 'The Newton-Raphson method exhibits quadratic convergence (order 2) near a simple root.'
        }
      });
    } else if (item.type === 'ink') {
      let initialInk = '';
      if (typeof window !== 'undefined') {
        initialInk = localStorage.getItem('netz_pending_ink_clip') || '';
      }
      onUpdate({
        ...block,
        type: 'ink',
        content: initialInk,
        caption: 'Figure: Handwritten calculation sketch'
      });
    } else {
      // Set empty string for heading1, heading2, heading3, callout, and paragraph so placeholders show
      let defaultContent = cleanContent;
      if (['heading1', 'heading2', 'heading3', 'callout', 'paragraph'].includes(item.type)) {
        defaultContent = cleanContent;
      } else if (item.type === 'math') {
        defaultContent = cleanContent || 'e^{i\\pi} + 1 = 0';
      }

      onUpdate({
        ...block,
        type: item.type,
        content: defaultContent
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative my-2 font-sans text-neutral-900 dark:text-slate-100 transition-colors w-full rounded-lg"
    >
      {/* Clean Hover Controls (Positioned responsively on mobile and desktop) */}
      <div
        className={`absolute sm:-left-24 sm:top-1 -top-7 left-0 flex items-center space-x-1 transition-opacity duration-150 z-30 shrink-0 bg-white/95 dark:bg-[#202020]/95 backdrop-blur-sm border border-neutral-200 dark:border-[#333333] rounded-lg px-1.5 py-0.5 shadow-md ${
          isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={handlePlusClick}
          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#2e2e2e] transition-colors"
          title="Add block / open '/' commands"
        >
          <FaPlus className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-white disabled:opacity-20 dark:hover:bg-[#2e2e2e] rounded transition-colors"
          title="Move Up"
        >
          <FaArrowUp className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={() => onMove(index, index + 1)}
          disabled={index === totalBlocks - 1}
          className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-white disabled:opacity-20 dark:hover:bg-[#2e2e2e] rounded transition-colors"
          title="Move Down"
        >
          <FaArrowDown className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={() => onDelete(block.id)}
          className="p-1 text-neutral-500 hover:text-red-500 hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-[#2e2e2e] rounded transition-colors"
          title="Delete Block"
        >
          <FaTrash className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Main Block Content Renderer */}
      <div className="relative w-full">
        {block.type === 'heading1' && (
          <input
            type="text"
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-2xl sm:text-3xl font-bold bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-400 dark:placeholder-slate-600 border-b border-transparent focus:border-indigo-500/50 py-1"
            placeholder="Heading 1..."
          />
        )}

        {block.type === 'heading2' && (
          <input
            type="text"
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-lg sm:text-xl font-semibold bg-transparent text-neutral-800 dark:text-slate-200 focus:outline-none placeholder-neutral-400 dark:placeholder-slate-600 border-b border-transparent focus:border-indigo-500/50 py-1"
            placeholder="Heading 2..."
          />
        )}

        {block.type === 'heading3' && (
          <input
            type="text"
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-base font-semibold bg-transparent text-indigo-600 dark:text-indigo-300 focus:outline-none placeholder-neutral-400 dark:placeholder-slate-600 border-b border-transparent focus:border-indigo-500/50 py-1"
            placeholder="Heading 3..."
          />
        )}

        {block.type === 'paragraph' && (
          <textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && (!block.content || block.content === '')) {
                if (totalBlocks > 1) {
                  e.preventDefault();
                  onDelete(block.id);
                }
              }
            }}
            rows={Math.max(1, (block.content.match(/\n/g) || []).length + 1)}
            className="w-full bg-transparent text-sm text-neutral-800 dark:text-slate-300 focus:outline-none resize-none leading-relaxed placeholder-neutral-400 dark:placeholder-slate-600 focus:placeholder-neutral-500 dark:focus:placeholder-slate-500"
            placeholder="Type your notes or press '/' for commands..."
          />
        )}

        {block.type === 'math' && (
          <div className="space-y-2 p-3.5 rounded-xl bg-neutral-100/90 dark:bg-[#202020] border border-neutral-200 dark:border-[#333333] w-full transition-colors">
            <div className="flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
              <span>LaTeX Math Code</span>
              <span className="text-[10px] text-neutral-500 dark:text-slate-500">Live KaTeX Render</span>
            </div>
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs font-mono text-purple-700 dark:text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. Z = \frac{\bar{X} - \mu}{\sigma/\sqrt{n}}"
            />
            <div className="p-3 rounded-lg bg-white/80 dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] flex items-center justify-center transition-colors">
              <KaTeXRenderer math={block.content || 'e^{i\\pi} + 1 = 0'} blockMode={true} />
            </div>
          </div>
        )}

        {block.type === 'callout' && (
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-50/90 dark:bg-[#25231c] border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs w-full transition-colors">
            <FaLightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-amber-950 dark:text-amber-100 focus:outline-none placeholder-amber-600/50 dark:placeholder-amber-500/50 font-medium"
              placeholder="Callout note or key rule..."
            />
          </div>
        )}

        {block.type === 'widget' && (
          <EmbeddedMathWidget
            config={block.widgetConfig}
            onChange={(newConfig) => onUpdate({ ...block, widgetConfig: newConfig })}
            onOpenPicker={() => onOpenPicker(block.id)}
          />
        )}

        {block.type === 'quiz' && (
          <QuizBlock
            block={block}
            onUpdate={onUpdate}
          />
        )}

        {block.type === 'ink' && (
          <InkSketchBlock
            block={block}
            onUpdate={onUpdate}
          />
        )}

        {/* Slash Command Floating Menu Popover */}
        <SlashCommandMenu
          isOpen={isSlashOpen}
          query={slashQuery}
          onSelect={handleSelectSlashItem}
          onClose={() => setIsSlashOpen(false)}
        />
      </div>
    </div>
  );
}
