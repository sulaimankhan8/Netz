/**
 * The picture inside each of the 50 task medals (NETZ_MEDALS_CATALOG.md section 2): a small drawing of
 * the method itself. Drawn in the hexagon's 120×120 box, inside about x 26–94, y 28–92.
 * `ink` is the main line colour, `acc` the accent, `rim` the frame colour and `soft` a pale line;
 * all come from the medal's group (medals.js).
 */

const S = (ink, w = 4) => ({ stroke: ink, strokeWidth: w, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' });
const axis = (ink, y = 62) => <path d={`M26 ${y} H94`} {...S(ink, 3)} opacity="0.75" />;
const head = (d, c) => <path d={d} {...S(c, 4)} />;

// The difference-table triangle used by the four equal-interval interpolation medals
function tableDots(ink) {
  const cols = [[34, [34, 46, 58, 70, 82]], [48, [40, 52, 64, 76]], [62, [46, 58, 70]], [76, [52, 64]], [90, [58]]];
  return cols.flatMap(([x, ys]) => ys.map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={ink} opacity="0.75" />));
}

function page(ink, extra) {
  return (
    <>
      <path d="M38 28 H72 L84 40 V92 H38 Z" fill="none" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M72 28 V40 H84" {...S(ink, 3)} />
      {extra}
    </>
  );
}

export const TASK_EMBLEMS = {
  /* ---------- Unit 1: roots and systems ---------- */
  'unit1.bisection': ({ ink, acc, rim }) => (
    <>
      <path d="M76 28 V41 M70 36 L76 42 L82 36" {...S(ink, 4)} />
      <rect x="28" y="50" width="64" height="16" rx="8" fill={ink} />
      <path d="M60 50 H36 A8 8 0 0 0 36 66 H60 Z" fill={rim} opacity="0.45" />
      <line x1="60" y1="44" x2="60" y2="72" stroke={rim} strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="82" r="3.5" fill={ink} />
      <circle cx="60" cy="82" r="2.5" fill={acc} />
      <circle cx="88" cy="82" r="3.5" fill={ink} />
    </>
  ),
  'unit1.false-position': ({ ink, acc }) => (
    <>
      {axis(ink)}
      <path d="M30 84 C48 82 66 56 90 32" {...S(ink, 4)} />
      <path d="M34 82 L88 34" {...S(acc, 3)} />
      <circle cx="56" cy="62" r="5" fill={acc} />
    </>
  ),
  'unit1.newton-raphson': ({ ink, acc }) => (
    <>
      {axis(ink, 66)}
      <path d="M28 88 C50 86 70 62 92 30" {...S(ink, 4)} />
      <path d="M90 34 L58 74" {...S(acc, 3.5)} />
      <circle cx="82" cy="44" r="4.5" fill={ink} />
      <circle cx="63" cy="66" r="4.5" fill={acc} />
    </>
  ),
  'unit1.secant': ({ ink, acc }) => (
    <>
      {axis(ink, 64)}
      <path d="M28 88 C48 84 70 58 92 30" {...S(ink, 4)} />
      <path d="M30 84 L92 34" {...S(acc, 3)} />
      <circle cx="42" cy="75" r="4.5" fill={ink} />
      <circle cx="78" cy="46" r="4.5" fill={ink} />
      <circle cx="54" cy="64" r="4" fill={acc} />
    </>
  ),
  'unit1.fixed-point': ({ ink, acc }) => (
    <>
      <path d="M30 88 L90 28" {...S(ink, 3)} opacity="0.8" />
      <path d="M30 72 C46 64 66 56 90 50" {...S(ink, 4)} />
      <path d="M40 88 V67 H51 V62 H56 V60 H58" {...S(acc, 3)} />
      <circle cx="60" cy="58" r="4" fill={acc} />
    </>
  ),
  'unit1.gauss-seidel': ({ ink, acc }) => (
    <>
      {[36, 52, 68].flatMap((y, r) => [32, 48, 64].map((x, c) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" rx="3" fill={r * 3 + c < 4 ? acc : 'none'} stroke={ink} strokeWidth="2.5" />
      )))}
      <path d="M86 84 Q98 60 86 38" {...S(ink, 3.5)} />
      {head('M80 40 L86 36 L90 43', ink)}
    </>
  ),
  'unit1.root-rivals': ({ ink, acc }) => (
    <>
      {axis(ink, 70)}
      <path d="M30 34 L54 62" {...S(ink, 4)} />
      {head('M44 62 L55 63 L54 52', ink)}
      <path d="M90 34 L66 62" {...S(acc, 4)} />
      {head('M76 62 L65 63 L66 52', acc)}
      <circle cx="60" cy="70" r="5" fill={ink} />
    </>
  ),

  /* ---------- Unit 2: interpolation ---------- */
  'unit2.newton-forward': ({ ink, acc }) => (
    <>
      {tableDots(ink)}
      <path d="M32 30 L84 54" {...S(acc, 4)} />
      {head('M74 56 L86 55 L80 45', acc)}
    </>
  ),
  'unit2.newton-backward': ({ ink, acc }) => (
    <>
      {tableDots(ink)}
      <path d="M32 86 L84 62" {...S(acc, 4)} />
      {head('M74 60 L86 61 L80 71', acc)}
    </>
  ),
  'unit2.gauss-forward': ({ ink, acc }) => (
    <>
      {tableDots(ink)}
      <path d="M34 58 L48 64 L62 58 L76 64 L88 58" {...S(acc, 4)} />
      {head('M80 54 L89 58 L82 65', acc)}
    </>
  ),
  'unit2.gauss-backward': ({ ink, acc }) => (
    <>
      {tableDots(ink)}
      <path d="M34 58 L48 52 L62 58 L76 52 L88 58" {...S(acc, 4)} />
      {head('M80 64 L89 58 L82 51', acc)}
    </>
  ),
  'unit2.lagrange': ({ ink, acc }) => (
    <>
      <path d="M26 78 C38 40 54 38 64 58 S84 86 94 40" {...S(ink, 4)} />
      {[[34, 60], [50, 45], [70, 69], [88, 56]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" fill={acc} />)}
    </>
  ),
  'unit2.newton-divided': ({ ink, acc }) => (
    <>
      <path d="M30 36 H90 M30 84 H90 M50 30 V90 M70 30 V90" {...S(ink, 2.5)} opacity="0.55" />
      <path d="M38 60 H82" {...S(acc, 6)} />
      <circle cx="60" cy="46" r="5.5" fill={acc} />
      <circle cx="60" cy="74" r="5.5" fill={acc} />
    </>
  ),
  'unit2.big-table': ({ ink, acc }) => (
    <>
      <path d="M28 84 C40 70 46 40 60 46 S78 78 92 36" {...S(acc, 3.5)} />
      {[[30, 82], [41, 66], [52, 44], [63, 50], [74, 68], [88, 44]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4.5" fill={ink} />)}
    </>
  ),

  /* ---------- Unit 3: integration and differentiation ---------- */
  'unit3.trapezoidal': ({ ink, acc }) => (
    <>
      <path d="M30 86 V66 L45 52 L60 48 L75 54 L90 42 V86 Z" fill={acc} opacity="0.32" />
      <path d="M45 86 V52 M60 86 V48 M75 86 V54" {...S(ink, 2.5)} />
      <path d="M30 86 V66 L45 52 L60 48 L75 54 L90 42 V86" {...S(ink, 4)} />
      <path d="M26 86 H94" {...S(ink, 4)} />
    </>
  ),
  'unit3.simpson-13': ({ ink, acc, rim }) => (
    <>
      <path d="M32 86 L32 64 Q46 32 60 52 Q74 40 88 46 L88 86 Z" fill={acc} opacity="0.3" />
      <path d="M46 86 V46 M74 86 V45" stroke={ink} strokeWidth="2" strokeDasharray="3 3" opacity="0.85" />
      <path d="M32 86 V64 M60 86 V52 M88 86 V46" {...S(ink, 3)} />
      <path d="M32 64 Q46 32 60 52 Q74 40 88 46" {...S(acc, 4.5)} />
      <path d="M26 86 H94" {...S(ink, 4)} />
      {[[32, 64], [46, 45], [60, 52], [74, 44.5], [88, 46]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.5" fill={rim} stroke={ink} strokeWidth="2" />)}
    </>
  ),
  'unit3.simpson-38': ({ ink, acc }) => (
    <>
      <path d="M32 86 V66 C46 30 66 72 88 44 V86 Z" fill={acc} opacity="0.3" />
      <path d="M51 86 V54 M70 86 V58" stroke={ink} strokeWidth="2" strokeDasharray="3 3" />
      <path d="M32 86 V66 M88 86 V44" {...S(ink, 3)} />
      <path d="M32 66 C46 30 66 72 88 44" {...S(acc, 4.5)} />
      <path d="M26 86 H94" {...S(ink, 4)} />
    </>
  ),
  'unit3.boole': ({ ink, acc }) => (
    <>
      <path d="M30 86 V70 Q60 14 90 62 V86 Z" fill={acc} opacity="0.28" />
      <path d="M45 86 V50 M60 86 V43 M75 86 V48" {...S(ink, 2.5)} />
      <path d="M30 70 Q60 14 90 62" {...S(acc, 4)} />
      <path d="M26 86 H94" {...S(ink, 4)} />
      {[[30, 70], [45, 50], [60, 42], [75, 47], [90, 62]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.8" fill={ink} />)}
    </>
  ),
  'unit3.weddle': ({ ink, acc }) => (
    <>
      <path d="M30 86 V60 Q40 44 50 60 T70 60 T90 60 V86 Z" fill={acc} opacity="0.28" />
      <path d="M40 86 V52 M50 86 V60 M60 86 V68 M70 86 V60 M80 86 V52" {...S(ink, 2)} />
      <path d="M30 60 Q40 44 50 60 T70 60 T90 60" {...S(acc, 4)} />
      <path d="M26 86 H94" {...S(ink, 4)} />
    </>
  ),
  'unit3.gauss-quadrature': ({ ink, acc }) => (
    <>
      <path d="M28 76 C44 40 72 40 92 66" {...S(ink, 4)} />
      {[[37, 59], [60, 46], [83, 56]].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="8" {...S(acc, 2.5)} />
          <circle cx={x} cy={y} r="3.5" fill={acc} />
        </g>
      ))}
      <path d="M26 86 H94" {...S(ink, 4)} />
    </>
  ),
  'unit3.differentiation': ({ ink, acc }) => (
    <>
      <path d="M28 84 C46 82 72 60 92 30" {...S(ink, 4)} />
      <path d="M48 76 H76 V52 Z" fill={acc} opacity="0.3" />
      <path d="M48 76 H76 V52" {...S(acc, 3.5)} />
      <path d="M40 84 L88 42" {...S(ink, 2.5)} strokeDasharray="4 4" />
    </>
  ),
  'unit3.rule-trio': ({ ink, acc }) => (
    <>
      <path d="M28 86 V62 L50 46 L72 52 V86 Z" fill={ink} opacity="0.3" />
      <path d="M40 86 V58 Q56 26 72 50 Q84 40 92 46 V86 Z" fill={acc} opacity="0.45" />
      <path d="M52 86 V64 Q62 50 72 64 T92 64 V86 Z" fill={ink} opacity="0.35" />
      <path d="M26 86 H94" {...S(ink, 4)} />
    </>
  ),

  /* ---------- Unit 4: ODEs and matrices ---------- */
  'unit4.euler': ({ ink, acc, soft }) => (
    <>
      <path d="M30 86 C50 82 70 62 90 30" stroke={soft} strokeWidth="2.5" strokeDasharray="4 4" fill="none" opacity="0.7" />
      <path d="M30 86 L45 76 L60 64 L75 50 L90 34" {...S(ink, 4)} />
      {[[30, 86], [45, 76], [60, 64], [75, 50], [90, 34]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.5" fill={acc} />)}
    </>
  ),
  'unit4.modified-euler': ({ ink, acc, soft }) => (
    <>
      <path d="M32 80 L86 36" stroke={soft} strokeWidth="3" strokeDasharray="5 5" fill="none" opacity="0.75" />
      <path d="M32 80 L86 50" {...S(ink, 4.5)} />
      {head('M76 47 L87 50 L80 59', ink)}
      <circle cx="32" cy="80" r="5" fill={acc} />
    </>
  ),
  'unit4.runge-kutta': ({ ink, acc, soft }) => (
    <>
      <path d="M32 82 L60 70 M32 82 L62 62 M32 82 L60 54 M32 82 L56 46" stroke={acc} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      {[[60, 70], [62, 62], [60, 54], [56, 46]].map(([x, y]) => <circle key={y} cx={x} cy={y} r="2.5" fill={acc} />)}
      <path d="M32 82 L83 46" {...S(ink, 5)} />
      {head('M72 45 L84 45 L80 56', ink)}
      <circle cx="32" cy="82" r="5" fill={soft} />
    </>
  ),
  'unit4.taylor': ({ ink, acc, soft }) => (
    <>
      <path d="M26 82 C44 34 76 34 94 82" stroke={soft} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M34 42 H86" {...S(acc, 2.5)} opacity="0.6" />
      <path d="M34 64 Q60 22 86 64" {...S(acc, 3)} opacity="0.8" />
      <path d="M30 74 C46 36 74 36 90 74" {...S(ink, 3.5)} />
    </>
  ),
  'unit4.gauss-elimination': ({ ink, acc }) => (
    <>
      <path d="M32 30 H26 V90 H32 M88 30 H94 V90 H88" {...S(ink, 3.5)} />
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (c >= r
        ? <circle key={`${r}${c}`} cx={40 + c * 20} cy={40 + r * 20} r="5" fill={ink} />
        : <circle key={`${r}${c}`} cx={40 + c * 20} cy={40 + r * 20} r="5" {...S(acc, 2.5)} />)))}
    </>
  ),
  'unit4.gauss-jordan': ({ ink, acc }) => (
    <>
      <path d="M32 30 H26 V90 H32 M88 30 H94 V90 H88" {...S(ink, 3.5)} />
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (r === c
        ? <circle key={`${r}${c}`} cx={40 + c * 20} cy={40 + r * 20} r="7" fill={ink} />
        : <circle key={`${r}${c}`} cx={40 + c * 20} cy={40 + r * 20} r="3" fill={acc} opacity="0.6" />)))}
      <path d="M33 33 L87 87" stroke={ink} strokeWidth="2" opacity="0.4" />
    </>
  ),
  'unit4.jacobi': ({ ink, acc }) => (
    <>
      <path d="M32 40 H28 V80 H32 M50 40 H54 V80 H50 M70 40 H66 V80 H70 M88 40 H92 V80 H88" {...S(ink, 3)} />
      {[[38, 50], [44, 60], [38, 70], [76, 50], [82, 60], [76, 70]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill={ink} />)}
      <path d="M46 34 Q60 22 74 34" {...S(acc, 3.5)} />
      {head('M66 33 L74 35 L72 27', acc)}
      <path d="M74 86 Q60 98 46 86" {...S(acc, 3.5)} />
      {head('M54 87 L46 85 L48 93', acc)}
    </>
  ),
  'unit4.lu': ({ ink, acc }) => (
    <>
      <path d="M30 34 L30 88 L84 88 Z" fill={ink} />
      <path d="M36 32 L90 32 L90 86 Z" fill={acc} />
    </>
  ),

  /* ---------- Unit 5: statistics ---------- */
  'unit5.chi-square': ({ ink, acc }) => (
    <>
      <path d="M72 86 V76 Q82 82 92 85 V86 Z" fill={acc} />
      <path d="M28 86 C32 40 44 34 56 52 S80 82 92 85" {...S(ink, 4)} />
      <path d="M72 86 V70" {...S(acc, 3)} />
      <path d="M26 86 H94" {...S(ink, 3)} />
    </>
  ),
  'unit5.f-test': ({ ink, acc }) => (
    <>
      <path d="M26 84 C44 84 46 50 60 50 S76 84 94 84" {...S(ink, 3.5)} />
      <path d="M44 84 C54 84 54 34 60 34 S66 84 76 84" {...S(acc, 3.5)} />
      <path d="M26 86 H94" {...S(ink, 3)} />
    </>
  ),
  'unit5.t-test': ({ ink, acc }) => (
    <>
      <path d="M26 80 C40 78 48 40 60 40 S80 78 94 80" {...S(ink, 4)} />
      <path d="M74 86 V58" {...S(acc, 4)} />
      <circle cx="74" cy="56" r="4" fill={acc} />
      <path d="M26 86 H94" {...S(ink, 3)} />
    </>
  ),
  'unit5.significance': ({ ink, acc }) => (
    <>
      <path d="M26 86 V80 C30 80 32 78 36 74 V86 Z M94 86 V80 C90 80 88 78 84 74 V86 Z" fill={acc} />
      <path d="M26 82 C40 80 48 44 60 44 S80 80 94 82" {...S(ink, 4)} />
      <path d="M26 86 H94" {...S(ink, 3)} />
      <path d="M74 32 L80 38 L92 26" {...S(acc, 4)} />
    </>
  ),
  'unit5.straight-line': ({ ink, acc }) => (
    <>
      <path d="M28 82 L92 40" {...S(ink, 4.5)} />
      {[[34, 72], [44, 78], [54, 58], [64, 64], [74, 46], [84, 51]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4.5" fill={acc} />)}
    </>
  ),
  'unit5.parabola': ({ ink, acc }) => (
    <>
      <path d="M28 36 Q60 104 92 36" {...S(ink, 4.5)} />
      {[[32, 48], [42, 62], [52, 66], [62, 74], [74, 62], [86, 50]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4.5" fill={acc} />)}
    </>
  ),
  'unit5.least-squares': ({ ink, acc }) => (
    <>
      <path d="M28 80 L92 44" {...S(ink, 4)} />
      {[[38, 64, 74.4], [56, 74, 64.3], [74, 46, 54.1]].map(([x, y, ly]) => {
        const top = Math.min(y, ly);
        const side = Math.abs(ly - y);
        return (
          <g key={x}>
            <rect x={x} y={top} width={side} height={side} fill={acc} opacity="0.35" stroke={acc} strokeWidth="2" />
            <circle cx={x} cy={y} r="4.5" fill={acc} />
          </g>
        );
      })}
    </>
  ),

  /* ---------- Notes ---------- */
  'notes.three-blocks': ({ ink, acc }) => page(ink, <path d="M46 52 H76 M46 64 H76 M46 76 H66" {...S(acc, 5)} />),
  'notes.widget': ({ ink, acc }) => page(ink, (
    <>
      <rect x="44" y="50" width="34" height="32" rx="4" fill={acc} opacity="0.2" />
      <path d="M46 78 C54 76 60 56 76 54" {...S(acc, 3.5)} />
    </>
  )),
  'notes.math': ({ ink, acc }) => page(ink, <path d="M72 50 H48 L60 64 L48 78 H72" {...S(acc, 4.5)} />),
  'notes.quiz-made': ({ ink, acc }) => (
    <>
      <rect x="30" y="30" width="60" height="60" rx="10" {...S(ink, 4)} />
      <path d="M52 46 Q52 38 60 38 Q68 38 68 46 Q68 52 60 55 V60" {...S(acc, 4.5)} />
      <circle cx="60" cy="68" r="3" fill={acc} />
      {[44, 60, 76].map((x) => <circle key={x} cx={x} cy="80" r="3" fill={ink} />)}
    </>
  ),
  'notes.quiz-correct': ({ ink, acc }) => (
    <>
      <rect x="30" y="30" width="60" height="60" rx="10" {...S(ink, 4)} />
      <path d="M44 60 L56 72 L78 46" {...S(acc, 6)} />
    </>
  ),
  'notes.pdf': ({ ink, acc }) => page(ink, (
    <>
      <path d="M61 48 V76" {...S(acc, 4.5)} />
      {head('M50 66 L61 77 L72 66', acc)}
    </>
  )),

  /* ---------- Playground ---------- */
  'playground.ink-math': ({ ink, acc }) => (
    <>
      <path d="M26 74 C30 56 36 84 40 64 C43 50 50 70 52 60" {...S(acc, 4)} />
      <path d="M56 62 H64 M60 58 L64 62 L60 66" {...S(ink, 3)} />
      <path d="M70 52 L84 74 M84 52 L70 74" {...S(ink, 5)} />
      <path d="M87 42 C89 37 96 38 95 43 C94 47 88 50 87 54 H96" {...S(ink, 3)} />
    </>
  ),
  'playground.ink-text': ({ ink, acc }) => (
    <>
      <path d="M26 72 C30 56 36 80 40 64 C43 52 50 70 52 60" {...S(acc, 4)} />
      <path d="M56 62 H64 M60 58 L64 62 L60 66" {...S(ink, 3)} />
      <path d="M68 76 L76 50 L84 76 M71 67 H81" {...S(ink, 4)} />
      <circle cx="91" cy="70" r="5" {...S(ink, 3)} />
      <path d="M96 64 V76" {...S(ink, 3)} />
    </>
  ),
  'playground.eval': ({ ink, acc }) => (
    <>
      <path d="M30 52 C40 46 50 56 62 50 M30 68 C40 62 50 72 62 66" {...S(ink, 5)} />
      <path d="M80 36 L83 48 L94 51 L83 54 L80 66 L77 54 L66 51 L77 48 Z" fill={acc} />
    </>
  ),
  'playground.graph': ({ ink, acc }) => (
    <>
      <rect x="28" y="32" width="64" height="56" rx="8" {...S(ink, 4)} />
      <path d="M34 78 H86 M40 38 V82" {...S(ink, 2)} opacity="0.6" />
      <path d="M40 76 C52 74 58 44 84 42" {...S(acc, 4)} />
    </>
  ),
  'playground.shape': ({ ink, acc }) => (
    <>
      <path d="M44 34 L62 64 H26 Z" fill={ink} />
      <circle cx="76" cy="50" r="14" fill={acc} />
      <rect x="44" y="64" width="26" height="24" rx="4" fill="none" stroke={ink} strokeWidth="4" />
    </>
  ),
  'playground.export': ({ ink, acc }) => page(ink, (
    <>
      <path d="M50 74 L72 52" {...S(acc, 4.5)} />
      {head('M60 52 H72 V64', acc)}
    </>
  )),

  /* ---------- Sharing ---------- */
  'sharing.publish': ({ ink, acc }) => (
    <>
      <circle cx="54" cy="58" r="24" {...S(ink, 3.5)} />
      <path d="M30 58 H78 M54 34 C44 46 44 70 54 82 M54 34 C64 46 64 70 54 82" {...S(ink, 2.5)} />
      <path d="M68 52 H86 L92 58 V90 H68 Z" fill={acc} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M74 66 H86 M74 74 H86 M74 82 H82" {...S(ink, 2.5)} />
    </>
  ),
};
