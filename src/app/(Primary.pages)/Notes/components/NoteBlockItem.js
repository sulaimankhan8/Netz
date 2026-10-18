'use client';

import { useEffect, useRef, useState } from 'react';
import { LuArrowDown, LuArrowUp, LuGripVertical, LuLightbulb, LuPlus, LuSigma, LuTrash2 } from 'react-icons/lu';
import EmbeddedMathWidget from './EmbeddedMathWidget';
import KaTeXRenderer from './KaTeXRenderer';
import SlashCommandMenu from './SlashCommandMenu';
import QuizBlock from './QuizBlock';
import InkSketchBlock from './InkSketchBlock';
import { AutoTextarea, BTN_SECONDARY, FIELD, FIELD_INPUT, ICON_BTN, Menu } from './ui';
import { blockTypeOf, newQuizConfig } from '../utils/blockTypes';

const CARD_TYPES = ['widget', 'quiz', 'ink'];

/**
 * One block of a note (NOTES_VISUAL_REDESIGN_PLAN.md, section 4). Its tools (Add block below,
 * Move up, Move down, Delete block) sit behind a grip: in the left margin on laptops (shown on
 * hover and while the block has focus), and on the block you are in on touch screens.
 */
export default function NoteBlockItem({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onMove,
  onOpenPicker,
  onInsertBlockAfter,
  isPhone,
  coarse,
  isNew,
  isActive,
  onActivate
}) {
  const [slashQuery, setSlashQuery] = useState('');
  const [isSlashOpen, setIsSlashOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // A formula shows its LaTeX field only while it is being edited (Q5)
  const [editingMath, setEditingMath] = useState(Boolean(isNew && block.type === 'math'));
  const gripRef = useRef(null);
  const inputRef = useRef(null);

  // A block just added is ready to type into
  useEffect(() => {
    if (isNew) inputRef.current?.focus({ preventScroll: false });
  }, [isNew, editingMath]);

  // Leaving the block closes its formula editor
  useEffect(() => {
    if (!isActive && editingMath) setEditingMath(false);
  }, [isActive, editingMath]);

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
    if (isSlashOpen && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;
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

    if (item.action === 'picker') {
      onOpenPicker(block.id);
      return;
    }

    if (item.type === 'quiz') {
      onUpdate({ ...block, type: 'quiz', content: 'Interactive Quiz Block', quizConfig: newQuizConfig() });
    } else if (item.type === 'ink') {
      let initialInk = '';
      if (typeof window !== 'undefined') {
        initialInk = localStorage.getItem('netz_pending_ink_clip') || '';
      }
      onUpdate({ ...block, type: 'ink', content: initialInk, caption: 'Figure: Handwritten calculation sketch' });
    } else {
      // Empty for headings, callout and text so their placeholders show
      let defaultContent = cleanContent;
      if (item.type === 'math') {
        defaultContent = cleanContent || 'e^{i\\pi} + 1 = 0';
        setEditingMath(true);
      }
      onUpdate({ ...block, type: item.type, content: defaultContent });
    }
  };

  const menuItems = [
    { id: 'add', label: 'Add block below', icon: <LuPlus className="w-[18px] h-[18px]" />, onSelect: () => onInsertBlockAfter(index) },
    { id: 'up', label: 'Move up', disabled: index === 0, icon: <LuArrowUp className="w-[18px] h-[18px]" />, onSelect: () => onMove(index, index - 1) },
    { id: 'down', label: 'Move down', disabled: index === totalBlocks - 1, icon: <LuArrowDown className="w-[18px] h-[18px]" />, onSelect: () => onMove(index, index + 1) },
    'divider',
    { id: 'delete', label: 'Delete block', danger: true, icon: <LuTrash2 className="w-[18px] h-[18px]" />, onSelect: () => onDelete(block.id, { notify: true }) }
  ];

  const typeInfo = blockTypeOf(block.type);
  const isCard = CARD_TYPES.includes(block.type);
  const showTouchGrip = coarse && (isActive || menuOpen);

  const gripButton = (extra = '') => (
    <button
      ref={gripRef}
      type="button"
      onClick={() => setMenuOpen((v) => !v)}
      aria-label={`${typeInfo.name} block options`}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      title="Block options"
      className={`${ICON_BTN} ${extra} ${menuOpen ? '!bg-nt-tray !text-nt-ink' : ''}`}
    >
      <LuGripVertical className="w-[18px] h-[18px]" aria-hidden="true" />
    </button>
  );

  // Card blocks carry the grip in their own header on phones, so it never covers their tools
  const cardMenuButton = isPhone && isCard ? gripButton() : null;

  return (
    <div
      data-block-id={block.id}
      onPointerDownCapture={() => onActivate(block.id)}
      onFocusCapture={() => onActivate(block.id)}
      className="group/block relative w-full"
    >
      {/* Laptops and tablets: grip and + in the left margin */}
      {!isPhone && (!coarse || showTouchGrip) && (
        <div
          className={`absolute -left-12 top-0.5 flex flex-col gap-0.5 transition-opacity ${
            coarse || menuOpen
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none group-hover/block:opacity-100 group-hover/block:pointer-events-auto group-focus-within/block:opacity-100 group-focus-within/block:pointer-events-auto'
          }`}
        >
          {gripButton(coarse ? '' : '!w-8 !h-8')}
          <button type="button" onClick={handlePlusClick} aria-label="Add block below" title="Add block below" className={`${ICON_BTN} ${coarse ? '' : '!w-8 !h-8'}`}>
            <LuPlus className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Phones: the grip floats at the top right of the text block you are in */}
      {isPhone && !isCard && showTouchGrip && (
        <div className="absolute -top-4 -right-1 z-10">{gripButton('!rounded-full !bg-nt-surface !text-nt-ink shadow-nt-bar')}</div>
      )}

      {menuOpen && (
        <Menu title={`${typeInfo.name} block`} items={menuItems} isPhone={isPhone} anchorRef={gripRef} align="start" onClose={() => setMenuOpen(false)} />
      )}

      <div className="relative w-full">
        {block.type === 'heading1' && (
          <AutoTextarea
            ref={inputRef}
            value={block.content}
            aria-label="Heading 1"
            onChange={(e) => handleContentChange(e.target.value.replace(/\n/g, ' '))}
            onKeyDown={handleKeyDown}
            className={`font-bold text-nt-ink placeholder:text-nt-muted pt-4 pb-1 ${isPhone ? 'text-2xl leading-8' : 'text-[28px] leading-9'}`}
            placeholder="Heading 1"
          />
        )}

        {block.type === 'heading2' && (
          <AutoTextarea
            ref={inputRef}
            value={block.content}
            aria-label="Heading 2"
            onChange={(e) => handleContentChange(e.target.value.replace(/\n/g, ' '))}
            onKeyDown={handleKeyDown}
            className={`font-semibold text-nt-ink placeholder:text-nt-muted pt-3 pb-0.5 ${isPhone ? 'text-xl leading-7' : 'text-[22px] leading-[30px]'}`}
            placeholder="Heading 2"
          />
        )}

        {block.type === 'heading3' && (
          <AutoTextarea
            ref={inputRef}
            value={block.content}
            aria-label="Heading 3"
            onChange={(e) => handleContentChange(e.target.value.replace(/\n/g, ' '))}
            onKeyDown={handleKeyDown}
            className="text-lg leading-[26px] font-semibold text-nt-ink placeholder:text-nt-muted pt-2"
            placeholder="Heading 3"
          />
        )}

        {block.type === 'paragraph' && (
          <AutoTextarea
            ref={inputRef}
            value={block.content}
            aria-label="Text"
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && (!block.content || block.content === '')) {
                if (totalBlocks > 1) {
                  e.preventDefault();
                  onDelete(block.id);
                }
              }
            }}
            className="text-base leading-[26px] text-nt-ink placeholder:text-nt-muted py-1 max-w-[680px]"
            placeholder="Type, or press / for blocks"
          />
        )}

        {block.type === 'math' &&
          (editingMath ? (
            <div className="rounded-2xl border border-nt-math bg-nt-surface ring-[3px] ring-nt-math-tint my-1">
              <div className="flex items-center gap-2.5 pl-3.5 pr-2 py-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeInfo.tile}`} aria-hidden="true">
                  <LuSigma className="w-4 h-4" />
                </span>
                <span className="flex-1 text-[13px] font-semibold text-nt-math">Formula</span>
                <button type="button" onClick={() => setEditingMath(false)} className={`${BTN_SECONDARY} !h-9`}>
                  Done
                </button>
              </div>
              <div className="px-3.5 pb-3.5 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-nt-text2">LaTeX</span>
                  <span className={FIELD}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setEditingMath(false);
                          return;
                        }
                        handleKeyDown(e);
                      }}
                      className={`${FIELD_INPUT} font-nt-mono`}
                      placeholder="e.g. Z = \frac{\bar{X} - \mu}{\sigma/\sqrt{n}}"
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                    />
                  </span>
                </label>
                <div className="rounded-xl bg-nt-math-tint min-h-[88px] px-4 py-3 flex items-center justify-center overflow-x-auto">
                  <KaTeXRenderer math={block.content || 'e^{i\\pi} + 1 = 0'} blockMode={true} />
                </div>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-label="Formula. Press Enter to edit"
              title="Edit formula"
              onClick={() => setEditingMath(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setEditingMath(true);
                }
              }}
              className="my-1 rounded-2xl bg-nt-math-tint min-h-[104px] px-4 py-4 flex items-center justify-center overflow-x-auto cursor-text outline-none focus-visible:ring-2 focus-visible:ring-nt-accent"
            >
              {block.content ? (
                <KaTeXRenderer math={block.content} blockMode={true} />
              ) : (
                <span className="text-sm text-nt-text2">Empty formula. Tap to write LaTeX.</span>
              )}
            </div>
          ))}

        {block.type === 'callout' && (
          <div className="my-1 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-nt-callout-tint">
            <LuLightbulb className="w-[18px] h-[18px] text-nt-callout shrink-0 mt-[3px]" aria-hidden="true" />
            <AutoTextarea
              ref={inputRef}
              value={block.content}
              aria-label="Callout"
              onChange={(e) => handleContentChange(e.target.value.replace(/\n/g, ' '))}
              onKeyDown={handleKeyDown}
              className="text-[15px] leading-6 text-nt-ink placeholder:text-nt-callout/70"
              placeholder="A rule, a tip, a warning"
            />
          </div>
        )}

        {block.type === 'widget' && (
          <EmbeddedMathWidget
            config={block.widgetConfig}
            onChange={(newConfig) => onUpdate({ ...block, widgetConfig: newConfig })}
            onOpenPicker={() => onOpenPicker(block.id)}
            menuButton={cardMenuButton}
          />
        )}

        {block.type === 'quiz' && <QuizBlock block={block} onUpdate={onUpdate} menuButton={cardMenuButton} />}

        {block.type === 'ink' && <InkSketchBlock block={block} onUpdate={onUpdate} menuButton={cardMenuButton} />}

        {/* Slash Command Floating Menu Popover */}
        <SlashCommandMenu isOpen={isSlashOpen} query={slashQuery} onSelect={handleSelectSlashItem} onClose={() => setIsSlashOpen(false)} />
      </div>
    </div>
  );
}
