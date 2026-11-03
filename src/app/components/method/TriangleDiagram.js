// A triangle drawn to scale from its sides and angles (side a opposite A, and so on), with labels.
// Used by the Pythagoras and Triangle Solver pages.
import { sig } from '@/app/utils/numberFormat';

const W = 260, H = 180, PAD = 34;

export default function TriangleDiagram({ a, b, c, A, B, C, rightAt = null }) {
  if (![a, b, c, A].every((v) => Number.isFinite(v) && v >= 0)) return null;
  // A at the origin, B along the x-axis, C above
  const rad = (A * Math.PI) / 180;
  const raw = { A: [0, 0], B: [c, 0], C: [b * Math.cos(rad), b * Math.sin(rad)] };
  const xs = Object.values(raw).map((p) => p[0]), ys = Object.values(raw).map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), maxY = Math.max(...ys);
  const k = Math.min((W - 2 * PAD) / (maxX - minX || 1), (H - 2 * PAD) / (maxY || 1));
  const offX = (W - (maxX - minX) * k) / 2;
  const P = Object.fromEntries(Object.entries(raw).map(([key, [x, y]]) => [key, [offX + (x - minX) * k, H - PAD + 8 - y * k]]));
  const centre = [(P.A[0] + P.B[0] + P.C[0]) / 3, (P.A[1] + P.B[1] + P.C[1]) / 3];
  // Push a label away from the centre so it sits outside the shape
  const out = (pt, d) => {
    const vx = pt[0] - centre[0], vy = pt[1] - centre[1], len = Math.hypot(vx, vy) || 1;
    return [pt[0] + (vx / len) * d, pt[1] + (vy / len) * d];
  };
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const text = (pt, s, opts = {}) => (
    <text x={pt[0]} y={pt[1]} textAnchor="middle" dominantBaseline="middle" fontSize={opts.size || 13} fontStyle={opts.italic ? 'italic' : 'normal'} fontFamily={opts.italic ? 'serif' : 'ui-monospace, monospace'} fontWeight={opts.bold ? 700 : 400} fill="currentColor" stroke="none">{s}</text>
  );

  // Right-angle mark at the vertex `rightAt`
  let mark = null;
  if (rightAt && P[rightAt]) {
    const [o, n1, n2] = rightAt === 'A' ? [P.A, P.B, P.C] : rightAt === 'B' ? [P.B, P.C, P.A] : [P.C, P.A, P.B];
    const u = (p) => { const dx = p[0] - o[0], dy = p[1] - o[1], l = Math.hypot(dx, dy) || 1; return [(dx / l) * 12, (dy / l) * 12]; };
    const [u1, u2] = [u(n1), u(n2)];
    mark = <polyline points={`${o[0] + u1[0]},${o[1] + u1[1]} ${o[0] + u1[0] + u2[0]},${o[1] + u1[1] + u2[1]} ${o[0] + u2[0]},${o[1] + u2[1]}`} fill="none" strokeWidth="1.5" />;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Triangle with sides a = ${sig(a, 4)}, b = ${sig(b, 4)}, c = ${sig(c, 4)}`} className="w-full max-w-[320px] h-auto text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points={`${P.A.join(',')} ${P.B.join(',')} ${P.C.join(',')}`} fill="rgba(251, 174, 61, 0.22)" />
      {mark}
      {text(out(P.A, 14), 'A', { bold: true })}
      {text(out(P.B, 14), 'B', { bold: true })}
      {text(out(P.C, 14), 'C', { bold: true })}
      {text(out(mid(P.B, P.C), 14), `a = ${sig(a, 4)}`, { size: 11 })}
      {text(out(mid(P.A, P.C), 14), `b = ${sig(b, 4)}`, { size: 11 })}
      {text(out(mid(P.A, P.B), 12), `c = ${sig(c, 4)}`, { size: 11 })}
      {[['A', A], ['B', B], ['C', C]].map(([key, ang]) => Number.isFinite(ang) && (
        <g key={key}>{text([P[key][0] + (centre[0] - P[key][0]) * 0.28, P[key][1] + (centre[1] - P[key][1]) * 0.28], `${sig(ang, 4)}°`, { size: 10 })}</g>
      ))}
    </svg>
  );
}
