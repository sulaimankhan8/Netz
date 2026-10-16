'use client';

import React, { useState, useEffect } from 'react';

/**
 * ImageBlock Component
 * Displays an inserted or pasted image on the canvas.
 * Supports editable titles/captions in Edit Mode and clean, textless rendering when empty in View Mode.
 */
export default function ImageBlock({
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
        <div className="p-8 text-center text-xs text-zinc-400">
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
          className="mt-1.5 w-full px-2 py-1 text-center text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        caption.trim() !== '' && (
          <span className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium italic text-center truncate max-w-full px-1">
            {caption}
          </span>
        )
      )}
    </div>
  );
}
