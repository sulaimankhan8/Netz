'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { FiCornerDownLeft } from 'react-icons/fi';
import { LuLineChart } from 'react-icons/lu';
import { scopeManager } from '../../utils/scopeManager';
import KatexView from '../equation/KatexView';
import MathEditor from '../equation/MathEditor';
import EquationRibbon from '../equation/EquationRibbon';
import { usesChemistry } from '../../utils/equations/commonEquations';
import { TOUCH_TARGET } from '../ui/Dialog';

/**
 * An equation. At rest: the formula alone, centred, drawn by KaTeX (cached per formula). Its
 * actions (Edit, Plot) are in the block's bar, so nothing sits on top of the maths.
 * While editing: the Equation Tools ribbon, the visual editor (MathLive, loaded on first use) or
 * the LaTeX field, and a live preview with Plot.
 *
 * Memoized: panning and zooming the page do not draw it again.
 */
function EquationBlock({ block, onUpdateContent, onPlotGraph, isEditing: propIsEditing, setIsEditing: propSetIsEditing }) {
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

  if (!isEditing) {
    const empty = !latex || !latex.trim();
    return (
      <div className="w-full h-full flex items-center justify-center px-5 py-4 select-none">
        {empty ? (
          <span className="text-pg-label text-pg-text2">Empty equation. Double-click to write it.</span>
        ) : (
          <div className="max-w-full overflow-x-auto overflow-y-hidden text-[17px] leading-normal text-pg-ink [scrollbar-width:thin]">
            <KatexView latex={latex} display={display} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2.5 min-w-0">
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
            className="w-full h-11 px-3 pr-9 rounded-xl bg-pg-paper border border-pg-line font-mono text-pg-label text-pg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-accent focus:border-pg-accent"
          />
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            title="Press Enter to finish editing"
            aria-label="Finish editing"
            className={`absolute right-1 w-8 h-8 ${TOUCH_TARGET} flex items-center justify-center rounded-lg text-pg-text2 hover:text-pg-ink hover:bg-pg-tray`}
          >
            <FiCornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      )}
      {visualFailed && <div className="text-pg-cap text-pg-text2">The visual editor could not load here, so the equation is edited as LaTeX.</div>}

      {/* How it will look, and Plot */}
      <div className="flex items-center justify-between gap-3 pl-3.5 pr-1.5 py-1.5 rounded-xl bg-pg-eq-tint/60 min-h-[48px]">
        <div className="min-w-0 overflow-x-auto overflow-y-hidden text-pg-body text-pg-ink">
          {latex && latex.trim() ? <KatexView latex={latex} display={false} /> : <span className="text-pg-label text-pg-text2">The equation shows here as you type.</span>}
        </div>
        {onPlotGraph && (
          <button
            type="button"
            onClick={() => onPlotGraph(block, latex)}
            className={`shrink-0 h-9 ${TOUCH_TARGET} px-3 flex items-center gap-1.5 rounded-[10px] bg-pg-surface text-pg-eq text-pg-label font-semibold border border-pg-eq/30 hover:bg-pg-eq hover:text-pg-surface transition-colors`}
          >
            <LuLineChart className="w-4 h-4" aria-hidden="true" />
            Plot Graph
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(EquationBlock);
