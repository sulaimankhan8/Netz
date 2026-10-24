'use client';

/**
 * Turning things into note blocks (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, steps 2b and 3):
 * an item from the Assets library, or the content of a .netz file someone gave you. Inserted
 * blocks are normal blocks: you can write between them, move them and delete them.
 */

import { assetRefOf, importEmbeddedAssets, saveBoardAsset } from './assetStore';
import { generateAccessKey } from './noteStorage';

const newBlockId = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** A Board, Image or File block for a library item. */
export async function assetBlockFor(record) {
  return { id: newBlockId(), type: record.kind, content: '', asset: await assetRefOf(record), display: 'large' };
}

/** The small "Inserted from …" line that marks where inserted blocks came from. */
export function dividerBlock(label) {
  return { id: newBlockId(), type: 'divider', content: label };
}

const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** A board read from a file becomes a library item (with a preview of its first page). */
async function boardFromDocument(document) {
  let previewBlob = null;
  try {
    const { renderBoardPage } = await import('./boardRender');
    const canvas = await renderBoardPage(document.pages[0], 600, { maxHeight: 1200 });
    previewBlob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.8));
  } catch {
    previewBlob = null;
  }
  return saveBoardAsset({ title: document.title || 'Board', pages: document.pages, previewBlob });
}

/**
 * The blocks to insert for a parsed .netz file (from netzFile.js parseNetzFile), with a divider
 * first. Items the file carries go into the library as new items.
 * @returns {Promise<{ blocks: Array, title: string }>}
 */
export async function blocksFromNetz(result, fileName = 'a file') {
  const label = `Inserted from ${fileName.replace(/\.netz$/i, '')} · ${today()}`;
  if (result.kind === 'document') {
    const record = await boardFromDocument(result.document);
    return { title: result.document.title, blocks: [dividerBlock(label), await assetBlockFor(record)] };
  }
  const idMap = await importEmbeddedAssets(result.assets);
  const blocks = result.note.blocks.map((b) => {
    const copy = { ...b, id: newBlockId() };
    if (copy.asset?.id) copy.asset = { ...copy.asset, id: idMap.get(copy.asset.id) || copy.asset.id };
    return copy;
  });
  return { title: result.note.title, blocks: [dividerBlock(label), ...blocks] };
}

/** A whole new note from a parsed .netz file ("Open file" in the notes list). */
export async function noteFromNetz(result, fileName = 'a file') {
  const now = new Date().toISOString();
  const base = {
    id: `note-${Date.now()}`,
    subtitle: '',
    tags: ['Imported'],
    createdAt: now,
    updatedAt: now,
    isPublic: false,
    accessKey: generateAccessKey(),
    author: 'User',
  };
  if (result.kind === 'document') {
    const record = await boardFromDocument(result.document);
    return { ...base, title: result.document.title || fileName, blocks: [await assetBlockFor(record), { id: newBlockId(), type: 'paragraph', content: '' }] };
  }
  const { blocks } = await blocksFromNetz(result, fileName);
  return {
    ...base,
    title: result.note.title,
    subtitle: result.note.subtitle || '',
    tags: result.note.tags?.length ? result.note.tags : base.tags,
    ...(result.note.look ? { look: result.note.look } : {}),
    blocks: blocks.slice(1), // a whole note needs no "Inserted from" line
  };
}
