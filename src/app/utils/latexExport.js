/**
 * LaTeX export (a Pro feature) for solver pages, notes and Playground pages. Everything here builds a
 * plain .tex string that compiles with pdflatex and only common packages (amsmath, amssymb, booktabs,
 * longtable, graphicx not needed). Maths shown with KaTeX keeps its TeX source; other text is escaped.
 */

const TEX_SPECIAL = { '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', $: '\\$', '&': '\\&', '#': '\\#', '^': '\\^{}', _: '\\_', '%': '\\%', '~': '\\textasciitilde{}' };

// Unicode that pdflatex cannot print by itself, written as LaTeX
const UNICODE = {
  '−': '-', '–': '--', '—': '---', '‘': '`', '’': "'", '“': '``', '”': "''", '…': '\\ldots{}', '×': '$\\times$', '÷': '$\\div$',
  '≈': '$\\approx$', '≤': '$\\le$', '≥': '$\\ge$', '≠': '$\\ne$', '±': '$\\pm$', '∞': '$\\infty$', '√': '$\\surd$', '·': '$\\cdot$',
  'α': '$\\alpha$', 'β': '$\\beta$', 'γ': '$\\gamma$', 'δ': '$\\delta$', 'Δ': '$\\Delta$', 'ε': '$\\varepsilon$', 'θ': '$\\theta$',
  'λ': '$\\lambda$', 'μ': '$\\mu$', 'π': '$\\pi$', 'σ': '$\\sigma$', 'Σ': '$\\Sigma$', 'χ': '$\\chi$', 'ω': '$\\omega$', '∫': '$\\int$',
  '′': "$'$", '″': "$''$", '→': '$\\to$', '←': '$\\leftarrow$', '✓': '$\\checkmark$', '°': '$^\\circ$', '½': '$\\frac12$',
  '⁰': '$^0$', '¹': '$^1$', '²': '$^2$', '³': '$^3$', '⁴': '$^4$', '⁵': '$^5$', '⁶': '$^6$', '⁷': '$^7$', '⁸': '$^8$', '⁹': '$^9$',
  '₀': '$_0$', '₁': '$_1$', '₂': '$_2$', '₃': '$_3$', '₄': '$_4$', '₅': '$_5$', '₆': '$_6$', '₇': '$_7$', '₈': '$_8$', '₉': '$_9$', 'ₙ': '$_n$',
};

/** Plain text → LaTeX text. */
export function escapeTex(text) {
  // Accented Latin letters print as they are (pdflatex reads UTF-8); other symbols it cannot print are dropped
  return String(text ?? '')
    .replace(/[\\{}$&#^_%~]/g, (c) => TEX_SPECIAL[c])
    .replace(/[^\x00-\x7F]/g, (c) => UNICODE[c] ?? (/[À-ÿ]/.test(c) ? c : ''));
}

/** A block of maths for display (\[ … \]). */
export const displayMath = (tex) => (String(tex || '').trim() ? `\\[\n${String(tex).trim()}\n\\]` : '');

/**
 * Text of an element as LaTeX: KaTeX maths keeps its TeX source ($…$), the rest is escaped.
 * Works on live DOM nodes (browser only).
 */
export function nodeToTex(node) {
  if (!node) return '';
  if (node.nodeType === 3) return escapeTex(node.textContent.replace(/\s+/g, ' '));
  if (node.nodeType !== 1) return '';
  const el = node;
  if (el.classList?.contains('katex-display') || el.classList?.contains('katex')) {
    const tex = el.querySelector('annotation[encoding="application/x-tex"]')?.textContent;
    if (tex) return el.classList.contains('katex-display') ? ` $\\displaystyle ${tex.trim()}$ ` : `$${tex.trim()}$`;
  }
  if (el.getAttribute?.('aria-hidden') === 'true' || ['SCRIPT', 'STYLE', 'SVG', 'svg', 'BUTTON', 'CANVAS', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return '';
  if (el.tagName === 'BR') return ' ';
  return Array.from(el.childNodes).map(nodeToTex).join('');
}

const tidy = (s) => s.replace(/\s+/g, ' ').trim();

/** An HTML <table> as a longtable (header rows in bold, rule under them). */
export function tableToTex(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (!rows.length) return '';
  const cellsOf = (tr) => Array.from(tr.children).filter((c) => c.tagName === 'TD' || c.tagName === 'TH');
  const width = Math.max(...rows.map((tr) => cellsOf(tr).reduce((n, c) => n + (Number(c.getAttribute('colspan')) || 1), 0)));
  if (!width) return '';
  const head = [];
  const body = [];
  rows.forEach((tr) => {
    const cells = cellsOf(tr);
    const isHead = tr.closest('thead') || cells.every((c) => c.tagName === 'TH');
    const line = cells.map((c) => {
      const span = Number(c.getAttribute('colspan')) || 1;
      const text = tidy(nodeToTex(c));
      const content = isHead ? `\\textbf{${text}}` : text;
      return span > 1 ? `\\multicolumn{${span}}{l}{${content}}` : content;
    });
    const filled = cells.reduce((n, c) => n + (Number(c.getAttribute('colspan')) || 1), 0);
    for (let i = filled; i < width; i++) line.push('');
    (isHead && !body.length ? head : body).push(`${line.join(' & ')} \\\\`);
  });
  return [
    `\\begin{longtable}{${'l'.repeat(width)}}`,
    '\\toprule',
    ...(head.length ? [...head, '\\midrule', '\\endhead'] : []),
    ...body,
    '\\bottomrule',
    '\\end{longtable}',
  ].join('\n');
}

/** A whole .tex document around a body. */
export function texDocument({ title, subtitle = '', body }) {
  return [
    '% Made with NETZ (netz-ruby.vercel.app)',
    '\\documentclass[11pt]{article}',
    '\\usepackage[margin=2.2cm]{geometry}',
    '\\usepackage{amsmath,amssymb}',
    '\\usepackage{booktabs,longtable}',
    '\\usepackage[hidelinks]{hyperref}',
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\parskip}{6pt}',
    '\\begin{document}',
    '',
    `\\section*{${escapeTex(title)}}`,
    subtitle ? `${escapeTex(subtitle)}\n` : '',
    body.trim(),
    '',
    '\\end{document}',
    '',
  ].join('\n');
}

/** Starts a download of a text file in the browser. */
export function downloadText(text, filename, type = 'text/plain') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A file name from a title: "Newton-Raphson method" → "newton-raphson-method". */
export const slugFile = (title, fallback = 'netz') =>
  String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || fallback;

/**
 * A solver page's Solve panel as LaTeX: the inputs, then each result table and the main result lines.
 * root: the #am-solve element. inputs: [[label, value]] already written for LaTeX.
 */
export function solverPanelToTex({ title, inputs = [], root }) {
  const parts = [];
  if (inputs.length) {
    parts.push(['\\subsection*{Inputs}', '\\begin{itemize}', ...inputs.map(([k, v]) => `  \\item ${k}: ${v}`), '\\end{itemize}'].join('\n'));
  }
  const tables = root ? Array.from(root.querySelectorAll('table')).filter((t) => !t.closest('[hidden]')) : [];
  const answers = root ? Array.from(root.querySelectorAll('[data-answer], .katex-display')).filter((el) => !el.closest('table') && !el.closest('[hidden]')) : [];
  if (answers.length) {
    parts.push('\\subsection*{Result}');
    answers.slice(0, 12).forEach((el) => {
      const tex = el.classList.contains('katex-display') ? el.querySelector('annotation[encoding="application/x-tex"]')?.textContent : null;
      parts.push(tex ? displayMath(tex) : `${tidy(nodeToTex(el))}\n`);
    });
  }
  tables.slice(0, 8).forEach((t, i) => {
    parts.push(`\\subsection*{${tables.length > 1 ? `Table ${i + 1}` : 'Table'}}`, tableToTex(t));
  });
  if (!tables.length && !answers.length) parts.push('Run the calculator first: there is nothing to export yet.');
  return texDocument({ title, subtitle: `Solved with NETZ on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, body: parts.join('\n\n') });
}
