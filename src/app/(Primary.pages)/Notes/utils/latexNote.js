import { ALGORITHMS_CATALOG } from './algorithmRegistry';
import { displayMath, escapeTex, slugFile } from '../../../utils/latexExport';

/**
 * A note as a .tex file (NETZ Pro). Headings, text, callouts, formulas and quizzes are written from
 * the note itself; a solver block is solved again with the same engine the note shows, so its
 * answer and steps table are in the file. Sketches are images and stay out (the PDF keeps them).
 */

const cell = (v) => escapeTex(String(v ?? ''));

function solverTex(block) {
  const cfg = block.widgetConfig || {};
  const alg = ALGORITHMS_CATALOG.find((a) => a.id === cfg.algorithmId);
  const name = escapeTex(block.content || alg?.name || 'Solver');
  if (!alg) return `\\subsubsection*{${name}}\n`;
  const params = { ...alg.defaultParams, ...(cfg.params || {}) };
  const inputs = Object.entries(params).map(([k, v]) => `${escapeTex(k)} = ${cell(v)}`).join(', ');
  let out;
  try {
    out = alg.solve(params);
  } catch {
    return `\\subsubsection*{${name}}\nInputs: ${inputs}.\n\nThese inputs do not solve; open the note in NETZ to check them.\n`;
  }
  const lines = [`\\subsubsection*{${name}}`, `Inputs: ${inputs}.`, '', `\\textbf{${cell(out.result)}}`];
  const headers = out.headers || [];
  const rows = (out.steps || []).map((s) => Object.values(s));
  if (headers.length && rows.length) {
    const width = Math.max(headers.length, ...rows.map((r) => r.length));
    lines.push(
      '',
      `\\begin{longtable}{${'l'.repeat(width)}}`,
      '\\toprule',
      `${headers.map((h) => `\\textbf{${cell(h)}}`).join(' & ')} \\\\`,
      '\\midrule',
      '\\endhead',
      ...rows.slice(0, 200).map((r) => `${r.map(cell).join(' & ')} \\\\`),
      '\\bottomrule',
      '\\end{longtable}',
    );
  }
  return lines.join('\n');
}

function quizTex(block) {
  const q = block.quizConfig || {};
  const lines = [`\\paragraph{${escapeTex(block.content || 'Quiz')}} ${escapeTex(q.question || '')}`];
  if (q.mode === 'mcq' && Array.isArray(q.options) && q.options.length) {
    lines.push('\\begin{enumerate}', ...q.options.map((o) => `  \\item ${escapeTex(o)}`), '\\end{enumerate}');
    if (Number.isInteger(q.correctOptionIndex) && q.options[q.correctOptionIndex] !== undefined) {
      lines.push(`\\emph{Answer:} ${escapeTex(q.options[q.correctOptionIndex])}.`);
    }
  } else if (q.correctNumericValue !== undefined) {
    lines.push(`\\emph{Answer:} ${cell(q.correctNumericValue)}${q.tolerance ? ` (within ${cell(q.tolerance)})` : ''}.`);
  }
  if (q.explanation) lines.push('', escapeTex(q.explanation));
  return lines.join('\n');
}

export function noteToTex(note) {
  const blocks = note?.blocks || [];
  const usesChem = blocks.some((b) => b.type === 'math' && /\\ce\{/.test(b.content || ''));
  const body = blocks
    .map((b) => {
      const text = b.content || '';
      switch (b.type) {
        case 'heading1':
          return `\\section*{${escapeTex(text)}}`;
        case 'heading2':
          return `\\subsection*{${escapeTex(text)}}`;
        case 'heading3':
          return `\\subsubsection*{${escapeTex(text)}}`;
        case 'paragraph':
          return text.trim() ? escapeTex(text).replace(/\n{2,}/g, '\n\n').replace(/\n/g, '\\\\\n') : '';
        case 'math':
          return displayMath(text);
        case 'callout':
          return text.trim() ? `\\begin{quote}\n\\textbf{Note.} ${escapeTex(text)}\n\\end{quote}` : '';
        case 'widget':
          return solverTex(b);
        case 'quiz':
          return quizTex(b);
        case 'ink':
          return '% A sketch was here. Sketches are pictures: export the note as PDF to keep them.';
        default:
          return text.trim() ? escapeTex(text) : '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  const tags = (note?.tags || []).length ? `\\textit{${escapeTex(note.tags.join(' · '))}}\n\n` : '';
  const tex = [
    '% Made with NETZ (netz-ruby.vercel.app)',
    '\\documentclass[11pt]{article}',
    '\\usepackage[margin=2.2cm]{geometry}',
    '\\usepackage{amsmath,amssymb}',
    ...(usesChem ? ['\\usepackage[version=4]{mhchem}'] : []),
    '\\usepackage{booktabs,longtable}',
    '\\usepackage[hidelinks]{hyperref}',
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\parskip}{6pt}',
    `\\title{${escapeTex(note?.title || 'Untitled note')}}`,
    `\\author{}`,
    '\\date{}',
    '\\begin{document}',
    '\\maketitle',
    '',
    note?.subtitle ? `\\begin{center}\\large ${escapeTex(note.subtitle)}\\end{center}\n` : '',
    tags + body,
    '',
    '\\end{document}',
    '',
  ].join('\n');
  return { tex, filename: `${slugFile(note?.title, 'note')}.tex` };
}
