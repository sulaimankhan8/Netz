'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ScreenshotEditor from './ScreenshotEditor';
import { canCaptureScreen, captureScreenFrame } from '../../utils/screenCapture';

const MODE_KEY = 'netz_playground_screenshot_mode';
const HIDE_DELAY_MS = 3000; // "Hide Current Window During Screenshot": time to switch windows
const MAX_PICTURE_SIDE = 4096; // a photo larger than this is scaled down before cropping

/** A picture (data URL, object URL) drawn onto a canvas at its own size, at most MAX_PICTURE_SIDE. */
function pictureToCanvas(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_PICTURE_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}

async function blobToCanvas(blob) {
  const url = URL.createObjectURL(blob);
  try {
    return await pictureToCanvas(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function isTyping(el) {
  if (!el) return false;
  return el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'MATH-FIELD';
}

/**
 * Insert > Screenshot. Every way in (screen capture, the Playground view, a photo, a pasted
 * picture) ends in the same screenshot editor, where the part to keep is chosen in one of the
 * four shapes and marked up; Finish puts it on the page as a picture.
 *
 * @param {Object} options
 * @param {() => Promise<HTMLCanvasElement>} options.renderView - The Playground view as a picture
 * @param {(dataUrl: string) => void} options.onInsert - Puts the finished screenshot on the page
 * @param {(message: string, durationMs?: number) => void} options.showNotice
 * @param {boolean} options.coarse - A touch screen (bigger handles, toolbar at the bottom)
 * @returns the menu's state and actions, and `elements` to render (editor, countdown, file input)
 */
export default function useScreenshot({ renderView, onInsert, showNotice, coarse = false }) {
  const [editor, setEditor] = useState(null); // { source: canvas, shape }
  const [countdown, setCountdown] = useState(0);
  const [mode, setMode] = useState('screenshot'); // what the Screenshot button does: 'screenshot' | 'hide'
  const [canCapture, setCanCapture] = useState(false);
  const busyRef = useRef(false);
  const photoInputRef = useRef(null);
  const photoShapeRef = useRef('rect');

  useEffect(() => {
    // Checked in the browser, not guessed from the device's name
    setCanCapture(canCaptureScreen());
    try {
      if (localStorage.getItem(MODE_KEY) === 'hide') setMode('hide');
    } catch (e) {}
  }, []);

  const openEditor = useCallback((source, shape = 'rect') => setEditor({ source, shape }), []);

  /** Capture the screen (the browser asks what to share), then crop. hide: count down first. */
  const capture = useCallback(
    async (shape = 'rect', { hide = false, remember = false } = {}) => {
      if (remember) {
        setMode(hide ? 'hide' : 'screenshot');
        try {
          localStorage.setItem(MODE_KEY, hide ? 'hide' : 'screenshot');
        } catch (e) {}
      }
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const source = await captureScreenFrame({ delayMs: hide ? HIDE_DELAY_MS : 0, onCountdown: setCountdown });
        openEditor(source, shape);
      } catch (err) {
        // Closing the browser's picker is a cancel, as Escape is in WPS: nothing to say
        const cancelled = err && err.name === 'NotAllowedError' && !/system/i.test(err.message || '');
        if (!cancelled) {
          showNotice(
            err && err.name === 'NotAllowedError'
              ? 'Screen capture is turned off for this browser in your computer’s settings. Screen Grab Main Window still works.'
              : 'The screen could not be captured. Screen Grab Main Window still works.',
            6000
          );
        }
      } finally {
        busyRef.current = false;
        setCountdown(0);
      }
    },
    [openEditor, showNotice]
  );

  /** Screen Grab Main Window: the Playground as it is on screen, without the toolbars. */
  const grabView = useCallback(
    async (shape = 'rect') => {
      try {
        openEditor(await renderView(), shape);
      } catch (err) {
        console.error('Playground view capture failed:', err);
        showNotice('The Playground view could not be captured.');
      }
    },
    [renderView, openEditor, showNotice]
  );

  const fromPhotos = useCallback((shape = 'rect') => {
    photoShapeRef.current = shape;
    photoInputRef.current?.click();
  }, []);

  const onPhotoChosen = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // the same photo can be chosen again
    if (!file) return;
    try {
      openEditor(await blobToCanvas(file), photoShapeRef.current);
    } catch (err) {
      showNotice('That picture could not be read.');
    }
  };

  /** Paste: the picture on the clipboard, cropped like a screenshot. */
  const paste = useCallback(
    async (shape = 'rect') => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('no clipboard reading');
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const type = item.types.find((t) => t.startsWith('image/'));
          if (type) {
            openEditor(await blobToCanvas(await item.getType(type)), shape);
            return;
          }
        }
        showNotice('There is no picture on the clipboard. Copy a picture first.');
      } catch (err) {
        showNotice('This browser did not allow reading the clipboard. Use From Photos instead.', 5000);
      }
    },
    [openEditor, showNotice]
  );

  // Ctrl+Alt+X: Screenshot. Ctrl+Alt+C: Hide Current Window During Screenshot. Not while typing:
  // on some keyboards Ctrl+Alt is AltGr, which types letters.
  useEffect(() => {
    if (!canCapture) return undefined;
    const onKey = (e) => {
      if (!e.ctrlKey || !e.altKey || e.shiftKey || e.metaKey || editor) return;
      if (isTyping(document.activeElement)) return;
      const key = (e.key || '').toLowerCase();
      const which = key === 'x' || e.code === 'KeyX' ? 'x' : key === 'c' || e.code === 'KeyC' ? 'c' : null;
      if (!which) return;
      e.preventDefault();
      capture('rect', { hide: which === 'c' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canCapture, capture, editor]);

  const finish = useCallback(
    (dataUrl) => {
      setEditor(null);
      onInsert(dataUrl);
    },
    [onInsert]
  );
  const cancel = useCallback(() => setEditor(null), []);

  const elements = (
    <>
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChosen} data-screenshot-photo-input tabIndex={-1} aria-hidden="true" />
      {countdown > 0 && (
        <div className="fixed inset-x-0 top-6 z-[90] flex justify-center pointer-events-none" role="status" aria-live="polite" data-screenshot-countdown>
          <div className="px-4 py-2.5 rounded-2xl bg-black/80 text-white text-sm font-semibold shadow-2xl text-center">
            Screenshot in {countdown}
            <div className="text-[11px] font-normal text-white/75">Switch to the window you want to capture</div>
          </div>
        </div>
      )}
      {editor && <ScreenshotEditor source={editor.source} initialShape={editor.shape} coarse={coarse} onFinish={finish} onCancel={cancel} onNotice={showNotice} />}
    </>
  );

  return { canCapture, mode, capture, grabView, fromPhotos, paste, editorOpen: Boolean(editor), elements };
}
