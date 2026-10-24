'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LuCamera, LuCloud, LuCloudOff, LuDownload, LuFile, LuImage, LuLayoutDashboard, LuMoreHorizontal, LuPenLine, LuPencil, LuPlus, LuSearch, LuTrash2, LuUpload, LuX } from 'react-icons/lu';
import { BTN_MAIN, BTN_SECONDARY, FIELD, FIELD_INPUT, ICON_BTN, Menu, Modal, TOUCH, chipClass } from './ui';
import AssetViewer, { downloadAsset } from './AssetViewer';
import { useAssetUrl } from './assetHooks';
import { ACCEPT_ATTR, DEVICE_ASSET_BYTES, formatBytes, typeLabel } from '../utils/assetCore';
import { ASSETS_EVENT, addFileAsset, deleteAsset, listAssets, moveBannersIntoLibrary, renameAsset, restoreAsset } from '../utils/assetStore';
import { ASSETS_CLOUD_EVENT, cloudAssetStatus, syncAssetsSoon } from '../utils/assetCloud';
import { getNotes } from '../utils/noteStorage';

/** Titles of the notes that show this item (as a block or as their banner). */
export function notesUsingAsset(id) {
  return getNotes()
    .filter((n) => (n.blocks || []).some((b) => b.asset?.id === id) || (n.look?.cover?.kind === 'image' && n.look.cover.value === id))
    .map((n) => n.title || 'Untitled note');
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'board', label: 'Boards', Icon: LuLayoutDashboard },
  { value: 'image', label: 'Images', Icon: LuImage },
  { value: 'file', label: 'Files', Icon: LuFile },
];
const KIND_ICON = { board: LuLayoutDashboard, image: LuImage, file: LuFile };

let bannersMoved = false;

function AssetCard({ asset, pick, onOpen, onAction, isPhone }) {
  const preview = useAssetUrl(asset.id, 'preview', '', asset.updatedAt);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(asset.title);
  const moreRef = useRef(null);
  const Icon = KIND_ICON[asset.kind] || LuFile;

  const items = [
    ...(onAction.insert ? [{ id: 'insert', label: 'Insert into note', icon: <LuPlus className="w-[18px] h-[18px]" />, onSelect: () => onAction.insert(asset) }] : []),
    ...(asset.kind === 'board' && onAction.openBoard ? [{ id: 'board', label: 'Open in Playground', icon: <LuPenLine className="w-[18px] h-[18px]" />, onSelect: () => onAction.openBoard(asset) }] : []),
    { id: 'rename', label: 'Rename', icon: <LuPencil className="w-[18px] h-[18px]" />, onSelect: () => setRenaming(true) },
    { id: 'download', label: 'Download', icon: <LuDownload className="w-[18px] h-[18px]" />, onSelect: () => onAction.download(asset) },
    'divider',
    { id: 'delete', label: 'Delete', danger: true, icon: <LuTrash2 className="w-[18px] h-[18px]" />, onSelect: () => onAction.remove(asset) },
  ];

  return (
    <li data-asset-card={asset.kind} className="relative flex flex-col rounded-2xl border border-nt-line bg-nt-surface overflow-hidden">
      <button type="button" onClick={() => onOpen(asset)} className="block aspect-[4/3] bg-white border-b border-nt-line" aria-label={pick ? `Insert ${asset.title}` : `Open ${asset.title}`}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-contain" />
        ) : (
          <span className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[#55555A]">
            <Icon className="w-9 h-9" aria-hidden="true" />
            <span className="text-xs font-bold">{typeLabel(asset)}</span>
          </span>
        )}
      </button>
      <div className="flex items-start gap-1 pl-3 pr-1 py-2">
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              autoFocus
              value={draft}
              aria-label="New name"
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                setRenaming(false);
                if (draft.trim() && draft !== asset.title) renameAsset(asset.id, draft.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  setDraft(asset.title);
                  setRenaming(false);
                }
              }}
              className="w-full h-8 px-2 rounded-lg border border-nt-accent bg-nt-surface text-[13px] outline-none"
            />
          ) : (
            <p className="m-0 text-[13px] font-semibold truncate" title={asset.title}>
              {asset.title}
            </p>
          )}
          <p className="m-0 text-xs text-nt-text2 truncate">
            {typeLabel(asset)} · {formatBytes(asset.bytes)}
            {asset.syncState === 'over' ? ' · on this device only' : ''}
          </p>
        </div>
        {!pick && (
          <>
            <button
              ref={moreRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={`Options for ${asset.title}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`${ICON_BTN} !w-9 !h-9`}
            >
              <LuMoreHorizontal className="w-5 h-5" aria-hidden="true" />
            </button>
            {menuOpen && <Menu title={asset.title} items={items} isPhone={isPhone} anchorRef={moreRef} onClose={() => setMenuOpen(false)} />}
          </>
        )}
      </div>
    </li>
  );
}

/**
 * The Notes Studio Assets library (NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, 2b): boards saved from
 * the Playground, pictures and files, as a grid of preview cards with All · Boards · Images · Files,
 * search and Upload. mode 'pick' turns it into the "From Assets" picker of the note editor.
 */
export default function AssetLibrary({ isPhone, mode = 'browse', onPick, onClose, onNotify, onInsertIntoNote, onOpenBoard }) {
  const pick = mode === 'pick';
  const [assets, setAssets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [cloud, setCloud] = useState(() => cloudAssetStatus());
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { asset, usedIn: [titles] }
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const reload = useCallback(() => {
    listAssets().then((list) => {
      setAssets(list);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    reload();
    const onChange = () => reload();
    const onCloud = () => setCloud(cloudAssetStatus());
    window.addEventListener(ASSETS_EVENT, onChange);
    window.addEventListener(ASSETS_CLOUD_EVENT, onCloud);
    if (!bannersMoved) {
      bannersMoved = true;
      moveBannersIntoLibrary().then((n) => n && reload()).catch(() => {});
    }
    syncAssetsSoon(0);
    return () => {
      window.removeEventListener(ASSETS_EVENT, onChange);
      window.removeEventListener(ASSETS_CLOUD_EVENT, onCloud);
    };
  }, [reload]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => (filter === 'all' || a.kind === filter) && (!q || (a.title || '').toLowerCase().includes(q)));
  }, [assets, filter, query]);
  const deviceBytes = assets.reduce((s, a) => s + (a.cloudOnly ? 0 : a.bytes || 0), 0);

  const upload = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setError(null);
    let added = 0;
    for (let i = 0; i < list.length; i++) {
      setBusy(list.length > 1 ? `Adding ${i + 1} of ${list.length}…` : `Adding ${list[i].name}…`);
      try {
        await addFileAsset(list[i]);
        added++;
      } catch (err) {
        setError(`${list[i].name}: ${err.message || 'could not be added.'}`);
      }
    }
    setBusy(null);
    if (added && onNotify) onNotify({ message: added === 1 ? 'Added to Assets' : `${added} items added to Assets` });
  };

  const actions = {
    insert: onInsertIntoNote ? (a) => onInsertIntoNote(a) : null,
    openBoard: onOpenBoard,
    download: async (a) => {
      const ok = await downloadAsset(a);
      if (!ok) setError(`${a.title} could not be downloaded on this device.`);
    },
    remove: (a) => {
      const usedIn = notesUsingAsset(a.id);
      if (usedIn.length) setConfirmDelete({ asset: a, usedIn });
      else actions.reallyRemove(a);
    },
    reallyRemove: async (a) => {
      setConfirmDelete(null);
      const removed = await deleteAsset(a.id);
      if (removed && onNotify) {
        onNotify({
          message: `Deleted ${a.title}. Notes that use it keep a small preview.`,
          actionLabel: 'Undo',
          onAction: () => {
            restoreAsset(removed);
            onNotify(null);
          },
        });
      }
    },
  };

  const openCard = (a) => (pick ? onPick(a) : setViewing(a));

  return (
    <Modal title={pick ? 'Insert from Assets' : 'Assets'} isPhone={isPhone} onClose={onClose} width="max-w-[880px]">
      <div
        className={`px-5 pt-3 pb-6 flex flex-col gap-3 min-h-[50vh] ${dragging ? 'ring-2 ring-nt-accent ring-inset' : ''}`}
        onDragOver={(e) => {
          if (e.dataTransfer?.types?.includes('Files')) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${FIELD} flex-1 min-w-[180px]`}>
            <LuSearch className="w-[18px] h-[18px] text-nt-text2 shrink-0" aria-hidden="true" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets" aria-label="Search assets" className={FIELD_INPUT} />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className={`w-7 h-7 ${TOUCH} flex items-center justify-center rounded-lg text-nt-text2`}>
                <LuX className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </label>
          <input ref={fileRef} type="file" multiple accept={ACCEPT_ATTR} className="hidden" onChange={(e) => {
            upload(e.target.files);
            e.target.value = '';
          }} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
            upload(e.target.files);
            e.target.value = '';
          }} />
          {isPhone && (
            <button type="button" onClick={() => cameraRef.current?.click()} className={BTN_SECONDARY} disabled={!!busy}>
              <LuCamera className="w-4 h-4" aria-hidden="true" />
              Camera
            </button>
          )}
          <button type="button" onClick={() => fileRef.current?.click()} className={BTN_MAIN} disabled={!!busy}>
            <LuUpload className="w-4 h-4" aria-hidden="true" />
            Upload
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto nt-noscroll" role="group" aria-label="Show">
          {FILTERS.map((f) => {
            const n = f.value === 'all' ? assets.length : assets.filter((a) => a.kind === f.value).length;
            return (
              <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)} className={chipClass(filter === f.value)}>
                {f.Icon && <f.Icon className="w-3.5 h-3.5" aria-hidden="true" />}
                {f.label}
                <span className="opacity-75 tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>

        {(busy || error) && (
          <p role="status" className={`m-0 text-sm ${error ? 'text-nt-danger' : 'text-nt-text2'}`}>
            {busy || error}
          </p>
        )}

        {!loaded ? (
          <p className="m-0 text-sm text-nt-text2">Opening the library…</p>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <LuLayoutDashboard className="w-10 h-10 text-nt-text2" aria-hidden="true" />
            <p className="m-0 font-semibold">{assets.length ? 'Nothing matches' : 'Your library is empty'}</p>
            <p className="m-0 text-sm text-nt-text2 max-w-sm">
              {assets.length
                ? 'Try another search or filter.'
                : 'Save a board from the Playground (Export → Save to Notes Studio), or upload pictures and files. You can then put them in any note.'}
            </p>
          </div>
        ) : (
          <ul className={`m-0 p-0 list-none grid gap-3 ${isPhone ? 'grid-cols-2' : 'grid-cols-3 md:grid-cols-4'}`}>
            {shown.map((a) => (
              <AssetCard key={a.id} asset={a} pick={pick} onOpen={openCard} onAction={actions} isPhone={isPhone} />
            ))}
          </ul>
        )}

        <div className="mt-auto pt-3 border-t border-nt-line flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-nt-text2">
          <span>
            On this device: {formatBytes(deviceBytes)} of {formatBytes(DEVICE_ASSET_BYTES)}
          </span>
          {cloud.signedIn ? (
            <span className="inline-flex items-center gap-1">
              <LuCloud className="w-3.5 h-3.5" aria-hidden="true" />
              {cloud.quota ? `In your account: ${formatBytes(cloud.used || 0)} of ${formatBytes(cloud.quota)}` : 'Saving to your account…'}
              {cloud.full ? ' · full: new items stay on this device' : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <LuCloudOff className="w-3.5 h-3.5" aria-hidden="true" />
              Sign in to keep your library on every device
            </span>
          )}
          {!isPhone && <span className="ml-auto">You can also drop files here</span>}
        </div>
      </div>
      {viewing && <AssetViewer asset={viewing} onClose={() => setViewing(null)} onOpenBoard={onOpenBoard} />}
      {confirmDelete && (
        <Modal title="Delete this item?" isPhone={isPhone} onClose={() => setConfirmDelete(null)} width="max-w-[440px]">
          <div className="px-6 pt-2 pb-6 flex flex-col gap-3">
            <p className="m-0 text-[15px]">
              <strong>{confirmDelete.asset.title}</strong> is used in {confirmDelete.usedIn.length === 1 ? 'this note' : `these ${confirmDelete.usedIn.length} notes`}:
            </p>
            <ul className="m-0 pl-5 text-[15px] text-nt-text2">
              {confirmDelete.usedIn.slice(0, 8).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
              {confirmDelete.usedIn.length > 8 && <li>and {confirmDelete.usedIn.length - 8} more</li>}
            </ul>
            <p className="m-0 text-sm text-nt-text2">Those notes will keep a small preview, but it will no longer open full screen.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className={BTN_SECONDARY} onClick={() => setConfirmDelete(null)}>
                Keep it
              </button>
              <button type="button" className={`${BTN_SECONDARY} !bg-nt-danger !text-white`} onClick={() => actions.reallyRemove(confirmDelete.asset)}>
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
