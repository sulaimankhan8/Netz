import { DM_Mono, DM_Sans } from 'next/font/google';

/**
 * The hub's and method pages' fonts, served from this app by next/font (works offline), the same
 * families as the Playground, Notes and landing page. AM_FONT goes on the .am-root element.
 */
export const amSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--am-font-sans',
});

export const amMono = DM_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--am-font-mono',
});

export const AM_FONT = `${amSans.variable} ${amMono.variable}`;
