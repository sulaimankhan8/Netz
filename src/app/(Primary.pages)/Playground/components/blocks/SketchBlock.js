'use client';

import React, { useRef, useState } from 'react';
import { extractEquationFromSketch } from '../../utils/graphToEquation';

export default function SketchBlock({ block, onConvertSketchToEquation }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [extractedLatex, setExtractedLatex] = useState(null);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const newPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setPoints([newPt]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const updated = [...points, newPt];
    setPoints(updated);

    // Draw on mini canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(updated[0].x, updated[0].y);
      for (let i = 1; i < updated.length; i++) {
        ctx.lineTo(updated[i].x, updated[i].y);
      }
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (points.length > 5) {
      const fit = extractEquationFromSketch(points);
      setExtractedLatex(fit.latex);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl border border-pg-line bg-zinc-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={330}
          height={150}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-36 cursor-crosshair"
        />
        {extractedLatex && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-pg-tray text-pg-text2 text-pg-cap">
            Fitted: {extractedLatex}
          </div>
        )}
      </div>

      {extractedLatex && (
        <button
          onClick={() => onConvertSketchToEquation(block, extractedLatex)}
          className="w-full py-1.5 px-3 text-xs font-medium rounded-xl bg-pg-accent-tint text-pg-accent-on-tint hover:brightness-95 shadow-sm transition-all"
        >
          ✨ Convert Sketch to Linked Equation Block
        </button>
      )}
    </div>
  );
}
