import { DM_Sans } from 'next/font/google';

/**
 * The Playground's interface font (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, step 0.2). next/font serves
 * the files from this app, so the Playground keeps its font offline.
 *
 * PG_FONT goes on the Playground's root element and on the root of every portal (dialogs, sheets,
 * the equation ribbon, the screenshot editor): a portal renders in document.body, outside the
 * Playground root, and would otherwise show the app's Poppins or the system font.
 */
export const pgSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--pg-font-sans',
});

export const PG_FONT = `${pgSans.variable} font-pg`;
