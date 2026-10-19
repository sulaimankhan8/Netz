'use client';

import { useEffect, useRef } from 'react';
import { applyActivity, PROGRESS_EVENT } from './progress/engine';

/**
 * Tells NETZ that the student did something that may finish a task (NETZ_LAUNCH_PLAN.md 2.6).
 * Safe to call anywhere on the client; the progress toast and the robot listen for the result.
 *
 *   recordActivity('solver.run', { method: 'bisection', unit: 1, fn: 'x^3-4x-9' })
 *   recordActivity('quiz.correct', { noteId, blockId })
 */
export function recordActivity(kind, details = {}) {
  if (typeof window === 'undefined') return [];
  try {
    const { events } = applyActivity(kind, details);
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { kind, events } }));
    return events;
  } catch {
    // Progress must never break the page that reported it
    return [];
  }
}

/** True once the person has clicked, tapped or typed on this page (false on a fresh load). */
function hasUserActed() {
  const ua = typeof navigator !== 'undefined' ? navigator.userActivation : null;
  return ua ? ua.hasBeenActive : true;
}

function isEmpty(value) {
  if (value === null || value === undefined || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  // Some interpolation pages put their input-error message in the same state as the answer
  if (typeof value === 'string' && /^(please|error|invalid|could not)\b/i.test(value.trim())) return true;
  return false;
}

/**
 * Records a solve each time a solver's answer changes to a new, non-empty value. Answers shown on
 * page load (before the person has done anything) are not counted.
 *
 * @param {string} method   catalog method id, e.g. 'bisection'
 * @param {number} unit     1 to 5
 * @param {*} answer        the solver's result state
 * @param {() => object} [getDetails]  extra details read when the answer changes (function input, points…)
 */
export function useRecordSolve(method, unit, answer, getDetails) {
  const detailsRef = useRef(getDetails);
  detailsRef.current = getDetails;

  useEffect(() => {
    if (isEmpty(answer) || !hasUserActed()) return;
    let extra = {};
    try {
      extra = detailsRef.current ? detailsRef.current() || {} : {};
    } catch {
      extra = {};
    }
    recordActivity('solver.run', { method, unit, ...extra });
  }, [answer, method, unit]);
}
