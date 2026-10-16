'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiBarChart2, FiCornerDownLeft } from 'react-icons/fi';
import { scopeManager } from '../../utils/scopeManager';
import KatexView from '../equation/KatexView';
import MathEditor from '../equation/MathEditor';
import EquationRibbon from '../equation/EquationRibbon';
import { usesChemistry } from '../../utils/equations/commonEquations';

/** The equation as shown: KaTeX, full-size (display style) when the block asks for it. */
function EquationView({ latex, display }) {
  if (!latex || !latex.trim()) return <span className="text-zinc-400 italic text-sm">Empty equation</span>;
  return <KatexView latex={latex} display={display} />;
}

export default function EquationBlock({
  block,
  onUpdateContent,
  onPlotGraph,
  isEditing: propIsEditing,
  setIsEditing: propSetIsEditing,
  isSelected = false,
}) {
  const [latex, setLatex] = useState(block.content?.latex ?? '');
  const [localIsEditing, setLocalIsEditing] = useState(false);
  // Linear: the equation as LaTeX text. Chemistry (\ce{...}) cannot be edited visually, and the
  // text field stands in if the visual editor cannot load.
  const [linear, setLinear] = useState(() => usesChemistry(block.content?.latex));
  const [visualFailed, setVisualFailed] = useState(false);
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const display = Boolean(block.content?.display);

  const isEditing = propIsEditing !== undefined ? propIsEditing : localIsEditing;
  const setIsEditing = propSetIsEditing || setLocalIsEditing;
  const useText = linear || visualFailed;

  useEffect(() => {
    if (block.content?.latex !== undefined) {
      setLatex(block.content.latex);
    }
  }, [block.content?.latex]);

  const handleLatexChange = (newVal) => {
    setLatex(newVal);
    onUpdateContent(block.blockId, { latex: newVal });

    // Register variable definition in global CAS scope if present (e.g. a = 5)
    if (newVal.includes('=')) {
      const parts = newVal.split('=');
      const varName = parts[0].trim();
      const val = parseFloat(parts[1].trim());
      if (varName.match(/^[a-zA-Z]$/) && !isNaN(val)) {
        scopeManager.setSymbol(varName, val, block.blockId);
      }
    }
  };

  // A template or symbol from the ribbon: into the visual editor with its boxes, or into the
  // LaTeX text with the cursor where the first box was
  const insertFromRibbon = (template) => {
    if (!useText && editorRef.current && editorRef.current.insert(template)) return;
    const el = inputRef.current;
    const value = el ? el.value : latex;
    const start = el ? el.selectionStart ?? value.length : value.length;
    const end = el ? el.selectionEnd ?? value.length : value.length;
    const firstBox = template.indexOf('#?');
    const text = template.replace(/#\?/g, '');
    handleLatexChange(value.slice(0, start) + text + value.slice(end));
    const caret = start + (firstBox >= 0 ? firstBox : text.length);
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(caret, caret);
    });
  };

  // A common equation from the ribbon's Equation button goes in at the cursor. Chemistry (\ce)
  // cannot be edited visually, so the equation switches to its LaTeX first.
  const insertCommonEquation = (equationLatex) => {
    if (usesChemistry(equationLatex) && !useText) {
      const next = latex.trim() ? `${latex} ${equationLatex}` : equationLatex;
      setLinear(true);
      handleLatexChange(next);
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(next.length, next.length);
      });
      return;
    }
    insertFromRibbon(equationLatex);
  };

  return (
    <div className="relative group w-full h-full flex flex-col justify-center">
      {isEditing ? (
        <div className="space-y-2 animate-in fade-in duration-150 min-w-0">
          <EquationRibbon
            linear={useText}
            onToggleLinear={() => {
              if (!visualFailed) setLinear(!linear);
            }}
            onInsert={insertFromRibbon}
            onInsertEquation={insertCommonEquation}
          />

          {!useText && (
            <MathEditor
              ref={editorRef}
              value={latex}
              onChange={handleLatexChange}
              onDone={() => setIsEditing(false)}
              onFailed={() => setVisualFailed(true)}
            />
          )}

          {useText && (
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={latex}
                onChange={(e) => handleLatexChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditing(false);
                }}
                autoFocus
                data-latex-input
                placeholder="Type equation (e.g. y = x^2 - 4x + 3, \sin(x))..."
                className="w-full px-3 py-2 pr-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 shadow-inner"
              />
              <button
                onClick={() => setIsEditing(false)}
                title="Press Enter to finish editing"
                className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <FiCornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {visualFailed && <div className="text-[11px] text-amber-600">The visual editor could not load here, so the equation is edited as LaTeX.</div>}

          {/* Live KaTeX Rendered Preview Strip */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 min-h-[38px] overflow-x-auto">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              <EquationView latex={latex} display={false} />
            </div>

            {onPlotGraph && (
              <button
                onClick={() => onPlotGraph(block, latex)}
                className="flex items-center gap-1 py-1 px-2 text-[11px] font-semibold rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all cursor-pointer flex-shrink-0 ml-2"
              >
                <FiBarChart2 className="w-3.5 h-3.5" />
                <span>Plot Graph</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="group/eq relative px-3 py-2.5 rounded-xl bg-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 border border-transparent hover:border-zinc-200/80 dark:hover:border-zinc-800/80 transition-all flex items-center justify-between gap-3 select-none"
        >
          <div className="text-base text-zinc-900 dark:text-zinc-100 font-medium overflow-x-auto py-1">
            <EquationView latex={latex} display={display} />
          </div>

          {/* Action icons: visible on hover OR when block is selected */}
          <div className={`${isSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover/eq:opacity-100 group-hover/eq:pointer-events-auto'} flex items-center gap-1.5 transition-opacity flex-shrink-0`}>
            {onPlotGraph && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlotGraph(block, latex);
                }}
                title="Plot Graph"
                className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-500 hover:text-blue-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <FiBarChart2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Edit Equation"
              className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-500 hover:text-blue-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
