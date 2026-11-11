// The radix-2 FFT butterfly diagram: one column per stage, a dot per value, and the crossing lines of each
// butterfly with its twiddle factor W_N^k. Values are shown as text beside the first and last columns.
import { InlineMath } from 'react-katex';

/** fft: { N, order, stages: [[tex…]…], butterflies: [[{ top, bottom, k }…]…] } from the dft-fft engine. */
export default function ButterflyDiagram({ fft }) {
  const { N, order, stages, butterflies } = fft;
  const cols = stages.length;
  const rowH = 34, colW = 110, padL = 70, padR = 36, padT = 20;
  const W = padL + (cols - 1) * colW + padR, H = padT * 2 + (N - 1) * rowH;
  const X = (c) => padL + c * colW, Y = (r) => padT + r * rowH;
  return (
    <figure className="space-y-2">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Butterfly diagram of a ${N}-point FFT with ${cols - 1} stages`} className={`${N >= 8 ? 'min-w-[420px]' : ''} w-full max-w-[640px] h-auto text-black dark:text-white`}>
          {butterflies.map((stage, s) => stage.map(({ top, bottom, k }) => (
            <g key={`${s}-${top}`}>
              <line x1={X(s)} y1={Y(top)} x2={X(s + 1)} y2={Y(top)} stroke="#3B6FC2" strokeWidth="1.6" />
              <line x1={X(s)} y1={Y(bottom)} x2={X(s + 1)} y2={Y(bottom)} stroke="#3B6FC2" strokeWidth="1.6" />
              <line x1={X(s)} y1={Y(top)} x2={X(s + 1)} y2={Y(bottom)} stroke="#D9692A" strokeWidth="1.3" />
              <line x1={X(s)} y1={Y(bottom)} x2={X(s + 1)} y2={Y(top)} stroke="#D9692A" strokeWidth="1.3" />
              <text x={X(s) + 6} y={Y(bottom) + 13} fontSize="9" fill="currentColor" fillOpacity="0.7">{`W${k}`}</text>
              <text x={X(s + 1) - 14} y={Y(bottom) - 4} fontSize="9" fill="currentColor" fillOpacity="0.7">−1</text>
            </g>
          )))}
          {stages.map((_, c) => Array.from({ length: N }, (__, r) => <circle key={`${c}-${r}`} cx={X(c)} cy={Y(r)} r="3.5" fill="currentColor" />))}
          {order.map((n, r) => <text key={`in${r}`} x={padL - 10} y={Y(r) + 4} fontSize="11" textAnchor="end" fill="currentColor">{`x${n}`}</text>)}
          {Array.from({ length: N }, (_, r) => <text key={`out${r}`} x={X(cols - 1) + 8} y={Y(r) + 4} fontSize="11" fill="currentColor">{`X${r}`}</text>)}
        </svg>
      </div>
      <figcaption className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[640px]">
        Inputs in bit-reversed order on the left, outputs X₀ … X{N - 1} on the right. In each butterfly the lower input is multiplied by W<sub>N</sub><sup>k</sup> (Wk on the diagram), then added to and subtracted from the upper one (orange lines, −1 for the subtraction).
      </figcaption>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        {stages.at(-1).map((v, k) => <div key={k} className="font-mono"><InlineMath math={`X_{${k}} = ${v}`} /></div>)}
      </div>
    </figure>
  );
}
