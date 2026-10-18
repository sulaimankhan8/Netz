'use client';

import { useRef, useState } from 'react';
import { LuFileText, LuGlobe, LuLock, LuMoreHorizontal, LuPanelLeft, LuPin, LuPinOff, LuPlus, LuSearch, LuTrash2, LuX } from 'react-icons/lu';
import { chipClass, FIELD, FIELD_INPUT, ICON_BTN, BTN_MAIN, Menu, Segmented, TOUCH } from './ui';
import { NoteIcon, STATUSES, StatusBadge, lookColour } from '../utils/noteLook';

/**
 * The list of notes (NOTES_VISUAL_REDESIGN_PLAN.md, section 2). On laptops and tablets it sits
 * beside the note; on phones it is the whole first screen.
 */
export default function NoteSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onTogglePinNote,
  onHide,
  isPhone,
  tagColours = {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'private', 'public'
  const [selectedStatus, setSelectedStatus] = useState(null);

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));
  const q = searchQuery.toLowerCase();

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(q) ||
      (note.subtitle && note.subtitle.toLowerCase().includes(q)) ||
      (note.tags && note.tags.some((t) => t.toLowerCase().includes(q))) ||
      (note.blocks && note.blocks.some((b) => b.content && b.content.toLowerCase().includes(q)));

    const matchesTag = selectedTag ? note.tags && note.tags.includes(selectedTag) : true;

    const matchesTab = filterTab === 'all' ? true : filterTab === 'public' ? note.isPublic : !note.isPublic;

    const matchesStatus = selectedStatus ? note.status === selectedStatus : true;

    return matchesSearch && matchesTag && matchesTab && matchesStatus;
  });

  // Statuses some note has (or the one being filtered by), with how many notes have each
  const usedStatuses = STATUSES.map((s) => ({ ...s, count: notes.filter((n) => n.status === s.id).length })).filter(
    (s) => s.count > 0 || s.id === selectedStatus
  );

  const pinnedList = filteredNotes.filter((n) => n.isPinned);
  const unpinnedList = filteredNotes.filter((n) => !n.isPinned);
  const filtersOn = Boolean(searchQuery || selectedTag || selectedStatus || filterTab !== 'all');

  return (
    <aside
      aria-label="Notes"
      className={`relative z-10 flex flex-col h-full shrink-0 bg-nt-surface text-nt-ink ${
        isPhone ? 'w-full' : 'w-[300px] border-r border-nt-line'
      }`}
    >
      {/* Title row */}
      <div className={`flex items-center gap-2 shrink-0 ${isPhone ? 'pt-5 pb-2 pl-5 pr-3' : 'h-14 pl-5 pr-2'}`}>
        <h1 className={`font-bold ${isPhone ? 'text-[28px] leading-[34px]' : 'text-lg'}`}>Notes</h1>
        <span className={`text-nt-text2 tabular-nums ${isPhone ? 'text-[17px]' : 'text-[15px]'}`}>{notes.length}</span>
        <span className="flex-1" />
        {isPhone ? (
          <button type="button" onClick={onCreateNote} aria-label="New note" title="New note" className={`${ICON_BTN} !bg-nt-accent-fill !text-white hover:!bg-nt-accent-fill/90`}>
            <LuPlus className="w-5 h-5" aria-hidden="true" />
          </button>
        ) : (
          <button type="button" onClick={onHide} aria-label="Hide the notes list" title="Hide the notes list" className={ICON_BTN}>
            <LuPanelLeft className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Search, filters, tags */}
      <div className={`flex flex-col gap-3 shrink-0 ${isPhone ? 'px-5 pt-2 pb-3' : 'px-4 pt-1 pb-3'}`}>
        <div className="flex gap-2">
          <label className={`${FIELD} flex-1 ${isPhone ? '!h-11 !bg-nt-tray !border-transparent' : ''}`}>
            <LuSearch className="w-[18px] h-[18px] text-nt-text2 shrink-0" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search notes"
              placeholder="Search notes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${FIELD_INPUT} ${isPhone ? 'text-base' : ''}`}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className={`-mr-1 w-7 h-7 ${TOUCH} flex items-center justify-center rounded-lg text-nt-text2 hover:text-nt-ink`}>
                <LuX className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </label>
          {!isPhone && (
            <button type="button" onClick={onCreateNote} aria-label="New note" title="New note" className={`${ICON_BTN} !bg-nt-accent-fill !text-white hover:!bg-nt-accent-fill/90`}>
              <LuPlus className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <Segmented
          label="Show notes"
          value={filterTab}
          onChange={setFilterTab}
          options={[
            { value: 'all', label: 'All' },
            { value: 'private', label: 'Private' },
            { value: 'public', label: 'Public' }
          ]}
        />

        {/* One scrolling row: status filter (with counts), then tags in their colours */}
        {(allTags.length > 0 || usedStatuses.length > 0) && (
          <div
            data-filter-row
            className={`flex items-center gap-1.5 overflow-x-auto nt-noscroll ${isPhone ? '-mr-5 pr-5' : '-mr-4 pr-4'}`}
            style={{ WebkitMaskImage: 'linear-gradient(90deg, #000 85%, transparent)', maskImage: 'linear-gradient(90deg, #000 85%, transparent)' }}
          >
            {usedStatuses.length > 0 && (
              <>
                <button type="button" aria-pressed={selectedStatus === null} onClick={() => setSelectedStatus(null)} className={chipClass(selectedStatus === null)} aria-label="Any status">
                  Any
                </button>
                {usedStatuses.map((s) => {
                  const on = selectedStatus === s.id;
                  const c = lookColour(s.colour);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      data-status-filter={s.id}
                      aria-pressed={on}
                      onClick={() => setSelectedStatus(on ? null : s.id)}
                      className={chipClass(false)}
                      style={on ? { background: c.fg, color: 'rgb(var(--nt-surface))' } : { background: c.tint, color: c.fg }}
                    >
                      <s.Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      {s.name}
                      <span className="opacity-75 tabular-nums">{s.count}</span>
                    </button>
                  );
                })}
                {allTags.length > 0 && <span aria-hidden="true" className="w-px h-5 bg-nt-line shrink-0 mx-0.5" />}
              </>
            )}
            {allTags.length > 0 && (
              <button type="button" aria-pressed={selectedTag === null} onClick={() => setSelectedTag(null)} className={chipClass(selectedTag === null)}>
                All tags
              </button>
            )}
            {allTags.map((tag) => {
              const on = tag === selectedTag;
              const c = tagColours[tag] ? lookColour(tagColours[tag]) : null;
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelectedTag(on ? null : tag)}
                  className={chipClass(on)}
                  style={!on && c ? { background: c.tint, color: c.fg } : undefined}
                >
                  # {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* The notes */}
      <div className={`flex-1 overflow-y-auto custom-notion-scrollbar ${isPhone ? 'border-t border-nt-line pb-24' : 'px-2 pb-4'}`}>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 px-6">
            <LuFileText className="w-8 h-8 mx-auto mb-3 text-nt-text2" aria-hidden="true" />
            <p className="font-semibold text-[15px]">{notes.length === 0 ? 'No notes yet' : 'No notes match'}</p>
            <p className="text-[13px] text-nt-text2 mt-1">
              {notes.length === 0 ? 'Start one: formulas, solvers and quizzes all live inside a note.' : 'Try another search or tag.'}
            </p>
            <div className="mt-4 flex justify-center">
              {filtersOn ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                    setSelectedStatus(null);
                    setFilterTab('all');
                  }}
                  className={`${BTN_MAIN} !bg-nt-tray !text-nt-ink`}
                >
                  Clear filters
                </button>
              ) : (
                <button type="button" onClick={onCreateNote} className={BTN_MAIN}>
                  <LuPlus className="w-4 h-4" aria-hidden="true" />
                  New note
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {pinnedList.length > 0 && (
              <section aria-label="Pinned">
                <h2 className={`flex items-center gap-1.5 text-xs font-semibold text-nt-text2 ${isPhone ? 'px-5 pt-4 pb-1.5' : 'px-3 pt-2 pb-1'}`}>
                  <LuPin className="w-3.5 h-3.5" aria-hidden="true" />
                  Pinned
                </h2>
                {pinnedList.map((note) => (
                  <NoteRow key={note.id} note={note} active={!isPhone && note.id === activeNoteId} isPhone={isPhone} onSelect={onSelectNote} onDelete={onDeleteNote} onTogglePin={onTogglePinNote} />
                ))}
              </section>
            )}
            {unpinnedList.length > 0 && (
              <section aria-label="Notes">
                {pinnedList.length > 0 && (
                  <h2 className={`text-xs font-semibold text-nt-text2 ${isPhone ? 'px-5 pt-5 pb-1.5' : 'px-3 pt-4 pb-1'}`}>Notes</h2>
                )}
                {unpinnedList.map((note) => (
                  <NoteRow key={note.id} note={note} active={!isPhone && note.id === activeNoteId} isPhone={isPhone} onSelect={onSelectNote} onDelete={onDeleteNote} onTogglePin={onTogglePinNote} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

/** One note in the list: title, a line of its text, its details, and a ⋯ menu (Pin, Delete). */
function NoteRow({ note, active, isPhone, onSelect, onDelete, onTogglePin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef(null);
  const blockCount = note.blocks ? note.blocks.length : 0;
  const snippetBlock = note.blocks?.find((b) => b.content && (b.type === 'paragraph' || b.type === 'callout'));
  const snippetText = snippetBlock?.content || note.subtitle || '';
  const date = new Date(note.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const title = note.title || 'Untitled note';

  return (
    <div
      className={`group flex items-start gap-1 transition-colors ${
        isPhone ? 'pl-5 pr-2 py-3 border-b border-nt-line' : `pl-3 pr-1 py-2.5 rounded-xl ${active ? 'bg-nt-accent-tint' : 'hover:bg-nt-tray/70'}`
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(note.id)}
        aria-current={active ? 'true' : undefined}
        className="flex-1 min-w-0 flex items-start gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-nt-accent rounded-lg"
      >
        <NoteIcon note={note} size={isPhone ? 36 : 32} className="mt-0.5" />
        <span className="flex-1 min-w-0">
        <span className={`font-semibold line-clamp-2 ${isPhone ? 'text-base leading-[22px]' : 'text-[15px] leading-[21px]'} ${active ? 'text-nt-accent-on-tint' : 'text-nt-ink'}`}>
          {title}
        </span>
        {snippetText && (
          <span className={`text-nt-text2 mt-0.5 ${isPhone ? 'text-sm leading-5 line-clamp-2' : 'text-[13px] leading-[19px] line-clamp-1'}`}>{snippetText}</span>
        )}
        <span className={`flex flex-wrap items-center gap-1.5 mt-1 text-nt-text2 ${isPhone ? 'text-[13px]' : 'text-xs'}`}>
          {note.status && <StatusBadge id={note.status} small />}
          {note.isPublic ? (
            <LuGlobe className="w-3.5 h-3.5 text-nt-ok shrink-0" aria-hidden="true" />
          ) : (
            <LuLock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>
            {note.isPublic ? 'Public' : 'Private'} · {date} · {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
          </span>
        </span>
        </span>
      </button>
      <button
        ref={moreRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={`Options for ${title}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        title="Pin or delete"
        className={`${ICON_BTN} ${isPhone ? '' : '!w-9 !h-9'} ${active ? '!text-nt-accent-on-tint' : ''} ${menuOpen ? '!bg-nt-tray !text-nt-ink' : ''}`}
      >
        <LuMoreHorizontal className="w-5 h-5" aria-hidden="true" />
      </button>
      {menuOpen && (
        <Menu
          title={title}
          isPhone={isPhone}
          anchorRef={moreRef}
          onClose={() => setMenuOpen(false)}
          items={[
            {
              id: 'pin',
              label: note.isPinned ? 'Unpin note' : 'Pin note',
              icon: note.isPinned ? <LuPinOff className="w-[18px] h-[18px]" /> : <LuPin className="w-[18px] h-[18px]" />,
              onSelect: () => onTogglePin(note.id)
            },
            'divider',
            { id: 'delete', label: 'Delete note', danger: true, icon: <LuTrash2 className="w-[18px] h-[18px]" />, onSelect: () => onDelete(note.id) }
          ]}
        />
      )}
    </div>
  );
}
