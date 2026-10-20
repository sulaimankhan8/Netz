/**
 * What the hub remembers on this device (plan Q5): the last method opened and how far through its
 * worked example, which methods are done, and whether the person prefers every step shown at once.
 * Stored in localStorage['netz.methods']; every read and write survives a blocked storage.
 */

const KEY = 'netz.methods';
const EVENT = 'netz-methods-change';

function read() {
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function write(next) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or full storage: progress just isn't kept
  }
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // not in a browser
  }
}

export function getProgress() {
  const p = read();
  return {
    last: p.last && typeof p.last.route === 'string' ? p.last : null,
    done: p.done && typeof p.done === 'object' ? p.done : {},
    showAll: p.showAll === true,
  };
}

export function rememberVisit(route, step, total) {
  const p = read();
  write({ ...p, last: { route, step, total, at: Date.now() } });
}

export function markDone(route) {
  const p = read();
  if (p.done && p.done[route]) return;
  write({ ...p, done: { ...(p.done || {}), [route]: true } });
}

export function setShowAll(showAll) {
  const p = read();
  write({ ...p, showAll: !!showAll });
}

export function onProgressChange(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
