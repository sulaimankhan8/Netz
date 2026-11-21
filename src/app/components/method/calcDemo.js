'use client';
// Guide mode and the live Demo for every calculator card (CalcCard).
//
// Guide mode: one switch for the whole site, remembered in this browser. On: "How to use", the plain-words line
// under each box and "How to type maths" show. Off (the default): the calculator stays compact.
//
// Demo: as in the 2024 Newton forward demo, the page's own example is typed in one box at a time with a short pause
// between them, so people watch where each value goes; then Solve is pressed. It works on the card's DOM, so every
// calculator gets it without its own code: press the card's Reset, read the values Reset put back, empty the boxes,
// type each value back letter by letter, press the button marked data-solve.
import { useEffect, useRef, useSyncExternalStore } from 'react';

const GUIDE_KEY = 'netz_calc_guide';
const listeners = new Set();
let guideOn = null;

function readGuide() {
  if (guideOn === null) {
    try { guideOn = window.localStorage.getItem(GUIDE_KEY) === 'on'; } catch { guideOn = false; }
  }
  return guideOn;
}

export function setGuide(on) {
  guideOn = !!on;
  try { window.localStorage.setItem(GUIDE_KEY, guideOn ? 'on' : 'off'); } catch { /* private window: this visit only */ }
  listeners.forEach((l) => l());
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };

/** true while guide mode is on (always false on the server, so the first paint is the compact calculator). */
export function useGuide() {
  return useSyncExternalStore(subscribe, readGuide, () => false);
}

/* ---------------- Live demo ---------------- */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const valueSetter = {
  INPUT: Object.getOwnPropertyDescriptor(globalThis.HTMLInputElement?.prototype || {}, 'value')?.set,
  TEXTAREA: Object.getOwnPropertyDescriptor(globalThis.HTMLTextAreaElement?.prototype || {}, 'value')?.set,
};

/** Sets a React-controlled box the way typing does, so the page's own onChange runs. */
function typeInto(el, text) {
  valueSetter[el.tagName]?.call(el, text);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

const TYPED = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=date]), textarea';
const visible = (el) => !el.disabled && !el.readOnly && el.offsetParent !== null && !el.closest('[data-demo-skip]');

function boxesIn(card) {
  return [...card.querySelectorAll(TYPED)].filter(visible);
}

function highlight(el, on) {
  el.style.outline = on ? '3px solid #FFE600' : '';
  el.style.outlineOffset = on ? '2px' : '';
}

/**
 * Runs the demo inside one calculator card. state.stop() ends it early: the remaining boxes are filled at once and
 * nothing is solved. Returns when the demo is over.
 */
export async function runDemo(card, state) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const pause = (ms) => (reduced ? Promise.resolve() : wait(ms));

  // 1. Back to the page's example
  const reset = [...card.querySelectorAll('button')].find((b) => /\breset\b/i.test(b.textContent || ''));
  reset?.click();
  await wait(250);
  const boxes = boxesIn(card);
  const values = boxes.map((b) => b.value);
  if (!boxes.length) return;

  // 2. Empty every box, so it is clear what gets typed
  boxes.forEach((b) => typeInto(b, ''));
  await pause(450);

  // 3. One box at a time, letter by letter
  for (let i = 0; i < boxes.length; i += 1) {
    if (state.stopped) break;
    const el = boxes[i];
    const text = values[i];
    if (!el.isConnected) continue;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    highlight(el, true);
    if (reduced || !text) typeInto(el, text);
    else {
      // About 0.6 s per box whatever its length, never slower than 70 ms a letter
      const perLetter = Math.max(18, Math.min(70, 600 / text.length));
      for (let k = 1; k <= text.length; k += 1) {
        if (state.stopped) break;
        typeInto(el, text.slice(0, k));
        await wait(perLetter);
      }
    }
    highlight(el, false);
    await pause(300);
  }

  // Stopped: put every value back at once and leave it unsolved
  if (state.stopped) {
    boxes.forEach((b, i) => { if (b.isConnected) { highlight(b, false); typeInto(b, values[i]); } });
    return;
  }

  // 4. Solve, and bring the answer into view
  await pause(350);
  card.querySelector('[data-solve]')?.click();
  await wait(300);
  const result = card.querySelector('[data-result]');
  if (result) {
    const rr = result.getBoundingClientRect();
    if (rr.top > window.innerHeight * 0.8) result.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }
}

/* ---------------- Practice → calculator ---------------- */

export const LOAD_INPUT_EVENT = 'netz:load-input';

/**
 * "Solve it in the calculator" on a practice question: scrolls to the page's calculator and asks it to take these
 * inputs and solve (calculators listen with useLoadInput). values: the calculator's own box keys and text.
 */
export function loadIntoCalculator(values) {
  const card = document.querySelector('[data-calc-card]');
  card?.scrollIntoView({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  window.dispatchEvent(new CustomEvent(LOAD_INPUT_EVENT, { detail: { values } }));
}

/** A calculator takes inputs from "Solve it in the calculator": apply(values) fills its boxes and solves. */
export function useLoadInput(apply) {
  const ref = useRef(apply);
  ref.current = apply;
  useEffect(() => {
    const on = (e) => ref.current?.(e.detail?.values || {});
    window.addEventListener(LOAD_INPUT_EVENT, on);
    return () => window.removeEventListener(LOAD_INPUT_EVENT, on);
  }, []);
}

/**
 * For the original hand-written calculators, which solve from their state: after setting their boxes, press their own
 * solve button once React has re-rendered (the submit button, or one marked data-solve, in #calculator).
 */
export function solveSoon() {
  setTimeout(() => {
    const area = document.getElementById('calculator') || document;
    (area.querySelector('[data-solve]') || area.querySelector('form button[type="submit"]'))?.click();
  }, 150);
}
