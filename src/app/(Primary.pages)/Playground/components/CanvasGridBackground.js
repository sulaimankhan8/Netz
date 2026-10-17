'use client';

import React, { useEffect, useRef } from 'react';
import { gridColours, isDarkPage } from './ui/tokens';

export default function CanvasGridBackground({
  gridStyle = 'dots',
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  width,
  height,
}) {
  const canvasRef = useRef(null);
  // Sharp grid on high-density screens
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear, then draw in CSS pixels on a device-pixel backing store
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (gridStyle === 'none') return;

    // Quieter than thin ink (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, step 6.5)
    const { dot: dotColor, line: strokeColor } = gridColours(isDarkPage());

    // Dynamic grid spacing scaled by zoom
    const baseSpacing = 32;
    const spacing = baseSpacing * zoomLevel;

    // Calculate grid alignment offset based on pan position
    const offsetX = panOffset.x % spacing;
    const offsetY = panOffset.y % spacing;

    ctx.save();

    if (gridStyle === 'grid' || gridStyle === 'lines') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Vertical lines
      if (gridStyle === 'grid') {
        for (let x = offsetX; x < width; x += spacing) {
          ctx.moveTo(Math.floor(x) + 0.5, 0);
          ctx.lineTo(Math.floor(x) + 0.5, height);
        }
      }

      // Horizontal lines
      for (let y = offsetY; y < height; y += spacing) {
        ctx.moveTo(0, Math.floor(y) + 0.5);
        ctx.lineTo(width, Math.floor(y) + 0.5);
      }

      ctx.stroke();
    } else if (gridStyle === 'dots') {
      ctx.fillStyle = dotColor;
      const dotRadius = Math.max(1, 1.5 * Math.min(zoomLevel, 1.5));

      for (let x = offsetX; x < width; x += spacing) {
        for (let y = offsetY; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }, [gridStyle, zoomLevel, panOffset, width, height, pixelRatio]);

  return (
    <canvas
      ref={canvasRef}
      width={Math.round(width * pixelRatio)}
      height={Math.round(height * pixelRatio)}
      style={{ width, height }}
      className="absolute inset-0 pointer-events-none z-0"
      data-grid-background
    />
  );
}
