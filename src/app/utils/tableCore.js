/**
 * Tables for Notes and the Playground (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, steps 5 and 6).
 * One data shape for both, so a table moves between them unchanged:
 *   { rows: string[][], header: boolean, align: ('left'|'center'|'right')[] }
 * Cells are text; `$…$` in a cell is maths. Pure: test_tables.mjs runs it in Node.
 */

export const MAX_TABLE_ROWS = 200;
export const MAX_TABLE_COLS = 30;

export function newTable(rows = 3, cols = 3, header = true) {
  const r = Math.max(1, Math.min(MAX_TABLE_ROWS, rows));
  const c = Math.max(1, Math.min(MAX_TABLE_COLS, cols));
  return { rows: Array.from({ length: r }, () => Array.from({ length: c }, () => '')), header, align: Array.from({ length: c }, () => 'left') };
}

export const colCount = (t) => Math.max(1, ...(t.rows || [[]]).map((r) => r.length));

export function setCell(t, r, c, value) {
  return { ...t, rows: t.rows.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? String(value) : cell)) : row)) };
}

export function insertRow(t, at = t.rows.length) {
  if (t.rows.length >= MAX_TABLE_ROWS) return t;
  const rows = [...t.rows];
  rows.splice(Math.max(0, Math.min(at, rows.length)), 0, Array.from({ length: colCount(t) }, () => ''));
  return { ...t, rows };
}

export function insertCol(t, at = colCount(t)) {
  if (colCount(t) >= MAX_TABLE_COLS) return t;
  const i = Math.max(0, Math.min(at, colCount(t)));
  const align = [...(t.align || [])];
  align.splice(i, 0, 'left');
  return { ...t, rows: t.rows.map((row) => [...row.slice(0, i), '', ...row.slice(i)]), align };
}

export function removeRow(t, at) {
  if (t.rows.length <= 1) return t;
  return { ...t, rows: t.rows.filter((_, i) => i !== at) };
}

export function removeCol(t, at) {
  if (colCount(t) <= 1) return t;
  return { ...t, rows: t.rows.map((row) => row.filter((_, j) => j !== at)), align: (t.align || []).filter((_, j) => j !== at) };
}

export function setAlign(t, col, value) {
  const align = Array.from({ length: colCount(t) }, (_, j) => (j === col ? value : t.align?.[j] || 'left'));
  return { ...t, align };
}

// ── Exports ──────────────────────────────────────────────────────────────────

const mdCell = (s) => String(s || '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');

/** A Markdown pipe table (a table without a header row gets an empty one: Markdown needs it). */
export function tableToMarkdown(t) {
  const cols = colCount(t);
  const rows = t.rows.map((r) => Array.from({ length: cols }, (_, j) => mdCell(r[j])));
  const head = t.header ? rows[0] : Array.from({ length: cols }, () => ' ');
  const body = t.header ? rows.slice(1) : rows;
  const rule = Array.from({ length: cols }, (_, j) => ({ center: ':---:', right: '---:' }[t.align?.[j]] || '---'));
  return [head, rule, ...body].map((r) => `| ${r.join(' | ')} |`).join('\n');
}

const TEX_SPECIAL = /[\\{}&%#_^~$]/g;
const texEscape = (s) =>
  String(s).replace(TEX_SPECIAL, (ch) => ({ '\\': '\\textbackslash{}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}' }[ch] || `\\${ch}`));

/** Text with $…$ maths: the maths is kept, the rest escaped. */
export function cellToTex(s) {
  return String(s || '')
    .split(/(\$[^$]+\$)/g)
    .map((part) => (/^\$[^$]+\$$/.test(part) ? part : texEscape(part)))
    .join('')
    .replace(/\r?\n/g, ' \\newline ');
}

/** A LaTeX table (booktabs). */
export function tableToTex(t) {
  const cols = colCount(t);
  const spec = Array.from({ length: cols }, (_, j) => ({ center: 'c', right: 'r' }[t.align?.[j]] || 'l')).join('');
  const line = (r) => `${Array.from({ length: cols }, (_, j) => cellToTex(r[j])).join(' & ')} \\\\`;
  const out = ['\\begin{center}', `\\begin{tabular}{${spec}}`, '\\toprule'];
  if (t.header) {
    out.push(line(t.rows[0]), '\\midrule');
    t.rows.slice(1).forEach((r) => out.push(line(r)));
  } else {
    t.rows.forEach((r) => out.push(line(r)));
  }
  out.push('\\bottomrule', '\\end{tabular}', '\\end{center}');
  return out.join('\n');
}

const htmlEscape = (s) => String(s || '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/** An HTML table (cells escaped; `renderMath(tex)` may turn $…$ into maths HTML). */
export function tableToHtml(t, renderMath = null) {
  const cols = colCount(t);
  const cell = (s) =>
    String(s || '')
      .split(/(\$[^$]+\$)/g)
      .map((part) => (renderMath && /^\$[^$]+\$$/.test(part) ? renderMath(part.slice(1, -1)) : htmlEscape(part).replace(/\r?\n/g, '<br>')))
      .join('');
  const style = (j) => (t.align?.[j] && t.align[j] !== 'left' ? ` style="text-align:${t.align[j]}"` : '');
  const row = (r, tag) => `<tr>${Array.from({ length: cols }, (_, j) => `<${tag}${style(j)}>${cell(r[j])}</${tag}>`).join('')}</tr>`;
  const head = t.header ? `<thead>${row(t.rows[0], 'th')}</thead>` : '';
  const body = (t.header ? t.rows.slice(1) : t.rows).map((r) => row(r, 'td')).join('');
  return `<table>${head}<tbody>${body}</tbody></table>`;
}

/** Plain text, one row per line with cells separated by tabs (for search and for pasting). */
export function tableToText(t) {
  return t.rows.map((r) => r.join('\t')).join('\n');
}
