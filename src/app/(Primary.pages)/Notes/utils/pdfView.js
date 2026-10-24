'use client';

/**
 * PDF pages as pictures, with Mozilla's pdf.js, loaded only when a PDF is shown. The worker file
 * is served from /pdfjs/ (copied from node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs;
 * copy it again after updating pdfjs-dist). Scripts inside PDFs are never run (isEvalSupported off,
 * no scripting).
 */

let libPromise = null;

function pdfjs() {
  if (!libPromise) {
    libPromise = import('pdfjs-dist/legacy/build/pdf.mjs').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
      return lib;
    });
  }
  return libPromise;
}

export async function openPdf(blob) {
  const lib = await pdfjs();
  const data = new Uint8Array(await blob.arrayBuffer());
  return lib.getDocument({ data, isEvalSupported: false, enableXfa: false, disableAutoFetch: true, disableStream: true }).promise;
}

/**
 * Page `n` (from 1) drawn `width` px wide on a white canvas. `background: true` draws without
 * waiting for animation frames (pdf.js's normal drawing pauses while the page is not on screen),
 * for previews made while a file is being added.
 */
export async function renderPdfPage(pdf, n, width, { background = false } = {}) {
  const page = await pdf.getPage(n);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / base.width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, ...(background ? { intent: 'print' } : {}) }).promise;
  page.cleanup?.();
  return canvas;
}
