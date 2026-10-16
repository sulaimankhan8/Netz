/**
 * The colour palette of Word and WPS Office: Theme Colors (10 columns, each with 5 lighter
 * and darker variations) and Standard Colors, as shown in their Fill and Outline menus.
 * Variations are computed the way Office does: by changing the colour's lightness.
 */

export const THEME_COLORS = [
  { hex: '#FFFFFF', name: 'White, Background 1' },
  { hex: '#000000', name: 'Black, Text 1' },
  { hex: '#E7E6E6', name: 'Gray, Background 2' },
  { hex: '#44546A', name: 'Blue-Gray, Text 2' },
  { hex: '#4472C4', name: 'Blue, Accent 1' },
  { hex: '#ED7D31', name: 'Orange, Accent 2' },
  { hex: '#A5A5A5', name: 'Gray, Accent 3' },
  { hex: '#FFC000', name: 'Gold, Accent 4' },
  { hex: '#5B9BD5', name: 'Blue, Accent 5' },
  { hex: '#70AD47', name: 'Green, Accent 6' },
];

export const STANDARD_COLORS = [
  { hex: '#C00000', name: 'Dark Red' },
  { hex: '#FF0000', name: 'Red' },
  { hex: '#FFC000', name: 'Orange' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#92D050', name: 'Light Green' },
  { hex: '#00B050', name: 'Green' },
  { hex: '#00B0F0', name: 'Light Blue' },
  { hex: '#0070C0', name: 'Blue' },
  { hex: '#002060', name: 'Dark Blue' },
  { hex: '#7030A0', name: 'Purple' },
];

function parseHex(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Mixes a colour towards black (amount > 0) or white (amount < 0), 0..1. */
export function shadeColor(hex, amount) {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const target = amount > 0 ? 0 : 255;
  const t = Math.abs(amount);
  return `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v + (target - v) * t))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** A colour with transparency, for canvas shadows: rgba(r, g, b, a). */
export function rgba(hex, alpha) {
  const rgb = parseHex(hex) || [0, 0, 0];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToHex(h, s, l) {
  const hue = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue(p, q, h + 1 / 3);
    g = hue(p, q, h);
    b = hue(p, q, h - 1 / 3);
  }
  return `#${[r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** Lighter (amount > 0) or darker (amount < 0) by a share of the lightness, as Office labels them. */
export function changeLightness(hex, amount) {
  const [h, s, l] = hexToHsl(hex);
  const next = amount > 0 ? l + (1 - l) * amount : l * (1 + amount);
  return hslToHex(h, s, Math.max(0, Math.min(1, next)));
}

/**
 * The five variations under a theme colour, top to bottom: white gets darker shades, black
 * lighter tints, a very dark colour mostly lighter tints, every other colour three lighter and two darker.
 */
export function themeVariations(hex) {
  const [, , l] = hexToHsl(hex);
  let steps;
  if (l >= 0.99) steps = [[-0.05, 'Darker 5%'], [-0.15, 'Darker 15%'], [-0.25, 'Darker 25%'], [-0.35, 'Darker 35%'], [-0.5, 'Darker 50%']];
  else if (l <= 0.01) steps = [[0.5, 'Lighter 50%'], [0.35, 'Lighter 35%'], [0.25, 'Lighter 25%'], [0.15, 'Lighter 15%'], [0.05, 'Lighter 5%']];
  else if (l < 0.2) steps = [[0.9, 'Lighter 90%'], [0.75, 'Lighter 75%'], [0.5, 'Lighter 50%'], [0.25, 'Lighter 25%'], [0.1, 'Lighter 10%']];
  else if (l > 0.8) steps = [[-0.1, 'Darker 10%'], [-0.25, 'Darker 25%'], [-0.5, 'Darker 50%'], [-0.75, 'Darker 75%'], [-0.9, 'Darker 90%']];
  else steps = [[0.8, 'Lighter 80%'], [0.6, 'Lighter 60%'], [0.4, 'Lighter 40%'], [-0.25, 'Darker 25%'], [-0.5, 'Darker 50%']];
  return steps.map(([amount, label]) => ({ hex: changeLightness(hex, amount), label }));
}

/** The full Theme Colors block: one column per theme colour, base colour first. */
export function themePalette() {
  return THEME_COLORS.map((c) => [
    { hex: c.hex, name: c.name },
    ...themeVariations(c.hex).map((v) => ({ hex: v.hex, name: `${c.name}, ${v.label}` })),
  ]);
}

const RECENT_KEY = 'netz_playground_recent_colors';

export function readRecentColors() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(list) ? list.filter((c) => /^#[0-9A-F]{6}$/i.test(c)).slice(0, 10) : [];
  } catch (e) {
    return [];
  }
}

export function rememberRecentColor(hex) {
  const value = String(hex || '').toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(value)) return readRecentColors();
  const next = [value, ...readRecentColors().filter((c) => c !== value)].slice(0, 10);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch (e) {}
  return next;
}
