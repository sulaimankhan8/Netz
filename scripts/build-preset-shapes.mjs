/**
 * Builds the Playground's shape geometry from Office's preset shape definitions.
 *
 *   node scripts/build-preset-shapes.mjs path/to/presetShapeDefinitions.xml
 *
 * The XML file is published with the Office Open XML standard (ECMA-376 Part 1, DrawingML
 * geometries) and is what Word, PowerPoint, WPS Office and LibreOffice draw their shapes from.
 * A copy is kept by LibreOffice at oox/source/drawingml/customshapes/presetShapeDefinitions.xml.
 *
 * Output: src/app/(Primary.pages)/Playground/utils/shapes/presetShapes.generated.js
 * (committed; the app never reads XML). Every preset is evaluated once after building,
 * so an operator or a built-in name the evaluator does not know stops the build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'app', '(Primary.pages)', 'Playground', 'utils', 'shapes', 'presetShapes.generated.js');

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/build-preset-shapes.mjs path/to/presetShapeDefinitions.xml');
  process.exit(1);
}
const xml = fs.readFileSync(input, 'utf8');

// ── A small XML reader: elements and attributes only (the file has no text content) ──
function parseXml(source) {
  const root = { name: '#root', attrs: {}, children: [] };
  const stack = [root];
  const tag = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  let match;
  while ((match = tag.exec(source))) {
    if (!match[2]) continue; // comment or declaration
    const [, closing, rawName, rawAttrs, selfClosing] = match;
    const name = rawName.includes(':') ? rawName.split(':').pop() : rawName;
    if (closing) {
      const open = stack.pop();
      if (!open || open.name !== name) throw new Error(`Unbalanced XML near </${rawName}>`);
      continue;
    }
    const attrs = {};
    const attr = /([\w:.-]+)\s*=\s*"([^"]*)"/g;
    let a;
    while ((a = attr.exec(rawAttrs))) {
      if (a[1] === 'xmlns' || a[1].startsWith('xmlns:')) continue;
      attrs[a[1].includes(':') ? a[1].split(':').pop() : a[1]] = a[2];
    }
    const node = { name, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
  }
  if (stack.length !== 1) throw new Error('Unclosed XML element');
  return root;
}

const child = (node, name) => node.children.find((c) => c.name === name) || null;
const children = (node, name) => (node ? node.children.filter((c) => c.name === name) : []);

// Numbers become numbers; anything else is the name of a guide
const arg = (value) => {
  if (value === undefined) return undefined;
  return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
};

function parseFormula(fmla) {
  const [op, ...args] = fmla.trim().split(/\s+/);
  return [op, ...args.map(arg)];
}

function convertPreset(node) {
  const def = {};

  const av = children(child(node, 'avLst'), 'gd').map((gd) => [gd.attrs.name, ...parseFormula(gd.attrs.fmla)]);
  if (av.length) def.av = av;

  const gd = children(child(node, 'gdLst'), 'gd').map((g) => [g.attrs.name, ...parseFormula(g.attrs.fmla)]);
  if (gd.length) def.gd = gd;

  const ahList = child(node, 'ahLst');
  if (ahList) {
    def.ah = ahList.children.map((h) => {
      const pos = child(h, 'pos');
      const at = (k) => arg(h.attrs[k]);
      if (h.name === 'ahPolar') {
        return { t: 'polar', ga: h.attrs.gdRefAng, minA: at('minAng'), maxA: at('maxAng'), gr: h.attrs.gdRefR, minR: at('minR'), maxR: at('maxR'), x: arg(pos.attrs.x), y: arg(pos.attrs.y) };
      }
      return { t: 'xy', gx: h.attrs.gdRefX, minX: at('minX'), maxX: at('maxX'), gy: h.attrs.gdRefY, minY: at('minY'), maxY: at('maxY'), x: arg(pos.attrs.x), y: arg(pos.attrs.y) };
    });
    for (const h of def.ah) for (const k of Object.keys(h)) if (h[k] === undefined) delete h[k];
  }

  const cxn = children(child(node, 'cxnLst'), 'cxn').map((c) => {
    const pos = child(c, 'pos');
    return [arg(c.attrs.ang), arg(pos.attrs.x), arg(pos.attrs.y)];
  });
  if (cxn.length) def.cxn = cxn;

  const rect = child(node, 'rect');
  if (rect) def.rect = [arg(rect.attrs.l), arg(rect.attrs.t), arg(rect.attrs.r), arg(rect.attrs.b)];

  def.paths = children(child(node, 'pathLst'), 'path').map((p) => {
    const out = {};
    if (p.attrs.w !== undefined) out.w = Number(p.attrs.w);
    if (p.attrs.h !== undefined) out.h = Number(p.attrs.h);
    if (p.attrs.fill && p.attrs.fill !== 'norm') out.fill = p.attrs.fill;
    if (p.attrs.stroke === 'false' || p.attrs.stroke === '0') out.stroke = false;
    out.cmds = p.children.map((c) => {
      const pts = children(c, 'pt').map((pt) => [arg(pt.attrs.x), arg(pt.attrs.y)]);
      switch (c.name) {
        case 'moveTo': return ['M', ...pts[0]];
        case 'lnTo': return ['L', ...pts[0]];
        case 'arcTo': return ['A', arg(c.attrs.wR), arg(c.attrs.hR), arg(c.attrs.stAng), arg(c.attrs.swAng)];
        case 'quadBezTo': return ['Q', ...pts[0], ...pts[1]];
        case 'cubicBezTo': return ['C', ...pts[0], ...pts[1], ...pts[2]];
        case 'close': return ['Z'];
        default: throw new Error(`Unknown path command <${c.name}>`);
      }
    });
    return out;
  });

  return def;
}

const tree = parseXml(xml);
const top = tree.children[0];
if (!top) throw new Error('Empty XML');
const presets = {};
for (const node of top.children) presets[node.name] = convertPreset(node);

const names = Object.keys(presets).sort();
const lines = names.map((name) => `  ${JSON.stringify(name)}: ${JSON.stringify(presets[name])},`);
const source = `/**
 * Office preset shape geometry (${names.length} shapes). GENERATED FILE: do not edit by hand.
 *
 * Built by scripts/build-preset-shapes.mjs from presetShapeDefinitions.xml, the DrawingML
 * preset geometries of the Office Open XML standard (ECMA-376 Part 1). Format, per shape:
 *   av    adjustment values: [name, operator, ...arguments]  (defaults; a shape may override them)
 *   gd    guides, evaluated in order: [name, operator, ...arguments]
 *   ah    adjustment handles: { t: 'xy' | 'polar', guide references, limits, x, y }
 *   cxn   connection points: [angle, x, y]
 *   rect  text rectangle: [left, top, right, bottom]
 *   paths { w?, h?, fill?, stroke?, cmds: [['M', x, y] | ['L', x, y] | ['A', wR, hR, stAng, swAng]
 *           | ['Q', x1, y1, x, y] | ['C', x1, y1, x2, y2, x, y] | ['Z']] }
 * Numbers are literal values; strings name a guide, an adjustment value or a built-in.
 */

export const PRESET_SHAPES = {
${lines.join('\n')}
};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, source);
console.log(`Wrote ${names.length} presets to ${path.relative(ROOT, OUT)} (${Math.round(source.length / 1024)} KB)`);

// Every preset must evaluate with the app's evaluator before the file is used
const { evaluatePreset } = await import(`file://${path.join(ROOT, 'src', 'app', '(Primary.pages)', 'Playground', 'utils', 'shapes', 'presetEvaluator.js').replace(/\\/g, '/')}?t=${Date.now()}`);
let problems = 0;
for (const name of names) {
  try {
    const geometry = evaluatePreset(name, 160, 100);
    for (const p of geometry.paths) if (/NaN|undefined|Infinity/.test(p.d)) throw new Error(`bad path: ${p.d.slice(0, 80)}`);
  } catch (err) {
    problems++;
    console.error(`  ${name}: ${err.message}`);
  }
}
if (problems) {
  console.error(`${problems} preset(s) failed to evaluate`);
  process.exit(1);
}
console.log('All presets evaluate.');
