'use client';

/**
 * Exporting a whole note: typed content as typed, pictures as pictures
 * (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 2).
 *
 *   Markdown  text, $$maths$$ and tables; sketches, boards, images and file previews as images
 *             inside the file (data URLs)
 *   HTML      one self-contained page: maths drawn, tables, every picture inside
 *   LaTeX     .zip: the .tex with \includegraphics and an images/ folder (PNG/JPEG for pdflatex)
 *   .netz     the note with everything it uses, to open again in NETZ (Pro)
 */

import katex from 'katex';
import { tableToHtml, tableToMarkdown } from '@/app/utils/tableCore';
import { makeZip, dataUrlBytes } from '@/app/utils/zip';
import { buildNetzFile, downloadText, netzFileName } from '@/app/utils/netzFile';
import { safeImageSrc, sanitizeTable } from './importSafety';
import { noteToTex } from './latexNote';
import { assetMainBlob, blobToDataUrl, embedAssets, getAsset } from './assetStore';
import { formatBytes } from './assetCore';

const PICTURE_TYPES = ['ink', 'board', 'image', 'file'];

const slug = (title, fallback = 'note') => String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || fallback;

/**
 * The picture a block shows, as a data URL ('' when it has none): a sketch's drawing; a picture
 * from the library in full; a board's or PDF's preview; else the small copy the note keeps.
 */
export async function blockPicture(b) {
  if (b.type === 'ink') return safeImageSrc(b.content);
  if (!b.asset?.id) return '';
  try {
    const record = await getAsset(b.asset.id);
    if (record) {
      if (record.kind === 'image' && record.mime !== 'image/svg+xml') {
        const main = await assetMainBlob(record.id);
        if (main) return await blobToDataUrl(main);
      }
      if (record.previewBlob) return await blobToDataUrl(record.previewBlob);
    }
  } catch {
    // fall back to the copy inside the note
  }
  return safeImageSrc(b.asset.preview);
}

function quizLines(b) {
  const q = b.quizConfig || {};
  const lines = [`**${b.content || 'Quiz'}:** ${q.question || ''}`];
  if (q.mode === 'mcq' && Array.isArray(q.options)) {
    q.options.forEach((o, i) => lines.push(`${i + 1}. ${o}`));
    if (q.options[q.correctOptionIndex] !== undefined) lines.push('', `*Answer:* ${q.options[q.correctOptionIndex]}`);
  } else if (q.correctNumericValue !== undefined) {
    lines.push('', `*Answer:* ${q.correctNumericValue}`);
  }
  if (q.explanation) lines.push('', q.explanation);
  return lines.join('\n');
}

const assetLabel = (b) => {
  const a = b.asset || {};
  const kind = { board: 'Board', image: 'Image', file: 'File' }[b.type] || 'Picture';
  return `${kind}: ${a.title || 'untitled'}${a.bytes ? ` (${formatBytes(a.bytes)})` : ''}`;
};

/** The note as Markdown, every picture inside the file. */
export async function noteToMarkdown(note) {
  const out = [`# ${note.title || 'Untitled note'}`, ''];
  if (note.subtitle) out.push(`*${note.subtitle}*`, '');
  if (note.tags?.length) out.push(`**Tags**: ${note.tags.join(', ')}`);
  if (note.createdAt) out.push(`**Created**: ${new Date(note.createdAt).toLocaleDateString()}`);
  out.push('', '---', '');
  for (const b of note.blocks || []) {
    const text = typeof b.content === 'string' ? b.content : '';
    let part = '';
    if (b.type === 'heading1') part = `## ${text}`;
    else if (b.type === 'heading2') part = `### ${text}`;
    else if (b.type === 'heading3') part = `#### ${text}`;
    else if (b.type === 'paragraph') part = text;
    else if (b.type === 'math') part = text.trim() ? `$$\n${text}\n$$` : '';
    else if (b.type === 'callout') part = text ? `> ${text.replace(/\n/g, '\n> ')}` : '';
    else if (b.type === 'widget') part = `\`[Interactive Solver: ${text || b.widgetConfig?.algorithmId || 'solver'}]\``;
    else if (b.type === 'quiz') part = quizLines(b);
    else if (b.type === 'table') part = tableToMarkdown(sanitizeTable(b.table));
    else if (b.type === 'divider') part = text ? `---\n\n*${text}*` : '---';
    else if (PICTURE_TYPES.includes(b.type)) {
      const pic = await blockPicture(b);
      const alt = (b.type === 'ink' ? b.caption : b.asset?.title) || 'Picture';
      part = pic ? `![${alt.replace(/[[\]]/g, '')}](${pic})` : '';
      if (b.type !== 'ink') part = [part, `*${assetLabel(b)}*`].filter(Boolean).join('\n\n');
      else if (b.caption) part += `\n\n*${b.caption}*`;
    }
    if (part.trim()) out.push(part, '');
  }
  return out.join('\n');
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const math = (tex, display) => katex.renderToString(String(tex || ''), { throwOnError: false, displayMode: display });

/** The note as one HTML page (pictures inside it; maths needs the KaTeX style sheet, linked). */
export async function noteToHtml(note) {
  const parts = [];
  for (const b of note.blocks || []) {
    const text = typeof b.content === 'string' ? b.content : '';
    if (b.type === 'heading1') parts.push(`<h2>${esc(text)}</h2>`);
    else if (b.type === 'heading2') parts.push(`<h3>${esc(text)}</h3>`);
    else if (b.type === 'heading3') parts.push(`<h4>${esc(text)}</h4>`);
    else if (b.type === 'paragraph' && text.trim()) parts.push(`<p>${esc(text).replace(/\n/g, '<br>')}</p>`);
    else if (b.type === 'math' && text.trim()) parts.push(`<div class="math">${math(text, true)}</div>`);
    else if (b.type === 'callout' && text.trim()) parts.push(`<aside>${esc(text)}</aside>`);
    else if (b.type === 'widget') parts.push(`<p class="muted">[Interactive solver: ${esc(text || b.widgetConfig?.algorithmId || '')}. Open the note in NETZ to run it.]</p>`);
    else if (b.type === 'quiz') parts.push(`<div class="quiz">${esc(quizLines(b)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>')}</div>`);
    else if (b.type === 'table') parts.push(tableToHtml(sanitizeTable(b.table), (tex) => math(tex, false)));
    else if (b.type === 'divider') parts.push(`<hr>${text ? `<p class="muted center">${esc(text)}</p>` : ''}`);
    else if (PICTURE_TYPES.includes(b.type)) {
      const pic = await blockPicture(b);
      const caption = b.type === 'ink' ? b.caption : assetLabel(b);
      parts.push(`<figure>${pic ? `<img src="${esc(pic)}" alt="${esc(caption || 'Picture')}">` : ''}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`);
    }
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(note.title || 'Note')}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
body{font:17px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#18181b;background:#fff}
h1{font-size:34px;line-height:1.2;margin:0 0 6px}.sub{color:#52525b;margin:0 0 8px}.muted{color:#71717a;font-size:14px}.center{text-align:center}
aside{background:#fff7e6;border-radius:12px;padding:12px 16px}.math{overflow-x:auto;padding:8px 0}.quiz{background:#f4f4f5;border-radius:12px;padding:12px 16px}
figure{margin:16px 0;text-align:center}figure img{max-width:100%;border:1px solid #e4e4e7;border-radius:8px}figcaption{color:#71717a;font-size:14px}
table{border-collapse:collapse;margin:12px 0;display:block;overflow-x:auto}th,td{border:1px solid #d4d4d8;padding:6px 10px;vertical-align:top}th{background:#f4f4f5}
hr{border:0;border-top:1px solid #e4e4e7;margin:20px 0 6px}
</style>
</head>
<body>
<h1>${esc(note.title || 'Untitled note')}</h1>
${note.subtitle ? `<p class="sub">${esc(note.subtitle)}</p>` : ''}
${note.tags?.length ? `<p class="muted">${note.tags.map((t) => `#${esc(t)}`).join(' ')}</p>` : ''}
${parts.join('\n')}
<p class="muted">Made with NETZ</p>
</body>
</html>
`;
}

/** Any picture as PNG or JPEG bytes (LaTeX cannot read WebP or SVG). */
async function toLatexPicture(dataUrl) {
  const parsed = dataUrlBytes(dataUrl);
  if (!parsed) return null;
  if (parsed.mime === 'image/png' || parsed.mime === 'image/jpeg') return { bytes: parsed.bytes, ext: parsed.mime === 'image/png' ? 'png' : 'jpg' };
  const img = await new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = dataUrl;
  });
  if (!img) return null;
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 800;
  canvas.height = img.naturalHeight || 600;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const png = dataUrlBytes(canvas.toDataURL('image/png'));
  return png ? { bytes: png.bytes, ext: 'png' } : null;
}

/** The .tex and its pictures as a .zip. */
export async function noteTexZip(note) {
  const images = new Map();
  const files = [];
  let n = 0;
  for (const b of note.blocks || []) {
    if (!PICTURE_TYPES.includes(b.type)) continue;
    const pic = await blockPicture(b);
    if (!pic) continue;
    const out = await toLatexPicture(pic);
    if (!out) continue;
    n += 1;
    const name = `images/picture-${n}.${out.ext}`;
    images.set(b.id, name);
    files.push({ name, data: out.bytes });
  }
  const { tex, filename } = noteToTex(note, { images });
  const zip = makeZip([{ name: filename, data: tex }, ...files]);
  return { blob: new Blob([zip], { type: 'application/zip' }), filename: filename.replace(/\.tex$/, '.zip') };
}

/** Saves a file to the device. */
export function saveFile(content, fileName, mime) {
  downloadText(content instanceof Blob ? content : new Blob([content], { type: mime }), fileName, mime);
}

export async function exportNoteMarkdown(note) {
  saveFile(await noteToMarkdown(note), `${slug(note.title)}.md`, 'text/markdown;charset=utf-8');
}

export async function exportNoteHtml(note) {
  saveFile(await noteToHtml(note), `${slug(note.title)}.html`, 'text/html;charset=utf-8');
}

/** The note as a .netz file, with the boards, pictures and files its blocks use. */
export async function exportNoteNetz(note) {
  const ids = (note.blocks || []).map((b) => b.asset?.id).filter(Boolean);
  const assets = await embedAssets(ids);
  const text = buildNetzFile({ kind: 'note', note, assets });
  saveFile(text, netzFileName(note.title, 'note'), 'application/json');
  return { bytes: text.length, items: assets.length };
}
