'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { expandCompactLatex } from '../../utils/equations/latexNormalize';

// MathLive is loaded the first time an equation is edited, never with the page
let mathlivePromise = null;
function loadMathLive() {
  if (!mathlivePromise) {
    mathlivePromise = import('mathlive').then((m) => {
      const { MathfieldElement } = m;
      // Fonts are served by the app (public/mathlive/fonts), so editing works offline; no sounds
      MathfieldElement.fontsDirectory = '/mathlive/fonts';
      MathfieldElement.soundsDirectory = null;
      return m;
    });
    mathlivePromise.catch(() => {
      mathlivePromise = null;
    });
  }
  return mathlivePromise;
}

/**
 * The visual equation editor (MathLive), as in WPS Office: you edit the equation as it looks,
 * with boxes to fill in; it reads and writes LaTeX. On touch screens it brings its own maths
 * keyboard. While it loads, or if it cannot load, the caller's LaTeX field is used instead.
 *
 * Ref: { insert(latex), focus() } - insert takes LaTeX with #? for each box to fill in.
 */
const MathEditor = forwardRef(function MathEditor({ value, onChange, onDone, onFailed, autoFocus = true }, ref) {
  const fieldRef = useRef(null);
  const [state, setState] = useState('loading'); // 'loading' | 'ready' | 'failed'
  const latestValue = useRef(value);
  latestValue.current = value;
  const handlers = useRef({ onChange, onDone });
  handlers.current = { onChange, onDone };
  // What the field last reported, written out in the long form the rest of the app reads
  // (rac{1}{2}, not rac12). That value coming back is not pushed into the field again,
  // which would move the cursor.
  const emitted = useRef(null);
  const emit = (raw) => {
    const latex = expandCompactLatex(raw);
    emitted.current = latex;
    handlers.current.onChange(latex);
  };

  useImperativeHandle(ref, () => ({
    insert(latex) {
      const mf = fieldRef.current;
      if (!mf || state !== 'ready') return false;
      mf.focus();
      mf.insert(latex, { insertionMode: 'replaceSelection', selectionMode: 'placeholder', format: 'latex' });
      emit(mf.value);
      return true;
    },
    focus() {
      if (fieldRef.current) fieldRef.current.focus();
    },
  }), [state]);

  useEffect(() => {
    let alive = true;
    loadMathLive()
      .then(() => {
        if (!alive) return;
        setState('ready');
      })
      .catch(() => {
        if (!alive) return;
        setState('failed');
        if (onFailed) onFailed();
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once the element exists: its value, its events, the cursor
  useEffect(() => {
    if (state !== 'ready') return undefined;
    const mf = fieldRef.current;
    if (!mf) return undefined;
    mf.smartSuperscript = true; // after one digit the cursor leaves the exponent, so x^2-1 types as written
    mf.smartFence = true;
    mf.defaultMode = 'math';
    if (mf.value !== latestValue.current) mf.value = latestValue.current || '';
    const handleInput = () => emit(mf.value);
    const handleKey = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handlers.current.onDone();
      }
      // The Playground's single-key tool shortcuts must not act while typing maths
      e.stopPropagation();
    };
    mf.addEventListener('input', handleInput);
    mf.addEventListener('keydown', handleKey);
    if (autoFocus) {
      mf.focus();
      mf.executeCommand && mf.executeCommand('moveToMathfieldEnd');
    }
    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('keydown', handleKey);
    };
  }, [state, autoFocus]);

  // A value changed from outside (an undo) reaches the field
  useEffect(() => {
    const mf = fieldRef.current;
    if (state !== 'ready' || !mf || value === emitted.current) return;
    if (expandCompactLatex(mf.value) !== value) mf.value = value || '';
  }, [value, state]);

  if (state === 'failed') return null;
  return (
    <div className="relative" data-math-editor={state}>
      {state === 'loading' && <div className="px-3 min-h-[52px] flex items-center rounded-xl bg-pg-paper border border-pg-line text-pg-label text-pg-text2">Loading the equation editor…</div>}
      {state === 'ready' && (
        <math-field
          ref={fieldRef}
          aria-label="Equation"
          data-math-field
          style={{ display: 'block', width: '100%', minHeight: 52, fontSize: 22, padding: '8px 12px', borderRadius: 12, border: '1px solid rgb(var(--pg-line))', background: 'rgb(var(--pg-paper))', color: 'rgb(var(--pg-ink))' }}
        />
      )}
    </div>
  );
});

export default MathEditor;
