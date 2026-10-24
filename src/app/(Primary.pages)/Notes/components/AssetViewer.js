'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuChevronLeft, LuChevronRight, LuDownload, LuExternalLink, LuFile, LuMinus, LuPenLine, LuPlus, LuX } from 'react-icons/lu';
import { NT_FONT } from '../utils/fonts';
import { BTN_SECONDARY, ICON_BTN } from './ui';
import { assetMainBlob, readBoardPages } from '../utils/assetStore';
import { formatBytes, typeLabel } from '../utils/assetCore';
import { useAssetRecord, useAssetUrl } from './assetHooks';

const BAR_BTN = `${ICON_BTN} !text-white hover:!bg-white/10`;

/** Saves an item's file to the device: pictures and documents as they are, a board as a .netz file. */
export async function downloadAsset(asset) {
  if (!asset) return false;
  let blob;
  let name = asset.title || 'netz-item';
  if (asset.kind === 'board') {
    const data = await readBoardPages(asset.id);
    if (!data) return false;
    const { buildNetzFile, netzFileName } = await import('@/app/utils/netzFile');
    blob = new Blob([buildNetzFile({ kind: 'document', document: { title: asset.title, pages: data.pages } })], { type: 'application/json' });
    name = netzFileName(asset.title, 'board');
  } else {
    blob = await assetMainBlob(asset.id);
    if (!blob) return false;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

function PdfPages({ id, width }) {
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    let doc = null;
    (async () => {
      try {
        const blob = await assetMainBlob(id);
        if (!blob) throw new Error('missing');
        const { openPdf } = await import('../utils/pdfView');
        doc = await openPdf(blob);
        if (alive) setPdf(doc);
      } catch {
        if (alive) setError('This PDF could not be shown here. Download it to read it.');
      }
    })();
    return () => {
      alive = false;
      doc?.destroy?.();
    };
  }, [id]);
  if (error) return <p className="text-white/80 text-center p-8">{error}</p>;
  if (!pdf) return <p className="text-white/70 text-center p-8">Opening the PDF…</p>;
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {Array.from({ length: pdf.numPages }, (_, i) => (
        <PdfPage key={i} pdf={pdf} n={i + 1} width={width} />
      ))}
    </div>
  );
}

function PdfPage({ pdf, n, width }) {
  const holder = useRef(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const el = holder.current;
    if (!el || drawn) return undefined;
    const io = new IntersectionObserver(async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const { renderPdfPage } = await import('../utils/pdfView');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const canvas = await renderPdfPage(pdf, n, width * dpr, { background: true }).catch(() => null);
      if (!canvas || !holder.current) return;
      canvas.style.width = `${width}px`;
      canvas.style.height = 'auto';
      canvas.setAttribute('aria-label', `Page ${n}`);
      holder.current.replaceChildren(canvas);
      setDrawn(true);
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [pdf, n, width, drawn]);
  return (
    <div ref={holder} data-pdf-page={n} className="bg-white rounded shadow-lg" style={{ width, minHeight: drawn ? undefined : width * 1.3 }} />
  );
}

function BoardPages({ id, width, page, setPage, setCount }) {
  const holder = useRef(null);
  const [pages, setPages] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    readBoardPages(id).then((data) => {
      if (!alive) return;
      if (!data) setError('This board is not on this device yet.');
      else {
        setPages(data.pages);
        setCount(data.pages.length);
      }
    });
    return () => {
      alive = false;
    };
  }, [id, setCount]);
  useEffect(() => {
    if (!pages || !holder.current) return;
    let alive = true;
    import('../utils/boardRender').then(({ renderBoardPage }) =>
      renderBoardPage(pages[page] || pages[0], width * Math.min(2, window.devicePixelRatio || 1)).then((canvas) => {
        if (!alive || !holder.current) return;
        canvas.style.width = `${width}px`;
        canvas.style.height = 'auto';
        canvas.setAttribute('aria-label', `${pages[page]?.title || `Page ${page + 1}`}`);
        holder.current.replaceChildren(canvas);
      })
    );
    return () => {
      alive = false;
    };
  }, [pages, page, width]);

  // Swipe left or right to turn the page
  const start = useRef(null);
  if (error) return <p className="text-white/80 text-center p-8">{error}</p>;
  return (
    <div
      className="py-4 flex justify-center touch-pan-y"
      onPointerDown={(e) => {
        start.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (start.current === null || !pages) return;
        const dx = e.clientX - start.current;
        start.current = null;
        if (dx < -60) setPage((p) => Math.min(pages.length - 1, p + 1));
        else if (dx > 60) setPage((p) => Math.max(0, p - 1));
      }}
    >
      <div ref={holder} className="bg-white rounded shadow-lg overflow-hidden" style={{ width, minHeight: pages ? undefined : width * 0.6 }}>
        {!pages && <p className="text-nt-text2 text-center p-8">Opening the board…</p>}
      </div>
    </div>
  );
}

/**
 * Full-screen viewer for a board, picture or file (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, 2b):
 * pictures zoom, PDFs scroll through their pages, boards turn their pages (buttons or a swipe).
 * `asset` is a library record or the reference a note block keeps.
 */
export default function AssetViewer({ asset, onClose, onOpenBoard }) {
  const { record, loaded } = useAssetRecord(asset?.id);
  const item = record || asset;
  const mainUrl = useAssetUrl(item?.kind === 'image' && record ? item.id : null, 'main', '', record?.updatedAt);
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(item?.pageCount || 0);
  const [width, setWidth] = useState(800);
  const [message, setMessage] = useState(null);
  const ready = typeof document !== 'undefined';

  useEffect(() => {
    const fit = () => setWidth(Math.min(900, window.innerWidth - 32));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (item?.kind === 'board' && e.key === 'ArrowRight') setPage((p) => Math.min(Math.max(0, count - 1), p + 1));
      if (item?.kind === 'board' && e.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, item?.kind, count]);

  if (!ready || !item) return null;
  const missing = loaded && !record;
  const isPdf = item.kind === 'file' && (item.mime === 'application/pdf' || /\.pdf$/i.test(item.title || ''));

  const download = async () => {
    const ok = await downloadAsset(record);
    if (!ok) setMessage('This item could not be downloaded on this device.');
  };
  const openInTab = async () => {
    const blob = await assetMainBlob(item.id);
    if (!blob) return setMessage('This item could not be opened on this device.');
    window.open(URL.createObjectURL(blob), '_blank', 'noopener');
  };

  return createPortal(
    <div className={`${NT_FONT} fixed inset-0 z-[260] flex flex-col bg-[#111113]/95 text-white`} role="dialog" aria-modal="true" aria-label={item.title || 'Viewer'}>
      <div className="flex items-center gap-1 h-14 px-2 shrink-0 border-b border-white/10">
        <button type="button" onClick={onClose} className={BAR_BTN} aria-label="Close the viewer">
          <LuX className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0 px-1">
          <p className="m-0 truncate text-[15px] font-semibold">{item.title || 'Untitled'}</p>
          <p className="m-0 text-xs text-white/60">
            {typeLabel(item)}
            {item.bytes ? ` · ${formatBytes(item.bytes)}` : ''}
            {item.kind === 'board' && count ? ` · page ${page + 1} of ${count}` : ''}
          </p>
        </div>
        {item.kind === 'image' && !missing && (
          <>
            <button type="button" className={BAR_BTN} aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, z / 1.5))}>
              <LuMinus className="w-5 h-5" aria-hidden="true" />
            </button>
            <button type="button" className={BAR_BTN} aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(6, z * 1.5))}>
              <LuPlus className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}
        {item.kind === 'board' && !missing && onOpenBoard && (
          <button type="button" onClick={() => onOpenBoard(item)} className={`${BTN_SECONDARY} !bg-white/10 !text-white hover:!bg-white/20 !h-10`}>
            <LuPenLine className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Open in Playground</span>
            <span className="sm:hidden">Edit</span>
          </button>
        )}
        {item.kind === 'file' && !isPdf && !missing && (
          <button type="button" className={BAR_BTN} aria-label="Open in a new tab" title="Open in a new tab" onClick={openInTab}>
            <LuExternalLink className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        {!missing && (
          <button type="button" className={BAR_BTN} aria-label="Download" title="Download" onClick={download}>
            <LuDownload className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {message && (
        <p role="status" className="m-0 px-4 py-2 text-sm bg-white/10 text-center">
          {message}
        </p>
      )}

      <div className="relative flex-1 overflow-auto">
        {missing ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            {asset.preview && <img src={asset.preview} alt="" className="max-w-full max-h-[50vh] rounded bg-white" />}
            <p className="m-0 text-white/80 max-w-sm">This item is not in the library on this device. Sign in on the device it was made on, or ask for it as a file.</p>
          </div>
        ) : item.kind === 'image' ? (
          <div
            className="min-h-full flex items-center justify-center p-4"
            onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2.5))}
          >
            {mainUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainUrl} alt={item.title || 'Picture'} style={{ width: zoom === 1 ? undefined : `${zoom * 100}%`, maxWidth: zoom === 1 ? '100%' : 'none' }} className="max-h-none object-contain bg-white" />
            ) : (
              <p className="text-white/70">Loading…</p>
            )}
          </div>
        ) : item.kind === 'board' ? (
          <BoardPages id={item.id} width={width} page={page} setPage={setPage} setCount={setCount} />
        ) : isPdf ? (
          <PdfPages id={item.id} width={width} />
        ) : (
          <div className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center">
              <LuFile className="w-12 h-12" aria-hidden="true" />
            </span>
            <p className="m-0 text-lg font-semibold">{typeLabel(item)} file</p>
            <p className="m-0 text-white/70 max-w-sm">NETZ cannot show this kind of file inside the app. Open it in a new tab, or download it.</p>
            <div className="flex gap-2">
              <button type="button" onClick={openInTab} className={`${BTN_SECONDARY} !bg-white !text-[#111113]`}>
                <LuExternalLink className="w-4 h-4" aria-hidden="true" />
                Open
              </button>
              <button type="button" onClick={download} className={`${BTN_SECONDARY} !bg-white/10 !text-white`}>
                <LuDownload className="w-4 h-4" aria-hidden="true" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>

      {item.kind === 'board' && count > 1 && !missing && (
        <div className="flex items-center justify-center gap-3 h-16 shrink-0 border-t border-white/10">
          <button type="button" className={BAR_BTN} aria-label="Previous page" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            <LuChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <span className="text-sm tabular-nums">
            {page + 1} / {count}
          </span>
          <button type="button" className={BAR_BTN} aria-label="Next page" disabled={page >= count - 1} onClick={() => setPage((p) => Math.min(count - 1, p + 1))}>
            <LuChevronRight className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
