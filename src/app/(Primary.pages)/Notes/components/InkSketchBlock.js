'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FaPen, 
  FaEraser, 
  FaTrash, 
  FaUpload, 
  FaDownload, 
  FaEdit, 
  FaCheck, 
  FaSyncAlt,
  FaFileImage,
  FaPalette
} from 'react-icons/fa';

export default function InkSketchBlock({ block, onUpdate }) {
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
      setWhiteboardMsg('Successfully imported drawing from Whiteboard!');
    } else {
      setWhiteboardMsg('No active sketch selection found in Whiteboard. Draw something in Whiteboard or draw on the pad below.');
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

  return (
    <div className="my-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden text-neutral-900 dark:text-slate-100 font-sans transition-all hover:border-indigo-400 dark:hover:border-indigo-500/40">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-slate-950/80 border-b border-neutral-200 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/60 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <FaPen className="w-3 h-3" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
              <span>Handwritten Ink & Vector Sketch</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-mono">
                {isEditing ? 'Drawing Mode' : 'Rendered Figure'}
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing && block?.content ? (
            <>
              <button
                onClick={handleDownloadImage}
                className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Download sketch PNG"
              >
                <FaDownload className="w-2.5 h-2.5" />
                <span className="text-[11px] hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-colors font-semibold"
                title="Edit drawing"
              >
                <FaEdit className="w-3 h-3" />
                <span className="text-[11px]">Edit Sketch</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* INTERACTIVE DRAWING CANVAS / UPLOAD MODE */}
        {isEditing ? (
          <div className="space-y-3">
            {/* Drawing Tools Palette */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-neutral-100 dark:bg-slate-950 rounded-xl border border-neutral-200 dark:border-slate-800 text-xs">
              {/* Tool Selector (Pen vs Eraser) */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsEraser(false)}
                  className={`p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all ${
                    !isEraser
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                  title="Pen tool"
                >
                  <FaPen className="w-3 h-3" />
                  <span className="text-[11px]">Pen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEraser(true)}
                  className={`p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all ${
                    isEraser
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                  title="Eraser tool"
                >
                  <FaEraser className="w-3 h-3" />
                  <span className="text-[11px]">Eraser</span>
                </button>
              </div>

              {/* Color Presets */}
              {!isEraser && (
                <div className="flex items-center space-x-1.5">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${
                        color === c.value ? 'scale-125 border-white ring-2 ring-indigo-500' : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}

              {/* Stroke Width Selector */}
              <div className="flex items-center space-x-1.5 text-neutral-600 dark:text-slate-400">
                <span className="text-[11px] font-mono">Size:</span>
                {[2, 4, 8].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setStrokeWidth(size)}
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[11px] transition-all ${
                      strokeWidth === size
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Clear Canvas */}
              <button
                type="button"
                onClick={handleClearCanvas}
                className="flex items-center space-x-1 text-slate-500 hover:text-red-500 p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-slate-800 transition-colors"
                title="Clear canvas"
              >
                <FaTrash className="w-3 h-3" />
                <span className="text-[11px]">Clear</span>
              </button>
            </div>

            {/* Interactive Drawing Pad */}
            <div className="relative w-full h-64 sm:h-72 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-900/60 overflow-hidden shadow-inner cursor-crosshair touch-none">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-full block"
              />
              <div className="absolute top-2 right-2 pointer-events-none text-[10px] font-mono text-neutral-400 dark:text-slate-600 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
                Stylus / Mouse Draw Pad
              </div>
            </div>

            {/* Action Bar (Save / Upload / Whiteboard Import) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveDrawing}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <FaCheck className="w-3 h-3" />
                  <span>Save Sketch to Note</span>
                </button>

                {/* Upload Image Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-300 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <FaUpload className="w-3 h-3 text-indigo-500" />
                  <span>Upload Image / SVG</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleImportFromWhiteboard}
                className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-300 dark:border-slate-700 transition-all cursor-pointer"
                title="Pulls latest drawing clip from Playground Whiteboard"
              >
                <FaSyncAlt className="w-3 h-3 text-pink-500" />
                <span>Import from Whiteboard</span>
              </button>
            </div>

            {whiteboardMsg && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-fadeIn">
                {whiteboardMsg}
              </p>
            )}
          </div>
        ) : (
          /* RENDERED ACADEMIC FIGURE DISPLAY */
          <div className="space-y-3">
            <div className="flex items-center justify-center p-4 bg-white dark:bg-slate-950 rounded-xl border border-neutral-200 dark:border-slate-800 min-h-[160px] overflow-hidden">
              {block?.content && (block.content.startsWith('data:image') || block.content.startsWith('<svg') || block.content.startsWith('http')) ? (
                block.content.startsWith('<svg') ? (
                  <div dangerouslySetInnerHTML={{ __html: block.content }} className="w-full max-w-lg" />
                ) : (
                  <img
                    src={block.content}
                    alt={block.caption || 'Handwritten mathematical sketch'}
                    className="max-h-80 object-contain rounded"
                  />
                )
              ) : (
                <div className="text-center py-8 text-xs text-neutral-400 dark:text-slate-500 space-y-2">
                  <FaFileImage className="w-8 h-8 mx-auto text-neutral-300 dark:text-slate-700" />
                  <p>Empty sketch block. Click "Edit Sketch" to draw on canvas or upload an image.</p>
                </div>
              )}
            </div>

            {/* Editable Caption */}
            <input
              type="text"
              value={block?.caption || ''}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              placeholder="Figure caption (e.g. Figure 1: Chord intersection & slope)..."
              className="w-full bg-transparent text-xs text-neutral-600 dark:text-slate-400 italic text-center focus:outline-none placeholder-neutral-400 dark:placeholder-slate-600 border-b border-transparent focus:border-indigo-400/50 py-0.5 font-serif"
            />
          </div>
        )}
      </div>
    </div>
  );
}
