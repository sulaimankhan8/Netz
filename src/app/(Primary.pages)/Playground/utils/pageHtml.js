/**
 * A Playground page as one web page (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 2): the page
 * itself as a picture (ink as vectors, from pageSvg.js), then its typed text, maths and tables as
 * real text in reading order, so they can be searched and copied.
 */

import katex from 'katex';
import { tableToHtml } from '../../../utils/tableCore';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const math = (tex, display) => katex.renderToString(String(tex || ''), { throwOnError: false, displayMode: display });

/** Text with $…$ maths: the text escaped, the maths drawn. */
function mixed(text) {
  return String(text || '')
    .split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
    .map((part) => {
      if (/^\$\$[\s\S]+\$\$$/.test(part)) return math(part.slice(2, -2), true);
      if (/^\$[^$]+\$$/.test(part)) return math(part.slice(1, -1), false);
      return esc(part).replace(/\n/g, '<br>');
    })
    .join('');
}

const reading = (a, b) => {
  const ay = a.position?.y ?? 0;
  const by = b.position?.y ?? 0;
  if (Math.abs(ay - by) > 40) return ay - by;
  return (a.position?.x ?? 0) - (b.position?.x ?? 0);
};

export function pageToHtml({ title, svg, blocks = [] }) {
  const typed = [...blocks].sort(reading).map((b) => {
    const c = b.content || {};
    if (b.type === 'equation' && String(c.latex || '').trim()) return `<div class="math">${math(c.latex, true)}</div>`;
    if (b.type === 'theory' && String(c.text || '').trim()) return `<p>${mixed(c.text)}</p>`;
    if (b.type === 'table' && c.table?.rows?.length) return tableToHtml(c.table, (tex) => math(tex, false));
    if (b.type === 'graph') {
      const curves = (c.graphData?.datasets || []).map((d) => d.latex || d.label).filter(Boolean);
      return curves.length ? `<p>Graph of ${curves.map((l) => math(l, false)).join(', ')}</p>` : '';
    }
    return '';
  }).filter(Boolean);
  const picture = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title || 'Playground page')}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
body{font:17px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:900px;margin:32px auto;padding:0 20px;color:#18181b;background:#fff}
h1{font-size:30px;margin:0 0 16px}img.page{width:100%;height:auto;border:1px solid #e4e4e7;border-radius:12px}
h2{font-size:20px;margin:28px 0 8px}.math{overflow-x:auto}table{border-collapse:collapse;margin:12px 0;display:block;overflow-x:auto}
th,td{border:1px solid #d4d4d8;padding:6px 10px;vertical-align:top}th{background:#f4f4f5}.muted{color:#71717a;font-size:14px}
</style>
</head>
<body>
<h1>${esc(title || 'Playground page')}</h1>
<img class="page" src="${picture}" alt="The page: handwriting, drawings and blocks">
${typed.length ? `<h2>Typed on this page</h2>\n${typed.join('\n')}` : ''}
<p class="muted">Made with NETZ</p>
</body>
</html>
`;
}
