/**
 * Rules for the cloud copy of notes (NETZ_LAUNCH_PLAN.md 4.4), shared by the server route and the
 * device. Pure, so test_notes_sync.mjs checks them without a database.
 */

export const FREE_CLOUD_NOTES = 20;
export const MAX_NOTE_BYTES = 300 * 1024;
export const MAX_NOTES_PER_SYNC = 50;

// Built-in sample notes are on every device already; they are never uploaded
export const isSampleNote = (id) => typeof id === 'string' && id.startsWith('note-demo-');

const ID_RE = /^[A-Za-z0-9._-]{1,80}$/;

/** A short fingerprint of a note's content, to tell whether it changed since the last sync. */
export function noteFingerprint(note) {
  const text = JSON.stringify(note);
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return `${text.length}:${(h >>> 0).toString(36)}`;
}

/**
 * Server: decides which pushed notes and deletions to store.
 * @param {Map<string,{changedAt:number, deleted:boolean}>} existing  the user's stored notes
 * @param {Array<{id, data, changedAt}>} pushes
 * @param {Array<{id, changedAt}>} deletions
 * @param {number} limit  cloud notes allowed (deleted ones do not count)
 * @returns {{ writes: Array<{id, data, changedAt, deleted}>, overLimit: string[], rejected: string[] }}
 */
export function planNoteWrites(existing, pushes = [], deletions = [], limit = FREE_CLOUD_NOTES) {
  const writes = [];
  const overLimit = [];
  const rejected = [];
  let live = [...existing.values()].filter((n) => !n.deleted).length;

  (Array.isArray(deletions) ? deletions : []).slice(0, MAX_NOTES_PER_SYNC).forEach((d) => {
    if (!d || !ID_RE.test(String(d.id)) || isSampleNote(d.id)) return;
    const changedAt = Number(d.changedAt) || 0;
    const stored = existing.get(d.id);
    if (!stored || stored.deleted || changedAt <= stored.changedAt) return;
    writes.push({ id: d.id, data: {}, changedAt, deleted: true });
    live -= 1;
  });

  (Array.isArray(pushes) ? pushes : []).slice(0, MAX_NOTES_PER_SYNC).forEach((p) => {
    if (!p || !ID_RE.test(String(p.id)) || isSampleNote(p.id) || !p.data || typeof p.data !== 'object') {
      if (p?.id) rejected.push(String(p.id));
      return;
    }
    if (JSON.stringify(p.data).length > MAX_NOTE_BYTES) {
      rejected.push(p.id);
      return;
    }
    const changedAt = Number(p.changedAt) || 0;
    const stored = existing.get(p.id);
    if (stored && changedAt <= stored.changedAt) return; // the stored version is newer: keep it
    const isNewLive = !stored || stored.deleted;
    if (isNewLive && live >= limit) {
      overLimit.push(p.id);
      return;
    }
    if (isNewLive) live += 1;
    writes.push({ id: p.id, data: { ...p.data, id: p.id }, changedAt, deleted: false });
  });

  return { writes, overLimit, rejected };
}
