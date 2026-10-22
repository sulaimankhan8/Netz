'use client';

import { useEffect, useRef } from 'react';

/**
 * Each solver page shares its current inputs here, so the method page's Export menu can turn them into
 * code without touching the calculator. One line per page, next to useRecordSolve:
 *
 *   useCodeExportInputs('bisection', () => ({ f: functionInput, tol: tolerance }));
 *
 * The getter runs after each render, when every input is set.
 */

export const EXPORT_INPUTS_EVENT = 'netz:export-inputs';
let latest = { method: null, raw: null };

export function useCodeExportInputs(method, getRaw) {
  const getter = useRef(getRaw);
  getter.current = getRaw;
  const last = useRef('');

  useEffect(() => {
    let raw = null;
    try {
      raw = getter.current();
    } catch {
      raw = null;
    }
    const key = JSON.stringify(raw);
    if (key === last.current && latest.method === method) return;
    last.current = key;
    latest = { method, raw };
    window.dispatchEvent(new CustomEvent(EXPORT_INPUTS_EVENT, { detail: latest }));
  });

  useEffect(() => () => {
    if (latest.method === method) latest = { method: null, raw: null };
  }, [method]);
}

/** The inputs the open solver page shares now: { method, raw }. */
export const currentExportInputs = () => latest;

/** Interpolation tables ({ x, y } rows) as x and y lists, leaving out empty rows. */
export function rowsToXY(rows) {
  const filled = (rows || []).filter((r) => r && String(r.x ?? '').trim() !== '');
  return { x: filled.map((r) => r.x), y: filled.map((r) => r.y) };
}
