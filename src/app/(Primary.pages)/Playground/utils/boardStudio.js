/**
 * The Playground and Notes Studio (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, steps 2b and 3):
 * which library board this notebook was saved as, turning note blocks into Playground blocks
 * (Insert from file), and placing inserted pages below what is already on a page.
 */

import { safeImageSrc, sanitizeTable } from '../../Notes/utils/importSafety.js';

const LINK_KEY = 'netz_playground_board_asset';

/** The library item this notebook was last saved as or opened from, or null. */
export function boardLink() {
  try {
    const v = JSON.parse(localStorage.getItem(LINK_KEY) || 'null');
    return v && typeof v.assetId === 'string' ? v : null;
  } catch {
    return null;
  }
}

export function setBoardLink(assetId, title = '') {
  try {
    if (assetId) localStorage.setItem(LINK_KEY, JSON.stringify({ assetId, title }));
    else localStorage.removeItem(LINK_KEY);
  } catch {
    // not remembered: the next save makes a new card
  }
}

/** A title for a board: the first page's own name, else "Board · 24 Oct". */
export function boardTitle(pages) {
  const named = (pages || []).map((p) => p.title).find((t) => t && !/^Page \d+$/.test(t));
  return named || `Board · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
}

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Copies of pages with fresh ids (strokes and blocks too), so inserted pages never clash. */
export function freshPages(pages, titlePrefix = '') {
  return (pages || []).map((p, i) => {
    const blockIds = new Map();
    const blocks = (p.blocks || []).map((b) => {
      const id = newId('block');
      blockIds.set(b.blockId, id);
      return { ...b, blockId: id };
    });
    return {
      ...p,
      id: newId('page'),
      title: `${titlePrefix}${p.title || `Page ${i + 1}`}`,
      strokes: (p.strokes || []).map((s) => ({ ...s, id: newId('stroke') })),
      blocks: blocks.map((b) => ({ ...b, linkedBlockIds: (b.linkedBlockIds || []).map((id) => blockIds.get(id)).filter(Boolean) })),
      links: (p.links || [])
        .map((l) => ({ ...l, sourceBlockId: blockIds.get(l.sourceBlockId), targetBlockId: blockIds.get(l.targetBlockId) }))
        .filter((l) => l.sourceBlockId && l.targetBlockId),
      shapes: (p.shapes || []).map((s) => ({ ...s, id: newId('shape') })),
    };
  });
}

const px = (pt) => (Array.isArray(pt) ? pt[0] : pt.x);
const py = (pt) => (Array.isArray(pt) ? pt[1] : pt.y);

/** Moves a page's content by (dx, dy): its ink, blocks and shapes. */
export function offsetPage(page, dx, dy) {
  const move = (pt) => (Array.isArray(pt) ? [pt[0] + dx, pt[1] + dy, ...pt.slice(2)] : { ...pt, x: pt.x + dx, y: pt.y + dy });
  const moveBox = (b, points) => {
    if (b) return { minX: b.minX + dx, minY: b.minY + dy, maxX: b.maxX + dx, maxY: b.maxY + dy };
    // A stroke without a box gets one (the Playground needs it)
    const xs = points.map(px);
    const ys = points.map(py);
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  };
  return {
    ...page,
    strokes: (page.strokes || []).map((s) => {
      const points = (s.points || []).map(move);
      return { ...s, points, bbox: points.length ? moveBox(s.bbox, points) : s.bbox };
    }),
    blocks: (page.blocks || []).map((b) => ({ ...b, position: { x: (b.position?.x || 0) + dx, y: (b.position?.y || 0) + dy } })),
    shapes: (page.shapes || []).map((s) => (typeof s.x === 'number' && typeof s.y === 'number' ? { ...s, x: s.x + dx, y: s.y + dy } : s)),
  };
}

/** The top-left corner of everything on a page, or null when it is empty. */
export function pageTopLeft(page) {
  let minX = Infinity, minY = Infinity;
  for (const s of page.strokes || []) for (const pt of s.points || []) {
    minX = Math.min(minX, px(pt));
    minY = Math.min(minY, py(pt));
  }
  for (const b of page.blocks || []) {
    minX = Math.min(minX, b.position?.x ?? Infinity);
    minY = Math.min(minY, b.position?.y ?? Infinity);
  }
  for (const s of page.shapes || []) {
    if (typeof s.x === 'number') minX = Math.min(minX, s.x);
    if (typeof s.y === 'number') minY = Math.min(minY, s.y);
  }
  return Number.isFinite(minX) && Number.isFinite(minY) ? { x: minX, y: minY } : null;
}

/** The lowest point of everything on a page (0 for an empty page). */
export function pageBottom(page) {
  let maxY = -Infinity;
  for (const s of page.strokes || []) for (const pt of s.points || []) maxY = Math.max(maxY, py(pt));
  for (const b of page.blocks || []) {
    const h = typeof b.size?.height === 'number' ? b.size.height : 160;
    maxY = Math.max(maxY, (b.position?.y || 0) + h);
  }
  for (const s of page.shapes || []) if (typeof s.y === 'number') maxY = Math.max(maxY, s.y + (Number(s.h) || 0));
  return Number.isFinite(maxY) ? maxY : 0;
}

/**
 * A note's blocks as Playground blocks, one under the other from (x, y): text and headings become
 * text blocks, formulas equation blocks, tables table blocks, pictures image blocks. Quizzes and
 * solvers become a line of text naming them.
 */
export function noteBlocksToCanvas(blocks, { x = 80, y = 80, width = 560 } = {}) {
  const out = [];
  let top = y;
  const add = (type, content, height) => {
    out.push({
      blockId: newId('block'),
      type,
      content,
      linkedBlockIds: [],
      position: { x, y: top },
      size: { width, height },
      status: 'active',
      isMinimal: type === 'theory',
    });
    top += height + 24;
  };
  for (const b of blocks || []) {
    const text = typeof b.content === 'string' ? b.content : '';
    if (b.type === 'heading1' || b.type === 'heading2' || b.type === 'heading3') {
      if (text.trim()) add('theory', { text: `${'#'.repeat(Number(b.type.slice(-1)))} ${text}` }, 64);
    } else if (b.type === 'paragraph' || b.type === 'callout') {
      if (text.trim()) add('theory', { text: b.type === 'callout' ? `> ${text}` : text }, Math.max(64, 28 * Math.ceil(text.length / 60) + 24));
    } else if (b.type === 'math') {
      if (text.trim()) add('equation', { latex: text }, 100);
    } else if (b.type === 'table') {
      const table = sanitizeTable(b.table);
      add('table', { table }, 48 + table.rows.length * 44);
    } else if (b.type === 'ink' || b.type === 'image' || b.type === 'board' || b.type === 'file') {
      const src = b.type === 'ink' ? safeImageSrc(b.content) : safeImageSrc(b.asset?.preview);
      const caption = b.type === 'ink' ? b.caption || '' : b.asset?.title || '';
      if (src) add('image', { imageUrl: src, caption, aspectRatio: 4 / 3 }, Math.round(width * 0.75));
      else if (caption) add('theory', { text: `[${caption}]` }, 64);
    } else if (b.type === 'quiz' || b.type === 'widget') {
      add('theory', { text: `[${b.type === 'quiz' ? 'Quiz' : 'Solver'}: ${text || b.quizConfig?.question || ''}]` }, 64);
    } else if (b.type === 'divider' && text) {
      add('theory', { text: `— ${text} —` }, 52);
    }
  }
  return out;
}
