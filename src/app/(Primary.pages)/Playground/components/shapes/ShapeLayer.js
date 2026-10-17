'use client';

import React, { memo, useMemo } from 'react';
import { shapePaint, matrixAttribute, shadowRegion, paintIds } from '../../utils/shapes/shapeRender';
import { shapeWorldBounds } from '../../utils/shapes/shapeModel';
import { browserMeasure } from '../../utils/shapes/shapeText';
import { visibleWorldRect, boxTouchesRect } from '../../utils/viewportMath';

/**
 * Draws every shape on the page in one SVG, between the grid and the ink, so the pen writes
 * on top of shapes. Panning and zooming change one transform; each shape only re-renders when
 * its own (immutable) object changes. The layer takes no pointer input: the ink canvas decides
 * by tool what a press does.
 */
const ShapeItem = memo(function ShapeItem({ shape, hideText }) {
  const paint = useMemo(() => shapePaint(shape, { measure: browserMeasure }), [shape]);
  const ids = paintIds(shape);
  const { parts, shadow, text } = paint;
  if (parts.length === 0 && !text) return null;

  const gradients = parts.map((p, i) => (p.gradient ? (
    <linearGradient key={i} id={ids.gradient(i)} gradientUnits="userSpaceOnUse" x1={p.gradient.x1} y1={p.gradient.y1} x2={p.gradient.x2} y2={p.gradient.y2}>
      {p.gradient.stops.map((c, k) => <stop key={k} offset={k / (p.gradient.stops.length - 1)} stopColor={c} />)}
    </linearGradient>
  ) : null));
  const region = shadow ? shadowRegion(shape, shadow) : null;

  return (
    <g data-shape-id={shape.id}>
      {(shadow || parts.some((p) => p.gradient)) && (
        <defs>
          {gradients}
          {shadow && (
            <filter id={ids.shadow} filterUnits="userSpaceOnUse" x={region.x} y={region.y} width={region.w} height={region.h} colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation={shadow.blur / 2} />
              <feOffset dx={shadow.localDx} dy={shadow.localDy} result="offset" />
              <feFlood floodColor={shadow.color} floodOpacity={shadow.alpha} />
              <feComposite in2="offset" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
      )}
      {parts.length > 0 && (
        <g transform={matrixAttribute(paint.matrix)} filter={shadow ? `url(#${ids.shadow})` : undefined}>
          {parts.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill={p.gradient ? `url(#${ids.gradient(i)})` : p.fill || 'none'}
              fillOpacity={p.fill && p.fillOpacity < 1 ? p.fillOpacity : undefined}
              stroke={p.stroke || 'none'}
              strokeWidth={p.stroke ? p.strokeWidth : undefined}
              strokeOpacity={p.stroke && p.strokeOpacity < 1 ? p.strokeOpacity : undefined}
              strokeDasharray={p.dash ? p.dash.join(' ') : undefined}
              strokeLinecap={p.stroke ? p.cap : undefined}
              strokeLinejoin={p.stroke ? p.join : undefined}
            />
          ))}
        </g>
      )}
      {text && !hideText && (
        <g transform={matrixAttribute(text.matrix)}>
          <text
            textAnchor={text.anchor}
            fontFamily={text.family}
            fontSize={text.size}
            fontWeight={text.weight}
            fontStyle={text.style}
            textDecoration={text.underline ? 'underline' : undefined}
            // Automatic colour follows the page (light or dark) through the layer's CSS colour
            fill={text.auto ? 'currentColor' : text.color}
            xmlSpace="preserve"
            data-shape-text
          >
            {text.lines.map((l, i) => (
              <tspan key={i} x={l.x} y={l.y}>
                {l.text}
              </tspan>
            ))}
          </text>
        </g>
      )}
    </g>
  );
});

export default function ShapeLayer({ shapes, zoomLevel, panOffset, width, height, editingId = null }) {
  if (shapes.length === 0) return null;

  // Shapes outside the view are skipped, like off-screen ink
  const view = visibleWorldRect(panOffset, zoomLevel, width, height);
  const visible = shapes.filter((s) => boxTouchesRect(shapeWorldBounds(s), view, 0));

  return (
    <svg
      className="absolute inset-0 z-[5] pointer-events-none text-pg-ink"
      width={width}
      height={height}
      aria-hidden="true"
      data-shape-layer
      style={{ overflow: 'hidden' }}
    >
      <g transform={`translate(${panOffset.x} ${panOffset.y}) scale(${zoomLevel})`}>
        {visible.map((shape) => (
          <ShapeItem key={shape.id} shape={shape} hideText={shape.id === editingId} />
        ))}
      </g>
    </svg>
  );
}
