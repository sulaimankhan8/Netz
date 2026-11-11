'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { LuCrop, LuReplace, LuCheck, LuX } from 'react-icons/lu';
import { prepareImage } from '../../utils/imageSizing';
import { TOUCH_TARGET } from '../ui/Dialog';

const MIN = 0.05; // the smallest crop: 5% of the picture each way
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** The block's new size for a picture of `aspect` (width / height): same width, at most 600 tall. */
function sizeFor(size, aspect) {
  const width = Math.max(80, Math.round(size?.width || 320));
  let w = width;
  let h = Math.round(w / aspect);
  if (h > 600) {
    h = 600;
    w = Math.max(80, Math.round(h * aspect));
  }
  return { width: w, height: h };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The picture could not be read.'));
    img.src = src;
  });
}

/**
 * A picture on the page (handoff C8). While editing: a caption, Crop (drag the box or its corners,
 * then Apply) and Replace (pick another picture; the caption and place stay). Both are one undo step.
 */
function ImageBlock({ block, onUpdateContent, onResize, isEditing }) {
  const [caption, setCaption] = useState(block.content?.caption || '');
  const [crop, setCrop] = useState(null); // { x, y, w, h } as fractions of the picture while cropping
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const imageUrl = block.content?.imageUrl || '';
  const aspect = block.content?.aspectRatio || 4 / 3;
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (block.content?.caption !== undefined) setCaption(block.content.caption);
  }, [block.content?.caption]);
  // Leaving edit mode cancels a crop in progress
  useEffect(() => {
    if (!isEditing) setCrop(null);
  }, [isEditing]);

  const handleCaptionChange = (newVal) => {
    setCaption(newVal);
    onUpdateContent?.(block.blockId, { caption: newVal });
  };

  const storePicture = async (dataUrl) => {
    const image = await prepareImage(dataUrl);
    onUpdateContent?.(block.blockId, { imageUrl: image.dataUrl, aspectRatio: image.aspectRatio });
    onResize?.(block.blockId, sizeFor(block.size, image.aspectRatio));
  };

  const applyCrop = async () => {
    if (!crop) return;
    setBusy(true);
    setProblem('');
    try {
      const img = await loadImage(imageUrl);
      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;
      const sx = Math.round(crop.x * nw);
      const sy = Math.round(crop.y * nh);
      const sw = Math.max(1, Math.round(crop.w * nw));
      const sh = Math.max(1, Math.round(crop.h * nh));
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      await storePicture(canvas.toDataURL('image/png'));
      setCrop(null);
    } catch (e) {
      setProblem('The picture could not be cropped.');
    } finally {
      setBusy(false);
    }
  };

  const onPickFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setProblem('');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await storePicture(String(reader.result));
      } catch (err) {
        setProblem('That picture could not be read.');
      } finally {
        setBusy(false);
      }
    };
    reader.onerror = () => {
      setProblem('That picture could not be read.');
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  /* Dragging the crop box ('move') or one of its corners ('nw', 'ne', 'sw', 'se') */
  const startDrag = (mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { mode, start: { x: e.clientX, y: e.clientY }, box: crop };
  };
  const onDrag = (e) => {
    const d = dragRef.current;
    if (!d) return;
    e.stopPropagation();
    const r = frameRef.current.getBoundingClientRect();
    const dx = (e.clientX - d.start.x) / r.width;
    const dy = (e.clientY - d.start.y) / r.height;
    const b = d.box;
    if (d.mode === 'move') {
      setCrop({ ...b, x: clamp01(Math.min(b.x + dx, 1 - b.w)), y: clamp01(Math.min(b.y + dy, 1 - b.h)) });
      return;
    }
    let { x, y, w, h } = b;
    if (d.mode.includes('w')) {
      const nx = clamp01(Math.min(b.x + dx, b.x + b.w - MIN));
      w = b.w + (b.x - nx);
      x = nx;
    }
    if (d.mode.includes('e')) w = Math.max(MIN, Math.min(1 - b.x, b.w + dx));
    if (d.mode.includes('n')) {
      const ny = clamp01(Math.min(b.y + dy, b.y + b.h - MIN));
      h = b.h + (b.y - ny);
      y = ny;
    }
    if (d.mode.includes('s')) h = Math.max(MIN, Math.min(1 - b.y, b.h + dy));
    setCrop({ x, y, w, h });
  };
  const endDrag = (e) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    dragRef.current = null;
  };

  const tool = `h-8 ${TOUCH_TARGET} px-2.5 flex items-center gap-1.5 rounded-lg text-pg-cap font-semibold transition-colors disabled:opacity-40`;
  const stop = (e) => e.stopPropagation();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1 rounded-xl bg-transparent select-none overflow-hidden">
      {imageUrl && crop ? (
        // While cropping, the picture fills a box of its own shape so the crop maps straight onto it
        <div className="flex-1 min-h-0 w-full flex items-center justify-center" onPointerDown={stop}>
          <div ref={frameRef} className="relative max-w-full max-h-full touch-none" style={{ aspectRatio: String(aspect), height: '100%' }} data-image-crop>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full rounded-lg pointer-events-none" />
            <div
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] cursor-move"
              style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
              onPointerDown={startDrag('move')}
              onPointerMove={onDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              data-crop-box
            >
              {['nw', 'ne', 'sw', 'se'].map((c) => (
                <span
                  key={c}
                  role="presentation"
                  onPointerDown={startDrag(c)}
                  onPointerMove={onDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  data-crop-handle={c}
                  className={`absolute w-6 h-6 [@media(pointer:coarse)]:w-9 [@media(pointer:coarse)]:h-9 -m-3 [@media(pointer:coarse)]:-m-[18px] flex items-center justify-center ${c.includes('n') ? 'top-0' : 'bottom-0'} ${c.includes('w') ? 'left-0' : 'right-0'} ${c === 'nw' || c === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize'}`}
                >
                  <span className="w-3.5 h-3.5 rounded-sm bg-white border-2 border-pg-accent" />
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={caption || 'Attached diagram'} className="flex-1 min-h-0 w-full object-contain rounded-lg pointer-events-none select-none" />
      ) : (
        <div className="p-8 text-center text-xs text-pg-text2">No image attached.</div>
      )}

      {isEditing && (
        <div className="mt-1.5 w-full flex flex-col gap-1.5" onPointerDown={stop}>
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {crop ? (
              <>
                <button type="button" onClick={applyCrop} disabled={busy} className={`${tool} bg-pg-accent-fill text-white hover:bg-pg-accent-fill/90`} data-crop-apply>
                  <LuCheck className="w-3.5 h-3.5" aria-hidden="true" /> Apply crop
                </button>
                <button type="button" onClick={() => setCrop(null)} disabled={busy} className={`${tool} bg-pg-tray text-pg-ink hover:bg-pg-line`}>
                  <LuX className="w-3.5 h-3.5" aria-hidden="true" /> Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })} disabled={busy || !imageUrl} className={`${tool} bg-pg-tray text-pg-ink hover:bg-pg-line`} data-image-crop-start>
                  <LuCrop className="w-3.5 h-3.5" aria-hidden="true" /> Crop
                </button>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className={`${tool} bg-pg-tray text-pg-ink hover:bg-pg-line`} data-image-replace>
                  <LuReplace className="w-3.5 h-3.5" aria-hidden="true" /> Replace
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} aria-label="Replace the picture" />
              </>
            )}
          </div>
          {problem && <p role="alert" className="text-center text-pg-cap text-pg-danger">{problem}</p>}
          {!crop && (
            <input
              type="text"
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="Add title or caption (optional)..."
              className="w-full px-2 py-1 text-center text-xs rounded-lg bg-pg-tray border border-pg-line text-pg-ink placeholder-pg-text2/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-accent focus:border-pg-accent"
            />
          )}
        </div>
      )}
      {!isEditing && caption.trim() !== '' && (
        <span className="mt-1 text-pg-cap text-pg-text2 font-medium italic text-center truncate max-w-full px-1">{caption}</span>
      )}
    </div>
  );
}

// Memoized: panning and zooming the page do not draw it again
export default memo(ImageBlock);
