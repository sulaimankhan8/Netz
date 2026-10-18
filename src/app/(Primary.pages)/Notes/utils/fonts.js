import { DM_Mono, DM_Sans } from 'next/font/google';

/**
 * The Notes interface fonts (NOTES_VISUAL_REDESIGN_PLAN.md, section 1): DM Sans, as in the
 * Playground, and DM Mono for LaTeX source and access keys. next/font serves the files from this
 * app, so Notes keeps its fonts offline.
 *
 * NT_FONT goes on the Notes root and on every dialog or sheet root.
 */
export const ntSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--nt-font-sans',
});

export const ntMono = DM_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--nt-font-mono',
});

export const NT_FONT = `${ntSans.variable} ${ntMono.variable} font-nt`;
