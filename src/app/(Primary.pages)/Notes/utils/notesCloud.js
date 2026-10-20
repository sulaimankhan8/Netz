'use client';

/**
 * The device side of the notes cloud copy (NETZ_LAUNCH_PLAN.md 4.4). Notes stay in localStorage as
 * before; when the student is signed in, changed notes are sent a moment after they are saved, and
 * notes changed on their other devices come back. The newest version of a note wins.
 *
 * A note counts as changed when its content differs from what was last synced (pin and unpin do
 * not move a note's updatedAt, so time alone cannot tell).
 */

import { currentAccount } from '@/app/utils/progress/cloudSync';
import { MAX_NOTES_PER_SYNC, isSampleNote, noteFingerprint } from './notesCore';
import { getNotes, saveNotes } from './noteStorage';

export const NOTES_SYNCED_EVENT = 'netz:notes-synced';

const SYNCED_KEY = 'netz_notes_synced';     // { userId, cursor, notes: { id: { fp, changedAt } } }
const DELETED_KEY = 'netz_notes_deleted';   // { id: deletedAtMs }
const STATUS_KEY = 'netz_notes_cloud';      // { overLimit: [ids], limit, at }
const SYNC_DELAY_MS = 4000;

let timer = null;
let running = null;

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full: the next sync tries again
  }
}

/** What the Notes screen shows: signed in or not, notes in the cloud, notes over the free limit. */
export function notesCloudStatus() {
  if (typeof window === 'undefined') return { signedIn: false };
  const userId = currentAccount();
  const synced = read(SYNCED_KEY, null);
  const status = read(STATUS_KEY, {});
  return {
    signedIn: !!userId,
    inCloud: synced && synced.userId === userId ? Object.keys(synced.notes || {}).length : 0,
    overLimit: status.overLimit || [],
    // null means unlimited (Pro); an old record without a limit is the free 20
    limit: status.limit === undefined ? 20 : status.limit,
    lastSync: status.at || null,
  };
}

/** Called when a note is deleted on this device, so the account deletes it too. */
export function rememberDeleted(id) {
  if (!id || isSampleNote(id)) return;
  const deleted = read(DELETED_KEY, {});
  deleted[id] = Date.now();
  write(DELETED_KEY, deleted);
}

/** Undo after delete: the note is back, so the account must not delete it. */
export function forgetDeleted(id) {
  const deleted = read(DELETED_KEY, {});
  if (deleted[id]) {
    delete deleted[id];
    write(DELETED_KEY, deleted);
  }
}

export function syncNotesSoon(delay = SYNC_DELAY_MS) {
  if (typeof window === 'undefined' || !currentAccount()) return;
  clearTimeout(timer);
  timer = setTimeout(() => { syncNotes(); }, delay);
}

export async function syncNotes() {
  if (running) return running;
  const userId = currentAccount();
  if (!userId || navigator.onLine === false) return false;

  running = (async () => {
    // A different account on this device starts fresh: every local note is sent once
    let synced = read(SYNCED_KEY, null);
    if (!synced || synced.userId !== userId) synced = { userId, cursor: null, notes: {} };

    const local = getNotes();
    const fpAtStart = new Map(local.map((n) => [n.id, noteFingerprint(n)]));
    const deleted = read(DELETED_KEY, {});

    const pushes = local
      .filter((n) => n && n.id && !isSampleNote(n.id) && fpAtStart.get(n.id) !== synced.notes[n.id]?.fp)
      .map((n) => ({
        id: n.id,
        data: n,
        changedAt: Math.max(Date.parse(n.updatedAt) || 0, (synced.notes[n.id]?.changedAt || 0) + 1),
      }))
      .sort((a, b) => b.changedAt - a.changedAt)
      .slice(0, MAX_NOTES_PER_SYNC);
    const deletions = Object.entries(deleted)
      .filter(([id]) => synced.notes[id])
      .map(([id, at]) => ({ id, changedAt: Math.max(at, (synced.notes[id]?.changedAt || 0) + 1) }))
      .slice(0, MAX_NOTES_PER_SYNC);

    let res;
    try {
      res = await fetch('/api/notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushes, deletions, since: synced.cursor }),
      });
    } catch {
      return false;
    }
    if (!res.ok) return false;
    const data = await res.json();

    const skipped = new Set([...(data.overLimit || []), ...(data.rejected || [])]);
    pushes.forEach((p) => {
      if (!skipped.has(p.id)) synced.notes[p.id] = { fp: fpAtStart.get(p.id), changedAt: p.changedAt };
    });
    const stillDeleted = read(DELETED_KEY, {});
    deletions.forEach((d) => {
      delete stillDeleted[d.id];
      delete synced.notes[d.id];
    });
    write(DELETED_KEY, stillDeleted);

    // Take the server's newer notes, except one being edited on this device right now
    let list = getNotes();
    let changed = false;
    (data.notes || []).forEach((r) => {
      const i = list.findIndex((n) => n.id === r.id);
      const editedMeanwhile = i >= 0 && noteFingerprint(list[i]) !== fpAtStart.get(r.id);
      if (editedMeanwhile) return;
      if (r.deleted) {
        if (i >= 0) {
          list = list.filter((n) => n.id !== r.id);
          changed = true;
        }
        delete synced.notes[r.id];
        return;
      }
      const fp = noteFingerprint(r.data);
      synced.notes[r.id] = { fp, changedAt: r.changedAt };
      if (i >= 0 && noteFingerprint(list[i]) === fp) return;
      if (i >= 0) list = list.map((n, j) => (j === i ? r.data : n));
      else list = [r.data, ...list];
      changed = true;
    });
    if (changed) saveNotes(list, { fromSync: true });

    synced.cursor = data.cursor;
    write(SYNCED_KEY, synced);
    write(STATUS_KEY, { overLimit: data.overLimit || [], limit: data.limit, at: Date.now() });
    window.dispatchEvent(new CustomEvent(NOTES_SYNCED_EVENT, { detail: { changed } }));

    // More than one batch waiting: carry on shortly
    if (pushes.length === MAX_NOTES_PER_SYNC) syncNotesSoon(1000);
    return true;
  })();

  try {
    return await running;
  } finally {
    running = null;
  }
}
