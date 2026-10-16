/**
 * Ready-made shape looks, as in the Shape Styles gallery of WPS Office and Word
 * (7 colours x 6 styles), and Office's outer shadow presets for Shape Effects > Shadow.
 */

import { changeLightness, shadeColor } from './officeColors.js';

// Dark 1 (text colour), then the six theme accents
const STYLE_COLORS = [
  { hex: '#000000', name: 'Black, Dark 1' },
  { hex: '#4472C4', name: 'Blue, Accent 1' },
  { hex: '#ED7D31', name: 'Orange, Accent 2' },
  { hex: '#A5A5A5', name: 'Gray, Accent 3' },
  { hex: '#FFC000', name: 'Gold, Accent 4' },
  { hex: '#5B9BD5', name: 'Blue, Accent 5' },
  { hex: '#70AD47', name: 'Green, Accent 6' },
];

const OUTLINE = 1.33; // 1 pt

const STYLE_ROWS = [
  {
    id: 'outline',
    label: 'Colored Outline',
    make: (c) => ({ fill: { type: 'solid', color: '#FFFFFF', alpha: 1 }, line: { type: 'solid', color: c, width: OUTLINE }, text: { color: '#000000' }, shadow: null }),
  },
  {
    id: 'fill',
    label: 'Colored Fill',
    make: (c) => ({ fill: { type: 'solid', color: c, alpha: 1 }, line: { type: 'solid', color: shadeColor(c, 0.5), width: OUTLINE }, text: { color: '#FFFFFF' }, shadow: null }),
  },
  {
    id: 'light-outline',
    label: 'Light 1 Outline, Colored Fill',
    make: (c) => ({ fill: { type: 'solid', color: c, alpha: 1 }, line: { type: 'solid', color: '#FFFFFF', width: 2.67 }, text: { color: '#FFFFFF' }, shadow: null }),
  },
  {
    id: 'subtle',
    label: 'Subtle Effect',
    make: (c) => ({ fill: { type: 'solid', color: c === '#000000' ? '#D9D9D9' : changeLightness(c, 0.8), alpha: 1 }, line: { type: 'solid', color: c, width: OUTLINE }, text: { color: '#000000' }, shadow: null }),
  },
  {
    id: 'moderate',
    label: 'Moderate Effect',
    make: (c) => ({
      fill: { type: 'gradient', stops: [c === '#000000' ? '#595959' : changeLightness(c, 0.4), c], angle: 90, color: c, alpha: 1 },
      line: { type: 'none' },
      text: { color: '#FFFFFF' },
      shadow: { preset: 'outerBottom' },
    }),
  },
  {
    id: 'intense',
    label: 'Intense Effect',
    make: (c) => ({
      fill: { type: 'gradient', stops: [c === '#000000' ? '#404040' : changeLightness(c, 0.2), shadeColor(c, 0.25)], angle: 90, color: c, alpha: 1 },
      line: { type: 'none' },
      text: { color: '#FFFFFF' },
      shadow: { preset: 'outerBottomRight' },
    }),
  },
];

/** The Shape Styles gallery: rows of styles, each with one entry per colour. */
export const SHAPE_STYLES = STYLE_ROWS.map((row) => ({
  id: row.id,
  label: row.label,
  items: STYLE_COLORS.map((c) => ({ id: `${row.id}-${c.hex}`, name: `${row.label} - ${c.name}`, style: row.make(c.hex) })),
}));

export function getShapeStyle(id) {
  for (const row of SHAPE_STYLES) {
    const item = row.items.find((i) => i.id === id);
    if (item) return item;
  }
  return null;
}

/**
 * Office's Outer shadows (Shape Effects > Shadow > Outer). angle is the direction the shadow
 * falls (degrees, clockwise from pointing right), dist and blur in px. The shadow keeps its
 * direction on the page when the shape is rotated, as Office does by default.
 */
export const SHADOW_PRESETS = [
  { id: 'outerBottomRight', label: 'Offset: Bottom Right', angle: 45, dist: 4, blur: 5.33 },
  { id: 'outerBottom', label: 'Offset: Bottom', angle: 90, dist: 4, blur: 5.33 },
  { id: 'outerBottomLeft', label: 'Offset: Bottom Left', angle: 135, dist: 4, blur: 5.33 },
  { id: 'outerRight', label: 'Offset: Right', angle: 0, dist: 4, blur: 5.33 },
  { id: 'outerCenter', label: 'Offset: Center', angle: 0, dist: 0, blur: 6.67 },
  { id: 'outerLeft', label: 'Offset: Left', angle: 180, dist: 4, blur: 5.33 },
  { id: 'outerTopRight', label: 'Offset: Top Right', angle: 315, dist: 4, blur: 5.33 },
  { id: 'outerTop', label: 'Offset: Top', angle: 270, dist: 4, blur: 5.33 },
  { id: 'outerTopLeft', label: 'Offset: Top Left', angle: 225, dist: 4, blur: 5.33 },
];

/** A shape's shadow with every value filled in (preset values, then the shape's own), or null. */
export function resolveShadow(shadow) {
  if (!shadow) return null;
  const preset = SHADOW_PRESETS.find((p) => p.id === shadow.preset) || SHADOW_PRESETS[0];
  const own = Object.fromEntries(Object.entries(shadow).filter(([, v]) => v !== undefined && v !== null));
  return { color: '#000000', alpha: 0.4, ...preset, ...own };
}
