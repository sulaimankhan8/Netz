/**
 * Smart Block Command/Delta State Store
 * Manages Smart Blocks, Block Links, and Command/Delta Undo/Redo stack.
 * Bypasses 5MB localStorage caps by persisting workspace sessions to IndexedDB.
 */

const INDEXEDDB_DB_NAME = 'NETZ_PLAYGROUND_DB';
const INDEXEDDB_STORE_NAME = 'sessions';
const SESSION_BACKUP_KEY = 'NETZ_PLAYGROUND_SESSION_BACKUP';

// IndexedDB Helper
export function saveSessionToIndexedDB(sessionId, sessionData) {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  const request = window.indexedDB.open(INDEXEDDB_DB_NAME, 1);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(INDEXEDDB_STORE_NAME)) {
      db.createObjectStore(INDEXEDDB_STORE_NAME, { keyPath: 'sessionId' });
    }
  };

  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction(INDEXEDDB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(INDEXEDDB_STORE_NAME);
    store.put({ sessionId, ...sessionData, updatedAt: sessionData.updatedAt || Date.now() });
  };
}

/**
 * Saves a session to both stores with one timestamp: IndexedDB (no practical size limit) and
 * the localStorage backup (read synchronously on start-up, capped at about 5 MB).
 * A backup that no longer fits is removed, so an old copy can never be mistaken for the latest.
 *
 * @returns {boolean} Whether the localStorage backup was written
 */
export function saveSession(sessionId, sessionData) {
  const stamped = { ...sessionData, updatedAt: Date.now() };
  saveSessionToIndexedDB(sessionId, stamped);
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
 * that to know loading has finished.
 */
export function loadSessionFromIndexedDB(sessionId, callback) {
  if (typeof window === 'undefined' || !window.indexedDB) {
    if (callback) callback(null);
    return;
  }

  const request = window.indexedDB.open(INDEXEDDB_DB_NAME, 1);
  request.onerror = () => {
    if (callback) callback(null);
  };
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(INDEXEDDB_STORE_NAME)) {
      db.createObjectStore(INDEXEDDB_STORE_NAME, { keyPath: 'sessionId' });
    }
  };

  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction(INDEXEDDB_STORE_NAME, 'readonly');
    const store = tx.objectStore(INDEXEDDB_STORE_NAME);
    const getReq = store.get(sessionId);

    getReq.onsuccess = () => {
      if (callback) callback(getReq.result || null);
    };
    getReq.onerror = () => {
      if (callback) callback(null);
    };
  };
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
