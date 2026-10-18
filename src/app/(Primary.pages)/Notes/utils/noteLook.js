import { useEffect, useState } from 'react';
import {
  LuAtom,
  LuCheckCircle2,
  LuDumbbell,
  LuFlame,
  LuHeart,
  LuHelpCircle,
  LuPresentation,
  LuBadgeCheck,
  LuBook,
  LuBookmark,
  LuBookOpen,
  LuBrain,
  LuCalculator,
  LuClock,
  LuCode,
  LuCompass,
  LuFlag,
  LuFlaskConical,
  LuGlobe,
  LuGraduationCap,
  LuLayers,
  LuLightbulb,
  LuLineChart,
  LuMicroscope,
  LuPencil,
  LuPuzzle,
  LuRepeat,
  LuRotateCcw,
  LuRuler,
  LuSigma,
  LuStar,
  LuTarget,
  LuZap,
  LuPalette
} from 'react-icons/lu';

/*
 * A note's look (board "Netz Notes Redesign", artboards 11 to 14): an optional colour, icon,
 * cover and status, stored on the note as
 *   note.look = { colour, icon: { kind: 'maths' | 'icon' | 'letters', value }, cover }
 *   note.status = 'draft' | 'learning' | 'revise' | 'exam'
 * plus a colour per tag, shared by every note (see getTagColours in noteStorage.js).
 * Colours come from the --lk-* tokens in ../notes.css.
 */

export const LOOK_COLOURS = [
  { id: 'grey', name: 'Grey' },
  { id: 'red', name: 'Red' },
  { id: 'orange', name: 'Orange' },
  { id: 'yellow', name: 'Yellow' },
  { id: 'green', name: 'Green' },
  { id: 'teal', name: 'Teal' },
  { id: 'blue', name: 'Blue' },
  { id: 'purple', name: 'Purple' },
  { id: 'pink', name: 'Pink' }
];

const KNOWN = new Set(LOOK_COLOURS.map((c) => c.id));

/** The strong colour, tint and swatch of a look colour, as CSS values. */
export function lookColour(id) {
  const c = KNOWN.has(id) ? id : 'grey';
  return { fg: `rgb(var(--lk-${c}))`, tint: `rgb(var(--lk-${c}-t))`, dot: `rgb(var(--lk-${c}-dot))`, channels: `var(--lk-${c})` };
}

export const STATUSES = [
  { id: 'draft', name: 'Draft', colour: 'grey', Icon: LuPencil },
  { id: 'learning', name: 'Learning', colour: 'blue', Icon: LuBookOpen },
  { id: 'revise', name: 'Revise', colour: 'orange', Icon: LuRotateCcw },
  { id: 'exam', name: 'Exam ready', colour: 'green', Icon: LuBadgeCheck }
];

export function statusOf(id) {
  return STATUSES.find((s) => s.id === id) || null;
}

/** The formula font (KaTeX's, already loaded for formula blocks), for maths icons. */
export const MATHS_FONT = "KaTeX_Math, KaTeX_Main, 'Cambria Math', 'Times New Roman', serif";

/** Maths symbols for a page icon, drawn in the formula font. */
export const MATHS_SYMBOLS = ['∑', '∫', 'π', '√', 'Δ', 'λ', '∞', 'f′', '∂', 'σ', 'θ', 'μ', '∇', 'φ', 'x²', 'e', '≈', 'ℝ', 'α', 'β', 'Ω'];

/** Line icons for a page icon. */
export const LINE_ICONS = [
  { id: 'book', name: 'Book', Icon: LuBook },
  { id: 'flask', name: 'Flask', Icon: LuFlaskConical },
  { id: 'atom', name: 'Atom', Icon: LuAtom },
  { id: 'bulb', name: 'Light bulb', Icon: LuLightbulb },
  { id: 'target', name: 'Target', Icon: LuTarget },
  { id: 'flag', name: 'Flag', Icon: LuFlag },
  { id: 'star', name: 'Star', Icon: LuStar },
  { id: 'bookmark', name: 'Bookmark', Icon: LuBookmark },
  { id: 'calculator', name: 'Calculator', Icon: LuCalculator },
  { id: 'chart', name: 'Chart', Icon: LuLineChart },
  { id: 'compass', name: 'Compass', Icon: LuCompass },
  { id: 'clock', name: 'Clock', Icon: LuClock },
  { id: 'graduation', name: 'Graduation cap', Icon: LuGraduationCap },
  { id: 'layers', name: 'Layers', Icon: LuLayers },
  { id: 'pencil', name: 'Pencil', Icon: LuPencil },
  { id: 'globe', name: 'Globe', Icon: LuGlobe },
  { id: 'code', name: 'Code', Icon: LuCode },
  { id: 'sigma', name: 'Sigma', Icon: LuSigma },
  { id: 'brain', name: 'Brain', Icon: LuBrain },
  { id: 'microscope', name: 'Microscope', Icon: LuMicroscope },
  { id: 'ruler', name: 'Ruler', Icon: LuRuler },
  { id: 'puzzle', name: 'Puzzle', Icon: LuPuzzle },
  { id: 'zap', name: 'Spark', Icon: LuZap },
  { id: 'repeat', name: 'Repeat', Icon: LuRepeat },
  { id: 'badge', name: 'Check', Icon: LuBadgeCheck },
  { id: 'palette', name: 'Palette', Icon: LuPalette }
];

export const COVER_PATTERNS = [
  { id: 'plain', name: 'Plain' },
  { id: 'graph', name: 'Graph' },
  { id: 'dots', name: 'Dots' },
  { id: 'lines', name: 'Lines' }
];

/**
 * The cover band's background for a colour and pattern: the tint with exercise-book lines in
 * the strong colour. scale: smaller patterns for small previews.
 */
export function coverStyle(colourId, pattern, scale = 1) {
  const { tint, channels } = lookColour(colourId);
  const grid = Math.round(22 * scale);
  const style = { backgroundColor: tint };
  if (pattern === 'graph') {
    style.backgroundImage = `linear-gradient(rgb(${channels} / 0.14) 1px, transparent 1px), linear-gradient(90deg, rgb(${channels} / 0.14) 1px, transparent 1px)`;
    style.backgroundSize = `${grid}px ${grid}px`;
  } else if (pattern === 'dots') {
    style.backgroundImage = `radial-gradient(rgb(${channels} / 0.3) 1.3px, transparent 1.5px)`;
    style.backgroundSize = `${Math.round(18 * scale)}px ${Math.round(18 * scale)}px`;
  } else if (pattern === 'lines') {
    style.backgroundImage = `linear-gradient(rgb(${channels} / 0.17) 1px, transparent 1px)`;
    style.backgroundSize = `100% ${Math.round(20 * scale)}px`;
  }
  return style;
}

/**
 * A banner (cover): { kind: 'pattern' | 'art' | 'image', value }. Notes saved before banner art
 * stored only a pattern name ('graph'); that still reads as { kind: 'pattern', value: 'graph' }.
 */
export function coverOf(cover) {
  if (!cover) return null;
  if (typeof cover === 'string') return { kind: 'pattern', value: cover };
  if (cover.kind && cover.value) return cover;
  return null;
}

/** The note's look, with every part filled in or empty. */
export function lookOf(note) {
  const look = note?.look || {};
  return { colour: KNOWN.has(look.colour) ? look.colour : null, icon: look.icon?.value ? look.icon : null, cover: coverOf(look.cover) };
}

/** Built-in banner art: maths drawings in the note colour. */
export const COVER_ART = [
  { id: 'waves', name: 'Waves' },
  { id: 'plot', name: 'Graph' },
  { id: 'bell', name: 'Bell curve' },
  { id: 'geometry', name: 'Shapes' },
  { id: 'spiral', name: 'Spiral' },
  { id: 'contours', name: 'Contours' },
  { id: 'stars', name: 'Stars' },
  { id: 'symbols', name: 'Symbols' }
];

/** Badges a student can pin on a note's banner, up to four. */
export const MAX_BADGES = 4;
export const BADGES = [
  { id: 'important', name: 'Important', colour: 'yellow', Icon: LuStar },
  { id: 'exam', name: 'Exam topic', colour: 'purple', Icon: LuGraduationCap },
  { id: 'formulas', name: 'Formula sheet', colour: 'teal', Icon: LuSigma },
  { id: 'tricky', name: 'Tricky', colour: 'orange', Icon: LuFlame },
  { id: 'practice', name: 'Needs practice', colour: 'blue', Icon: LuDumbbell },
  { id: 'mastered', name: 'Mastered', colour: 'green', Icon: LuCheckCircle2 },
  { id: 'idea', name: 'Key idea', colour: 'yellow', Icon: LuLightbulb },
  { id: 'questions', name: 'Questions', colour: 'red', Icon: LuHelpCircle },
  { id: 'lecture', name: 'Lecture', colour: 'grey', Icon: LuPresentation },
  { id: 'favourite', name: 'Favourite', colour: 'pink', Icon: LuHeart }
];

export function badgesOf(note) {
  return (Array.isArray(note?.badges) ? note.badges : []).filter((id) => BADGES.some((b) => b.id === id)).slice(0, MAX_BADGES);
}

/**
 * A look colour as plain rgb() strings, for drawings that cannot read CSS variables (inline
 * SVG art, which the PDF export also draws). Follows light and dark mode.
 */
export function useLookRgb(colourId) {
  const id = KNOWN.has(colourId) ? colourId : 'grey';
  const read = () => {
    if (typeof window === 'undefined') return { fg: 'rgb(85 85 90)', tint: 'rgb(239 239 235)' };
    const s = getComputedStyle(document.documentElement);
    return { fg: `rgb(${s.getPropertyValue(`--lk-${id}`).trim() || '85 85 90'})`, tint: `rgb(${s.getPropertyValue(`--lk-${id}-t`).trim() || '239 239 235'})` };
  };
  const [rgb, setRgb] = useState(read);
  useEffect(() => {
    setRgb(read());
    const observer = new MutationObserver(() => setRgb(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return rgb;
}

// A fixed pseudo-random sequence, so each drawing is the same every time
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function artShapes(id, fg) {
  const line = { fill: 'none', stroke: fg, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const out = [];
  if (id === 'waves') {
    for (let k = 0; k < 6; k++) {
      let d = '';
      for (let x = -10; x <= 810; x += 8) {
        const y = 22 + k * 24 + Math.sin((x / 800) * Math.PI * (2 + k * 0.45) + k) * (9 + k * 2.5);
        d += `${d ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
      }
      out.push(<path key={`w${k}`} d={d} {...line} strokeWidth={2.2} opacity={0.16 + k * 0.08} />);
    }
  } else if (id === 'plot') {
    for (let x = 40; x < 800; x += 40) out.push(<path key={`gx${x}`} d={`M${x} 0V160`} {...line} strokeWidth={1} opacity={0.1} />);
    for (let y = 20; y < 160; y += 40) out.push(<path key={`gy${y}`} d={`M0 ${y}H800`} {...line} strokeWidth={1} opacity={0.1} />);
    out.push(<path key="ax" d="M60 140H780M80 150V10" {...line} strokeWidth={2} opacity={0.4} />);
    let d = '';
    for (let x = 90; x <= 760; x += 6) {
      const t = (x - 420) / 300;
      d += `${d ? 'L' : 'M'}${x} ${(128 - (1 - t * t) * 100 + Math.sin(t * 6) * 6).toFixed(1)}`;
    }
    out.push(<path key="curve" d={d} {...line} strokeWidth={3} opacity={0.7} />);
    out.push(<path key="tan" d="M470 10L690 150" {...line} strokeWidth={2} opacity={0.45} strokeDasharray="6 6" />);
    out.push(<circle key="p1" cx={566} cy={71} r={6} fill={fg} opacity={0.75} />);
    out.push(<circle key="p2" cx={300} cy={52} r={4} fill={fg} opacity={0.45} />);
  } else if (id === 'bell') {
    const rnd = seeded(7);
    for (let i = 0; i < 26; i++) {
      const x = 75 + i * 26;
      const t = (x - 400) / 110;
      const h = Math.exp(-t * t / 2) * 110 * (0.85 + rnd() * 0.25);
      out.push(<rect key={`b${i}`} x={x} y={150 - h} width={20} height={h} rx={3} fill={fg} opacity={0.14} />);
    }
    let d = '';
    for (let x = 40; x <= 760; x += 5) {
      const t = (x - 400) / 110;
      d += `${d ? 'L' : 'M'}${x} ${(150 - Math.exp(-t * t / 2) * 120).toFixed(1)}`;
    }
    out.push(<path key="bell" d={d} {...line} strokeWidth={3} opacity={0.7} />);
    out.push(<path key="mu" d="M400 24V150" {...line} strokeWidth={1.5} opacity={0.4} strokeDasharray="4 6" />);
  } else if (id === 'geometry') {
    out.push(<circle key="c1" cx={110} cy={70} r={52} {...line} strokeWidth={2.5} opacity={0.35} />);
    out.push(<circle key="c2" cx={650} cy={110} r={70} {...line} strokeWidth={2.5} opacity={0.25} />);
    out.push(<path key="t1" d="M300 132L370 22L440 132Z" {...line} strokeWidth={2.5} opacity={0.4} />);
    out.push(<rect key="s1" x={500} y={24} width={64} height={64} rx={4} transform="rotate(18 532 56)" {...line} strokeWidth={2.5} opacity={0.35} />);
    out.push(<path key="h1" d="M200 30l26 15v30l-26 15l-26-15v-30z" {...line} strokeWidth={2} opacity={0.3} />);
    out.push(<circle key="d1" cx={760} cy={30} r={8} fill={fg} opacity={0.3} />);
    out.push(<circle key="d2" cx={250} cy={130} r={6} fill={fg} opacity={0.3} />);
    out.push(<path key="r1" d="M110 70L162 70" {...line} strokeWidth={2} opacity={0.45} />);
  } else if (id === 'spiral') {
    // Golden spiral: r = a·e^(bθ) with b = ln(φ) / (π/2), unwinding from a point on the right
    const b = Math.log(1.618) / (Math.PI / 2);
    let d = '';
    for (let th = 0; th <= Math.PI * 4.5; th += 0.06) {
      const r = 2.2 * Math.exp(b * th);
      const px = 560 + r * Math.cos(th);
      const py = 80 + r * Math.sin(th);
      d += `${d ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    out.push(<path key="sp" d={d} {...line} strokeWidth={3} opacity={0.6} />);
    for (let i = 0; i < 5; i++) out.push(<circle key={`ring${i}`} cx={170} cy={80} r={18 + i * 24} {...line} strokeWidth={1.5} opacity={0.12 + i * 0.03} />);
  } else if (id === 'contours') {
    for (let i = 0; i < 7; i++) {
      out.push(<ellipse key={`a${i}`} cx={230} cy={95} rx={30 + i * 34} ry={16 + i * 17} transform={`rotate(-8 230 95)`} {...line} strokeWidth={2} opacity={0.12 + i * 0.05} />);
      out.push(<ellipse key={`b${i}`} cx={640} cy={45} rx={20 + i * 28} ry={12 + i * 13} transform={`rotate(12 640 45)`} {...line} strokeWidth={2} opacity={0.12 + i * 0.04} />);
    }
  } else if (id === 'stars') {
    const rnd = seeded(31);
    const pts = Array.from({ length: 26 }, () => [20 + rnd() * 760, 15 + rnd() * 130]).sort((a, b) => a[0] - b[0]);
    let d = '';
    pts.forEach(([px, py], i) => {
      if (i % 5 !== 4) d += `${i % 5 === 0 ? 'M' : 'L'}${px.toFixed(0)} ${py.toFixed(0)}`;
    });
    out.push(<path key="lines" d={d} {...line} strokeWidth={1.5} opacity={0.35} />);
    pts.forEach(([px, py], i) => out.push(<circle key={`s${i}`} cx={px} cy={py} r={2 + (i % 3)} fill={fg} opacity={0.35 + (i % 4) * 0.12} />));
  } else if (id === 'symbols') {
    const glyphs = ['∑', '∫', 'π', '√', 'Δ', '∞', 'λ', 'θ', '∂', 'σ', 'φ', 'e', 'x²', '≈', 'μ', '∇'];
    const rnd = seeded(11);
    glyphs.forEach((g, i) => {
      const x = 30 + i * 49 + rnd() * 20;
      const y = 50 + rnd() * 90;
      const size = 26 + rnd() * 40;
      out.push(
        <text key={`g${i}`} x={x} y={y} fontSize={size} fill={fg} opacity={0.16 + rnd() * 0.3} fontStyle="italic" fontFamily={MATHS_FONT} transform={`rotate(${(rnd() - 0.5) * 30} ${x} ${y})`}>
          {g}
        </text>
      );
    });
  }
  return out;
}

/** Built-in banner art as inline SVG, filling its box. */
export function CoverArt({ id, colour, className = '' }) {
  const { fg, tint } = useLookRgb(colour);
  return (
    <svg data-banner-fill="art" viewBox="0 0 800 160" preserveAspectRatio="xMidYMid slice" className={`block w-full h-full ${className}`} style={{ background: tint }} aria-hidden="true">
      {artShapes(id, fg)}
    </svg>
  );
}

/** A banner image saved on this device (or a quiet placeholder if it is missing). */
function CoverImage({ id, colour }) {
  const [url, setUrl] = useState(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let live = true;
    setMissing(false);
    import('./imageStore').then(({ getBannerImageUrl }) =>
      getBannerImageUrl(id).then((u) => {
        if (!live) return;
        setUrl(u);
        setMissing(!u);
      })
    );
    return () => {
      live = false;
    };
  }, [id]);
  const c = lookColour(colour || 'grey');
  if (missing) {
    return (
      <span data-banner-fill="missing" className="w-full h-full flex items-center justify-center text-[13px] font-medium" style={{ background: c.tint, color: c.fg }}>
        This picture is on another device
      </span>
    );
  }
  return <span data-banner-fill="image" className="block w-full h-full bg-center bg-cover" style={{ backgroundColor: c.tint, backgroundImage: url ? `url("${url}")` : undefined }} />;
}

/** What fills a banner: a pattern, built-in art or an uploaded image. */
export function BannerFill({ cover, colour, patternScale = 1 }) {
  const c = coverOf(cover);
  if (!c) return null;
  if (c.kind === 'art') return <CoverArt id={c.value} colour={colour} />;
  if (c.kind === 'image') return <CoverImage id={c.value} colour={colour} />;
  return <span data-banner-fill="pattern" className="block w-full h-full" style={coverStyle(colour || 'grey', c.value, patternScale)} />;
}

/** Up to four badges as round icons (their names show on hover and to screen readers). */
export function BadgeRow({ ids, size = 36, className = '' }) {
  if (!ids.length) return null;
  return (
    <span className={`flex items-center gap-1.5 ${className}`} role="list" aria-label="Badges">
      {ids.map((id) => {
        const b = BADGES.find((x) => x.id === id);
        if (!b) return null;
        const c = lookColour(b.colour);
        return (
          <span
            key={id}
            role="listitem"
            title={b.name}
            aria-label={b.name}
            data-badge={id}
            className="inline-flex items-center justify-center rounded-full shrink-0"
            style={{ width: size, height: size, background: 'rgb(var(--nt-surface))', color: c.fg, boxShadow: `inset 0 0 0 2px ${c.tint}, var(--nt-shadow-bar)` }}
          >
            <b.Icon style={{ width: size * 0.5, height: size * 0.5 }} aria-hidden="true" />
          </span>
        );
      })}
    </span>
  );
}

/**
 * A note's icon tile. Without an icon it shows the first letter of the title in grey (in the
 * list) or nothing (placeholder: false).
 * size: the tile's side in px. ring: a surface ring around it (when it sits on a cover).
 */
export function NoteIcon({ note, size = 32, ring = false, placeholder = true, className = '' }) {
  const { colour, icon } = lookOf(note);
  if (!icon && !placeholder) return null;
  const c = lookColour(colour || 'grey');
  const radius = Math.round(size * 0.28);
  const base = {
    width: size,
    height: size,
    borderRadius: radius,
    background: c.tint,
    color: c.fg,
    boxShadow: ring ? `0 0 0 ${Math.max(3, Math.round(size / 20))}px rgb(var(--nt-surface))` : undefined
  };

  let content;
  if (!icon) {
    const letter = (note?.title || '?').trim().charAt(0).toUpperCase() || '?';
    content = <span style={{ fontWeight: 700, fontSize: Math.round(size * 0.44) }}>{letter}</span>;
  } else if (icon.kind === 'icon') {
    const found = LINE_ICONS.find((i) => i.id === icon.value);
    const Icon = found ? found.Icon : LuStar;
    content = <Icon style={{ width: size * 0.55, height: size * 0.55 }} aria-hidden="true" />;
  } else if (icon.kind === 'letters') {
    content = <span style={{ fontWeight: 700, fontSize: Math.round(size * (icon.value.length > 1 ? 0.38 : 0.46)) }}>{icon.value}</span>;
  } else {
    content = (
      <span style={{ fontFamily: MATHS_FONT, fontStyle: 'italic', fontSize: Math.round(size * 0.56), lineHeight: 1 }}>
        {icon.value}
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={`inline-flex items-center justify-center shrink-0 select-none ${className}`} style={base}>
      {content}
    </span>
  );
}

/** A status badge (icon + name in the status colour). */
export function StatusBadge({ id, small = false, className = '' }) {
  const s = statusOf(id);
  if (!s) return null;
  const c = lookColour(s.colour);
  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 rounded-full font-semibold whitespace-nowrap ${small ? 'h-5 pl-1.5 pr-2 text-[11px]' : 'h-[30px] pl-2.5 pr-3 text-[13px]'} ${className}`}
      style={{ background: c.tint, color: c.fg }}
    >
      <s.Icon className={small ? 'w-3 h-3' : 'w-[15px] h-[15px]'} aria-hidden="true" />
      {s.name}
    </span>
  );
}
