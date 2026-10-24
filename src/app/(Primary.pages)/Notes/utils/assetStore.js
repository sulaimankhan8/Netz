'use client';

/**
 * The Notes Studio Assets library on this device (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 2b),
 * and the Training data folder (step 4).
 *
 * IndexedDB `NETZ_NOTES_ASSETS`:
 *   assets   { id, kind: 'board'|'image'|'file', title, mime, ext, bytes, mainBlob, previewBlob,
 *              pageCount, width, height, tags, createdAt, updatedAt, syncState, cloudOnly }
 *   training { id, strokes, readText, alternatives, routing, acceptedText, edited, converted,
 *              device, pointerType, createdAt, updatedAt, bytes }
 *
 * Each item is two blobs: the thing itself (`mainBlob`; for a board, its pages as gzipped JSON)
 * and a small WebP preview. Blobs stay blobs here; base64 is only made for a .netz file.
 * Signed-in students also get a cloud copy (assetCloud.js).
 */

import { ASSET_MAX_BYTES, DEVICE_ASSET_BYTES, checkAssetSize, classifyUpload, newAssetId } from './assetCore';

const DB_NAME = 'NETZ_NOTES_ASSETS';
const DB_VERSION = 1;
export const ASSETS_EVENT = 'netz:assets-changed';
export const TRAINING_EVENT = 'netz:training-changed';

const IMAGE_MAX_SIDE = 2400;
const PREVIEW_WIDTH = 600;
const INLINE_PREVIEW_WIDTH = 360;
export const TRAINING_MAX_BYTES = 20 * 1024 * 1024;

// ── IndexedDB plumbing ───────────────────────────────────────────────────────

let dbPromise = null;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser cannot keep files.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('training')) db.createObjectStore('training', { keyPath: 'id' });
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error || new Error('Could not open the library.'));
    };
  });
  return dbPromise;
}

async function run(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const req = fn(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(req && 'result' in req ? req.result : undefined);
    tx.onerror = () => reject(tx.error || new Error('The library could not be saved. The device may be full.'));
    tx.onabort = () => reject(tx.error || new Error('The library could not be saved. The device may be full.'));
  });
}

const emit = (name, detail = {}) => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail }));
};

// ── Blob helpers ─────────────────────────────────────────────────────────────

export async function blobToBase64(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) binary += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK));
  return btoa(binary);
}

export function base64ToBlob(b64, mime = 'application/octet-stream') {
  const binary = atob(String(b64).replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export async function gzipText(textContent) {
  const blob = new Blob([textContent], { type: 'application/json' });
  if (typeof CompressionStream === 'undefined') return blob;
  return new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob().then((b) => new Blob([b], { type: 'application/gzip' }));
}

export async function gunzipText(blob) {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] === 0x1f && head[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
    return new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }
  return blob.text();
}

function canvasToBlob(canvas, type = 'image/webp', quality = 0.8) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) return resolve(b);
      // Safari before 17 cannot make WebP: fall back to JPEG
      canvas.toBlob((j) => (j ? resolve(j) : reject(new Error('Could not make a preview.'))), 'image/jpeg', quality);
    }, type, quality);
  });
}

/** Draws a source (bitmap, image or canvas) into a new canvas at most `maxW` wide (and `maxH` tall). */
export function scaledCanvas(source, maxW, maxH = Infinity, background = null) {
  const w = source.width || source.naturalWidth || 1;
  const h = source.height || source.naturalHeight || 1;
  const scale = Math.min(1, maxW / w, maxH / h);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function loadImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this picture.'));
    };
    img.src = url;
  });
}

/** A WebP preview (at most `width` px wide) of any picture blob. */
export async function previewOfImage(blob, width = PREVIEW_WIDTH) {
  const img = await loadImageFromBlob(blob);
  return canvasToBlob(scaledCanvas(img, width, width * 2, '#FFFFFF'), 'image/webp', 0.8);
}

/** First page of a PDF as a WebP preview, and its page count. Needs pdf.js (loaded on demand). */
export async function previewOfPdf(blob, width = PREVIEW_WIDTH) {
  const { renderPdfPage, openPdf } = await import('./pdfView');
  const pdf = await openPdf(blob);
  try {
    const canvas = await renderPdfPage(pdf, 1, width, { background: true });
    return { preview: await canvasToBlob(canvas, 'image/webp', 0.8), pageCount: pdf.numPages };
  } finally {
    pdf.destroy?.();
  }
}

// ── Reading ──────────────────────────────────────────────────────────────────

/** Every item in the library, newest first. Blobs come along as handles (cheap). */
export async function listAssets() {
  try {
    const all = (await run('assets', 'readonly', (s) => s.getAll())) || [];
    return all.filter((a) => !a.deletedAt).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    return [];
  }
}

export async function getAsset(id) {
  if (!id) return null;
  try {
    return (await run('assets', 'readonly', (s) => s.get(id))) || null;
  } catch {
    return null;
  }
}

export async function libraryBytes() {
  return (await listAssets()).reduce((sum, a) => sum + (a.bytes || 0), 0);
}

const urlCache = new Map(); // `${id}:${part}:${updatedAt}` → object URL

/** An object URL for an item's preview or main blob (downloaded from the cloud copy if needed). */
export async function assetUrl(id, part = 'preview') {
  let asset = await getAsset(id);
  if (!asset) return null;
  let blob = part === 'main' ? asset.mainBlob : asset.previewBlob;
  if (!blob && asset.cloudOnly) {
    const { downloadAssetPart } = await import('./assetCloud');
    blob = await downloadAssetPart(asset, part);
    if (!blob) return null;
    asset = (await getAsset(id)) || asset;
  }
  if (!blob) return null;
  const key = `${id}:${part}:${asset.updatedAt}`;
  if (urlCache.has(key)) return urlCache.get(key);
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}

/** The main blob of an item, from this device or the cloud copy. */
export async function assetMainBlob(id) {
  const asset = await getAsset(id);
  if (!asset) return null;
  if (asset.mainBlob) return asset.mainBlob;
  if (!asset.cloudOnly) return null;
  const { downloadAssetPart } = await import('./assetCloud');
  return downloadAssetPart(asset, 'main');
}

/** A board's pages (decompressed), or null. */
export async function readBoardPages(id) {
  const blob = await assetMainBlob(id);
  if (!blob) return null;
  try {
    const data = JSON.parse(await gunzipText(blob));
    return Array.isArray(data.pages) ? data : null;
  } catch {
    return null;
  }
}

/** A small preview as image data, kept inside a note's block so the note shows it anywhere. */
export async function inlinePreviewOf(asset) {
  if (!asset?.previewBlob) return '';
  try {
    const img = await loadImageFromBlob(asset.previewBlob);
    const blob = await canvasToBlob(scaledCanvas(img, INLINE_PREVIEW_WIDTH, INLINE_PREVIEW_WIDTH * 1.6, '#FFFFFF'), 'image/webp', 0.7);
    return blobToDataUrl(blob);
  } catch {
    return '';
  }
}

/** What a note block keeps about an item. */
export async function assetRefOf(asset) {
  return {
    id: asset.id,
    kind: asset.kind,
    title: asset.title,
    mime: asset.mime,
    bytes: asset.bytes,
    pageCount: asset.pageCount || 0,
    preview: await inlinePreviewOf(asset),
  };
}

// ── Writing ──────────────────────────────────────────────────────────────────

async function putAsset(record, { quiet = false } = {}) {
  await run('assets', 'readwrite', (s) => s.put(record));
  if (!quiet) emit(ASSETS_EVENT, { id: record.id });
  if (record.syncState === 'local') {
    import('./assetCloud').then((m) => m.syncAssetsSoon()).catch(() => {});
  }
  return record;
}

async function ensureRoom(kind, bytes, replacingBytes = 0) {
  const used = (await libraryBytes()) - replacingBytes;
  const check = checkAssetSize(kind, bytes, used, DEVICE_ASSET_BYTES);
  if (!check.ok) throw new Error(check.error);
}

/**
 * Saves a Playground board: its pages (strokes, blocks, shapes) and a preview of the open page.
 * With `assetId` of an existing board it updates that card instead of adding one.
 */
export async function saveBoardAsset({ title, pages, previewBlob, assetId = null }) {
  const existing = assetId ? await getAsset(assetId) : null;
  const mainBlob = await gzipText(JSON.stringify({ netz: 1, pages }));
  const bytes = mainBlob.size + (previewBlob?.size || 0);
  await ensureRoom('board', mainBlob.size, existing?.bytes || 0);
  const now = Date.now();
  const record = {
    ...(existing || {}),
    id: existing?.id || newAssetId(),
    kind: 'board',
    title: title || existing?.title || 'Board',
    mime: 'application/gzip',
    ext: 'json.gz',
    bytes,
    mainBlob,
    previewBlob: previewBlob || existing?.previewBlob || null,
    pageCount: pages.length,
    tags: existing?.tags || [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    syncState: 'local',
    cloudOnly: false,
  };
  return putAsset(record);
}

/** Adds a picked file (picture or document). Throws with a message to show. */
export async function addFileAsset(file, { tags = [] } = {}) {
  if (!file) throw new Error('No file was chosen.');
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const type = classifyUpload(file.name, head);
  if (!type.ok) throw new Error(type.error);
  if (file.size > ASSET_MAX_BYTES[type.kind]) {
    throw new Error(`That is over ${Math.round(ASSET_MAX_BYTES[type.kind] / 1048576)} MB, the most one ${type.kind === 'image' ? 'picture' : 'file'} can be.`);
  }

  let mainBlob = file;
  let previewBlob = null;
  let pageCount = 0;
  let width = 0;
  let height = 0;
  if (type.kind === 'image') {
    // Big photos are made smaller (sharp enough for notes); GIF and SVG are kept as they are
    if (type.ext !== 'gif' && type.ext !== 'svg') {
      const img = await loadImageFromBlob(file);
      width = img.naturalWidth;
      height = img.naturalHeight;
      if (Math.max(width, height) > IMAGE_MAX_SIDE) {
        const canvas = scaledCanvas(img, IMAGE_MAX_SIDE, IMAGE_MAX_SIDE);
        mainBlob = await canvasToBlob(canvas, type.ext === 'png' ? 'image/png' : 'image/jpeg', 0.88);
        width = canvas.width;
        height = canvas.height;
      }
    }
    previewBlob = await previewOfImage(mainBlob).catch(() => null);
  } else if (type.ext === 'pdf') {
    try {
      // A PDF that takes too long to draw still goes in, with an icon instead of a preview
      const out = await Promise.race([previewOfPdf(file), new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 10000))]);
      previewBlob = out.preview;
      pageCount = out.pageCount;
    } catch {
      previewBlob = null; // a damaged or locked PDF still goes in, with an icon
    }
  }

  const bytes = mainBlob.size + (previewBlob?.size || 0);
  await ensureRoom(type.kind, mainBlob.size);
  const now = Date.now();
  return putAsset({
    id: newAssetId(),
    kind: type.kind,
    title: file.name,
    mime: mainBlob.type || type.mime,
    ext: type.ext,
    bytes,
    mainBlob,
    previewBlob,
    pageCount,
    width,
    height,
    tags,
    createdAt: now,
    updatedAt: now,
    syncState: 'local',
    cloudOnly: false,
  });
}

/** Adds a picture made in the app (a canvas snapshot, a pasted image). */
export async function addImageBlob(blob, title = 'Picture', { tags = [], id = null } = {}) {
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  const file = new File([blob], /\.[a-z]+$/i.test(title) ? title : `${title}.${ext}`, { type: blob.type });
  const record = await addFileAsset(file, { tags });
  if (id && id !== record.id) {
    // Keep a known id (moving banner pictures in keeps the id their notes point to)
    await run('assets', 'readwrite', (s) => s.delete(record.id));
    return putAsset({ ...record, id });
  }
  return record;
}

export async function renameAsset(id, title) {
  const a = await getAsset(id);
  if (!a) return null;
  return putAsset({ ...a, title: String(title || '').slice(0, 200) || a.title, updatedAt: Date.now(), syncState: a.cloudOnly ? 'meta' : 'local' });
}

/** Deletes an item; returns the record so Undo can put it back. */
export async function deleteAsset(id) {
  const a = await getAsset(id);
  if (!a) return null;
  await run('assets', 'readwrite', (s) => s.delete(id));
  emit(ASSETS_EVENT, { id, deleted: true });
  import('./assetCloud').then((m) => m.forgetCloudAsset(a)).catch(() => {});
  return a;
}

export async function restoreAsset(record) {
  if (!record) return null;
  return putAsset({ ...record, syncState: 'local', updatedAt: Date.now() });
}

/** Stores a record as it is (used by the cloud copy for items made on another device). */
export async function putAssetRecord(record, opts) {
  return putAsset(record, opts);
}

// ── .netz files: items travel inside the file as base64 ──────────────────────

export async function embedAssets(ids) {
  const out = [];
  for (const id of [...new Set(ids)].filter(Boolean)) {
    const a = await getAsset(id);
    if (!a) continue;
    const main = await assetMainBlob(id);
    if (!main) continue;
    out.push({
      id: a.id,
      kind: a.kind,
      title: a.title,
      mime: a.mime,
      bytes: a.bytes,
      pageCount: a.pageCount || 0,
      preview: a.previewBlob ? await blobToDataUrl(a.previewBlob) : '',
      data: await blobToBase64(main),
    });
  }
  return out;
}

/**
 * Puts the items carried in a .netz file into this library, as new items.
 * @returns {Promise<Map<string,string>>} the file's id → the new id here
 */
export async function importEmbeddedAssets(embedded) {
  const map = new Map();
  for (const e of embedded || []) {
    try {
      const mainBlob = base64ToBlob(e.data, e.mime);
      if (e.kind !== 'board') {
        // A picture or document is checked again, like any upload
        const head = new Uint8Array(await mainBlob.slice(0, 1024).arrayBuffer());
        const type = classifyUpload(e.title, head);
        if (!type.ok || type.kind !== e.kind) continue;
      }
      if (mainBlob.size > (ASSET_MAX_BYTES[e.kind] || 0)) continue;
      const previewBlob = e.preview && e.preview.startsWith('data:image/') ? await (await fetch(e.preview)).blob() : null;
      await ensureRoom(e.kind, mainBlob.size);
      const now = Date.now();
      const record = await putAsset({
        id: newAssetId(),
        kind: e.kind,
        title: e.title,
        mime: e.mime,
        ext: e.kind === 'board' ? 'json.gz' : (/\.([a-z0-9]+)$/i.exec(e.title)?.[1] || '').toLowerCase(),
        bytes: mainBlob.size + (previewBlob?.size || 0),
        mainBlob,
        previewBlob,
        pageCount: e.pageCount || 0,
        tags: [],
        createdAt: now,
        updatedAt: now,
        syncState: 'local',
        cloudOnly: false,
      }, { quiet: true });
      map.set(e.id, record.id);
    } catch {
      // one bad item does not stop the rest
    }
  }
  if (map.size) emit(ASSETS_EVENT, {});
  return map;
}

// ── Banner pictures move into the library ────────────────────────────────────

const OLD_IMAGE_DB = 'NETZ_NOTES_IMAGES';

/**
 * Copies the banner pictures from the old image store into the library (same ids, tagged
 * 'banner'). The old store is deleted only when every picture made it.
 */
export async function moveBannersIntoLibrary() {
  if (typeof indexedDB === 'undefined') return 0;
  if (indexedDB.databases) {
    const dbs = await indexedDB.databases().catch(() => null);
    if (dbs && !dbs.some((d) => d.name === OLD_IMAGE_DB)) return 0;
  }
  const old = await new Promise((resolve) => {
    const req = indexedDB.open(OLD_IMAGE_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('banners');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  if (!old) return 0;
  const entries = await new Promise((resolve) => {
    try {
      const tx = old.transaction('banners', 'readonly');
      const store = tx.objectStore('banners');
      const keysReq = store.getAllKeys();
      const valsReq = store.getAll();
      tx.oncomplete = () => resolve((keysReq.result || []).map((k, i) => [k, valsReq.result[i]]));
      tx.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
  old.close();
  let moved = 0;
  let failed = 0;
  for (const [id, blob] of entries) {
    if (await getAsset(id)) {
      moved++;
      continue;
    }
    try {
      await addImageBlob(blob, 'Banner picture', { tags: ['banner'], id });
      moved++;
    } catch {
      failed++;
    }
  }
  if (failed === 0) {
    await new Promise((resolve) => {
      const del = indexedDB.deleteDatabase(OLD_IMAGE_DB);
      del.onsuccess = del.onerror = del.onblocked = () => resolve();
    });
  }
  return moved;
}

// ── Training data (every line read in Writing mode) ──────────────────────────

const deviceInfo = () => {
  if (typeof navigator === 'undefined') return {};
  return {
    userAgent: navigator.userAgent.slice(0, 200),
    screen: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
    dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  };
};

/** Saves one read line: its strokes, what was read, and the other readings. Returns its id. */
export async function addTrainingSample({ strokes, readText, alternatives = [], routing = null, pointerType = '' }) {
  const now = Date.now();
  const sample = {
    id: `trn_${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    strokes: (strokes || []).map((s) => ({ id: s.id, points: s.points, color: s.color, width: s.width, tool: s.tool })),
    readText: String(readText || ''),
    alternatives: (alternatives || []).slice(0, 8).map((a) => ({ value: a.value, type: a.type, score: a.score })),
    routing,
    acceptedText: null,
    edited: false,
    converted: false,
    device: deviceInfo(),
    pointerType,
    createdAt: now,
    updatedAt: now,
  };
  sample.bytes = JSON.stringify(sample).length;
  try {
    await run('training', 'readwrite', (s) => s.put(sample));
    await trimTraining();
    emit(TRAINING_EVENT, {});
    return sample.id;
  } catch {
    return null;
  }
}

/** Records what happened to a read line: converted as read, edited first, or left as ink. */
export async function updateTrainingSample(id, patch) {
  if (!id) return;
  try {
    const s = await run('training', 'readonly', (st) => st.get(id));
    if (!s) return;
    await run('training', 'readwrite', (st) => st.put({ ...s, ...patch, updatedAt: Date.now() }));
    emit(TRAINING_EVENT, {});
  } catch {
    // training data is best effort
  }
}

export async function listTrainingSamples() {
  try {
    const all = (await run('training', 'readonly', (s) => s.getAll())) || [];
    return all.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Keeps the folder under its size limit by dropping the oldest samples. */
async function trimTraining() {
  const all = await listTrainingSamples();
  let total = all.reduce((sum, s) => sum + (s.bytes || 0), 0);
  const drop = [];
  for (let i = all.length - 1; i >= 0 && total > TRAINING_MAX_BYTES; i--) {
    total -= all[i].bytes || 0;
    drop.push(all[i].id);
  }
  if (drop.length) await run('training', 'readwrite', (s) => drop.forEach((id) => s.delete(id)));
}

export async function clearTrainingSamples() {
  await run('training', 'readwrite', (s) => s.clear());
  emit(TRAINING_EVENT, {});
}

export async function deleteTrainingSample(id) {
  await run('training', 'readwrite', (s) => s.delete(id));
  emit(TRAINING_EVENT, {});
}

/**
 * The samples as JSONL, one line each, with the same fields as /Playground/collect
 * (HandwritingCollector.js), so benchmark_recognition.mjs and text-model training read them.
 * `text` is what the writer meant: what they accepted or typed, else what was read.
 */
export function trainingToJsonl(samples) {
  return samples
    .map((s) =>
      JSON.stringify({
        // The collector's fields (HandwritingCollector.js handleSave)
        id: s.id,
        text: s.acceptedText ?? s.readText,
        label: 'TEXT',
        category: 'line',
        strokes: s.strokes,
        pointerType: s.pointerType,
        writer: 'writing-mode',
        lineSpacing: 32,
        device: s.device,
        createdAt: new Date(s.createdAt).toISOString(),
        // Extra: what the model read and what the writer did with it
        source: 'writing-mode',
        confirmed: s.acceptedText !== null && s.acceptedText !== undefined,
        modelRead: s.readText,
        edited: s.edited,
        converted: s.converted,
        alternatives: s.alternatives,
        routing: s.routing,
      })
    )
    .join('\n');
}
