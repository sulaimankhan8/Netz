/**
 * The NETZ file (.netz): a note or a Playground board, saved so it opens again fully editable,
 * with typed content as typed and handwriting as real pen strokes
 * (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 1).
 *
 *   { netz: 1, kind: 'note' | 'document', createdWith, exportedAt,
 *     note?: { title, subtitle, tags, blocks },
 *     document?: { title, pages: [{ title, strokes, blocks, links, shapes }] },
 *     assets?: [{ id, kind, title, mime, bytes, pageCount, preview, data }] }
 *
 * `assets` carries the boards, images and files a note's blocks point to, as base64, so a note
 * shared as a file keeps them. Everything read from a file is checked here before it is used:
 * only known fields, capped sizes, and pictures only as image data. The parsing part is pure
 * (test_netz_file.mjs runs it in Node); the last few functions need a browser.
 */

import { safeImageSrc, sanitizeNote } from '../(Primary.pages)/Notes/utils/importSafety.js';

export const NETZ_FILE_VERSION = 1;
export const MAX_NETZ_FILE_BYTES = 40 * 1024 * 1024;
const MAX_PAGES = 200;
const MAX_STROKES_PER_PAGE = 20000;
const MAX_POINTS_PER_STROKE = 20000;
const MAX_ASSETS = 200;

const text = (v, max = 20000) => (typeof v === 'string' ? v.slice(0, max) : '');
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const ID_RE = /^[A-Za-z0-9._-]{1,100}$/;
const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function plain(value) {
  if (value === undefined || value === null) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

/** A point is [x, y, ...numbers] or { x, y, ...numbers/strings }; anything else is dropped. */
function sanitizePoint(pt) {
  if (Array.isArray(pt)) {
    const nums = pt.slice(0, 6).map(Number);
    return finite(nums[0]) && finite(nums[1]) ? nums.map((n) => (finite(n) ? n : 0)) : null;
  }
  if (!pt || typeof pt !== 'object' || !finite(Number(pt.x)) || !finite(Number(pt.y))) return null;
  const out = {};
  Object.keys(pt).slice(0, 10).forEach((k) => {
    const v = pt[k];
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string' && v.length <= 20) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
  });
  out.x = Number(pt.x);
  out.y = Number(pt.y);
  return out;
}

/** The box around a stroke's points (object or [x, y] points). */
export function strokeBox(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pt of points || []) {
    const x = Array.isArray(pt) ? pt[0] : pt.x;
    const y = Array.isArray(pt) ? pt[1] : pt.y;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

const COLOUR_RE =/^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,%]+\)|[a-zA-Z]{3,20})$/;

export function sanitizeStroke(stroke) {
  if (!stroke || typeof stroke !== 'object' || !Array.isArray(stroke.points)) return null;
  const points = stroke.points.slice(0, MAX_POINTS_PER_STROKE).map(sanitizePoint).filter(Boolean);
  if (points.length === 0) return null;
  const out = {
    id: ID_RE.test(String(stroke.id || '')) ? String(stroke.id) : newId('stroke'),
    color: COLOUR_RE.test(String(stroke.color || '')) ? String(stroke.color) : '#1e293b',
    width: finite(Number(stroke.width)) ? Math.min(200, Math.max(0.1, Number(stroke.width))) : 3,
    tool: ['pen', 'pencil', 'marker', 'highlighter', 'brush'].includes(stroke.tool) ? stroke.tool : 'pen',
    points,
  };
  // The Playground needs every stroke's box: it is worked out from the points (a box written in
  // the file is not trusted)
  out.bbox = strokeBox(points);
  if (finite(Number(stroke.opacity))) out.opacity = Math.min(1, Math.max(0, Number(stroke.opacity)));
  if (stroke.hasPressure === true) out.hasPressure = true;
  if (stroke.shape && typeof stroke.shape === 'object') out.shape = plain(stroke.shape);
  return out;
}

const AUDIO_DATA_URL = /^data:audio\/(webm|ogg|mp4|mpeg|wav|x-wav|aac)(;codecs=[\w.,-]+)?;base64,[A-Za-z0-9+/=]+$/;

/** A Playground block: plain data, its pictures and sounds only as data, never as markup. */
export function sanitizeCanvasBlock(block) {
  if (!block || typeof block !== 'object') return null;
  const type = ['equation', 'theory', 'graph', 'image', 'sketch', 'audio', 'table'].includes(block.type) ? block.type : null;
  if (!type) return null;
  const copy = plain(block) || {};
  const content = copy.content && typeof copy.content === 'object' ? copy.content : {};
  if ('imageUrl' in content) content.imageUrl = safeImageSrc(content.imageUrl);
  if ('src' in content) content.src = safeImageSrc(content.src);
  if ('dataUrl' in content) content.dataUrl = safeImageSrc(content.dataUrl);
  if ('audioUrl' in content) content.audioUrl = AUDIO_DATA_URL.test(String(content.audioUrl || '')) ? content.audioUrl : '';
  const pos = copy.position || {};
  const size = copy.size || {};
  return {
    ...copy,
    blockId: ID_RE.test(String(copy.blockId || '')) ? String(copy.blockId) : newId('block'),
    type,
    content,
    position: { x: finite(Number(pos.x)) ? Number(pos.x) : 0, y: finite(Number(pos.y)) ? Number(pos.y) : 0 },
    size: {
      width: finite(Number(size.width)) ? Number(size.width) : 300,
      ...(size.height === 'auto' ? { height: 'auto' } : { height: finite(Number(size.height)) ? Number(size.height) : 120 }),
    },
    linkedBlockIds: Array.isArray(copy.linkedBlockIds) ? copy.linkedBlockIds.filter((id) => ID_RE.test(String(id))) : [],
  };
}

export function sanitizePage(page, index = 0) {
  const p = page && typeof page === 'object' ? page : {};
  return {
    id: ID_RE.test(String(p.id || '')) ? String(p.id) : newId('page'),
    title: text(p.title, 120) || `Page ${index + 1}`,
    strokes: (Array.isArray(p.strokes) ? p.strokes : []).slice(0, MAX_STROKES_PER_PAGE).map(sanitizeStroke).filter(Boolean),
    blocks: (Array.isArray(p.blocks) ? p.blocks : []).slice(0, 2000).map(sanitizeCanvasBlock).filter(Boolean),
    links: (Array.isArray(p.links) ? p.links : []).slice(0, 4000).map(plain).filter((l) => l && typeof l === 'object'),
    shapes: (Array.isArray(p.shapes) ? p.shapes : []).slice(0, 4000).map(plain).filter((s) => s && typeof s === 'object'),
  };
}

export function sanitizeDocument(doc) {
  const d = doc && typeof doc === 'object' ? doc : {};
  const pages = (Array.isArray(d.pages) ? d.pages : []).slice(0, MAX_PAGES).map(sanitizePage);
  return { title: text(d.title, 200) || 'Board', pages: pages.length ? pages : [sanitizePage({}, 0)] };
}

const BASE64_RE = /^[A-Za-z0-9+/=\s]*$/;

/** An asset carried inside a file: its preview as image data and its content as base64. */
export function sanitizeEmbeddedAsset(asset) {
  if (!asset || typeof asset !== 'object') return null;
  const kind = ['board', 'image', 'file'].includes(asset.kind) ? asset.kind : null;
  const data = typeof asset.data === 'string' && BASE64_RE.test(asset.data) ? asset.data : '';
  if (!kind || !data || !ID_RE.test(String(asset.id || ''))) return null;
  return {
    id: String(asset.id),
    kind,
    title: text(asset.title, 200) || 'Untitled',
    mime: text(asset.mime, 120) || 'application/octet-stream',
    bytes: Math.max(0, Number(asset.bytes) || 0),
    pageCount: Math.max(0, Math.round(Number(asset.pageCount) || 0)),
    preview: safeImageSrc(asset.preview),
    data,
  };
}

/** The file's text for a note or a board (plus the assets its blocks use). */
export function buildNetzFile({ kind, note = null, document = null, assets = [] }) {
  const file = {
    netz: NETZ_FILE_VERSION,
    kind,
    createdWith: 'NETZ',
    exportedAt: new Date().toISOString(),
  };
  if (kind === 'note') {
    const { title, subtitle, tags, blocks, look, status } = note || {};
    file.note = { title, subtitle, tags, blocks, ...(look ? { look } : {}), ...(status ? { status } : {}) };
  } else {
    file.document = { title: document?.title || 'Board', pages: document?.pages || [] };
  }
  if (assets.length) file.assets = assets;
  return JSON.stringify(file);
}

/**
 * Reads the text of a .netz file. Always returns checked data, or an error to show:
 * { ok: true, kind, note?, document?, assets } | { ok: false, error }
 */
export function parseNetzFile(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false, error: 'The file is empty.' };
  if (raw.length > MAX_NETZ_FILE_BYTES) return { ok: false, error: 'The file is too big to open (more than 40 MB).' };
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'This is not a NETZ file, or it is damaged.' };
  }
  if (!data || typeof data !== 'object' || !Number.isInteger(data.netz)) {
    return { ok: false, error: 'This is not a NETZ file.' };
  }
  if (data.netz > NETZ_FILE_VERSION) {
    return { ok: false, error: 'This file was made by a newer version of NETZ. Reload the page and try again.' };
  }
  const assets = (Array.isArray(data.assets) ? data.assets : []).slice(0, MAX_ASSETS).map(sanitizeEmbeddedAsset).filter(Boolean);
  if (data.kind === 'note') {
    if (!data.note || typeof data.note !== 'object') return { ok: false, error: 'The note in this file is missing.' };
    return { ok: true, kind: 'note', note: sanitizeNote(data.note), assets };
  }
  if (data.kind === 'document') {
    return { ok: true, kind: 'document', document: sanitizeDocument(data.document), assets };
  }
  return { ok: false, error: 'This NETZ file holds something this version cannot open.' };
}

/** A safe file name from a title. */
export function netzFileName(title, fallback = 'netz') {
  const slug = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${slug || fallback}.netz`;
}

// ── Browser only ──────────────────────────────────────────────────────────────

/** Saves text as a download. */
export function downloadText(textContent, fileName, mime = 'application/json') {
  const blob = textContent instanceof Blob ? textContent : new Blob([textContent], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Reads a chosen File as .netz text (a gzipped file is unpacked first). */
export async function readNetzFile(file) {
  if (!file) return { ok: false, error: 'No file was chosen.' };
  if (file.size > MAX_NETZ_FILE_BYTES) return { ok: false, error: 'The file is too big to open (more than 40 MB).' };
  const head = new Uint8Array(await file.slice(0, 2).arrayBuffer());
  let raw;
  if (head[0] === 0x1f && head[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
    raw = await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).text();
  } else {
    raw = await file.text();
  }
  return parseNetzFile(raw);
}

/** Opens the file picker for .netz files and resolves with the parsed result (or null if cancelled). */
export function pickNetzFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.netz,application/json';
    input.style.display = 'none';
    input.onchange = async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return resolve(null);
      try {
        resolve({ ...(await readNetzFile(file)), fileName: file.name });
      } catch {
        resolve({ ok: false, error: 'The file could not be read.' });
      }
    };
    document.body.appendChild(input);
    input.click();
  });
}
