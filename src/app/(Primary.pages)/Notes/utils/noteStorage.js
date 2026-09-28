import { INITIAL_SAMPLE_NOTES } from "./sampleNotes";

const STORAGE_KEY = "netz_notes_v2_data";

export function generateAccessKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "NETZ-";
  for (let i = 0; i < 4; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function getNotes() {
  if (typeof window === "undefined") return INITIAL_SAMPLE_NOTES;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const legacyData = localStorage.getItem("netz_notes");
    let legacyNotes = [];
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          legacyNotes = parsed.map((item) => ({
            ...item,
            id: item.id || `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: item.title || 'Untitled Math Note',
            subtitle: item.subtitle || '',
            tags: Array.isArray(item.tags) ? item.tags : ['Playground'],
            accessKey: item.accessKey || generateAccessKey(),
            blocks: Array.isArray(item.blocks) && item.blocks.length > 0 
              ? item.blocks 
              : [{ id: `b-${Date.now()}`, type: 'paragraph', content: item.content || '' }]
          }));
        }
      } catch (e) {
        console.error("Error parsing legacy notes:", e);
      }
    }

    if (!data) {
      const mergedInitial = legacyNotes.length > 0 ? [...legacyNotes, ...INITIAL_SAMPLE_NOTES] : INITIAL_SAMPLE_NOTES;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedInitial));
      localStorage.setItem("netz_notes", JSON.stringify(mergedInitial));
      return mergedInitial;
    }

    let parsedNotes = JSON.parse(data);
    if (!Array.isArray(parsedNotes)) {
      parsedNotes = INITIAL_SAMPLE_NOTES;
    }

    // Merge any external/legacy notes (e.g. from Playground Whiteboard)
    if (legacyNotes.length > 0) {
      const existingIds = new Set(parsedNotes.map((n) => n.id));
      const newItems = legacyNotes.filter((n) => !existingIds.has(n.id));
      if (newItems.length > 0) {
        parsedNotes = [...newItems, ...parsedNotes];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedNotes));
      }
    }

    return parsedNotes;
  } catch (err) {
    console.error("Failed to load notes from localStorage:", err);
    return INITIAL_SAMPLE_NOTES;
  }
}

export function saveNotes(notes) {
  if (typeof window === "undefined") return;
  try {
    const stringified = JSON.stringify(notes);
    localStorage.setItem(STORAGE_KEY, stringified);
    localStorage.setItem("netz_notes", stringified); // Keep Playground synced
  } catch (err) {
    console.error("Failed to save notes to localStorage:", err);
  }
}

export function createNewNote() {
  const newNote = {
    id: "note-" + Date.now(),
    title: "Untitled Math Note",
    subtitle: "Click to add description...",
    tags: ["General"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false,
    accessKey: generateAccessKey(),
    author: "User",
    blocks: [
      {
        id: "b-" + Date.now() + "-1",
        type: "heading1",
        content: "Heading 1"
      },
      {
        id: "b-" + Date.now() + "-2",
        type: "paragraph",
        content: "Start typing your notes here. You can add LaTeX equations, callouts, and interactive widgets."
      },
      {
        id: "b-" + Date.now() + "-3",
        type: "math",
        content: "f(x) = x^2 - 4"
      }
    ]
  };

  const existing = getNotes();
  const updated = [newNote, ...existing];
  saveNotes(updated);
  return newNote;
}

export function saveSingleNote(updatedNote) {
  const existing = getNotes();
  const index = existing.findIndex((n) => n.id === updatedNote.id);
  const noteToSave = {
    ...updatedNote,
    updatedAt: new Date().toISOString()
  };

  let updatedList;
  if (index >= 0) {
    updatedList = [...existing];
    updatedList[index] = noteToSave;
  } else {
    updatedList = [noteToSave, ...existing];
  }

  saveNotes(updatedList);
  return noteToSave;
}

export function deleteNote(id) {
  const existing = getNotes();
  const filtered = existing.filter((n) => n.id !== id);
  saveNotes(filtered);
  return filtered;
}

export function togglePinNote(id) {
  const existing = getNotes();
  const updated = existing.map((n) =>
    n.id === id ? { ...n, isPinned: !n.isPinned } : n
  );
  saveNotes(updated);
  return updated;
}

export function importNoteByKey(key) {
  const cleanKey = key.trim().toUpperCase();
  const existing = getNotes();

  // Search local notes first
  const match = existing.find((n) => n.accessKey === cleanKey);
  if (match) return match;

  // Search initial sample notes fallback
  const sampleMatch = INITIAL_SAMPLE_NOTES.find((n) => n.accessKey === cleanKey);
  if (sampleMatch) {
    const imported = {
      ...sampleMatch,
      id: "imported-" + Date.now(),
      title: `${sampleMatch.title} (Imported)`,
      updatedAt: new Date().toISOString()
    };
    saveSingleNote(imported);
    return imported;
  }

  return null;
}

export function exportNoteAsMarkdown(note) {
  let md = `# ${note.title}\n\n`;
  if (note.subtitle) md += `*${note.subtitle}*\n\n`;
  md += `**Tags**: ${note.tags.join(", ")}\n`;
  md += `**Created**: ${new Date(note.createdAt).toLocaleDateString()}\n\n`;
  md += `---\n\n`;

  note.blocks.forEach((block) => {
    if (block.type === "heading1") md += `## ${block.content}\n\n`;
    else if (block.type === "heading2") md += `### ${block.content}\n\n`;
    else if (block.type === "paragraph") md += `${block.content}\n\n`;
    else if (block.type === "math") md += `$$\n${block.content}\n$$\n\n`;
    else if (block.type === "callout") md += `> ${block.content}\n\n`;
    else if (block.type === "widget") md += `\`[Interactive Solver: ${block.content}]\`\n\n`;
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_note.md`;
  link.click();
  URL.revokeObjectURL(url);
}
