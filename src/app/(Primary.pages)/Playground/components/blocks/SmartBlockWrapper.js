'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiX, FiMove, FiEdit2, FiCheck } from 'react-icons/fi';
import AIActionButton from '../AIActionButton';

export default function SmartBlockWrapper({
  block,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  onUpdatePosition,
  onUpdateSize,
  onDeleteBlock,
  onSelectAiAction,
  children,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  const { position, size, type, linkedBlockIds = [] } = block;
  const isLinked = linkedBlockIds.length > 0;

  // Mouse Drag Handler in Canvas World Coordinates
  const handleDragMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);

    const currentScreenX = position.x * zoomLevel + panOffset.x;
    const currentScreenY = position.y * zoomLevel + panOffset.y;

    dragStartRef.current = {
      x: e.clientX - currentScreenX,
      y: e.clientY - currentScreenY,
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newX = (e.clientX - dragStartRef.current.x - panOffset.x) / zoomLevel;
    const newY = (e.clientY - dragStartRef.current.y - panOffset.y) / zoomLevel;
    onUpdatePosition(block.blockId, { x: newX, y: newY });
  }, [isDragging, zoomLevel, panOffset.x, panOffset.y, block.blockId, onUpdatePosition]);

  // Mouse Resize Handler
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      width: size?.width || (type === 'graph' ? 440 : 360),
      height: size?.height || (type === 'graph' ? 320 : 140),
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  const handleResizeMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const dx = (e.clientX - resizeStartRef.current.mouseX) / zoomLevel;
    const dy = (e.clientY - resizeStartRef.current.mouseY) / zoomLevel;

    const newWidth = Math.max(220, resizeStartRef.current.width + dx);
    const newHeight = Math.max(80, resizeStartRef.current.height + dy);

    if (onUpdateSize) {
      onUpdateSize(block.blockId, { width: Math.round(newWidth), height: Math.round(newHeight) });
    }
  }, [isResizing, zoomLevel, block.blockId, onUpdateSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isResizing) {
      const handleUp = () => setIsResizing(false);
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleUp);
      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleUp);
      };
    }
  }, [isResizing, handleResizeMouseMove]);

  // Pass isEditing & setIsEditing state to child component
  const childElement = React.isValidElement(children)
    ? React.cloneElement(children, { isEditing, setIsEditing })
    : children;

  // Calculate screen position synced with panOffset and zoomLevel
  const screenX = position.x * zoomLevel + panOffset.x;
  const screenY = position.y * zoomLevel + panOffset.y;

  const blockWidth = size?.width || (type === 'graph' ? 440 : 360);
  const blockHeight = size?.height ? `${size.height}px` : (type === 'graph' ? '320px' : 'auto');

  // ----------------------------------------------------
  // MODE 1: DONE / VIEW MODE (Clean, lightweight card)
  // ----------------------------------------------------
  if (!isEditing) {
    return (
      <div
        style={{
          transform: `translate(${screenX}px, ${screenY}px) scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: blockWidth,
          height: blockHeight,
        }}
        className="absolute top-0 left-0 z-40 group"
      >
        <div className="relative w-full h-full p-2 rounded-2xl bg-white/70 dark:bg-zinc-900/70 hover:bg-white/95 dark:hover:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-lg backdrop-blur-md transition-all flex flex-col justify-between">
          {/* Top Grab & Action Toolbar */}
          <div className="flex items-center justify-between w-full pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Grab Handle */}
            <div
              onMouseDown={handleDragMouseDown}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-400 cursor-grab active:cursor-grabbing select-none"
            >
              <FiMove className="w-3 h-3" />
              <span className="capitalize">{type}</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Edit Block"
                className="p-1 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:text-blue-500 transition-colors cursor-pointer"
              >
                <FiEdit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.blockId);
                }}
                title="Delete Block"
                className="p-1 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Block Content Body */}
          <div
            onClick={() => setIsEditing(true)}
            className="flex-1 w-full h-full cursor-text overflow-hidden"
          >
            {childElement}
          </div>

          {/* Bottom-Right Corner Resize Handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            title="Drag to resize block"
            className="opacity-0 group-hover:opacity-100 absolute -bottom-1 -right-1 z-50 w-3.5 h-3.5 rounded-full bg-blue-500 hover:bg-blue-600 border-2 border-white cursor-se-resize shadow-md transition-opacity"
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MODE 2: EDIT MODE (Active Card Editor)
  // ----------------------------------------------------
  return (
    <div
      style={{
        transform: `translate(${screenX}px, ${screenY}px) scale(${zoomLevel})`,
        transformOrigin: 'top left',
        width: blockWidth,
        height: blockHeight,
      }}
      className={`absolute top-0 left-0 z-50 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-blue-500 shadow-2xl transition-all group flex flex-col ${
        isLinked ? 'ring-2 ring-blue-500/30' : ''
      }`}
    >
      {/* Header Toolbar */}
      <div
        onMouseDown={handleDragMouseDown}
        className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200/70 dark:border-zinc-800/70 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <FiMove className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
            {type} Block
          </span>
          {isLinked && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-mono font-semibold">
              Linked
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
          {/* AI Action Popover Button (FOR EQUATION BLOCKS WITH CAS ACTIONS) */}
          {onSelectAiAction && type === 'equation' && (
            <AIActionButton block={block} onSelectAction={onSelectAiAction} />
          )}

          {/* Done Button */}
          <button
            onClick={() => setIsEditing(false)}
            title="Done Editing"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-xs transition-colors cursor-pointer"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>

          <button
            onClick={() => onDeleteBlock(block.blockId)}
            className="p-1 text-zinc-400 hover:text-rose-500 rounded-md ml-0.5 cursor-pointer"
            title="Delete Block"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Body Content */}
      <div className="p-3 flex-1 w-full overflow-hidden flex flex-col">{childElement}</div>

      {/* Bottom-Right Corner Resize Handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        title="Drag to resize block"
        className="opacity-0 group-hover:opacity-100 absolute -bottom-1 -right-1 z-50 w-3.5 h-3.5 rounded-full bg-blue-500 hover:bg-blue-600 border-2 border-white cursor-se-resize shadow-md transition-opacity"
      />
    </div>
  );
}
