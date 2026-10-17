'use client';

import React, { useState } from 'react';
import { Dialog } from '../symbols/SymbolDialog';
import KatexView, { renderLatex } from './KatexView';

const EXAMPLES = [
  { label: 'Fraction', latex: '\\frac{a}{b}' },
  { label: 'Power and index', latex: 'x^{2}+y_{1}' },
  { label: 'Root', latex: '\\sqrt[3]{x}' },
  { label: 'Sum', latex: '\\sum_{i=1}^{n} i^2' },
  { label: 'Integral', latex: '\\int_{0}^{\\infty} e^{-x}\\,dx' },
  { label: 'Matrix', latex: '\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}' },
  { label: 'Chemistry', latex: '\\ce{2H2 + O2 -> 2H2O}' },
];

/**
 * Insert > Equation > Insert LaTeX, as in WPS Office: type LaTeX, see it drawn as you type,
 * and a clear message when it is not valid. Insert adds it as an equation block.
 */
export default function InsertLatexDialog({ isMobile, initial = '', onInsert, onClose }) {
  const [latex, setLatex] = useState(initial);
  const result = renderLatex(latex, true);
  const valid = latex.trim() && result.html;

  const footer = (
    <>
      <button type="button" onClick={onClose} className="px-4 h-9 rounded-lg border border-pg-line hover:bg-pg-tray">
        Cancel
      </button>
      <button
        type="button"
        disabled={!valid}
        onClick={() => {
          onInsert(latex.trim());
          onClose();
        }}
        className="px-4 h-9 rounded-lg bg-pg-accent-fill text-white font-semibold hover:bg-pg-accent-fill/90 disabled:opacity-40"
      >
        Insert
      </button>
    </>
  );

  return (
    <Dialog title="Insert LaTeX" isMobile={isMobile} onClose={onClose} footer={footer}>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">LaTeX</span>
        <textarea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          autoFocus
          rows={4}
          spellCheck={false}
          aria-label="LaTeX"
          placeholder="\frac{-b \pm \sqrt{b^2-4ac}}{2a}"
          className="w-full p-3 rounded-lg bg-pg-tray border border-pg-line font-mono text-sm"
        />
      </label>
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Preview</span>
        <div className="min-h-[72px] p-3 rounded-lg border border-pg-line overflow-x-auto text-pg-ink text-base" data-latex-preview>
          {!latex.trim() && <span className="text-pg-text2 text-xs">The equation appears here as you type.</span>}
          {latex.trim() && result.html && <KatexView latex={latex} display />}
          {latex.trim() && !result.html && <span className="text-pg-danger text-xs" data-latex-error>This is not valid LaTeX yet: {result.error}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Examples</span>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" onClick={() => setLatex(ex.latex)} title={ex.latex} className="h-9 px-3 rounded-lg border border-pg-line hover:bg-pg-tray">
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
