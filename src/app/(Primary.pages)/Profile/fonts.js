import { Fredoka } from 'next/font/google';
import { ldSans } from '../../components/landing/fonts';

/**
 * Profile fonts: DM Sans for text (as everywhere in NETZ) and Fredoka for the playful parts:
 * streak, gem and medal numbers and card titles (board artboards 8–9).
 */
export const pfDisplay = Fredoka({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
  variable: '--pf-font-display',
});

export const PF_FONT = `${ldSans.variable} ${pfDisplay.variable}`;
