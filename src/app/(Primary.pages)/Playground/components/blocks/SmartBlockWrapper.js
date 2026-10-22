'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiTrash2, FiEdit2, FiCheck, FiPenTool } from 'react-icons/fi';
import AIActionButton from '../AIActionButton';
import { resizeKeepingAspect } from '../../utils/imageSizing';
import { TOUCH_TARGET } from '../ui/Dialog';
import { CTX_BUTTON, CtxDivider } from '../ui/ContextBar';
import { blockLabel } from '../../utils/uiText';
import { BlockBadge, blockHue } from './blockStyle';

// A mouse press on a selected block that moves this far (px) starts moving the block
const MOUSE_DRAG_START = 4;

export default function SmartBlockWrapper({
  block,
  autoEdit = false,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  onUpdatePosition,
  onUpdateSize,
  onDeleteBlock,
  onSelectAiAction,
  actions = [],
  // Ink over blocks (PLAYGROUND_HANDOFF.md C2): drawOver = the block's "Draw on it" switch;
  // underInk = it sits under the ink right now (it comes up while picked with the Select tool)
  drawOver = false,
  underInk = false,
  onToggleDrawOver,
  selectSignal = 0,
  onDeselect,
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

  // Picked with the Select tool while under the ink: selected straight away
  useEffect(() => {
    if (selectSignal) setIsSelected(true);
  }, [selectSignal]);

  // Done with it: it can go back under the ink
  const deselectRef = useRef(onDeselect);
  deselectRef.current = onDeselect;
  useEffect(() => {
    if (!isSelected && !isEditing && !isDragging && !isResizing) deselectRef.current?.(block.blockId);
  }, [isSelected, isEditing, isDragging, isResizing, block.blockId]);

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
  const mouseDragPendingRef = useRef(false);
  const handleBodyPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    longPressTriggeredRef.current = false;
    mouseDragPendingRef.current = e.pointerType === 'mouse' && isSelected;

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
    if (mouseDragPendingRef.current) {
      const moved = Math.hypot(e.clientX - touchStartPosRef.current.x, e.clientY - touchStartPosRef.current.y);
      if (moved > MOUSE_DRAG_START) {
        mouseDragPendingRef.current = false;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        longPressTriggeredRef.current = true;
        setIsDragging(true);
        const currentScreenX = position.x * zoomLevel + panOffset.x;
        const currentScreenY = position.y * zoomLevel + panOffset.y;
        dragStartRef.current = { x: touchStartPosRef.current.x - currentScreenX, y: touchStartPosRef.current.y - currentScreenY };
        return;
      }
    }
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
      // Mouse: a click selects (bar, handles); a double click or the Edit button edits
      mouseDragPendingRef.current = false;
      setIsSelected(true);
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

  const minHeightForType = type === 'audio' ? 96 : type === 'graph' ? 240 : 64;
  const blockWidth = size?.width 
    ? (type === 'audio' ? Math.max(size.width, 360) : size.width)
    : (type === 'graph' ? 440 : type === 'audio' ? 360 : 360);
  const blockHeight = size?.height 
    ? `${Math.max(size.height, minHeightForType)}px` 
    : (type === 'graph' ? '320px' : type === 'audio' ? '104px' : 'auto');
  const hue = blockHue(type);
  // Pictures and sketches sit in a little padding; the other blocks lay out their own
  const cardPadding = type === 'image' || type === 'sketch' ? 'p-2' : 'p-0';

  // The resize handle: a square edged in the selection colour, as for shapes and lassoed ink
  const resizeLook = <span className="w-3 h-3 rounded-[3px] bg-pg-surface border-[1.5px] border-pg-accent" />;

  // Where the block's bar goes: 8 px above the block, or below it when the top bars are in the
  // way; in screen pixels whatever the zoom (the block itself is scaled, so the bar is scaled back)
  const BAR_ROOM = 60; // the bar's height and its gap, on screen
  const TOP_CLEAR = 78; // the bottom of the top bars
  const barBelow = screenY - BAR_ROOM < TOP_CLEAR;
  const nudgeX = screenX < 12 ? 12 - screenX : 0;
  const inv = 1 / zoomLevel;
  const barPlacement = barBelow
    ? { top: '100%', transform: `translate(${nudgeX * inv}px, ${8 * inv}px) scale(${inv})`, transformOrigin: 'top left' }
    : { bottom: '100%', transform: `translate(${nudgeX * inv}px, ${-8 * inv}px) scale(${inv})`, transformOrigin: 'bottom left' };

  // ----------------------------------------------------
  // MODE 1: DONE / VIEW MODE (Clean, lightweight card)
  // ----------------------------------------------------
  if (!isEditing) {
    const showBar = isSelected || isDragging || isResizing;
    return (
      <div
        ref={wrapperRef}
        style={{
          transform: `translate(${screenX}px, ${screenY}px) scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: blockWidth,
          height: blockHeight,
          // What happens inside a block never makes the rest of the page lay out again
          contain: 'layout style',
        }}
        data-block-id={block.blockId}
        data-selected={isSelected ? 'true' : undefined}
        data-under-ink={underInk ? 'true' : undefined}
        className={`absolute top-0 left-0 ${underInk ? 'z-[6]' : 'z-40'} group`}
      >
        {/* The card: no chrome of its own at rest. Selected: the one selection outline */}
        <div className={`relative w-full h-full ${cardPadding} rounded-xl ${
          isSelected ? 'outline outline-[1.5px] outline-offset-1 outline-pg-accent' : ''
        } ${
          block.isRuledLineAligned
            ? 'bg-transparent hover:bg-pg-surface/90 border border-transparent hover:border-pg-line'
            : `bg-pg-surface border ${hue.border}`
        } transition-[background-color,border-color] flex flex-col justify-between`}>
          {/* Block Content Body: supports tap selection and 350ms long press to drag */}
          <div
            data-block-body
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
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsSelected(true);
              setIsEditing(true);
            }}
            title={isSelected ? 'Double-click to edit, drag to move' : undefined}
            className={`flex-1 w-full h-full overflow-hidden rounded-xl touch-none ${isSelected ? 'cursor-move' : 'cursor-pointer'}`}
          >
            {childElement}
          </div>

          {/* Bottom-Right Corner Resize Handle with comfortable 44px hit area */}
          <div
            onPointerDown={handleResizePointerDown}
            title="Drag to resize block"
            data-resize-handle
            className={`${showBar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'} absolute -bottom-4 -right-4 z-50 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-se-resize touch-none transition-opacity`}
          >
            {resizeLook}
          </div>
        </div>

        {/* The block's context bar, above it and outside its content: the type (drag it to move
            the block), Edit, and Delete kept apart at the far end. It keeps one size at every
            zoom (scaled back by 1 / zoom) and drops below the block when the top bars are in the
            way. Shown while selected, and on hover with a mouse. */}
        <div
          role="toolbar"
          aria-label={`${blockLabel(type)} actions`}
          data-context-bar
          onPointerDown={(e) => e.stopPropagation()}
          style={barPlacement}
          className={`absolute left-0 flex items-center gap-0.5 p-1 rounded-[14px] bg-pg-surface border border-pg-line shadow-pg-bar text-pg-label select-none whitespace-nowrap transition-opacity ${
            showBar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}
        >
          <div
            onPointerDown={handleDragPointerDown}
            title="Drag to move the block"
            className={`${CTX_BUTTON} !pl-1 !text-pg-ink font-semibold cursor-grab active:cursor-grabbing touch-none`}
          >
            <BlockBadge type={type} />
            <span>{blockLabel(type)}</span>
          </div>
          {/* What this kind of block offers (an equation: Plot) */}
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              title={action.title || action.label}
              aria-label={action.label}
              className={`${CTX_BUTTON} cursor-pointer`}
            >
              {action.icon}
              <span className="pointer-events-none">{action.label}</span>
            </button>
          ))}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Edit Block"
            aria-label={`Edit ${blockLabel(type)}`}
            className={`${CTX_BUTTON} cursor-pointer`}
          >
            <FiEdit2 className="w-4 h-4 pointer-events-none" aria-hidden="true" />
            <span className="pointer-events-none">Edit</span>
          </button>
          {onToggleDrawOver && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggleDrawOver(block.blockId);
              }}
              aria-pressed={drawOver}
              title={drawOver ? 'The pen writes on this block. Pick it with the Select tool to move or edit it.' : 'Let the pen write on this block'}
              aria-label="Draw on it"
              className={`${CTX_BUTTON} cursor-pointer ${drawOver ? '!bg-pg-accent-tint !text-pg-accent-on-tint' : ''}`}
            >
              <FiPenTool className="w-4 h-4 pointer-events-none" aria-hidden="true" />
              <span className="pointer-events-none hidden sm:inline">Draw on it</span>
            </button>
          )}
          <CtxDivider />
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.blockId);
            }}
            title="Delete Block"
            aria-label={`Delete ${blockLabel(type)}`}
            className={`${CTX_BUTTON} hover:!text-pg-danger cursor-pointer`}
          >
            <FiTrash2 className="w-4 h-4 pointer-events-none" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MODE 2: EDIT MODE (Active Card Editor)
  // ----------------------------------------------------
  // An equation or a graph being edited grows to fit its tools (never shorter than its size)
  const editHeight = type === 'equation' || type === 'graph' ? { height: 'auto', minHeight: blockHeight } : { height: blockHeight };
  return (
    <div
      ref={wrapperRef}
      style={{
        transform: `translate(${screenX}px, ${screenY}px) scale(${zoomLevel})`,
        transformOrigin: 'top left',
        width: blockWidth,
        ...editHeight,
        contain: 'layout style',
      }}
      data-block-id={block.blockId}
      data-editing="true"
      className={`absolute top-0 left-0 z-50 rounded-xl bg-pg-surface border-[1.5px] border-pg-accent shadow-pg-menu group flex flex-col ${
        isLinked ? 'ring-4 ring-pg-accent/15' : ''
      }`}
    >
      {/* Header: it belongs to the editor (the label moves the block; Delete, then Done) */}
      <div
        onPointerDown={handleDragPointerDown}
        className="flex items-center justify-between min-h-[44px] px-3 py-1 border-b border-pg-line cursor-grab active:cursor-grabbing select-none flex-shrink-0 touch-none"
      >
        <div className="flex items-center gap-2">
          <BlockBadge type={type} />
          <span className="text-pg-label font-semibold text-pg-ink">
            {blockLabel(type)}
          </span>
          {isLinked && (
            <span className="text-pg-cap px-2 py-0.5 rounded-full bg-pg-accent-tint text-pg-accent-on-tint font-semibold">
              Linked
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          {/* Delete, kept well away from Done */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.blockId);
            }}
            className={`w-9 h-9 ${TOUCH_TARGET} flex items-center justify-center p-1 text-pg-text2 hover:text-pg-danger rounded-lg cursor-pointer`}
            title="Delete Block"
            aria-label={`Delete ${blockLabel(type)}`}
          >
            <FiTrash2 className="w-4 h-4 pointer-events-none" />
          </button>
          <div className="w-px h-5 bg-pg-line mx-1" />

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
            className={`flex items-center gap-1 px-3 py-1.5 min-h-[36px] ${TOUCH_TARGET} text-pg-label font-semibold rounded-[10px] bg-pg-accent-fill hover:bg-pg-accent-fill/90 text-white transition-colors cursor-pointer`}
          >
            <FiCheck className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">Done</span>
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
        {resizeLook}
      </div>
    </div>
  );
}
