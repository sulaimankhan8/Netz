'use client';

import React from 'react';

export default function BlockLinkRenderer({
  links = [],
  blocks = [],
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
}) {
  if (!links || links.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
      <defs>
        <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
        </linearGradient>
        <filter id="linkGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {links.map((link) => {
        const source = blocks.find((b) => b.blockId === link.sourceBlockId);
        const target = blocks.find((b) => b.blockId === link.targetBlockId);

        if (!source || !target) return null;

        const sW = source.size?.width || 360;
        const sH = source.size?.height || 140;
        const tW = target.size?.width || 440;
        const tH = target.size?.height || 320;

        // Calculate source and target center points
        const sCenterX = source.position.x + sW / 2;
        const sCenterY = source.position.y + sH / 2;
        const tCenterX = target.position.x + tW / 2;
        const tCenterY = target.position.y + tH / 2;

        const dx = tCenterX - sCenterX;
        const dy = tCenterY - sCenterY;

        let srcX, srcY, tgtX, tgtY, cp1X, cp1Y, cp2X, cp2Y;

        // Horizontal positioning: target is to the right of source
        if (Math.abs(dx) >= Math.abs(dy)) {
          if (dx >= 0) {
            srcX = source.position.x + sW;
            srcY = sCenterY;
            tgtX = target.position.x;
            tgtY = tCenterY;
            const dist = Math.max(40, (tgtX - srcX) * 0.5);
            cp1X = srcX + dist;
            cp1Y = srcY;
            cp2X = tgtX - dist;
            cp2Y = tgtY;
          } else {
            srcX = source.position.x;
            srcY = sCenterY;
            tgtX = target.position.x + tW;
            tgtY = tCenterY;
            const dist = Math.max(40, (srcX - tgtX) * 0.5);
            cp1X = srcX - dist;
            cp1Y = srcY;
            cp2X = tgtX + dist;
            cp2Y = tgtY;
          }
        } else {
          // Vertical positioning
          if (dy >= 0) {
            srcX = sCenterX;
            srcY = source.position.y + sH;
            tgtX = tCenterX;
            tgtY = target.position.y;
            const dist = Math.max(40, (tgtY - srcY) * 0.5);
            cp1X = srcX;
            cp1Y = srcY + dist;
            cp2X = tgtX;
            cp2Y = tgtY - dist;
          } else {
            srcX = sCenterX;
            srcY = source.position.y;
            tgtX = tCenterX;
            tgtY = target.position.y + tH;
            const dist = Math.max(40, (srcY - tgtY) * 0.5);
            cp1X = srcX;
            cp1Y = srcY - dist;
            cp2X = tgtX;
            cp2Y = tgtY + dist;
          }
        }

        // Project world coordinates to screen viewport coordinates
        const x1 = srcX * zoomLevel + panOffset.x;
        const y1 = srcY * zoomLevel + panOffset.y;
        const x2 = tgtX * zoomLevel + panOffset.x;
        const y2 = tgtY * zoomLevel + panOffset.y;
        const cx1 = cp1X * zoomLevel + panOffset.x;
        const cy1 = cp1Y * zoomLevel + panOffset.y;
        const cx2 = cp2X * zoomLevel + panOffset.x;
        const cy2 = cp2Y * zoomLevel + panOffset.y;

        const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

        return (
          <g key={link.linkId}>
            {/* Ambient subtle glow stroke */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#linkGradient)"
              strokeWidth={4 * Math.min(zoomLevel, 1.3)}
              strokeOpacity="0.3"
            />
            {/* Animated dashed link */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#linkGradient)"
              strokeWidth={2.5 * Math.min(zoomLevel, 1.3)}
              strokeDasharray="6 4"
              className="animate-pulse"
            />
            {/* Connection anchor terminal nodes */}
            <circle cx={x1} cy={y1} r={4 * Math.min(zoomLevel, 1.2)} fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={x2} cy={y2} r={4 * Math.min(zoomLevel, 1.2)} fill="#8B5CF6" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}
