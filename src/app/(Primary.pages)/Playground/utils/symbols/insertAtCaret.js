/**
 * Where an inserted symbol goes: the text field that had the cursor before the Symbol button
 * was pressed (pressing a toolbar button takes the focus away, so the field and its cursor are
 * remembered at the press). Browser only.
 */

export function isTextField(el) {
  if (!el || el.readOnly || el.disabled) return false;
  if (el.tagName === 'TEXTAREA') return true;
  return el.tagName === 'INPUT' && /^(text|search|url|email|)$/i.test(el.type || '');
}

/**
 * The field that has the cursor now, with its selection, or null.
 * latex: the field holds an equation (symbols go in as LaTeX commands).
 * shapeId: the field is the text of a shape.
 */
export function captureTextTarget() {
  if (typeof document === 'undefined') return null;
  const el = document.activeElement;
  // The visual equation editor (MathLive): symbols go in as LaTeX at its own cursor
  if (el && el.tagName === 'MATH-FIELD') return { el, mathField: true, latex: true, shapeId: null, start: 0, end: 0 };
  if (!isTextField(el)) return null;
  const shapeEditor = el.closest('[data-shape-text-editor]');
  return {
    el,
    start: el.selectionStart ?? el.value.length,
    end: el.selectionEnd ?? el.value.length,
    latex: Boolean(el.closest('[data-latex-input]')),
    shapeId: shapeEditor ? shapeEditor.getAttribute('data-shape-text-editor') : null,
  };
}

/** Text with `insert` put in place of the selection. Returns the new value and cursor position. */
export function spliceText(value, start, end, insert) {
  const from = Math.max(0, Math.min(start, value.length));
  const to = Math.max(from, Math.min(end, value.length));
  return { value: value.slice(0, from) + insert + value.slice(to), caret: from + insert.length };
}

/**
 * Types `text` into a remembered field at its remembered cursor, the way typing would (so a
 * React-controlled field sees the change), and puts the cursor after it.
 * Returns the target moved on past the insert (for the next symbol), or null when the field is gone.
 */
export function insertIntoField(target, text) {
  const el = target && target.el;
  if (!el || !el.isConnected) return null;
  if (target.mathField) {
    el.focus();
    el.insert(text, { insertionMode: 'replaceSelection', selectionMode: 'after', format: 'latex' });
    // Programmatic changes do not announce themselves: the block listens for this to save
    el.dispatchEvent(new Event('input', { bubbles: true }));
    // The editor takes the focus a moment later than a text field does; the menu that was used
    // closes meanwhile and would leave the focus nowhere, so it is given back once more
    setTimeout(() => {
      if (el.isConnected) el.focus();
    }, 50);
    return target;
  }
  const { value, caret } = spliceText(el.value, target.start, target.end, text);
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.focus({ preventScroll: true });
  try {
    el.setSelectionRange(caret, caret);
  } catch (e) {}
  return { ...target, start: caret, end: caret };
}
