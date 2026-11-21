'use client';
// The words for guide mode, per calculator: numbered "How to use" steps, the help line under each box, and which
// boxes take a formula. They live in src/app/data/calcGuides/unitN.js (one file per unit, keyed by method id) and
// load only when someone turns Guide on, so the normal calculator downloads none of this text.
import React, { useEffect, useState } from 'react';
import { methodById } from '@/app/data/methods';
import { useGuide } from './calcDemo';

const LOADERS = {
  1: () => import('@/app/data/calcGuides/unit1'),
  2: () => import('@/app/data/calcGuides/unit2'),
  3: () => import('@/app/data/calcGuides/unit3'),
  4: () => import('@/app/data/calcGuides/unit4'),
  5: () => import('@/app/data/calcGuides/unit5'),
  6: () => import('@/app/data/calcGuides/unit6'),
  7: () => import('@/app/data/calcGuides/unit7'),
  8: () => import('@/app/data/calcGuides/unit8'),
  9: () => import('@/app/data/calcGuides/unit9'),
  10: () => import('@/app/data/calcGuides/unit10'),
  11: () => import('@/app/data/calcGuides/unit11'),
  12: () => import('@/app/data/calcGuides/unit12'),
  13: () => import('@/app/data/calcGuides/unit13'),
  14: () => import('@/app/data/calcGuides/unit14'),
  15: () => import('@/app/data/calcGuides/unit15'),
};
const cache = new Map();

/** Loads one method's guide: { howTo: [], help: { key: text }, maths: [keys] }, or null if it has none. */
export async function loadGuide(id) {
  const unit = methodById(id)?.unit;
  if (!LOADERS[unit]) return null;
  if (!cache.has(unit)) cache.set(unit, LOADERS[unit]().then((m) => m.default).catch(() => ({})));
  return (await cache.get(unit))[id] || null;
}

/** The method's guide while guide mode is on; null when it is off or still loading. */
export function useCalcGuide(id) {
  const on = useGuide();
  const [guide, setGuide] = useState(null);
  useEffect(() => {
    if (!on || !id) return undefined;
    let live = true;
    loadGuide(id).then((g) => { if (live) setGuide(g); });
    return () => { live = false; };
  }, [on, id]);
  return on ? guide : null;
}

/**
 * Light markup for the guide words: `code` for what to type and **bold** for the words to look for.
 * Anything that is already JSX is returned as it is.
 */
export function rich(text) {
  if (typeof text !== 'string') return text;
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

/* ---------------- Plain-words step text ---------------- */
// The calculators' working steps come from the engines with a title and maths. Where an engine has no sentence of its
// own, src/app/data/stepTexts/unitN.js gives one per step title (matched by the start of the title). Loaded always,
// one small file per unit, the first time a page shows its working.

const TEXT_LOADERS = {
  1: () => import('@/app/data/stepTexts/unit1'),
  2: () => import('@/app/data/stepTexts/unit2'),
  3: () => import('@/app/data/stepTexts/unit3'),
  4: () => import('@/app/data/stepTexts/unit4'),
  5: () => import('@/app/data/stepTexts/unit5'),
  6: () => import('@/app/data/stepTexts/unit6'),
  7: () => import('@/app/data/stepTexts/unit7'),
  8: () => import('@/app/data/stepTexts/unit8'),
  9: () => import('@/app/data/stepTexts/unit9'),
  10: () => import('@/app/data/stepTexts/unit10'),
  11: () => import('@/app/data/stepTexts/unit11'),
  12: () => import('@/app/data/stepTexts/unit12'),
  13: () => import('@/app/data/stepTexts/unit13'),
  14: () => import('@/app/data/stepTexts/unit14'),
  15: () => import('@/app/data/stepTexts/unit15'),
};
const textCache = new Map();

export async function loadStepTexts(id) {
  const unit = methodById(id)?.unit;
  if (!TEXT_LOADERS[unit]) return null;
  if (!textCache.has(unit)) textCache.set(unit, TEXT_LOADERS[unit]().then((m) => m.default).catch(() => ({})));
  return (await textCache.get(unit))[id] || null;
}

/** The method's step sentences (or null until loaded). */
export function useStepTexts(id) {
  const [texts, setTexts] = useState(null);
  useEffect(() => {
    let live = true;
    loadStepTexts(id).then((t) => { if (live) setTexts(t); });
    return () => { live = false; };
  }, [id]);
  return texts;
}

/** Adds the sentence to every step that has none, matching the longest title start that fits. */
export function withStepText(steps, texts) {
  if (!Array.isArray(steps) || !texts) return steps;
  const keys = Object.keys(texts).sort((a, b) => b.length - a.length);
  return steps.map((s) => {
    if (!s || s.text) return s;
    const key = keys.find((k) => String(s.title || '').startsWith(k));
    return key ? { ...s, text: texts[key] } : s;
  });
}
