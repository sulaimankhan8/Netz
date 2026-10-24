/**
 * Checks notes and blocks that come from outside this device (a .netz file, a share key, the
 * cloud copy) before they are saved or shown (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step B0).
 *
 * Only known block types and fields are kept, text is capped, and pictures must be image data or
 * a web address, so nothing in a note can run as code in the app. Pure: no browser needed.
 */

export const KNOWN_BLOCK_TYPES = [
  'paragraph', 'heading1', 'heading2', 'heading3', 'math', 'callout', 'widget', 'quiz', 'ink',
  'table', 'board', 'image', 'file', 'divider',
];

const MAX_TEXT = 20000;          // characters in one text field
const MAX_PICTURE = 6 * 1024 * 1024; // characters in one inline picture (data URL)
const MAX_BLOCKS = 2000;
const MAX_TABLE_ROWS = 200;
const MAX_TABLE_COLS = 30;

const text = (v, max = MAX_TEXT) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

/** JSON copy of plain data (drops functions, symbols and cycles become an error). */
function plain(value) {
  if (value === undefined || value === null) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

const RASTER_DATA_URL = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+$/;

/**
 * A picture source that is safe to put in <img src>: raster image data, SVG as image data (an
 * <img> never runs script inside an SVG), or an https address. Raw SVG markup is turned into image
 * data. Anything else gives ''.
 */
export function safeImageSrc(value) {
  if (typeof value !== 'string' || !value) return '';
  const v = value.trim();
  if (v.length > MAX_PICTURE) return '';
  if (RASTER_DATA_URL.test(v)) return v;
  if (/^data:image\/svg\+xml[;,]/i.test(v)) return v;
  if (/^<svg[\s>]/i.test(v)) return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(v)}`;
  if (/^https:\/\/[^\s"'<>]+$/i.test(v)) return v;
  return '';
}

/** A table's data: rows of cell text, header on or off, one alignment per column. */
export function sanitizeTable(table) {
  const t = table && typeof table === 'object' ? table : {};
  let rows = Array.isArray(t.rows) ? t.rows.slice(0, MAX_TABLE_ROWS) : [];
  const cols = Math.min(MAX_TABLE_COLS, Math.max(1, ...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 1));
  rows = rows.map((r) => Array.from({ length: cols }, (_, i) => text(Array.isArray(r) ? r[i] : '', 2000)));
  if (rows.length === 0) rows = [Array.from({ length: cols }, () => '')];
  const align = Array.from({ length: cols }, (_, i) => (['left', 'center', 'right'].includes(t.align?.[i]) ? t.align[i] : 'left'));
  return { rows, header: t.header !== false, align };
}

/** The reference an asset block keeps: id, kind, name, size and a small preview picture. */
export function sanitizeAssetRef(asset) {
  const a = asset && typeof asset === 'object' ? asset : {};
  const kind = ['board', 'image', 'file'].includes(a.kind) ? a.kind : 'file';
  return {
    id: /^[A-Za-z0-9_-]{1,80}$/.test(String(a.id || '')) ? String(a.id) : '',
    kind,
    title: text(a.title, 200),
    mime: text(a.mime, 120),
    bytes: Math.max(0, num(a.bytes)),
    pageCount: Math.max(0, Math.round(num(a.pageCount))),
    preview: safeImageSrc(a.preview),
  };
}

/** One block, or null when it is not a kind of block NETZ knows. */
export function sanitizeBlock(block) {
  if (!block || typeof block !== 'object') return null;
  const type = KNOWN_BLOCK_TYPES.includes(block.type) ? block.type : null;
  if (!type) return null;
  const out = {
    id: /^[A-Za-z0-9._-]{1,80}$/.test(String(block.id || '')) ? String(block.id) : `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content: text(block.content),
  };
  if (typeof block.caption === 'string') out.caption = text(block.caption, 500);
  if (type === 'ink') out.content = safeImageSrc(block.content);
  if (type === 'quiz' && block.quizConfig) out.quizConfig = plain(block.quizConfig);
  if (type === 'widget' && block.widgetConfig) out.widgetConfig = plain(block.widgetConfig);
  if (type === 'table') out.table = sanitizeTable(block.table);
  if (type === 'board' || type === 'image' || type === 'file') {
    out.asset = sanitizeAssetRef(block.asset);
    out.display = block.display === 'card' ? 'card' : 'large';
  }
  if (type === 'divider') out.content = text(block.content, 300);
  return out;
}

export function sanitizeBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : []).slice(0, MAX_BLOCKS).map(sanitizeBlock).filter(Boolean);
}

/** A whole note: known fields only, blocks checked. */
export function sanitizeNote(note) {
  const n = note && typeof note === 'object' ? note : {};
  const now = new Date().toISOString();
  return {
    id: /^[A-Za-z0-9._-]{1,80}$/.test(String(n.id || '')) ? String(n.id) : `note-${Date.now()}`,
    title: text(n.title, 300) || 'Untitled note',
    subtitle: text(n.subtitle, 500),
    tags: (Array.isArray(n.tags) ? n.tags : []).map((t) => text(t, 60)).filter(Boolean).slice(0, 30),
    createdAt: typeof n.createdAt === 'string' && !Number.isNaN(Date.parse(n.createdAt)) ? n.createdAt : now,
    updatedAt: now,
    isPublic: false,
    author: text(n.author, 100) || 'User',
    blocks: sanitizeBlocks(n.blocks),
    ...(n.look && typeof n.look === 'object' ? { look: plain(n.look) } : {}),
    ...(typeof n.status === 'string' ? { status: text(n.status, 40) } : {}),
  };
}
