'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import NoteSidebar from './components/NoteSidebar';
import NoteEditor from './components/NoteEditor';
import NoteShareModal from './components/NoteShareModal';
import AlgorithmPickerModal from './components/AlgorithmPickerModal';
import { Notice, useIsPhone } from './components/ui';
import { NT_FONT } from './utils/fonts';
import { NOTES_SYNCED_EVENT } from './utils/notesCloud';
import Tour from '../../components/tour/Tour';
import {
  getNotes,
  createNewNote,
  saveSingleNote,
  deleteNote,
  restoreNote,
  togglePinNote,
  importNoteByKey,
  didLastSaveSucceed,
  getTagColours,
  setTagColour
} from './utils/noteStorage';

const AssetLibrary = dynamic(() => import('./components/AssetLibrary'), { ssr: false });
const TrainingDataPanel = dynamic(() => import('./components/TrainingDataPanel'), { ssr: false });

const NOTICE_MS = 6000;

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetBlockId, setTargetBlockId] = useState(null);
  // Laptops and tablets: the list beside the note can be hidden
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Phones show one screen at a time: the list, or the open note
  const [phoneView, setPhoneView] = useState('list');
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [notice, setNotice] = useState(null);
  // Tag colours are shared by every note
  const [tagColours, setTagColours] = useState({});
  const noticeTimer = useRef(null);
  const isPhone = useIsPhone();
  const router = useRouter();
  // Notes Studio: the Assets library and the Training data folder
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);

  useEffect(() => {
    const loadedNotes = getNotes();
    setNotes(loadedNotes);
    setTagColours(getTagColours());

    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
    }

    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }

      const urlParams = new URLSearchParams(window.location.search);
      // ?open=<note id>: a note just sent from the Playground ("Open note")
      const openParam = urlParams.get('open');
      if (openParam && loadedNotes.some((n) => n.id === openParam)) {
        setActiveNoteId(openParam);
        setPhoneView('note');
      }
      // ?assets=1: "Open in Notes" after saving a board from the Playground
      if (urlParams.get('assets')) setLibraryOpen(true);
      const keyParam = urlParams.get('key');
      if (keyParam) {
        const imported = importNoteByKey(keyParam);
        if (imported) {
          const freshList = getNotes();
          setNotes(freshList);
          setActiveNoteId(imported.id);
          setPhoneView('note');
        }
      }
    }

    setIsLoaded(true);

    // The Assets library's cloud copy catches up, and old banner pictures move into the library
    import('./utils/assetCloud').then((m) => m.syncAssetsSoon(1500)).catch(() => {});
    import('./utils/assetStore').then((m) => m.moveBannersIntoLibrary()).catch(() => {});
  }, []);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  // Notes changed on the student's other devices arrived: show them
  useEffect(() => {
    const onSynced = (e) => {
      if (!e.detail?.changed) return;
      const fresh = getNotes();
      setNotes(fresh);
      setActiveNoteId((id) => (fresh.some((n) => n.id === id) ? id : fresh[0]?.id ?? null));
    };
    window.addEventListener(NOTES_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(NOTES_SYNCED_EVENT, onSynced);
  }, []);

  /** Shows a notice at the bottom (one at a time), gone after a few seconds. */
  const showNotice = useCallback((next) => {
    clearTimeout(noticeTimer.current);
    setNotice(next);
    if (next) noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const openNote = (id) => {
    setActiveNoteId(id);
    setPhoneView('note');
  };

  const handleCreateNote = () => {
    const newNote = createNewNote();
    setSaveFailed(!didLastSaveSucceed());
    const updated = getNotes();
    setNotes(updated);
    openNote(newNote.id);
  };

  const handleUpdateNote = (updatedNote) => {
    const saved = saveSingleNote(updatedNote);
    setSaveFailed(!didLastSaveSucceed());
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === saved.id ? saved : n)));
  };

  const handleDeleteNote = (id) => {
    const index = notes.findIndex((n) => n.id === id);
    const removed = notes[index];
    const wasActive = activeNoteId === id;
    const remaining = deleteNote(id);
    setSaveFailed(!didLastSaveSucceed());
    setNotes(remaining);

    if (wasActive) {
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
      setPhoneView('list');
    }

    if (removed) {
      showNotice({
        message: 'Note deleted',
        actionLabel: 'Undo',
        onAction: () => {
          const restored = restoreNote(removed, index);
          setNotes(restored);
          if (wasActive) setActiveNoteId(removed.id);
          showNotice(null);
        }
      });
    }
  };

  /** Undo after Delete block: puts the block back into its note, where it was. */
  const handleRestoreBlock = (noteId, block, index) => {
    const target = getNotes().find((n) => n.id === noteId);
    if (!target) return;
    const blocks = target.blocks.filter((b) => b.id !== block.id);
    blocks.splice(Math.max(0, Math.min(index, blocks.length)), 0, block);
    handleUpdateNote({ ...target, blocks });
  };

  const handleTogglePinNote = (id) => {
    const updated = togglePinNote(id);
    setNotes(updated);
  };

  const handleImportByKey = (key) => {
    const imported = importNoteByKey(key);
    if (imported) {
      const updated = getNotes();
      setNotes(updated);
      setActiveNoteId(imported.id);
      return imported;
    }
    return null;
  };

  const handleOpenPickerForBlock = (blockId) => {
    setTargetBlockId(blockId);
    setIsPickerOpen(true);
  };

  const handleAddWidgetBlock = () => {
    setTargetBlockId(null);
    setIsPickerOpen(true);
  };

  const handleSelectAlgorithm = (alg) => {
    const activeNote = notes.find((n) => n.id === activeNoteId);
    if (!activeNote) return;

    if (targetBlockId) {
      const updatedBlocks = activeNote.blocks.map((b) => {
        if (b.id === targetBlockId) {
          return {
            ...b,
            type: 'widget',
            widgetConfig: {
              algorithmId: alg.id,
              params: alg.defaultParams
            }
          };
        }
        return b;
      });
      handleUpdateNote({ ...activeNote, blocks: updatedBlocks });
    } else {
      const newBlock = {
        id: 'b-' + Date.now(),
        type: 'widget',
        content: alg.name,
        widgetConfig: {
          algorithmId: alg.id,
          params: alg.defaultParams
        }
      };
      handleUpdateNote({ ...activeNote, blocks: [...activeNote.blocks, newBlock] });
    }
  };

  const handleCloneCommunityNote = (commNote) => {
    const cloned = {
      ...commNote,
      id: 'note-' + Date.now(),
      title: `${commNote.title} (Clone)`,
      accessKey: 'NETZ-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false
    };
    // A copied community note is not the student's own writing, so it finishes no task
    const saved = saveSingleNote(cloned, { report: false });
    setSaveFailed(!didLastSaveSucceed());
    const updated = getNotes();
    setNotes(updated);
    openNote(saved.id);
    setIsShareModalOpen(false);
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  /** A board from the Assets library opens in the Playground, as new pages you can edit. */
  const handleOpenBoard = (asset) => {
    if (!asset?.id) return;
    router.push(`/Playground?asset=${encodeURIComponent(asset.id)}`);
  };

  /** Library card → Insert into note: goes at the end of the open note. */
  const handleInsertAssetIntoNote = async (asset) => {
    const target = notes.find((n) => n.id === activeNoteId);
    if (!target) {
      showNotice({ message: 'Open a note first, then insert.' });
      return;
    }
    const { assetBlockFor } = await import('./utils/noteInsert');
    const block = await assetBlockFor(asset);
    const fresh = getNotes().find((n) => n.id === target.id) || target;
    handleUpdateNote({ ...fresh, blocks: [...fresh.blocks, block, { id: `b-${Date.now()}-t`, type: 'paragraph', content: '' }] });
    setLibraryOpen(false);
    setPhoneView('note');
    showNotice({ message: `Inserted ${asset.title} at the end of “${fresh.title || 'this note'}”` });
  };

  /** Open file in the notes list: a .netz note or board becomes a new note. */
  const handleOpenNetzFile = async () => {
    const { pickNetzFile } = await import('@/app/utils/netzFile');
    const result = await pickNetzFile();
    if (!result) return;
    if (!result.ok) {
      showNotice({ message: result.error });
      return;
    }
    try {
      const { noteFromNetz } = await import('./utils/noteInsert');
      const note = await noteFromNetz(result, result.fileName);
      const saved = saveSingleNote(note, { report: false });
      setSaveFailed(!didLastSaveSucceed());
      setNotes(getNotes());
      openNote(saved.id);
      showNotice({ message: `Opened ${result.fileName}` });
    } catch (err) {
      showNotice({ message: err.message || 'The file could not be opened.' });
    }
  };

  if (!isLoaded) {
    return (
      <div className={`${NT_FONT} flex h-[calc(100dvh-var(--app-nav-h,0px))] w-full bg-nt-paper pl-0 md:pl-[78px]`} aria-busy="true" aria-label="Loading notes">
        <div className="hidden md:flex flex-col gap-3 w-[300px] p-5 bg-nt-surface border-r border-nt-line">
          <div className="h-6 w-24 rounded-lg bg-nt-tray" />
          <div className="h-10 rounded-xl bg-nt-tray" />
          <div className="h-10 rounded-xl bg-nt-tray" />
          <div className="h-16 rounded-xl bg-nt-tray mt-3" />
          <div className="h-16 rounded-xl bg-nt-tray" />
        </div>
        <div className="flex-1 p-10 flex justify-center">
          <div className="w-full max-w-[800px] flex flex-col gap-4">
            <div className="h-10 w-2/3 rounded-xl bg-nt-tray" />
            <div className="h-5 w-1/2 rounded-lg bg-nt-tray" />
            <div className="h-28 rounded-2xl bg-nt-tray mt-6" />
          </div>
        </div>
      </div>
    );
  }

  const showList = isPhone ? phoneView === 'list' : isSidebarOpen;
  const showEditor = isPhone ? phoneView === 'note' : true;

  return (
    <div className={`${NT_FONT} relative flex h-[calc(100dvh-var(--app-nav-h,0px))] w-full bg-nt-paper text-nt-ink overflow-hidden pl-0 md:pl-[78px]`}>
      <Tour ids={['notes', 'blocks']} />
      {showList && (
        <NoteSidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={openNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onTogglePinNote={handleTogglePinNote}
          onHide={() => setIsSidebarOpen(false)}
          isPhone={isPhone}
          tagColours={tagColours}
          onOpenAssets={() => setLibraryOpen(true)}
          onOpenTraining={() => setTrainingOpen(true)}
          onOpenFile={handleOpenNetzFile}
        />
      )}

      {showEditor && (
        <NoteEditor
          note={activeNote}
          onUpdateNote={handleUpdateNote}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenPickerForBlock={handleOpenPickerForBlock}
          onAddWidgetBlock={handleAddWidgetBlock}
          onCreateNote={handleCreateNote}
          isSidebarOpen={isSidebarOpen}
          onShowSidebar={() => setIsSidebarOpen(true)}
          onBack={() => setPhoneView('list')}
          isPhone={isPhone}
          saveFailed={saveFailed}
          onNotify={showNotice}
          onRestoreBlock={handleRestoreBlock}
          tagColours={tagColours}
          onSetTagColour={(tag, colour) => setTagColours(setTagColour(tag, colour))}
          onOpenBoard={handleOpenBoard}
        />
      )}

      {libraryOpen && (
        <AssetLibrary
          isPhone={isPhone}
          onClose={() => setLibraryOpen(false)}
          onNotify={showNotice}
          onInsertIntoNote={activeNote ? handleInsertAssetIntoNote : null}
          onOpenBoard={handleOpenBoard}
        />
      )}
      {trainingOpen && <TrainingDataPanel isPhone={isPhone} onClose={() => setTrainingOpen(false)} />}

      <NoteShareModal
        note={activeNote}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onUpdateNote={handleUpdateNote}
        onImportKey={handleImportByKey}
        onCloneNote={handleCloneCommunityNote}
        isPhone={isPhone}
      />

      <AlgorithmPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAlgorithm={handleSelectAlgorithm}
        isPhone={isPhone}
      />

      {notice && (
        <Notice
          message={notice.message}
          actionLabel={notice.actionLabel}
          onAction={notice.onAction}
          onDismiss={() => showNotice(null)}
          raised={isPhone && phoneView === 'note'}
        />
      )}
    </div>
  );
}
