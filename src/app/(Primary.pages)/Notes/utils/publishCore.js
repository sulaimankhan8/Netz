/**
 * Rules for publishing a note to the web (NETZ_LAUNCH_PLAN.md 4.4, board artboards 10–12). Pure,
 * shared by the server routes and tested by test_publish.mjs.
 */

import { MAX_NOTE_BYTES, isSampleNote } from './notesCore.js';

export const FREE_PUBLIC_NOTES = 2;

// Note fields that are private to the author's device and never published
const PRIVATE_FIELDS = ['accessKey', 'isPublic', 'author', 'isPinned', 'status'];
const NOTE_ID_RE = /^[A-Za-z0-9._-]{1,80}$/;

/** "Newton-Raphson method!" → "newton-raphson-method" (letters, digits and dashes, at most 48). */
export function slugifyTitle(title) {
  const base = String(title || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '');
  return base || 'note';
}

/** A slug for a new public note: the title plus 4 random letters/digits, e.g. newton-raphson-x7k2. */
export function makeSlug(title, random = Math.random) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let tail = '';
  for (let i = 0; i < 4; i++) tail += chars[Math.floor(random() * chars.length)];
  return `${slugifyTitle(title)}-${tail}`;
}

export function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9-]{3,60}$/.test(slug);
}

/**
 * Checks a note sent for publishing and returns the copy to store, or an error.
 * @returns {{ ok: true, noteId, title, data } | { ok: false, error }}
 */
export function preparePublicCopy(note) {
  if (!note || typeof note !== 'object' || Array.isArray(note)) return { ok: false, error: 'bad_note' };
  if (!NOTE_ID_RE.test(String(note.id || ''))) return { ok: false, error: 'bad_note' };
  if (isSampleNote(note.id)) return { ok: false, error: 'sample_note' };
  if (!Array.isArray(note.blocks) || note.blocks.length === 0) return { ok: false, error: 'empty_note' };
  const data = { ...note };
  PRIVATE_FIELDS.forEach((f) => delete data[f]);
  if (JSON.stringify(data).length > MAX_NOTE_BYTES) return { ok: false, error: 'too_large' };
  const title = String(note.title || 'Untitled note').slice(0, 120);
  return { ok: true, noteId: note.id, title, data };
}

/** Whether one more note may be published: re-publishing an already public note is always fine. */
export function canPublishMore(publishedNoteIds, noteId, limit = FREE_PUBLIC_NOTES) {
  if (publishedNoteIds.includes(noteId)) return true;
  return publishedNoteIds.length < limit;
}
