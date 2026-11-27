/**
 * The pictures inside the Unit 6–15 task medals (docs/rewards/NETZ_MEDALS_CATALOG.md section 2b): one small drawing per
 * method page. Same box and colour props as taskEmblems.js: drawn in 120×120, inside about x 26–94,
 * y 28–92; `ink` is the main line, `acc` the accent, `rim` the frame colour, `soft` a pale line.
 * The hexagon behind them is split in two colours (medals.js), so pictures lean on `ink` and `acc`,
 * which each unit picks to read on both halves.
 */

const S = (c, w = 4) => ({ stroke: c, strokeWidth: w, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' });
const axes = (c, x = 30, y = 86) => <path d={`M${x} 28 V${y} H94`} {...S(c, 3)} opacity="0.7" />;
const xAxis = (c, y = 62) => <path d={`M26 ${y} H94`} {...S(c, 3)} opacity="0.7" />;
const dot = (x, y, c, r = 4.5) => <circle cx={x} cy={y} r={r} fill={c} />;
const ring = (x, y, c, r = 4.5, w = 3) => <circle cx={x} cy={y} r={r} {...S(c, w)} />;

/** A line from (x1, y1) to (x2, y2) with an arrow head at the end. */
function arrow(x1, y1, x2, y2, c, w = 4, s = 8) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (t) => `${(x2 - s * Math.cos(a + t)).toFixed(1)} ${(y2 - s * Math.sin(a + t)).toFixed(1)}`;
  return <path d={`M${x1} ${y1} L${x2} ${y2} M${p(0.55)} L${x2} ${y2} L${p(-0.55)}`} {...S(c, w)} />;
}

/** Matrix brackets round the box x1–x2, y1–y2. */
const brackets = (c, x1 = 32, x2 = 88, y1 = 32, y2 = 88, w = 4) => (
  <path d={`M${x1 + 7} ${y1} H${x1} V${y2} H${x1 + 7} M${x2 - 7} ${y1} H${x2} V${y2} H${x2 - 7}`} {...S(c, w)} />
);

/** A grid of dots inside matrix brackets; `on(r, c)` picks which dots use the accent. */
function matrixDots(ink, acc, n = 3, on = () => false) {
  const step = 40 / (n - 1);
  const out = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const hit = on(r, c);
      out.push(<circle key={`${r}-${c}`} cx={40 + c * step} cy={40 + r * step} r={hit ? 5 : 3.5} fill={hit ? acc : ink} opacity={hit ? 1 : 0.8} />);
    }
  }
  return out;
}

/** A sheet of paper with a folded corner. */
const paper = (c, fill = 'none', x1 = 38, x2 = 82, y1 = 28, y2 = 92) => (
  <>
    <path d={`M${x1} ${y1} H${x2 - 12} L${x2} ${y1 + 12} V${y2} H${x1} Z`} fill={fill} stroke={c} strokeWidth="4" strokeLinejoin="round" />
    <path d={`M${x2 - 12} ${y1} V${y1 + 12} H${x2}`} {...S(c, 3)} />
  </>
);

/** A coin. */
const coin = (x, y, r, c, inner) => (
  <>
    <circle cx={x} cy={y} r={r} fill={c} />
    <circle cx={x} cy={y} r={r * 0.62} {...S(inner, 2.5)} />
  </>
);

/** A small % sign centred at (x, y). */
const percent = (x, y, c, k = 1) => (
  <>
    <path d={`M${x + 8 * k} ${y - 9 * k} L${x - 8 * k} ${y + 9 * k}`} {...S(c, 3.5 * k)} />
    <circle cx={x - 6 * k} cy={y - 6 * k} r={3.5 * k} fill={c} />
    <circle cx={x + 6 * k} cy={y + 6 * k} r={3.5 * k} fill={c} />
  </>
);

/** A receipt with a torn bottom edge. */
const receipt = (c, fill = 'none', x1 = 40, x2 = 80, y1 = 28, y2 = 90) => {
  const teeth = [];
  const n = 5;
  const w = (x2 - x1) / n;
  for (let i = 0; i < n; i++) teeth.push(`L${(x2 - (i + 0.5) * w).toFixed(1)} ${y2 - 5} L${(x2 - (i + 1) * w).toFixed(1)} ${y2}`);
  return <path d={`M${x1} ${y1} H${x2} V${y2} ${teeth.join(' ')} Z`} fill={fill} stroke={c} strokeWidth="3.5" strokeLinejoin="round" />;
};

/** Vertical stems with dots on top, like a sampled signal. */
const stems = (xs, ys, c, base = 82, w = 3.5) => xs.map((x, i) => (
  <g key={x}>
    <path d={`M${x} ${base} V${ys[i]}`} {...S(c, w)} />
    <circle cx={x} cy={ys[i]} r="4" fill={c} />
  </g>
));

/** Bars standing on y = base. */
const bars = (xs, tops, c, base = 86, w = 9) => xs.map((x, i) => <rect key={x} x={x - w / 2} y={tops[i]} width={w} height={base - tops[i]} rx="1.5" fill={c} />);

/** A small graph: nodes [[x, y]], edges [[i, j]]. */
function graph(nodes, edges, c, w = 2.5, opacity = 0.6) {
  return <path d={edges.map(([i, j]) => `M${nodes[i][0]} ${nodes[i][1]} L${nodes[j][0]} ${nodes[j][1]}`).join(' ')} {...S(c, w)} opacity={opacity} />;
}
const nodes = (list, c, r = 5) => list.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c} />);

/** A sine wave from x0 to x1 around y, with amplitude a and `waves` full periods. */
function sine(x0, x1, y, a, waves = 1) {
  const pts = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push(`${(x0 + (x1 - x0) * t).toFixed(1)} ${(y - a * Math.sin(2 * Math.PI * waves * t)).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

/** Points of a curve y = f(x) for x in [x0, x1], as an SVG path. */
function plot(f, x0, x1, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push(`${x.toFixed(1)} ${f(x).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

export const UNIT_EMBLEMS = {
  /* ---------- Unit 6: calculus ---------- */
  'unit6.limit': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d="M34 82 C46 78 54 60 63 52" {...S(ink, 4.5)} />
      <path d="M73 46 C80 42 86 38 92 34" {...S(ink, 4.5)} />
      <path d="M68 54 V86" {...S(acc, 2.5)} strokeDasharray="3 5" />
      {ring(68, 49, acc, 5, 3.5)}
    </>
  ),
  'unit6.derivative': ({ ink, acc }) => (
    <>
      <path d="M28 84 C44 80 52 44 90 34" {...S(ink, 5)} />
      <path d="M34 74 L86 46" {...S(acc, 4)} />
      {dot(58, 61, acc, 5)}
    </>
  ),
  'unit6.integral': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d="M40 86 V66 C54 56 68 50 84 41 V86 Z" fill={ink} opacity="0.35" />
      <path d="M52 86 V61 M64 86 V55 M76 86 V47" {...S(acc, 2.5)} />
      <path d="M32 72 C48 62 66 52 92 37" {...S(ink, 4.5)} />
    </>
  ),
  'unit6.first-principles': ({ ink, acc }) => (
    <>
      <path d="M28 84 Q60 84 92 30" {...S(ink, 4.5)} />
      <path d="M44 87 L90 39" {...S(acc, 3.5)} />
      {dot(60, 70.5, acc)}
      {dot(76, 53.6, acc)}
      <path d="M60 92 H76 M60 88 V95 M76 88 V95" {...S(ink, 2.5)} />
    </>
  ),
  'unit6.implicit': ({ ink, acc }) => (
    <>
      <circle cx="58" cy="62" r="24" {...S(ink, 4.5)} />
      {dot(58, 62, ink, 2.5)}
      <path d="M60 28 L94 62" {...S(acc, 4)} />
      {dot(75, 45, acc, 5)}
    </>
  ),
  'unit6.logarithmic': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d="M34 88 C38 60 52 48 92 40" {...S(ink, 4.5)} />
      <path d="M33 74 L66 36" {...S(acc, 3.5)} />
      {dot(44.6, 61.3, acc)}
    </>
  ),
  'unit6.parametric': ({ ink, acc }) => (
    <>
      <path d="M30 76 C30 40 60 36 66 58 C72 80 92 76 90 50 C88 30 60 30 46 46" {...S(ink, 4.5)} />
      {dot(66, 58, acc, 5)}
      {arrow(40, 52, 46, 46, acc, 4)}
    </>
  ),
  'unit6.tangent-normal': ({ ink, acc }) => (
    <>
      <path d="M26 80 Q60 20 94 80" {...S(ink, 4.5)} />
      <path d="M38 34 L82 34" {...S(acc, 3.5)} />
      <path d="M60 50 V90" {...S(acc, 3.5)} />
      <path d="M60 42 H66 V48" {...S(ink, 2.5)} />
      {dot(60, 50, acc, 4.5)}
    </>
  ),
  'unit6.monotonicity': ({ ink, acc }) => (
    <>
      <path d="M28 82 C40 40 52 36 60 54 C68 72 80 76 92 34" {...S(ink, 4.5)} />
      {arrow(34, 62, 42, 44, acc, 3.5, 7)}
      {arrow(62, 44, 70, 62, acc, 3.5, 7)}
    </>
  ),
  'unit6.maxima-minima': ({ ink, acc }) => (
    <>
      <path d="M26 86 C40 86 48 44 60 44 C72 44 80 86 94 86" {...S(ink, 4.5)} />
      <path d="M60 44 V24" {...S(ink, 3)} />
      <path d="M60 24 L74 29 L60 34 Z" fill={acc} />
    </>
  ),
  'unit6.area-under-curve': ({ ink, acc }) => (
    <>
      {xAxis(ink, 78)}
      <path d="M38 78 V56 C48 40 66 40 82 52 V78 Z" fill={acc} opacity="0.85" />
      <path d="M28 70 C44 36 70 38 92 58" {...S(ink, 4.5)} />
      <path d="M38 50 V86 M82 46 V86" {...S(ink, 2.5)} strokeDasharray="3 4" />
    </>
  ),
  'unit6.taylor-series': ({ ink, acc }) => (
    <>
      <path d={sine(26, 94, 60, 22, 1)} {...S(ink, 4.5)} />
      <path d="M30 92 L60 60 L90 28" {...S(acc, 2.5)} opacity="0.8" />
      <path d="M36 90 C48 64 54 60 60 60 C66 60 72 56 84 30" {...S(acc, 3.5)} />
      {dot(60, 60, acc, 4)}
    </>
  ),
  'unit6.partial-derivative': ({ ink, acc }) => (
    <>
      <path d="M26 66 L58 50 L94 62 L62 80 Z" {...S(ink, 3)} opacity="0.75" />
      <path d="M34 62 L70 77 M42 58 L78 73 M50 54 L86 69" {...S(ink, 2)} opacity="0.5" />
      <path d="M38 52 C46 36 60 30 72 40" {...S(acc, 4.5)} />
      <path d="M42 60 L42 48 M64 70 L64 36" {...S(acc, 2)} strokeDasharray="3 4" />
    </>
  ),
  'unit6.euler-homogeneous': ({ ink, acc }) => (
    <>
      <path d="M30 88 L50 52 L70 88 Z" fill={ink} opacity="0.35" />
      <path d="M30 88 L62 30 L94 88 Z" {...S(ink, 4)} />
      {arrow(48, 46, 58, 34, acc, 3.5, 7)}
      {arrow(74, 76, 86, 84, acc, 3.5, 7)}
    </>
  ),
  'unit6.jacobian': ({ ink, acc }) => (
    <>
      <path d="M26 44 H46 V64 H26 Z M36 44 V64 M26 54 H46" {...S(ink, 2.5)} />
      {arrow(48, 54, 60, 54, acc, 3.5, 6)}
      <path d="M64 40 C74 36 84 38 94 46 C90 56 90 66 92 76 C82 70 72 70 64 74 C66 62 66 52 64 40 Z" {...S(ink, 3)} />
      <path d="M79 38 C78 50 77 62 78 72 M64 57 C74 52 84 54 91 61" {...S(acc, 2.5)} />
    </>
  ),
  'unit6.maxima-minima-2var': ({ ink, acc }) => (
    <>
      <path d="M26 46 C44 64 76 64 94 46" {...S(ink, 4)} />
      <path d="M34 82 C46 56 74 56 86 82" {...S(ink, 4)} />
      <path d="M26 46 L34 82 M94 46 L86 82" {...S(ink, 2.5)} opacity="0.6" />
      {dot(60, 60, acc, 5.5)}
    </>
  ),
  'unit6.lagrange-multipliers': ({ ink, acc }) => (
    <>
      <ellipse cx="50" cy="60" rx="22" ry="14" {...S(ink, 3)} opacity="0.6" />
      <ellipse cx="50" cy="60" rx="12" ry="7" {...S(ink, 3)} opacity="0.6" />
      <ellipse cx="50" cy="60" rx="32" ry="21" {...S(ink, 3.5)} />
      <path d="M58 92 L94 52" {...S(acc, 4)} />
      {dot(76.5, 71.5, acc, 5)}
    </>
  ),
  'unit6.taylor-2var': ({ ink, acc }) => (
    <>
      <path d="M26 84 C34 50 48 40 60 40 C72 40 86 50 94 84" {...S(ink, 4.5)} />
      <path d="M38 40 L52 30 H86 L72 40 Z" fill={acc} opacity="0.85" />
      {dot(60, 40, ink, 4)}
    </>
  ),
  'unit6.double-integral': ({ ink, acc }) => (
    <>
      <path d="M28 80 L60 92 L92 80 L60 68 Z" {...S(ink, 3)} />
      <path d="M44 74 L76 86 M44 86 L76 74" {...S(ink, 2)} opacity="0.6" />
      <path d="M28 80 V52 C40 36 54 40 60 44 C68 36 82 34 92 50 V80" {...S(acc, 4)} />
      <path d="M60 92 V60" {...S(ink, 2.5)} opacity="0.6" />
    </>
  ),
  'unit6.change-of-order': ({ ink, acc }) => (
    <>
      {axes(ink, 30, 88)}
      <path d="M30 88 L84 34 V88 Z" fill={ink} opacity="0.3" />
      <path d="M48 70 V88 M60 58 V88 M72 46 V88" {...S(ink, 3)} />
      <path d="M48 70 H84 M60 58 H84" {...S(acc, 3)} />
      {arrow(40, 40, 58, 32, acc, 3, 6)}
    </>
  ),
  'unit6.triple-integral': ({ ink, acc }) => (
    <>
      <path d="M32 46 L56 34 L88 42 V76 L64 88 L32 80 Z M32 46 L64 54 L88 42 M64 54 V88" {...S(ink, 3.5)} />
      <path d="M50 56 L58 52 L66 54 V64 L58 68 L50 66 Z" fill={acc} />
    </>
  ),
  'unit6.beta-gamma': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d="M36 30 C38 58 44 74 52 76 C62 78 72 72 80 52 C84 42 88 34 90 28" {...S(ink, 4.5)} />
      {dot(48, 74, acc, 4)}
      {dot(60, 76.5, acc, 4)}
      {dot(76, 62, acc, 4)}
    </>
  ),
  'unit6.convergence-tests': ({ ink, acc }) => (
    <>
      {bars([34, 47, 60, 73, 86], [36, 54, 64, 70, 73], ink)}
      <path d="M26 76 H94" {...S(acc, 3)} strokeDasharray="5 4" />
    </>
  ),
  'unit6.power-series': ({ ink, acc }) => (
    <>
      <path d="M26 64 H94" {...S(ink, 3.5)} />
      <path d="M34 54 V74 M86 54 V74" {...S(ink, 3.5)} />
      {dot(60, 64, acc, 5)}
      {arrow(60, 46, 84, 46, acc, 3.5, 7)}
      {arrow(60, 46, 36, 46, acc, 3.5, 7)}
    </>
  ),
  'unit6.fourier-series': ({ ink, acc }) => (
    <>
      <path d="M26 74 V46 H43 V74 H60 V46 H77 V74 H94" {...S(ink, 3.5)} opacity="0.8" />
      <path d="M26 74 C26 40 43 44 43 60 C43 76 60 80 60 60 C60 40 77 44 77 60 C77 76 94 80 94 46" {...S(acc, 3.5)} />
    </>
  ),
  'unit6.harmonic-analysis': ({ ink, acc }) => (
    <>
      <path d={sine(26, 94, 60, 18, 1)} {...S(ink, 3.5)} />
      {nodes([[30, 54], [40, 42], [52, 46], [64, 64], [76, 77], [88, 70]], acc, 4.5)}
    </>
  ),
  'unit6.grad-div-curl': ({ ink, acc }) => (
    <>
      {arrow(30, 82, 42, 70, ink, 3, 6)}
      {arrow(52, 86, 64, 74, ink, 3, 6)}
      {arrow(30, 52, 42, 40, ink, 3, 6)}
      {arrow(76, 86, 88, 74, ink, 3, 6)}
      <path d="M78 32 A12 12 0 1 1 64 46" {...S(acc, 3.5)} />
      <path d="M61 39 L64 46 L71 44" {...S(acc, 3.5)} />
    </>
  ),
  'unit6.trig-integrals': ({ ink, acc }) => (
    <>
      {xAxis(ink, 60)}
      <path d={`${plot((x) => 60 - 24 * Math.sin(((x - 26) / 68) * 2 * Math.PI), 26, 60)} L60 60 Z`} fill={acc} opacity="0.85" />
      <path d={sine(26, 94, 60, 24, 1)} {...S(ink, 4.5)} />
    </>
  ),
  'unit6.improper-integrals': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d={`${plot((x) => 86 - 1500 / ((x - 18) ** 1.4 + 26), 32, 94)} L94 86 L32 86 Z`} fill={ink} opacity="0.3" />
      <path d={plot((x) => 86 - 1500 / ((x - 18) ** 1.4 + 26), 32, 94)} {...S(ink, 4)} />
      <path d="M68 40 C62 32 54 32 54 40 C54 48 62 48 68 40 C74 32 82 32 82 40 C82 48 74 48 68 40 Z" {...S(acc, 3.5)} />
    </>
  ),
  'unit6.volume-revolution': ({ ink, acc }) => (
    <>
      <path d="M30 60 H94" {...S(ink, 2.5)} strokeDasharray="4 4" opacity="0.7" />
      <path d="M34 48 C50 40 70 34 88 30" {...S(ink, 4.5)} />
      <path d="M34 72 C50 80 70 86 88 90" {...S(ink, 3)} opacity="0.7" />
      <ellipse cx="34" cy="60" rx="5" ry="12" {...S(acc, 3)} />
      <ellipse cx="88" cy="60" rx="9" ry="30" {...S(acc, 3.5)} />
    </>
  ),
  'unit6.arc-length': ({ ink, acc }) => (
    <>
      <path d="M28 80 C44 40 72 36 92 52" {...S(ink, 4.5)} />
      <path d="M36 62 L28 58 M46 48 L40 42 M58 42 L56 34 M72 41 L74 33 M84 46 L90 40" {...S(acc, 3)} />
    </>
  ),
  'unit6.nth-derivative': ({ ink, acc }) => (
    <>
      <path d="M30 88 V74 H46 V60 H62 V46 H78 V32 H90" {...S(ink, 4)} />
      {dot(38, 68, acc, 4)}
      {dot(54, 54, acc, 4)}
      {dot(70, 40, acc, 4)}
      {dot(84, 26, acc, 4)}
    </>
  ),
  'unit6.mean-value-theorem': ({ ink, acc }) => (
    <>
      <path d="M28 80 C40 30 76 30 92 60" {...S(ink, 4.5)} />
      <path d="M28 80 L92 60" {...S(acc, 3)} strokeDasharray="5 4" />
      <path d="M36 50 L84 35" {...S(acc, 3.5)} />
      {dot(28, 80, ink, 4)}
      {dot(92, 60, ink, 4)}
      {dot(58, 43, acc, 4.5)}
    </>
  ),
  'unit6.errors-approximations': ({ ink, acc }) => (
    <>
      <path d="M28 84 Q60 84 92 30" {...S(ink, 4.5)} />
      <path d="M60 70.5 H80 V48" {...S(acc, 3.5)} />
      <path d="M60 70.5 L80 49.5" {...S(ink, 2.5)} strokeDasharray="3 4" />
      {dot(60, 70.5, acc, 4.5)}
    </>
  ),
  'unit6.continuity': ({ ink, acc }) => (
    <>
      <path d="M26 76 C40 76 46 44 60 44 C74 44 80 76 94 76" {...S(ink, 5)} />
      {dot(60, 44, acc, 5.5)}
      <path d="M60 50 V86" {...S(acc, 2.5)} strokeDasharray="3 5" />
    </>
  ),
  'unit6.asymptotes': ({ ink, acc }) => (
    <>
      <path d="M50 26 V94 M26 70 H94" {...S(acc, 2.5)} strokeDasharray="4 4" />
      <path d="M56 28 C57 52 66 64 94 66" {...S(ink, 4.5)} />
      <path d="M26 74 C38 76 44 82 45 94" {...S(ink, 4.5)} />
    </>
  ),
  'unit6.related-rates': ({ ink, acc }) => (
    <>
      <path d="M30 28 V88 H94" {...S(ink, 3.5)} opacity="0.7" />
      <path d="M34 40 L66 86" {...S(ink, 5)} />
      <path d="M40 49 L48 49 M45 58 L53 58 M51 67 L59 67 M57 76 L65 76" {...S(ink, 2.5)} />
      {arrow(70, 80, 88, 80, acc, 3.5, 7)}
      {arrow(40, 30, 40, 44, acc, 3.5, 7)}
    </>
  ),
  'unit6.optimization': ({ ink, acc }) => (
    <>
      <path d="M34 50 L60 38 L90 50 L64 62 Z" fill={acc} opacity="0.85" />
      <path d="M34 50 V76 L64 88 L90 76 V50 M64 62 V88" {...S(ink, 4)} />
      <path d="M34 50 L64 62 L90 50" {...S(ink, 4)} />
    </>
  ),
  'unit6.line-integral': ({ ink, acc }) => (
    <>
      <path d="M28 82 C40 50 60 80 70 50 C76 34 86 32 92 36" {...S(ink, 4.5)} />
      {arrow(36, 44, 46, 38, acc, 3, 6)}
      {arrow(58, 36, 68, 30, acc, 3, 6)}
      {arrow(70, 84, 80, 78, acc, 3, 6)}
      {arrow(46, 82, 56, 76, acc, 3, 6)}
      {dot(28, 82, ink, 4)}
    </>
  ),
  'unit6.surface-integral': ({ ink, acc }) => (
    <>
      <path d="M26 64 C40 52 54 72 70 60 C78 54 86 54 94 58 L86 80 C78 76 70 76 62 82 C48 92 36 74 22 84 Z" fill={ink} opacity="0.3" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      {arrow(42, 84, 42, 38, acc, 3.5, 7)}
      {arrow(60, 82, 60, 34, acc, 3.5, 7)}
      {arrow(78, 78, 78, 36, acc, 3.5, 7)}
    </>
  ),
  'unit6.greens-theorem': ({ ink, acc }) => (
    <>
      <path d="M34 66 C30 44 50 30 68 34 C88 38 94 58 84 74 C74 90 40 88 34 66 Z" fill={ink} opacity="0.3" stroke={ink} strokeWidth="4" />
      <path d="M48 84 L56 87 L50 92" {...S(acc, 4)} />
      <path d="M52 52 A10 10 0 1 1 52 68" {...S(acc, 3)} />
      <path d="M48 64 L52 68 L57 65" {...S(acc, 3)} />
    </>
  ),
  'unit6.stokes-theorem': ({ ink, acc }) => (
    <>
      <path d="M28 74 C28 40 92 40 92 74" fill={ink} opacity="0.3" stroke={ink} strokeWidth="4" />
      <ellipse cx="60" cy="74" rx="32" ry="10" {...S(acc, 4)} />
      <path d="M70 80 L78 83 L72 88" {...S(acc, 3.5)} />
      {arrow(60, 46, 60, 26, ink, 3, 6)}
    </>
  ),
  'unit6.divergence-theorem': ({ ink, acc }) => (
    <>
      <circle cx="60" cy="60" r="18" fill={ink} opacity="0.35" stroke={ink} strokeWidth="4" />
      {arrow(60, 40, 60, 26, acc, 3.5, 6)}
      {arrow(60, 80, 60, 94, acc, 3.5, 6)}
      {arrow(40, 60, 26, 60, acc, 3.5, 6)}
      {arrow(80, 60, 94, 60, acc, 3.5, 6)}
      {arrow(74, 46, 84, 36, acc, 3.5, 6)}
      {arrow(46, 74, 36, 84, acc, 3.5, 6)}
    </>
  ),
  'unit6.centre-of-mass': ({ ink, acc }) => (
    <>
      <path d="M28 40 C50 28 78 34 92 48 C80 58 50 60 28 40 Z" fill={ink} opacity="0.4" stroke={ink} strokeWidth="3.5" />
      {dot(62, 46, acc, 5)}
      <path d="M62 52 V74" {...S(ink, 3)} strokeDasharray="3 4" />
      <path d="M50 88 L62 74 L74 88 Z" fill={acc} />
    </>
  ),
  'unit6.reduction-formula': ({ ink, acc }) => (
    <>
      <path d="M28 32 H46 V50 H62 V66 H78 V82 H92" {...S(ink, 4)} />
      {arrow(40, 40, 54, 56, acc, 3, 6)}
      {arrow(56, 58, 70, 74, acc, 3, 6)}
    </>
  ),
  'unit6.leibniz-integral-rule': ({ ink, acc }) => (
    <>
      <path d="M62 28 C54 26 52 34 52 44 V76 C52 86 50 94 42 92" {...S(ink, 5)} />
      {arrow(68, 72, 88, 52, acc, 4, 8)}
      <path d="M26 60 H40" {...S(acc, 4)} />
    </>
  ),
  'unit6.curvature-calculator': ({ ink, acc }) => (
    <>
      <path d="M26 86 C40 50 52 44 60 44 C68 44 80 50 94 86" {...S(ink, 4.5)} />
      <circle cx="60" cy="62" r="18" {...S(acc, 3.5)} />
      <path d="M60 62 V44" {...S(acc, 2.5)} />
      {dot(60, 62, acc, 3)}
    </>
  ),

  /* ---------- Unit 7: algebra ---------- */
  'unit7.quadratic': ({ ink, acc }) => (
    <>
      {xAxis(acc, 62)}
      <path d="M34 30 Q60 110 86 30" {...S(ink, 5)} />
      {dot(42, 62, acc, 5)}
      {dot(78, 62, acc, 5)}
    </>
  ),
  'unit7.system-of-equations': ({ ink, acc }) => (
    <>
      <path d="M28 82 L92 36" {...S(ink, 4.5)} />
      <path d="M28 40 L92 80" {...S(ink, 4.5)} />
      {dot(60.5, 59, acc, 6)}
    </>
  ),
  'unit7.progressions': ({ ink, acc }) => (
    <>
      {dot(32, 80, ink, 4)}
      {nodes([[48, 80], [48, 70]], ink, 4)}
      {nodes([[64, 80], [64, 70], [64, 60]], ink, 4)}
      {nodes([[80, 80], [80, 70], [80, 60], [80, 50]], ink, 4)}
      <path d="M30 66 L82 36" {...S(acc, 3)} strokeDasharray="4 4" />
    </>
  ),
  'unit7.permutations-combinations': ({ ink, acc }) => (
    <>
      <rect x="28" y="62" width="18" height="18" rx="3" fill={ink} />
      <rect x="51" y="62" width="18" height="18" rx="3" fill={acc} />
      <rect x="74" y="62" width="18" height="18" rx="3" fill={ink} opacity="0.6" />
      <path d="M37 54 C40 36 80 36 83 54" {...S(acc, 3.5)} />
      <path d="M77 50 L83 55 L87 48" {...S(acc, 3.5)} />
    </>
  ),
  'unit7.linear-equation': ({ ink, acc }) => (
    <>
      <path d="M60 32 V84 M44 88 H76" {...S(ink, 4)} />
      <path d="M30 44 H90" {...S(ink, 4)} />
      <path d="M30 44 L22 64 H38 Z M90 44 L82 64 H98 Z" {...S(ink, 3)} />
      <rect x="24" y="52" width="12" height="10" rx="2" fill={acc} />
      <circle cx="90" cy="57" r="5" fill={acc} />
    </>
  ),
  'unit7.factoring': ({ ink, acc }) => (
    <>
      <rect x="30" y="32" width="60" height="56" {...S(ink, 4)} />
      <path d="M66 32 V88 M30 66 H90" {...S(ink, 3)} />
      <rect x="66" y="66" width="24" height="22" fill={acc} />
    </>
  ),
  'unit7.inequalities': ({ ink, acc }) => (
    <>
      <path d="M26 66 H94" {...S(ink, 3.5)} />
      <path d="M38 60 V72 M60 60 V72 M82 60 V72" {...S(ink, 2.5)} />
      <path d="M50 52 H88" {...S(acc, 5)} />
      <path d="M84 46 L92 52 L84 58" {...S(acc, 4)} />
      {ring(50, 52, acc, 5, 3.5)}
    </>
  ),
  'unit7.rational-expressions': ({ ink, acc }) => (
    <>
      <rect x="44" y="30" width="32" height="20" rx="4" fill={acc} />
      <path d="M30 60 H90" {...S(ink, 5)} />
      <rect x="44" y="70" width="32" height="20" rx="4" {...S(ink, 3.5)} />
    </>
  ),
  'unit7.binomial-theorem': ({ ink, acc }) => (
    <>
      {nodes([[60, 32]], acc, 4.5)}
      {nodes([[52, 46], [68, 46]], ink, 4.5)}
      {nodes([[44, 60], [76, 60]], ink, 4.5)}
      {nodes([[60, 60]], acc, 4.5)}
      {nodes([[36, 74], [84, 74]], ink, 4.5)}
      {nodes([[52, 74], [68, 74]], acc, 4.5)}
      {nodes([[28, 88], [44, 88], [60, 88], [76, 88], [92, 88]], ink, 4.5)}
    </>
  ),
  'unit7.complex-numbers': ({ ink, acc }) => (
    <>
      <path d="M26 74 H94 M40 28 V92" {...S(ink, 3)} opacity="0.7" />
      {arrow(40, 74, 80, 38, acc, 4.5, 9)}
      <path d="M80 38 V74" {...S(ink, 2.5)} strokeDasharray="3 4" />
      <path d="M58 74 A18 18 0 0 0 54 62" {...S(ink, 2.5)} />
    </>
  ),
  'unit7.logarithms': ({ ink, acc }) => (
    <>
      <path d="M28 92 L92 28" {...S(ink, 2.5)} strokeDasharray="3 5" opacity="0.7" />
      <path d={plot((x) => 86 - 3 * Math.exp((x - 26) / 14), 26, 70)} {...S(ink, 4.5)} />
      <path d="M34 34 C36 54 48 76 94 80" {...S(acc, 4.5)} />
    </>
  ),
  'unit7.domain-range': ({ ink, acc }) => (
    <>
      <ellipse cx="38" cy="60" rx="12" ry="26" {...S(ink, 3.5)} />
      <ellipse cx="82" cy="60" rx="12" ry="26" {...S(ink, 3.5)} />
      {nodes([[38, 46], [38, 60], [38, 74]], ink, 3.5)}
      {nodes([[82, 52], [82, 68]], acc, 3.5)}
      {arrow(44, 46, 74, 52, acc, 2.5, 6)}
      {arrow(44, 60, 74, 52, acc, 2.5, 6)}
      {arrow(44, 74, 74, 68, acc, 2.5, 6)}
    </>
  ),
  'unit7.set-operations': ({ ink, acc }) => (
    <>
      <path d="M60 41 A20 20 0 0 1 60 79 A20 20 0 0 1 60 41 Z" fill={acc} />
      <circle cx="48" cy="60" r="22" {...S(ink, 4)} />
      <circle cx="72" cy="60" r="22" {...S(ink, 4)} />
    </>
  ),

  /* ---------- Unit 8: matrices ---------- */
  'unit8.determinant': ({ ink, acc }) => (
    <>
      <path d="M34 32 V88 M86 32 V88" {...S(ink, 4.5)} />
      {nodes([[46, 44], [74, 44], [46, 76], [74, 76]], ink, 5)}
      <path d="M50 48 L70 72" {...S(acc, 3.5)} />
      <path d="M70 48 L50 72" {...S(acc, 3.5)} strokeDasharray="4 4" />
    </>
  ),
  'unit8.matrix-inverse': ({ ink, acc }) => (
    <>
      {brackets(ink, 28, 72, 40, 84)}
      {nodes([[40, 52], [60, 52], [40, 72], [60, 72]], ink, 4)}
      <path d="M76 38 H84 M88 32 L92 28 V48" {...S(acc, 4)} />
    </>
  ),
  'unit8.rank': ({ ink, acc }) => (
    <>
      {brackets(ink)}
      {matrixDots(ink, acc, 3, (r, c) => c === r)}
      <path d="M38 48 H52 V64 H72 V80 H82" {...S(acc, 2.5)} />
    </>
  ),
  'unit8.matrix-calculator': ({ ink, acc }) => (
    <>
      {brackets(ink)}
      {matrixDots(ink, acc, 3, (r, c) => r === 1 && c === 1)}
    </>
  ),
  'unit8.consistency': ({ ink, acc }) => (
    <>
      <path d="M28 80 L92 40" {...S(ink, 4)} />
      <path d="M28 44 L92 76" {...S(ink, 4)} />
      <path d="M58 28 L62 92" {...S(ink, 4)} />
      {dot(60, 60.5, acc, 6)}
    </>
  ),
  'unit8.linear-dependence': ({ ink, acc }) => (
    <>
      <path d="M26 92 L94 28" {...S(ink, 2.5)} strokeDasharray="3 5" opacity="0.7" />
      {arrow(34, 84, 54, 65, ink, 4.5, 8)}
      {arrow(34, 84, 84, 37, acc, 3, 8)}
      {dot(34, 84, ink, 4)}
    </>
  ),
  'unit8.eigenvalues': ({ ink, acc }) => (
    <>
      <path d="M30 84 L88 32" stroke={acc} strokeWidth="3" strokeDasharray="4 5" />
      <path d="M36 78 L56 60" {...S(ink, 5)} />
      <path d="M36 78 L80 39" {...S(ink, 3)} opacity="0.55" />
      <path d="M70 40 L82 38 L78 50" {...S(ink, 4)} />
    </>
  ),
  'unit8.cayley-hamilton': ({ ink, acc }) => (
    <>
      {brackets(ink, 28, 70, 40, 80)}
      {nodes([[40, 52], [58, 52], [40, 68], [58, 68]], ink, 4)}
      <path d="M78 76 C94 70 94 50 78 44" {...S(acc, 4)} />
      <path d="M84 40 L78 44 L83 50" {...S(acc, 4)} />
    </>
  ),
  'unit8.vectors': ({ ink, acc }) => (
    <>
      {arrow(30, 84, 52, 50, ink, 4, 8)}
      {arrow(52, 50, 88, 60, ink, 4, 8)}
      {arrow(30, 84, 86, 62, acc, 4.5, 8)}
    </>
  ),
  'unit8.diagonalization': ({ ink, acc }) => (
    <>
      {brackets(ink)}
      <path d="M40 40 L80 80" {...S(acc, 2.5)} opacity="0.6" />
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (r === c
        ? <circle key={`${r}-${c}`} cx={40 + c * 20} cy={40 + r * 20} r="5.5" fill={acc} />
        : <circle key={`${r}-${c}`} cx={40 + c * 20} cy={40 + r * 20} r="2" fill={ink} opacity="0.5" />)))}
    </>
  ),
  'unit8.quadratic-form': ({ ink, acc }) => (
    <>
      <ellipse cx="60" cy="60" rx="32" ry="18" transform="rotate(-30 60 60)" {...S(ink, 4)} />
      <ellipse cx="60" cy="60" rx="16" ry="9" transform="rotate(-30 60 60)" {...S(ink, 3)} opacity="0.7" />
      <path d="M38 73 L82 47 M53 34 L67 86" {...S(acc, 3)} transform="rotate(0 60 60)" />
    </>
  ),
  'unit8.svd-calculator': ({ ink, acc }) => (
    <>
      <circle cx="38" cy="60" r="12" {...S(ink, 3.5)} />
      {arrow(52, 60, 62, 60, acc, 3.5, 6)}
      <ellipse cx="80" cy="60" rx="13" ry="26" transform="rotate(30 80 60)" {...S(ink, 4)} />
      <path d="M67 82 L93 38" {...S(acc, 3)} />
    </>
  ),
  'unit8.linear-transformations': ({ ink, acc }) => (
    <>
      <rect x="26" y="50" width="22" height="22" {...S(ink, 3.5)} />
      {arrow(52, 61, 62, 61, acc, 3.5, 6)}
      <path d="M66 72 L86 72 L96 48 L76 48 Z" fill={acc} opacity="0.85" />
      <path d="M66 72 L86 72 L96 48 L76 48 Z" {...S(ink, 3.5)} />
    </>
  ),

  /* ---------- Unit 9: geometry and trigonometry ---------- */
  'unit9.area-perimeter': ({ ink, acc }) => (
    <>
      <rect x="32" y="38" width="56" height="44" fill={acc} opacity="0.85" />
      <rect x="32" y="38" width="56" height="44" {...S(ink, 4)} strokeDasharray="6 5" />
    </>
  ),
  'unit9.volume-surface-area': ({ ink, acc }) => (
    <>
      <ellipse cx="60" cy="36" rx="24" ry="8" fill={acc} />
      <path d="M36 36 V82 C36 92 84 92 84 82 V36" {...S(ink, 4)} />
      <ellipse cx="60" cy="36" rx="24" ry="8" {...S(ink, 4)} />
    </>
  ),
  'unit9.pythagoras': ({ ink, acc }) => (
    <>
      <path d="M46 70 H70 V52 Z" fill={acc} />
      <path d="M46 70 H70 V94 H46 Z M70 52 H88 V70 H70 Z" {...S(ink, 3)} />
      <path d="M46 70 L70 52 L52 28 L28 46 Z" {...S(ink, 3.5)} />
    </>
  ),
  'unit9.triangle-solver': ({ ink, acc }) => (
    <>
      <polygon points="32,84 88,84 88,36" {...S(ink, 5)} />
      <path d="M80 84 V76 H88" {...S(acc, 3)} />
      <path d="M46 84 A14 14 0 0 0 43 75" {...S(acc, 3)} />
    </>
  ),
  'unit9.unit-circle': ({ ink, acc }) => (
    <>
      <circle cx="40" cy="60" r="16" {...S(ink, 3.5)} />
      <path d="M40 60 L51 49" {...S(acc, 3)} />
      {dot(51, 49, acc, 4)}
      <path d={sine(56, 94, 60, 16, 1)} {...S(ink, 4)} />
      <path d="M51 49 H60" {...S(acc, 2.5)} strokeDasharray="2 3" />
    </>
  ),
  'unit9.coordinate-geometry': ({ ink, acc }) => (
    <>
      <path d="M26 62 H94 M60 28 V92" {...S(ink, 3)} opacity="0.7" />
      <path d="M30 86 L90 34" {...S(acc, 4)} />
      {dot(44, 74, ink, 5)}
      {dot(76, 46, ink, 5)}
    </>
  ),
  'unit9.circles': ({ ink, acc }) => (
    <>
      <path d="M26 80 H94 M34 28 V92" {...S(ink, 3)} opacity="0.7" />
      <circle cx="62" cy="52" r="22" {...S(ink, 4.5)} />
      {dot(62, 52, acc, 4.5)}
      <path d="M62 52 L78 37" {...S(acc, 3.5)} />
    </>
  ),
  'unit9.conics': ({ ink, acc }) => (
    <>
      <path d="M60 26 L32 90 M60 26 L88 90" {...S(ink, 4)} />
      <ellipse cx="60" cy="66" rx="18" ry="6" transform="rotate(-14 60 66)" fill={acc} opacity="0.9" />
      <ellipse cx="60" cy="66" rx="18" ry="6" transform="rotate(-14 60 66)" {...S(ink, 2.5)} />
    </>
  ),
  'unit9.heights-distances': ({ ink, acc }) => (
    <>
      <path d="M26 86 H94" {...S(ink, 3)} opacity="0.7" />
      <rect x="76" y="30" width="12" height="56" fill={ink} />
      <path d="M32 86 L82 30" {...S(acc, 3)} strokeDasharray="4 4" />
      <path d="M48 86 A16 16 0 0 0 43 74" {...S(acc, 3)} />
      {dot(32, 86, acc, 4.5)}
    </>
  ),
  'unit9.trig-identities': ({ ink, acc }) => (
    <>
      <circle cx="50" cy="60" r="22" {...S(ink, 3)} opacity="0.7" />
      <path d="M50 60 L66 45 V60 Z" fill={acc} />
      <path d="M50 60 L66 45 V60 Z" {...S(ink, 3)} />
      <path d="M80 54 H92 M80 64 H92" {...S(ink, 4)} />
    </>
  ),
  'unit9.trig-equations': ({ ink, acc }) => (
    <>
      <path d="M26 48 H94" {...S(acc, 2.5)} strokeDasharray="4 4" />
      <path d={sine(26, 94, 62, 22, 1.5)} {...S(ink, 4.5)} />
      {dot(31.7, 48, acc, 4.5)}
      {dot(48.6, 48, acc, 4.5)}
      {dot(77, 48, acc, 4.5)}
    </>
  ),
  'unit9.inverse-trig': ({ ink, acc }) => (
    <>
      <path d="M30 84 H90" {...S(ink, 3)} opacity="0.7" />
      <path d="M30 84 L80 44" {...S(ink, 4.5)} />
      <path d="M58 84 A28 28 0 0 0 52 66.5" {...S(acc, 4)} />
      <path d="M48 72 L52 66 L58 70" {...S(acc, 3.5)} />
    </>
  ),
  'unit9.geometry-3d': ({ ink, acc }) => (
    <>
      <path d="M48 70 V28 M48 70 H94 M48 70 L28 90" {...S(ink, 3)} opacity="0.75" />
      <path d="M48 70 L76 44" {...S(acc, 3)} strokeDasharray="3 4" />
      {dot(76, 44, acc, 5.5)}
    </>
  ),
  'unit9.polar-coordinates': ({ ink, acc }) => {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = (Math.PI * i) / 120;
      const r = 30 * Math.cos(3 * t);
      pts.push(`${(60 + r * Math.cos(t)).toFixed(1)} ${(60 - r * Math.sin(t)).toFixed(1)}`);
    }
    return (
      <>
        <circle cx="60" cy="60" r="32" {...S(ink, 2)} opacity="0.4" />
        <path d={`M${pts.join(' L')} Z`} fill={acc} opacity="0.85" stroke={ink} strokeWidth="3" />
      </>
    );
  },

  /* ---------- Unit 10: interest and finance ---------- */
  'unit10.percentage': ({ ink, acc }) => (
    <>
      <path d="M30 56 L56 30 H88 V62 L62 88 Z" fill={ink} />
      <circle cx="78" cy="40" r="4" fill={acc} />
      {percent(60, 62, acc, 1.05)}
    </>
  ),
  'unit10.compound-interest': ({ ink, acc }) => (
    <>
      {bars([37, 53, 69, 85], [70, 62, 50, 36], ink, 86, 10)}
      <path d="M30 60 C50 56 66 46 86 28" {...S(acc, 4)} />
    </>
  ),
  'unit10.emi': ({ ink, acc }) => (
    <>
      <rect x="28" y="34" width="64" height="54" rx="6" {...S(ink, 4)} />
      <path d="M28 48 H92 M42 28 V40 M78 28 V40" {...S(ink, 4)} />
      {nodes([[42, 62], [60, 62], [78, 62], [42, 77], [60, 77], [78, 77]], acc, 5)}
    </>
  ),
  'unit10.fd': ({ ink, acc }) => (
    <>
      {coin(50, 64, 22, ink, acc)}
      <rect x="66" y="58" width="24" height="20" rx="3" fill={acc} />
      <path d="M71 58 V52 A7 7 0 0 1 85 52 V58" {...S(acc, 3.5)} />
    </>
  ),
  'unit10.rd': ({ ink, acc }) => (
    <>
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={46} cy={84 - i * 10} rx="16" ry="5" fill={ink} stroke={acc} strokeWidth="2" />)}
      {[0, 1].map((i) => <ellipse key={i} cx={78} cy={84 - i * 10} rx="12" ry="4" fill={ink} opacity="0.6" />)}
      {arrow(78, 30, 78, 56, acc, 3.5, 7)}
    </>
  ),
  'unit10.ppf': ({ ink, acc }) => (
    <>
      <ellipse cx="58" cy="64" rx="28" ry="20" fill={ink} />
      <path d="M36 80 V88 M74 80 V88" {...S(ink, 5)} />
      <circle cx="88" cy="60" r="5" fill={ink} />
      <path d="M50 46 H64" {...S(acc, 4)} />
      <circle cx="68" cy="58" r="2.5" fill={acc} />
      {coin(57, 32, 7, acc, ink)}
    </>
  ),
  'unit10.sip': ({ ink, acc }) => (
    <>
      {bars([32, 44, 56, 68, 80, 92], [80, 76, 70, 62, 52, 40], ink, 86, 7)}
      {nodes([[32, 70], [44, 66], [56, 60], [68, 52], [80, 42], [92, 30]], acc, 3.5)}
    </>
  ),
  'unit10.lumpsum': ({ ink, acc }) => (
    <>
      {coin(46, 66, 20, ink, acc)}
      <path d="M68 76 C78 70 84 56 86 36" {...S(acc, 4)} />
      <path d="M80 40 L86 34 L91 41" {...S(acc, 4)} />
    </>
  ),
  'unit10.tvm': ({ ink, acc }) => (
    <>
      <circle cx="50" cy="56" r="22" {...S(ink, 4)} />
      <path d="M50 42 V56 L60 62" {...S(ink, 4)} />
      {coin(80, 78, 12, acc, ink)}
    </>
  ),
  'unit10.npv-irr': ({ ink, acc }) => (
    <>
      <path d="M26 60 H94" {...S(ink, 3)} />
      {arrow(32, 60, 32, 86, acc, 4, 7)}
      {arrow(50, 60, 50, 42, ink, 4, 7)}
      {arrow(68, 60, 68, 36, ink, 4, 7)}
      {arrow(86, 60, 86, 30, ink, 4, 7)}
    </>
  ),
  'unit10.cagr': ({ ink, acc }) => (
    <>
      {[0, 1, 2].map((i) => <ellipse key={i} cx={60} cy={86 - i * 8} rx="22" ry="5" fill={ink} stroke={acc} strokeWidth="2" />)}
      <path d="M60 68 V40" {...S(acc, 4)} />
      <path d="M60 52 C50 52 44 46 44 36 C54 36 60 42 60 52 Z M60 46 C60 36 66 30 76 30 C76 40 70 46 60 46 Z" fill={acc} />
    </>
  ),
  'unit10.depreciation': ({ ink, acc }) => (
    <>
      {bars([34, 50, 66, 82], [34, 50, 62, 72], ink, 86, 11)}
      <path d="M30 30 C46 44 64 58 88 66" {...S(acc, 3.5)} />
      <path d="M82 60 L89 67 L80 70" {...S(acc, 3.5)} />
    </>
  ),
  'unit10.bill-discounting': ({ ink, acc }) => (
    <>
      <rect x="26" y="40" width="50" height="34" rx="4" fill={ink} />
      <path d="M34 50 H58 M34 60 H50" {...S(acc, 3)} />
      <circle cx="78" cy="72" r="16" fill={acc} />
      <path d="M78 63 V72 L84 76" {...S(ink, 3.5)} />
    </>
  ),

  /* ---------- Unit 11: taxes ---------- */
  'unit11.gst': ({ ink, acc, soft }) => (
    <>
      {receipt(ink, soft)}
      <path d="M48 40 H72 M48 50 H66" {...S(ink, 3)} />
      {percent(60, 70, acc, 0.9)}
    </>
  ),
  'unit11.vat': ({ ink, acc }) => (
    <>
      <circle cx="52" cy="58" r="24" {...S(ink, 4)} />
      <path d="M28 58 H76 M52 34 C42 46 42 70 52 82 M52 34 C62 46 62 70 52 82" {...S(ink, 2.5)} />
      <path d="M70 66 L80 56 H92 V68 L82 78 Z" fill={acc} />
      <circle cx="86" cy="62" r="2" fill={ink} />
    </>
  ),
  'unit11.sales-tax': ({ ink, acc }) => (
    <>
      <path d="M34 46 H86 L82 88 H38 Z" fill={ink} />
      <path d="M46 46 V40 A14 14 0 0 1 74 40 V46" {...S(ink, 4)} />
      {percent(60, 67, acc, 0.9)}
    </>
  ),
  'unit11.canada-sales-tax': ({ ink, acc, soft }) => (
    <>
      {receipt(ink, soft, 30, 70, 28, 88)}
      <path d="M38 40 H62 M38 50 H56" {...S(ink, 3)} />
      <path d="M80 50 L84 60 L92 56 L88 66 L94 70 L84 74 L82 82 L80 82 L78 74 L68 70 L74 66 L70 56 L78 60 Z" fill={acc} />
    </>
  ),
  'unit11.income-tax': ({ ink, acc, soft }) => (
    <>
      {paper(ink, soft)}
      <path d="M46 44 H66 M46 54 H72" {...S(ink, 3)} />
      <path d="M48 72 L56 80 L72 64" {...S(acc, 5)} />
    </>
  ),
  'unit11.capital-gains-india': ({ ink, acc }) => (
    <>
      <path d="M28 84 L44 70 L56 76 L74 50 L90 36" {...S(ink, 4.5)} />
      <path d="M82 34 L91 35 L90 44" {...S(ink, 4)} />
      {coin(40, 42, 11, acc, ink)}
    </>
  ),
  'unit11.hra-exemption': ({ ink, acc }) => (
    <>
      <path d="M28 58 L60 32 L92 58" {...S(ink, 4.5)} />
      <path d="M36 52 V88 H84 V52" fill={ink} opacity="0.35" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      {percent(60, 70, acc, 0.9)}
    </>
  ),
  'unit11.tds': ({ ink, acc }) => (
    <>
      <circle cx="56" cy="62" r="26" fill={ink} />
      <path d="M56 62 L56 36 A26 26 0 0 1 78.5 49 Z" fill={acc} transform="translate(6 -5)" />
      <circle cx="56" cy="62" r="14" {...S(acc, 2.5)} opacity="0.7" />
    </>
  ),
  'unit11.us-income-tax': ({ ink, acc }) => (
    <>
      {bars([34, 50, 66, 82], [72, 60, 46, 32], ink, 86, 13)}
      <path d="M28 72 H40 V60 H56 V46 H72 V32 H90" {...S(acc, 3)} />
    </>
  ),
  'unit11.uk-income-tax': ({ ink, acc }) => (
    <>
      <rect x="28" y="30" width="64" height="16" rx="3" fill={ink} opacity="0.4" />
      <rect x="28" y="52" width="64" height="16" rx="3" fill={ink} opacity="0.7" />
      <rect x="28" y="74" width="64" height="16" rx="3" fill={ink} />
      <path d="M70 26 V94" {...S(acc, 3.5)} />
    </>
  ),
  'unit11.corporate-tax-calculator': ({ ink, acc }) => (
    <>
      <rect x="32" y="34" width="34" height="54" fill={ink} />
      <rect x="66" y="52" width="22" height="36" fill={ink} opacity="0.6" />
      {[44, 56].map((y) => [40, 52].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill={acc} />))}
      {percent(77, 36, acc, 0.7)}
    </>
  ),

  /* ---------- Unit 12: differential equations ---------- */
  'unit12.ode-solver': ({ ink, acc }) => {
    const field = [];
    for (let x = 34; x <= 86; x += 13) {
      for (let y = 34; y <= 86; y += 13) {
        const s = (y - 60) / 40;
        const dx = 4 / Math.sqrt(1 + s * s);
        field.push(`M${(x - dx).toFixed(1)} ${(y + s * dx).toFixed(1)} L${(x + dx).toFixed(1)} ${(y - s * dx).toFixed(1)}`);
      }
    }
    return (
      <>
        <path d={field.join(' ')} {...S(ink, 2.5)} opacity="0.7" />
        <path d={plot((x) => 60 - 18 * Math.exp(-(x - 60) / 30) + 0 * x, 28, 92)} {...S(acc, 4.5)} />
      </>
    );
  },
  'unit12.variable-separable': ({ ink, acc }) => (
    <>
      <path d="M60 28 V92" {...S(acc, 4)} />
      <rect x="32" y="44" width="18" height="18" rx="4" fill={ink} />
      <rect x="36" y="68" width="10" height="10" rx="2" fill={ink} opacity="0.6" />
      <circle cx="80" cy="53" r="9" fill={ink} />
      <circle cx="80" cy="73" r="5" fill={ink} opacity="0.6" />
    </>
  ),
  'unit12.homogeneous-ode': ({ ink, acc }) => (
    <>
      <path d="M30 86 L94 38 M30 86 L84 28 M30 86 L94 62" {...S(ink, 2.5)} opacity="0.6" />
      <path d="M40 30 C50 56 70 64 94 70" {...S(acc, 4)} />
      <path d="M52 30 C58 46 72 52 94 52" {...S(acc, 4)} opacity="0.7" />
      {dot(30, 86, ink, 4)}
    </>
  ),
  'unit12.linear-ode': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d={plot((x) => 82 - 2.2 * Math.exp((x - 30) / 18), 30, 86)} {...S(ink, 4.5)} />
      <path d="M58 40 L72 54 M72 40 L58 54" {...S(acc, 4)} />
    </>
  ),
  'unit12.bernoulli': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d={plot((x) => 86 - 48 / (1 + Math.exp(-(x - 58) / 7)), 30, 94)} {...S(ink, 4.5)} />
      <rect x="72" y="26" width="16" height="16" rx="3" fill={acc} />
    </>
  ),
  'unit12.exact-ode': ({ ink, acc }) => (
    <>
      <path d="M28 40 C44 44 52 60 52 90" {...S(ink, 3.5)} opacity="0.6" />
      <path d="M28 56 C40 58 44 70 44 90" {...S(ink, 3.5)} opacity="0.6" />
      <path d="M28 28 C52 30 64 50 66 90" {...S(ink, 3.5)} />
      <path d="M66 46 L76 56 L92 34" {...S(acc, 5)} />
    </>
  ),
  'unit12.ode-cc': ({ ink, acc }) => (
    <>
      <path d="M32 26 H48 M40 26 V32 L32 36 L48 42 L32 48 L48 54 L40 58 V62" {...S(acc, 3.5)} />
      <rect x="33" y="62" width="14" height="10" rx="2" fill={ink} />
      <path d="M54 70 C60 44 64 44 68 70 S76 86 80 70 S86 62 92 70" {...S(ink, 4)} />
    </>
  ),
  'unit12.variation-of-parameters': ({ ink, acc }) => (
    <>
      <path d={sine(26, 94, 46, 10, 1.5)} {...S(ink, 3.5)} />
      <path d={sine(26, 94, 76, 10, 1.5)} {...S(ink, 3.5)} opacity="0.7" />
      <rect x="50" y="56" width="20" height="8" rx="4" fill={acc} />
      <path d="M30 60 H90" {...S(acc, 2.5)} />
    </>
  ),
  'unit12.cauchy-euler': ({ ink, acc }) => (
    <>
      {axes(ink)}
      <path d="M30 86 L90 40" {...S(ink, 3)} opacity="0.7" />
      <path d={plot((x) => 86 - ((x - 30) ** 2) / 60, 30, 84)} {...S(ink, 4)} />
      <path d={plot((x) => 86 - ((x - 30) ** 3) / 2600, 30, 84)} {...S(acc, 4.5)} />
    </>
  ),
  'unit12.clairaut-equation': ({ ink, acc }) => (
    <>
      <path d="M28 46 L60 86 M40 34 L80 82 M54 30 L94 68 M30 66 L54 92" {...S(ink, 2.5)} opacity="0.65" />
      <path d={plot((x) => 92 - ((x - 26) ** 2) / 70, 26, 90)} {...S(acc, 4.5)} transform="rotate(180 60 60)" />
    </>
  ),
  'unit12.simultaneous-differential-equations': ({ ink, acc }) => (
    <>
      <path d={sine(26, 94, 60, 22, 1.25)} {...S(ink, 4)} />
      <path d={plot((x) => 60 - 22 * Math.cos(((x - 26) / 68) * 2.5 * Math.PI), 26, 94)} {...S(acc, 4)} />
    </>
  ),
  'unit12.ode-applications': ({ ink, acc }) => (
    <>
      <path d="M30 56 H60 V80 C60 88 30 88 30 80 Z" fill={ink} />
      <path d="M60 62 C68 62 68 74 60 74" {...S(ink, 3.5)} />
      <path d="M38 48 C34 42 42 38 38 30 M50 48 C46 42 54 38 50 30" {...S(acc, 3)} />
      <path d={plot((x) => 38 + 50 / (1 + (x - 70) / 4), 70, 94)} {...S(acc, 3.5)} />
    </>
  ),
  'unit12.series-solution-ode': ({ ink, acc }) => (
    <>
      {bars([34, 47, 60, 73, 86], [36, 52, 64, 72, 78], ink, 86, 9)}
      <path d="M30 34 C44 52 60 64 92 78" {...S(acc, 3.5)} />
    </>
  ),
  'unit12.formation-of-pde': ({ ink, acc }) => (
    <>
      <path d="M26 64 C36 46 50 44 60 54 C70 64 84 60 94 44 L94 70 C84 86 70 90 60 80 C50 70 36 72 26 90 Z" fill={ink} opacity="0.35" stroke={ink} strokeWidth="3" />
      {arrow(60, 52, 60, 28, acc, 3.5, 7)}
      {arrow(60, 52, 82, 42, acc, 3.5, 7)}
    </>
  ),
  'unit12.lagrange-linear-pde': ({ ink, acc }) => (
    <>
      <path d="M28 84 C44 70 52 46 60 28 M44 88 C58 72 68 50 78 30 M62 90 C74 76 84 56 94 36" {...S(ink, 3.5)} />
      {arrow(48, 60, 54, 46, acc, 3.5, 7)}
      {arrow(66, 64, 72, 50, acc, 3.5, 7)}
    </>
  ),
  'unit12.charpit-method': ({ ink, acc }) => (
    <>
      <path d="M26 74 L50 58 L94 64 L70 84 Z" {...S(ink, 3)} opacity="0.7" />
      <path d="M26 74 C40 40 70 30 94 64" {...S(ink, 3.5)} />
      <path d="M40 58 C52 46 64 44 78 52" {...S(acc, 4.5)} />
      {dot(78, 52, acc, 4.5)}
    </>
  ),
  'unit12.pde-constant-coefficients': ({ ink, acc }) => (
    <>
      {dot(28, 60, ink, 4.5)}
      {dot(92, 60, ink, 4.5)}
      <path d="M28 60 Q60 22 92 60" {...S(ink, 4)} />
      <path d="M28 60 Q60 98 92 60" {...S(acc, 3)} strokeDasharray="4 4" />
    </>
  ),
  'unit12.separation-of-variables': ({ ink, acc }) => (
    <>
      <rect x="28" y="72" width="64" height="12" rx="3" fill={ink} />
      <path d="M28 66 Q60 22 92 66" {...S(acc, 4)} />
      <path d="M28 66 Q44 44 60 66 Q76 88 92 66" {...S(acc, 2.5)} opacity="0.7" transform="translate(0 -14)" />
    </>
  ),

  /* ---------- Unit 13: transforms ---------- */
  'unit13.laplace': ({ ink, acc }) => (
    <>
      <path d={sine(26, 52, 60, 10, 1)} {...S(ink, 3.5)} />
      <path d="M60 30 C70 44 70 76 60 90 C50 76 50 44 60 30 Z" fill={acc} />
      <path d="M68 60 H92" {...S(ink, 4)} />
      <path d="M86 54 L92 60 L86 66" {...S(ink, 4)} />
    </>
  ),
  'unit13.inverse-laplace': ({ ink, acc }) => (
    <>
      <path d="M68 60 H92" {...S(ink, 3.5)} opacity="0.7" />
      <path d="M60 30 C70 44 70 76 60 90 C50 76 50 44 60 30 Z" fill={acc} />
      <path d={sine(26, 52, 60, 10, 1)} {...S(ink, 3.5)} />
      <path d="M32 74 L26 80 L32 86" {...S(ink, 4)} />
      <path d="M26 80 H52" {...S(ink, 4)} />
    </>
  ),
  'unit13.unit-step': ({ ink, acc }) => (
    <>
      {xAxis(ink, 80)}
      <path d="M26 80 H56 V44 H94" {...S(ink, 5)} />
      {ring(56, 80, acc, 4.5, 3)}
      {dot(56, 44, acc, 5)}
    </>
  ),
  'unit13.laplace-ode': ({ ink, acc }) => (
    <>
      <path d="M28 66 C32 46 36 46 40 66 S48 84 52 66" {...S(ink, 3.5)} />
      <path d="M60 32 C68 44 68 76 60 88 C52 76 52 44 60 32 Z" fill={acc} />
      <path d="M68 60 L76 68 L92 46" {...S(ink, 5)} />
    </>
  ),
  'unit13.dft-fft': ({ ink, acc }) => (
    <>
      <path d="M32 40 L88 80 M32 80 L88 40" {...S(acc, 4)} />
      <path d="M32 40 H88 M32 80 H88" {...S(ink, 3)} opacity="0.7" />
      {nodes([[32, 40], [32, 80], [88, 40], [88, 80]], ink, 5.5)}
    </>
  ),
  'unit13.fourier-transform': ({ ink }) => (
    <>
      <path d="M24 42 C30 24 36 24 42 42 S54 60 60 42 S72 24 78 42 S90 60 96 42" {...S(ink, 4)} />
      <path d="M34 90 V76 M48 90 V68 M62 90 V80 M76 90 V72" {...S(ink, 5)} />
    </>
  ),
  'unit13.z-transform': ({ ink, acc }) => (
    <>
      {xAxis(ink, 82)}
      {stems([32, 46, 60, 74, 88], [42, 54, 64, 70, 74], ink)}
      <path d="M28 40 C46 52 66 66 92 72" {...S(acc, 3)} strokeDasharray="4 4" />
    </>
  ),
  'unit13.inverse-z': ({ ink, acc }) => (
    <>
      {xAxis(ink, 82)}
      {stems([32, 46, 60, 74, 88], [58, 46, 66, 52, 70], ink)}
      <path d="M38 32 L30 38 L38 44 M30 38 H70" {...S(acc, 4)} />
    </>
  ),
  'unit13.difference-equation-z': ({ ink, acc }) => (
    <>
      {xAxis(ink, 84)}
      {stems([32, 46, 60, 74], [72, 62, 50, 38], ink, 84)}
      <path d="M88 84 V28" {...S(acc, 3.5)} strokeDasharray="4 4" />
      <circle cx="88" cy="26" r="5" {...S(acc, 3.5)} />
    </>
  ),
  'unit13.complex-fourier-series': ({ ink, acc }) => (
    <>
      <circle cx="50" cy="62" r="22" {...S(ink, 3.5)} />
      <path d="M50 62 L66 47" {...S(ink, 3.5)} />
      <circle cx="66" cy="47" r="10" {...S(acc, 3)} />
      <path d="M66 47 L74 41" {...S(acc, 3)} />
      {dot(74, 41, acc, 3.5)}
      <path d="M74 41 H94" {...S(acc, 2)} strokeDasharray="2 3" />
    </>
  ),

  /* ---------- Unit 14: complex variables ---------- */
  'unit14.cauchy-riemann': ({ ink, acc }) => (
    <>
      <path d="M28 40 C44 34 76 34 92 40 M28 60 C44 54 76 54 92 60 M28 80 C44 74 76 74 92 80" {...S(ink, 3)} />
      <path d="M40 28 C36 46 36 74 40 92 M60 28 C58 46 58 74 60 92 M80 28 C84 46 84 74 80 92" {...S(acc, 3)} />
    </>
  ),
  'unit14.harmonic-conjugate': ({ ink, acc }) => (
    <>
      <path d="M28 44 C44 52 52 60 52 92 M28 30 C52 40 66 56 68 92" {...S(ink, 3.5)} />
      <path d="M40 28 C46 50 62 66 94 70 M64 28 C66 42 76 52 94 54" {...S(acc, 3.5)} />
    </>
  ),
  'unit14.cauchy-integral': ({ ink, acc }) => (
    <>
      <circle cx="60" cy="60" r="27" {...S(ink, 4)} />
      <path d="M86 52 L88 62 L80 58" {...S(ink, 4)} />
      {dot(56, 62, acc, 6)}
    </>
  ),
  'unit14.laurent-series': ({ ink, acc }) => (
    <>
      <path d="M60 28 A32 32 0 1 1 59.9 28 Z M60 46 A14 14 0 1 0 60.1 46 Z" fill={ink} opacity="0.35" fillRule="evenodd" />
      <circle cx="60" cy="60" r="32" {...S(ink, 3.5)} />
      <circle cx="60" cy="60" r="14" {...S(ink, 3.5)} />
      <path d="M55 55 L65 65 M65 55 L55 65" {...S(acc, 4)} />
    </>
  ),
  'unit14.residues': ({ ink, acc }) => (
    <>
      <circle cx="60" cy="60" r="27" {...S(ink, 4)} />
      <path d="M86 52 L88 62 L80 58" {...S(ink, 4)} />
      <path d="M53 53 L67 67 M67 53 L53 67" {...S(acc, 5)} />
      <path d="M86 86 L94 94 M94 86 L86 94" {...S(acc, 3)} opacity="0.6" />
    </>
  ),
  'unit14.contour-integration': ({ ink, acc }) => (
    <>
      <path d="M26 76 H94" {...S(ink, 4)} />
      <path d="M94 76 A34 34 0 0 0 26 76" {...S(ink, 4)} />
      <path d="M58 70 L66 76 L58 82" {...S(acc, 4)} />
      <path d="M55 44 L65 54 M65 44 L55 54" {...S(acc, 4)} />
    </>
  ),
  'unit14.bilinear': ({ ink, acc }) => (
    <>
      <circle cx="40" cy="60" r="14" {...S(ink, 4)} />
      {arrow(58, 60, 70, 60, acc, 3.5, 6)}
      <path d="M84 30 V90" {...S(ink, 4.5)} />
    </>
  ),

  /* ---------- Unit 15: discrete maths and optimisation ---------- */
  'unit15.truth-table': ({ ink, acc }) => (
    <>
      <path d="M30 44 H40 M30 76 H40 M80 60 H94" {...S(ink, 3.5)} />
      <path d="M40 34 H58 A26 26 0 0 1 58 86 H40 Z" fill={ink} />
      {dot(92, 60, acc, 5)}
    </>
  ),
  'unit15.modular-arithmetic': ({ ink, acc }) => (
    <>
      <circle cx="60" cy="60" r="28" {...S(ink, 4)} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (2 * Math.PI * i) / 7 - Math.PI / 2;
        return <circle key={i} cx={60 + 28 * Math.cos(a)} cy={60 + 28 * Math.sin(a)} r={i === 3 ? 5.5 : 3.5} fill={i === 3 ? acc : ink} />;
      })}
      <path d="M60 60 L72.1 85.2" {...S(acc, 3.5)} />
    </>
  ),
  'unit15.dijkstra': ({ ink, acc }) => {
    const n = [[32, 40], [56, 30], [86, 44], [46, 72], [74, 82]];
    return (
      <>
        {graph(n, [[0, 1], [1, 2], [0, 3], [3, 4], [1, 3], [2, 4]], ink)}
        <path d="M32 40 L56 30 L86 44 L74 82" {...S(acc, 5)} />
        {nodes(n, ink)}
      </>
    );
  },
  'unit15.bfs-dfs': ({ ink, acc }) => {
    const n = [[60, 30], [40, 54], [80, 54], [30, 82], [50, 82], [70, 82], [90, 82]];
    return (
      <>
        {graph(n, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], ink, 3, 0.75)}
        {nodes(n, ink)}
        {nodes([n[0], n[1], n[3]], acc, 5.5)}
      </>
    );
  },
  'unit15.mst': ({ ink, acc }) => {
    const n = [[32, 36], [70, 30], [90, 60], [62, 86], [36, 74], [60, 58]];
    return (
      <>
        {graph(n, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5]], ink, 2.5, 0.45)}
        <path d="M32 36 L60 58 L70 30 M60 58 L90 60 M60 58 L62 86 M60 58 L36 74" {...S(acc, 4.5)} />
        {nodes(n, ink)}
      </>
    );
  },
  'unit15.simplex': ({ ink, acc }) => (
    <>
      <path d="M30 88 V28 M30 88 H94" {...S(ink, 3)} opacity="0.7" />
      <path d="M30 88 V46 L58 36 L84 58 L88 88 Z" fill={ink} opacity="0.35" stroke={ink} strokeWidth="3.5" />
      <path d="M44 28 L94 62" {...S(acc, 3)} strokeDasharray="4 4" />
      {dot(84, 58, acc, 6)}
    </>
  ),
  'unit15.recurrence-relations': ({ ink, acc }) => (
    <>
      {nodes([[32, 80], [50, 70], [66, 54], [82, 34]], ink, 6)}
      {arrow(37, 77, 45, 72, acc, 3, 6)}
      {arrow(55, 66, 62, 59, acc, 3, 6)}
      {arrow(70, 48, 78, 40, acc, 3, 6)}
    </>
  ),
  'unit15.k-map-simplifier': ({ ink, acc }) => (
    <>
      <rect x="30" y="30" width="60" height="60" rx="4" {...S(ink, 3.5)} />
      <path d="M45 30 V90 M60 30 V90 M75 30 V90 M30 45 H90 M30 60 H90 M30 75 H90" {...S(ink, 2)} opacity="0.6" />
      <rect x="47" y="47" width="26" height="26" rx="8" {...S(acc, 4)} />
    </>
  ),
  'unit15.transportation-problem': ({ ink, acc }) => (
    <>
      <rect x="26" y="34" width="16" height="16" rx="2" fill={ink} />
      <rect x="26" y="70" width="16" height="16" rx="2" fill={ink} />
      {nodes([[86, 32], [86, 60], [86, 88]], ink, 6)}
      {arrow(44, 42, 78, 34, acc, 3, 6)}
      {arrow(44, 44, 78, 58, acc, 3, 6)}
      {arrow(44, 78, 78, 62, acc, 3, 6)}
      {arrow(44, 80, 78, 87, acc, 3, 6)}
    </>
  ),
  'unit15.assignment-problem': ({ ink, acc }) => (
    <>
      {nodes([[34, 36], [34, 60], [34, 84]], ink, 6)}
      {nodes([[86, 36], [86, 60], [86, 84]], ink, 6)}
      <path d="M34 36 L86 60 M34 60 L86 84 M34 84 L86 36" {...S(acc, 4)} />
    </>
  ),
  'unit15.kuhn-tucker': ({ ink, acc }) => (
    <>
      <path d="M28 88 L60 30 L92 88 Z" fill={ink} opacity="0.35" stroke={ink} strokeWidth="3.5" />
      <path d="M80 34 A30 30 0 0 0 66 58" {...S(acc, 3)} />
      <path d="M94 42 A30 30 0 0 0 74 70" {...S(acc, 3)} opacity="0.6" />
      {dot(70.5, 49, acc, 5.5)}
    </>
  ),
  'unit6.limit-laws': ({ ink, acc }) => (
    <>{dot(40, 62, ink, 7)}{dot(80, 62, ink, 7)}<path d="M54 62 H66 M60 56 V68" {...S(acc, 4)} /><path d="M32 84 H88" {...S(ink, 3)} opacity="0.7" /></>
  ),
  'unit6.indeterminate-forms': ({ ink, acc }) => (
    <>{ring(60, 43, ink, 9, 4.5)}{ring(60, 79, ink, 9, 4.5)}<path d="M36 61 H84" {...S(acc, 4.5)} /></>
  ),
  'unit6.ivt': ({ ink, acc }) => (
    <><path d="M28 82 C46 82 52 36 92 36" {...S(ink, 5)} /><path d="M26 60 H94" {...S(acc, 2.5)} strokeDasharray="4 4" />{dot(57, 60, acc, 5.5)}</>
  ),
  'unit6.discontinuity-types': ({ ink, acc }) => (
    <><path d="M28 76 L56 62" {...S(ink, 5)} /><path d="M64 38 L92 50" {...S(ink, 5)} />{ring(58, 61, acc, 4.5, 3.5)}{dot(63, 39, acc, 4.5)}</>
  ),
  'unit6.product-rule': ({ ink, acc }) => (
    <><rect x="30" y="50" width="36" height="36" rx="3" fill={ink} opacity="0.35" /><path d="M66 50 H90 V86 H66" {...S(acc, 4)} /><path d="M30 40 H90" {...S(ink, 3)} opacity="0.7" /></>
  ),
  'unit6.quotient-rule': ({ ink, acc }) => (
    <><path d="M34 60 H86" {...S(ink, 5)} />{dot(60, 42, acc, 7)}{dot(60, 80, acc, 7)}</>
  ),
  'unit6.chain-rule': ({ ink, acc }) => (
    <>{ring(46, 60, ink, 16, 5)}{ring(74, 60, acc, 16, 5)}</>
  ),
  'unit6.curve-tracing': ({ ink, acc }) => (
    <><path d="M28 80 C40 80 44 38 60 56 C76 74 80 36 92 36" {...S(ink, 4.5)} />{dot(44, 47, acc, 4.5)}{dot(76, 52, acc, 4.5)}</>
  ),
  'unit6.riemann-sum': ({ ink, acc }) => (
    <><path d="M30 86 H92" {...S(ink, 3)} opacity="0.7" /><path d="M36 86 V68 H48 V86 M48 86 V58 H60 V86 M60 86 V48 H72 V86 M72 86 V40 H84 V86" {...S(acc, 3)} /><path d="M32 72 C48 62 64 50 90 36" {...S(ink, 4)} /></>
  ),
  'unit6.fundamental-theorem': ({ ink, acc }) => (
    <><path d="M34 86 V62 C50 58 64 48 80 42 V86 Z" fill={ink} opacity="0.35" />{arrow(30, 34, 88, 34, acc, 4, 8)}{arrow(88, 48, 30, 48, ink, 3, 7)}</>
  ),
  'unit6.standard-integrals': ({ ink, acc }) => (
    <><path d="M70 32 C60 28 56 38 56 50 V74 C56 86 50 90 42 86" {...S(ink, 5)} />{dot(78, 60, acc, 4.5)}</>
  ),
  'unit6.u-substitution': ({ ink, acc }) => (
    <>{arrow(34, 50, 86, 50, ink, 4.5, 9)}{arrow(86, 72, 34, 72, acc, 4.5, 9)}</>
  ),
  'unit6.integration-by-parts': ({ ink, acc }) => (
    <><rect x="30" y="40" width="42" height="40" rx="3" fill={ink} opacity="0.35" /><path d="M72 40 H90 M72 80 H90 M81 40 V80" {...S(acc, 4)} /></>
  ),
  'unit6.definite-integral-properties': ({ ink, acc }) => (
    <><path d="M60 28 V92" {...S(acc, 2.5)} strokeDasharray="4 4" /><path d="M30 82 C44 82 52 44 60 44 C68 44 76 82 90 82" {...S(ink, 5)} /></>
  ),
};
