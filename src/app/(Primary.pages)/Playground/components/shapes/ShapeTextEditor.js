'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { textArea, FONT_STACKS, LINE_HEIGHT, textColor } from '../../utils/shapes/shapeText';

/**
 * Typing inside a shape, as in Word: a text field laid exactly over the shape's text area,
 * turned with the shape, in the shape's font, size, colour and alignment. Escape, or a press
 * outside, finishes. The shape's own text is hidden meanwhile, so nothing shows twice.
 */
export default function ShapeTextEditor({ shape, zoomLevel, panOffset, darkPage, caret = null, onChange, onDone }) {
  const fieldRef = useRef(null);
  const text = shape.text || {};
  const area = textArea(shape);
  const size = (text.size || 16) * zoomLevel;

  // The cursor starts at the end of the existing text, or where a symbol was just inserted
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const at = caret === null ? el.value.length : Math.min(caret, el.value.length);
    el.setSelectionRange(at, at);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The field is as tall as its text, so the text area can align it top, middle or bottom
  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  });

  const centreX = (shape.x + shape.w / 2) * zoomLevel + panOffset.x;
  const centreY = (shape.y + shape.h / 2) * zoomLevel + panOffset.y;
  const justify = text.valign === 'middle' ? 'center' : text.valign === 'bottom' ? 'flex-end' : 'flex-start';

  return (
    <div
      className="absolute z-30 pointer-events-none"
      data-shape-text-editor={shape.id}
      style={{
        left: centreX - (shape.w * zoomLevel) / 2,
        top: centreY - (shape.h * zoomLevel) / 2,
        width: shape.w * zoomLevel,
        height: shape.h * zoomLevel,
        transform: `rotate(${shape.rot || 0}deg)`,
        transformOrigin: 'center',
      }}
    >
      <div
        className="absolute flex flex-col pointer-events-auto"
        style={{ left: area.x * zoomLevel, top: area.y * zoomLevel, width: area.w * zoomLevel, height: area.h * zoomLevel, justifyContent: justify }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <textarea
          ref={fieldRef}
          value={text.value || ''}
          rows={1}
          spellCheck
          aria-label="Shape text"
          onChange={(e) => onChange(e.target.value)}
          onBlur={onDone}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              onDone();
            }
          }}
          className="block w-full p-0 m-0 border-0 bg-transparent outline-none resize-none overflow-hidden"
          style={{
            fontFamily: FONT_STACKS[text.font] || FONT_STACKS.sans,
            fontSize: size,
            fontWeight: text.bold ? 700 : 400,
            fontStyle: text.italic ? 'italic' : 'normal',
            textDecoration: text.underline ? 'underline' : 'none',
            lineHeight: LINE_HEIGHT,
            color: textColor(text, darkPage),
            caretColor: textColor(text, darkPage),
            textAlign: text.align || 'center',
            whiteSpace: text.wrap === false ? 'pre' : 'pre-wrap',
          }}
        />
      </div>
    </div>
  );
}
