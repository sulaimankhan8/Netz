/**
 * Smart Block Command/Delta State Store
 * Manages Smart Blocks, Block Links, and Command/Delta Undo/Redo stack.
 * Bypasses 5MB localStorage caps by persisting workspace sessions to IndexedDB.
 */

const INDEXEDDB_DB_NAME = 'NETZ_PLAYGROUND_DB';
const INDEXEDDB_STORE_NAME = 'sessions';
// Version 2 (handoff C4): each page is its own record, so a save writes only the pages that changed
const PAGES_STORE_NAME = 'pages';
const DB_VERSION = 2;
const SESSION_BACKUP_KEY = 'NETZ_PLAYGROUND_SESSION_BACKUP';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    let request;
    try {
      request = window.indexedDB.open(INDEXEDDB_DB_NAME, DB_VERSION);
    } catch (err) {
      reject(err);
      return;
    }
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(INDEXEDDB_STORE_NAME)) db.createObjectStore(INDEXEDDB_STORE_NAME, { keyPath: 'sessionId' });
      if (!db.objectStoreNames.contains(PAGES_STORE_NAME)) db.createObjectStore(PAGES_STORE_NAME, { keyPath: 'key' });
    };
    request.onerror = () => reject(request.error || new Error('IndexedDB could not be opened'));
    request.onblocked = () => reject(new Error('IndexedDB is blocked by another tab'));
    request.onsuccess = (e) => resolve(e.target.result);
  });
}

const pageKey = (sessionId, pageId) => `${sessionId}:${pageId}`;

/**
 * What was last written for each page, per session: its title and a shallow copy of each of its lists.
 * Strokes, blocks and shapes are never changed in place (a change makes a new object), but a list can
 * grow in place (the canvas appends new ink to its own array), so the lists are compared item by item.
 * That finds the changed pages without reading points or serialising anything.
 */
const written = new Map();
const LISTS = ['strokes', 'blocks', 'links', 'shapes'];
const pageSignature = (page) => ({ title: page.title, boardId: page.boardId, ...Object.fromEntries(LISTS.map((k) => [k, Array.isArray(page[k]) ? page[k].slice() : page[k]])) });
const sameList = (a, b) => (Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((v, i) => v === b[i]) : a === b);
const sameSignature = (a, b) => Boolean(a && b) && a.title === b.title && a.boardId === b.boardId && LISTS.every((k) => sameList(a[k], b[k]));

/**
 * Splits a session into its index (everything but the pages, plus the page order) and its pages,
 * and saves the index with only the pages that changed, in one transaction (all or nothing).
 * Pages that are gone are deleted. An old single-record save is replaced by the index.
 *
 * @returns {Promise<void>} Resolves once the write is committed; rejects if the database cannot
 * be opened (blocked, switched off) or the write fails (full, aborted). Rejects at once where
 * there is no IndexedDB.
 */
export async function saveSessionToIndexedDB(sessionId, sessionData) {
  const db = await openDb();
  const updatedAt = sessionData.updatedAt || Date.now();
  const pages = Array.isArray(sessionData.pages) ? sessionData.pages : [];
  const pageIds = pages.map((p, i) => String(p.id || `page_${i + 1}`));
  const before = written.get(sessionId) || new Map();
  const current = Number.isInteger(sessionData.currentPageIndex) ? sessionData.currentPageIndex : -1;
  // The page being worked on is always written; the others only when they changed
  const changed = pages.map((p, i) => [pageIds[i], p, i]).filter(([id, p, i]) => i === current || !sameSignature(before.get(id), pageSignature(p)));
  const removed = [...before.keys()].filter((id) => !pageIds.includes(id));
  const { pages: _omit, ...rest } = sessionData;

  await new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([INDEXEDDB_STORE_NAME, PAGES_STORE_NAME], 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('The save failed'));
      tx.onabort = () => reject(tx.error || new Error('The save was aborted'));
      const pagesStore = tx.objectStore(PAGES_STORE_NAME);
      changed.forEach(([id, page]) => pagesStore.put({ key: pageKey(sessionId, id), sessionId, pageId: id, page, updatedAt }));
      removed.forEach((id) => pagesStore.delete(pageKey(sessionId, id)));
      tx.objectStore(INDEXEDDB_STORE_NAME).put({ sessionId, ...rest, version: DB_VERSION, pageIds, updatedAt });
    } catch (err) {
      reject(err);
    }
  });
  // Only now, with the write committed, do these pages count as saved
  written.set(sessionId, new Map(pages.map((p, i) => [pageIds[i], pageSignature(p)])));
}

/** Forget what was written (tests, and after the stored copy may have been replaced elsewhere). */
export function forgetWrittenPages(sessionId) {
  if (sessionId) written.delete(sessionId);
  else written.clear();
}

/**
 * Saves a session to both stores with one timestamp: IndexedDB (no practical size limit) and
 * the localStorage backup (read synchronously on start-up, capped at about 5 MB).
 * A backup that no longer fits is removed, so an old copy can never be mistaken for the latest.
 *
 * onStored(ok, error): called once IndexedDB, the real store, has the session (ok) or has failed.
 *
 * @returns {boolean} Whether the localStorage backup was written
 */
export function saveSession(sessionId, sessionData, { onStored } = {}) {
  const stamped = { ...sessionData, updatedAt: Date.now() };
  saveSessionToIndexedDB(sessionId, stamped).then(
    () => onStored && onStored(true, null),
    (err) => onStored && onStored(false, err)
  );
  if (typeof localStorage === 'undefined') return false;

  // A session that cannot fit is not serialised at all: turning 10 MB into text only to have
  // the write refused freezes the page for a noticeable moment after every change.
  const estimate = estimateSessionChars(stamped);
  if (estimate > backupState.limitChars) {
    removeSessionBackup();
    return false;
  }

  try {
    localStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify(stamped));
    return true;
  } catch (e) {
    // This browser's real limit is lower than assumed: remember it, so the next save does not try again
    // (never below a size that is cheap to try: a refusal can also mean storage is switched off)
    backupState.limitChars = Math.max(MIN_BACKUP_LIMIT_CHARS, Math.min(backupState.limitChars, Math.floor(estimate * 0.9)));
    removeSessionBackup();
    return false;
  }
}

/**
 * Largest session (estimated characters) still offered to localStorage. Browsers allow about
 * 5 MB per site, counted differently from one to the next, so this starts below that and is
 * lowered to what the browser actually accepts the first time a write is refused.
 */
export const backupState = { limitChars: 4000000 };
const MIN_BACKUP_LIMIT_CHARS = 200000;

const CHARS_PER_POINT = 110; // measured on saved ink: coordinates, pressure, timestamp, pointer type
const CHARS_PER_STROKE = 160; // id, colour, width, tool, bounding box
const CHARS_PER_BLOCK = 300;
const CHARS_PER_SHAPE = 400; // id, preset, box, rotation, fill, outline (measured: 280 to 340 per shape, before text)

function stringChars(value, depth = 0) {
  if (typeof value === 'string') return value.length + 2;
  if (typeof value === 'number' || typeof value === 'boolean') return 12;
  if (!value || depth > 6) return 4;
  let total = 2;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) total += stringChars(value[i], depth + 1) + 1;
    return total;
  }
  for (const key in value) total += key.length + 4 + stringChars(value[key], depth + 1);
  return total;
}

/**
 * Rough size of a session once written as JSON, without writing it. Ink is counted by its
 * points; blocks by their content (pictures and recordings are long text).
 */
export function estimateSessionChars(session) {
  if (!session || !Array.isArray(session.pages)) return 0;
  let total = 200;
  for (let p = 0; p < session.pages.length; p++) {
    const page = session.pages[p] || {};
    const strokes = page.strokes || [];
    for (let i = 0; i < strokes.length; i++) {
      total += CHARS_PER_STROKE + ((strokes[i].points && strokes[i].points.length) || 0) * CHARS_PER_POINT;
    }
    const blocks = page.blocks || [];
    for (let i = 0; i < blocks.length; i++) total += CHARS_PER_BLOCK + stringChars(blocks[i].content);
    total += ((page.links && page.links.length) || 0) * 150;
    const shapes = page.shapes || [];
    for (let i = 0; i < shapes.length; i++) total += CHARS_PER_SHAPE + ((shapes[i].text && shapes[i].text.value) || '').length;
  }
  // The active page's blocks are also stored at the top level
  const topBlocks = session.blocks || [];
  for (let i = 0; i < topBlocks.length; i++) total += CHARS_PER_BLOCK + stringChars(topBlocks[i].content);
  return total;
}

function removeSessionBackup() {
  try {
    localStorage.removeItem(SESSION_BACKUP_KEY);
  } catch (e) {}
}

/** The synchronous localStorage copy of the session, or null. */
export function readSessionBackup() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_BACKUP_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return isUsableSession(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
}

export function isUsableSession(session) {
  return Boolean(session && Array.isArray(session.pages) && session.pages.length > 0);
}

/**
 * Of two saved copies of a session, the one saved last. Copies written before timestamps
 * existed count as oldest; on a tie the first argument wins.
 */
export function pickNewerSession(first, second) {
  const firstOk = isUsableSession(first);
  const secondOk = isUsableSession(second);
  if (!firstOk) return secondOk ? second : null;
  if (!secondOk) return first;
  return (second.updatedAt || 0) > (first.updatedAt || 0) ? second : first;
}

/**
 * Loads a saved session. The callback is always called exactly once: with the session,
 * or with null when there is none (first visit) or storage is unavailable. Callers rely on
 * that to know loading has finished. Reads both the per-page saves and an old single record.
 */
export function loadSessionFromIndexedDB(sessionId, callback) {
  let called = false;
  const done = (value) => {
    if (called) return;
    called = true;
    if (callback) callback(value);
  };
  openDb().then((db) => {
    try {
      const tx = db.transaction([INDEXEDDB_STORE_NAME, PAGES_STORE_NAME], 'readonly');
      const getReq = tx.objectStore(INDEXEDDB_STORE_NAME).get(sessionId);
      getReq.onerror = () => done(null);
      getReq.onsuccess = () => {
        const record = getReq.result || null;
        // An old save keeps its pages inside the record; the next save converts it
        if (!record || Array.isArray(record.pages) || !Array.isArray(record.pageIds)) {
          done(record);
          return;
        }
        const ids = record.pageIds;
        const pages = new Array(ids.length).fill(null);
        let left = ids.length;
        if (!left) {
          done(null);
          return;
        }
        const pagesStore = tx.objectStore(PAGES_STORE_NAME);
        ids.forEach((id, i) => {
          const r = pagesStore.get(pageKey(sessionId, id));
          r.onsuccess = () => {
            pages[i] = r.result ? r.result.page : null;
            left -= 1;
            if (left === 0) {
              const { pageIds: _ids, version: _v, ...rest } = record;
              const found = pages.filter(Boolean);
              // These pages are what is stored now
              written.set(sessionId, new Map(found.map((p) => [String(p.id), pageSignature(p)])));
              done(found.length ? { ...rest, pages: found } : null);
            }
          };
          r.onerror = () => done(null);
        });
      };
    } catch (err) {
      done(null);
    }
  }, () => done(null));
}

export const INITIAL_SMART_BLOCK_STATE = {
  blocks: [],
  links: [],
  history: [], // Stack of Command Deltas
  historyIndex: -1,
};

export function smartBlockReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION': {
      return {
        ...state,
        blocks: action.payload.blocks || [],
        links: action.payload.links || [],
      };
    }

    case 'ADD_BLOCK': {
      const newBlocks = [...state.blocks, action.payload];
      return {
        ...state,
        blocks: newBlocks,
        history: [...state.history.slice(0, state.historyIndex + 1), { type: 'ADD_BLOCK', payload: action.payload }],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'REMOVE_BLOCK': {
      const blockId = action.payload;
      const targetBlock = state.blocks.find((b) => b.blockId === blockId);
      const newBlocks = state.blocks.filter((b) => b.blockId !== blockId);
      const newLinks = state.links.filter((l) => l.sourceBlockId !== blockId && l.targetBlockId !== blockId);

      return {
        ...state,
        blocks: newBlocks,
        links: newLinks,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          { type: 'REMOVE_BLOCK', payload: { block: targetBlock, links: state.links } },
        ],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'UPDATE_BLOCK_POSITION': {
      const { blockId, position } = action.payload;
      const newBlocks = state.blocks.map((b) =>
        b.blockId === blockId ? { ...b, position } : b
      );

      return {
        ...state,
        blocks: newBlocks,
      };
    }

    case 'UPDATE_BLOCK_SIZE': {
      const { blockId, size } = action.payload;
      const newBlocks = state.blocks.map((b) =>
        b.blockId === blockId ? { ...b, size } : b
      );

      return {
        ...state,
        blocks: newBlocks,
      };
    }

    case 'UPDATE_BLOCK_CONTENT': {
      const { blockId, content } = action.payload;
      const newBlocks = state.blocks.map((b) =>
        b.blockId === blockId ? { ...b, content: { ...b.content, ...content } } : b
      );

      return {
        ...state,
        blocks: newBlocks,
      };
    }

    case 'LINK_BLOCKS': {
      const { sourceBlockId, targetBlockId, type = 'equation-to-graph', color = '#3B82F6' } = action.payload;
      const linkId = `link_${sourceBlockId}_${targetBlockId}`;

      // Check if link already exists
      if (state.links.some((l) => l.linkId === linkId)) return state;

      const newLink = { linkId, sourceBlockId, targetBlockId, type, color };
      const newLinks = [...state.links, newLink];

      // Update linkedBlockIds on blocks
      const newBlocks = state.blocks.map((b) => {
        if (b.blockId === sourceBlockId && !b.linkedBlockIds.includes(targetBlockId)) {
          return { ...b, linkedBlockIds: [...b.linkedBlockIds, targetBlockId] };
        }
        if (b.blockId === targetBlockId && !b.linkedBlockIds.includes(sourceBlockId)) {
          return { ...b, linkedBlockIds: [...b.linkedBlockIds, sourceBlockId] };
        }
        return b;
      });

      return {
        ...state,
        blocks: newBlocks,
        links: newLinks,
      };
    }

    case 'UNLINK_BLOCKS': {
      const { linkId } = action.payload;
      const targetLink = state.links.find((l) => l.linkId === linkId);
      if (!targetLink) return state;

      const newLinks = state.links.filter((l) => l.linkId !== linkId);
      const newBlocks = state.blocks.map((b) => {
        if (b.blockId === targetLink.sourceBlockId) {
          return { ...b, linkedBlockIds: b.linkedBlockIds.filter((id) => id !== targetLink.targetBlockId) };
        }
        if (b.blockId === targetLink.targetBlockId) {
          return { ...b, linkedBlockIds: b.linkedBlockIds.filter((id) => id !== targetLink.sourceBlockId) };
        }
        return b;
      });

      return {
        ...state,
        blocks: newBlocks,
        links: newLinks,
      };
    }

    default:
      return state;
  }
}
