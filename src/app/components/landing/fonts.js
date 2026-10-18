import { Caveat, DM_Mono, DM_Sans } from 'next/font/google';

/**
 * Landing page fonts (LANDING_REDESIGN_PLAN.md, build step 2): DM Sans and DM Mono as in the
 * Playground and Notes, and Caveat for the handwriting in the hero demo. next/font serves the files
 * from this app, so nothing is fetched from Google at run time.
 */
export const ldSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--ld-font-sans',
});

export const ldMono = DM_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--ld-font-mono',
});

export const ldHand = Caveat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600'],
  variable: '--ld-font-hand',
});

export const LD_FONT = `${ldSans.variable} ${ldMono.variable} ${ldHand.variable}`;
