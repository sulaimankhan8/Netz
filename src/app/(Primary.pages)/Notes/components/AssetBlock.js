'use client';

import { useState } from 'react';
import { LuFile, LuImage, LuLayoutDashboard, LuMaximize2, LuPenLine, LuRows, LuSquare } from 'react-icons/lu';
import { BTN_SECONDARY, ICON_BTN } from './ui';
import AssetViewer from './AssetViewer';
import { useAssetRecord, useAssetUrl } from './assetHooks';
import { formatBytes, typeLabel } from '../utils/assetCore';
import { safeImageSrc } from '../utils/importSafety';

export const KIND_ICON = { board: LuLayoutDashboard, image: LuImage, file: LuFile };
const KIND_NAME = { board: 'Board', image: 'Image', file: 'File' };

/**
 * A board, picture or file from the Assets library, inside a note (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, 2b).
 * It shows a preview, Large (note width) or as a small Card; a tap opens the full-screen viewer.
 * The block keeps the item's id and a small copy of its preview, so the note still shows something
 * on devices (or published pages) that do not have the item.
 */
export default function AssetBlock({ block, onUpdate, menuButton = null, onOpenBoard, readOnly = false }) {
  const ref = block.asset || {};
  const { record } = useAssetRecord(ref.id);
  const item = record || ref;
  const kind = item.kind || block.type;
  const preview = useAssetUrl(record ? ref.id : null, 'preview', safeImageSrc(ref.preview), record?.updatedAt);
  const [viewing, setViewing] = useState(false);
  const display = block.display === 'card' ? 'card' : 'large';
  const Icon = KIND_ICON[kind] || LuFile;
  const meta = [typeLabel(item), kind === 'board' && item.pageCount ? `${item.pageCount} page${item.pageCount === 1 ? '' : 's'}` : '', kind === 'file' && item.pageCount ? `${item.pageCount} pages` : '', item.bytes ? formatBytes(item.bytes) : '']
    .filter(Boolean)
    .join(' · ');

  const open = () => setViewing(true);
  const tile = (
    <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-nt-tray text-nt-text2" aria-hidden="true">
      <Icon className="w-4 h-4" />
    </span>
  );

  return (
    <div data-asset-block={kind} data-display={display} className="my-2 rounded-2xl border border-nt-line bg-nt-surface text-nt-ink overflow-hidden">
      <div className="flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 min-h-[56px]">
        {tile}
        <div className="flex-1 min-w-0">
          <p className="m-0 text-[14px] font-semibold truncate">{item.title || KIND_NAME[kind]}</p>
          <p className="m-0 text-xs text-nt-text2 truncate">{meta}</p>
        </div>
        {!readOnly && onUpdate && (
          <button
            type="button"
            onClick={() => onUpdate({ ...block, display: display === 'large' ? 'card' : 'large' })}
            className={ICON_BTN}
            aria-label={display === 'large' ? 'Show as a small card' : 'Show large'}
            title={display === 'large' ? 'Show as a small card' : 'Show large'}
          >
            {display === 'large' ? <LuRows className="w-[18px] h-[18px]" aria-hidden="true" /> : <LuSquare className="w-[18px] h-[18px]" aria-hidden="true" />}
          </button>
        )}
        {kind === 'board' && onOpenBoard && record && (
          <button type="button" onClick={() => onOpenBoard(record)} className={`${BTN_SECONDARY} !h-9 !px-3`} title="Open in Playground">
            <LuPenLine className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Open in Playground</span>
            <span className="sm:hidden">Edit</span>
          </button>
        )}
        <button type="button" onClick={open} className={ICON_BTN} aria-label="Open full screen" title="Open full screen">
          <LuMaximize2 className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
        {menuButton}
      </div>

      {display === 'large' ? (
        <button type="button" onClick={open} className="block w-full bg-white border-t border-nt-line" aria-label={`Open ${item.title || KIND_NAME[kind]}`}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={item.title || KIND_NAME[kind]} className="block w-full max-h-[480px] object-contain mx-auto" />
          ) : (
            <span className="flex flex-col items-center justify-center gap-2 h-40 text-[#55555A]">
              <Icon className="w-10 h-10" aria-hidden="true" />
              <span className="text-sm font-semibold">{typeLabel(item)}</span>
            </span>
          )}
        </button>
      ) : (
        <button type="button" onClick={open} className="flex items-center gap-3 w-full px-3.5 pb-3 text-left" aria-label={`Open ${item.title || KIND_NAME[kind]}`}>
          <span className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-white border border-nt-line flex items-center justify-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <Icon className="w-7 h-7 text-[#55555A]" aria-hidden="true" />
            )}
          </span>
          <span className="text-sm text-nt-text2">Tap to open</span>
        </button>
      )}

      {viewing && <AssetViewer asset={record || { ...ref, kind }} onClose={() => setViewing(false)} onOpenBoard={onOpenBoard} />}
    </div>
  );
}
