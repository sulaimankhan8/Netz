/**
 * Undo / Redo History Stack for the Playground page
 *
 * Holds whole-page snapshots ({ strokes, blocks, links, shapes }). Snapshots share their stroke, block and shape
 * objects by reference (those are never mutated in place), so a snapshot costs three array
 * references rather than a copy of the page.
 *
 *   commit(snapshot)  record a new state; clears the redo side
 *   undo() / redo()   step back / forward and return the snapshot to apply (null at either end)
 *   reset(snapshot)   start a fresh history from this state (page switch, session restore)
 */

// Same array, or both empty (an empty page can be represented by different empty arrays)
function sameList(a, b) {
  return a === b || (Array.isArray(a) && Array.isArray(b) && a.length === 0 && b.length === 0);
}

export function isSameSnapshot(a, b) {
  return Boolean(a && b) && sameList(a.strokes, b.strokes) && sameList(a.blocks, b.blocks) && sameList(a.links, b.links) && sameList(a.shapes || [], b.shapes || []);
}

export function createHistoryStack(limit = 100) {
  let past = [];
  let future = [];
  let current = null;

  return {
    reset(snapshot) {
      past = [];
      future = [];
      current = snapshot;
    },

    /** @returns {boolean} true when a new undo step was recorded */
    commit(snapshot) {
      if (current && isSameSnapshot(current, snapshot)) return false;
      if (current) {
        past.push(current);
        if (past.length > limit) past.shift();
      }
      future = [];
      current = snapshot;
      return true;
    },

    undo() {
      if (past.length === 0) return null;
      future.push(current);
      current = past.pop();
      return current;
    },

    redo() {
      if (future.length === 0) return null;
      past.push(current);
      current = future.pop();
      return current;
    },

    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    current: () => current,
  };
}
