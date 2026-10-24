/**
 * The words the Playground shows people, in one place: one name for each thing, in plain
 * language (no "OCR", "neural", "hypotheses"). See PLAYGROUND_UX_FIX_PLAN.md step 0.3.
 *
 * Stored names do not change: a Text block is still saved with type 'theory', so sessions
 * saved before the rename load as they did.
 */

export const UI = {
  // Tools
  pen: 'Pen',
  highlighter: 'Highlighter',
  eraser: 'Eraser',
  lasso: 'Lasso',
  movePage: 'Move page',
  undo: 'Undo',
  redo: 'Redo',

  // Panels and menus
  penOptions: 'Pen options',
  highlighterOptions: 'Highlighter options',
  eraserOptions: 'Eraser options',
  blocks: 'Blocks',
  pageMenu: 'Page',
  thisPage: 'This page',
  preferences: 'Preferences',
  insert: 'Insert',
  addToPage: 'Add to page',
  background: 'Background',
  zoom: 'Zoom',
  moreColours: 'More colours',
  penTypes: { ballpoint: 'Ballpoint', fountain: 'Fountain', pencil: 'Pencil', marker: 'Marker' },
  pageOf: (n, total) => `Page ${n} of ${total}`,
  recording: 'Recording',

  // A new, empty page
  emptyTitle: 'Write anything.',
  emptyHint: 'End a sum with = and the answer appears.',

  // Blocks
  graph: 'Graph',
  text: 'Text',
  voiceMemo: 'Voice memo',
  stopRecording: 'Stop recording',

  // Page actions
  writingMode: 'Writing mode',
  sendToNotes: 'Send to Notes',
  export: 'Export',
  focusMusic: 'Focus music',
  addPage: 'Add page',
  clearPage: 'Clear page',
  duplicatePage: 'Duplicate page',
  deletePage: 'Delete page',
  pages: 'Pages',
  fit: 'Fit to content',

  // Handwriting
  readMyWriting: 'Read my writing',
  readOff: 'Off',
  readSelect: 'When I select',
  readLive: 'As I write',
  showReadings: 'Show readings',
  reading: 'Reading…',
  readerLoading: 'Getting the handwriting reader ready…',
  readerReady: 'Handwriting reader ready',
  readerFailed: 'Handwriting reading is unavailable',
  keptAsDrawing: 'Drawing, kept as ink',
  handwriting: 'Handwriting',
  turnIntoText: 'Turn into typed text',
  couldNotRead: "Couldn't read this",
  typeIt: 'Type it',
  fix: 'Fix',
  fixHint: 'Pick the right reading or type it',
  readAsMaths: 'Read as maths',
  readAsText: 'Read as text',
  plotGraph: 'Plot graph',
  whatDidYouWrite: 'What did you write?',
  thisIs: 'This is',
  mathsActions: 'Maths actions',

  // Saving
  saving: 'Saving…',
  saved: 'Saved',
  saveFailed: "Couldn't save",
  retry: 'Retry',
};

// The name people see for each stored block type
const BLOCK_LABELS = {
  equation: 'Equation',
  theory: 'Text',
  graph: 'Graph',
  image: 'Picture',
  audio: 'Voice memo',
  sketch: 'Sketch',
  table: 'Table',
};

export function blockLabel(type) {
  return BLOCK_LABELS[type] || 'Block';
}
