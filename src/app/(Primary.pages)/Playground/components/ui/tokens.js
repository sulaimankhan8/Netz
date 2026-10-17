/**
 * The Playground's colours as hex strings, for code that paints on a canvas or writes SVG
 * attributes (the lasso box, shape handles, connector hints), where CSS variables cannot be read.
 * The same colours are CSS variables in ../../playground.css: change the two files together.
 */

const LIGHT = {
  paper: '#F6F6F3',
  surface: '#FFFFFF',
  tray: '#EFEFEB',
  line: '#E4E4DF',
  ink: '#1D1D1F',
  onInk: '#FFFFFF',
  text2: '#55555A',
  muted: '#ADADB2',
  accent: '#4F46E5',
  accentFill: '#4F46E5',
  danger: '#B42318',
};

const DARK = {
  paper: '#141415',
  surface: '#1E1E20',
  tray: '#2A2A2D',
  line: '#34343A',
  ink: '#F4F4F2',
  onInk: '#1D1D1F',
  text2: '#B4B4BA',
  muted: '#6B6B72',
  accent: '#A5B4FC',
  accentFill: '#4F46E5',
  danger: '#F97066',
};

/** True when the app shows its dark theme (Tailwind's darkMode: 'class'). */
export function isDarkPage() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

/** A token's colour for the current theme, e.g. pgColour('accent'). */
export function pgColour(name) {
  return (isDarkPage() ? DARK : LIGHT)[name];
}

/** Grid dots and lines on the page: quieter than thin ink (V15). */
export function gridColours(dark) {
  return dark
    ? { dot: 'rgba(255, 255, 255, 0.10)', line: 'rgba(255, 255, 255, 0.07)' }
    : { dot: 'rgba(0, 0, 0, 0.09)', line: 'rgba(0, 0, 0, 0.06)' };
}
