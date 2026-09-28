'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import {
  FiEdit2,
  FiCheck,
  FiList,
  FiCheckSquare,
  FiBold,
  FiItalic,
  FiType,
  FiHash,
} from 'react-icons/fi';
import {
  getGhostSuggestion,
  initAutocompleteTrie,
  recordRecentWord,
  resetSequenceContext,
} from '../../utils/autocompleteTrie';

/**
 * TheoryBlock — Rich Text Notes Block
 *
 * Professional multi-line text editor with:
 * - Multi-line auto-resizing textarea with smooth scroll
 * - English word ghost-text autocomplete with [Tab] pill hint (backed by Trie + LRU cache)
 * - Headings (#, ##, ###), Quotes (>), Numbered lists (1. ), Bullets (- , • ), Checkboxes ([ ], [x])
 * - Inline KaTeX math ($...$) and Block math ($$...$$)
 * - Formatting toolbar (Heading, List, Checkbox, Bold, Italic)
 */
export default function TheoryBlock({
  block,
  onUpdateContent,
  isEditing: propIsEditing,
  setIsEditing: propSetIsEditing,
}) {
  const [text, setText] = useState(block.content?.text || '');
  const [localIsEditing, setLocalIsEditing] = useState(() => !block.content?.text);

  const isEditing = propIsEditing !== undefined ? propIsEditing : localIsEditing;
  const setIsEditing = propSetIsEditing || setLocalIsEditing;
  const [suggestion, setSuggestion] = useState(null);
  const textareaRef = useRef(null);

  // Initialize Trie in background on mount
  useEffect(() => {
    initAutocompleteTrie();
  }, []);

  useEffect(() => {
    if (block.content?.text !== undefined) {
      setText(block.content.text);
    }
  }, [block.content?.text]);

  // Auto-resize textarea to content height
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 60)}px`;
  }, []);

  useEffect(() => {
    if (isEditing) {
      autoResize();
    }
  }, [isEditing, text, autoResize]);

  const updateSuggestion = useCallback((currentText, cursorIndex) => {
    if (typeof cursorIndex !== 'number') {
      const el = textareaRef.current;
      cursorIndex = el ? el.selectionStart : 0;
    }
    const sug = getGhostSuggestion(currentText !== undefined ? currentText : text, cursorIndex);
    setSuggestion(sug);
  }, [text]);

  const handleChange = (newVal, cursorIndex = null) => {
    setText(newVal);
    onUpdateContent(block.blockId, { text: newVal });
    if (cursorIndex !== null) {
      updateSuggestion(newVal, cursorIndex);
    }
  };

  /**
   * Inserts a prefix at the current cursor position's line start.
   */
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
      charCount += lines[i].length + 1; // +1 for \n
    }

    let delta = 0;
    if (lines[lineIndex].startsWith(prefix)) {
      lines[lineIndex] = lines[lineIndex].substring(prefix.length);
      delta = -prefix.length;
    } else {
      const oldLen = lines[lineIndex].length;
      lines[lineIndex] = lines[lineIndex].replace(/^(#+\s*|- |• |\[ \] |\[x\] |\d+\.\s*|> )/, '');
      const removedPrefixLen = oldLen - lines[lineIndex].length;
      lines[lineIndex] = prefix + lines[lineIndex];
      delta = prefix.length - removedPrefixLen;
    }

    const newText = lines.join('\n');
    handleChange(newText);

    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        const newPos = Math.max(0, start + delta);
        el.setSelectionRange(newPos, newPos);
      }
    });
  };

  /**
   * Applies bold formatting (**text**) to selected text or inserts cursor between asterisks.
   */
  const handleBold = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    let newText = '';
    let newStart = start;
    let newEnd = end;

    if (start !== end) {
      const selected = text.substring(start, end);
      newText = text.substring(0, start) + `**${selected}**` + text.substring(end);
      newStart = start;
      newEnd = end + 4;
    } else {
      newText = text.substring(0, start) + '****' + text.substring(start);
      newStart = newEnd = start + 2;
    }

    handleChange(newText);
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newStart, newEnd);
      }
    });
  };

  /**
   * Applies italic formatting (*text*) to selected text or inserts cursor between asterisks.
   */
  const handleItalic = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    let newText = '';
    let newStart = start;
    let newEnd = end;

    if (start !== end) {
      const selected = text.substring(start, end);
      newText = text.substring(0, start) + `*${selected}*` + text.substring(end);
      newStart = start;
      newEnd = end + 2;
    } else {
      newText = text.substring(0, start) + '**' + text.substring(start);
      newStart = newEnd = start + 1;
    }

    handleChange(newText);
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newStart, newEnd);
      }
    });
  };

  /**
   * Accepts the active ghost suggestion.
   */
  const acceptSuggestion = () => {
    if (!suggestion || !textareaRef.current) return false;
    const el = textareaRef.current;
    const { endPos, suffix } = suggestion;

    const newText = text.substring(0, endPos) + suffix + text.substring(endPos);
    const newCursorPos = endPos + suffix.length;

    if (suggestion.fullWord) {
      recordRecentWord(suggestion.fullWord);
    }

    handleChange(newText);
    setSuggestion(null);

    requestAnimationFrame(() => {
      if (el) {
        el.selectionStart = el.selectionEnd = newCursorPos;
      }
    });
    return true;
  };

  /**
   * Handles special keys in the textarea.
   */
  const handleKeyDown = (e) => {
    // 1. Ghost Autocomplete Acceptance via Tab
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      acceptSuggestion();
      return;
    }

    // 2. Ghost Autocomplete Acceptance via ArrowRight at word end
    if (e.key === 'ArrowRight' && suggestion) {
      const el = textareaRef.current;
      if (el && el.selectionStart === suggestion.endPos && el.selectionEnd === suggestion.endPos) {
        e.preventDefault();
        acceptSuggestion();
        return;
      }
    }

    // 3. Dismiss suggestion via Escape
    if (e.key === 'Escape' && suggestion) {
      e.preventDefault();
      setSuggestion(null);
      return;
    }

    // 4. Enter key: continue lists, numbered lists, and checkboxes
    if (e.key === 'Enter') {
      setSuggestion(null);
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart;
      const beforeCursor = text.substring(0, start);
      const lastLine = beforeCursor.split('\n').pop() || '';

      // Auto-continue bullet list prefixes
      let prefix = '';
      if (lastLine.match(/^(\s*)(- |• )/)) {
        prefix = lastLine.match(/^(\s*)(- |• )/)[0];
        if (lastLine.trim() === '-' || lastLine.trim() === '•') {
          e.preventDefault();
          const lineStart = beforeCursor.lastIndexOf('\n') + 1;
          const newText = text.substring(0, lineStart) + '\n' + text.substring(start);
          handleChange(newText);
          return;
        }
      } else if (lastLine.match(/^(\s*)(\d+)\.\s+/)) {
        const numMatch = lastLine.match(/^(\s*)(\d+)\.\s+/);
        const nextNum = parseInt(numMatch[2], 10) + 1;
        prefix = `${numMatch[1]}${nextNum}. `;
        if (lastLine.trim() === `${numMatch[2]}.`) {
          e.preventDefault();
          const lineStart = beforeCursor.lastIndexOf('\n') + 1;
          const newText = text.substring(0, lineStart) + '\n' + text.substring(start);
          handleChange(newText);
          return;
        }
      } else if (lastLine.match(/^(\s*)(\[ \] |\[x\] )/)) {
        prefix = lastLine.match(/^(\s*)/)[0] + '[ ] ';
        if (lastLine.trim() === '[ ]' || lastLine.trim() === '[x]') {
          e.preventDefault();
          const lineStart = beforeCursor.lastIndexOf('\n') + 1;
          const newText = text.substring(0, lineStart) + '\n' + text.substring(start);
          handleChange(newText);
          return;
        }
      }

      if (prefix) {
        e.preventDefault();
        const newText = text.substring(0, start) + '\n' + prefix + text.substring(start);
        handleChange(newText);

        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 1 + prefix.length;
        });
      }
    }
  };

  /**
   * Renders rich text content with Markdown headings, inline KaTeX, checkboxes, and lists.
   */
  const renderRichContent = (rawText) => {
    if (!rawText || !rawText.trim()) {
      return <span className="text-zinc-400 font-normal italic text-sm">Click to write notes...</span>;
    }

    const lines = rawText.split('\n');

    return lines.map((line, lineIdx) => {
      // Heading 1: # Title
      const h1Match = line.match(/^#\s+(.*)$/);
      if (h1Match) {
        return (
          <h2 key={lineIdx} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 py-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
            {renderInlineKatex(h1Match[1])}
          </h2>
        );
      }

      // Heading 2: ## Subtitle
      const h2Match = line.match(/^##\s+(.*)$/);
      if (h2Match) {
        return (
          <h3 key={lineIdx} className="text-base font-semibold text-zinc-800 dark:text-zinc-200 py-0.5">
            {renderInlineKatex(h2Match[1])}
          </h3>
        );
      }

      // Heading 3: ### Section
      const h3Match = line.match(/^###\s+(.*)$/);
      if (h3Match) {
        return (
          <h4 key={lineIdx} className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 py-0.5">
            {renderInlineKatex(h3Match[1])}
          </h4>
        );
      }

      // Blockquote: > text
      const quoteMatch = line.match(/^>\s+(.*)$/);
      if (quoteMatch) {
        return (
          <div key={lineIdx} className="pl-3 py-0.5 my-1 border-l-2 border-blue-500 text-zinc-600 dark:text-zinc-300 italic text-xs">
            {renderInlineKatex(quoteMatch[1])}
          </div>
        );
      }

      // Checkbox lines: [ ] or [x]
      const uncheckedMatch = line.match(/^\[ \] (.*)$/);
      if (uncheckedMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 py-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newLines = [...lines];
                newLines[lineIdx] = `[x] ${uncheckedMatch[1]}`;
                handleChange(newLines.join('\n'));
              }}
              className="mt-0.5 w-4 h-4 rounded border-2 border-zinc-300 dark:border-zinc-600 hover:border-blue-500 transition-colors flex-shrink-0 cursor-pointer"
            />
            <span className="text-zinc-800 dark:text-zinc-200 text-xs">{renderInlineKatex(uncheckedMatch[1])}</span>
          </div>
        );
      }

      const checkedMatch = line.match(/^\[x\] (.*)$/);
      if (checkedMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 py-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newLines = [...lines];
                newLines[lineIdx] = `[ ] ${checkedMatch[1]}`;
                handleChange(newLines.join('\n'));
              }}
              className="mt-0.5 w-4 h-4 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              <FiCheck className="w-3 h-3 text-white" />
            </button>
            <span className="text-zinc-400 dark:text-zinc-500 line-through text-xs">{renderInlineKatex(checkedMatch[1])}</span>
          </div>
        );
      }

      // Numbered list: 1. Item
      const numListMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numListMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 py-0.5 pl-1 text-xs">
            <span className="font-mono text-blue-500 font-semibold flex-shrink-0">{numListMatch[1]}.</span>
            <span className="text-zinc-800 dark:text-zinc-200">{renderInlineKatex(numListMatch[2])}</span>
          </div>
        );
      }

      // Bullet list lines
      const bulletMatch = line.match(/^(- |• )(.*)$/);
      if (bulletMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 py-0.5 pl-1 text-xs">
            <span className="text-blue-500 font-bold mt-px flex-shrink-0">•</span>
            <span className="text-zinc-800 dark:text-zinc-200">{renderInlineKatex(bulletMatch[2])}</span>
          </div>
        );
      }

      // Regular text line
      return (
        <div key={lineIdx} className="py-0.5 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {line ? renderInlineKatex(line) : <br />}
        </div>
      );
    });
  };

  /**
   * Renders inline KaTeX math between $ delimiters and block math $$ delimiters.
   */
  const renderInlineKatex = (textStr) => {
    if (!textStr) return null;

    // First handle block math ($$...$$)
    return textStr.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/).map((part, i) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const mathExpr = part.slice(2, -2);
        try {
          return <BlockMath key={i} math={mathExpr} renderError={() => <span className="font-mono text-xs text-blue-500">{mathExpr}</span>} />;
        } catch (e) {
          return <span key={i} className="font-mono text-xs text-blue-500">{mathExpr}</span>;
        }
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathExpr = part.slice(1, -1);
        try {
          return (
            <InlineMath
              key={i}
              math={mathExpr}
              renderError={() => <span className="font-mono text-xs text-blue-500">{mathExpr}</span>}
            />
          );
        } catch (e) {
          return <span key={i} className="font-mono text-xs text-blue-500">{mathExpr}</span>;
        }
      }
      // Bold (**text**) & Italic (*text*)
      return part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={`${i}-${j}`} className="font-bold text-zinc-900 dark:text-zinc-100">{seg.slice(2, -2)}</strong>;
        }
        if (seg.startsWith('*') && seg.endsWith('*')) {
          return <em key={`${i}-${j}`} className="italic">{seg.slice(1, -1)}</em>;
        }
        return <span key={`${i}-${j}`}>{seg}</span>;
      });
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-start">
      {isEditing ? (
        <div className="w-full h-full flex flex-col gap-1.5 animate-in fade-in duration-100">
          {/* Mini Formatting Toolbar */}
          <div className="flex-shrink-0 flex items-center gap-1 pb-1 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertLinePrefix('# ')}
              title="Heading 1 (# )"
              className="p-1.5 text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <FiHash className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertLinePrefix('- ')}
              title="Bullet List (- )"
              className="p-1.5 text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <FiList className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertLinePrefix('[ ] ')}
              title="Checkbox Task ([ ] )"
              className="p-1.5 text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <FiCheckSquare className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleBold}
              title="Bold Text (**text**)"
              className="p-1.5 text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors font-bold"
            >
              <FiBold className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleItalic}
              title="Italic Text (*text*)"
              className="p-1.5 text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors italic"
            >
              <FiItalic className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex-1 w-full rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-inner overflow-y-auto">
            {/* Ghost Autocomplete Overlay Layer */}
            {suggestion && (
              <div
                className="absolute inset-0 p-2.5 text-xs font-sans font-normal text-transparent pointer-events-none select-none overflow-hidden whitespace-pre-wrap break-words leading-relaxed"
                aria-hidden="true"
              >
                <span>{text.substring(0, suggestion.endPos)}</span>
                <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                  {suggestion.suffix}
                  <span className="inline-flex items-center ml-1 px-1 py-0 text-[9px] font-sans font-semibold rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400 select-none shadow-xs align-middle">
                    Tab
                  </span>
                </span>
                <span>{text.substring(suggestion.endPos)}</span>
              </div>
            )}

            {/* Editable Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                handleChange(e.target.value, e.target.selectionStart);
              }}
              onFocus={() => {
                resetSequenceContext();
              }}
              onClick={(e) => {
                updateSuggestion(text, e.target.selectionStart);
              }}
              onKeyUp={(e) => {
                updateSuggestion(text, e.target.selectionStart);
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setSuggestion(null);
                if (text.trim()) {
                  resetSequenceContext();
                  const words = text.match(/[a-zA-Z]{2,}/g) || [];
                  for (let i = 0; i < words.length; i++) {
                    recordRecentWord(words[i]);
                  }
                }
              }}
              autoFocus
              placeholder="Start typing notes... (use # for title, - for bullets, [ ] for tasks, $...$ for math)"
              className="relative z-10 w-full h-full p-2.5 bg-transparent text-xs font-sans font-normal text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none leading-relaxed whitespace-pre-wrap break-words"
              style={{ minHeight: '80px' }}
            />
          </div>
          <div className="flex-shrink-0 text-[10px] text-zinc-400 px-0.5">
            <span>
              Markdown: <code className="text-zinc-500"># heading</code> · <code className="text-zinc-500">- list</code> · <code className="text-zinc-500">[ ] task</code> · <code className="text-zinc-500">$math$</code>
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="group relative w-full h-full p-3 rounded-xl bg-transparent hover:bg-zinc-100/40 dark:hover:bg-zinc-800/30 border border-transparent hover:border-zinc-200/80 dark:hover:border-zinc-800/80 cursor-text transition-all overflow-y-auto"
        >
          <div className="space-y-1">
            {renderRichContent(text)}
          </div>

          <FiEdit2 className="absolute top-2 right-2 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-500 transition-opacity" />
        </div>
      )}
    </div>
  );
}
