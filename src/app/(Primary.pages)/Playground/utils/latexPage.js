import { displayMath, escapeTex, slugFile } from '../../../utils/latexExport';
import { tableToTex } from '../../../utils/tableCore';

/**
 * A Playground page as a .tex file (NETZ Pro): equation blocks become display maths, text (theory)
 * blocks keep their inline $…$ maths, graphs list the equations they plot, tables are LaTeX tables
 * and pictures their caption. Blocks are read top to bottom, then left to right. With `inkImage`
 * (a file name inside the .zip) the page's handwriting and drawings come in as one picture.
 */

/** Text with $…$ / $$…$$ maths: the text is escaped, the maths is kept. */
export function mixedTextToTex(text) {
  const out = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let m;
  const src = String(text || '');
  while ((m = re.exec(src))) {
    out.push(escapeTex(src.slice(last, m.index)));
    out.push(m[1] !== undefined ? `\n\\[\n${m[1].trim()}\n\\]\n` : `$${m[2].trim()}$`);
    last = re.lastIndex;
  }
  out.push(escapeTex(src.slice(last)));
  return out.join('').replace(/\n{3,}/g, '\n\n').trim();
}

const reading = (a, b) => {
  const ay = a.position?.y ?? 0;
  const by = b.position?.y ?? 0;
  // Blocks within 40 px of each other count as one row
  if (Math.abs(ay - by) > 40) return ay - by;
  return (a.position?.x ?? 0) - (b.position?.x ?? 0);
};

export function pageToTex({ title, blocks = [], strokeCount = 0, inkImage = null }) {
  const parts = [];
  [...blocks].sort(reading).forEach((b) => {
    const c = b.content || {};
    if (b.type === 'equation' && String(c.latex || '').trim()) parts.push(displayMath(c.latex));
    else if (b.type === 'theory' && String(c.text || '').trim()) parts.push(mixedTextToTex(c.text));
    else if (b.type === 'graph') {
      const curves = (c.graphData?.datasets || []).map((d) => d.latex || d.label).filter(Boolean);
      if (curves.length) parts.push(`Graph of ${curves.map((l) => `$${l}$`).join(', ')}.`);
    } else if (b.type === 'table' && c.table?.rows?.length) {
      parts.push(tableToTex(c.table));
    } else if ((b.type === 'image' || b.type === 'sketch') && String(c.caption || '').trim()) {
      parts.push(`\\emph{Figure: ${escapeTex(c.caption)}}`);
    }
  });
  if (inkImage) {
    parts.push([
      '\\begin{figure}[h]',
      '\\centering',
      `\\includegraphics[width=\\linewidth,height=0.8\\textheight,keepaspectratio]{${inkImage}}`,
      '\\caption*{Handwriting and drawings on this page}',
      '\\end{figure}',
    ].join('\n'));
  }
  if (!parts.length) parts.push('This page has no typed maths or text yet. Convert handwriting to blocks first, then export again.');
  const note = strokeCount && !inkImage ?`% This page also has ${strokeCount} handwritten stroke${strokeCount === 1 ? '' : 's'}; export PNG, SVG or PDF to keep them.\n` : '';
  const usesChem = parts.some((p) => /\\ce\{/.test(p));
  const tex = [
    '% Made with NETZ (netz-ruby.vercel.app)',
    note.trimEnd(),
    '\\documentclass[11pt]{article}',
    '\\usepackage[margin=2.2cm]{geometry}',
    '\\usepackage{amsmath,amssymb}',
    ...(usesChem ? ['\\usepackage[version=4]{mhchem}'] : []),
    ...(parts.some((p) => p.includes('\\toprule')) ? ['\\usepackage{booktabs}'] : []),
    ...(inkImage ? ['\\usepackage{graphicx}', '\\usepackage{caption}'] : []),
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\parskip}{8pt}',
    '\\begin{document}',
    '',
    `\\section*{${escapeTex(title || 'Playground page')}}`,
    '',
    parts.join('\n\n'),
    '',
    '\\end{document}',
    '',
  ].filter((l, i) => !(i === 1 && !l)).join('\n');
  return { tex, filename: `netz-${slugFile(title, 'page')}.tex` };
}
