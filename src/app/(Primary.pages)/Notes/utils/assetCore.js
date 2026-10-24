/**
 * Rules for the Notes Studio Assets library (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 2b):
 * which files may go in, how big they may be, and how much each student may keep in the cloud.
 * Pure, so test_asset_store.mjs checks it in Node and the server route uses the same numbers.
 */

const MB = 1024 * 1024;

/** Largest single item of each kind. */
export const ASSET_MAX_BYTES = { board: 10 * MB, image: 15 * MB, file: 25 * MB };

/**
 * Cloud storage per student. Owner decision still open (NETZ_OWNER_TODO.md): these are the
 * starting values, sized for Supabase's free 1 GB of file storage.
 */
export const FREE_ASSET_BYTES = 50 * MB;
export const PRO_ASSET_BYTES = 1024 * MB;

export function assetQuota(pro) {
  return pro ? PRO_ASSET_BYTES : FREE_ASSET_BYTES;
}

/** On this device the library may hold more than the cloud copy (the browser's own space). */
export const DEVICE_ASSET_BYTES = 500 * MB;

export const ASSET_KINDS = ['board', 'image', 'file'];

const IMAGE_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

const FILE_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  rtf: 'application/rtf',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  tex: 'application/x-tex',
  json: 'application/json',
  zip: 'application/zip',
  netz: 'application/json',
  heic: 'image/heic',
  heif: 'image/heif',
};

/** Never taken, whatever they are called: they could run as a web page or a program. */
const BLOCKED_EXT = new Set(['html', 'htm', 'xhtml', 'xht', 'shtml', 'js', 'mjs', 'cjs', 'exe', 'msi', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'jar', 'apk', 'app', 'dll', 'scr', 'com', 'hta', 'php', 'svgz']);

export const ACCEPT_ATTR = [...Object.keys(IMAGE_TYPES), ...Object.keys(FILE_TYPES)].map((e) => `.${e}`).join(',');

const TEXT_EXT = new Set(['txt', 'md', 'csv', 'tex', 'json', 'netz', 'rtf']);
const ZIP_EXT = new Set(['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'zip']);
const OLE_EXT = new Set(['doc', 'xls', 'ppt']);

export function extensionOf(name) {
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(String(name || ''));
  return m ? m[1].toLowerCase() : '';
}

const startsWith = (bytes, sig, at = 0) => sig.every((b, i) => bytes[at + i] === b);
const asText = (bytes) => {
  let s = '';
  for (let i = 0; i < Math.min(bytes.length, 512); i++) s += String.fromCharCode(bytes[i]);
  return s;
};
const looksLikeWebPage = (bytes) => /^\s*(<!doctype\s+html|<html[\s>]|<script[\s>]|<head[\s>]|<body[\s>]|<iframe[\s>])/i.test(asText(bytes).replace(/^﻿|^\xEF\xBB\xBF/, ''));

/**
 * Decides what a picked file is, from its name and its first bytes (at least 16 of them).
 * @returns {{ ok: true, kind: 'image'|'file', mime: string, ext: string } | { ok: false, error: string }}
 */
export function classifyUpload(name, bytes) {
  const ext = extensionOf(name);
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (!ext || BLOCKED_EXT.has(ext)) return { ok: false, error: 'This kind of file cannot go in the library.' };

  if (IMAGE_TYPES[ext]) {
    const ok =
      (ext === 'png' && startsWith(b, [0x89, 0x50, 0x4e, 0x47])) ||
      ((ext === 'jpg' || ext === 'jpeg') && startsWith(b, [0xff, 0xd8, 0xff])) ||
      (ext === 'gif' && startsWith(b, [0x47, 0x49, 0x46, 0x38])) ||
      (ext === 'webp' && startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8)) ||
      (ext === 'svg' && /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!doctype svg[^>]*>\s*)?<svg[\s>]/i.test(asText(b).replace(/^﻿|^\xEF\xBB\xBF/, '')));
    return ok ? { ok: true, kind: 'image', mime: IMAGE_TYPES[ext], ext } : { ok: false, error: `This file is not a real .${ext} picture.` };
  }

  if (!FILE_TYPES[ext]) return { ok: false, error: 'This kind of file cannot go in the library.' };
  if (looksLikeWebPage(b)) return { ok: false, error: 'Web pages cannot go in the library.' };
  let ok = true;
  if (ext === 'pdf') ok = startsWith(b, [0x25, 0x50, 0x44, 0x46]);
  else if (ZIP_EXT.has(ext)) ok = startsWith(b, [0x50, 0x4b, 0x03, 0x04]) || startsWith(b, [0x50, 0x4b, 0x05, 0x06]);
  else if (OLE_EXT.has(ext)) ok = startsWith(b, [0xd0, 0xcf, 0x11, 0xe0]);
  else if (TEXT_EXT.has(ext)) ok = !b.slice(0, 512).includes(0);
  return ok ? { ok: true, kind: 'file', mime: FILE_TYPES[ext], ext } : { ok: false, error: `This file is not a real .${ext} file.` };
}

/** Whether one more item of `bytes` fits: its own size limit, then the total. */
export function checkAssetSize(kind, bytes, usedBytes, quotaBytes) {
  const max = ASSET_MAX_BYTES[kind] || ASSET_MAX_BYTES.file;
  if (bytes > max) return { ok: false, error: `That is over ${Math.round(max / MB)} MB, the most one ${kind === 'board' ? 'board' : kind === 'image' ? 'picture' : 'file'} can be.` };
  if (usedBytes + bytes > quotaBytes) return { ok: false, error: `The library is full (${formatBytes(quotaBytes)}). Delete something first.`, full: true };
  return { ok: true };
}

export function formatBytes(n) {
  const v = Math.max(0, Number(n) || 0);
  if (v < 1024) return `${v} B`;
  if (v < MB) return `${Math.round(v / 1024)} KB`;
  if (v < 1024 * MB) return `${(v / MB).toFixed(v < 10 * MB ? 1 : 0)} MB`;
  return `${(v / (1024 * MB)).toFixed(1)} GB`;
}

/** Short type label for a file card: PDF, DOCX, … */
export function typeLabel(asset) {
  if (!asset) return '';
  if (asset.kind === 'board') return 'Board';
  if (asset.kind === 'image') return 'Image';
  return (extensionOf(asset.title) || (asset.mime || '').split('/').pop() || 'File').toUpperCase().slice(0, 6);
}

/** The path of an asset's files in the storage bucket. */
export function assetStoragePath(userId, assetId, part, ext = '') {
  const safe = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, '');
  return part === 'preview' ? `${safe(userId)}/${safe(assetId)}/preview.webp` : `${safe(userId)}/${safe(assetId)}/main${ext ? `.${safe(ext)}` : ''}`;
}

export const ASSET_ID_RE = /^ast_[A-Za-z0-9_-]{6,60}$/;

export function newAssetId() {
  return `ast_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
