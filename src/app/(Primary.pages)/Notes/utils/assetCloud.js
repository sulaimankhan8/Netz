'use client';

/**
 * The cloud copy of the Assets library for signed-in students (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, 2b).
 *
 * Items are saved on the device first. A moment later each new or changed item is reserved with
 * /api/notes/assets (which checks the storage limit), its two files are uploaded straight to the
 * private Supabase Storage bucket, and the upload is confirmed. Items made on the student's other
 * devices appear as cards whose files are downloaded when first shown.
 */

import { currentAccount } from '@/app/utils/progress/cloudSync';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { assetStoragePath } from './assetCore';
import { ASSETS_EVENT, getAsset, listAssets, putAssetRecord } from './assetStore';

const BUCKET = 'note-assets';
const DELETED_KEY = 'netz_assets_deleted';
const STATUS_KEY = 'netz_assets_cloud';
export const ASSETS_CLOUD_EVENT = 'netz:assets-cloud';
const SYNC_DELAY_MS = 3000;

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
    // storage full: tried again next time
  }
}

/** Signed in, how much is used in the cloud, and the limit (shown in the library). */
export function cloudAssetStatus() {
  if (typeof window === 'undefined') return { signedIn: false };
  const s = read(STATUS_KEY, {});
  return { signedIn: !!currentAccount(), used: s.used ?? null, quota: s.quota ?? null, full: !!s.full, at: s.at || null, error: s.error || null };
}

function setStatus(patch) {
  write(STATUS_KEY, { ...read(STATUS_KEY, {}), ...patch, at: Date.now() });
  window.dispatchEvent(new CustomEvent(ASSETS_CLOUD_EVENT));
}

export function syncAssetsSoon(delay = SYNC_DELAY_MS) {
  if (typeof window === 'undefined' || !currentAccount() || !getSupabaseBrowser()) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    syncAssets();
  }, delay);
}

/** Called when an item is deleted on this device, so the cloud copy goes too. */
export function forgetCloudAsset(record) {
  if (!record || (record.syncState !== 'synced' && !record.cloudOnly)) return;
  const q = read(DELETED_KEY, []);
  if (!q.includes(record.id)) q.push(record.id);
  write(DELETED_KEY, q);
  syncAssetsSoon();
}

async function api(method, body = null, query = '') {
  const res = await fetch(`/api/notes/assets${query}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    // empty answer
  }
  return { ok: res.ok, status: res.status, data };
}

async function uploadOne(supabase, record) {
  const reserve = await api('POST', {
    action: 'reserve',
    id: record.id,
    kind: record.kind,
    title: record.title,
    mime: record.mime,
    ext: record.ext,
    bytes: record.bytes,
    pageCount: record.pageCount || 0,
  });
  if (!reserve.ok) return { stop: reserve.status === 401 || reserve.status === 503, full: reserve.data.error === 'full', data: reserve.data };
  const { paths } = reserve.data;
  const up = async (path, blob, contentType) => {
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: contentType || 'application/octet-stream' });
    if (error) throw error;
  };
  await up(paths.main, record.mainBlob, record.mime);
  if (record.previewBlob) await up(paths.preview, record.previewBlob, record.previewBlob.type || 'image/webp');
  const confirm = await api('POST', { action: 'confirm', id: record.id });
  if (!confirm.ok) return { full: confirm.data.error === 'full', data: confirm.data };
  return { ok: true, data: confirm.data };
}

/** One full pass: send deletions, upload new items, then learn about items from other devices. */
export function syncAssets() {
  if (running) return running;
  running = (async () => {
    const userId = currentAccount();
    const supabase = getSupabaseBrowser();
    if (!userId || !supabase) return;
    try {
      // 1. Deletions
      const deleted = read(DELETED_KEY, []);
      const stillDeleted = [];
      for (const id of deleted) {
        const r = await api('DELETE', null, `?id=${encodeURIComponent(id)}`);
        if (!r.ok && r.status !== 400) stillDeleted.push(id);
        if (r.status === 401 || r.status === 503) break;
      }
      write(DELETED_KEY, stillDeleted);

      // 2. New and changed items
      let full = false;
      let last = null;
      for (const record of await listAssets()) {
        if (record.syncState === 'meta') {
          const r = await api('POST', { action: 'rename', id: record.id, title: record.title });
          if (r.ok) await putAssetRecord({ ...record, syncState: 'synced' }, { quiet: true });
          continue;
        }
        if (record.syncState !== 'local' && record.syncState !== 'over') continue;
        if (!record.mainBlob) continue;
        try {
          const result = await uploadOne(supabase, record);
          if (result.stop) return;
          if (result.ok) {
            last = result.data;
            const fresh = await getAsset(record.id);
            // Changed again while uploading: leave it 'local' so the next pass sends the new version
            if (fresh && fresh.updatedAt === record.updatedAt) await putAssetRecord({ ...fresh, syncState: 'synced', cloudUserId: userId }, { quiet: true });
          } else if (result.full) {
            full = true;
            last = result.data;
            await putAssetRecord({ ...record, syncState: 'over' }, { quiet: true });
          }
        } catch {
          // network or Storage error: tried again on the next pass
        }
      }

      // 3. Items from other devices, and items deleted on them
      const list = await api('GET');
      if (list.ok) {
        const cloud = new Map((list.data.assets || []).map((a) => [a.id, a]));
        const local = await listAssets();
        const localIds = new Set(local.map((a) => a.id));
        for (const [id, a] of cloud) {
          if (localIds.has(id)) continue;
          await putAssetRecord({
            id,
            kind: a.kind,
            title: a.title,
            mime: a.mime,
            ext: a.ext,
            bytes: a.bytes,
            pageCount: a.pageCount,
            mainBlob: null,
            previewBlob: null,
            tags: [],
            createdAt: Date.parse(a.updatedAt) || Date.now(),
            updatedAt: Date.parse(a.updatedAt) || Date.now(),
            syncState: 'synced',
            cloudUserId: userId,
            cloudOnly: true,
          }, { quiet: true });
        }
        const pendingDeletes = new Set(read(DELETED_KEY, []));
        for (const a of local) {
          // Only items synced to this same account; another account's items on a shared device stay
          if (a.syncState === 'synced' && a.cloudUserId === userId && !cloud.has(a.id) && !pendingDeletes.has(a.id)) {
            // Deleted on another device
            const { deleteAsset } = await import('./assetStore');
            await deleteAsset(a.id);
          }
        }
        setStatus({ used: list.data.used, quota: list.data.quota, full, error: null });
      } else if (last) {
        setStatus({ used: last.used, quota: last.quota, full });
      }
      window.dispatchEvent(new CustomEvent(ASSETS_EVENT, { detail: { fromCloud: true } }));
    } catch (err) {
      setStatus({ error: 'offline' });
    }
  })().finally(() => {
    running = null;
  });
  return running;
}

/** Downloads one file of an item made on another device, and keeps it on this device. */
export async function downloadAssetPart(record, part) {
  const userId = currentAccount();
  const supabase = getSupabaseBrowser();
  if (!userId || !supabase) return null;
  const path = assetStoragePath(userId, record.id, part === 'preview' ? 'preview' : 'main', record.ext);
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  const fresh = (await getAsset(record.id)) || record;
  const blob = part === 'main' ? new Blob([data], { type: record.mime || data.type }) : data;
  const next = part === 'main' ? { ...fresh, mainBlob: blob, cloudOnly: false } : { ...fresh, previewBlob: blob };
  await putAssetRecord(next, { quiet: part !== 'main' });
  return blob;
}
