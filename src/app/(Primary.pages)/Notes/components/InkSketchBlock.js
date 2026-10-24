'use client';

import { useState, useRef, useEffect } from 'react';
import { LuDownload, LuEraser, LuImage, LuImport, LuPenLine, LuTrash2, LuUpload } from 'react-icons/lu';
import { BTN_MAIN, BTN_QUIET, BTN_SECONDARY, ICON_BTN, TOUCH } from './ui';
import { safeImageSrc } from '../utils/importSafety';

export default function InkSketchBlock({ block, onUpdate, menuButton = null }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [color, setColor] = useState('#6366f1'); // default indigo
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEditing, setIsEditing] = useState(!block?.content);
  const [whiteboardMsg, setWhiteboardMsg] = useState(null);

  const colors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Dark/White', value: '#1e293b' }
  ];

  // Initialize canvas when entering editing mode
  useEffect(() => {
    if (!isEditing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If existing content is an image dataURL, draw it onto canvas
    if (block?.content && block.content.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = block.content;
    }
  }, [isEditing]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && e.pointerId) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  };

  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onUpdate({
      ...block,
      content: dataUrl,
      caption: block.caption || 'Figure: Handwritten math calculation'
    });
    setIsEditing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        onUpdate({
          ...block,
          content: dataUrl,
          caption: block.caption || `Figure: ${file.name.replace(/\.[^/.]+$/, '')}`
        });
        setIsEditing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImportFromWhiteboard = () => {
    setWhiteboardMsg(null);
    let clip = '';
    if (typeof window !== 'undefined') {
      clip = localStorage.getItem('netz_pending_ink_clip') || '';
      if (!clip) {
        // Check for playground state snapshot
        const pgData = localStorage.getItem('netz_playground_session_state') || localStorage.getItem('netz_notes_v2_data');
        if (pgData && pgData.includes('data:image')) {
          const match = pgData.match(/data:image\/[a-zA-Z]+;base64,[^"\']+/);
          if (match) clip = match[0];
        }
      }
    }

    if (clip) {
      onUpdate({
        ...block,
        content: clip,
        caption: block.caption || 'Figure: Whiteboard canvas selection'
      });
      setIsEditing(false);
      setWhiteboardMsg('Brought in the drawing from the Playground.');
    } else {
      setWhiteboardMsg('No drawing waiting in the Playground. Draw there and send it, or draw on the pad here.');
      setTimeout(() => setWhiteboardMsg(null), 4000);
    }
  };

  const handleDownloadImage = () => {
    if (!block?.content) return;
    const link = document.createElement('a');
    link.download = `${(block.caption || 'handwritten-sketch').toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = block.content;
    link.click();
  };

  // Every picture is shown through <img>, which never runs script, even inside an SVG
  const figureSrc = safeImageSrc(block?.content);
  const hasFigure = Boolean(figureSrc);

  return (
    <div className={`my-2 rounded-2xl border bg-nt-surface text-nt-ink ${isEditing ? 'border-nt-sketch ring-[3px] ring-nt-sketch-tint' : 'border-nt-line'}`}>
      {/* Header: type and tools */}
      <div className="flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 min-h-[56px]">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-nt-sketch-tint text-nt-sketch" aria-hidden="true">
          <LuPenLine className="w-4 h-4" />
        </span>
        <span className="text-[13px] font-semibold text-nt-sketch shrink-0">Sketch</span>
        <span className="flex-1" />
        {!isEditing && block?.content ? (
          <>
            <button type="button" onClick={handleDownloadImage} className={ICON_BTN} aria-label="Download as PNG" title="Download as PNG">
              <LuDownload className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setIsEditing(true)} className={`${BTN_SECONDARY} !h-9 !px-3`}>
              Edit
            </button>
          </>
        ) : isEditing ? null : (
          <button type="button" onClick={() => setIsEditing(true)} className={`${BTN_SECONDARY} !h-9 !px-3`}>
            Draw
          </button>
        )}
        {menuButton}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {isEditing ? (
          <>
            {/* Tools */}
            <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Drawing tools">
              <div className="flex p-1 gap-0.5 rounded-xl bg-nt-tray">
                <button
                  type="button"
                  onClick={() => setIsEraser(false)}
                  aria-pressed={!isEraser}
                  aria-label="Pen"
                  title="Pen"
                  className={`${ICON_BTN} !w-9 !h-9 ${!isEraser ? '!bg-nt-ink !text-nt-on-ink' : ''}`}
                >
                  <LuPenLine className="w-[18px] h-[18px]" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEraser(true)}
                  aria-pressed={isEraser}
                  aria-label="Eraser"
                  title="Eraser"
                  className={`${ICON_BTN} !w-9 !h-9 ${isEraser ? '!bg-nt-ink !text-nt-on-ink' : ''}`}
                >
                  <LuEraser className="w-[18px] h-[18px]" aria-hidden="true" />
                </button>
              </div>

              {!isEraser && (
                <>
                  <span aria-hidden="true" className="w-px h-6 bg-nt-line mx-1" />
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      aria-label={c.name}
                      aria-pressed={color === c.value}
                      title={c.name}
                      className={`w-9 h-9 ${TOUCH} shrink-0 flex items-center justify-center rounded-full`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-black/10 dark:border-white/20"
                        style={{
                          backgroundColor: c.value,
                          boxShadow: color === c.value ? '0 0 0 2px rgb(var(--nt-surface)), 0 0 0 4px rgb(var(--nt-ink))' : undefined
                        }}
                      />
                    </button>
                  ))}
                </>
              )}

              <span aria-hidden="true" className="w-px h-6 bg-nt-line mx-1" />
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setStrokeWidth(size)}
                  aria-pressed={strokeWidth === size}
                  aria-label={size === 2 ? 'Thin' : size === 4 ? 'Medium' : 'Thick'}
                  title={size === 2 ? 'Thin' : size === 4 ? 'Medium' : 'Thick'}
                  className={`${ICON_BTN} !w-9 !h-9 ${strokeWidth === size ? '!bg-nt-tray !text-nt-ink' : ''}`}
                >
                  <span aria-hidden="true" className="rounded-full bg-current" style={{ width: size + 4, height: size + 4 }} />
                </button>
              ))}

              <span className="flex-1" />
              <button type="button" onClick={handleClearCanvas} className={`${ICON_BTN} !text-nt-danger hover:!bg-nt-danger-tint`} aria-label="Clear the drawing" title="Clear the drawing">
                <LuTrash2 className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
            </div>

            {/* Drawing pad */}
            <div className="relative w-full h-64 sm:h-72 rounded-xl bg-white border-[1.5px] border-dashed border-nt-line overflow-hidden cursor-crosshair touch-none">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                aria-label="Drawing pad"
                className="w-full h-full block"
              />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-[#55555A] whitespace-nowrap">
                Draw here with a finger, pen or mouse
              </span>
            </div>

            {/* Save, bring a picture in, cancel */}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleSaveDrawing} className={BTN_MAIN}>
                Save sketch
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,.svg" onChange={handleFileUpload} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={BTN_SECONDARY}>
                <LuUpload className="w-4 h-4" aria-hidden="true" />
                Upload image
              </button>
              <button type="button" onClick={handleImportFromWhiteboard} className={BTN_SECONDARY} title="Bring in the latest drawing from the Playground">
                <LuImport className="w-4 h-4" aria-hidden="true" />
                From Playground
              </button>
              <span className="flex-1" />
              <button type="button" onClick={() => setIsEditing(false)} className={BTN_QUIET}>
                Cancel
              </button>
            </div>

            {whiteboardMsg && (
              <p className="m-0 text-sm text-nt-text2" role="status">
                {whiteboardMsg}
              </p>
            )}
          </>
        ) : (
          /* The finished figure */
          <>
            <div className="flex items-center justify-center p-4 rounded-xl bg-white min-h-[160px] overflow-hidden">
              {hasFigure ? (
                <img src={figureSrc} alt={block.caption || 'Handwritten mathematical sketch'} className="max-h-80 max-w-full object-contain rounded" />
              ) : (
                <div className="text-center py-6 text-sm text-[#55555A] flex flex-col items-center gap-2">
                  <LuImage className="w-8 h-8" aria-hidden="true" />
                  <p className="m-0">No drawing yet. Choose Draw, or upload an image.</p>
                </div>
              )}
            </div>

            <input
              type="text"
              value={block?.caption || ''}
              aria-label="Caption"
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              placeholder="Caption, e.g. Figure 1: tangent meets the x axis"
              className="w-full bg-transparent text-sm text-nt-text2 italic text-center outline-none placeholder:text-nt-muted border-b border-transparent focus:border-nt-line py-1"
            />
          </>
        )}
      </div>
    </div>
  );
}
