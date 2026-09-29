'use client';

import { useState, useEffect } from 'react';
import NoteSidebar from './components/NoteSidebar';
import NoteEditor from './components/NoteEditor';
import NoteShareModal from './components/NoteShareModal';
import AlgorithmPickerModal from './components/AlgorithmPickerModal';
import { 
  getNotes, 
  createNewNote, 
  saveSingleNote, 
  deleteNote, 
  togglePinNote,
  importNoteByKey 
} from './utils/noteStorage';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetBlockId, setTargetBlockId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedNotes = getNotes();
    setNotes(loadedNotes);

    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
    }

    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }

      const urlParams = new URLSearchParams(window.location.search);
      const keyParam = urlParams.get('key');
      if (keyParam) {
        const imported = importNoteByKey(keyParam);
        if (imported) {
          const freshList = getNotes();
          setNotes(freshList);
          setActiveNoteId(imported.id);
        }
      }
    }

    setIsLoaded(true);
  }, []);

  const handleSelectNote = (id) => {
    setActiveNoteId(id);
  };

  const handleCreateNote = () => {
    const newNote = createNewNote();
    const updated = getNotes();
    setNotes(updated);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (updatedNote) => {
    const saved = saveSingleNote(updatedNote);
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === saved.id ? saved : n))
    );
  };

  const handleDeleteNote = (id) => {
    const remaining = deleteNote(id);
    setNotes(remaining);

    if (activeNoteId === id) {
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
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
    const saved = saveSingleNote(cloned);
    const updated = getNotes();
    setNotes(updated);
    setActiveNoteId(saved.id);
    setIsShareModalOpen(false);
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#191919] text-neutral-800 dark:text-neutral-200 font-sans pl-0 md:pl-[78px]">
        <div className="animate-pulse flex items-center space-x-2 text-sm font-semibold">
          <div className="w-4 h-4 rounded-full bg-neutral-400 dark:bg-neutral-600 animate-ping"></div>
          <span>Loading NETZ Notes Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col md:flex-row h-screen max-h-screen w-full bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans pl-0 md:pl-[78px] transition-colors duration-200">
      <NoteSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onTogglePinNote={handleTogglePinNote}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <NoteEditor
        note={activeNote}
        onUpdateNote={handleUpdateNote}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenPickerForBlock={handleOpenPickerForBlock}
        onAddWidgetBlock={handleAddWidgetBlock}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <NoteShareModal
        note={activeNote}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onUpdateNote={handleUpdateNote}
        onImportKey={handleImportByKey}
        onCloneNote={handleCloneCommunityNote}
      />

      <AlgorithmPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAlgorithm={handleSelectAlgorithm}
      />
    </div>
  );
}