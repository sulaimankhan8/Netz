// A graph drawn with its nodes on a circle, edge weights at the midpoints, and the edges of a result (shortest-path
// tree, spanning tree, search tree) highlighted. Used by the Unit 15 graph pages. Works at phone width (SVG scales).

/** graph: { nodes, edges: [{ u, v, w }] }; highlight: [{ u, v }]; directed: arrows on edges; weighted: show weights. */
export default function GraphView({ graph, highlight = [], directed = false, weighted = true, title = 'The graph' }) {
  const { nodes, edges } = graph;
  const W = 340, H = 300, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 34;
  const pos = Object.fromEntries(nodes.map((n, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / nodes.length;
    return [n, { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }];
  }));
  const on = (e) => highlight.some((h) => (h.u === e.u && h.v === e.v) || (!directed && h.u === e.v && h.v === e.u));
  const r = 15;
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${nodes.length} nodes, ${edges.length} edges`} className="w-full max-w-[380px] h-auto rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white">
        <defs>
          <marker id="gv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor" /></marker>
          <marker id="gv-arrow-hi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#D9692A" /></marker>
        </defs>
        {edges.map((e, i) => {
          const a = pos[e.u], b = pos[e.v];
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          const x1 = a.x + (dx / len) * r, y1 = a.y + (dy / len) * r, x2 = b.x - (dx / len) * r, y2 = b.y - (dy / len) * r;
          const hi = on(e);
          const mx = (a.x + b.x) / 2 - (dy / len) * 10, my = (a.y + b.y) / 2 + (dx / len) * 10;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hi ? '#D9692A' : 'currentColor'} strokeOpacity={hi ? 1 : 0.35} strokeWidth={hi ? 3.5 : 1.6} markerEnd={directed ? `url(#${hi ? 'gv-arrow-hi' : 'gv-arrow'})` : undefined} />
              {weighted && <text x={mx} y={my + 4} fontSize="11" fontWeight="700" textAnchor="middle" fill="currentColor" fillOpacity={hi ? 1 : 0.7}>{e.w}</text>}
            </g>
          );
        })}
        {nodes.map((n) => (
          <g key={n}>
            <circle cx={pos[n].x} cy={pos[n].y} r={r} fill="#3B6FC2" stroke="white" strokeWidth="2" />
            <text x={pos[n].x} y={pos[n].y + 4} fontSize="12" fontWeight="800" textAnchor="middle" fill="white">{n}</text>
          </g>
        ))}
      </svg>
      <figcaption className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[380px]">{title}. Orange edges are the result.</figcaption>
    </figure>
  );
}
