'use client';

/**
 * The device side of publishing notes to the web (board artboard 10): which of the student's notes
 * are published, and publish / update / unpublish. Needs an account; the server decides the link,
 * the free limit and the "Publish a note" task.
 */

import { useEffect, useState } from 'react';
import { recordActivity } from '@/app/utils/activity';
import { applyServerState, currentAccount } from '@/app/utils/progress/cloudSync';
import { FREE_PUBLIC_NOTES } from './publishCore';

export const PUBLISHED_EVENT = 'netz:published';

let cache = { notes: [], limit: FREE_PUBLIC_NOTES, loaded: false };

export function publishedState() {
  return cache;
}

export function publicUrl(slug) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://netz.app';
  return `${origin}/p/${slug}`;
}

function announce() {
  window.dispatchEvent(new CustomEvent(PUBLISHED_EVENT, { detail: cache }));
}

/** Loads the student's published notes (once per page unless forced). */
export async function loadPublished(force = false) {
  if (!currentAccount()) return cache;
  if (cache.loaded && !force) return cache;
  try {
    const res = await fetch('/api/notes/published', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      cache = { notes: data.notes || [], limit: data.limit || FREE_PUBLIC_NOTES, loaded: true };
      announce();
    }
  } catch {
    // Offline: the dialog shows what it knew last
  }
  return cache;
}

/** Publishes the note, or updates its public copy. Resolves to { ok, error?, note? }. */
export async function publishNote(note) {
  let res;
  try {
    res = await fetch('/api/notes/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, tz: new Date().getTimezoneOffset() }),
    });
  } catch {
    return { ok: false, error: 'offline' };
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) return { ok: false, error: data.error || 'failed', limit: data.limit };

  const others = cache.notes.filter((n) => n.noteId !== data.note.noteId);
  cache = { notes: [data.note, ...others], limit: data.limit, loaded: true };
  // The toast and robot show the task here; the server already counted it in data.state
  recordActivity('note.published', { slug: data.note.slug });
  applyServerState(data.state, 'note.published');
  announce();
  return { ok: true, note: data.note };
}

/**
 * Ids of the student's notes that are published right now (empty when signed out). Replaces the old
 * local `isPublic` flag, which no longer means anything.
 */
export function usePublishedIds() {
  const [ids, setIds] = useState(() => new Set(cache.notes.map((n) => n.noteId)));
  useEffect(() => {
    const onChange = (e) => setIds(new Set((e.detail?.notes || []).map((n) => n.noteId)));
    window.addEventListener(PUBLISHED_EVENT, onChange);
    loadPublished();
    return () => window.removeEventListener(PUBLISHED_EVENT, onChange);
  }, []);
  return ids;
}

export async function unpublishNote(noteId) {
  let res;
  try {
    res = await fetch('/api/notes/unpublish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId }),
    });
  } catch {
    return { ok: false, error: 'offline' };
  }
  if (!res.ok) return { ok: false, error: 'failed' };
  cache = { ...cache, notes: cache.notes.filter((n) => n.noteId !== noteId) };
  announce();
  return { ok: true };
}
