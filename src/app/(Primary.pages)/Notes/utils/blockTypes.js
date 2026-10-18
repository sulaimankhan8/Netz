import { LuCalculator, LuHeading1, LuHeading2, LuHeading3, LuHelpCircle, LuLightbulb, LuPenLine, LuSigma, LuType } from 'react-icons/lu';

/**
 * Every kind of block, in one place (NOTES_VISUAL_REDESIGN_PLAN.md, section 1). The Add block
 * grid, the phone's Add block sheet, the / menu and the block labels all read this list, so a
 * block has the same name, icon and colour everywhere.
 *
 * action: what choosing it does. 'block' makes a block of `type`; 'picker' opens the solver
 * picker (a solver block needs an algorithm first).
 * tile / text / tint: Tailwind classes for the icon tile, the coloured label and the soft
 * background. Text blocks have no colour of their own.
 */
const plain = { tile: 'bg-nt-tray text-nt-text2', text: 'text-nt-ink', tint: 'bg-nt-tray' };

export const BLOCK_TYPES = [
  { id: 'paragraph', type: 'paragraph', action: 'block', name: 'Text', hint: 'Plain writing', keywords: 'paragraph text', Icon: LuType, ...plain },
  { id: 'heading1', type: 'heading1', action: 'block', name: 'Heading 1', hint: 'Section title', keywords: 'h1 title', Icon: LuHeading1, ...plain },
  { id: 'heading2', type: 'heading2', action: 'block', name: 'Heading 2', hint: 'Smaller section title', keywords: 'h2 subheading', Icon: LuHeading2, ...plain },
  { id: 'heading3', type: 'heading3', action: 'block', name: 'Heading 3', hint: 'Small title', keywords: 'h3', Icon: LuHeading3, ...plain },
  { id: 'math', type: 'math', action: 'block', name: 'Formula', hint: 'LaTeX, shown as maths', keywords: 'math latex equation katex', Icon: LuSigma, tile: 'bg-nt-math-tint text-nt-math', text: 'text-nt-math', tint: 'bg-nt-math-tint' },
  { id: 'callout', type: 'callout', action: 'block', name: 'Callout', hint: 'A rule or exam tip', keywords: 'note tip box', Icon: LuLightbulb, tile: 'bg-nt-callout-tint text-nt-callout', text: 'text-nt-callout', tint: 'bg-nt-callout-tint' },
  { id: 'widget', type: 'widget', action: 'picker', name: 'Solver', hint: 'Bisection, Newton, Euler, Z-test…', keywords: 'widget calculator algorithm solver', Icon: LuCalculator, tile: 'bg-nt-solver-tint text-nt-solver', text: 'text-nt-solver', tint: 'bg-nt-solver-tint' },
  { id: 'quiz', type: 'quiz', action: 'block', name: 'Quiz', hint: 'Multiple choice or a number', keywords: 'test question mcq', Icon: LuHelpCircle, tile: 'bg-nt-quiz-tint text-nt-quiz', text: 'text-nt-quiz', tint: 'bg-nt-quiz-tint' },
  { id: 'ink', type: 'ink', action: 'block', name: 'Sketch', hint: 'Draw, or bring a drawing in', keywords: 'ink draw handwriting image', Icon: LuPenLine, tile: 'bg-nt-sketch-tint text-nt-sketch', text: 'text-nt-sketch', tint: 'bg-nt-sketch-tint' },
];

export function blockTypeOf(type) {
  return BLOCK_TYPES.find((b) => b.type === type) || BLOCK_TYPES[0];
}

/** The default quiz a new Quiz block starts with (unchanged from before the redesign). */
export function newQuizConfig() {
  return {
    question: 'What is the order of convergence for the Newton-Raphson method?',
    mode: 'mcq',
    options: ['Linear (Order 1)', 'Quadratic (Order 2)', 'Superlinear (Order 1.618)', 'Cubic (Order 3)'],
    correctOptionIndex: 1,
    correctNumericValue: 2.7065,
    tolerance: 0.001,
    explanation: 'The Newton-Raphson method exhibits quadratic convergence (order 2) near a simple root.',
  };
}
