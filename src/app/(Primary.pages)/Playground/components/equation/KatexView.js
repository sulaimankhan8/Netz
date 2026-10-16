'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/contrib/mhchem';
import 'katex/dist/katex.min.css';
import { showPlaceholders } from '../../utils/equations/latexNormalize';

/**
 * LaTeX drawn with KaTeX (chemistry through mhchem). Invalid LaTeX shows the source instead, or
 * the error when `showError` is set. Symbols outside KaTeX's own tables still draw (strict off).
 * Boxes left empty in the editor show as empty squares.
 */
export function renderLatex(latex, displayMode = false) {
  try {
    return { html: katex.renderToString(showPlaceholders(latex), { displayMode, throwOnError: true, strict: 'ignore', trust: false }), error: null };
  } catch (err) {
    return { html: null, error: String(err.message || err).replace(/^KaTeX parse error: /, '') };
  }
}

export default function KatexView({ latex, display = false, showError = false, className = '' }) {
  const result = useMemo(() => renderLatex(latex, display), [latex, display]);
  if (result.html) return <span className={className} dangerouslySetInnerHTML={{ __html: result.html }} />;
  if (showError) return <span className={`text-rose-600 text-xs ${className}`}>{result.error}</span>;
  return <span className={`font-mono text-xs ${className}`}>{latex}</span>;
}
