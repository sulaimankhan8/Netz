'use client';

import React from 'react';
import { FiDownload, FiChevronRight, FiCopy, FiTrash2, FiMaximize, FiMinus, FiPlus } from 'react-icons/fi';
import { LuBookOpen, LuFileUp, LuHand, LuMusic, LuRedo2, LuSlidersHorizontal } from 'react-icons/lu';
import { BrushCleaning } from 'lucide-react';
import { Dialog, TOUCH_TARGET } from './ui/Dialog';
import { MENU_ROW, SECTION_LABEL, Segmented, SwitchRow, BTN_SECONDARY } from './ui/parts';
import { UI } from '../utils/uiText';
import useIsPro from '@/app/utils/useIsPro';

const PAGE_BACKGROUNDS = [
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'lines', label: 'Lines' },
  { value: 'none', label: 'Plain' },
];

const READ_MODES = [
  { value: 'off', label: UI.readOff, hint: 'Never read handwriting' },
  { value: 'select', label: UI.readSelect, hint: 'Read ink you circle with the lasso' },
  { value: 'live', label: UI.readLive, hint: 'Read as you write and show the readings' },
];

const icon = 'w-5 h-5 shrink-0 text-pg-text2';
const divider = <div className="h-px bg-pg-line my-1.5 mx-1" />;

/** Preferences: what one finger does, and when handwriting is read. */
export function PreferencesDialog({ isMobile, onClose, fingerDraws, setFingerDraws, readMode, setReadMode, notesMode }) {
  return (
    <Dialog title={UI.preferences} isMobile={isMobile} onClose={onClose} width="w-[460px]" fullHeight={false}>
      <div>
        <div className={SECTION_LABEL}>One finger</div>
        <Segmented
          radio
          label="One finger"
          value={fingerDraws ? 'draws' : 'moves'}
          onChange={(v) => setFingerDraws(v === 'draws')}
          options={[
            { value: 'draws', label: 'Draws' },
            { value: 'moves', label: 'Moves the page' },
          ]}
        />
        <p className="mt-1.5 text-pg-cap text-pg-text2">Two fingers always move and zoom the page. A pen and a mouse always draw.</p>
      </div>
      <div>
        <div className={SECTION_LABEL}>{UI.readMyWriting}</div>
        <Segmented
          radio
          label={UI.readMyWriting}
          value={readMode}
          onChange={setReadMode}
          options={READ_MODES.map((m) => ({ value: m.value, label: m.label, title: m.hint }))}
        />
        <p className="mt-1.5 text-pg-cap text-pg-text2">
          {READ_MODES.find((m) => m.value === readMode)?.hint}.{notesMode ? ` ${UI.writingMode} is on, so this is set to “${UI.readLive}”.` : ''}
        </p>
      </div>
    </Dialog>
  );
}

/**
 * Everything about the page (the ⋯ menu): Writing mode, background, Move page when the dock has
 * no room for it, Export, Focus music, Preferences, then Duplicate, Clear and Delete.
 * On phones it also holds Zoom, Redo and Send to Notes (the laptop has them in its top bars).
 *
 * run(fn) closes the menu before fn runs.
 */
export default function PageMenu({
  isMobile,
  run,
  notesMode,
  setNotesMode,
  gridStyle,
  setGridStyle,
  showMove,
  activeTool,
  setActiveTool,
  onOpenSyncModal,
  onExportCanvas,
  onOpenMusic,
  onOpenPreferences,
  onDuplicatePage,
  onClearPage,
  onDeletePage,
  canDelete,
  onRedo,
  canRedo,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToContent,
}) {
  const pro = useIsPro();
  const square = `w-11 h-11 ${TOUCH_TARGET} flex items-center justify-center rounded-xl bg-pg-tray text-pg-ink hover:bg-pg-line`;
  const more = isMobile ? <FiChevronRight className="w-4 h-4 ml-auto text-pg-muted" aria-hidden="true" /> : null;

  return (
    <div className={`flex flex-col ${isMobile ? '' : 'w-[300px]'}`}>
      {setNotesMode && (
        <SwitchRow
          checked={notesMode}
          // The menu closes, as before, so the next press writes on the page
          onChange={(on) => run(() => setNotesMode(on))()}
          label={UI.writingMode}
          detail="Reads your writing as you go"
          title={notesMode ? 'Writing mode is on: lined paper, reading as you write' : 'Writing mode: lined paper, reading as you write'}
          icon={<LuBookOpen className={icon} aria-hidden="true" />}
        />
      )}

      <div className="px-1 pt-2 pb-1">
        <div className={SECTION_LABEL}>
          {UI.background}
          {notesMode ? ' (lines while Writing mode is on)' : ''}
        </div>
        <Segmented label="Page background" value={gridStyle} onChange={setGridStyle} disabled={notesMode} options={PAGE_BACKGROUNDS} />
      </div>

      {isMobile && onZoomIn && (
        <div className="flex items-center gap-1.5 px-3 min-h-[52px]">
          <span className="flex-1 text-pg-body font-medium text-pg-ink">{UI.zoom}</span>
          <button type="button" onClick={onZoomOut} title="Zoom Out (Ctrl -)" aria-label="Zoom Out" className={square}>
            <FiMinus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onResetZoom} title="Reset Zoom to 100% (Ctrl 0)" aria-label="Reset Zoom to 100%" className={`h-11 min-w-[56px] ${TOUCH_TARGET} rounded-xl text-pg-body font-semibold tabular-nums text-pg-ink hover:bg-pg-tray`}>
            {Math.round(zoomLevel * 100)}%
          </button>
          <button type="button" onClick={onZoomIn} title="Zoom In (Ctrl +)" aria-label="Zoom In" className={square}>
            <FiPlus className="w-4 h-4" />
          </button>
          {onFitToContent && (
            <button type="button" onClick={run(onFitToContent)} title="Fit to content" aria-label={UI.fit} className={`h-11 ${TOUCH_TARGET} px-3.5 flex items-center gap-1.5 rounded-xl bg-pg-tray text-pg-label font-semibold text-pg-ink hover:bg-pg-line`}>
              <FiMaximize className="w-4 h-4" aria-hidden="true" />
              Fit
            </button>
          )}
        </div>
      )}

      {showMove && (
        <button
          type="button"
          onClick={run(() => setActiveTool('pan'))}
          title="Move page - key M"
          aria-label={UI.movePage}
          aria-pressed={activeTool === 'pan'}
          className={`${MENU_ROW} ${activeTool === 'pan' ? 'bg-pg-ink text-pg-on-ink hover:bg-pg-ink' : ''}`}
        >
          <LuHand className={`w-5 h-5 shrink-0 ${activeTool === 'pan' ? '' : 'text-pg-text2'}`} aria-hidden="true" />
          {UI.movePage}
        </button>
      )}

      {divider}

      {isMobile && onRedo && (
        <button type="button" onClick={run(onRedo)} disabled={!canRedo} title="Redo (Ctrl+Shift+Z, or tap with three fingers)" aria-label={UI.redo} className={MENU_ROW}>
          <LuRedo2 className={icon} aria-hidden="true" />
          {UI.redo}
        </button>
      )}
      {isMobile && onOpenSyncModal && (
        <button type="button" onClick={run(onOpenSyncModal)} title="Send typed blocks to a new note" aria-label={UI.sendToNotes} className={MENU_ROW}>
          <LuFileUp className={icon} aria-hidden="true" />
          {UI.sendToNotes}
          {more}
        </button>
      )}
      {onExportCanvas && (
        <div className="flex items-center gap-1.5 pl-3 pr-1 min-h-[48px]">
          <FiDownload className={icon} aria-hidden="true" />
          <span className="flex-1 ml-1.5 text-pg-body font-medium text-pg-ink">{UI.export}</span>
          {['PNG', 'SVG', 'PDF'].map((format) => (format === 'SVG' && !pro ? (
            // SVG comes with Pro: this opens Pricing in a new tab so the page stays as it is
            <a key={format} href="/Pricing" target="_blank" rel="noopener" title="SVG export comes with NETZ Pro" aria-label="SVG export comes with NETZ Pro: see Pricing" className={`${BTN_SECONDARY} px-2.5 inline-flex items-center gap-1 text-pg-muted`}>
              {format}<span className="text-[12px] font-bold">PRO</span>
            </a>
          ) : (
            <button key={format} type="button" onClick={run(() => onExportCanvas(format))} title={`Export this page as ${format}`} aria-label={`Export as ${format}`} className={`${BTN_SECONDARY} px-2.5`}>
              {format}
            </button>
          )))}
        </div>
      )}
      {onOpenMusic && (
        <button type="button" onClick={run(onOpenMusic)} aria-label={UI.focusMusic} className={MENU_ROW}>
          <LuMusic className={icon} aria-hidden="true" />
          {UI.focusMusic}
          {more}
        </button>
      )}
      <button type="button" onClick={run(onOpenPreferences)} aria-label={UI.preferences} className={MENU_ROW}>
        <LuSlidersHorizontal className={icon} aria-hidden="true" />
        {UI.preferences}
        {more}
      </button>

      {divider}

      {onDuplicatePage && (
        <button type="button" onClick={run(onDuplicatePage)} title={UI.duplicatePage} aria-label={UI.duplicatePage} className={MENU_ROW}>
          <FiCopy className={icon} aria-hidden="true" />
          {UI.duplicatePage}
        </button>
      )}
      {onClearPage && (
        <button type="button" onClick={run(onClearPage)} title={`${UI.clearPage} (ink, shapes and blocks)`} aria-label={UI.clearPage} className={`${MENU_ROW} !text-pg-danger`}>
          <BrushCleaning className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          {UI.clearPage}
        </button>
      )}
      {onDeletePage && canDelete && (
        <button type="button" onClick={run(onDeletePage)} title={UI.deletePage} aria-label={UI.deletePage} className={`${MENU_ROW} !text-pg-danger`}>
          <FiTrash2 className="w-5 h-5 shrink-0" aria-hidden="true" />
          {UI.deletePage}
        </button>
      )}
    </div>
  );
}
