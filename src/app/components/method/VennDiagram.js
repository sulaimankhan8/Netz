// A Venn diagram for two or three sets: the elements written in their regions, and (optionally) the
// regions of a set formula shaded. Regions are keyed by membership, e.g. '10' = in A only, '011' = in B and C, not A.

const W = 340, H = 280;
// circle centres and a label spot for every region
const LAYOUT = {
  2: { circles: [[130, 140], [210, 140]], r: 85, spots: { 10: [95, 140], '01': [245, 140], 11: [170, 140], '00': [30, 262] } },
  3: {
    circles: [[135, 115], [205, 115], [170, 175]], r: 75,
    spots: { 100: [100, 95], '010': [240, 95], '001': [170, 225], 110: [170, 82], 101: [128, 165], '011': [212, 165], 111: [170, 135], '000': [30, 262] },
  },
};

/** regions: { key: [elements] }; shade: { key: true }; names: ['A', 'B'(, 'C')]; hasU: draw the universal box label. */
export default function VennDiagram({ regions = {}, shade = null, names = ['A', 'B'], hasU = false, title = 'Venn diagram' }) {
  const L = LAYOUT[names.length] || LAYOUT[2];
  const id = `venn-${names.length}`;
  // a region is the inside of the circles marked 1 and the outside of those marked 0 (masks do the outside)
  const keys = Object.keys(L.spots);
  const text = (list) => { const s = (list || []).join(', '); return s.length > 22 ? `${s.slice(0, 20)}…` : s; };
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="w-full max-w-[380px] h-auto rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white">
        <defs>
          {L.circles.map(([cx, cy], i) => (
            <clipPath key={`c${i}`} id={`${id}-in-${i}`}><circle cx={cx} cy={cy} r={L.r} /></clipPath>
          ))}
          {L.circles.map(([cx, cy], i) => (
            <mask key={`m${i}`} id={`${id}-out-${i}`}><rect width={W} height={H} fill="white" /><circle cx={cx} cy={cy} r={L.r} fill="black" /></mask>
          ))}
        </defs>
        <rect x="4" y="4" width={W - 8} height={H - 8} rx="10" fill="none" stroke="currentColor" strokeOpacity="0.5" />
        {shade && keys.filter((k) => shade[k]).map((k) => {
          // nest one group per circle: clip for "inside", mask for "outside"
          let node = <rect width={W} height={H} fill="#f59e0b" fillOpacity="0.45" />;
          k.split('').forEach((bit, i) => {
            node = bit === '1' ? <g clipPath={`url(#${id}-in-${i})`}>{node}</g> : <g mask={`url(#${id}-out-${i})`}>{node}</g>;
          });
          return <g key={`s${k}`}>{node}</g>;
        })}
        {L.circles.map(([cx, cy], i) => (
          <g key={names[i]}>
            <circle cx={cx} cy={cy} r={L.r} fill="none" stroke="currentColor" strokeWidth="2" />
            <text x={cx + (i === 0 ? -L.r + 6 : i === 1 ? L.r - 18 : -5)} y={i === 2 ? cy + L.r + 16 : cy - L.r + 4} fontSize="15" fontWeight="800" fill="currentColor">{names[i]}</text>
          </g>
        ))}
        {hasU && <text x={W - 26} y={24} fontSize="14" fontWeight="800" fill="currentColor">U</text>}
        {keys.map((k) => (regions[k]?.length ? (
          <text key={k} x={L.spots[k][0]} y={L.spots[k][1]} fontSize="11" textAnchor={k.includes('1') ? 'middle' : 'start'} fill="currentColor" fontFamily="ui-monospace, monospace">{text(regions[k])}</text>
        ) : null))}
      </svg>
      <figcaption className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{title}{shade ? ' (shaded: the answer)' : ''}</figcaption>
    </figure>
  );
}
