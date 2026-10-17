'use client';

import React from 'react';
import { FiCheck, FiImage, FiClipboard, FiMonitor } from 'react-icons/fi';
import { SHAPE_CHOICES, ShapeOutlineIcon } from './screenshotShapes';
import { MenuHeader, menuPanelClass } from '../ui/parts';

/**
 * The Screenshot menu, as in WPS Office: the four screenshot shapes; Screenshot and Hide Current
 * Window During Screenshot (the ticked one is what the Screenshot button does); Screen Grab Main
 * Window (here: the Playground view).
 *
 * Phones and tablets cannot capture the screen from a web page (canCapture false). There the
 * menu offers what does work: the Playground view, a screenshot from Photos (taken with the
 * device's own buttons), or a pasted picture. The four shapes are on the editor's toolbar.
 */
export default function ScreenshotMenu({ isMobile, canCapture, mode = 'screenshot', onCapture, onGrabView, onFromPhotos, onPaste, onClose }) {
  const row = `flex items-center gap-2.5 px-2 ${isMobile ? 'h-11' : 'h-9'} rounded-lg hover:bg-pg-tray text-left text-pg-body text-pg-ink`;
  // A choice with a line of explanation under its name
  const tallRow = 'flex items-center gap-2.5 px-2 py-1.5 min-h-[52px] rounded-lg hover:bg-pg-tray text-left text-pg-body text-pg-ink';
  const shortcut = (keys) => <span className="ml-auto pl-3 text-pg-cap text-pg-text2 tabular-nums">{keys}</span>;
  const tick = (on) => <span className="w-4 shrink-0 flex justify-center">{on && <FiCheck className="w-3.5 h-3.5 text-pg-ink" aria-hidden="true" />}</span>;
  const divider = <div className="my-1 h-px bg-pg-line" role="separator" />;
  const detail = 'text-pg-cap text-pg-text2';

  return (
    <div
      role="menu"
      aria-label="Screenshot"
      data-screenshot-menu
      className={`${menuPanelClass(isMobile, 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[400px] max-w-[var(--dock-panel-max,95vw)] max-h-[75vh] rounded-2xl p-2 border')} overflow-y-auto overscroll-contain z-50 flex flex-col gap-1`}
    >
      <div className="px-1 pb-1">
        <MenuHeader title="Screenshot" onClose={onClose} isMobile={isMobile} />
      </div>

      {canCapture ? (
        <>
          {SHAPE_CHOICES.map((c) => (
            <button key={c.id} type="button" role="menuitem" data-screenshot-item={c.id} onClick={() => onCapture(c.id, { hide: mode === 'hide' })} className={row}>
              {tick(false)}
              <ShapeOutlineIcon d={c.d} />
              {c.label}
            </button>
          ))}
          {divider}
          <button type="button" role="menuitemradio" aria-checked={mode === 'screenshot'} data-screenshot-item="screenshot" onClick={() => onCapture('rect', { hide: false, remember: true })} className={row}>
            {tick(mode === 'screenshot')}
            Screenshot
            {shortcut('Ctrl+Alt+X')}
          </button>
          <button type="button" role="menuitemradio" aria-checked={mode === 'hide'} data-screenshot-item="hide" onClick={() => onCapture('rect', { hide: true, remember: true })} className={row}>
            {tick(mode === 'hide')}
            Hide Current Window During Screenshot
            {shortcut('Ctrl+Alt+C')}
          </button>
          {divider}
          <button type="button" role="menuitem" data-screenshot-item="view" onClick={() => onGrabView()} className={row}>
            {tick(false)}
            <FiMonitor className="w-4 h-4 text-pg-text2" aria-hidden="true" />
            Screen Grab Main Window
          </button>
        </>
      ) : (
        <>
          <button type="button" role="menuitem" data-screenshot-item="view" onClick={() => onGrabView()} className={tallRow}>
            <FiMonitor className="w-4 h-4 text-pg-text2" aria-hidden="true" />
            <span className="flex flex-col">
              Screen Grab Main Window
              <span className={detail}>The Playground as it is on screen</span>
            </span>
          </button>
          <button type="button" role="menuitem" data-screenshot-item="photos" onClick={() => onFromPhotos()} className={tallRow}>
            <FiImage className="w-4 h-4 text-pg-text2" aria-hidden="true" />
            <span className="flex flex-col">
              From Photos
              <span className={detail}>A screenshot taken with your device&rsquo;s buttons</span>
            </span>
          </button>
          <button type="button" role="menuitem" data-screenshot-item="paste" onClick={() => onPaste()} className={tallRow}>
            <FiClipboard className="w-4 h-4 text-pg-text2" aria-hidden="true" />
            <span className="flex flex-col">
              Paste
              <span className={detail}>A picture you have copied</span>
            </span>
          </button>
          <p className={`px-2 pt-2 leading-snug ${detail}`}>
            This browser does not let web pages capture the screen. You can crop each of these to a rectangle, oval, rounded rectangle or polygon.
          </p>
        </>
      )}
    </div>
  );
}
