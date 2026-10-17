'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { FiCheck } from 'react-icons/fi';
import { LuHeading, LuList, LuListChecks, LuBold, LuItalic } from 'react-icons/lu';
import KatexView from '../equation/KatexView';
import { TOUCH_TARGET } from '../ui/Dialog';
import {
  getGhostSuggestion,
  initAutocompleteTrie,
  recordRecentWord,
  resetSequenceContext,
} from '../../utils/autocompleteTrie';

// Text size and line height, shared by the field and the autocomplete hint laid over it
const BODY = { fontSize: '15px', lineHeight: '1.6' };
const RULED = { fontSize: '15px', lineHeight: '32px' };

/** **bold**, *italic*, $inline maths$ and $$display maths$$ inside one line. */
function InlineText({ text }) {
  if (!text) return null;
  return text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/).map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      return <KatexView key={i} latex={part.slice(2, -2)} display className="block my-1" />;
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      return <KatexView key={i} latex={part.slice(1, -1)} />;
    }
    return part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) return <strong key={`${i}-${j}`} className="font-semibold">{seg.slice(2, -2)}</strong>;
      if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) return <em key={`${i}-${j}`}>{seg.slice(1, -1)}</em>;
      return <React.Fragment key={`${i}-${j}`}>{seg}</React.Fragment>;
    });
  });
}

/**
 * The text as it reads: headings (#, ##, ###), quotes (>), numbered and bulleted lists, tasks
 * ([ ] and [x], which tick with a tap) and maths. Amber marks the lists and tasks: the Text
 * block's one colour.
 */
function RichText({ text, ruled, onToggleTask }) {
  if (!text || !text.trim()) {
    return <span className="text-pg-label text-pg-text2">Empty. Double-click to write.</span>;
  }
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let m;
    if ((m = line.match(/^#\s+(.*)$/))) return <h2 key={i} className="text-pg-title font-semibold text-pg-ink pt-1 pb-0.5"><InlineText text={m[1]} /></h2>;
    if ((m = line.match(/^##\s+(.*)$/))) return <h3 key={i} className="text-[16px] leading-6 font-semibold text-pg-ink pt-1"><InlineText text={m[1]} /></h3>;
    if ((m = line.match(/^###\s+(.*)$/))) return <h4 key={i} className="text-pg-body font-semibold text-pg-text2 pt-0.5"><InlineText text={m[1]} /></h4>;
    if ((m = line.match(/^>\s+(.*)$/))) {
      return (
        <div key={i} className="my-1 px-3 py-1.5 rounded-lg bg-pg-note-tint/60 text-pg-ink italic">
          <InlineText text={m[1]} />
        </div>
      );
    }
    if ((m = line.match(/^\[( |x)\] (.*)$/))) {
      const done = m[1] === 'x';
      return (
        <div key={i} className="flex items-start gap-2.5 py-0.5">
          <button
            type="button"
            aria-label={done ? 'Mark as not done' : 'Mark as done'}
            aria-pressed={done}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleTask(i);
            }}
            // The box is 18 px; the press area around it 30 px with a mouse, 44 px on touch
            className="group/task shrink-0 mt-[3px] -m-1.5 p-1.5 [@media(pointer:coarse)]:-m-[13px] [@media(pointer:coarse)]:p-[13px] rounded-lg"
          >
            <span
              className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-colors ${
                done ? 'bg-pg-note text-pg-surface' : 'border-[1.5px] border-pg-note/50 group-hover/task:border-pg-note'
              }`}
            >
              {done && <FiCheck className="w-3 h-3" strokeWidth={3} />}
            </span>
          </button>
          <span className={done ? 'text-pg-text2 line-through' : 'text-pg-ink'}><InlineText text={m[2]} /></span>
        </div>
      );
    }
    if ((m = line.match(/^(\d+)\.\s+(.*)$/))) {
      return (
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="min-w-[1.25rem] tabular-nums font-semibold text-pg-note shrink-0">{m[1]}.</span>
          <span className="text-pg-ink"><InlineText text={m[2]} /></span>
        </div>
      );
    }
    if ((m = line.match(/^(- |• )(.*)$/))) {
      return (
        <div key={i} className="flex items-start gap-2.5 py-0.5">
          <span aria-hidden="true" className="mt-[9px] w-1.5 h-1.5 rounded-full bg-pg-note shrink-0" />
          <span className="text-pg-ink"><InlineText text={m[2]} /></span>
        </div>
      );
    }
    return (
      <div key={i} className={ruled ? 'h-[32px] overflow-hidden text-pg-ink' : 'text-pg-ink min-h-[1.6em]'}>
        {line ? <InlineText text={line} /> : null}
      </div>
    );
  });
}

/**
 * A Text block: notes with light markdown. At rest it reads like a page (15 px text, amber list
 * markers); a click selects it like any block, a double-click (or Edit, or a second tap) opens
 * it for typing, with word suggestions (Tab) and a small formatting toolbar.
 *
 * Memoized, and the text is laid out again only when it changes, not while the page moves.
 */
function TheoryBlock({ block, onUpdateContent, isEditing: propIsEditing, setIsEditing: propSetIsEditing }) {
  const [text, setText] = useState(block.content?.text || '');
  const [localIsEditing, setLocalIsEditing] = useState(() => !block.content?.text);
  const ruled = Boolean(block?.isRuledLineAligned);

  const isEditing = propIsEditing !== undefined ? propIsEditing : localIsEditing;
  const setIsEditing = propSetIsEditing || setLocalIsEditing;
  const [suggestion, setSuggestion] = useState(null);
  const textareaRef = useRef(null);
  const textRef = useRef(text);
  textRef.current = text;

  // Word suggestions load in the background, the first time a Text block is edited
  useEffect(() => {
    if (isEditing) initAutocompleteTrie();
  }, [isEditing]);

  useEffect(() => {
    if (block.content?.text !== undefined) setText(block.content.text);
  }, [block.content?.text]);

  // The field grows with what is typed
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
  }, []);
  useEffect(() => {
    if (isEditing) autoResize();
  }, [isEditing, text, autoResize]);

  const updateSuggestion = (currentText, cursorIndex) => {
    setSuggestion(getGhostSuggestion(currentText, cursorIndex));
  };

  const handleChange = useCallback((newVal, cursorIndex = null) => {
    setText(newVal);
    onUpdateContent(block.blockId, { text: newVal });
    if (cursorIndex !== null) updateSuggestion(newVal, cursorIndex);
  }, [block.blockId, onUpdateContent]);

  // A task ticked at rest: one line changes
  const toggleTask = useCallback((lineIndex) => {
    const lines = textRef.current.split('\n');
    const line = lines[lineIndex] || '';
    lines[lineIndex] = line.startsWith('[x] ') ? `[ ] ${line.slice(4)}` : line.startsWith('[ ] ') ? `[x] ${line.slice(4)}` : line;
    handleChange(lines.join('\n'));
  }, [handleChange]);

  const rendered = useMemo(() => <RichText text={text} ruled={ruled} onToggleTask={toggleTask} />, [text, ruled, toggleTask]);

  // Puts (or takes away) a prefix at the start of the cursor's line
  const insertLinePrefix = (prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lines = text.split('\n');
    let charCount = 0;
    let lineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        lineIndex = i;
        break;
      }
      charCount += lines[i].length + 1;
    }
    let delta = 0;
    if (lines[lineIndex].startsWith(prefix)) {
      lines[lineIndex] = lines[lineIndex].substring(prefix.length);
      delta = -prefix.length;
    } else {
      const oldLen = lines[lineIndex].length;
      lines[lineIndex] = lines[lineIndex].replace(/^(#+\s*|- |• |\[ \] |\[x\] |\d+\.\s*|> )/, '');
      const removed = oldLen - lines[lineIndex].length;
      lines[lineIndex] = prefix + lines[lineIndex];
      delta = prefix.length - removed;
    }
    handleChange(lines.join('\n'));
    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.max(0, start + delta);
      el.setSelectionRange(pos, pos);
    });
  };

  // Wraps the selection in marks (** for bold, * for italic), or puts the cursor between them
  const wrapSelection = (mark) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = text.substring(start, end);
    handleChange(text.substring(0, start) + mark + selected + mark + text.substring(end));
    requestAnimationFrame(() => {
      el.focus();
      if (start !== end) el.setSelectionRange(start, end + mark.length * 2);
      else el.setSelectionRange(start + mark.length, start + mark.length);
    });
  };

  const acceptSuggestion = () => {
    if (!suggestion || !textareaRef.current) return false;
    const el = textareaRef.current;
    const { endPos, suffix } = suggestion;
    const newText = text.substring(0, endPos) + suffix + text.substring(endPos);
    const caret = endPos + suffix.length;
    if (suggestion.fullWord) recordRecentWord(suggestion.fullWord);
    handleChange(newText);
    setSuggestion(null);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = caret;
    });
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      acceptSuggestion();
      return;
    }
    if (e.key === 'ArrowRight' && suggestion) {
      const el = textareaRef.current;
      if (el && el.selectionStart === suggestion.endPos && el.selectionEnd === suggestion.endPos) {
        e.preventDefault();
        acceptSuggestion();
        return;
      }
    }
    if (e.key === 'Escape' && suggestion) {
      e.preventDefault();
      setSuggestion(null);
      return;
    }
    // Enter continues a list, a numbered list or a task list; on an empty item it ends the list
    if (e.key === 'Enter') {
      setSuggestion(null);
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const before = text.substring(0, start);
      const lastLine = before.split('\n').pop() || '';
      const endList = () => {
        e.preventDefault();
        const lineStart = before.lastIndexOf('\n') + 1;
        handleChange(text.substring(0, lineStart) + '\n' + text.substring(start));
      };
      let prefix = '';
      let m;
      if ((m = lastLine.match(/^(\s*)(- |• )/))) {
        if (lastLine.trim() === '-' || lastLine.trim() === '•') return endList();
        prefix = m[0];
      } else if ((m = lastLine.match(/^(\s*)(\d+)\.\s+/))) {
        if (lastLine.trim() === `${m[2]}.`) return endList();
        prefix = `${m[1]}${parseInt(m[2], 10) + 1}. `;
      } else if ((m = lastLine.match(/^(\s*)(\[ \] |\[x\] )/))) {
        if (lastLine.trim() === '[ ]' || lastLine.trim() === '[x]') return endList();
        prefix = `${m[1]}[ ] `;
      }
      if (prefix) {
        e.preventDefault();
        handleChange(text.substring(0, start) + '\n' + prefix + text.substring(start));
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 1 + prefix.length;
        });
      }
    }
  };

  if (!isEditing) {
    return (
      <div className={`w-full h-full overflow-y-auto text-pg-body text-pg-ink ${ruled ? 'pt-[2px] px-1' : 'px-4 py-3 space-y-1'}`}>
        {rendered}
      </div>
    );
  }

  const tool = `w-8 h-8 ${TOUCH_TARGET} flex items-center justify-center rounded-lg text-pg-text2 hover:text-pg-ink hover:bg-pg-tray transition-colors`;
  const fieldStyle = ruled ? RULED : BODY;

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div role="toolbar" aria-label="Format" className="flex-shrink-0 flex items-center gap-0.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertLinePrefix('# ')} title="Heading (# )" aria-label="Heading" className={tool}>
          <LuHeading className="w-4 h-4" />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertLinePrefix('- ')} title="List (- )" aria-label="Bulleted list" className={tool}>
          <LuList className="w-4 h-4" />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertLinePrefix('[ ] ')} title="Task ([ ] )" aria-label="Task" className={tool}>
          <LuListChecks className="w-4 h-4" />
        </button>
        <span aria-hidden="true" className="w-px h-5 bg-pg-line mx-1" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => wrapSelection('**')} title="Bold (**text**)" aria-label="Bold" className={tool}>
          <LuBold className="w-4 h-4" />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => wrapSelection('*')} title="Italic (*text*)" aria-label="Italic" className={tool}>
          <LuItalic className="w-4 h-4" />
        </button>
        <span className="ml-auto pr-1 text-pg-cap text-pg-text2 truncate">$x^2$ for maths</span>
      </div>

      <div className="relative flex-1 w-full rounded-xl bg-pg-paper border border-pg-line overflow-y-auto">
        {/* The word suggestion, drawn under the field in the same place as the text */}
        {suggestion && (
          <div aria-hidden="true" className="absolute inset-0 px-3 py-2.5 text-transparent pointer-events-none select-none overflow-hidden whitespace-pre-wrap break-words" style={fieldStyle}>
            <span>{text.substring(0, suggestion.endPos)}</span>
            <span className="text-pg-text2">
              {suggestion.suffix}
              <span className="inline-flex items-center ml-1 px-1 text-pg-cap font-semibold rounded border border-pg-line bg-pg-surface text-pg-text2 align-middle">Tab</span>
            </span>
            <span>{text.substring(suggestion.endPos)}</span>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value, e.target.selectionStart)}
          onFocus={() => resetSequenceContext()}
          onClick={(e) => updateSuggestion(text, e.target.selectionStart)}
          onKeyUp={(e) => updateSuggestion(text, e.target.selectionStart)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setSuggestion(null);
            if (text.trim()) {
              resetSequenceContext();
              for (const word of text.match(/[a-zA-Z]{2,}/g) || []) recordRecentWord(word);
            }
          }}
          autoFocus
          placeholder="Type here. # starts a heading, - a list, [ ] a task, $x^2$ maths."
          aria-label="Text"
          className="relative z-10 w-full h-full px-3 py-2.5 bg-transparent text-pg-ink placeholder:text-pg-text2/70 focus:outline-none rounded-xl resize-none whitespace-pre-wrap break-words"
          style={{ minHeight: '96px', ...fieldStyle }}
        />
      </div>
    </div>
  );
}

export default memo(TheoryBlock);
