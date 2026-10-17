/**
 * Pen types (PLAYGROUND_VISUAL_REDESIGN_PLAN.md, step 5.1). A pen type is a real setting: it keeps
 * its own width (changed with the width slider) and sets the opacity. Ballpoint is the default,
 * at today's default thickness of 3 px.
 */

export const PEN_TYPES = [
  { id: 'ballpoint', label: 'Ballpoint', width: 3, opacity: 1 },
  { id: 'fountain', label: 'Fountain', width: 5, opacity: 1 },
  { id: 'pencil', label: 'Pencil', width: 3, opacity: 0.7 },
  { id: 'marker', label: 'Marker', width: 10, opacity: 0.85 },
];

export const DEFAULT_PEN_TYPE = 'ballpoint';

/** The starting width of each type: { ballpoint: 3, fountain: 5, ... } */
export const DEFAULT_PEN_WIDTHS = Object.fromEntries(PEN_TYPES.map((t) => [t.id, t.width]));

export function penTypeOf(id) {
  return PEN_TYPES.find((t) => t.id === id) || PEN_TYPES[0];
}

// The default ink: graphite (decision R1). Blue stays in the palette.
export const DEFAULT_INK = '#18181B';

// Remembered on this device: { colour, type, widths }
export const PEN_STORAGE_KEY = 'netz_playground_pen';

export function readPenSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(PEN_STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return null;
    const widths = { ...DEFAULT_PEN_WIDTHS };
    if (saved.widths && typeof saved.widths === 'object') {
      for (const t of PEN_TYPES) {
        const w = Number(saved.widths[t.id]);
        if (Number.isFinite(w) && w >= 1 && w <= 16) widths[t.id] = Math.round(w);
      }
    }
    return {
      colour: typeof saved.colour === 'string' && /^#[0-9a-fA-F]{6}$/.test(saved.colour) ? saved.colour.toUpperCase() : null,
      type: PEN_TYPES.some((t) => t.id === saved.type) ? saved.type : DEFAULT_PEN_TYPE,
      widths,
    };
  } catch (e) {
    return null;
  }
}

export function writePenSettings(settings) {
  try {
    localStorage.setItem(PEN_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}
