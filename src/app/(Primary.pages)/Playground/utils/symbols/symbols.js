/**
 * Insert > Symbol: the default Custom Symbols of WPS Office, Word's Special Characters, the
 * Recently Used and Custom lists (kept on this device), character codes, search, and the
 * LaTeX command for symbols that go into an equation.
 *
 * Pure functions (storage aside), so they can be tested with Node.
 */

/** WPS Office's Custom Symbols, in its order (kg, mm, cm and m² are single characters there too). */
export const DEFAULT_CUSTOM_SYMBOLS = [
  '＋', '—', '×', '÷', '㎏', '㎜', '㎝', '㎡', 'ɑ', 'ɡ', 'α', 'β',
  'θ', '℃', '〖', '｛', '©', '®', '@', '&', '＊', '#', '％', '‰',
  '＄', '￥', '§', '¦', '※', '◎', '≈', '…', '≤', '≥', '≦', '≧',
  '□', '☑', '☒',
];

/** Word's Special Characters tab. */
export const SPECIAL_CHARACTERS = [
  { char: '—', name: 'Em Dash' },
  { char: '–', name: 'En Dash' },
  { char: '‑', name: 'Nonbreaking Hyphen' },
  { char: '­', name: 'Optional Hyphen' },
  { char: ' ', name: 'Em Space' },
  { char: ' ', name: 'En Space' },
  { char: ' ', name: '1/4 Em Space' },
  { char: ' ', name: 'Nonbreaking Space' },
  { char: '©', name: 'Copyright' },
  { char: '®', name: 'Registered' },
  { char: '™', name: 'Trademark' },
  { char: '§', name: 'Section' },
  { char: '¶', name: 'Paragraph' },
  { char: '…', name: 'Ellipsis' },
  { char: '‘', name: 'Single Opening Quote' },
  { char: '’', name: 'Single Closing Quote' },
  { char: '“', name: 'Double Opening Quote' },
  { char: '”', name: 'Double Closing Quote' },
  { char: '​', name: 'No-Width Optional Break' },
  { char: '⁠', name: 'No-Width Non Break' },
];

// Invisible characters are shown by a sign in the grids
export const VISIBLE_STAND_IN = { '­': '-', ' ': '⎵', ' ': '⎵', ' ': '⎵', ' ': '⍽', '​': '¦', '⁠': '¦' };

const RECENT_KEY = 'netz_playground_recent_symbols';
const CUSTOM_KEY = 'netz_playground_custom_symbols';
const RECENT_LIMIT = 20;

function readList(key) {
  try {
    const list = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(list) ? list.filter((c) => typeof c === 'string' && c.length > 0 && c.length <= 4) : null;
  } catch (e) {
    return null;
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {}
}

export function readRecentSymbols() {
  return readList(RECENT_KEY) || [];
}

/** Puts a symbol first in Recently Used (at most 20, no repeats). */
export function rememberRecentSymbol(char, list = readRecentSymbols()) {
  const next = [char, ...list.filter((c) => c !== char)].slice(0, RECENT_LIMIT);
  writeList(RECENT_KEY, next);
  return next;
}

export function readCustomSymbols() {
  return readList(CUSTOM_KEY) || [...DEFAULT_CUSTOM_SYMBOLS];
}

export function addCustomSymbol(char, list = readCustomSymbols()) {
  const next = list.includes(char) ? list : [...list, char];
  writeList(CUSTOM_KEY, next);
  return next;
}

export function removeCustomSymbol(char, list = readCustomSymbols()) {
  const next = list.filter((c) => c !== char);
  writeList(CUSTOM_KEY, next);
  return next;
}

/** The character for a typed character code: hexadecimal ("2211", "U+2211", "0x2211") or decimal. */
export function parseCharacterCode(input, base = 'hex') {
  const raw = String(input || '').trim().replace(/^(u\+|0x|\\u)/i, '');
  if (!raw) return null;
  const valid = base === 'hex' ? /^[0-9a-f]{1,6}$/i.test(raw) : /^\d{1,7}$/.test(raw);
  if (!valid) return null;
  const code = parseInt(raw, base === 'hex' ? 16 : 10);
  if (!Number.isFinite(code) || code < 0x20 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return null;
  return String.fromCodePoint(code);
}

export function characterCode(char, base = 'hex') {
  const code = char.codePointAt(0);
  return base === 'hex' ? code.toString(16).toUpperCase().padStart(4, '0') : String(code);
}

/** "GREEK SMALL LETTER ALPHA" -> "Greek Small Letter Alpha" */
export function displayName(name) {
  return String(name).toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, sep, ch) => sep + ch.toUpperCase());
}

/**
 * Finds characters by name ("integral", "arrow right"), by the character itself, or by its
 * code ("2211", "U+2211"). Every word of the query must appear in the name.
 *
 * @param {Array<{ name: string, chars: Array<[number, string]> }>} blocks
 * @returns {Array<[number, string]>}
 */
export function searchSymbols(blocks, query, limit = 400) {
  const q = String(query || '').trim();
  if (!q) return [];
  const results = [];
  const byChar = [...q].length === 1 ? q.codePointAt(0) : null;
  const byCode = /^(u\+|0x)?[0-9a-f]{2,6}$/i.test(q) ? parseInt(q.replace(/^(u\+|0x)/i, ''), 16) : null;
  const words = q.toUpperCase().split(/\s+/).filter(Boolean);
  for (const block of blocks) {
    for (const entry of block.chars) {
      const [code, name] = entry;
      if (code === byChar || code === byCode || words.every((w) => name.includes(w))) {
        results.push(entry);
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

/**
 * The LaTeX for a symbol inserted into an equation, so it shows as maths (α becomes \alpha).
 * Symbols without a command go in as they are.
 */
const LATEX = {
  α: '\\alpha', β: '\\beta', γ: '\\gamma', δ: '\\delta', ε: '\\epsilon', ζ: '\\zeta', η: '\\eta', θ: '\\theta',
  ι: '\\iota', κ: '\\kappa', λ: '\\lambda', μ: '\\mu', ν: '\\nu', ξ: '\\xi', π: '\\pi', ρ: '\\rho', σ: '\\sigma',
  τ: '\\tau', υ: '\\upsilon', φ: '\\phi', χ: '\\chi', ψ: '\\psi', ω: '\\omega', ɑ: '\\alpha',
  Γ: '\\Gamma', Δ: '\\Delta', Θ: '\\Theta', Λ: '\\Lambda', Ξ: '\\Xi', Π: '\\Pi', Σ: '\\Sigma', Φ: '\\Phi', Ψ: '\\Psi', Ω: '\\Omega',
  '±': '\\pm', '∓': '\\mp', '×': '\\times', '÷': '\\div', '·': '\\cdot', '∙': '\\cdot', '≤': '\\le', '≥': '\\ge', '≦': '\\leqq', '≧': '\\geqq',
  '≠': '\\ne', '≈': '\\approx', '≡': '\\equiv', '∼': '\\sim', '≅': '\\cong', '∝': '\\propto', '∞': '\\infty',
  '∑': '\\sum', '∏': '\\prod', '∫': '\\int', '∬': '\\iint', '∭': '\\iiint', '∮': '\\oint', '∂': '\\partial', '∇': '\\nabla',
  '√': '\\sqrt{}', '∈': '\\in', '∉': '\\notin', '∋': '\\ni', '⊂': '\\subset', '⊃': '\\supset', '⊆': '\\subseteq', '⊇': '\\supseteq',
  '∪': '\\cup', '∩': '\\cap', '∅': '\\emptyset', '∀': '\\forall', '∃': '\\exists', '¬': '\\neg', '∧': '\\land', '∨': '\\lor',
  '→': '\\to', '←': '\\leftarrow', '↑': '\\uparrow', '↓': '\\downarrow', '↔': '\\leftrightarrow', '⇒': '\\Rightarrow',
  '⇐': '\\Leftarrow', '⇔': '\\Leftrightarrow', '↦': '\\mapsto', '°': '^\\circ', '℃': '^\\circ C', '∠': '\\angle', '⊥': '\\perp',
  '∥': '\\parallel', '△': '\\triangle', '…': '\\ldots', '⋯': '\\cdots', '⋮': '\\vdots', '⋱': '\\ddots', '′': "'", '″': "''",
  'ℝ': '\\mathbb{R}', 'ℕ': '\\mathbb{N}', 'ℤ': '\\mathbb{Z}', 'ℚ': '\\mathbb{Q}', 'ℂ': '\\mathbb{C}', 'ℏ': '\\hbar', 'ℓ': '\\ell',
  '＋': '+', '—': '-', '％': '\\%', '%': '\\%', '#': '\\#', '&': '\\&', '$': '\\$', '＄': '\\$', '{': '\\{', '}': '\\}', '｛': '\\{',
};

export function latexForSymbol(char) {
  const command = LATEX[char];
  if (!command) return char;
  // A space keeps the command apart from a letter typed after it (\alpha x, not \alphax)
  return /[a-zA-Z]$/.test(command) ? `${command} ` : command;
}
