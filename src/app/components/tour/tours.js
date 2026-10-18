/*
 * The onboarding tours started from the landing page's tour cards (LANDING_REDESIGN_PLAN.md, build
 * step 5; board artboard 9). A page runs a tour when its address has ?tour=<id>.
 *
 * Each step points at the first visible element matching one of its `target` selectors. The lists
 * cover laptop, tablet and phone, where the same control can look different (the Playground's
 * Insert group, Insert button, or Add to page button). A step whose control is not on screen, or
 * that has no target, is shown in the middle of the screen instead, so a tour never gets stuck.
 */

export const TOURS = {
  playground: {
    area: 'Playground',
    tone: 'pg',
    delay: 1600,
    steps: [
      {
        target: ['[aria-label="Whiteboard tools"] [aria-label="Pen"]'],
        title: 'Pick the pen',
        content: 'Write with a finger, a pen or a mouse. Two fingers move and zoom the page.',
      },
      {
        target: ['[aria-label="Whiteboard tools"] [aria-label="Eraser"]'],
        title: 'Rub out or select',
        content: 'The eraser removes whole strokes or just part of one. The lasso next to it selects ink so you can move it.',
      },
      {
        target: null,
        title: 'Write an equation',
        content: 'Try x² − 4x + 3 = 0 anywhere on the page. When you stop, a small label beside your ink shows what NETZ read. Its menu lets you fix the reading or plot it.',
      },
      {
        target: ['[aria-label="Insert"] [aria-label="Equation"]', '[aria-label="Insert"][aria-expanded]', '[aria-label="Add to page"]'],
        title: 'Solve it in an equation block',
        content: 'Insert an equation block. Its action button finds roots, differentiates, integrates or plots the equation.',
      },
      {
        target: ['nav[data-page-bar]'],
        title: 'Pages',
        content: 'Add, rename and reorder pages here. The Page menu exports a page and sends typed blocks to Notes.',
      },
    ],
  },

  insert: {
    area: 'Playground',
    tone: 'pg',
    delay: 1600,
    steps: [
      {
        target: ['[role="group"][aria-label="Insert"]', '[aria-label="Insert"][aria-expanded]', '[aria-label="Add to page"]'],
        title: 'The Insert menu',
        content: 'Everything you can add to a page, in the same order as an office app: picture, screenshot, shapes, symbol and equation.',
      },
      {
        target: ['[aria-label="Shapes"]', '[aria-label="Insert"][aria-expanded]', '[aria-label="Add to page"]'],
        title: 'Shapes',
        content: 'Rectangles, arrows, flowchart symbols and callouts. Pick one, then drag on the page to draw it.',
      },
      {
        target: ['[aria-label="Symbol"]', '[aria-label="Insert"][aria-expanded]', '[aria-label="Add to page"]'],
        title: 'Symbols',
        content: 'Greek letters, operators and other symbols, with the ones you used last at the top.',
      },
      {
        target: ['[aria-label="Screenshot"]', '[aria-label="Insert"][aria-expanded]', '[aria-label="Add to page"]'],
        title: 'Screenshots',
        content: 'Take a picture of the page or paste a photo, and crop it to a rectangle, oval or any shape.',
      },
      {
        target: ['[aria-label="Insert"] [aria-label="Equation"]', '[aria-label="Insert"][aria-expanded]', '[aria-label="Add to page"]'],
        title: 'Equations',
        content: 'Type a new equation, paste LaTeX, or start from a common one such as the quadratic formula.',
      },
    ],
  },

  notes: {
    area: 'Notes Studio',
    tone: 'nt',
    delay: 900,
    steps: [
      {
        target: ['[data-tour="notes-new"]', '[aria-label="New note"]'],
        title: 'Start a note',
        content: 'Create a new note here. Your notes are kept in this browser.',
      },
      {
        target: ['[aria-label="Search notes"]'],
        title: 'Find notes',
        content: 'Search titles, descriptions, tags and text, or filter by privacy, tag and status.',
      },
      {
        target: ['[aria-label="Title"]'],
        title: 'Title and tags',
        content: 'Give the note a title, a short description and tags so it is easy to find later.',
      },
      {
        target: ['[data-tour="notes-add-block"]'],
        title: 'Add any block',
        content: 'Add text, headings, formulas, callouts, solvers, quizzes and sketches here, or type / in any text block.',
      },
      {
        target: ['[data-tour="notes-share"]'],
        title: 'Share with a key',
        content: 'Make a note public and copy its key or link, or open someone else’s note with their key.',
      },
      {
        target: ['[data-tour="notes-export"]'],
        title: 'Export',
        content: 'Save the note as a PDF or as Markdown.',
      },
    ],
  },

  blocks: {
    area: 'Notes Studio',
    tone: 'nt',
    delay: 900,
    steps: [
      {
        target: ['[data-tour="notes-block-math"]', '[data-tour="notes-add-block"]'],
        title: 'Formulas',
        content: 'Write LaTeX and see it as maths. Tap a formula later to edit it.',
      },
      {
        target: ['[data-tour="notes-block-widget"]', '[data-tour="notes-add-block"]'],
        title: 'Solvers',
        content: 'Pick any of the 34 methods and press Calculate: the answer and its steps stay inside the note.',
      },
      {
        target: ['[data-tour="notes-block-quiz"]', '[data-tour="notes-add-block"]'],
        title: 'Quizzes',
        content: 'Ask yourself a multiple-choice or number question, then Check your answer while you revise.',
      },
      {
        target: ['[data-tour="notes-block-ink"]', '[data-tour="notes-add-block"]'],
        title: 'Sketches',
        content: 'Draw with a finger, pen or mouse, upload a picture, or bring a drawing in from the Playground.',
      },
    ],
  },

  hub: {
    area: 'Algorithms',
    tone: 'al',
    delay: 700,
    steps: [
      {
        target: ['[data-tour="hub-search"]'],
        title: 'Search the methods',
        content: 'Type a method, a formula or a unit, such as “Newton” or “interpolation”.',
      },
      {
        target: ['[data-tour="hub-units"]'],
        title: 'Filter by unit',
        content: 'Show one unit at a time: roots, interpolation, calculus, matrices and ODEs, or fitting and tests.',
      },
      {
        target: ['[data-tour="hub-list"]'],
        title: 'Run one here',
        content: 'Tap a method to open its calculator beside the list, change the inputs and see the result.',
      },
      {
        target: null,
        title: 'Open the full page',
        content: 'Each method also has its own page with the idea, the formula, worked examples, the step table, a graph and export.',
      },
    ],
  },

  settings: {
    area: 'Settings',
    tone: 'app',
    delay: 600,
    steps: [
      {
        target: ['[data-tour="settings-theme"]'],
        title: 'Light or dark',
        content: 'Choose how NETZ looks on every page. The landing page background looks its best in dark.',
      },
      {
        target: ['nav[data-app-nav]', '[aria-label="Collapse sidebar"]', '[aria-label="Expand sidebar"]'],
        title: 'The menu',
        content: 'Move between Home, the Algorithms hub, the Playground, Notes and Settings from here.',
      },
      {
        target: null,
        title: 'Tours live on Home',
        content: 'Every tour can be replayed from its card on the home page. Finished tours get a tick there.',
      },
    ],
  },

  'gauss-seidel': {
    area: 'Gauss–Seidel',
    tone: 'al',
    delay: 700,
    steps: [
      {
        target: ['.step-intro-1'],
        placement: 'bottom',
        title: 'The idea',
        content: 'Start with what the method does and where it is used: it is the foundation for everything below.',
      },
      {
        target: ['.step-intro-2'],
        placement: 'left',
        title: 'The formulas',
        content: 'Learn the key formulas: you need them to follow the steps and to use the method yourself.',
      },
      {
        target: ['.step-intro-3'],
        placement: 'top',
        title: 'The procedure',
        content: 'Follow the method one clear step at a time.',
      },
      {
        target: ['.step-intro-4'],
        placement: 'top',
        title: 'Worked examples',
        content: 'See the method in action on example problems.',
      },
      {
        target: ['.step-intro-5'],
        placement: 'top',
        title: 'Try it yourself',
        content: 'Use the calculator with your own numbers and watch the iteration table, the graph and the answer.',
      },
    ],
  },
};

/** Tours a card counts (Install and Profile are not tours). */
export const TOUR_IDS = ['playground', 'insert', 'notes', 'blocks', 'hub', 'gauss-seidel', 'settings'];

export function readDoneTours() {
  try {
    const done = JSON.parse(window.localStorage.getItem('netz.tours') || '{}') || {};
    if (window.localStorage.getItem('gaussSeidelTourCompleted') === 'true') done['gauss-seidel'] = true;
    return done;
  } catch {
    return {};
  }
}

export function markTourDone(id) {
  try {
    const done = JSON.parse(window.localStorage.getItem('netz.tours') || '{}') || {};
    done[id] = true;
    window.localStorage.setItem('netz.tours', JSON.stringify(done));
    if (id === 'gauss-seidel') window.localStorage.setItem('gaussSeidelTourCompleted', 'true');
  } catch {
    // Storage can be full or blocked; the tour still worked, only the tick is lost
  }
}
