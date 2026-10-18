/*
 * Banner images a student uploads, kept on this device until accounts and file storage arrive
 * (NOTES_VISUAL_REDESIGN_PLAN.md, "Banner art, uploads and badges"). They live in IndexedDB,
 * not localStorage, so a few photos do not fill the notes' 5 MB. A note only keeps the image's
 * id (note.look.cover = { kind: 'image', value: id }).
 */

const DB_NAME = 'NETZ_NOTES_IMAGES';
const STORE = 'banners';
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 900;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

const urlCache = new Map();

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser cannot keep images.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Could not open the image store.'));
  });
}

async function withStore(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const result = fn(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(result && 'result' in result ? result.result : undefined);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Could not save the image.'));
    };
  });
}

/** Shrinks a picture to at most 1600 x 900 px and re-encodes it (JPEG, or PNG if it has see-through parts). */
async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not read this picture.'))), type, 0.85)
  );
}

/** Saves a picked file as a banner image; returns its id. Throws with a message to show. */
export async function saveBannerImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose a picture (JPG, PNG or WebP).');
  if (file.size > MAX_FILE_BYTES) throw new Error('That picture is over 15 MB. Choose a smaller one.');
  const blob = await shrink(file);
  const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await withStore('readwrite', (store) => store.put(blob, id));
  return id;
}

/** A URL to show a saved banner image, or null if it is not on this device. */
export async function getBannerImageUrl(id) {
  if (!id) return null;
  if (urlCache.has(id)) return urlCache.get(id);
  try {
    const blob = await withStore('readonly', (store) => store.get(id));
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlCache.set(id, url);
    return url;
  } catch {
    return null;
  }
}

/** Removes a banner image from this device. */
export async function deleteBannerImage(id) {
  if (!id) return;
  const url = urlCache.get(id);
  if (url) URL.revokeObjectURL(url);
  urlCache.delete(id);
  try {
    await withStore('readwrite', (store) => store.delete(id));
  } catch {
    // already gone
  }
}
