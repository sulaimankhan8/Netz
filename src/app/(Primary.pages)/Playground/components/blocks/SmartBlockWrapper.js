'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiX, FiMove, FiEdit2, FiCheck } from 'react-icons/fi';
import AIActionButton from '../AIActionButton';
import { resizeKeepingAspect } from '../../utils/imageSizing';

export default function SmartBlockWrapper({
  block,
  autoEdit = false,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  onUpdatePosition,
  onUpdateSize,
  onDeleteBlock,
  onSelectAiAction,
  children,
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(Boolean(autoEdit));

  const wrapperRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });
  const longPressTimerRef = useRef(null);
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const longPressTriggeredRef = useRef(false);

  const { position, size, type, linkedBlockIds = [] } = block;
  const isLinked = linkedBlockIds.length > 0;
  const aspectRatio = block.content?.aspectRatio || 0;

  // Deselect on outside click/tap
  useEffect(() => {
    if (!isSelected) return;
    const handleOutsidePointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => window.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [isSelected]);

  // Drag Handler in Canvas World Coordinates. Pointer events, so a finger or a pen moves a
  // block exactly as the mouse does.
  const handleDragPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setIsSelected(true);
    setIsDragging(true);

    const currentScreenX = position.x * zoomLevel + panOffset.x;
    const currentScreenY = position.y * zoomLevel + panOffset.y;

    dragStartRef.current = {
      x: e.clientX - currentScreenX,
      y: e.clientY - currentScreenY,
    };
  };

  // Long press on block body to start dragging without aiming at the tiny grab handle
  const handleBodyPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    longPressTriggeredRef.current = false;

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setIsSelected(true);
      setIsDragging(true);

      const currentScreenX = position.x * zoomLevel + panOffset.x;
      const currentScreenY = position.y * zoomLevel + panOffset.y;
      dragStartRef.current = {
        x: touchStartPosRef.current.x - currentScreenX,
        y: touchStartPosRef.current.y - currentScreenY,
      };
    }, 350);
  };

  const handleBodyPointerMove = (e) => {
    if (longPressTimerRef.current) {
      const dx = Math.abs(e.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(e.clientY - touchStartPosRef.current.y);
      if (dx > 8 || dy > 8) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const lastTouchUpTimeRef = useRef(0);

  const handleBodyPointerUp = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
    if (isTouch) {
      lastTouchUpTimeRef.current = Date.now();
      if (isSelected) {
        setIsEditing(true);
      } else {
        setIsSelected(true);
      }
    } else {
      setIsSelected(true);
      setIsEditing(true);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newX = (e.clientX - dragStartRef.current.x - panOffset.x) / zoomLevel;
    const newY = (e.clientY - dragStartRef.current.y - panOffset.y) / zoomLevel;
    onUpdatePosition(block.blockId, { x: newX, y: newY });
  }, [isDragging, zoomLevel, panOffset.x, panOffset.y, block.blockId, onUpdatePosition]);

  // Resize Handler
  const handleResizePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setIsSelected(true);
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

    if (!onUpdateSize) return;

    // Pictures keep their proportions
    if (type === 'image' && aspectRatio > 0) {
      onUpdateSize(block.blockId, resizeKeepingAspect(resizeStartRef.current.width, resizeStartRef.current.height, dx, dy, aspectRatio));
      return;
    }

    const newWidth = Math.max(220, resizeStartRef.current.width + dx);
    const newHeight = Math.max(80, resizeStartRef.current.height + dy);
    onUpdateSize(block.blockId, { width: Math.round(newWidth), height: Math.round(newHeight) });
  }, [isResizing, zoomLevel, block.blockId, onUpdateSize, type, aspectRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handleMouseMove);
      window.addEventListener('pointerup', handleMouseUp);
      window.addEventListener('pointercancel', handleMouseUp);
      return () => {
        window.removeEventListener('pointermove', handleMouseMove);
        window.removeEventListener('pointerup', handleMouseUp);
        window.removeEventListener('pointercancel', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isResizing) {
      const handleUp = () => setIsResizing(false);
      window.addEventListener('pointermove', handleResizeMouseMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
      return () => {
        window.removeEventListener('pointermove', handleResizeMouseMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
      };
    }
  }, [isResizing, handleResizeMouseMove]);

  // Pass isEditing, setIsEditing & isSelected state to the block inside
  const childElement = React.Children.map(children, (child) =>
    React.isValidElement(child) ? React.cloneElement(child, { isEditing, setIsEditing, isSelected }) : child
  );

  // Calculate screen position synced with panOffset and zoomLevel
  const screenX = position.x * zoomLevel + panOffset.x;
  const screenY = position.y * zoomLevel + panOffset.y;

  const minHeightForType = type === 'audio' ? 180 : type === 'graph' ? 320 : 100;
  const blockWidth = size?.width 
    ? (type === 'audio' ? Math.max(size.width, 360) : size.width)
    : (type === 'graph' ? 440 : type === 'audio' ? 360 : 360);
  const blockHeight = size?.height 
    ? `${Math.max(size.height, minHeightForType)}px` 
    : (type === 'graph' ? '320px' : type === 'audio' ? '180px' : 'auto');

  // ----------------------------------------------------
  // MODE 1: DONE / VIEW MODE (Clean, lightweight card)
  // ----------------------------------------------------
  if (!isEditing) {
    return (
      <div
        ref={wrapperRef}
        style={{
          transform: `translate(${screenX}px, ${screenY}px) scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: blockWidth,
          height: blockHeight,
        }}
        data-block-id={block.blockId}
        className="absolute top-0 left-0 z-40 group"
      >
        <div className={`relative w-full h-full p-2 rounded-2xl ${
          isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''
        } ${
          block.isRuledLineAligned
            ? 'bg-transparent hover:bg-white/85 dark:hover:bg-zinc-900/85 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 shadow-none hover:shadow-lg'
            : 'bg-white/70 dark:bg-zinc-900/70 hover:bg-white/95 dark:hover:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-lg backdrop-blur-md'
        } transition-[background-color,border-color,box-shadow] flex flex-col justify-between`}>
          {/* Top Grab & Action Toolbar: visible when selected, dragging, resizing, or hovered */}
          <div className={`flex items-center justify-between w-full pb-1 transition-opacity ${
            (isSelected || isDragging || isResizing)
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}>
            {/* Grab Handle */}
            <div
              onPointerDown={handleDragPointerDown}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-200/90 dark:bg-zinc-800/90 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 cursor-grab active:cursor-grabbing select-none touch-none min-h-[36px]"
            >
              <FiMove className="w-3.5 h-3.5" />
              <span className="capitalize">{type}</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Edit Block"
                className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-zinc-200/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:text-blue-500 transition-colors cursor-pointer"
              >
                <FiEdit2 className="w-4 h-4 pointer-events-none" />
              </button>
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.blockId);
                }}
                title="Delete Block"
                className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-zinc-200/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4 pointer-events-none" />
              </button>
            </div>
          </div>

          {/* Block Content Body: supports tap selection and 350ms long press to drag */}
          <div
            onPointerDown={handleBodyPointerDown}
            onPointerMove={handleBodyPointerMove}
            onPointerUp={handleBodyPointerUp}
            onPointerCancel={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (Date.now() - lastTouchUpTimeRef.current < 400) {
                return;
              }
              setIsSelected(true);
              setIsEditing(true);
            }}
            className="flex-1 w-full h-full cursor-text overflow-hidden touch-none"
          >
            {childElement}
          </div>

          {/* Bottom-Right Corner Resize Handle with comfortable 44px hit area */}
          <div
            onPointerDown={handleResizePointerDown}
            title="Drag to resize block"
            data-resize-handle
            className={`${(isSelected || isDragging || isResizing) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'} absolute -bottom-4 -right-4 z-50 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-se-resize touch-none transition-opacity`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MODE 2: EDIT MODE (Active Card Editor)
  // ----------------------------------------------------
  return (
    <div
      ref={wrapperRef}
      style={{
        transform: `translate(${screenX}px, ${screenY}px) scale(${zoomLevel})`,
        transformOrigin: 'top left',
        width: blockWidth,
        height: blockHeight,
      }}
      data-block-id={block.blockId}
      className={`absolute top-0 left-0 z-50 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-blue-500 shadow-2xl group flex flex-col ${
        isLinked ? 'ring-2 ring-blue-500/30' : ''
      }`}
    >
      {/* Header Toolbar */}
      <div
        onPointerDown={handleDragPointerDown}
        className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200/70 dark:border-zinc-800/70 cursor-grab active:cursor-grabbing select-none flex-shrink-0 touch-none"
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

        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          {/* AI Action Popover Button (FOR EQUATION BLOCKS WITH CAS ACTIONS) */}
          {onSelectAiAction && type === 'equation' && (
            <AIActionButton block={block} onSelectAction={onSelectAiAction} />
          )}

          {/* Done Button */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
            title="Done Editing"
            className="flex items-center gap-1 px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-xs transition-colors cursor-pointer"
          >
            <FiCheck className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">Done</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.blockId);
            }}
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center p-1 text-zinc-400 hover:text-rose-500 rounded-lg ml-0.5 cursor-pointer"
            title="Delete Block"
          >
            <FiX className="w-4 h-4 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* Block Body Content */}
      <div className="p-3 flex-1 w-full overflow-hidden flex flex-col">{childElement}</div>

      {/* Bottom-Right Corner Resize Handle with comfortable 44px hit area */}
      <div
        onPointerDown={handleResizePointerDown}
        title="Drag to resize block"
        data-resize-handle
        className="absolute -bottom-4 -right-4 z-50 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-se-resize touch-none"
      >
        <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
      </div>
    </div>
  );
}
