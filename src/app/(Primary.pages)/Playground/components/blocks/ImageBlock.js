'use client';

import React, { useState, useEffect, memo } from 'react';

/**
 * ImageBlock Component
 * Displays an inserted or pasted image on the canvas.
 * Supports editable titles/captions in Edit Mode and clean, textless rendering when empty in View Mode.
 */
function ImageBlock({
  block,
  onUpdateContent,
  isEditing,
}) {
  const [caption, setCaption] = useState(block.content?.caption || '');
  const imageUrl = block.content?.imageUrl || '';

  useEffect(() => {
    if (block.content?.caption !== undefined) {
      setCaption(block.content.caption);
    }
  }, [block.content?.caption]);

  const handleCaptionChange = (newVal) => {
    setCaption(newVal);
    if (onUpdateContent) {
      onUpdateContent(block.blockId, { caption: newVal });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1 rounded-xl bg-transparent select-none overflow-hidden">
      {/* Image Preview */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={caption || 'Attached diagram'}
          className="w-full h-full object-contain rounded-lg pointer-events-none select-none"
        />
      ) : (
        <div className="p-8 text-center text-xs text-pg-text2">
          No image attached.
        </div>
      )}

      {/* Title / Caption Field */}
      {isEditing ? (
        <input
          type="text"
          value={caption}
          onChange={(e) => handleCaptionChange(e.target.value)}
          placeholder="Add title or caption (optional)..."
          className="mt-1.5 w-full px-2 py-1 text-center text-xs rounded-lg bg-pg-tray border border-pg-line text-pg-ink placeholder-pg-text2/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-accent focus:border-pg-accent"
        />
      ) : (
        caption.trim() !== '' && (
          <span className="mt-1 text-pg-cap text-pg-text2 font-medium italic text-center truncate max-w-full px-1">
            {caption}
          </span>
        )
      )}
    </div>
  );
}

// Memoized: panning and zooming the page do not draw it again
export default memo(ImageBlock);
